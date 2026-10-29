const assert=require('node:assert/strict');
let pw;try{pw=require('playwright')}catch{pw=require('C:/Users/JorDanTe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
(async()=>{const browser=await pw.chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5174');await page.waitForFunction(()=>window.hotlineGame?.scene.isActive('Menu'));await page.waitForTimeout(150);
 await page.evaluate(async()=>{const {MusicManager}=await import('/src/systems/MusicManager.ts');window.music=MusicManager.get(window.hotlineGame)});
 await page.mouse.click(1200,610);await page.waitForFunction(()=>window.music.currentTrack==='music-neon-noir');
 const tap=async(key)=>{await page.keyboard.down(key);await page.waitForTimeout(65);await page.keyboard.up(key);await page.waitForTimeout(20)};
 const playing=()=>page.evaluate(()=>window.hotlineGame.sound.getAll().filter(s=>s.key.startsWith('music-')&&s.isPlaying).map(s=>s.key));
 assert.deepEqual(await playing(),['music-neon-noir']);
 assert.ok(await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Menu'),bg=s.children.list.find(o=>o.texture?.key==='menu-background');return bg.scaleX===bg.scaleY&&bg.displayWidth>=1280&&bg.displayHeight>=720}));
 await page.waitForTimeout(350);await page.screenshot({path:'menu-v03.png'});
 await page.mouse.click(930,544);await page.waitForTimeout(180);
 const old=await page.evaluate(()=>window.music.volume);await page.mouse.click(810,480);await page.waitForTimeout(80);assert.ok(await page.evaluate(old=>window.music.volume<old,old));
 const fx=await page.evaluate(async()=>{const {AudioSystem}=await import('/src/systems/AudioSystem.ts');return AudioSystem.volume});await page.mouse.click(1010,480);await page.waitForTimeout(80);assert.equal(await page.evaluate(async()=>{const {AudioSystem}=await import('/src/systems/AudioSystem.ts');return AudioSystem.volume}),fx);
 await page.mouse.click(180,637);await page.waitForTimeout(150);await page.mouse.click(930,480);await page.waitForTimeout(150);assert.deepEqual(await playing(),[]);
 await page.keyboard.press('Enter');await page.waitForTimeout(70);await page.keyboard.press('Enter');await page.waitForFunction(()=>window.hotlineGame.scene.isActive('Game'));
 assert.deepEqual(await playing(),['music-neon-combat']);
 // Keep enemies away while evaluating movement in a clear room.
 await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');for(const e of s.foes){e.sprite.setPosition(1800,1200);e.awake=false;e.next=Infinity}s.player.setPosition(300,650)});
 await page.keyboard.down('d');await page.waitForTimeout(65);const speed=await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').player.body.velocity.length());await page.keyboard.up('d');assert.ok(Math.abs(speed-253)<.01);
 const vectors=[['d',1,0],['a',-1,0],['w',0,-1],['s',0,1],['w+d',1,-1],['w+a',-1,-1],['s+d',1,1],['s+a',-1,1]];
 for(const [keys,x,y] of vectors){
  await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');s.player.setPosition(300,650);s.clock+=2100;s.hurtAt=0});
  for(const k of keys.split('+'))await page.keyboard.down(k);
  await page.keyboard.down('Space');await page.waitForTimeout(65);
  const dash=await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');const before=s.run.health;s.damage(10);return {active:s.dash.active(s.clock),dir:s.dash.direction,speed:s.player.body.velocity.length(),immune:s.run.health===before}});
  assert.ok(dash.active);assert.ok(Math.abs(dash.speed-759)<.1);assert.ok(dash.immune);assert.equal(Math.sign(dash.dir.x),x);assert.equal(Math.sign(dash.dir.y),y);
  await page.keyboard.up('Space');for(const k of keys.split('+'))await page.keyboard.up(k);await page.waitForTimeout(165);
  assert.ok(await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');const before=s.run.health;s.damage(1);return !s.dash.active(s.clock)&&s.run.health===before-1}));
 }
 // Last direction, cooldown, and fire suppression.
 await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');s.clock+=2100;s.player.setPosition(300,650);s.dash.last={x:1,y:0};s.guns[0].ammo=10});
 await page.keyboard.down('Space');await page.mouse.move(800,650);await page.mouse.down();await page.waitForTimeout(75);await page.mouse.up();await page.keyboard.up('Space');assert.equal(await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').guns[0].ammo),10);
 const until=await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').dash.until);await tap('Space');await page.waitForTimeout(65);assert.equal(await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').dash.until),until);
 await page.waitForTimeout(130);
 // Vertical wall x=480 at row13; body must stay on its left throughout a dash.
 await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');s.clock+=2100;s.player.setPosition(435,590)});
 await page.keyboard.down('d');await page.keyboard.down('Space');await page.waitForTimeout(240);await page.keyboard.up('Space');await page.keyboard.up('d');assert.ok(await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').player.body.right<=480.01),'dash contra pared');
 // Furniture at x144..240/y576..624, and left map boundary.
 await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');s.clock+=2100;s.player.setPosition(270,590)});await page.keyboard.down('a');await page.keyboard.down('Space');await page.waitForTimeout(230);await page.keyboard.up('Space');await page.keyboard.up('a');assert.ok(await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').player.body.left>=239.99),'dash contra mobiliario');
 await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');s.clock+=2100;s.player.setPosition(90,750)});await page.keyboard.down('a');await page.keyboard.down('Space');await page.waitForTimeout(230);await page.keyboard.up('Space');await page.keyboard.up('a');assert.ok(await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').player.body.left>=47.99),'dash contra límite');
 await tap('Escape');await page.waitForTimeout(60);const clock=await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').clock);await tap('Space');await page.waitForTimeout(70);assert.equal(await page.evaluate(()=>window.hotlineGame.scene.getScene('Game').clock),clock);await tap('Escape');await page.waitForTimeout(65);
 // Round changes and bosses keep the same music object.
 assert.ok(await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game'),track=window.music.current;for(const e of [...s.foes])s.hit(e,1e6);s.run.round=4;s.startWave();return window.music.current===track&&s.foes.some(e=>e.boss===0)}));
 for(let i=0;i<6;i++){await page.keyboard.press('Enter');await page.waitForTimeout(60)}
 // Death fade, then four retries wrap the playlist. Reset dash, time, health and inventory.
 for(const expected of ['combat-loop','underground-thriller','neon-combat','combat-loop']){
  await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');s.dash.until=0;s.hurtAt=0;s.damage(10000)});await page.waitForTimeout(330);assert.deepEqual(await playing(),[]);
  await page.mouse.click(500,505);await page.waitForTimeout(180);assert.deepEqual(await playing(),[`music-${expected}`]);
  assert.ok(await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');return s.run.health===100&&s.run.round===1&&s.guns.length===1&&s.dash.readyAt===0&&!s.dash.active(s.clock)&&s.player.x===240&&s.player.y===320}));
 }
 await page.evaluate(()=>{const s=window.hotlineGame.scene.getScene('Game');s.hurtAt=0;s.damage(10000)});await page.waitForTimeout(100);await page.mouse.click(500,568);await page.waitForTimeout(150);assert.deepEqual(await playing(),['music-neon-noir']);
 await page.mouse.click(930,480);await page.waitForTimeout(150);await page.keyboard.press('Enter');await page.waitForTimeout(60);await page.keyboard.press('Enter');await page.waitForTimeout(180);assert.deepEqual(await playing(),['music-neon-combat']);
 assert.deepEqual(errors,[]);console.log('PASS V0.3: menú proporcionado, volúmenes independientes, música menú/intro/combate y rotación sin solapamientos, continuidad en ronda/jefe, velocidad253, ocho dashes normalizados, invulnerabilidad temporal, cooldown, bloqueo de disparo, paredes/mobiliario/límites, pausa y cuatro reinicios. Sin errores JS.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
