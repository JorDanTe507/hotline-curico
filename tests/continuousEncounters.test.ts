import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EncounterCalendar} from '../src/systems/EncounterCalendar';
import {ContinuousDirector} from '../src/systems/ContinuousDirector';

test('calendar through 125 minutes, telegraph, variety, Wesker, stagger and identity',()=>{
 const c=new EncounterCalendar(()=>.05), events:{id:string;t:number;boss:number}[]=[],warnings:number[]=[];
 let living=0;
 for(let t=0;t<=7_520_000;t+=1000){
  if(t%300000===20000)living=0;
  const tick=()=>c.update(t,living,()=>warnings.push(t),(boss,id)=>{events.push({boss,id,t});living++;return true});
  tick();tick();
 }
 assert.equal(warnings.length,25);
 for(let i=1;i<=25;i++){
  const event=events.find(e=>e.id===i+'-0')!;
  assert.equal(event.t,i*300000);assert.equal(warnings[i-1],event.t-10000);
 }
 assert.equal(new Set(events.slice(0,5).map(e=>e.boss)).size,5);
 assert.equal(events.find(e=>e.boss===5)?.t,1800000);
 const second=events.find(e=>e.id==='7-1')!;
 assert.ok(second.t>=2110000&&second.t<=2115000);
 assert.equal(new Set(events.map(e=>e.id)).size,events.length);
});
test('overdue identities drain FIFO after one warning and retry unavailable locations',()=>{
 const c=new EncounterCalendar(),keys:string[]=[],warnings:number[]=[];
 let living=0,valid=true;
 const tick=(t:number)=>c.update(t,living,id=>warnings.push(id),(_,key)=>{if(!valid)return false;keys.push(key);living++;return true});
 tick(290000);tick(300000);tick(920000);assert.deepEqual(keys,['1-0']);
 living=0;tick(920001);tick(930000);assert.deepEqual(keys,['1-0']);
 valid=false;tick(930001);valid=true;tick(930501);living=0;tick(930502);tick(940502);
 assert.deepEqual(keys,['1-0','2-0','3-0']);assert.deepEqual(warnings,[1,2,3]);
});
test('horde rate approaches targets gradually and skips population debt',()=>{
 const d=new ContinuousDirector();
 for(const [count,target] of [[1,.7],[2,.45],[0,1]]){
  d.step(16,24,Math.random,count);assert.notEqual(d.frequency,target);
  for(let i=0;i<2000;i++)assert.equal(d.step(16,24,Math.random,count),undefined);
  assert.ok(Math.abs(d.frequency-target)<.001);
 }
 assert.notEqual(d.step(16,0),undefined);assert.equal(d.step(16,0),undefined);
});
test('boss routes take a usable detour or guard the closest reachable entrance',async()=>{
 const {pursuitRoute}=await import('../src/systems/BossPursuit');
 const fits=(x:number,y:number)=>x>=24&&x<=216&&y>=24&&y<=168&&(x!==120||y===168);
 const path=pursuitRoute({x:24,y:24},{x:216,y:24},fits);
 assert.deepEqual(path.at(-1),{x:216,y:24});assert.ok(path.every(p=>fits(p.x,p.y)));
 const guarded=pursuitRoute({x:24,y:24},{x:216,y:24},(x,y)=>fits(x,y)&&x<120);
 assert.equal(guarded.at(-1)?.x,72);
});
