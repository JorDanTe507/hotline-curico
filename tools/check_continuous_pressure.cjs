const assert=require('node:assert/strict');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:5199/hotline-curico/');
  await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
  await page.evaluate(()=>{hotlineGame.scene.getScene('Menu').scene.start('Game',{continuous:true,coop:true,characterId:'cervela',partnerId:'nicolas'})});
  await page.waitForFunction(()=>!!(window.g=hotlineGame.scene.getScene('Game')).coop?.pressure);
  await page.evaluate(()=>{window.j2=g.coop.actor(2);j2.player.body.reset(6*1536+792,792)});
  await page.waitForFunction(()=>g.coop.views.cameraFor(2).width===640&&g.worldStreamer.pending===0&&g.worldStreamer.loaded.has('6,0'));
  const counts=await page.evaluate(()=>{
   const initial=new Set(g.foes),list=[g,j2];
   const director=g.continuous;
   for(let n=0;n<40;n++){
    g.updateContinuous(1600);
    if(g.foes.length>director.population)throw Error('Sobrepresupuesto');
   }
   const counts=[0,0];
   for(const e of g.foes){
    const p=e.sprite;
    if(!initial.has(e)&&list.some(a=>g.coop.views.cameraFor(a.playerId).worldView.contains(p.x,p.y)))throw Error('Aparición visible');
    const near=list.map(a=>Math.hypot(a.player.x-p.x,a.player.y-p.y));
    counts[near[0]<=near[1]?0:1]++;
   }
   if(Math.min(...counts)<1||Math.abs(counts[0]-counts[1])>1||g.foes.length!==director.population)throw Error('Distribución '+counts);
   const m=g.encounters;
   director.elapsed=290000;m.update();director.elapsed=300000;
   for(let i=0;i<20&&!m.living;i++){m.update();director.elapsed+=500}
   window.boss=g.foes.find(f=>f.boss>=0);
   if(!boss||m.living!==1)throw Error('Calendario');
   window.body=boss.sprite.body;window.hp=boss.hp;
   const foe=g.foes.find(e=>e.boss<0),anchor=g.player;
   foe.sprite.body.reset(792,792);anchor.body.reset(720,792);j2.player.body.reset(870,792);
   const pressure=g.coop.pressure,choose=()=>pressure.target(foe).playerId;
   g.clock+=500;const first=choose();
   for(let i=0;i<6;i++){anchor.body.reset(792+(i%2?70:-70),792);j2.player.body.reset(792+(i%2?-68:68),792);g.clock+=500;if(choose()!==first)throw Error('Oscilación')}
   const current=g.coop.actor(first),other=g.coop.actor(first===1?2:1);
   current.player.body.reset(792+5*1536,792);other.player.body.reset(850,792);
   g.clock+=500;if(choose()!==other.playerId)throw Error('Objetivo lejano retenido');
   const state=g.coop.state(other.playerId);state.until=g.clock+45000;
   if(choose()!==first)throw Error('Objetivo incapacitado');
   state.until=0;anchor.body.reset(792,792);j2.player.body.reset(842,792);
   return counts;
  });
  await page.waitForFunction(()=>!g.coop.views.divided&&!g.worldStreamer.loaded.has('6,0'));
  assert(await page.evaluate(()=>g.encounters.living===1&&g.foes.filter(e=>e===boss).length===1&&boss.hp===hp&&boss.sprite.body===body&&new Set(g.foes).size===g.foes.length));
  assert.deepEqual(errors,[]);console.log('PASS población por zona',counts,'presupuesto, visibilidad, cambios de objetivo y jefe único');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
