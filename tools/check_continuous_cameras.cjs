const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.pad={id:'split-test',index:0,connected:true,mapping:'standard',axes:[0,0,0,-1],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
   navigator.getGamepads=()=>[pad];
  });
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:5199/hotline-curico/');
  await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));
  for(const [continuous,coop] of [[true,true],[true,false],[false,true]]){
   await page.evaluate(data=>{hotlineGame.scene.getScene('Menu').scene.start('Game',data)},{continuous,coop,characterId:'cervela',partnerId:'nicolas'});
   await page.waitForFunction(()=>hotlineGame.scene.isActive('Game')&&!!(window.g=hotlineGame.scene.getScene('Game')).combatHud);
   if(continuous&&coop){
    await page.waitForFunction(()=>hotlineGame.scene.isActive('CoopHud')&&g.coop.views);
    await page.mouse.move(950,500);await page.waitForTimeout(100);
    await page.evaluate(()=>{
     window.a=g.coop.actor(2);window.v=g.coop.views;window.hud=hotlineGame.scene.getScene('CoopHud');
     if(v.divided||![g.player,a.player].every(p=>g.cameras.main.worldView.contains(p.x,p.y)))throw Error('Vista compartida');
     window.initialAngle=g.coop.input(1).angle(g,g.player);
     a.player.body.reset(6*1536+792,792);
    });
    await page.waitForFunction(()=>v.cameraFor(2).width===640&&g.worldStreamer.loaded.has('6,0'));
    await page.evaluate(()=>{
     const left=v.cameraFor(1),right=v.cameraFor(2);
     if(left.width!==640||right.x!==640||!left.worldView.contains(g.player.x,g.player.y)||!right.worldView.contains(a.player.x,a.player.y))throw Error('Encuadre dividido');
     if(Math.abs(g.coop.input(1).angle(g,g.player)-initialAngle)>.02||Math.abs(g.coop.input(2).angle(a,a.player)+Math.PI/2)>.01)throw Error('Cambio de apuntado');
     if(!hud.round.text.includes('HC COMPARTIDOS')||hud.panels.some((p,i)=>!p.header.text.includes('J'+(i+1))||!p.label.text.includes('CHALECO')||!p.label.text.includes('XP')||p.label.text.includes('HC')))throw Error('HUD cooperativo');
    });
    if(process.env.SPLIT_SCREENSHOT)await page.screenshot({path:process.env.SPLIT_SCREENSHOT});
    await page.mouse.move(430,450);await page.waitForTimeout(100);
    await page.evaluate(()=>{
     const p=g.input.activePointer,target=v.cameraFor(1).getWorldPoint(p.x,p.y);
     if(Math.abs(g.coop.input(1).angle(g,g.player)-Math.atan2(target.y-g.player.y,target.x-g.player.x))>.02)throw Error('Conversión de ratón');
     window.start=[g.player.x,a.player.x];pad.axes[0]=1;
    });
    await page.keyboard.down('d');await page.waitForTimeout(240);await page.keyboard.up('d');
    await page.evaluate(()=>{
     pad.axes[0]=0;
     if(g.player.x<=start[0]||a.player.x<=start[1])throw Error('Movimiento');
     pad.buttons[6]={value:1,pressed:true};
    });
    await page.keyboard.press('Space',{delay:60});
    await page.waitForFunction(()=>g.dash.readyAt>g.clock&&a.dash.readyAt>g.clock);
    await page.evaluate(()=>{
     pad.buttons[6]={value:0,pressed:false};
     window.fired=[0,0];
     for(const [i,actor] of [g,a].entries()){
      const use=actor.weaponCombat.use.bind(actor.weaponCombat);
      actor.weaponCombat.use=(...args)=>{fired[i]++;return use(...args)};
     }
     pad.buttons[7]={value:1,pressed:true};
    });
    await page.mouse.down();await page.waitForFunction(()=>fired.every(n=>n>0));await page.mouse.up();
    await page.evaluate(()=>{
     pad.buttons[7]={value:0,pressed:false};
     for(const actor of [g,a])actor.ultimate.charge=actor.ultimate.requiredHits;
     pad.buttons[3]={value:1,pressed:true};
    });
    await page.keyboard.press('x',{delay:60});
    await page.waitForFunction(()=>g.ultimate.active(g.clock)&&a.ultimate.active(g.clock));
    await page.evaluate(()=>{
     pad.buttons[3]={value:0,pressed:false};
     const margin=Math.max(g.player.displayHeight,a.player.displayHeight);
     a.player.body.reset(g.player.x+1280-3*margin,g.player.y);
    });
    await page.waitForTimeout(350);
    assert(await page.evaluate(()=>v.cameraFor(2).width===640));
    await page.evaluate(()=>{a.player.body.reset(g.player.x+70,g.player.y)});
    await page.waitForFunction(()=>!v.divided&&g.cameras.main.width===1280);
   }else{
    assert.equal(await page.evaluate(()=>g.cameras.cameras.length),1);
   }
   await page.evaluate(()=>{g.scene.start('Menu')});await page.waitForFunction(()=>hotlineGame.scene.isActive('Menu'));
  }
  assert.deepEqual(errors,[]);console.log('PASS pantalla compartida, separación, apuntado, movimiento, dash, HUD, reunión y aislamiento');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
