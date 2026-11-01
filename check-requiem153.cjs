const assert=require('node:assert/strict');
const pw=require('C:/Users/JorDanTe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,`${actual} != ${expected}`);
(async()=>{const browser=await pw.chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5180/');await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
 await page.evaluate(async()=>{window.A=await import('/src/weapons/arsenal.ts');window.RD=await import('/src/systems/RoundDirector.ts');window.RUN=await import('/src/systems/run.ts');window.D=window.hotlineGame.registry.get('developerSession');window.ac=window.hotlineGame.registry.get('achievements');D.active=false;D.immortal=false;window.hotlineGame.scene.getScene('Menu').scene.start('Game',{characterId:'cervela'})});
 await page.waitForFunction(()=>window.hotlineGame.scene.isActive('Game'));
 await page.evaluate(()=>{
  window.s=window.hotlineGame.scene.getScene('Game');s.roulette.update(4000);window.hotlineGame.loop.sleep();
  window.reset=()=>{s.rounds.stop();s.retireEnemies();s.survival.stop();s.burning.stop();s.ultimate.stop();s.levelUp.close(false);for(const d of [...s.drops])s.removeDrop(d);s.run.pendingLevels=0;s.run.upgrades={};s.run.stats.criticalChance=0;s.run.stats.damage=1;s.run.stats.closeDamage=0;s.run.health=100;s.run.armor=0;s.hurtAt=0;s.clock+=2000;s.guns=[];s.active=0;s.reloadAt=0;s.nextFire=0;s.player.body.reset(300,650);s.cameras.main.stopFollow().setScroll(0,0);s.walls.clear(true,true);s.grid=Array.from({length:40},()=>Array(60).fill(0));s.progression.defeated=()=>0;s.progression.impact=()=>0;s.perception.update=()=>undefined;s.input.activePointer.isDown=false;s.input.activePointer.buttons=0;s.blockPointerUntilRelease=false;D.active=false;D.immortal=false};
  window.foes=(count,tier=0,boss=-1)=>Array.from({length:count},(_,i)=>{const e=s.spawn(tier,boss);e.hp=e.max=1000;e.next=Infinity;e.sprite.body.reset(400+i*80,650);return e});
  window.fire=(id=9,y=650)=>{s.shoot(300,y,0,A.WEAPONS[id].damage,false,A.WEAPONS[id].range,0,1,false,id);return s.shots.at(-1)};
  window.move=(shot,x=900,y=650)=>{shot.sprite.body.reset(x,y);s.advanceRequiem(shot)};
  reset();
 });
 for(const count of [1,4,5]){const result=await page.evaluate(count=>{reset();const targets=foes(count),shot=fire();move(shot);return {damage:targets.map(e=>1000-e.hp),active:shot.sprite.active,hits:shot.requiem.hits}},count);for(let i=0;i<count;i++)near(result.damage[i],i<4?90*[1,.85,.7,.55][i]:0);assert.equal(result.active,count<4);assert.equal(result.hits,Math.min(count,4))}
 const wall=await page.evaluate(()=>{reset();const targets=foes(3),shot=fire();s.grid[13][12]=1;targets[2].sprite.body.reset(660,650);move(shot);return {damage:targets.map(e=>1000-e.hp),active:shot.sprite.active,x:shot.sprite.x}});
 near(wall.damage[0],90);near(wall.damage[1],76.5);near(wall.damage[2],0);assert.equal(wall.active,false);assert.ok(wall.x<576);
 const physicalWall=await page.evaluate(()=>{reset();const targets=foes(2);targets[1].sprite.body.reset(660,650);s.grid[13][12]=1;const block=s.add.rectangle(600,648,48,48);s.physics.add.existing(block,true);s.walls.add(block);const shot=fire();s.physics.world.resume();for(let i=0;i<90&&shot.sprite.active;i++){s.physics.world.step(1/60);s.physics.world.postUpdate();if(shot.sprite.active)s.advanceRequiem(shot)}return {damage:targets.map(e=>1000-e.hp),active:shot.sprite.active}});
 near(physicalWall.damage[0],90);near(physicalWall.damage[1],0);assert.equal(physicalWall.active,false);
 const range=await page.evaluate(()=>{reset();const shot=fire();move(shot,1200);return {active:shot.sprite.active,left:shot.left}});assert.equal(range.active,false);near(range.left,0);
 const boss=await page.evaluate(()=>{reset();const e=foes(1,4,0)[0],shot=fire();move(shot,400);move(shot,405);move(shot,410);return {damage:1000-e.hp,hits:shot.requiem.hits}});near(boss.damage,90);assert.equal(boss.hits,1);
 const shield=await page.evaluate(()=>{reset();const e=foes(1,3,-1)[0],shot=fire();move(shot);return 1000-e.hp});near(shield,54);
 const special=await page.evaluate(()=>{reset();const e=foes(1,12,-1)[0],shot=fire();move(shot);return 1000-e.hp});near(special,90);
 const dual=await page.evaluate(()=>{reset();const targets=foes(5),a=fire(9,642),b=fire(9,658);move(a,900,642);move(b,900,658);return {damage:targets.map(e=>1000-e.hp),hits:[a.requiem.hits,b.requiem.hits],different:a.requiem!==b.requiem}});
 assert.ok(dual.different);assert.deepEqual(dual.hits,[4,4]);dual.damage.forEach((n,i)=>near(n,i<4?180*[1,.85,.7,.55][i]:0));
 assert.ok(await page.evaluate(()=>{reset();return [0,1,2,3,4,5,6,7,8,10,11,12].every(id=>!fire(id).requiem)}));
 const calada=await page.evaluate(()=>{reset();foes(5);s.guns=[A.gun(9),A.gun(9)];s.ultimate.charge=40;s.ultimate.activate(s.clock,s.guns);const pointer=s.input.activePointer;pointer.x=900;pointer.y=650;pointer.isDown=true;pointer.buttons=1;s.update(0,16);pointer.isDown=false;pointer.buttons=0;const shots=s.shots.filter(p=>!p.enemy);for(const shot of shots)move(shot,900,shot.sprite.y);return {count:shots.length,hits:shots.map(p=>p.requiem.hits),ammo:s.guns.map(g=>g.ammo)}});
 assert.equal(calada.count,2);assert.deepEqual(calada.hits,[4,4]);assert.deepEqual(calada.ammo,[6,6]);
 console.log('PASS Phaser penetration: 1/4/5 targets, progressive damage, wall/range stop, boss deduplication, armor/special targets, independent dual shots, actual Calada, other weapons unchanged');

 // End-to-end round tracking uses actual director spawns, attacks, HP deaths and completion.
 // Positions/clock steps are controlled; this is an automated scenario, not a human playthrough.
 const scenarios=['clean','miss-other','mixed-calada','dual-calada','calada-only','heal-dash-reload','punch','melee-miss','execute','throw','explosion','developer','developer-damage','wrong-start','artificial','skipped'];
 for(const mode of scenarios){
  const result=await page.evaluate(mode=>{window.exercise=mode=>{
   reset();delete ac.data.unlocked['requiem-round'];ac.data.progress['requiem-round']=0;ac.notifications.length=0;
   s.run.round=0;s.rounds=new RD.RoundDirector(s);const gun=A.gun(mode==='wrong-start'?0:9);s.guns=[gun];s.weaponInstances.register(gun,'player');
   if(mode==='developer'||mode==='developer-damage'){D.active=true;D.immortal=mode==='developer'}
   if(mode==='skipped')s.run.round=2;
   s.rounds.startNext();s.roulette.update(4000);s.blockPointerUntilRelease=false;
   for(const d of [...s.drops])s.removeDrop(d);
   for(const e of s.foes){e.sprite.body.reset(400+(s.foes.indexOf(e)%4)*80,650);e.next=Infinity}
   const original=[...s.foes];const before=!!ac.data.unlocked['requiem-round'];
   if(mode==='wrong-start'){s.guns=[A.gun(9)];s.weaponInstances.register(s.guns[0],'player')}
   if(mode==='miss-other'){const shot=fire(0,300);s.impact(shot)}
   if(mode==='mixed-calada'||mode==='dual-calada'||mode==='calada-only'){
    if(mode!=='calada-only'){const second=A.gun(mode==='mixed-calada'?3:9);s.guns.push(second);s.weaponInstances.register(second,'player')}
    s.ultimate.charge=40;s.ultimate.activate(s.clock,s.guns);
   }
   if(mode==='punch'){original[0].sprite.body.reset(320,650);s.survival.punch(0)}
   if(mode==='melee-miss')s.weaponCombat.use(A.gun(13),300,650,Math.PI);
   if(mode==='execute'){const e=original[0];e.sprite.body.reset(320,650);s.survival.stun(e);s.survival.tryExecute();s.clock+=600;s.survival.update(600)}
   if(mode==='throw'){s.survival.throwWeapon(Math.PI);const replacement=A.gun(9);s.guns=[replacement];s.weaponInstances.register(replacement,'player')}
   if(mode==='heal-dash-reload'){s.run.health=50;s.run.medkits=3;s.run.armor=10;RUN.heal(s.run);ac.event({type:"heal",method:"medkit"});s.dash.start(s.clock,0,1);s.clock+=200;s.guns[0].ammo=5;s.reloadGun();s.clock=s.reloadAt+1;s.update(0,16);s.keys.F.isDown=false}
   if(mode==='artificial'){s.retireEnemies();s.rounds.state.kills=15;s.rounds.state.pending=0;s.rounds.update();return {before,unlocked:!!ac.data.unlocked['requiem-round'],phase:s.rounds.state.phase,notifications:0}}
   const pointer=s.input.activePointer;pointer.x=900;pointer.y=650;
   for(let i=0;i<12&&s.foes.length;i++){
    if(s.survival.executing){s.clock+=600;s.survival.update(600)}
    s.reloadAt=0;s.clock+=1000;s.guns[0].ammo=6;pointer.isDown=true;pointer.buttons=1;
    s.update(0,16);pointer.isDown=false;pointer.buttons=0;
    const shots=s.shots.filter(p=>p.sprite.active&&!p.enemy);
    for(const shot of shots){if(shot.requiem){const old=Math.random;if(mode==='explosion'){s.run.upgrades.explosiveAmmo=1;Math.random=()=>new Error().stack.split("\n")[2]?.includes("Game.procExplosion")?0:old()}try{move(shot,900,shot.sprite.y)}finally{Math.random=old;s.run.upgrades.explosiveAmmo=0}}else s.impact(shot)}
    if(mode==='mixed-calada')s.guns=[s.guns[0]];
   }
   s.rounds.update();const count=ac.notifications.filter(n=>n.id==='requiem-round').length;s.rounds.update();
   const result={before,unlocked:!!ac.data.unlocked['requiem-round'],phase:s.rounds.state.phase,kills:s.rounds.state.kills,debug:{health:s.run.health,ended:s.ended,paused:s.paused,roulette:s.roulette.active,level:s.levelUp.active,pending:s.run.pendingLevels,guns:s.guns.map(g=>({id:g.id,ammo:g.ammo})),shots:s.shots.map(p=>({id:p.weaponId,active:p.sprite.active,hits:p.requiem?.hits,previous:p.previous,position:[p.sprite.x,p.sprite.y]})),foes:s.foes.slice(0,2).map(e=>({hp:e.hp,pos:[e.sprite.x,e.sprite.y]})),hub:window.hotlineGame.registry.get("inputHub").last,pointer:[pointer.x,pointer.y],nextFire:s.nextFire,clock:s.clock},notifications:count,repeat:ac.notifications.filter(n=>n.id==='requiem-round').length};D.active=false;D.immortal=false;return result;};return exercise(mode);
  },mode);
  const expected=['clean','dual-calada','calada-only','heal-dash-reload'].includes(mode);
  assert.equal(result.before,false);assert.equal(result.unlocked,expected,mode+' '+JSON.stringify(result));assert.equal(result.phase,'rest',mode+' '+JSON.stringify(result));if(expected){assert.equal(result.notifications,1);assert.equal(result.repeat,1)}
 }
 console.log('PASS real round challenge scenarios:',scenarios.join(', '));
 // Tryhard retains per-projectile progression and legitimate 1.35x modifier.
 await page.evaluate(()=>{window.hotlineGame.loop.wake();s.scene.restart({characterId:'nicolas'})});await page.waitForTimeout(200);
 const nicolas=await page.evaluate(()=>{s=window.hotlineGame.scene.getScene('Game');s.roulette.update(4000);window.hotlineGame.loop.sleep();reset();const targets=foes(5);s.guns=[A.gun(9)];s.ultimate.charge=40;s.ultimate.activate(s.clock,s.guns);const shot=fire();move(shot);return {damage:targets.map(e=>1000-e.hp),hp:s.run.health,multiplier:s.ultimate.weaponMultiplier}});
 near(nicolas.multiplier,1.35);assert.equal(nicolas.hp,500);nicolas.damage.forEach((n,i)=>near(n,i<4?90*1.35*[1,.85,.7,.55][i]:0));
 const nicoRound=await page.evaluate(()=>exercise('calada-only'));assert.ok(nicoRound.unlocked&&nicoRound.phase==='rest');
 const notification=await page.evaluate(()=>{const toast=window.hotlineGame.scene.getScene('AchievementToast');for(let i=0;i<80;i++){if(!toast.notification)toast.update(0,16);if(toast.notification?.id==='requiem-round'){toast.update(0,300);return {name:toast.notification.name,alpha:toast.notificationAlpha,icon:toast.banner.list.some(o=>o.texture?.key==='achievement-12')}}toast.update(0,5000)}return null});
 assert.ok(notification?.icon&&notification.alpha>0);assert.equal(notification.name,'Salud para los vivos, Requiem para los muertos');
 await page.evaluate(()=>window.hotlineGame.loop.wake());await page.waitForTimeout(100);await page.screenshot({path:'requiem153-toast.png'});
 // Preserve and reopen the normal existing achievements save, then show the new golden entry.
 await page.evaluate(()=>{D.active=false;window.savedDate=ac.data.unlocked['requiem-round'];window.previousKill=ac.data.unlocked.kill;window.hotlineGame.loop.wake();s.scene.start('Achievements')});
 await page.waitForFunction(()=>window.hotlineGame.scene.isActive('Achievements'));
 const menu=await page.evaluate(()=>{const scene=window.hotlineGame.scene.getScene('Achievements');scene.page=6;scene.draw();return {name:scene.children.list.some(o=>o.text==='Salud para los vivos, Requiem para los muertos'),quote:scene.children.list.some(o=>o.text==='Completa una ronda de combate utilizando exclusivamente la Requiem.'),icon:scene.children.list.some(o=>o.texture?.key==='achievement-12'),count:ac.available.length,date:ac.data.unlocked['requiem-round'],old:ac.data.unlocked.kill}});
 assert.ok(menu.name&&menu.quote&&menu.icon);assert.equal(menu.count,37);await page.waitForTimeout(100);await page.screenshot({path:'requiem153-achievement.png'});
 await page.reload();await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
 const saved=await page.evaluate(()=>{const a=window.hotlineGame.registry.get('achievements');return {date:a.data.unlocked['requiem-round'],old:a.data.unlocked.kill,notifications:a.notifications.filter(n=>n.id==='requiem-round').length}});
 assert.equal(saved.date,menu.date);assert.equal(saved.old,menu.old);assert.equal(saved.notifications,0);
 assert.deepEqual(errors,[]);console.log('PASS Tryhard damage/penetration/exclusive round, visible notification, legendary icon/menu, saved unlock on reload without duplicate notifications or loss of old achievements; no HTTP/JS errors');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
