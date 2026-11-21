import test from 'node:test';
import assert from 'node:assert/strict';
import {WorldModel} from '../src/world/WorldModel';
import {StreetClimate,SectorSupplies,cityRules} from '../src/world/ContinuousCityState';
import {EncounterCalendar} from '../src/systems/EncounterCalendar';
import {CoinLedger} from '../src/economy/CoinLedger';
import {ChunkLootStore} from '../src/world/ChunkLootStore';

test('deterministic districts and road seams in reverse generation order',()=>{
 const a=new WorldModel(507,undefined,false,true),b=new WorldModel(507,undefined,false,true);
 const coords=Array.from({length:40},(_,i)=>[i-20,i%4-2]);
 const chunks=coords.map(([x,y])=>a.chunk(x,y));
 assert.equal(new Set(chunks.map(c=>c.biome)).size,3);
 for(const [x,y] of coords.reverse()){
  const c=b.chunk(x,y);assert.deepEqual(c,chunks.find(row=>row.cx===x&&row.cy===y));
  for(const i of [14,15,16,17]){assert.equal(c.cells[i][31],0);assert.equal(b.chunk(x+1,y).cells[i][0],0)}
 }
});
test('refill requires time and genuinely new exploration twice',()=>{
 const s=new SectorSupplies();s.visited.add('0,0');assert(s.claim('A',0));
 for(let i=0;i<5;i++)s.visited.add('0,0');
 assert(!s.claim('A',cityRules.restockMs));
 for(let i=1;i<=5;i++)s.visited.add(i+',0');
 assert(!s.claim('A',1));assert(s.claim('A',cityRules.restockMs));
 const restored=SectorSupplies.from(JSON.parse(JSON.stringify(s.snapshot())));
 for(let i=6;i<20;i++)restored.visited.add(i+',0');
 assert(restored.claim('A',cityRules.restockMs*2));assert(!restored.claim('A',cityRules.restockMs*4));
});
test('dormant supplies survive more than 256 sectors without browser storage',()=>{
 const store=new ChunkLootStore(5,undefined,true);
 for(let i=0;i<400;i++)store.save(String(i),[{x:i,y:0,kind:'ammo',id:0}]);
 for(let i=0;i<400;i++){assert.equal(store.take(String(i)).length,1);assert.equal(store.take(String(i)).length,0)}
});
test('four-hour logical itinerary with revisits, storms, loot and boss schedule',()=>{
 const weather=new StreetClimate(74),world=new WorldModel(74,undefined,false,true),supplies=new SectorSupplies();
 const calendar=new EncounterCalendar(()=>.8),coins=new CoinLedger();let living=0,bosses=0,maxCache=0,generated=0,traffic=0,strikes=0;
 const skies=new Set<string>();
 for(let t=0;t<=14400000;t+=1000){
  const events=weather.advance(t);skies.add(weather.sky);
  if(events.strike){assert.equal(weather.sky,'storm');strikes++}if(events.traffic)traffic++;
  if(t%60000===0){const x=t/60000%7===0?0:Math.floor(t/60000),c=world.chunk(x,0);
   supplies.visited.add(c.key);if(supplies.claim(c.key,t)){coins.deposit(5,{x:x*1536,y:0},()=>true);generated+=5}
   if(t%180000===0)coins.step(16,[{id:1,x:x*1536,y:0,radius:48,speed:1}],()=>true,()=>true);
   maxCache=Math.max(maxCache,world.cache.size);
  }
  if(t%300000===25000)living=0;
  calendar.update(t,living,()=>{},()=>{living++;bosses++;return true});
  if([1800000,3600000,7200000,14400000].includes(t)){
   assert.equal(bosses,t/300000);assert.equal(coins.pending+coins.collected,generated);assert(maxCache<=64);
   console.log(JSON.stringify({minutes:t/60000,bosses,maxCache,visited:supplies.visited.size,records:supplies.used.size,hc:generated,pendingHC:coins.pending,collectedHC:coins.collected,traffic,strikes}));
  }
 }
 assert.equal(skies.size,4);
});
