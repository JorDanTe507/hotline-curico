const assert=require('node:assert/strict');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage(),errors=[];
  page.setDefaultTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.pad={id:'local-test',connected:true,index:0,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
   navigator.getGamepads=()=>pad.connected?[pad]:[];
  });
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:5199/hotline-curico/');
  await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
  async function start(){
   await page.evaluate(()=>{hotlineGame.scene.getScene('Menu').scene.start('Game',{continuous:true,coop:true})});
   await page.waitForFunction(()=>hotlineGame.scene.isActive('Game')&&!!(window.g=hotlineGame.scene.getScene('Game')).coop?.partnerControl);
  }
  await start();
  await page.evaluate(()=>{pad.connected=false});
  await page.waitForFunction(()=>g.coop.partnerControl.status==='grace');
  assert(await page.evaluate(()=>{
   const c=g.coop,a=c.actor(2),hp=a.run.health;
   a.run.armor=0;a.damage(5,true);
   return a.run.health<hp&&!a.player.body.moves&&c.livingActors().includes(a)&&c.sectorPlayers().length===2;
  }));
  await page.evaluate(()=>{pad.connected=true});
  await page.waitForFunction(()=>g.coop.partnerControl.status==='controlled');
  assert(await page.evaluate(()=>{
   const c=g.coop,a=c.actor(2),start=performance.now()+3000,gear=a.guns[0];
   const joint=g.economy.wallet;
   joint.credit(20);
   const originalTotal=joint.balance;
   g.player.body.reset(792,792);a.player.body.reset(820,792);
   c.down(1);pad.buttons[0].pressed=true;c.input(2).poll([pad]);
   g.clock+=2000;c.afterFrame(2000);
   const before=c.state(1).progress;
   c.observePartnerPad(false,start-2000);
   g.clock+=1000;c.afterFrame(1000);
   if(Math.abs(before-2000)>1e-6||Math.abs(c.state(1).progress-1250)>1e-6)throw Error('interrupción');
   c.observePartnerPad(true,start-1000);g.clock+=1750;c.afterFrame(1750);
   if(c.incapacitated(1))throw Error('retomar rescate');
   pad.buttons[0].pressed=false;c.input(2).poll([pad]);
   c.down(2);const deadline=c.state(2).until;
   c.observePartnerPad(false,start);
   c.observePartnerPad(true,start+9000);
   if(c.state(2).until!==deadline||a.guns[0]!==gear||a.run.health!==0)return false;
   c.observePartnerPad(false,start+10000);
   a.run.pendingLevels=1;g.pause();
   c.observePartnerPad(false,start+70000);
   if(!g.paused||c.partnerControl.status!=='grace-expired'||c.state(2).dead||c.state(2).until||
      c.sectorPlayers().length!==1||g.ended||g.drops.some(d=>d.weapon===gear))return false;
   c.observePartnerPad(true,start+80000);
   g.pause();
   const solo=g.economy.wallet,remaining=solo.balance;
   if(joint.balance!==originalTotal||a.run.pendingLevels!==0||solo.owners.length!==1||solo.owners[0]!==g.character.id)return false;
   solo.credit(7);
   return c.livingActors().length===1&&solo.balance===remaining+7&&joint.balance===originalTotal+7;
  }));
  await page.evaluate(()=>{g.scene.start('Menu')});await page.waitForFunction(()=>hotlineGame.scene.isActive('Menu'));
  await start();
  assert(await page.evaluate(()=>{
   const c=g.coop,t=performance.now();c.down(2);c.observePartnerPad(false,t);
   g.clock=c.state(2).until;c.observePartnerPad(true,t+60000);
   return c.state(2).dead&&c.partnerControl.status==='permanent-death';
  }));
  assert.deepEqual(errors,[]);
  console.log('PASS mando emulado, vulnerabilidad, recuperación, pausa, abandono con compañero vivo y precedencia de muerte');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
