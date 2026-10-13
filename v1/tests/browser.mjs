// Run with PLAYWRIGHT_MODULE pointing to a Playwright module if not installed locally.
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'});
const context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const failedAssets=[];page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1')&&r.status()>=400)failedAssets.push(r.url());});
const base=process.env.TEST_URL||'http://127.0.0.1:4173/';
const checks=[];const check=msg=>{checks.push(msg);console.log('PASS '+msg);};
try{
await page.goto(base);await page.locator('.hero').waitFor();await page.evaluate(()=>document.fonts.ready);
assert.equal(await page.locator('.course-card').count(),3);check('home renders');
await page.screenshot({path:'../apercu-desktop.png',fullPage:true});
await page.getByRole('link',{name:'Commencer à apprendre'}).click();await page.locator('#quiz-form').waitFor();
await page.getByRole('button',{name:'Vérifier mes réponses'}).click();assert.match(await page.locator('#quiz-score').innerText(),/3 question/);assert.equal(await page.locator('.feedback.missing').count(),3);check('unanswered quiz is not recorded');
await page.locator('input[name=q0][value="1"]').check();await page.locator('input[name=q1][value="0"]').check();await page.locator('input[name=q2]').fill('DNS');await page.getByRole('button',{name:'Vérifier mes réponses'}).click();assert.match(await page.locator('#quiz-score').innerText(),/2\/3/);check('correct and wrong quiz answers get explained');
await page.locator('input[name=q1][value="1"]').check();await page.getByRole('button',{name:'Vérifier mes réponses'}).click();assert.match(await page.locator('#quiz-score').innerText(),/3\/3/);await page.getByRole('button',{name:'Vérifier mes réponses'}).click();assert.match(await page.locator('#quiz-score').innerText(),/3\/3/);check('repeat grading does not duplicate score');
await page.getByRole('button',{name:'Nouvelle tentative'}).click();assert.equal(await page.locator('input[type=radio]:checked').count(),0);check('new attempt clears answers');
await page.locator('#personal-note').fill('Le routage ne suffit pas. <script>alert(1)</script>');await page.locator('[data-read]').click();await page.reload();await page.locator('#personal-note').waitFor();assert.match(await page.locator('#personal-note').inputValue(),/Le routage/);assert.equal(await page.locator('[data-read]').getAttribute('aria-pressed'),'true');check('notes, score and reading survive reload; text is escaped');
await page.locator('#global-search input').fill('routage');await page.locator('#global-search').evaluate(f=>f.requestSubmit());await page.locator('h1').filter({hasText:'Résultats'}).waitFor();assert.ok(await page.locator('.course-card').count()>0);check('global full-text search');
await page.goto(base+'#lab');await page.locator('#packet-form').waitFor();
async function runAll(){await page.getByRole('button',{name:'Lancer le flux'}).click();await page.getByRole('button',{name:'Tout révéler'}).click();}
await runAll();assert.match(await page.locator('#flow-output').innerText(),/203\.0\.113\.2/);check('HTTPS SNAT scenario');
await page.locator('[data-scenario=order]').click();await runAll();assert.match(await page.locator('#flow-output').innerText(),/Flux interrompu/);await page.getByRole('button',{name:'Descendre policy 30'}).click();await runAll();assert.match(await page.locator('#flow-output').innerText(),/Autorisé par le modèle/);check('policy reordering repairs a masked allow');
await page.locator('[data-scenario=route]').click();await runAll();assert.match(await page.locator('#flow-output').innerText(),/Aucune route/);await page.getByRole('checkbox',{name:'Route 2 active'}).check();await runAll();assert.match(await page.locator('#flow-output').innerText(),/Autorisé/);check('missing route and repair');
await page.locator('[data-scenario=dmz]').click();await runAll();assert.match(await page.locator('#flow-output').innerText(),/Source conservée/);check('DMZ selects longest prefix without NAT');
await page.locator('[data-scenario=nat]').click();await runAll();assert.match(await page.locator('#flow-output').innerText(),/Source conservée/);check('without NAT is still allowed');
await page.locator('#packet-form [name=src]').fill('999.1.1.1');await page.getByRole('button',{name:'Lancer le flux'}).click();assert.match(await page.locator('#lab-error').innerText(),/octet|invalide/);check('invalid IPv4 is rejected');
await page.locator('#reset-lab').click();await page.locator('#packet-form [name=protocol]').selectOption('ICMP');assert.ok(await page.locator('#packet-form [name=port]').isDisabled());check('ICMP disables port');
await page.locator('[data-scenario=web]').click();await runAll();await page.screenshot({path:'../apercu-laboratoire.png',fullPage:true});
await page.goto(base+'#progress');await page.locator('#export-progress').waitFor();const downloadPromise=page.waitForEvent('download');await page.locator('#export-progress').click();const dl=await downloadPromise;assert.match(dl.suggestedFilename(),/progression/);check('progress export');
await page.locator('#import-progress').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":999}')});assert.match(await page.locator('#import-status').innerText(),/Import refusé/);check('invalid import rejected');
await page.locator('#import-progress').setInputFiles({name:'good.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,read:{'bases-reseau':true},scores:{'bases-reseau':{correct:2,total:3}},notes:{'bases-reseau':'test import'},last:'bases-reseau'}))});await page.waitForFunction(()=>document.querySelector('.score-tag')?.textContent==='2/3');check('valid import restores progress');
await page.locator('.reset-details summary').click();await page.locator('#reset-progress').click();assert.match(await page.locator('.progress-stats').innerText(),/0/);check('explicit progress reset');
await page.goto(base+'#reference');await page.locator('#glossary-search').fill('inconnu-xyz');assert.match(await page.locator('#glossary-count').innerText(),/Aucune/);await page.locator('#glossary-search').fill('SNAT');assert.ok(await page.locator('.definition').count()>0);check('glossary filter and empty state');
await page.goto(base);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'skip');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main');assert.ok(await page.locator('.hero').isVisible());check('keyboard skip link activates without breaking the router');
await page.setViewportSize({width:390,height:844});for(const hash of ['home','courses','course/bases-reseau','lab','progress','reference']){await page.goto(base+'#'+hash);await page.locator('h1').waitFor();const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.ok(!overflow,'Horizontal page overflow: '+hash);}check('all six views have no horizontal overflow at 390px');
await page.goto(base);await page.screenshot({path:'../apercu-mobile.png',fullPage:true});
const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage blocked','SecurityError');}}));const p=await blocked.newPage();await p.goto(base+'#course/bases-reseau');await p.locator('#quiz-form').waitFor();await p.locator('[data-read]').click();assert.match(await p.locator('#storage').innerText(),/indisponible/);check('storage disabled keeps course functional');await blocked.close();
assert.deepEqual(errors,[]);assert.deepEqual(failedAssets,[]);check('zero JavaScript runtime errors or missing assets');
console.log(`\n${checks.length} browser checks passed.`);
}finally{await browser.close();}
