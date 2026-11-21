// Run with the same Playwright and Chrome overrides as report-designs.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const {chromium} = await import(process.env.SECOND_LOOK_PLAYWRIGHT
  ? pathToFileURL(path.join(process.env.SECOND_LOOK_PLAYWRIGHT, 'index.mjs')).href : 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.SECOND_LOOK_QA_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'second-look-fix-cards-'));
fs.mkdirSync(output, {recursive: true});
const fixture = path.join(output, 'report.html');
fs.writeFileSync(fixture, fs.readFileSync(path.join(root, 'plugins/second-look/skills/second-look/report-template.html')));
const url = process.env.SECOND_LOOK_REPORT_URL || pathToFileURL(fixture).href;
const browser = await chromium.launch({
  executablePath: process.env.SECOND_LOOK_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});

try {
  for (const width of [1440, 390, 320]) for (const theme of ['dark', 'light']) {
    const page = await browser.newPage({viewport: {width, height: 1000}, reducedMotion: 'reduce'});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('https://fonts.gstatic.com/**', route => route.abort());
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {value: {
        writeText: async text => { window.copiedFix = text; },
      }});
    });
    await page.goto(url + '#part-2');
    await page.evaluate(mode => { document.documentElement.dataset.mode = mode; }, theme);
    const cards = page.locator('#part-2 > .icard');
    assert.equal(await cards.count(), 6);
    assert.equal(await page.getByText('What happens', {exact: true}).count(), 0);
    for (const card of await cards.all()) {
      const summary = card.locator(':scope > .ic-summary');
      const title = await card.locator('h3').innerText();
      assert.ok((await summary.innerText()).split(/\s+/).length > title.split(/\s+/).length + 10);
      assert.equal(await summary.evaluate(node => getComputedStyle(node).textAlign), 'left');
      const evidence = card.locator('details.ic-evidence');
      const toggle = evidence.locator(':scope > summary');
      assert.equal(await evidence.getAttribute('open'), null);
      assert.equal((await toggle.innerText()).trim(), 'Evidence and why it matters');
      assert.ok((await toggle.boundingBox()).height >= 44);
      assert.equal(await evidence.locator('.ic-grid').isVisible(), false);
      await toggle.focus();
      await page.keyboard.press('Enter');
      assert.equal(await evidence.evaluate(node => node.open), true);
      assert.deepEqual(await evidence.locator('.ic-grid dt').allTextContents(), ['Evidence', 'Why it matters']);
      assert.equal(await evidence.locator('.ic-grid dd').count(), 2);
      assert.match(await evidence.locator('.ic-grid dd').first().innerText(), /last 4 weeks/);
      assert.equal(await card.locator('.try').isVisible(), true);
      assert.equal(await evidence.locator('.ic-grid > div').last().evaluate(node => getComputedStyle(node).borderBottomWidth), '0px');
      assert.equal(await evidence.locator('.ic-grid > div').last().evaluate(node => getComputedStyle(node).borderTopWidth), '1px');
      await page.keyboard.press('Space');
      assert.equal(await evidence.evaluate(node => node.open), false);
      assert.equal(await toggle.evaluate(node => node === document.activeElement), true);
    }
    await page.locator('#part-2').screenshot({path: path.join(output, `${width}-${theme}-collapsed.png`)});
    const rules = page.locator('#p-rules .ic-evidence');
    const comparison = page.locator('#p-rules .ic-evidence + .ic-rule-comparison');
    assert.equal(await page.locator('.ic-rule-comparison').count(), 1);
    const comparisonToggle = comparison.locator(':scope > summary');
    assert.equal(await comparison.getAttribute('open'), null);
    assert.equal(await comparison.locator('table').isVisible(), false);
    assert.ok((await comparisonToggle.boundingBox()).height >= 44);
    assert.equal(await comparison.evaluate(node => getComputedStyle(node).borderBottomWidth), '0px');
    await comparisonToggle.focus();
    await page.keyboard.press('Enter');
    assert.equal(await rules.evaluate(node => node.open), false);
    assert.equal(await comparison.locator('table').isVisible(), true);
    assert.equal(await comparison.locator('tbody tr').count(), 4);
    const prompt = await page.locator('#try-rules pre').textContent();
    for (const app of await comparison.locator('thead th:not(:first-child)').allTextContents()) {
      assert.ok(prompt.includes(app), `Copyable prompt must name ${app}`);
    }
    assert.match(prompt, /where to paste the exact missing text/);
    const viewPrompt = page.locator('#try-rules details.try-prompt');
    assert.equal(await viewPrompt.getAttribute('open'), null);
    await viewPrompt.locator(':scope > summary').click();
    await page.locator('#try-rules button.copy').click();
    assert.equal(await page.evaluate(() => window.copiedFix), prompt);
    await viewPrompt.locator(':scope > summary').click();
    // every fix panel: an app to open, a prompt under the link limit, Approve and Decline
    for (const panel of await page.locator('#part-2 section.try').all()) {
      assert.match(await panel.getAttribute('data-app'), /^(codex|claude-desktop|copy)$/);
      assert.ok((await panel.locator('.try-prompt pre').textContent()).length <= 1800);
      assert.equal(await panel.locator('.fix-approve').isVisible(), true);
      assert.equal(await panel.locator('.fix-decline').isVisible(), true);
    }
    const brief = page.locator('#p-brief > .ic-evidence');
    await brief.locator(':scope > summary').click();
    assert.match(await brief.locator('blockquote').innerText(), /settings screen for streak/);
    assert.match(await brief.locator('blockquote + .def').innerText(), /5–8 messages/);
    assert.equal(await page.locator('#part-2 .ic-summary, #part-2 .ic-evidence summary, #part-2 .ic-rule-comparison summary, #part-2 .ic-evidence dd, #part-2 .try').evaluateAll(nodes => nodes.every(node => {
      const box = node.getBoundingClientRect();
      return !box.width || (box.left >= 0 && box.right <= innerWidth);
    })), true);
    await comparisonToggle.click();
    await rules.locator(':scope > summary').click();
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    assert.equal(await page.locator('.ic-evidence:not([open]), .ic-rule-comparison:not([open])').count(), 0);
    await page.emulateMedia({media: 'print'});
    assert.equal(await comparison.locator('tbody').isVisible(), true);
    await page.emulateMedia({media: 'screen'});
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    assert.equal(await rules.evaluate(node => node.open), true);
    assert.equal(await brief.evaluate(node => node.open), true);
    assert.equal(await comparison.evaluate(node => node.open), false);
    assert.equal(await page.locator('.ic-evidence[open]').count(), 2);
    // Decline is remembered in this browser; Undo clears it
    const briefFix = page.locator('#try-brief');
    await briefFix.locator('.fix-decline').click();
    assert.equal(await briefFix.locator('.fix-status').innerText(), 'You declined this.');
    assert.equal(await briefFix.locator('.fix-approve').isVisible(), false);
    await page.reload();
    assert.equal(await briefFix.locator('.fix-status').innerText(), 'You declined this.');
    await briefFix.locator('.fix-undo').click();
    assert.equal(await briefFix.locator('.fix-approve').isVisible(), true);
    assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('second-look-fix:')).length), 0);
    // Approve on a copy-only panel copies the full prompt and says so
    const model = page.locator('#try-model');
    await model.evaluate(node => { node.dataset.app = 'copy'; });
    await model.locator('.fix-approve').click();
    assert.equal(await page.evaluate(() => window.copiedFix), await model.locator('.try-prompt pre').textContent());
    assert.match(await model.locator('.fix-status').innerText(), /^Prompt copied/);
    await page.locator('#p-rules').screenshot({path: path.join(output, `${width}-${theme}-rules-expanded.png`)});
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`PASS ${width} ${theme}: summaries, keyboard disclosure, supporting evidence, print state, overflow`);
  }
  const page = await browser.newPage({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
  await page.goto(url + '#part-2');
  const toggle = page.locator('#p-rules .ic-evidence > summary');
  await toggle.focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#p-rules .ic-grid').isVisible(), true);
  await page.keyboard.press('Space');
  assert.equal(await page.locator('#p-rules .ic-grid').isVisible(), false);
  await page.close();
  console.log('PASS native evidence disclosure with JavaScript disabled. Evidence: ' + output);
} finally {
  await browser.close();
}
