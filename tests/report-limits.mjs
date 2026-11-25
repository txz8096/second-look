// The 5-hour limits section. Run with the same Playwright and Chrome overrides as report-designs.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const {chromium} = await import(process.env.SECOND_LOOK_PLAYWRIGHT
  ? pathToFileURL(path.join(process.env.SECOND_LOOK_PLAYWRIGHT, 'index.mjs')).href : 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'plugins/second-look/skills/second-look/report-template.html'), 'utf8');
const output = process.env.SECOND_LOOK_QA_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'second-look-limits-'));
fs.mkdirSync(output, {recursive: true});
const SLOT = 'const LIMITS = sampleLimits();';
assert.ok(source.includes(SLOT));
const fixture = (name, limits) => {
  const file = path.join(output, name + '.html');
  fs.writeFileSync(file, limits === undefined ? source : source.replace(SLOT, () => `const LIMITS = ${JSON.stringify(limits)};`));
  return pathToFileURL(file).href;
};
const none = () => Array.from({length: 7}, () => Array(6).fill(0));
const blank = () => Array.from({length: 7}, () => Array(6).fill(null));
const week = apps => ({from: '2026-10-26', to: '2026-11-01', review_from: '2026-10-20', apps});
const claude = (hits, more = {}) => ({id: 'claude_code', hits, since_review: hits.length, split: hits.length ? {work: 70, reread: 30, redo: 0} : null, cells: none(), ...more});
const codex = (hits, more = {}) => ({id: 'codex', hits, since_review: hits.length, split: hits.length ? {work: 100, reread: 0, redo: 0} : null, cells: blank(), peak: null, next: null, ...more});
const at = (day, slot, long = false, model = null) => ({day, slot, long, model});

const browser = await chromium.launch({
  executablePath: process.env.SECOND_LOOK_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true});
const open = async (url, options = {}) => {
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce', ...options});
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  await page.route('https://**/*', r => r.abort());
  await page.goto(url + '#part-1');
  return page;
};
const question = (page, id) => page.evaluate(g => document.querySelector(`#habit-questions [data-g="${g}"]`).click(), id);
const text = async page => (await page.locator('#limits-body').innerText()).replace(/\s+/g, ' ');

