const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const start=Date.now(),browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const p=await browser.newPage(),results=[],errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.GAME_URL||'http://127.0.0.1:5198/hotline-curico/');
  await p.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
  for(let run=0;run<3;run++){
   await p.evaluate(()=>{hotlineGame.scene.getScene('Menu').scene.start('Game',{continuous:true,characterId:'cervela'})});
   await p.waitForFunction(()=>hotlineGame.scene.isActive('Game')&&!!(window.g=hotlineGame.scene.getScene('Game')).continuousCity);
   results.push(await p.evaluate(()=>{
    const c=g.continuousCity,cl=c.climate,biomes=new Set();
    let now=0,blocked=0,indoor=0;
    cl.changeAt=0;c.update(now);cl.changeAt=0;c.update(now);
    if(cl.sky!=='storm')throw Error('Tormenta ausente');
    c.weatherRandom=()=>.5;
    const attempt=(x,y,expected)=>{
     g.player.body.reset(x,y);cl.strikeAt=now;c.update(now);
     if(!!c.mark!==expected)throw Error(JSON.stringify({seed:g.run.seed,x,y,expected,inside:g.city.inside(x,y),open:g.walkablePoint(x,y),escape:c.escape(x,y),safeUntil:cl.safeUntil,now}));
     if(expected){
      if(c.mark.at!==now+1500)throw Error('Aviso incorrecto');
      g.player.body.reset(x+160,y);c.update(now+1499);
      if(!c.mark)throw Error('Aviso truncado');
      c.update(now+1500);if(c.mark)throw Error('Falta impacto');
     }
    };
    for(let i=0;i<100&&biomes.size<3;i++){
     const chunk=g.worldModel.chunk(i,0);
     if(biomes.has(chunk.biome))continue;
     const ox=i*1536;
     const building=chunk.buildings[0];
     if(building){attempt(ox+(building.x+1.5)*48,(building.y+1.5)*48,false);indoor++}
     const wall=chunk.cells.findIndex(row=>row.some(v=>v!==0));
     if(wall>=0){attempt(ox+(chunk.cells[wall].findIndex(v=>v!==0)+.5)*48,(wall+.5)*48,false);blocked++}
     let target;
     for(let row=14;row<=17&&!target;row++)for(let col=14;col<=17;col++){
      const x=ox+(col+.5)*48,y=(row+.5)*48;
      if(!g.city.inside(x,y)&&g.walkablePoint(x,y)&&c.escape(x,y)){target=[x,y];break}
     }
     if(!target)throw Error('Cruce bloqueado');const [x,y]=target;attempt(x,y,true);
     now+=1600;attempt(x,y,false);now+=5000;biomes.add(chunk.biome);
    }
    if(biomes.size!==3||!indoor||!blocked)throw Error('Cobertura espacial insuficiente');
    return {seed:g.run.seed,biomes:[...biomes],blocked,indoor,bodies:g.physics.world.bodies.size,timers:g.time._active.length,listeners:g.events.eventNames().reduce((n,e)=>n+g.events.listenerCount(e),0)};
   }));
   await p.evaluate(()=>{g.damage(1e6,true)});
   await p.waitForFunction(()=>g.deathSequence.phase==='screen');
   await p.evaluate(()=>{g.deathSequence.navigate(true)});
   await p.waitForFunction(()=>!g.ended&&g.scene.isActive()&&g.continuous.elapsed<1500);
   await p.evaluate(()=>{g.finish()});await p.waitForFunction(()=>g.deathSequence.phase==='screen');
   await p.evaluate(()=>{g.deathSequence.navigate(false)});await p.waitForFunction(()=>hotlineGame.scene.isActive('Menu'));
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({seconds:(Date.now()-start)/1000,results}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
