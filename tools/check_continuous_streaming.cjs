const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:5198/hotline-curico/');
  await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
  await page.evaluate(()=>{hotlineGame.scene.getScene('Menu').scene.start('Game',{continuous:true,characterId:'jordan'})});
  await page.waitForFunction(()=>!!(window.g=hotlineGame.scene.getScene('Game')).continuousCity);
  await page.evaluate(()=>{
   window.initialDirector=g.continuous;window.frames=[];window.sectors=new Set();window.loads=[];window.memory=[];
   const stream=g.worldStreamer,load=stream.load.bind(stream);
   stream.load=(x,y)=>{const t=performance.now();load(x,y);loads.push(performance.now()-t)};
   for(const [object,method,label] of [[g.navigation.routes,'route','navigation'],[stream,'streamContinuous','activation']]){
    const original=object[method].bind(object);
    object[method]=(...args)=>{const t=performance.now(),result=original(...args);stream.recordPhase(label,t);return result};
   }
   let last=performance.now();
   g.events.on('postupdate',()=>{
    const now=performance.now();frames.push(now-last);last=now;
    sectors.add(Math.floor(g.player.x/1536)+','+Math.floor(g.player.y/1536));
    if(frames.length%60===0)memory.push({...g.continuousCity.diagnostics(),x:g.player.x,bodies:g.physics.world.bodies.size,staticBodies:g.physics.world.staticBodies.size,timers:g.time._active.length,listeners:g.events.eventNames().reduce((n,e)=>n+g.events.listenerCount(e),0)});
   });
  });
  const heavy=process.env.STREAM_STRESS==='1';
  if(heavy)await page.evaluate(()=>{
   g.run.armor=5000; // Sustained-load fixture: absorb hits throughout the route.
   g.continuous.elapsed=290000;g.encounters.update();
   g.continuous.elapsed=300000;g.encounters.update();
   if(!g.encounters.living)throw Error('Falta jefe de estrés');
   const climate=g.continuousCity.climate;
   climate.sky='storm';climate.changeAt=500000;climate.strikeAt=305000;
  });
  const start=Date.now();
  for(const key of ['d','a']){
   await page.keyboard.down(key);
   for(let n=0;n<(heavy?22:12);n++){await page.waitForTimeout(1700);assert(await page.evaluate(()=>!g.ended&&g.continuous===initialDirector));await page.keyboard.press('Space',{delay:35});if(heavy)await page.mouse.click(900,360)}
   await page.keyboard.up(key);
  }
  const data=await page.evaluate(()=>({frames,loads,sectors:[...sectors],memory,phase:g.worldStreamer.phaseMs,ended:g.ended}));
  const stats=a=>{const v=a.slice().sort((a,b)=>a-b);return [0.5,.95,.99,1].map(p=>v[Math.ceil(v.length*p)-1])};
  const secs=(Date.now()-start)/1000;
  console.log(JSON.stringify({secs,fps:data.frames.length/secs,frames:stats(data.frames),loads:stats(data.loads),phase:Object.fromEntries(Object.entries(data.phase).map(([k,v])=>[k,stats(v)])),sectors:data.sectors,memory:data.memory,errors,ended:data.ended}));
  assert.deepEqual(errors,[]);assert(data.sectors.length>=2);assert(!data.ended);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});


