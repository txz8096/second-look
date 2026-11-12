// Run with Playwright installed, or SECOND_LOOK_PLAYWRIGHT pointing to its module.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const {chromium} = await import(process.env.SECOND_LOOK_PLAYWRIGHT ? pathToFileURL(path.join(process.env.SECOND_LOOK_PLAYWRIGHT, 'index.mjs')).href : 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'plugins/second-look/skills/second-look/report-template.html'), 'utf8');
const output = process.env.SECOND_LOOK_QA_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'second-look-designs-'));
fs.mkdirSync(output, {recursive:true});
const chrome = process.env.SECOND_LOOK_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const fixture = (name, text) => { const file = path.join(output, name+'.html'); fs.writeFileSync(file,text); return 'file://'+file; };
const main = fixture('sample', source);
(async () => {
 const browser = await chromium.launch({executablePath:chrome, headless:true});
 try {
  for (const width of [1440,390,320]) for (const theme of ['dark','light']) {
   const page = await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'}), errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://**/*',r=>r.abort());
   await page.goto(main+'#part-1');
   await page.evaluate(t=>document.documentElement.dataset.mode=t,theme);
   await page.locator('#f-range').waitFor({state:'visible'});
   assert.equal(await page.locator('#f-reset').isDisabled(),true);
   const initial = await page.locator('#f-sum').innerText();
   const countBounds=await page.locator('#f-sum').boundingBox(),timeBounds=await page.locator('#f-range').boundingBox();
   assert.ok(Math.abs(countBounds.y+countBounds.height/2-timeBounds.y-timeBounds.height/2)<6,'Time/count share a row');
   if(width===1440) for(const id of ['f-source','f-cat','f-reset']){
    const r=await page.locator('#'+id).boundingBox(); assert.ok(Math.abs(r.y+r.height/2-timeBounds.y-timeBounds.height/2)<6,id+' stays on desktop row');
   }
   await page.locator('#f-range').focus(); await page.keyboard.press('Enter');
   await page.locator('#f-range-menu').waitFor({state:'visible'});
   assert.equal(await page.locator('#f-apply').isDisabled(),true);
   const box=await page.locator('#f-range-menu').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width);
   assert.deepEqual(await page.locator('#f-presets button').allTextContents(),['4 weeks','3 months','6 months','12 months']);
   await page.locator('#f-presets button').filter({hasText:'4 weeks'}).click();
   assert.equal(await page.locator('#f-range-value').innerText(),'4 weeks');
   assert.equal(await page.locator('#f-range-menu').isVisible(),false);
   assert.notEqual(await page.locator('#f-sum').innerText(),initial);
   await page.locator('#f-source [data-id="codex"]').click();await page.locator('#f-cat').selectOption('prototyping');
   await page.locator('#f-range').click(); await page.locator('#f-from').fill('2026-10-20'); await page.locator('#f-to').fill('2026-10-19');
   assert.equal(await page.locator('#f-apply').isDisabled(),true);assert.match(await page.locator('#f-date-error').innerText(),/on or before/);
   await page.locator('#f-to').fill('2026-10-20');assert.equal(await page.locator('#f-apply').isDisabled(),false);
   await page.keyboard.press('Escape');assert.equal(await page.locator('#f-range-value').innerText(),'4 weeks');
   assert.equal(await page.locator('#f-range').evaluate(n=>document.activeElement===n),true);
   await page.locator('#f-range').click(); await page.locator('#f-from').fill('2026-10-20'); await page.locator('#f-to').fill('2026-10-26'); assert.equal(await page.locator('#f-apply').isDisabled(),true); await page.keyboard.press('Escape');
   await page.locator('#f-range').click();assert.equal(await page.locator('#f-from').inputValue(),'');
   await page.locator('#f-from').fill('2026-10-19');await page.locator('#f-to').fill('2026-10-19');await page.locator('#f-apply').click();
   assert.match(await page.locator('#f-range-value').innerText(),/Oct 19/);
   assert.equal(await page.locator('#f-cat').inputValue(),'prototyping');
   assert.equal(await page.locator('#f-source [data-id="codex"]').getAttribute('aria-pressed'),'true');
   await page.locator('#f-reset').click();assert.equal(await page.locator('#f-sum').innerText(),initial);
   assert.equal(await page.locator('#f-cat').inputValue(),'all');assert.equal(await page.locator('#f-reset').isDisabled(),true);
   await page.locator('#f-range').click();await page.locator('#f-from').fill('2026-10-20');await page.locator('#f-to').fill('2026-10-21');
   await page.locator('#f-apply').click();
   await page.locator('#trends').screenshot({path:path.join(output,`${width}-${theme}-filters.png`)});
   assert.deepEqual(errors,[]);
   if(width===1440&&theme==='dark'){
    await page.locator('#f-range').click();await page.locator('#f-range-menu').screenshot({path:path.join(output,'time-menu.png')});await page.keyboard.press('Escape');
   }
   await page.close(); console.log(`PASS ${width} ${theme}: responsive filters, presets, drafts, exact dates, selection preservation, reset`);
  }
  // Known daily fixture verifies inclusion boundaries and no leakage from newer weeks.
  const cube=[{week:'2026-10-12',source:'codex',category:'research',sessions:12,prompts:12,briefable:12,briefed:8,
    days:[{date:'2026-10-12',sessions:5,prompts:5,briefable:5,briefed:3},{date:'2026-10-18',sessions:7,prompts:7,briefable:7,briefed:5}]},
    {week:'2026-10-19',source:'codex',category:'research',sessions:100,prompts:100,briefable:100,briefed:100,
    days:[{date:'2026-10-19',sessions:100,prompts:100,briefable:100,briefed:100}]}];
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  const selectRange=async(from,to)=>{await page.locator('#f-range').click();await page.locator('#f-from').fill(from);await page.locator('#f-to').fill(to);await page.locator('#f-apply').click();};
  await page.goto(fixture('daily',source.replace('const CUBE = sampleCube();','const CUBE = '+JSON.stringify(cube)+';'))+'#part-1');
  await selectRange('2026-10-18','2026-10-18');assert.equal(await page.locator('#f-sum').innerText(),'7 sessions');
  assert.match(await page.locator('#cat-table').textContent(),/7/);assert.doesNotMatch(await page.locator('#cat-table').textContent(),/100/);
  await selectRange('2026-10-13','2026-10-17');assert.equal(await page.locator('#f-sum').innerText(),'0 sessions');assert.match(await page.locator('.filter-empty').innerText(),/112 sessions are available/);
  await page.locator('#f-clear').click();assert.equal(await page.locator('#f-sum').innerText(),'112 sessions');
  await selectRange('2025-10-27','2025-10-27');assert.equal(await page.locator('#f-sum').innerText(),'0 sessions');
  await page.goto(fixture('legacy',source.replace('const CUBE = sampleCube();','const CUBE = '+JSON.stringify(cube.map(row=>Object.fromEntries(Object.entries(row).filter(([key])=>key!=='days'))))+';'))+'#part-1');
  await page.locator('#f-range').click();await page.locator('#f-from').fill('2026-10-18');await page.locator('#f-to').fill('2026-10-18');
  assert.equal(await page.locator('#f-apply').isDisabled(),true);assert.match(await page.locator('#f-date-error').innerText(),/weekly totals only/);
  await page.locator('#f-from').fill('2026-10-12');await page.locator('#f-to').fill('2026-10-18');await page.locator('#f-apply').click();assert.equal(await page.locator('#f-sum').innerText(),'12 sessions');
  console.log('PASS daily/legacy: inclusive boundaries, single-day count, empty recovery, oldest range, weekly-only validation');
  await page.goto(fixture('empty-skills',source.replace('data-skills-state="available"','data-skills-state="none"').replace(/<p class="part-meta">Checked Oct 25:[\s\S]*?<\/p>/, '<p class="part-meta">Example data · Saved skill folders checked and readable; no skill files found.</p>'))+'#part-3');
  assert.equal(await page.locator('.skills-empty').isVisible(),true);assert.equal(await page.locator('#fix-first').isVisible(),false);
  assert.deepEqual(await page.locator('.skill-resources a').allTextContents(),['skills.shCommunity directory · Browse skills and installation instructions↗','Anthropic skillsAnthropic · Browse skills for Claude and learn how to install them↗','Skill authoring best practicesClaude Docs · Naming, descriptions, structure and testing↗']);
  assert.equal(await page.locator('.skill-resources .dest').nth(1).evaluate(n=>getComputedStyle(n).borderTopWidth),'1px');
  assert.equal(await page.locator('.skill-resources .dest').nth(1).evaluate(n=>getComputedStyle(n).borderBottomWidth),'0px');
  await page.locator('#part-3').screenshot({path:path.join(output,'empty-skills.png')});
  for (const width of [390,320]) {
   await page.setViewportSize({width,height:1000});
   await page.locator('#part-3').screenshot({path:path.join(output,`empty-skills-${width}.png`)});
   assert.equal(await page.locator('.skills-empty').evaluate(n=>n.scrollWidth<=n.clientWidth),true);
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(fixture('no-findings',source.replace('data-findings-state="available"','data-findings-state="none"'))+'#part-2');
  assert.equal(await page.locator('.briefs-empty').isVisible(),true);assert.equal(await page.locator('#plan').isVisible(),false);
  await page.locator('#part-2').screenshot({path:path.join(output,'no-findings.png')});
  await page.goto(main);assert.equal(await page.locator('#work-mix .work-mix-week').count(),13);
  assert.deepEqual(await page.locator('.explore .dest-t').allTextContents(),['Briefs & setup','Skills','Habits & usage']);
  assert.deepEqual(errors,[]);await page.close();
  console.log('PASS conditional skill discovery, no findings, Overview summary/chart/destinations. Evidence: '+output);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
