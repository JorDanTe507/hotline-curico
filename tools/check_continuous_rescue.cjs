const assert=require('node:assert/strict');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage(),errors=[];
  page.setDefaultTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  async function start(){
   await page.goto(process.env.GAME_URL||'http://127.0.0.1:5199/hotline-curico/');
   await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
   await page.evaluate(()=>{hotlineGame.scene.getScene('Menu').scene.start('Game',{continuous:true,coop:true,characterId:'cervela',partnerId:'nicolas'})});
   await page.waitForFunction(()=>!!(window.g=hotlineGame.scene.getScene('Game')).coop?.views);
  }
  await start();
  const revived=await page.evaluate(()=>{
   const c=g.coop,a=c.actor(2),r=a.run;
   g.player.body.reset(792,792);a.player.body.reset(820,792);
   const gear=a.guns[0],ammo=gear.ammo,charge=a.ultimate.charge,kits=r.medkits;
   c.down(2);
   g.clock+=1000;c.afterFrame(1000);
   if(c.state(2).progress!==0||c.sectorPlayers().length!==2)throw Error('proximidad/focos');
   g.keys.E.isDown=true;g.clock+=2000;c.afterFrame(2000);
   g.keys.E.isDown=false;g.clock+=1000;c.afterFrame(1000);
   if(Math.abs(c.state(2).progress-1250)>1e-7)throw Error('decaimiento '+c.state(2).progress);
   g.keys.E.isDown=true;g.clock+=1750;c.afterFrame(1750);g.keys.E.isDown=false;
   if(c.incapacitated(2)||a.rogue.invulnerableUntil!==g.clock+1500||r.health!==r.stats.maxHealth*.3)throw Error('reanimación '+JSON.stringify([c.state(2),r.health,r.stats.maxHealth,a.rogue.invulnerableUntil,g.clock]));
   const hp=r.health;a.damage(99,true);if(r.health!==hp)throw Error('protección');
   if(gear!==a.guns[0]||ammo!==gear.ammo||charge!==a.ultimate.charge||kits!==r.medkits)throw Error('inventario');
   c.down(1);const weapon=g.guns[0];g.run.medkits=2;g.run.adrenaline=1;g.run.armor=13;
   g.clock=c.state(1).until;c.afterFrame(1);
   const count=g.drops.length;c.afterFrame(1);c.down(1);
   if(c.sectorPlayers().length!==1||!c.state(1).dead||g.ended||count!==g.drops.length||
      g.drops.filter(d=>d.weapon===weapon).length!==1||!g.drops.some(d=>d.kind==='armor'&&d.id===13))throw Error('espectador/botín');
   c.down(2);return c.finishing&&g.ended;
  });
  assert(revived);
  await start();
  assert(await page.evaluate(()=>{
   const c=g.coop,j2=c.actor(2);
   g.player.body.reset(792,792);j2.player.body.reset(820,792);
   c.down(1);
   const pad={id:'rescate',connected:true,index:0,mapping:'standard',axes:[0,0,0,0],
    buttons:Array.from({length:16},(_,i)=>({pressed:i===0,value:i===0?1:0}))};
   c.input(2).poll([pad]);g.clock+=3000;c.afterFrame(3000);
   if(c.incapacitated(1))throw Error('rescate con mando');
   c.down(2);c.down(1);return c.finishing&&g.ended;
  }));
  assert.deepEqual(errors,[]);
  console.log('PASS rescate manual, protección, inventario, botín único, espectador y finales');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
