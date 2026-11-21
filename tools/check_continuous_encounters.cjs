const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:5198/hotline-curico/');
  await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
  for(const continuous of [false,true])for(const characterId of ['nicolas','jordan','cervela']){
   await page.evaluate(data=>{hotlineGame.scene.getScene('Menu').scene.start('Game',data)},{continuous,characterId});
   await page.waitForFunction(()=>hotlineGame.scene.isActive('Game')&&(window.g=hotlineGame.scene.getScene('Game')).combatHud!==undefined);
   const equipped=await page.evaluate(()=>{
    let winner;
    if(!g.continuous){if(!g.roulette.active)throw Error('Falta presentación');winner=g.roulette.winner;g.roulette.update(60000)}
    const initial=g.guns[0],shots=g.shots.length;
    g.weaponCombat.use(initial,g.player.x,g.player.y,0);
    if(initial.id<13&&g.shots.length<=shots)throw Error('Arma inicial sin proyectil');
    return [g.guns.length,g.guns[0]?.id,winner??g.guns[0]?.id,g.drops.some(d=>d.ground?.weapon===g.guns[0])];
   });
   assert.deepEqual(equipped,[1,equipped[1],equipped[1],false]);
   if(continuous&&characterId==='cervela')break;
   await page.evaluate(()=>{g.scene.start('Menu')});await page.waitForFunction(()=>hotlineGame.scene.isActive('Menu'));
  }
  console.log('PASS equipamiento de los tres protagonistas en ambos modos');
  await page.evaluate(()=>{
   window.verifySectorReload=bosses=>{
    const stream=g.worldStreamer;
    const records=bosses.map(e=>({e,hp:e.hp,max:e.max,sprite:e.sprite,body:e.sprite.body,key:g.encounters.members.get(e)}));
    const keys=new Set(bosses.map(e=>Math.floor(e.sprite.x/1536)+','+Math.floor(e.sprite.y/1536)));
    const origin={x:g.player.x,y:g.player.y},controller=g.uroboros;
    for(const key of keys){
     const [x,y]=key.split(',').map(Number);
     if(!stream.loaded.has(key))stream.load(x,y);
    }
    // Accelerated excursion. Only the player and camera move artificially.
    for(const offset of [7,10,13]){
     const x=origin.x+offset*1536;
     g.player.body.reset(x,origin.y);g.cameras.main.centerOn(x,origin.y);
     g.cameras.main.preRender();
     for(let tick=0;tick<20;tick++)stream.streamContinuous(x,origin.y);
     if([...keys].some(key=>stream.loaded.has(key)))throw Error('Sector del jefe sigue cargado');
     for(const e of bosses)if(!g.encounters.distant(e))throw Error('Persecución lejana inactiva');
    }
    g.player.body.reset(origin.x,origin.y);g.cameras.main.centerOn(origin.x,origin.y);
    g.cameras.main.preRender();
    for(let tick=0;tick<20;tick++)stream.streamContinuous(origin.x,origin.y);
    if(g.uroboros!==controller||[...keys].some(key=>!stream.loaded.has(key)))throw Error('Controlador o sector perdido al regresar');
    for(const r of records){
     if(g.foes.filter(f=>f===r.e).length!==1||r.hp!==r.e.hp||r.max!==r.e.max||r.sprite!==r.e.sprite||!r.sprite.active||r.body!==r.sprite.body||!r.body.enable||g.encounters.members.get(r.e)!==r.key)throw Error('Identidad del jefe perdida al recargar sector');
    }
   };
  });
  const result=await page.evaluate(()=>{
   const ids=[];
   for(let i=1;i<=6;i++){
    g.continuous.elapsed=i*300000-10000;g.encounters.update();
    g.continuous.elapsed+=10000;
    for(let j=0;j<12&&!g.encounters.living;j++){g.encounters.update();g.continuous.elapsed+=500}
    const e=g.foes.find(e=>e.boss>=0);if(!e)throw Error('no apareció '+i);
    ids.push(e.boss);
    if(e.boss===5){
     g.uroboros.forceTransformation();g.uroboros.update(16);
     if(g.physics.world.isPaused)throw Error('transformación pausó el combate');
     for(let j=0;j<8;j++)g.uroboros.update(100);
    }
    verifySectorReload([e]);
    g.hit(e,1e8);if(g.encounters.living)throw Error('no se resolvió '+i);
    g.run.pendingLevels=0;g.encounters.update();
   }
   return [ids,g.ended,g.run.round];
  });
  assert.equal(result[0][5],5);assert.equal(new Set(result[0].slice(0,5)).size,5);assert.deepEqual(result.slice(1),[false,0]);assert.deepEqual(errors,[]);
  const double=await page.evaluate(()=>{
   const manager=g.encounters;
   manager.calendar.random=()=>.01;
   g.continuous.elapsed=2090000;manager.update();
   g.continuous.elapsed=2100000;manager.update();
   const first=g.foes.find(e=>e.boss>=0);
   first.hp-=30;const wounded=first.hp;
   g.continuous.elapsed+=15000;manager.update();
   const bosses=g.foes.filter(e=>e.boss>=0);
   if(bosses.length!==2||first.hp!==wounded)throw Error('Encuentro doble o salud incorrectos');
   verifySectorReload(bosses);
   manager.draw();
   const arrows=manager.arrows.size;
   g.run.health=g.run.stats.maxHealth;g.run.medkits=3;g.ultimate.charge=g.ultimate.requiredHits;
   const old=g.clock;g.hit(bosses[0],1e8);const expiry=manager.defenceUntil;
   if(expiry!==old+30000)throw Error('Beneficio de reserva incorrecto');
   g.clock+=100;manager.defeated(bosses[0]);
   if(manager.defenceUntil!==expiry)throw Error('Recompensa duplicada');
   return [arrows,manager.living,g.ended];
  });
  assert.deepEqual(double,[2,1,false]);
  console.log('PASS doble, indicadores, salud conservada y beneficio temporal exactamente una vez');
  console.log('PASS seis combates acelerados, transformación de Wesker, derrotas y continuidad sin rondas');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
