const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.GAME_URL || 'http://127.0.0.1:5198/hotline-curico/');
  for (const coop of [true,false,true]) {
   await page.waitForFunction(() => window.hotlineGame?.scene.isActive('Menu'));
   await page.evaluate(coop => {
    hotlineGame.scene.getScene('Menu').scene.start('Game',{continuous:true,coop,characterId:'jordan',partnerId:'nicolas'});
   },coop);
   await page.waitForFunction(() => hotlineGame.scene.isActive('Game') && hotlineGame.scene.getScene('Game').continuousCity);
   const actual = await page.evaluate(() => {
    const game = hotlineGame.scene.getScene('Game');
    const actors = game.coop ? [game,game.coop.actor(2)] : [game];
    const initial = actors.map(actor => actor.guns[0]);
    for (const actor of actors) actor.equipInitialWeapon(0);
    return {
     characters:actors.map(actor => actor.character.id),
     count:actors.map(actor => actor.guns.length),
     intact:actors.every((actor,i) => initial[i] && actor.guns[0]===initial[i]),
     separate:new Set(initial).size===actors.length && new Set(actors.map(a=>a.run)).size===actors.length,
     rounds:game.run.round
    };
   });
   assert.deepEqual(actual,{characters:coop?['jordan','nicolas']:['jordan'],count:coop?[1,1]:[1],intact:true,separate:true,rounds:0});
   if(coop){
    await page.evaluate(()=>{
     const g=hotlineGame.scene.getScene('Game'),stream=g.worldStreamer;
     const j2=g.coop.actor(2).player;
     window.sectorTest={origin:stream.loaded.get('0,0'),j2};
     j2.body.reset(6*1536+792,792);
    });
    await page.waitForFunction(()=>{
     const g=hotlineGame.scene.getScene('Game');
     return g.worldStreamer.loaded.has('6,0')&&g.worldStreamer.pending===0;
    });
    await page.evaluate(()=>{
     const g=hotlineGame.scene.getScene('Game'),s=g.worldStreamer,t=window.sectorTest;
     for(const key of ['0,0','6,0']){
      const sector=s.loaded.get(key);
      if(!sector.map.getLayer('floor-'+key)||!sector.bodies.length||
         !sector.bodies.every(b=>g.walls.contains(b)&&g.physics.world.staticBodies.contains(b.body)))throw Error('Suelo o colisión ausente en '+key);
     }
     if(s.loaded.get('0,0')!==t.origin||t.j2.x<6*1536)throw Error('Separación o identidad perdida');
     t.boss=g.spawnContinuousBoss(0,[6*1536+600,792]);t.body=t.boss.sprite.body;
     const drop=g.addDrop(6*1536+1050,792,'ammo',0);
     t.dropX=drop.sprite.x;t.dropY=drop.sprite.y;
     t.j2.body.reset(842,792);
    });
    await page.waitForFunction(()=>!hotlineGame.scene.getScene('Game').worldStreamer.loaded.has('6,0'));
    await page.evaluate(()=>{
     const g=hotlineGame.scene.getScene('Game'),t=window.sectorTest;
     if(g.worldStreamer.loaded.get('0,0')!==t.origin||
        g.children.list.filter(o=>o.layer?.name==='floor-0,0').length!==1)throw Error('Sector compartido duplicado');
     if(!t.body.enable||t.boss.sprite.body!==t.body||g.foes.filter(f=>f===t.boss).length!==1)throw Error('Jefe perdido al descargar');
     t.j2.body.reset(6*1536+792,792);
    });
    await page.waitForFunction(()=>hotlineGame.scene.getScene('Game').worldStreamer.loaded.has('6,0'));
    assert.equal(await page.evaluate(()=>{
     const g=hotlineGame.scene.getScene('Game'),t=window.sectorTest;
     return g.drops.filter(d=>d.kind==='ammo'&&d.sprite.x===t.dropX&&d.sprite.y===t.dropY).length;
    }),1);
   }
   await page.evaluate(() => {hotlineGame.scene.getScene('Game').scene.start('Menu')});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS Continua J1/J2, individual y nuevo cooperativo con instancias independientes');
 } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
