import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newEndless, selectEncounter, doubleChance, endlessScale, compareEndless, endlessRecords, saveEndless, type EndlessResult} from '../src/bossRush/endless';
import {rushTuning, rushRewards, rushWeights} from '../src/bossRush/balance';
import {cellPoint, partnerSpawn, rushMap} from '../src/bossRush/Arenas';
import {CARD_LIMITS, rushOffer, validRest} from '../src/bossRush/state';
import {RUSH_ACHIEVEMENTS} from '../src/bossRush/achievementCatalog';
import {AchievementService} from '../src/systems/Achievements';
import {WEAPONS} from '../src/weapons/arsenal';

test('selección sin repetición inmediata, Wesker siempre solo y probabilidad progresiva', () => {
  let seed=507;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
  const run=newEndless(), seen=new Set<number>();
  for(let i=0;i<300;i++){
    const next=selectEncounter(run,random);
    assert(!next.some(id=>run.history.at(-1)?.includes(id)));
    assert(next.length===1||!next.includes(5));
    if(i<6)assert.equal(next.length,1);
    next.forEach(id=>seen.add(id));
    run.history=[...run.history,next].slice(-8);
    run.cleared++;
  }
  assert.equal(seen.size,6);
  assert.deepEqual([5,6,9,12].map(doubleChance),[0,.18,.35,.55]);
});

test('la segunda aparición tiene espacio en cada arena admitida', () => {
  for(let i=0;i<5;i++){
    const map=rushMap(i,false)!, layout=map.layout!;
    const point=partnerSpawn(map.grid,layout.boss,map.start,layout.barrels)!;
    assert(point);
    assert(Math.hypot(point.x-map.start.x,point.y-map.start.y)>260);
    const first=cellPoint(layout.boss);
    assert(Math.hypot(point.x-first.x,point.y-first.y)>170);
  }
});

test('escalado de Rush acotado, legendarias elegibles y una recompensa compartida', () => {
  assert.deepEqual([1,3,5,8,10,80].map(endlessScale),[[1,1,1],[1.15,1.1,1.08],[1.30,1.20,1.15],[1.45,1.30,1.20],[1.50,1.35,1.25],[1.50,1.35,1.25]]);
  for(let i=0;i<6;i++)assert(rushTuning(i).hp>1&&rushTuning(i).speed>1&&rushTuning(i).damage>1);
  const pool=rushWeights('early',true);
  assert.deepEqual(pool.filter(w=>WEAPONS[w.id].rarity==='legendary').map(w=>w.id).sort((a,b)=>a-b),WEAPONS.flatMap((w,i)=>w.rarity==='legendary'?[i]:[]));
  assert(pool.every(w=>w.weight>0));
  assert.equal(rushRewards('double',()=>0).filter(r=>r.kind==='gun').length,1);
  assert.equal(rushRewards('double',()=>.9).filter(r=>r.kind==='gun').length,0);
});

test('oferta sin cartas al máximo y clasificación con todos los desempates', () => {
  const full=Object.entries(CARD_LIMITS).flatMap(([id,n])=>Array(n).fill(id));
  assert.deepEqual(rushOffer(full),[]);
  const base:EndlessResult={...newEndless(),cleared:8,kills:8,character:'jordan',reason:'retirada',date:'2026-11-09',bestCycle:3,damage:45,falls:0,combatMs:500};
  const rows=[{...base,cleared:7,kills:7},{...base,damage:46},{...base,falls:1},{...base,combatMs:700}];
  assert(rows.every(row=>compareEndless(base,row)<0));
  const disk=new Map<string,string>();
  const storage={getItem:(k:string)=>disk.get(k)??null,setItem:(k:string,v:string)=>{disk.set(k,v)}} as Storage;
  rows.forEach(row=>saveEndless(row,storage));saveEndless(base,storage);
  assert.deepEqual(endlessRecords(storage)[0],base);
  assert(!validRest({endless:{...newEndless(),cleared:4}}));
});

test('los 15 logros conservan migración, condiciones, maestro e iconos propios', () => {
  const disk=new Map([['hotline-achievements-v1',JSON.stringify({unlocked:{kill:'2026-01-01'},kills:42})]]);
  const store={getItem:(k:string)=>disk.get(k)??null,setItem:(k:string,v:string)=>{disk.set(k,v)}};
  const svc=new AchievementService(store,()=>false), flags={damage:5,rifleHit:true,cureUsed:true,campaign:false,falls:0,cleared:0,clean:0};
  svc.event({type:'rushVictory',rush:{...flags,bosses:[3]}});
  assert(!svc.data.unlocked.br_no_damage&&!svc.data.unlocked.br_sniper_dodge);
  svc.event({type:'rushVictory',rush:{...flags,bosses:[3,2],damage:0,rifleHit:false}});
  for(const character of ['jordan','cervela','nicolas'])svc.event({type:'rushVictory',character,rush:{...flags,bosses:[5],cureUsed:false,campaign:true}});
  svc.event({type:'rushVictory',rush:{...flags,bosses:[1],cleared:99,clean:3}});
  assert(!svc.data.unlocked.br_master);
  svc.event({type:'rushVictory',rush:{...flags,bosses:[1],cleared:100,clean:3}});
  assert.equal(svc.notifications.filter(a=>a.id.startsWith('br_')).length,15);
  const reload=new AchievementService(store,()=>false);
  assert.equal(reload.data.unlocked.kill,'2026-01-01');
  assert(reload.data.unlocked.br_master);
  assert.equal(reload.completionDefinitions.filter(a=>a.id.startsWith('br_')).length,15);
  const developer=new AchievementService(undefined,()=>true);
  assert(!developer.event({type:'rushBlood'}));
  for(const [i,[id]] of RUSH_ACHIEVEMENTS.entries()){
    assert(reload.data.unlocked[id]);
    const png=readFileSync('public/assets/v210/achievements/'+i+'.png');
    assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[128,128]);
  }
});
