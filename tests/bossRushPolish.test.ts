import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import type {CharacterId} from '../src/characters/catalog';
import {relayLines,RELAY_DIALOGUES,transferRatio} from '../src/bossRush/relay';
import {endlessScale,doubleChance,newEndless,saveEndless,endlessRecords} from '../src/bossRush/endless';
import {rushTuning} from '../src/bossRush/balance';
import {rushMap} from '../src/bossRush/Arenas';
import {STATION_EXIT} from '../src/uroboros/Station';
import {GENERATORS} from '../src/bossRush/PowerCut';

test('los seis relevos dirigidos alternan las dos conversaciones oficiales',()=>{
  for(const pair of Object.keys(RELAY_DIALOGUES)){
    const [from,to]=pair.split(':') as CharacterId[];
    const history={};
    const a=relayLines(from,to,history,()=>0),b=relayLines(from,to,history,()=>0);
    assert.deepEqual(a.map(([who])=>who),[from,to,from]);
    assert.deepEqual(a.map(([,line])=>line),RELAY_DIALOGUES[pair as keyof typeof RELAY_DIALOGUES][0]);
    assert.deepEqual(b.map(([,line])=>line),RELAY_DIALOGUES[pair as keyof typeof RELAY_DIALOGUES][1]);
    assert.deepEqual(relayLines(from,to,history),a);
  }
  assert.equal(transferRatio(35,100,130),45.5);
  assert.equal(transferRatio(20,40,34),17);
  assert.equal(transferRatio(55,40,34),34);
});

test('los récords de relevo no expulsan los récords individuales',()=>{
  const cache=new Map<string,string>();
  const storage={getItem:(key:string)=>cache.get(key)??null,setItem:(key:string,value:string)=>cache.set(key,value)} as Storage;
  const solo={...newEndless(),cleared:3,kills:3,character:'jordan' as const,reason:'retirada' as const,date:'2026-11-10',bestCycle:1};
  saveEndless(solo,storage);
  for(let i=0;i<12;i++)saveEndless({...solo,cleared:5+i,kills:5+i,relays:[{from:'jordan',to:'cervela',cleared:3}]},storage);
  const rows=endlessRecords(storage);
  assert.equal(rows.filter(r=>r.relays?.length).length,10);
  assert.deepEqual(rows.at(-1),solo);
});

test('vida acumulada con límites, dobles balanceados y dificultad tardía acotada',()=>{
  assert.equal(endlessScale(6)[0],1.35);
  assert.equal(endlessScale(10)[0],1.50);
  assert.equal(endlessScale(6000)[0],1.50);
  for(let id=0;id<6;id++){
    const solo=rushTuning(id,10),double=rushTuning(id,10,true);
    assert.equal(double.hp,solo.hp*.92);
    assert.equal(double.damage,solo.damage*.90);
  }
  assert(doubleChance(87)>doubleChance(27));
  assert.equal(doubleChance(8000),.68);
});

test('salida real de la Comisaría, generadores transitables y atlas de siete escenarios',()=>{
  const station=rushMap(5,false)!;
  assert.equal(station.grid[Math.floor(STATION_EXIT.y/48)][Math.floor(STATION_EXIT.x/48)],0);
  assert(STATION_EXIT.y>station.start.y);
  for(const [x,y] of GENERATORS)assert.equal(rushMap(3,false)!.grid[y][x],0);
  const {frames}=JSON.parse(readFileSync('public/assets/v210/rooms-polish.json','utf8'));
  for(const room of ['0','1','2','3','4','station','safe']){
    for(let i=0;i<5;i++)assert.equal(frames[room+'-floor-'+i].frame.w,32);
    for(let i=0;i<4;i++)assert.equal(frames[room+'-wall-'+i].frame.h,32);
  }
});
