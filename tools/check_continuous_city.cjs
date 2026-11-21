const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 try{
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.GAME_URL||'http://127.0.0.1:5198/hotline-curico/');
  await p.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
  await p.evaluate(()=>{hotlineGame.scene.getScene('Menu').scene.start('Game',{continuous:true,characterId:'nicolas'})});
  await p.waitForFunction(()=>!!(window.g=hotlineGame.scene.getScene('Game')).continuousCity);
  const start=Date.now(),points=[];
  await p.evaluate(()=>{window.c=g.continuousCity;g.coins.deposit(35,792+260,792);window.initialCoins=g.coins.ledger.pending});
  for(const sector of [0,1,2,3,4,5,8,10,13,16,19,0]){
   await p.evaluate(i=>{g.player.body.reset(792+i*1536,792);g.player.body.updateFromGameObject()},sector);
   await p.waitForFunction(i=>g.worldStreamer.loaded.has(i+',0')&&g.worldStreamer.pending===0,sector);
   points.push(await p.evaluate(()=>({...c.diagnostics(),district:g.worldModel.biome(Math.floor(g.player.x/1536),0)})));
  }
  assert.equal(await p.evaluate(()=>g.coins.ledger.pending),35);
  await p.keyboard.down('d');await p.waitForTimeout(4500);await p.keyboard.up('d');
  await p.keyboard.down('a');await p.waitForTimeout(4500);await p.keyboard.up('a');
  const result=await p.evaluate(()=>{
   const t=g.continuous.elapsed,p=g.player,s=c.climate;
   s.changeAt=t;c.update(t);const rain=s.sky;s.changeAt=t;c.update(t);const storm=s.sky;
   // The fixed intersection can hold a seed-dependent solid crate. Choose a valid
   // outdoor point before testing warning duration and dash, without editing solids.
   let target;
   for(let y=14;y<=17&&!target;y++)for(let x=14;x<=17;x++){
    const px=x*48+24,py=y*48+24;
    if(!g.city.inside(px,py)&&g.walkablePoint(px,py)&&c.escape(px,py)){target=[px,py];break}
   }
   if(!target)throw Error('Intersección sin casilla exterior transitable');
   p.body.reset(...target);p.body.updateFromGameObject();
   c.weatherRandom=()=>.5;s.strikeAt=t;s.safeUntil=0;c.update(t);
   if(!c.mark||c.mark.at-t!==1500)throw Error('Aviso eléctrico ausente '+JSON.stringify({at:t,pos:[p.x,p.y],inside:g.city.inside(p.x,p.y),open:g.walkablePoint(p.x,p.y),escape:c.escape(p.x,p.y),sky:s.sky,traffic:!!c.traffic,ended:g.ended,mark:c.mark}));
   const hp=g.run.health;g.dash.start(g.clock,1,0);c.update(t+1499);
   if(!c.mark)throw Error('Impacto prematuro');c.update(t+1500);
   if(c.mark||g.run.health!==hp)throw Error('Dash no protegió');
   g.dash.until=0;g.run.armor=50;g.hurtAt=0;c.impact(p.x,p.y,70,18,new WeakSet());
   if(g.run.armor>=50||g.run.health!==hp)throw Error('Defensas incorrectas');
   const e=g.spawn(0,-1,[p.x+120,p.y]),xp=g.run.xp,kills=g.run.kills,charge=g.ultimate.charge,hc=g.coins.ledger.pending;
   c.impact(e.sprite.x,e.sprite.y,45,999,new WeakSet());
   if(e.sprite.active||g.run.xp!==xp||g.run.kills!==kills||g.ultimate.charge!==charge||g.coins.ledger.pending!==hc+5)throw Error('Atribución ambiental incorrecta');
   s.safeUntil=0;
   for(let sector=0;sector<8&&!c.traffic;sector++){
    p.body.reset(sector*1536+792,792);p.body.updateFromGameObject();
    for(const orientation of [.1,.8])for(const direction of [.1,.8]){
     if(c.traffic)continue;const choices=[orientation,direction,.05,.1];
     c.trafficRandom=()=>choices.shift()??.1;c.planTraffic(sector,0,t+3000);
    }
   }
   if(!c.traffic||!c.sign.visible)throw Error('Vehículo sin ruta o sin aviso');
   const transit=c.traffic,vehicleTime=transit.starts+1000;
   if(transit.starts!==t+3000+2300)throw Error('Aviso de tránsito incorrecto');
   p.body.reset(transit.x+transit.dx*290,transit.y+transit.dy*290);
   g.run.armor=100;g.hurtAt=0;c.update(vehicleTime);
   const armorAfter=g.run.armor;
   if(armorAfter>=100||!transit.hit.has(p))throw Error('Tránsito sin impacto');
   g.hurtAt=0;c.update(vehicleTime);
   if(g.run.armor!==armorAfter)throw Error('Segundo impacto del mismo vehículo');
   c.update(c.traffic.starts+3500);if(!c.wreckUntil||!c.car.visible)throw Error('Accidente ausente');
   c.update(c.wreckUntil+1);if(c.car.visible)throw Error('Restos persistentes');
   const m=g.encounters,calendar=m.calendar;calendar.nextId=7;calendar.active=undefined;calendar.random=()=>.01;
   g.continuous.elapsed=2090000;m.update();
   g.continuous.elapsed+=10000;m.update();g.continuous.elapsed+=15000;m.update();
   const bosses=g.foes.filter(f=>f.boss>=0);if(bosses.length!==2)throw Error('Falta el encuentro doble');
   // Advancing directly to the end of the wreck can also schedule a strike.
   // Resolve that real warning before starting the double-encounter observation.
   const doubleAt=Math.max(t+30000,s.safeUntil+1,(c.mark?.at??0)+15000);
   s.changeAt=Infinity;s.sky='storm';s.trafficAt=Infinity;s.strikeAt=Infinity;
   if(c.mark)c.update(c.mark.at);

   p.body.reset(...target);s.strikeAt=doubleAt;c.update(doubleAt);
   if(!c.mark||s.safeUntil!==doubleAt+1500+9000)throw Error('Protección eléctrica del encuentro doble incorrecta '+JSON.stringify({doubleAt,mark:c.mark,safe:s.safeUntil,traffic:!!c.traffic,living:m.living,open:g.walkablePoint(p.x,p.y),escape:c.escape(p.x,p.y)}));
   p.body.reset(target[0]+150,target[1]);c.update(doubleAt+1500);
   const first=bosses[0],before=first.hp;c.impact(first.sprite.x,first.sprite.y,42,999,new WeakSet());
   if(first.hp<=0||first.hp<before*.96||first.hp===before)throw Error('Daño ambiental del jefe fuera del límite');
   first.hp=1;const priorXP=g.run.xp;c.impact(first.sprite.x,first.sprite.y,42,999,new WeakSet());
   if(m.living!==1||g.run.xp!==priorXP)throw Error('Derrota ambiental de jefe incorrecta');
   return {rain,storm,coins:g.coins.ledger.pending};
  });
  assert.equal(result.storm,'storm');assert.equal(result.rain,'rain');assert.deepEqual(errors,[]);
  console.log(JSON.stringify({realSeconds:(Date.now()-start)/1000,districts:[...new Set(points.map(p=>p.district))],maxActive:Math.max(...points.map(p=>p.active)),maxPrepared:Math.max(...points.map(p=>p.prepared)),maxEntities:Math.max(...points.map(p=>p.activeEntities)),maxFrameSampleMs:Math.max(...points.map(p=>p.frameMs)),maxLoadSampleMs:Math.max(...points.map(p=>p.loadMs)),last:points.at(-1),result}));
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
