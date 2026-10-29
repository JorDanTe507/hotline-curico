import {test} from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createMap,blocked,COLS,ROWS,TILE} from '../src/maps/apartments';
import {ENVIRONMENT_TILES,ROOM_MATERIALS,furnishings,solidCells,actorDepth,BLOOD_LIMIT,IMPACT_LIMIT,AMBIENT_LIGHT_LIMIT} from '../src/maps/environment';

test('muebles grandes cubren exactamente las casillas sólidas existentes, sin invadir accesos',()=>{
 const grid=createMap(),covered=new Set<string>();
 for(const p of furnishings())for(let dy=0;dy<p.h;dy++)for(let dx=0;dx<p.w;dx++){const x=p.x+dx,y=p.y+dy,k=`${x},${y}`;assert.equal(grid[y][x],2);assert.equal(covered.has(k),false);covered.add(k)}
 const expected=new Set(grid.flatMap((row,y)=>row.flatMap((v,x)=>v===2?[`${x},${y}`]:[])));assert.deepEqual(covered,expected);
 assert.equal(solidCells(grid).length,grid.flat().filter(v=>v!==0).length);
 for(const x of [10,20,30])for(const y of [4,5,13,14,22,23])assert.equal(blocked(grid,x,y),false);
 for(const y of [9,18])for(const x of [4,5,14,15,24,25,34,35])assert.equal(blocked(grid,x,y),false);
});
test('materiales por habitación y capas mantienen tamaños y orden cenital',()=>{
 assert.equal(ROOM_MATERIALS.length,12);assert.ok(new Set(ROOM_MATERIALS).size>=8);
 for(const material of ROOM_MATERIALS)assert.ok(ENVIRONMENT_TILES.includes(material));
 assert.equal(TILE,48);assert.equal(COLS,40);assert.equal(ROWS,28);assert.ok(actorDepth(300)>actorDepth(200));assert.ok(actorDepth(ROWS*TILE)<15);
 assert.equal(BLOOD_LIMIT,64);assert.equal(IMPACT_LIMIT,80);assert.ok(AMBIENT_LIGHT_LIMIT<=16);
});
test('recortes explícitos excluyen títulos y bordes de presentación; recursos individuales normalizados',()=>{
 const manifest=JSON.parse(readFileSync('public/assets/maps/crops.json','utf8'));assert.deepEqual(manifest.sourceSize,[1536,1024]);assert.equal(manifest.baseSize,32);
 assert.equal(manifest.tiles.length,15);
 for(const t of manifest.tiles){assert.ok(t.crop[1]>=80);const png=readFileSync(`public/assets/maps/floor-${t.name}.png`);assert.equal(png.readUInt32BE(16),32);assert.equal(png.readUInt32BE(20),32)}
 for(const [name,resource] of Object.entries(manifest.objects) as [string,{crop?:number[];outputSize?:number[]}][]){assert.ok(existsSync(`public/assets/maps/${name}.png`));if(resource.crop){const [x,y,r,b]=resource.crop;assert.ok(x>=0&&y>=0&&r<=1536&&b<=1024&&x<r&&y<b);const png=readFileSync(`public/assets/maps/${name}.png`);assert.equal(png.readUInt32BE(16),resource.outputSize![0]);assert.equal(png.readUInt32BE(20),resource.outputSize![1])}}
 const atlas=JSON.parse(readFileSync('public/assets/maps/environment.json','utf8'));assert.equal(Object.keys(atlas.frames).length,33);assert.ok(atlas.frames['blood-0']&&atlas.frames['car']&&atlas.frames['exit']);
});
