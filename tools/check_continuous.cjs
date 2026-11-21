const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:5197/hotline-curico/');
  await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
  await page.evaluate(()=>hotlineGame.scene.getScene('Menu').activate('modes'));
  await page.waitForFunction(()=>hotlineGame.scene.isActive('GameModes'));
  await page.evaluate(()=>hotlineGame.scene.getScene('GameModes').chooseMode('continuous'));
  await page.waitForFunction(()=>hotlineGame.scene.isActive('CharacterSelect'));
  await page.evaluate(()=>hotlineGame.scene.getScene('CharacterSelect').choose(0));
  await page.waitForFunction(()=>{window.g=hotlineGame.scene.getScene('Game');return g.continuous&&g.foes.length>=2});
  assert(await page.evaluate(()=>g.run.round===0&&!g.roulette.active&&g.combatHud.round.text.includes('Amenaza')));
  const snapshot=()=>page.evaluate(()=>[g.continuous.elapsed,g.foes.length,g.foes[0].sprite.x]);
  await page.evaluate(()=>g.pause());
  const paused=await snapshot();await page.waitForTimeout(400);assert.deepEqual(await snapshot(),paused);
  await page.evaluate(()=>{g.pause();g.run.pendingLevels=1;g.levelUp.openIfNeeded()});
  const cards=await snapshot();await page.waitForTimeout(400);assert.deepEqual(await snapshot(),cards);
  await page.evaluate(()=>g.levelUp.choose(0));
  await page.waitForFunction(t=>g.continuous.elapsed>t,cards[0]);
  await page.evaluate(()=>{window.oldDirector=g.continuous;g.damage(1e6,true)});
  await page.waitForFunction(()=>g.deathSequence.phase==='screen');
  await page.evaluate(()=>g.deathSequence.navigate(true));
  await page.waitForFunction(()=>g.continuous!==oldDirector&&!g.ended&&g.continuous.elapsed<1500);
  await page.evaluate(()=>{g.finish()});
  await page.waitForFunction(()=>g.deathSequence.phase==='screen');
  await page.evaluate(()=>g.deathSequence.navigate(false));
  await page.waitForFunction(()=>hotlineGame.scene.isActive('Menu'));
  await page.evaluate(()=>{hotlineGame.scene.getScene('Menu').scene.start('Game',{characterId:'nicolas'})});
  await page.waitForFunction(()=>g.roulette.active&&g.run.round===1&&!g.continuous);
  assert.deepEqual(errors,[]);
  console.log('PASS selección, población, HUD, pausa, ventajas, muerte, reinicio, menú y aislamiento de Tradicional');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
