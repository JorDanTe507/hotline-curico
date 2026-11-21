const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const url=process.env.GAME_URL||'http://127.0.0.1:5199/hotline-curico/';
(async()=>{
 const browsers=[];
 try{
  for(let i=0;i<2;i++)browsers.push(await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']}));
  const [h,c]=await Promise.all(browsers.map(b=>b.newPage()));
  const errors=[];
  for(const page of [h,c]){page.setDefaultTimeout(120000);page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)})}
  await Promise.all([h,c].map(async p=>{
   await p.goto(url);await p.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
   await p.evaluate(async()=>{window.net=await import(new URL('src/network/transport.ts',location.href))});
  }));
  await h.evaluate(()=>{hotlineGame.scene.getScene('Menu').scene.start('Game',{continuous:true,coop:true})});
  await h.waitForFunction(()=>!!(window.g=hotlineGame.scene.getScene('Game')).coop?.views);
  const initial=await h.evaluate(()=>{
   window.host=net.createHost(g);return {inv:host.invitation,id:host.participant,slot:host.slot};
  });
  async function link(credentials,resume){
   const offer=await h.evaluate(async()=>{window.pending=await host.offer();return pending.offer});
   const answer=await c.evaluate(async({offer,credentials,resume})=>{
    window.guest=await net.connectGuest(offer,credentials,resume);return guest.answer;
   },{offer,credentials,resume});
   await h.evaluate(answer=>pending.answer(answer),answer);
  }
  await link(initial.inv,false);
  await c.waitForFunction(()=>guest.state?.ack>0);
  const first=await c.evaluate(()=>guest.welcome);
  assert.equal(initial.slot,1);assert.equal(first.slot,2);assert.notEqual(initial.id,first.participant);assert.equal(first.host,initial.id);
  assert(await c.evaluate(()=>!hotlineGame.scene.isActive('Game')));
  // Select a traversable open stretch in the actual host world.
  const start=await h.evaluate(()=>{
   const a=g.coop.actor(2);
   for(let y=500;y<1100;y+=48)for(let x=500;x<1100;x+=48){
    if([0,24,48,72,96,120].every(offset=>g.walkablePoint(x+offset,y,1))){
     a.player.body.reset(x,y);return x;
    }
   }
   throw Error('Recorrido de prueba');
  });
  const j1start=await h.evaluate(x=>{g.player.body.reset(x,g.coop.actor(2).player.y);return g.player.x},start);
  await h.keyboard.down('d');
  await h.waitForFunction(x=>g.player.x>x+4,j1start);
  await h.keyboard.up('d');
  await c.keyboard.down('d');
  await c.waitForFunction(x=>guest.state.world.players[1].x>x+12,start);
  await h.waitForFunction(x=>g.coop.actor(2).player.x>x+12,start);
  await c.keyboard.up('d');
  await c.waitForFunction(()=>hotlineGame.scene.getScene('RemoteWorld').children.getByName('J2')?.visible);
  await h.evaluate(()=>{
   const a=g.coop.actor(2);a.guns=[];a.equipInitialWeapon(0);
   a.guns.push({...a.guns[0],id:1});
   window.ammo=a.guns[0].ammo;a.ultimate.charge=a.ultimate.requiredHits;
  });
  const area=await c.locator('canvas').first().boundingBox();
  await c.mouse.move(area.x+area.width*.8,area.y+area.height*.5);await c.mouse.down();
  await h.waitForFunction(()=>g.coop.actor(2).guns[0].ammo<ammo);
  await c.mouse.up();
  await c.mouse.move(area.x+area.width*.18,area.y+area.height*.45);
  await h.waitForFunction(()=>g.coop.actor(2).equipped.flipY);
  await c.keyboard.press('q');await h.waitForFunction(()=>g.coop.actor(2).active===1);
  await c.keyboard.press('q');await h.waitForFunction(()=>g.coop.actor(2).active===0);
  await c.keyboard.press('r');
  await h.waitForFunction(()=>g.coop.actor(2).reloadStartedAt>0);
  await c.keyboard.press('Space');await h.waitForFunction(()=>g.coop.actor(2).dash.readyAt>0);
  await c.keyboard.press('x');await c.waitForFunction(()=>guest.state.world.players[1].using);
  await h.evaluate(()=>{g.coop.actor(2).player.body.reset(6*1536+792,792)});
  await c.waitForFunction(()=>{
   const scene=hotlineGame.scene.getScene('RemoteWorld'),p=scene.children.getByName('J2');
   return p?.x>9000&&Math.abs(scene.cameras.main.midPoint.x-p.x)<10&&scene.cameras.main.width===1280&&
    guest.state.world.terrain.tiles.split('').some(t=>t!=='@');
  });
  assert(await h.evaluate(()=>g.worldStreamer.loaded.has('6,0')&&!g.coop.views.divided));
  await h.evaluate(()=>{g.coop.actor(2).player.body.reset(g.player.x+36,g.player.y)});
  await c.waitForFunction(()=>Math.abs(guest.state.world.players[1].x-guest.state.world.players[0].x)<100);
  await h.evaluate(()=>{
   const a=g.coop.actor(2);g.spawn(1,-1,[a.player.x+230,a.player.y+25]);
  });
  await c.waitForFunction(()=>guest.state.world.foes.some(f=>hotlineGame.scene.getScene('RemoteWorld').children.getByName('foe'+f.id)?.visible));
  assert(await h.evaluate(()=>new Set(g.foes).size===g.foes.length));
  await h.evaluate(()=>{g.coop.down(1)});
  await c.keyboard.down('e');await h.waitForFunction(()=>!g.coop.incapacitated(1));await c.keyboard.up('e');
  assert(await c.evaluate(()=>!hotlineGame.scene.isActive('Game')&&hotlineGame.scene.isActive('RemoteWorld')));
  assert(await h.evaluate(async()=>{try{await host.offer();return false}catch{return true}}));
  const ack=await c.evaluate(()=>{const n=guest.state.ack;guest.close();return n});
  await h.waitForFunction(()=>g.coop.partnerControl.status==='grace');
  // A used invite cannot create a new participant in the reserved slot.
  await link(initial.inv,false);
  await h.waitForFunction(()=>pending&&g.coop.partnerControl.status==='grace');
  await c.waitForFunction(()=>guest.closed);
  await link({session:first.session,key:first.resume},true);
  await c.waitForFunction(n=>guest.state?.ack>n,ack);
  assert.equal(await c.evaluate(()=>guest.welcome.participant),first.participant);
  assert(await h.evaluate(()=>g.coop.partnerControl.status==='controlled'&&g.coop.sectorPlayers().length===2));
  await c.evaluate(()=>guest.close());
  await h.waitForFunction(()=>g.coop.partnerControl.status==='grace');
  assert(await h.evaluate(async()=>{
   g.coop.observeControl('remote-client',false,performance.now()+60001);
   if(g.coop.partnerControl.status!=='grace-expired')return false;
   try{await host.offer();return false}catch{return true}
  }));
  assert.deepEqual(errors,[]);
  console.log('PASS dos procesos Edge independientes: Phaser anfitrión, entrada y estado, plaza única, pérdida y recuperación de identidad');
 }finally{await Promise.all(browsers.map(b=>b.close()))}
})().catch(e=>{console.error(e);process.exitCode=1});
