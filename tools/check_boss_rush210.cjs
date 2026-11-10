const assert = require('node:assert/strict');
const {chromium,devices}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url=process.env.GAME_URL??'http://127.0.0.1:5180/';
async function checkProduction(browser){
 const p=await browser.newPage({...devices['Pixel 7'],viewport:{width:844,height:390},isLandscape:true});
 const errors=[],icons=new Set();
 p.on('pageerror',e=>errors.push(e.message));
 p.on('response',r=>{
  if(r.status()>=400)errors.push(r.status()+' '+r.url());
  if(r.ok()&&r.url().includes('/assets/v210/achievements/'))icons.add(r.url());
 });
 await p.goto(url);
 await p.locator('[data-action=rotation-accept]').tap();
 await p.getByRole('button',{name:'MODOS DE JUEGO'}).tap();
 await p.getByRole('button',{name:'BOSS RUSH',exact:true}).tap();
 await p.getByRole('button',{name:'CAMPAÑA',exact:true}).tap();
 await p.locator('[data-action=character-cervela]').tap();
 await p.getByRole('button',{name:'JUGAR CON CERVELA'}).tap();
 for(let i=0;i<6;i++)await p.locator('[data-action=continue]').tap();
 await p.locator('.boss').filter({hasText:/El Torturado/i}).waitFor();
 assert.equal(icons.size,15);
 assert.equal(await p.evaluate(()=>typeof window.hotlineGame),'undefined');
 assert.deepEqual(errors,[]);
 console.log('production: mobile menu and selection through the first fight, 15 achievement icons, no HTTP or JavaScript errors');
}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 try {
  if(process.env.RUSH_PRODUCTION_TEST){await checkProduction(browser);return;}
  const p=await browser.newPage({viewport:{width:1280,height:720}});
  const errors=[];
  p.on('pageerror',e=>{errors.push(e.message);console.error('JS:',e.stack)});p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  const active=key=>p.waitForFunction(k=>window.hotlineGame?.scene.isActive(k),key);
  const action=(key,name)=>p.evaluate(([key,name])=>{
   const s=hotlineGame.scene.getScene(key);
   const item=s.children.list.find(o=>o.text?.startsWith(name)&&o.input?.enabled);
   if(!item)throw Error(key+' / '+name);
   item.emit('pointerdown');
  },[key,name]);
  const choose=index=>p.evaluate(i=>hotlineGame.scene.getScene('CharacterSelect').choose(i),index);
  const game=fn=>p.evaluate(fn);
  const dialogue=()=>game(()=>{const g=hotlineGame.scene.getScene('Game');for(let i=0;i<12&&g.bossDialogue.active;i++)g.bossDialogue.advance()});
  const phase=phase=>p.waitForFunction(v=>hotlineGame.scene.getScene('Game').rush?.phase===v,phase);
  await p.goto(url);await active('Menu');await p.mouse.click(10,10);
  const track=name=>p.waitForFunction(n=>hotlineGame.sound.sounds.some(s=>s.key==='music-rush-'+n&&s.isPlaying),name);
  await action('Menu','JUGAR');await active('CharacterSelect');await choose(0);await active('Intro');
  await p.keyboard.press('Enter');await p.keyboard.press('Enter');await active('Game');
  assert.equal(await game(()=>!!hotlineGame.scene.getScene('Game').rush),false);
  assert.equal(await game(()=>!!hotlineGame.scene.getScene('Game').coop),false);
  await game(()=>hotlineGame.scene.getScene('Game').scene.start('Menu'));await active('Menu');
  await action('Menu','MULTIJUGADOR');await active('CharacterSelect');await choose(1);await active('CoopLobby');
  await game(()=>hotlineGame.scene.getScene('CoopLobby').scene.start('Menu'));await active('Menu');
  await action('Menu','MODOS DE JUEGO');await active('GameModes');await action('GameModes','BOSS RUSH');await active('BossRush');
  await p.waitForFunction(()=>hotlineGame.cache.audio.exists('music-rush-wesker-mutated'));await track('menu');
  await action('BossRush','CAMPAÑA');await active('CharacterSelect');await choose(2);await active('Game');
  await phase('intro');await track('intro');await dialogue();await phase('fight');await track('tortured');
  const initial=await game(()=>{const g=hotlineGame.scene.getScene('Game');return [g.character.id,!!g.coop,g.foes[0].boss,g.ultimate.charge,g.run.stats.maxHealth,g.worldModel.generated]});
  assert.deepEqual(initial,['jordan',false,0,20,100,0]);
  const kill=()=>game(()=>{const g=hotlineGame.scene.getScene('Game');g.hit(g.foes[0],1e6)});
  const drops=()=>game(()=>hotlineGame.scene.getScene('Game').drops.map(d=>[d.kind,d.id,d.sprite.x,d.sprite.y,d.ground?.instanceId]));
  const arsenal=()=>game(()=>{const g=hotlineGame.scene.getScene('Game');return {active:g.active,guns:g.guns.map(({id,ammo,reserve})=>({id,ammo,reserve}))}});
  const persistentLoot=async(real=false)=>{
   const before=await drops();assert(before.some(d=>d[0]==='gun'));
   if(real)await p.waitForTimeout(30500);
   else await game(()=>{const g=hotlineGame.scene.getScene('Game');for(let i=0;i<31;i++)g.update(0,1000)});
   assert.deepEqual(await drops(),before);
   assert(await game(()=>{const g=hotlineGame.scene.getScene('Game');return g.drops.every(d=>g.walkablePoint(d.sprite.x,d.sprite.y)&&g.navigation.canReach(g.player.body.center,d.sprite))}));
  };
  await kill();await phase('loot');await persistentLoot(!process.env.RUSH_FAST_TEST);
  await game(()=>{const g=hotlineGame.scene.getScene('Game');g.guns[0].ammo=3;g.ultimate.charge=14;g.run.health=39;g.player.setPosition(552,840);g.pickup()});
  await phase('rest');
  await track('safe-room');
  assert.deepEqual(await game(()=>{const g=hotlineGame.scene.getScene('Game');return [g.guns[0].ammo,g.ultimate.charge,g.run.health,g.rush.balance,g.foes.length]}),[3,14,64,180,0]);
  assert.deepEqual(await game(()=>hotlineGame.scene.getScene('Game').children.list.filter(o=>o.name.startsWith('rush-safe-')) .map(o=>o.name).sort()),['rush-safe-cervela','rush-safe-nicolas']);
  await game(()=>{const g=hotlineGame.scene.getScene('Game');g.player.setPosition(120,360);g.pickup();g.player.setPosition(600,456);g.roulette.random=()=>.17;g.pickup()});
  await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').roulette.active);
  await game(()=>hotlineGame.scene.getScene('Game').roulette.update(15000));
  await p.waitForTimeout(1300);
  assert(await game(()=>hotlineGame.scene.getScene('Game').rush.pendingWeapon?.id===2));
  await game(()=>{const g=hotlineGame.scene.getScene('Game');g.player.setPosition(360,504);g.pickup()});
  assert.equal(await game(()=>hotlineGame.scene.getScene('Game').rush.phase),'rest');
  await game(()=>{const g=hotlineGame.scene.getScene('Game'),d=g.drops.find(d=>d.kind==='gun');g.player.setPosition(d.sprite.x,d.sprite.y);g.pickup()});
  assert.equal(await game(()=>localStorage.getItem('hotline-rush-suspend-v1')),null);
  const rolled=await arsenal();assert.equal(rolled.guns.length,2);assert.equal(rolled.guns[rolled.active].id,2);
  await game(()=>{const g=hotlineGame.scene.getScene('Game');g.player.setPosition(312,360);g.pickup()});
  await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').rush.cardPanel);
  await game(()=>hotlineGame.scene.getScene('Game').rush.cardPanel.list.find(o=>o.input?.enabled).emit('pointerdown'));
  await game(()=>{const g=hotlineGame.scene.getScene('Game');g.player.setPosition(456,456);g.pickup()});
  await active('BossRush');
  const restFixture=await game(()=>JSON.parse(localStorage.getItem('hotline-rush-suspend-v1')));
  await action('BossRush','CONTINUAR');await active('Game');await phase('rest');
  assert.equal(await game(()=>hotlineGame.scene.getScene('Game').rush.rest.chose),true);
  assert.deepEqual(await arsenal(),rolled);
  const exit=()=>game(()=>{const g=hotlineGame.scene.getScene('Game');const [x,y]=g.rush.map.layout.exit;g.player.setPosition(x*48+24,y*48+24);g.pickup()});
  await exit();await phase('intro');assert.deepEqual(await arsenal(),rolled);await dialogue();await phase('fight');
  await p.waitForTimeout(300);await p.mouse.move(1000,600);await p.mouse.down();await p.waitForTimeout(210);await p.mouse.up();
  await p.waitForFunction(a=>{const g=hotlineGame.scene.getScene('Game');return g.guns[g.active].ammo<a},rolled.guns[rolled.active].ammo);
  await p.keyboard.press('KeyR',{delay:85});await p.waitForFunction(a=>{const g=hotlineGame.scene.getScene('Game');return g.guns[g.active].reserve<a&&!g.reloadAt},rolled.guns[rolled.active].reserve);
  const reloaded=await arsenal();
  for(const boss of [1,2,3,4]){
   assert.equal(await game(()=>hotlineGame.scene.getScene('Game').foes[0].boss),boss);
   await track(['tortured','commander','demolisher','executioner','butcher'][boss]);
   if(boss===1){
    await game(()=>{const g=hotlineGame.scene.getScene('Game'),e=g.foes[0],m=g.newBosses.state(e);m.phase='recover';m.until=g.clock+1500});
    const x0=await game(()=>{const e=hotlineGame.scene.getScene('Game').foes[0];return [e.sprite.x,e.sprite.y]});
    await p.waitForFunction(([x,y])=>{const e=hotlineGame.scene.getScene('Game').foes[0];return Math.hypot(e.sprite.x-x,e.sprite.y-y)>10},x0);
   }
   if(boss===2){
    const specials=await game(()=>{
      const g=hotlineGame.scene.getScene('Game'),e=g.foes[0],ai=g.newBosses,m=ai.state(e);
      for(const special of ['frag','fire']){
        m.phase='throw';m.special=special;m.until=g.clock;m.x=e.sprite.x+120;m.y=e.sprite.y+80;
        ai.update(e);
      }
      const flights=g.chaos.flights.filter(f=>f.bossSource===2);
      const ids=flights.map(f=>f.id);
      for(const flight of flights)g.chaos.land(flight,flight.to.x,flight.to.y);
      const fire=g.chaos.fires.some(f=>f.bossSource===2);
      g.chaos.clearHazards();
      return [ids,fire];
    });
    assert.deepEqual(specials,[[0,1],true]);
   }
   if(boss===3){
    const aimed=await game(()=>{
     const g=hotlineGame.scene.getScene('Game'),e=g.foes[0],ai=g.newBosses,m=ai.state(e);
     g.player.setPosition(696,264).setVelocity(150,0);g.player.body.updateFromGameObject();
     m.phase='move';m.until=g.clock;ai.update(e);
     const lead=m.x-g.player.x;
     m.x=696;m.y=504;m.until=g.clock;
     const blocked=!g.lineClear(e.sprite.x,e.sprite.y,m.x,m.y),before=g.shots.length;
     ai.update(e);
     g.player.setVelocity(0);
     return {lead,blocked,shots:g.shots.length-before};
    });
    assert(aimed.lead>0&&aimed.lead<=84);assert(aimed.blocked);assert.equal(aimed.shots,0);
    const power=await game(()=>{
      const g=hotlineGame.scene.getScene('Game'),cut=g.rush.power;
      cut.next=g.clock;cut.update(true);const started=cut.dark;
      g.player.setPosition(264,312);g.player.body.updateFromGameObject();
      cut.interact(()=>.99);const failed=cut.dark;
      cut.retry=g.clock;cut.interact(()=>0);const restored=!cut.dark;
      cut.next=g.clock;cut.update(true);cut.until=g.clock;cut.update(true);
      return [started,failed,restored,!cut.dark];
    });
    assert.deepEqual(power,[true,true,true,true]);
    await game(()=>{
      const g=hotlineGame.scene.getScene('Game'),e=g.foes[0],ai=g.newBosses,m=ai.state(e);
      m.phase='throw';m.special='smoke';m.until=g.clock;m.x=e.sprite.x+95;m.y=e.sprite.y+40;
      ai.update(e);
    });
    await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').children.list.some(o=>String(o.frame?.name??'').startsWith('smoke-cloud-')));
   }
   await kill();await phase('loot');await persistentLoot();
   if(boss===2){const old=await drops();await game(()=>{const g=hotlineGame.scene.getScene('Game'),d=g.drops.find(d=>d.kind==='gun');g.player.setPosition(d.sprite.x,d.sprite.y);g.pickup()});assert.equal((await drops()).filter(d=>d[4]===old.find(d=>d[0]==='gun')[4]).length,0)}
   if(boss===4)assert.equal(await game(()=>hotlineGame.scene.getScene('Game').rush.door.frame.name),'4-gate-open');
   await exit();await phase('rest');if(boss===1)assert.deepEqual(await arsenal(),reloaded);
   assert(!(await drops()).some(d=>d[0]==='gun'));await exit();await phase('intro');await dialogue();await phase('fight');
  }
  assert.equal(await game(()=>hotlineGame.scene.getScene('Game').rush.boss),5);
  await p.waitForFunction(()=>hotlineGame.sound.sounds.some(s=>s.key==='music-rush-wesker-human'&&s.isPlaying));
  const evasion=await game(()=>{const g=hotlineGame.scene.getScene('Game'),u=g.uroboros,e=u.foe.sprite,origin={x:e.x-150,y:e.y};const random=Math.random;try{Math.random=()=>.99;const missed=u.evadeBullet(origin);Math.random=()=>0;const rolls=Array.from({length:11},()=>u.evadeBullet(origin));u.time=u.vulnerableUntil+1;const recovered=u.evadeBullet(origin);return {missed,rolls,recovered}}finally{Math.random=random}});
  assert.deepEqual(evasion,{missed:false,rolls:[...Array(10).fill(true),false],recovered:true});
  await game(()=>{const g=hotlineGame.scene.getScene('Game');g.uroboros.forceTransformation()});
  await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').uroboros.stage===2);await dialogue();
  assert.equal(await game(()=>hotlineGame.scene.getScene('Game').uroboros.foe.boss),5);
  await p.waitForFunction(()=>hotlineGame.sound.sounds.some(s=>s.key==='music-rush-wesker-mutated'&&s.isPlaying));
  assert.equal(await game(()=>hotlineGame.sound.sounds.filter(s=>s.key.startsWith('music-')&&s.isPlaying).length),1);
  const cured=await game(()=>{const g=hotlineGame.scene.getScene('Game'),u=g.uroboros;
   const crates=[...g.fortune.ledger.objects.values()].filter(c=>c.uroboros);const c=crates[0];const med=g.run.medkits;
   u.infect(g);g.fortune.damage(c,c.hp);g.player.setPosition(c.x,c.y);g.pickup();const picked=u.state(1).cures;
   u.useCure(g);return [crates.length,picked,u.state(1).level,g.run.medkits===med];});
  assert.deepEqual(cured,[3,1,0,true]);
  await kill();await active('BossRush');
  const results=await game(()=>JSON.parse(localStorage.getItem('hotline-rush-results-v1')));
  assert.equal(results.completed,1);assert.equal(results.best[0].times.length,6);
  assert.equal(await game(()=>localStorage.getItem('hotline-rush-unlocked-v1')),'6');
  const beforeEndless=await arsenal();
  await game(()=>{const menu=hotlineGame.scene.getScene('BossRush');menu.continuation.next=5;menu.continuation.encounter=[5]});
  await action('BossRush','CONTINUAR AL INFINITO');await phase('rest');
  assert.deepEqual(await arsenal(),beforeEndless);
  await game(()=>{const g=hotlineGame.scene.getScene('Game');g.run.health=54;g.player.setPosition(216,168)});
  await p.keyboard.press('KeyE',{delay:80});
  await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').rush.companionOpen);
  await game(()=>{const g=hotlineGame.scene.getScene('Game');g.rush.cardPanel.list.find(o=>o.text==='CAMBIAR DE PROTAGONISTA').emit('pointerdown')});
  assert(await game(()=>hotlineGame.scene.getScene('Game').rush.conversation.line[0]==='jordan'));
  for(let i=0;i<3;i++)await p.keyboard.press('KeyE',{delay:65});
  await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').character.id==='cervela'&&hotlineGame.scene.getScene('Game').rush.safe);
  assert.deepEqual(await arsenal(),beforeEndless);
  assert.equal(await game(()=>hotlineGame.scene.getScene('Game').run.health),54);
  assert.deepEqual(await game(()=>hotlineGame.scene.getScene('Game').rush.endless.relays),[{from:'jordan',to:'cervela',cleared:0}]);
  const rushExit=()=>game(()=>{const g=hotlineGame.scene.getScene('Game'),v=g.rush;
   const cell=v.map.layout?.exit;
   g.player.setPosition(cell?cell[0]*48+24:936,cell?cell[1]*48+24:1272);g.pickup();
  });
  const finishFight=async()=>{await phase('intro');
   assert.equal(await game(()=>hotlineGame.scene.getScene('Game').bossDialogue.active),false);
   await phase('fight');
   if(await game(()=>!!hotlineGame.scene.getScene('Game').uroboros)){
    await game(()=>hotlineGame.scene.getScene('Game').uroboros.forceTransformation());
    await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').uroboros.stage===2);await dialogue();
   }
   await kill();await phase('loot');
  };
  await rushExit();
  for(let i=1;i<=3;i++){
   await finishFight();
   assert.equal(await game(()=>hotlineGame.scene.getScene('Game').rush.endless.cleared),i);
   if(i===1){
    const remaining=()=>game(()=>{const g=hotlineGame.scene.getScene('Game');return g.rush.until-g.clock;});
    assert((await remaining())>44000);
    await game(()=>hotlineGame.scene.getScene('Game').pause());
    const paused=await remaining();await p.waitForTimeout(180);assert.equal(await remaining(),paused);
    await game(()=>hotlineGame.scene.getScene('Game').pause());
    await rushExit();
   }else await rushExit();
  }
  await phase('rest');
  await game(()=>{const g=hotlineGame.scene.getScene('Game');g.player.setPosition(456,456);g.pickup()});
  await active('BossRush');
  const endlessFixture=await game(()=>JSON.parse(localStorage.getItem('hotline-rush-suspend-v1')));
  assert.equal(endlessFixture.endless.cleared,3);
  await action('BossRush','CONTINUAR RACHA');await active('Game');await phase('rest');
  await p.waitForFunction(()=>localStorage.getItem('hotline-rush-suspend-v1')===null);
  assert.equal(await game(()=>localStorage.getItem('hotline-rush-suspend-v1')),null);
  await game(()=>{const g=hotlineGame.scene.getScene('Game');g.player.setPosition(504,504);g.pickup();
   g.rush.cardPanel.list.find(o=>o.text==='CONFIRMAR RETIRADA').emit('pointerdown')});
  await active('BossRush');
  assert.equal(await game(()=>JSON.parse(localStorage.getItem('hotline-rush-endless-records-v1'))[0].reason),'retirada');
  await p.evaluate(rest=>hotlineGame.scene.getScene('BossRush').scene.start('Game',{characterId:rest.character,rush:{kind:'next',rest:{...rest,next:2,encounter:[2,4],endless:{...rest.endless,cleared:6,kills:6}}}}),endlessFixture);
  await p.waitForFunction(()=>{const g=hotlineGame.scene.getScene('Game');return g.rush?.endless?.cleared===6&&g.rush.combat});
  const pair=await game(()=>{const g=hotlineGame.scene.getScene('Game'),[a,b]=g.foes;
   const accessible=g.navigation.canReach(g.player.body.center,b.sprite.body.center);
   for(let i=0;i<10;i++)g.rush.friendlyArea(a.boss,b.sprite,40,1e6);
   const friendly=b.hp/b.max;const before=g.drops.length;g.hit(a,1e6);
   return {ids:g.rush.encounter,accessible,friendly,before,after:g.drops.length,phase:g.rush.phase};
  });
  assert.deepEqual(pair.ids,[2,4]);assert(pair.accessible);assert(Math.abs(pair.friendly-.8)<1e-9);
  assert.equal(pair.before,pair.after);assert.equal(pair.phase,'fight');
  await kill();await phase('loot');
  assert.equal(await game(()=>hotlineGame.scene.getScene('Game').rush.endless.kills),8);
  await rushExit();await p.waitForFunction(()=>{const g=hotlineGame.scene.getScene('Game');return g.rush?.endless?.cleared===7&&g.rush.combat});
  await game(()=>hotlineGame.scene.getScene('Game').damage(1e6,true,false));
  await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').deathSequence.phase==='screen');
  assert.equal(await game(()=>localStorage.getItem('hotline-rush-suspend-v1')),null);
  assert(await game(()=>JSON.parse(localStorage.getItem('hotline-rush-endless-records-v1')).some(x=>x.reason==='derrota'&&x.cleared===7)));
  await game(()=>hotlineGame.scene.getScene('Game').deathSequence.records());
  await active('BossRush');await action('BossRush','← VOLVER');
  await active('BossRush');
  await action('BossRush','PRÁCTICA');await action('BossRush','EL COMANDANTE');await action('BossRush','Pistola');await active('CharacterSelect');await choose(1);
  await active('Game');await dialogue();await phase('fight');await kill();
  await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').rush?.practiceWon);
  await game(()=>hotlineGame.scene.getScene('Game').rush.exit(true));await phase('intro');await dialogue();await phase('fight');
  assert.equal(await game(()=>hotlineGame.scene.getScene('Game').character.id),'nicolas');
  assert.deepEqual(await game(()=>JSON.parse(localStorage.getItem('hotline-rush-results-v1'))),results);
  await game(()=>{const s=hotlineGame.scene.getScene('Game');s.scene.restart({characterId:'nicolas',coop:false,rush:{kind:'campaign',character:'nicolas'}})});
  await phase('intro');await dialogue();await phase('fight');
  await game(()=>hotlineGame.scene.getScene('Game').damage(1e6,true,false));
  await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').deathSequence.phase==='screen');
  await p.keyboard.press('Enter');await phase('intro');
  assert.equal(await game(()=>hotlineGame.scene.getScene('Game').rush.boss),0);
  assert.equal(await game(()=>localStorage.getItem('hotline-rush-suspend-v1')),null);
  const weskerHealth=[];
  for(const cleared of [17,29]){
   await p.evaluate(({rest,cleared})=>{const g=hotlineGame.scene.getScene('Game');g.scene.restart({characterId:rest.character,rush:{kind:'next',rest:{...rest,next:5,encounter:[5],endless:{...rest.endless,cleared,kills:cleared}}}})},{rest:endlessFixture,cleared});
   await p.waitForFunction(n=>{const g=hotlineGame.scene.getScene('Game');return g.rush?.endless?.cleared===n&&g.rush.combat},cleared);
   const max=await game(()=>{const g=hotlineGame.scene.getScene('Game');g.uroboros.forceTransformation();return g.uroboros.foe.max});
   weskerHealth.push(max);
   await p.waitForFunction(()=>{const u=hotlineGame.scene.getScene('Game').uroboros;return u.stage===2&&!u.transforming});
   await kill();await phase('loot');
   assert.equal(await game(()=>hotlineGame.scene.getScene('Game').rush.door.visible),false);
   await rushExit();await phase('rest');
  }
  assert(weskerHealth[1]>weskerHealth[0]);
  for(const character of ['cervela','nicolas','jordan']){
   await p.evaluate(({character,restFixture})=>{const g=hotlineGame.scene.getScene('Game');g.scene.restart({characterId:character,rush:{kind:'resume',rest:{...restFixture,character,stats:{...restFixture.stats,character}}}})},{character,restFixture});
   await p.waitForFunction(id=>{const g=hotlineGame.scene.getScene('Game');return g.rush?.safe&&g.character.id===id},character);
   await game(()=>hotlineGame.scene.getScene('Game').player.setPosition(504,408));
   await p.keyboard.down('KeyS');await p.waitForTimeout(100);await p.keyboard.up('KeyS');
   assert(await game(()=>{const g=hotlineGame.scene.getScene('Game');return g.player.y>408&&!g.rush.conversation}));
   const npcs=await game(()=>[...hotlineGame.scene.getScene('Game').rush.actors.keys()]);
   assert.equal(npcs.length,2);assert(!npcs.includes(character));
   for(const npc of npcs){
    await p.evaluate(npc=>{const g=hotlineGame.scene.getScene('Game');const x={cervela:216,nicolas:360,jordan:648}[npc];g.player.setPosition(x,168)},npc);
    await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').hint.text.includes('HABLAR CON'));
    const before=await arsenal();
    await p.keyboard.press('KeyS');
    assert(await game(()=>!hotlineGame.scene.getScene('Game').rush.conversation));
    await p.keyboard.press('KeyE',{delay:75});await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').rush.conversation);
    const first=await game(()=>hotlineGame.scene.getScene('Game').rush.conversation.line[1]);
    const state=()=>game(()=>{const g=hotlineGame.scene.getScene('Game');return [g.run.health,g.run.medkits,g.ultimate.charge,g.rush.balance,g.player.x,g.player.y,[...g.chaos.inventory.counts]]});
    const frozen=await state();
    for(const key of ['KeyW','KeyA','KeyS','KeyD','KeyF','KeyX','KeyG','KeyB','Space','KeyH'])await p.keyboard.press(key,{delay:55});
    await p.mouse.click(900,500);assert.deepEqual(await state(),frozen);assert.deepEqual(await arsenal(),before);
    await p.keyboard.press('KeyE',{delay:75});await p.waitForFunction(v=>hotlineGame.scene.getScene('Game').rush.conversation?.line[1]!==v,first);
    await p.keyboard.press('Escape',{delay:75});await p.waitForFunction(()=>{const g=hotlineGame.scene.getScene('Game');return !g.rush.conversation&&!g.paused});
    const pose=await p.evaluate(npc=>{const a=hotlineGame.scene.getScene('Game').rush.actors.get(npc);return [a.anims.isPlaying,a.scaleX,a.scaleY]},npc);
    assert(pose[0]);
    if(npc==='jordan'){
     assert.deepEqual(pose.slice(1),[.30,.30]);
     assert(await game(()=>{
      const g=hotlineGame.scene.getScene('Game'),actor=g.rush.actors.get('jordan');
      const bar=g.children.list.find(o=>o.frame?.name==='safe-bar');
      const front=g.children.list.find(o=>o.frame?.name==='safe-bar-front');
      return bar.depth<actor.depth&&actor.depth<front.depth&&!front.body;
     }));
    }
    await p.keyboard.press('KeyE',{delay:75});await p.waitForFunction(()=>hotlineGame.scene.getScene('Game').rush.conversation);
    assert.notEqual(await game(()=>hotlineGame.scene.getScene('Game').rush.conversation.line[1]),first);
    await p.keyboard.press('Escape',{delay:75});await p.waitForFunction(()=>!hotlineGame.scene.getScene('Game').rush.conversation);
   }
  }
  assert.deepEqual(errors,[]);
  console.log('desktop: solo, coop selection, Boss Rush Jordan, six arena transitions, character relay, endless cycles, double, sniper lead/cover and power cut, friendly fire, retirement and defeat, loot, purchases, roulette, cards, suspension, two NPCs, ranking, practice restart, Wesker evasion/cure/audio and immediate exits at cycles 6 and 10');
  const mobile=await browser.newPage({...devices['Pixel 7'],viewport:{width:844,height:390},isLandscape:true});
  mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.goto(url);
  await mobile.locator('[data-action=rotation-accept]').tap();
  await mobile.getByRole('button',{name:'MODOS DE JUEGO'}).tap();
  await mobile.getByRole('button',{name:'BOSS RUSH',exact:true}).tap();
  await mobile.getByRole('button',{name:'PRÁCTICA DE JEFES',exact:true}).tap();
  assert(await mobile.locator('[data-action=practice-0]').isDisabled());
  await mobile.evaluate(()=>{localStorage.setItem('hotline-rush-unlocked-v1','1');hotlineGame.scene.getScene('BossRush').render();});
  await mobile.locator('[data-action=practice-back]').tap();
  await mobile.getByRole('button',{name:'PRÁCTICA DE JEFES',exact:true}).tap();
  await mobile.locator('[data-action=practice-0]').tap();
  await mobile.locator('[data-action=practice-0].selected img').waitFor();
  assert(await mobile.locator('[data-action=confirm-practice]').isEnabled());
  await mobile.locator('[data-action=practice-back]').tap();
  await mobile.getByRole('button',{name:'CAMPAÑA',exact:true}).tap();
  await mobile.locator('[data-action=character-cervela]').tap();
  await mobile.getByRole('button',{name:'JUGAR CON CERVELA'}).tap();
  await mobile.waitForFunction(()=>hotlineGame.scene.getScene('Game').rush?.phase==='intro');
  await mobile.waitForFunction(()=>hotlineGame.scene.getScene('Game').bossDialogue.active);
  for(let i=0;i<6;i++)await mobile.locator('[data-action=continue]').tap();
  await mobile.waitForFunction(()=>hotlineGame.scene.getScene('Game').rush?.combat);
  await mobile.evaluate(()=>{const g=hotlineGame.scene.getScene('Game');g.hit(g.foes[0],1e6);g.player.setPosition(552,840);g.pickup()});
  await mobile.waitForFunction(()=>hotlineGame.scene.getScene('Game').rush?.safe);
  await mobile.evaluate(()=>hotlineGame.scene.getScene('Game').player.setPosition(360,168));
  await mobile.getByRole('button',{name:'HABLAR',exact:true}).tap();
  await mobile.locator('[data-action=safe-talk-next]').tap();
  await mobile.locator('[data-action=safe-talk-close]').tap();
  await mobile.waitForFunction(()=>!hotlineGame.scene.getScene('Game').rush.conversation);
  await mobile.evaluate(()=>hotlineGame.scene.getScene('Game').player.setPosition(312,360));
  await mobile.locator('[data-control=interact]').tap();
  await mobile.locator('[data-action=rush-card-0]').tap();
  await mobile.waitForFunction(()=>hotlineGame.scene.getScene('Game').rush.rest.chose);
  assert.deepEqual(errors,[]);
  console.log('mobile emulation: modes, locked and unlocked practice cards, campaign, character reveal, Safe Room dialogue and upgrades');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
