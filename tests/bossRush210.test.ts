import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chooseSafeDialogue, SAFE_DIALOGUES, type SafeHistory} from '../src/bossRush/dialogues';
import type {CharacterId} from '../src/characters/catalog';
import {cellPoint, rushMap, SAFE_ACTOR_POINTS, SAFE_POINTS} from '../src/bossRush/Arenas';
import {RUSH_BOSSES, RUSH_TRACKS} from '../src/bossRush/config';
import {validRest, rushScore, type RushRest} from '../src/bossRush/state';
import {readFileSync, statSync} from 'node:fs';

test('Boss Rush conserva el orden, mantiene rutas transitables', () => {
  assert.deepEqual(RUSH_BOSSES.map(b => b.id), [0,1,2,3,4,5]);
  assert(rushMap(4,false));
  for (const boss of RUSH_BOSSES.filter(b => b.available)) {
    const map = rushMap(boss.id, false)!;
    const goals = map.layout ? [map.layout.boss,map.layout.exit,...map.layout.supplies] : [[19,8] as const];
    reachable(map, goals.map(cellPoint));
  }
  reachable(rushMap(4,true)!, [...Object.values(SAFE_POINTS),...Object.values(SAFE_ACTOR_POINTS)].map(cellPoint));
});

function reachable(map: NonNullable<ReturnType<typeof rushMap>>, goals: {x:number;y:number}[]) {
  const queue = [[Math.floor(map.start.x/48),Math.floor(map.start.y/48)]];
  assert.equal(map.grid[queue[0][1]][queue[0][0]],0);
  const seen = new Set<string>([queue[0].join(',')]);
  for (const [x,y] of queue) for (const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
    const px=x+dx,py=y+dy,key=px+','+py;
    if (map.grid[py]?.[px]===0&&!seen.has(key)) {seen.add(key);queue.push([px,py]);}
  }
  for (const p of goals) assert(seen.has(Math.floor(p.x/48)+','+Math.floor(p.y/48)));
  assert.equal(seen.size,map.grid.flat().filter(c=>c===0).length);
}

const rest: RushRest = {
  version:1, character:'jordan', next:1, credits:180,
  inventory:{guns:[{id:0,ammo:2,reserve:39}],active:0,health:56,armor:12,medkits:2,adrenaline:1,charge:19,counts:[0,0,0,0,1],selected:4},
  stats:{character:'jordan',times:[21000],damage:44,falls:0},
  upgrades:[],offer:['damage','health','charge'],chose:false,remaining:45000,
};
test('la suspensión solo acepta datos coherentes de un descanso y conserva el inventario', () => {
  assert(validRest(JSON.parse(JSON.stringify(rest))));
  assert(!validRest({...rest,next:0}));
  assert(!validRest({...rest,character:'nicolas'}));
  assert(!validRest({...rest,offer:['armor','armor','charge']}));
  assert(!validRest({...rest,inventory:{...rest.inventory,medkits:4}}));
  assert(!validRest({...rest,inventory:{...rest.inventory,guns:[{id:999,ammo:3,reserve:3}]}}));
  assert(!validRest({...rest,stats:{...rest.stats,times:[]}}));
  assert.equal(rushScore(rest.stats),2221);
});

test('están las diez pistas originales y los recortes de las arenas disponibles', () => {
  assert.equal(new Set(RUSH_TRACKS).size,10);
  for (const track of RUSH_TRACKS) assert(statSync('public/assets/v210/'+track+'.mp3').size>1000);
  const {frames} = JSON.parse(readFileSync('public/assets/v210/rooms.json','utf8'));
  for (let boss=0;boss<5;boss++) for (const frame of ['floor','alt','wall','cover','detail','gate']) assert(frames[boss+'-'+frame]);
  const actors = JSON.parse(readFileSync('public/assets/v210/safe-actors.json','utf8')).frames;
  assert.equal(Object.keys(actors).length,18);
});


test('Safe Room conserva el texto oficial de 18 conversaciones y evita repeticiones por pareja', () => {
  const hash = createHash('sha256').update(JSON.stringify(SAFE_DIALOGUES)).digest('hex');
  assert.equal(hash,'637ee44792ab759ea6f5ef4e3c226ac22a6797a9d3520d3de800d2d065b673fe');
  const history: SafeHistory = {};
  assert.equal(Object.keys(SAFE_DIALOGUES).length,6);
  for (const [key, options] of Object.entries(SAFE_DIALOGUES)) {
    const [player,npc] = key.split(':') as [CharacterId,CharacterId];
    assert.equal(options.length,3);
    assert.equal(chooseSafeDialogue(player,npc,history,()=>0),options[0]);
    assert.equal(chooseSafeDialogue(player,npc,history,()=>0),options[1]);
    assert.equal(chooseSafeDialogue(player,npc,history,()=>.99),options[2]);
  }
  assert.equal(chooseSafeDialogue('jordan','jordan',history),undefined);
});
