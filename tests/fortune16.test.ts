import {test} from 'node:test';import assert from 'node:assert/strict';
import {WorldModel} from '../src/world/WorldModel';import {WorldRoutes} from '../src/world/WorldRoutes';
import {FortuneLedger,fortuneCandidates,crateReward,safeWeapon,type FortuneObject} from '../src/world/FortuneState';
import {FORTUNE} from '../src/config/fortune';import {WEAPONS} from '../src/weapons/arsenal';
import {enemyGroundWeaponAllowed,enemyPickupPermission,commonEnemyFirearmDamage} from '../src/config/enemyBalance';
import {BOSS_DEFINITIONS,expansionBossStats} from '../src/bosses/expansion';import {bossIndex} from '../src/bosses/config';
import {PermanentProgress} from '../src/systems/PermanentProgress';import {AchievementService,ACHIEVEMENTS} from '../src/systems/Achievements';
const box=(kind:FortuneObject['kind']):FortuneObject=>({id:kind,chunk:'0,0',kind,x:300,y:300,hp:FORTUNE.crateHP,progress:0,opened:false,rewarded:false});
test('jefes 5/10/15/20/25, vidas de referencia, ciclo y Torturado conservados',()=>{
 assert.deepEqual([5,10,15,20,25].map(bossIndex),[0,1,2,3,4]);assert.deepEqual(BOSS_DEFINITIONS.map(b=>b.hp),[450,650,850,1000,1300]);assert.equal(bossIndex(30),0);
 assert.equal(expansionBossStats(1,10).hp,650);assert.equal(expansionBossStats(1,35).hp,813);assert.equal(BOSS_DEFINITIONS[0].damage,20);
});
test('comunes filtran en búsqueda/recogida por categoría explícita, conservan 10% y especiales',()=>{
 assert.ok(enemyGroundWeaponAllowed(0,-1,0));for(const id of [1,3,4,5,6,7,9,10,11,12,15])assert.equal(enemyGroundWeaponAllowed(0,-1,id),false);
 assert.equal(enemyGroundWeaponAllowed(0,-1,0,false),false);assert.equal(enemyGroundWeaponAllowed(0,-1,900),false);
 const original=WEAPONS[0].rarity;try{WEAPONS[0].rarity=undefined;assert.equal(enemyGroundWeaponAllowed(0,-1,0),false);WEAPONS[0].rarity='mythic';assert.equal(enemyGroundWeaponAllowed(0,-1,0),false)}finally{WEAPONS[0].rarity=original}
 assert.ok(enemyGroundWeaponAllowed(4,-1,9));assert.equal(enemyGroundWeaponAllowed(3,-1,9),false);assert.equal(enemyPickupPermission(0,-1,()=>.05),false);
 assert.equal(commonEnemyFirearmDamage(40,0,0,-1),22);assert.equal(commonEnemyFirearmDamage(40,0,0,0),40);assert.equal(WEAPONS[9].damage,90);
});
test('suministros 45/22.5/7.5/20/5, daño pequeño, premio y apertura se reclaman una sola vez',()=>{
 const counts={ammo:0,med:0,adrenaline:0,hc:0,none:0};for(let i=0;i<10000;i++)counts[crateReward(()=>(i+.5)/10000)]++;assert.deepEqual(counts,{ammo:4500,med:2250,adrenaline:750,hc:2000,none:500});
 const l=new FortuneLedger(),b=box('crate');assert.equal(l.damage(b,15),false);assert.equal(l.damage(b,15),true);assert.equal(l.damage(b,100),false);assert.ok(l.claim(b));assert.equal(l.claim(b),false);
});
test('caja fuerte automática seis segundos, alejarse reinicia y no duplica recompensas',()=>{
 const l=new FortuneLedger(),b=box('safe');assert.equal(l.advance(b,2000,true),false);assert.equal(b.progress,2000);l.advance(b,2000,false);assert.equal(b.progress,0);
 assert.equal(l.advance(b,5999,true),false);assert.equal(l.advance(b,1,true),true);assert.equal(b.progress,6000);assert.ok(l.claim(b));assert.equal(l.advance(b,6000,true),false);assert.equal(l.claim(b),false);
});
test('categorías de caja fuerte renormalizadas sin inventar míticas, todas las armas válidas',()=>{
 assert.ok(!WEAPONS.some(w=>w.rarity==='mythic'));const counts={rare:0,epic:0,legendary:0};for(let i=0;i<9900;i++){let call=0;const id=safeWeapon(()=>call++===0?(i+.5)/9900:.5),rarity=WEAPONS[id].rarity as keyof typeof counts;assert.ok(rarity in counts);counts[rarity]++}assert.deepEqual(counts,{rare:5500,epic:3500,legendary:900});
});
test('cobro HC atómico, fondos insuficientes y guardado existente',()=>{
 let saved='';const storage={getItem:()=>saved,setItem:(_k:string,v:string)=>saved=v},p=new PermanentProgress(storage);p.award(2000);assert.ok(p.spend(1500));assert.equal(p.data.currency,500);assert.equal(p.spend(1500),false);assert.equal(p.spend(-100),false);assert.equal(new PermanentProgress(storage).data.currency,500);
});
test('generación determinista, segura y acotada; interiores y exteriores; descarga no regenera premios',()=>{
 const w=new WorldModel(507),l=new FortuneLedger();let safes=0,indoor=0,outdoor=0;
 for(let cy=-8;cy<=8;cy++)for(let cx=-8;cx<=8;cx++){
  const chunk=w.chunk(cx,cy),objects=fortuneCandidates(w,chunk);assert.ok(objects.length<=4);assert.deepEqual(objects,fortuneCandidates(w,chunk));
  for(const item of objects){const x=Math.floor(item.x/48)-cx*32,y=Math.floor(item.y/48)-cy*32,inside=chunk.buildings.some(b=>x>b.x&&x<b.x+b.w-1&&y>b.y&&y<b.y+b.h-1);assert.equal(chunk.cells[y][x],0);assert.ok(!chunk.buildings.some(b=>(b.doors??[]).some(d=>Math.hypot(x-d.x,y-d.y)<3)));
   if(item.kind==='safe'){assert.ok(inside);safes++}if(item.kind==='crate'){assert.equal(inside,false);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)assert.equal(chunk.cells[y+dy][x+dx],0)}if(item.kind==='mystery'){if(inside)indoor++;else outdoor++}
  }
  const first=l.load(w,chunk);for(const b of first){b.opened=true;b.rewarded=true;b.progress=6000}for(const b of l.load(w,w.chunk(cx,cy)))assert.ok(b.opened&&b.rewarded);
 }
 assert.ok(safes>0&&indoor>0&&outdoor>0);l.clear();assert.equal(l.objects.size,0);
});
test('colisiones dinámicas revisan la caché de navegación y se eliminan al destruir',()=>{
 const w=new WorldModel(507),routes=new WorldRoutes(w);let point:{x:number;y:number}|undefined;for(let y=1;y<26&&!point;y++)for(let x=1;x<38&&!point;x++)if(!w.cell(x,y))point={x:x*48+24,y:y*48+24};const p=point!;
 assert.ok(routes.canReach(p,p));const revision=w.collisionRevision;w.setDynamicSolid(Math.floor(p.x/48),Math.floor(p.y/48),true);assert.equal(routes.canReach(p,p),false);assert.equal(w.collisionRevision,revision+1);w.setDynamicSolid(Math.floor(p.x/48),Math.floor(p.y/48),false);assert.ok(routes.canReach(p,p));
});
test('logro Requiem conserva ID/icono/marco y desbloqueo con título y descripción nuevos',()=>{
 const def=ACHIEVEMENTS.find(a=>a.id==='requiem-round')!;assert.equal(def.name,'Salud para los vivos, Requiem para los muertos');assert.equal(def.description,'Completa una ronda de combate utilizando exclusivamente la Requiem.');assert.equal(def.rarity,'legendary');assert.equal(def.icon,12);
 const saved=JSON.stringify({version:1,unlocked:{'requiem-round':'2026-10-31T12:00:00Z'},progress:{},kills:507,rerolls:{}}),a=new AchievementService({getItem:()=>saved,setItem:()=>assert.fail('no reset')},()=>false);assert.equal(a.data.unlocked[def.id],'2026-10-31T12:00:00Z');assert.equal(a.data.kills,507);assert.equal(ACHIEVEMENTS.length,79);
});
