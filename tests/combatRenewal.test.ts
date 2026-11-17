import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WorldModel,collisionRects} from '../src/world/WorldModel';
import {WorldRoutes} from '../src/world/WorldRoutes';
import {createMap} from '../src/maps/apartments';
import {bossHealthRows,bossHealthTrail} from '../src/ui/BossHealthState';
test('new city starts and both cooperative footprints are clear and connected across seeds',()=>{
 for(let seed=0;seed<80;seed++){
  const w=new WorldModel(seed),a=w.startPoint(),b={x:a.x+65,y:a.y},routes=new WorldRoutes(w);
  assert.equal(w.inApartment(5,5),false);
  for(const p of [a,b])for(const dx of [-24,0,24])for(const dy of [-28,0,28])assert.equal(w.cell(Math.floor((p.x+dx)/48),Math.floor((p.y+dy)/48)),0);
  assert.ok(routes.canReach(a,b));for(const p of [{x:24,y:792},{x:2400,y:792},{x:792,y:-300},{x:792,y:2300}])assert.ok(routes.canReach(a,p));
  // Previously reserved central quadrants now contain real generated city content.
  assert.ok(w.chunk(0,0).buildings.length+(w.chunk(0,0).zones?.length??0)>0);
  assert.deepEqual(w.chunk(0,0),new WorldModel(seed).chunk(0,0));
 }
});
test('fixed arenas and explicitly requested legacy grids retain their geometry',()=>{
 const fixed=createMap(),copy=JSON.stringify(fixed),w=new WorldModel(507,fixed);for(let y=0;y<28;y++)for(let x=0;x<40;x++)assert.equal(w.cell(x,y),fixed[y][x]);assert.equal(JSON.stringify(fixed),copy);
 const legacy=new WorldModel(507,undefined,true);assert.equal(legacy.inApartment(5,5),true);assert.equal(legacy.cell(10,2),1);
 const city=new WorldModel(507).chunk(0,0),covered=new Set<string>();for(const r of collisionRects(city.cells))for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){assert.ok(city.cells[y][x]);assert.ok(!covered.has(`${x},${y}`));covered.add(`${x},${y}`)}assert.equal(covered.size,city.cells.flat().filter(Boolean).length);
});
test('boss rows keep independent real health through damage, healing, death and relay',()=>{
 const a={boss:0,hp:750,max:1000},b={boss:2,hp:1800,max:2400},mob={boss:-1,hp:50,max:50},foes=[a,b,mob];let rows=bossHealthRows(foes);assert.equal(rows.length,2);assert.equal(rows[0].source,a);assert.equal(rows[1].source,b);
 a.hp=250;b.hp=2400;rows=bossHealthRows(foes);assert.equal(rows[0].ratio,.25);assert.equal(rows[1].ratio,1);assert.equal(bossHealthTrail(.75,.25,50,true),.65);assert.equal(a.hp,250);assert.equal(bossHealthTrail(.25,1,50,true),1);assert.equal(bossHealthTrail(.75,.25,50,false),.25);
 a.hp=0;assert.deepEqual(bossHealthRows(foes).map(r=>r.id),[2]);const relay={boss:4,hp:900,max:900};assert.equal(bossHealthRows([relay])[0].source,relay);assert.deepEqual(bossHealthRows([]),[]);
});
