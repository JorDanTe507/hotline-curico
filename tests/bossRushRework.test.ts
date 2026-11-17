import {test} from 'node:test';
import assert from 'node:assert/strict';
import {applyHeadshot,rollHeadshot,bombardmentTargets,turnToward,BOSS_COMBAT as C} from '../src/bossRush/combatRules';
import {rushTuning} from '../src/bossRush/balance';
import {PowerCut,CUT} from '../src/bossRush/PowerCut';

test('headshots usan una tirada independiente con umbral exacto de 20%',()=>{
 const rolls=[.19,.01,.99,.20,.99,.01,.99];
 let count=0;
 assert.deepEqual(rolls.map(()=>rollHeadshot(()=>rolls[count++])),[true,true,false,false,false,true,false]);
 assert.equal(count,rolls.length);
 for(let i=0;i<100;i++)assert.equal(rollHeadshot(()=>i/100),i<20);
});

test('headshot protegido fija exactamente 1 HP, incluso con escudos y vida aumentada',()=>{
 for(const health of [1,50,100,200,500,25000]){
  for(const armor of [.1,1,50,300]){
   const run={health,armor,temporaryArmor:1000};
   assert.equal(applyHeadshot(run),true);
   assert.deepEqual(run,{health:1,armor:0,temporaryArmor:0});
  }
 }
});
test('un escudo temporal no equivale a chaleco activo y el resultado sin chaleco es letal',()=>{
 for(const health of [1,100,500,1e8]){
  const run={health,armor:0,temporaryArmor:1e9};
  assert.equal(applyHeadshot(run),false);
  assert.equal(run.health,0);
 }
});

test('el giro limitado no salta de orientación y respeta el cruce de PI',()=>{
 assert.equal(turnToward(0,Math.PI,0.1),0.1);
 assert(Math.abs(turnToward(Math.PI-.02,-Math.PI+.02,.1)-Math.PI-.02)<1e-8);
});

test('las tres oleadas reservan un refugio seguro con explosiones densas',()=>{
 const points=Array.from({length:400},(_,i)=>({x:(i%20)*48+24,y:Math.floor(i/20)*48+24}));
 const safe={x:312,y:312};
 for(let wave=0;wave<C.bombardment.waves;wave++){
  const targets=bombardmentTargets(points,safe,wave);
  assert.equal(targets.length,C.bombardment.impacts);
  assert(targets.every(p=>Math.hypot(p.x-safe.x,p.y-safe.y)>C.bombardment.radius+C.bombardment.safeRadius));
  assert(targets.every((p,i)=>targets.slice(i+1).every(q=>Math.hypot(p.x-q.x,p.y-q.y)>C.bombardment.radius*.85)));
 }
});

test('un apagón no expira por tiempo y cada generador puede fallar y acertar',()=>{
 const image=()=>({frame:'',setFrame(frame:string){this.frame=frame;return this}});
 const generators=Array.from({length:3},image);
 const cut=Object.create(PowerCut.prototype) as any;
 const scene={clock:100,player:{x:264,y:312},lineClear:()=>true};
 Object.assign(cut,{s:scene,until:Infinity,next:0,retry:0,shade:{setFillStyle(){}},machines:generators,emitters:[],messageUntil:0});
 scene.clock=1e9;
 cut.update(true);assert.equal(cut.dark,true);
 for(let i=0;i<3;i++){
  const coords=[[264,312],[1176,360],[696,648]][i];
  Object.assign(scene.player,{x:coords[0],y:coords[1]});
  cut.until=Infinity;cut.retry=0;
  cut.interact(()=>CUT.success[i]);assert.equal(cut.dark,true);
  cut.interact(()=>0);assert.equal(cut.dark,true);
  scene.clock+=CUT.retry;cut.interact(()=>0);assert.equal(cut.dark,false);
 }
 cut.until=Infinity;cut.update(false);assert.equal(cut.dark,false);
});

test('Wesker y los límites de dificultad infinita conservan sus multiplicadores',()=>{
 assert.equal(rushTuning(0,6).hp/rushTuning(0,1).hp,1.35);
 for(let id=0;id<6;id++){
  const limit=rushTuning(id,10);
  assert.deepEqual(rushTuning(id,10000),limit);
  assert.equal(rushTuning(id,10,true).hp,limit.hp*.92);
  assert.equal(rushTuning(id,10,true).damage,limit.damage*.90);
 }
 assert.deepEqual(rushTuning(5,1),{hp:1.15,damage:1.16,speed:1.24,recovery:.80,warning:.94,reload:.80});
});