try {
  const sample = fixture('sample');
  for (const width of [1440, 900, 390, 320]) for (const theme of ['dark', 'light']) {
    const page = await open(sample, {viewport: {width, height: 1000}});
    await page.evaluate(t => { document.documentElement.dataset.mode = t; }, theme);
    for (const id of ['clear', 'check', 'delegate', 'automate']) {
      await question(page, id);
      assert.equal(await page.locator('#limits').isVisible(), false, `${id} hides the limits`);
      assert.equal(await page.getByText('Activity since your last review').isVisible(), true);
    }
    await question(page, 'usage');
    assert.equal(await page.locator('#limits').isVisible(), true);
    assert.equal(await page.locator('table.heat').count(), 2);
    assert.equal(await page.locator('table.heat[data-app="claude_code"] .limit-tag').count(), 4);
    assert.equal(await page.locator('table.heat[data-app="codex"] .limit-tag').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `no sideways page scroll at ${width}`);
    // the labels stay readable on every shade
    const contrast = await page.evaluate(() => {
      const ctx = document.createElement('canvas').getContext('2d', {willReadFrequently: true});
      const lum = color => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((t, v, i) => t + v * [.2126, .7152, .0722][i], 0); };
      return Math.min(...[...document.querySelectorAll('.heat-cell, #limits .limit-tag')].map(el => { const s = getComputedStyle(el), a = lum(s.color), b = lum(s.backgroundColor); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); }));
    });
    assert.ok(contrast >= 4.5, `cell contrast ${contrast} in ${theme}`);
    assert.deepEqual(page.errors, []);
    await page.addStyleTag({content: '.appbar{position:static!important}'}); await page.locator('#limits').screenshot({path: path.join(output, `sample-${width}-${theme}.png`)});
    await page.close();
  }

  let page = await open(sample);
  await question(page, 'usage');
  let read = await text(page);
  for (const line of ['5-hour limits in the last week Oct 19–25',
    'You hit the Claude Code 5-hour limit 4 times, all on weekday afternoons. Codex reached 100% of its 5-hour limit once.',
    'Tuesday to Thursday, 12–6pm took 43% of your Claude Code usage, and all 4 limits hit then. Each came in a very long Opus session.',
    'Codex reached 100% once, on Wednesday between 3 and 6pm. Your next fullest 5-hour window reached 63%, on Thursday evening.',
    'Recommendation 4 covers long sessions', 'Recommendation 5 covers model choice']) assert.ok(read.includes(line), line + ' / ' + read);
  assert.equal(await page.locator('#limits-body .def').count(), 0, 'no gray definition lines');
  // a recommendation link opens its card
  await page.getByRole('link', {name: 'Recommendation 5 covers model choice'}).click();
  assert.equal(await page.locator('#p-model').isVisible(), true);
  // the filters above don't hide or change it
  await question(page, 'usage');
  await page.locator('#f-range').click();
  await page.locator('#f-presets button').filter({hasText: '4 weeks'}).click();
  assert.equal(await text(page), read);
  // no filter hides it: every app, kind of work and project, and custom dates down to one day
  await page.locator('#f-reset').click();
  const choose = (id, value) => page.evaluate(([i, v]) => { const el = document.getElementById(i); el.value = v; el.dispatchEvent(new Event('change', {bubbles: true})); }, [id, value]);
  const values = id => page.locator(`#${id} option`).evaluateAll(list => list.map(o => o.value));
  const apps = await values('f-source'), kinds = await values('f-cat'), projects = await values('f-project');
  for (const range of ['4 weeks', '12 months', ['2026-10-19', '2026-10-25'], ['2026-10-21', '2026-10-21'], ['2025-11-03', '2025-11-03']]) {
    await page.locator('#f-range').click();
    if (typeof range === 'string') await page.locator('#f-presets button').filter({hasText: range}).click();
    else { await page.locator('#f-from').fill(range[0]); await page.locator('#f-to').fill(range[1]); await page.locator('#f-apply').click(); }
    for (const a of apps) for (const k of kinds) for (const p of projects) {
      await choose('f-source', a); await choose('f-cat', k); await choose('f-project', p);
      assert.equal(await page.locator('#limits').isVisible(), true, `limits hidden by ${[range, a, k, p]}`);
    }
    await page.locator('#f-reset').click();
  }
  await page.close();

  const cases = [
    ['claude-only', week([claude([at(3, 1, true, 'Opus')], {since_review: 5, cells: none().map((l, d) => d === 3 ? [0, .12, 0, 0, 0, .003] : l)}), codex([], {peak: 63, cells: blank().map((l, d) => d === 4 ? [null, null, null, null, 63, null] : l)})]), 1,
      ['Oct 26 – Nov 1', 'You hit the Claude Code 5-hour limit once, on Thursday morning. Codex peaked at 63% of its 5-hour limit.', 'Your busiest time was Thursday, 9am–12pm, with 12% of your Claude Code usage. The limit came in a very long Opus session.', '<1%']],
    ['spread-out', week([claude([at(0, 0), at(6, 5, true, 'Opus')])]), 1, ['You hit the Claude Code 5-hour limit twice.']],
    ['two-evenings', week([claude([at(5, 4, true, 'Opus'), at(6, 5, true, 'Sonnet')], {cells: none().map((l, d) => d > 4 ? [0, 0, 0, 0, .2, .3] : l)})]), 1,
      ['twice, both on weekend evenings.', 'Saturday to Sunday, 6pm–12am took 100% of your Claude Code usage, and both limits hit then. Each came in a very long session.']],
    ['codex-only', week([claude([]), codex([at(2, 3)], {peak: 100, since_review: 1})]), 1,
      ['You didn’t hit the Claude Code 5-hour limit. Codex reached 100% of its 5-hour limit once.', 'Codex reached 100% once, on Wednesday between 3 and 6pm.', 'No Codex reading']],
    ['quiet', week([claude([], {since_review: 5}), codex([], {since_review: 1, peak: 40})]), 0,
      ['No 5-hour limits last week. Since your last review, you hit the Claude Code limit 5 times and Codex reached 100% of its limit once.']],
    ['quiet-first-review', {...week([claude([], {since_review: 2})]), review_from: null}, 0, ['No 5-hour limits last week. In the last 2 weeks, you hit the Claude Code limit twice.']],
    ['logs-gone', week([claude([at(2, 3)], {cells: null, split: null}), codex([at(2, 3)], {cells: null, split: null})]), 0,
      ['You hit the Claude Code 5-hour limit once, on Wednesday afternoon. Codex reached 100% of its 5-hour limit once.',
       'Some Claude Code and Codex logs from that week are gone, so their heat maps aren’t shown.']],
    ['claude-logs-gone', week([claude([at(2, 3)], {cells: null, split: null}), codex([at(2, 3)])]), 1,
      ['Some Claude Code logs from that week are gone, so its heat map isn’t shown.']],
    ['quiet-all', week([claude([])]), 0, ['No 5-hour limits last week.']],
  ];
  for (const [name, limits, maps, lines] of cases) {
    page = await open(fixture(name, limits));
    await question(page, 'usage');
    read = await text(page);
    assert.equal(await page.locator('table.heat').count(), maps, name);
    for (const line of lines) assert.ok(read.includes(line), `${name}: ${line} / ${read}`);
    assert.deepEqual(page.errors, [], name);
    await page.locator('#limits').screenshot({path: path.join(output, name + '.png')});
    await page.close();
  }
  for (const limits of [null, week([])]) {
    page = await open(fixture('none', limits));
    await question(page, 'usage');
    assert.equal(await page.locator('#limits').isVisible(), false);
    assert.equal(await page.getByText('Activity since your last review').isVisible(), true);
    assert.deepEqual(page.errors, []);
    await page.close();
  }
  console.log('Limits checks passed. Screenshots: ' + output);
} finally {
  await browser.close();
}
