const assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright')}catch{playwright=require('C:/Users/JorDanTe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
const {chromium}=playwright;
(async()=>{
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5174');
 await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));await page.waitForTimeout(150);
 await page.mouse.click(930,480);
 await page.waitForTimeout(240);
 const partial=await page.evaluate(()=>window.hotlineGame.scene.getScene('Intro').children.list.filter(x=>x.type==='Text').map(x=>x.text));
 assert.ok(partial.some(t=>t.startsWith('Otro')&&!t.includes('horas extra')),'texto progresivo');
 await page.evaluate(()=>{const manager=window.hotlineGame.sound;window.played=[];const play=manager.play.bind(manager);manager.play=(key,config)=>{window.played.push({key,volume:config?.volume});return play(key,config)}});
 await page.waitForTimeout(250);
 assert.ok(await page.evaluate(()=>window.played.some(p=>p.key==='sfx-voice')),'voz electrónica durante escritura');
 await page.keyboard.press('Enter');await page.waitForTimeout(100);
 assert.ok(await page.evaluate(()=>window.hotlineGame.scene.isActive('Intro')),'Enter completa sin avanzar');
 const voiceCount=await page.evaluate(()=>window.played.filter(p=>p.key==='sfx-voice').length);
 await page.waitForTimeout(220);
 assert.equal(await page.evaluate(()=>window.played.filter(p=>p.key==='sfx-voice').length),voiceCount,'voz se detiene al completar');
 await page.keyboard.press('Enter');await page.waitForTimeout(350);
 assert.ok(await page.evaluate(()=>window.hotlineGame.scene.isActive('Game')));
 assert.ok(await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');return s.foes.every(e=>e.sprite.texture.key.startsWith('maton-'))&&!s.textures.exists('enemy')}),'Matón sustituye Nicolás');
 // Each real player shot selects its own audio and equipped texture without changing weapon data.
 for(let id=0;id<7;id++){
  await page.evaluate(id=>{const s=window.hotlineGame.scene.getScene('Game');s.guns=[{id,ammo:1,reserve:20}];s.active=0;s.nextFire=0;s.reloadAt=0},id);
  await page.mouse.move(600,350);await page.mouse.down();await page.waitForTimeout(65);await page.mouse.up();await page.waitForTimeout(60);
  assert.equal(await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').equipped.texture.key),`weapon-${id}`);
 }
 for(const key of ['pistol','revolver','smg','shotgun','assault','sniper','rpg'])assert.ok(await page.evaluate(key=>window.played.some(p=>p.key===`sfx-${key}`),key),`audio ${key}`);
 await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');s.hurtAt=0;s.damage(1);s.hit(s.foes[0],100000);s.guns=[{id:0,ammo:0,reserve:10}];s.active=0;s.reloadAt=0;s.reloadGun();const d=s.drops[0];d.kind='ammo';d.sprite.setPosition(s.player.x,s.player.y);s.pickup()});
 await page.waitForTimeout(120);
 for(const key of ['hurt','kill','reload','pickup'])assert.ok(await page.evaluate(key=>window.played.some(p=>p.key===`sfx-${key}`),key),`audio ${key}`);
 await page.waitForTimeout(1050);
 await page.screenshot({path:'gameplay-v2.png'});
 for(let cycle=0;cycle<4;cycle++){
  await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');s.player.setPosition(1600,1120);s.guns.push({id:3,ammo:2,reserve:5});s.run.kills=29;s.run.bosses=3;s.run.elapsed=100;s.reloadAt=s.clock+5000;s.shoot(1500,1100,0,5,false,1000);window.previousShots=s.shots.map(p=>p.sprite);window.previousEnemies=s.foes.map(e=>e.sprite)});
  await page.waitForTimeout(600);
  await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');s.hurtAt=0;s.damage(10000)});
  await page.waitForTimeout(80);await page.mouse.click(500,505);await page.waitForTimeout(200);
  const reset=await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');return {health:s.run.health,round:s.run.round,kills:s.run.kills,bosses:s.run.bosses,time:s.run.elapsed,guns:s.guns,position:[s.player.x,s.player.y],ended:s.ended,paused:s.physics.world.isPaused,oldShots:window.previousShots.some(s=>s.active),oldEnemies:window.previousEnemies.some(s=>s.active),reload:s.reloadAt,enabled:s.input.enabled,keys:s.input.keyboard.listenerCount('keydown-ENTER')}});
  assert.equal(reset.health,100);assert.equal(reset.round,1);assert.equal(reset.kills,0);assert.equal(reset.bosses,0);assert.ok(reset.time<1);assert.deepEqual(reset.guns,[{id:0,ammo:10,reserve:80}]);assert.deepEqual(reset.position,[240,320]);assert.equal(reset.ended,false);assert.equal(reset.paused,false);assert.equal(reset.oldShots,false);assert.equal(reset.oldEnemies,false);assert.equal(reset.reload,0);assert.equal(reset.enabled,true);
  await page.keyboard.down('d');await page.waitForTimeout(140);await page.keyboard.up('d');
  assert.ok(await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').player.x>245));
  await page.mouse.move(600,350);await page.mouse.down();await page.waitForTimeout(90);await page.mouse.up();
  assert.ok(await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').guns[0].ammo<10));
 }
 await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');s.hurtAt=0;s.damage(10000)});await page.waitForTimeout(100);await page.mouse.click(500,568);await page.waitForTimeout(200);
 assert.ok(await page.evaluate(()=>window.hotlineGame.scene.isActive('Menu')),'menú después de derrota');
 await page.mouse.click(930,544);await page.waitForTimeout(200);await page.mouse.click(810,300);await page.waitForTimeout(80);
 assert.ok(await page.evaluate(()=>window.hotlineGame.scene.getScene('Controls').scene.isActive()&&window.played.at(-1).volume<.55),'volumen ajustable');
 await page.mouse.click(180,637);await page.waitForTimeout(180);await page.mouse.click(930,480);await page.waitForTimeout(150);
 assert.ok(await page.evaluate(()=>window.hotlineGame.scene.getScene('Intro').input.keyboard.listenerCount('keydown-ENTER')===1),'sin eventos de diálogo duplicados');
 await page.keyboard.press('Enter');await page.waitForTimeout(80);await page.keyboard.press('Enter');await page.waitForTimeout(200);
 assert.ok(await page.evaluate(()=>window.hotlineGame.scene.isActive('Game')));
 assert.deepEqual(errors,[],'consola sin errores');
 console.log('PASS: escritura y voz, siete sonidos de arma y sprites equipados, efectos, cuatro reintentos con cámara desplazada, controles tras reinicio, menú, volumen y eventos sin duplicados.');
 console.log('Errores de JavaScript:',errors);
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

