// Baseline regression fixture: XP choices are tested independently in check-v09.cjs.
const assert=require('node:assert/strict');let pw;try{pw=require('playwright')}catch{pw=require('C:/Users/JorDanTe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
(async()=>{const browser=await pw.chromium.launch({headless:true,channel:'msedge'});try{
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
await page.goto(process.env.GAME_URL||'http://127.0.0.1:5176');await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
await page.waitForFunction(()=>window.hotlineGame.scene.getScene('Menu').backgroundVideo.video.video?.currentTime>.1);
assert.ok(await page.evaluate(()=>{const v=window.hotlineGame.scene.getScene('Menu').backgroundVideo.video.video;return v.muted&&v.volume===0&&v.loop&&!v.paused}));
await page.evaluate(()=>window.hotlineGame.scene.getScene('Menu').scene.start('Game'));
await page.waitForFunction(()=>window.hotlineGame.scene.isActive('Game'));await page.evaluate(()=>{window.s=window.hotlineGame.scene.getScene('Game');s.progression.defeated=()=>0});
assert.ok(await page.evaluate(()=>s.roulette.active&&s.guns.length===0&&s.foes.length===0&&s.clock===0&&s.run.round===1&&s.physics.world.isPaused));
await page.keyboard.down('d');await page.mouse.move(800,500);await page.mouse.down();await page.waitForTimeout(400);
assert.ok(await page.evaluate(()=>s.clock===0&&s.run.elapsed===0&&s.player.x===240&&s.run.health===100&&s.shots.length===0));
await page.keyboard.up('d');await page.mouse.up();await page.screenshot({path:'roulette-v07.png'});
await page.waitForFunction(()=>s.roulette.revealed);assert.ok(await page.evaluate(()=>s.roulette.title.text==='¡ARMA OBTENIDA!'&&Math.abs(s.roulette.strip.x+24*146-640)<.001));
await page.screenshot({path:'roulette-result-v07.png'});
await page.waitForFunction(()=>!s.roulette.active);assert.ok(await page.evaluate(()=>{const d=s.drops[0];return d.kind==='gun'&&d.id===s.roulette.winner&&Math.hypot(d.sprite.x-s.player.x,d.sprite.y-s.player.y)<85&&s.navigation.canReach(s.player.body.center,{x:d.sprite.x,y:d.sprite.y})&&s.guns.length===0&&s.foes.length===15}));
const tap=async(key)=>{await page.keyboard.down(key);await page.waitForTimeout(50);await page.keyboard.up(key);await page.waitForTimeout(35)};
await tap('e');assert.ok(await page.evaluate(()=>s.guns.length===1&&s.guns[0].id===s.roulette.winner));
console.log('PASS first roulette: unarmed, frozen, centered preselected winner, accessible E pickup');
// Survival round preserves inventory and all simulation clocks while roulette animates.
await page.evaluate(()=>{s.rounds.stop();s.retireEnemies();s.guns.push({id:0,ammo:5,reserve:60});s.active=0;s.run.health=50;s.run.armor=25;s.ultimate.charge=40;s.ultimate.activate(s.clock,s.guns);s.run.round=1;window.inventory=s.guns.map(g=>({...g}));s.startWave();window.frozenEnemy=s.spawn(0,-1);frozenEnemy.sprite.body.reset(s.player.x+35,s.player.y);frozenEnemy.sprite.setVelocity(200,0);frozenEnemy.next=0;window.frozenEnemyX=frozenEnemy.sprite.x;window.timerFired=false;s.time.delayedCall(50,()=>window.timerFired=true);s.damage(10000,true);window.frozen={clock:s.clock,until:s.ultimate.until,hp:s.run.health,end:s.rounds.state.endsAt,elapsed:s.run.elapsed};});
await page.waitForTimeout(850);assert.ok(await page.evaluate(()=>s.roulette.active&&s.clock===frozen.clock&&s.run.health===frozen.hp&&s.ultimate.until===frozen.until&&s.rounds.state.endsAt===frozen.end&&s.run.elapsed===frozen.elapsed&&s.foes.length===1&&frozenEnemy.sprite.x===frozenEnemyX&&!timerFired&&s.run.armor===25));
await tap('Escape');assert.ok(await page.evaluate(()=>s.paused&&s.roulette.active));const elapsed=await page.evaluate(()=>s.roulette.elapsed);await page.waitForTimeout(180);assert.equal(await page.evaluate(()=>s.roulette.elapsed),elapsed);await tap('Escape');assert.ok(await page.evaluate(()=>!s.paused&&s.physics.world.isPaused&&s.time.paused));
await page.evaluate(()=>s.roulette.update(4000));assert.ok(await page.evaluate(()=>s.guns.every((g,i)=>g.id===inventory[i].id&&g.ammo===inventory[i].ammo&&g.reserve===inventory[i].reserve)&&s.foes.length>0&&s.rounds.state.endsAt-s.clock>89000));
await tap('e');assert.ok(await page.evaluate(()=>s.guns.length===2&&s.guns[0].id===s.roulette.winner&&s.guns[1].ammo===5&&s.guns[1].reserve===60));
console.log('PASS survival roulette: clocks/ulti/armor/inventory frozen; pause resumes safe overlay');
// Boss intro starts only after roulette, and later cycles keep working.
await page.evaluate(()=>{s.run.round=4;s.startWave()});assert.ok(await page.evaluate(()=>s.roulette.active&&s.foes.length===0&&!s.bossDialogue.active));await page.evaluate(()=>s.roulette.update(4000));assert.ok(await page.evaluate(()=>s.bossDialogue.active&&s.foes.length===1));
for(let i=0;i<6;i++)await tap('Enter');assert.ok(await page.evaluate(()=>!s.bossDialogue.active&&s.foes[0].hp===450));
await page.evaluate(()=>{s.hit(s.foes[0],100000);s.rounds.update();s.clock=s.rounds.state.restUntil;s.rounds.update()});assert.ok(await page.evaluate(()=>s.run.round===6&&s.roulette.active));await page.evaluate(()=>s.roulette.update(4000));assert.ok(await page.evaluate(()=>s.rounds.state.plan.type==='EXTERMINIO'&&s.foes.length===24&&s.rounds.state.pending===1));
console.log('PASS boss and subsequent round roulette');
// Deterministic scene stepping verifies actual Game firing path, reload and penetration.
await page.evaluate(()=>{window.hotlineGame.loop.sleep();s.rounds.stop();s.retireEnemies();s.survival.stop();s.ultimate.stop();s.presentation.cancel();s.guns=[{id:7,ammo:200,reserve:400},{id:0,ammo:10,reserve:80}];s.active=0;s.reloadAt=0;s.nextFire=0;s.stopMinigun();s.player.body.reset(300,650);s.cameras.main.stopFollow().setScroll(0,0);s.run.health=100;s.run.armor=0;s.hurtAt=0;s.dash.until=0;s.dash.readyAt=0;s.blockPointerUntilRelease=false;const p=s.input.activePointer;p.isDown=true;p.buttons=1;window.fireLog=[];const original=s.shoot.bind(s);s.shoot=(...args)=>{fireLog.push({at:s.clock,id:args[9]});return original(...args)};s.keys.D.isDown=true;s.update(0,1);window.spinStart=s.clock});
assert.ok(await page.evaluate(()=>s.input.activePointer.leftButtonDown()&&s.guns[0].ammo===200&&s.motor?.isPlaying));
await page.evaluate(()=>s.update(0,599));assert.equal(await page.evaluate(()=>fireLog.length),0);
await page.evaluate(()=>s.update(0,1));assert.ok(await page.evaluate(()=>fireLog.length===1&&fireLog[0].at-spinStart===600&&s.guns[0].ammo===199&&Math.abs(s.player.body.velocity.x-253*.8)<.001));
await page.evaluate(()=>{for(let i=0;i<19;i++)s.update(0,50)});assert.equal(await page.evaluate(()=>fireLog.length),20);
assert.ok(await page.evaluate(()=>{const p=s.input.activePointer;p.isDown=false;p.buttons=0;s.update(0,1);return !s.motor&&s.minigun.progress(s.guns[0],s.clock)===0&&Math.abs(s.player.body.velocity.x-253)<.001}));
await page.evaluate(()=>{const p=s.input.activePointer;p.isDown=true;p.buttons=1;s.update(0,1);s.update(0,599)});assert.equal(await page.evaluate(()=>fireLog.length),20);await page.evaluate(()=>s.update(0,1));assert.equal(await page.evaluate(()=>fireLog.length),21);
// Reload is exactly four seconds and does not fire a free round on completion.
assert.ok(await page.evaluate(()=>{const p=s.input.activePointer;p.isDown=false;p.buttons=0;s.guns[0].ammo=0;s.guns[0].reserve=250;s.reloadGun();const start=s.clock;s.update(0,3999);const before=s.guns[0].ammo;s.update(0,1);return before===0&&s.guns[0].ammo===200&&s.guns[0].reserve===50&&Math.abs(s.clock-start-4000)<1e-6}));
// One bullet hits target A once, passes to B at 50% damage, never to C.
assert.ok(await page.evaluate(()=>{for(const shot of s.shots){shot.collider?.destroy();shot.sprite.destroy()}s.shots=[];const enemies=[s.spawn(0,-1),s.spawn(0,-1),s.spawn(0,-1)];for(let i=0;i<3;i++){enemies[i].hp=100;enemies[i].sprite.body.reset(450+i*60,650)}s.shoot(300,650,0,12,false,850,0,1,false,7);const shot=s.shots[0];shot.sprite.body.reset(450,650);s.update(0,0);const first=enemies[0].hp===88&&shot.sprite.active; s.update(0,0);const once=enemies[0].hp===88;shot.sprite.body.reset(510,650);s.update(0,0);return first&&once&&enemies[1].hp===94&&enemies[2].hp===100&&!shot.sprite.active}));
// Real Arcade wall collision destroys the minigun bullet before it can cross.
await page.evaluate(()=>{s.retireEnemies();s.player.body.reset(300,650);s.shoot(110,180,Math.PI,12,false,850,0,1,false,7);window.wallShot=s.shots[s.shots.length-1];window.hotlineGame.loop.wake()});await page.waitForTimeout(200);assert.ok(await page.evaluate(()=>!wallShot.sprite.active));
// Infinite dual fire retains each weapon's cadence and finite ammo state.
await page.evaluate(()=>{window.hotlineGame.loop.sleep();s.retireEnemies();s.stopMinigun();s.nextFire=0;s.reloadAt=0;s.guns=[{id:7,ammo:3,reserve:12},{id:6,ammo:1,reserve:0}];s.ultimate.charge=40;s.ultimate.activate(s.clock,s.guns);fireLog.length=0;const p=s.input.activePointer;p.isDown=true;p.buttons=1;s.blockPointerUntilRelease=false;s.update(0,1);s.update(0,600);for(let i=0;i<20;i++)s.update(0,50)});
assert.ok(await page.evaluate(()=>fireLog.filter(f=>f.id===7).length===21&&fireLog.filter(f=>f.id===6).length===2&&s.guns[0].ammo===3&&s.guns[1].ammo===1));
await page.evaluate(()=>{const p=s.input.activePointer;p.isDown=false;p.buttons=0;s.update(0,0);s.combatHud.update();window.hotlineGame.loop.wake()});await page.screenshot({path:'minigun-v07.png'});
console.log('PASS minigun: spinup/release, 20 Hz, 4s reload, -20% movement, two-target penetration, walls, dual infinite RPG');
// Death cancels an active roulette without granting its prize, retry starts a fresh unarmed roll.
for(let n=0;n<3;n++){
await page.evaluate(()=>{s.run.round=1;s.startWave();s.run.health=0;s.finish()});assert.ok(await page.evaluate(()=>s.ended&&!s.roulette.active&&!s.motor));
await page.waitForFunction(()=>s.deathSequence.phase==='screen');await page.mouse.click(977,510);await page.waitForTimeout(140);assert.ok(await page.evaluate(()=>s.roulette.active&&s.roulette.elapsed<1000&&s.guns.length===0&&s.run.health===100&&s.run.armor===0&&s.ultimate.charge===0&&s.run.round===1));
}
await tap('Escape');await page.mouse.click(520,435);await page.waitForTimeout(80);await page.mouse.click(520,415);await page.waitForFunction(()=>window.hotlineGame.scene.isActive('Menu'));assert.ok(await page.evaluate(()=>!s.roulette.active&&!s.motor));await page.waitForFunction(()=>window.hotlineGame.scene.getScene('Menu').backgroundVideo.video.video?.currentTime>.1);
assert.ok(await page.evaluate(()=>{const v=window.hotlineGame.scene.getScene('Menu').backgroundVideo.video.video;return v.muted&&v.loop&&v.volume===0}));assert.deepEqual(errors,[]);
console.log('PASS cleanup: 3 death/retry rolls, menu exit during roulette, animated muted menu preserved, no JS errors');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});



