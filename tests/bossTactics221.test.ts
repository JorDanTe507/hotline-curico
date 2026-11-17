import {test} from 'node:test';import assert from 'node:assert/strict';
import {chooseRefuge,regionOf,pathDistance,sniperScore} from '../src/bossRush/TacticalRules';
import {directedImpact} from '../src/uroboros/ThrowImpact';
import {CombatMedic} from '../src/bossRush/CombatMedic';
import {UROBOROS} from '../src/uroboros/config';
import {SniperTactics} from '../src/bossRush/SniperTactics';
test('refuges cover all regions, avoid recent repeats and allow distant reachable corners',()=>{
 const points=Array.from({length:9},(_,i)=>({x:(i%3)*300+150,y:Math.floor(i/3)*300+150})),regions=new Set<number>();let n=22;const random=()=>((n=Math.imul(n,1664525)+1013904223>>>0)/2**32);let recent:number[]=[];
 for(let i=0;i<90;i++){const result=chooseRefuge(points,900,900,recent,p=>Math.hypot(p.x-450,p.y-450)/253*1000,random)!;assert(!recent.includes(result.region));regions.add(result.region);recent=[...recent,result.region].slice(-2);assert(result.warning>=850)}assert.equal(regions.size,9);
 assert.equal(chooseRefuge(points,900,900,[],()=>undefined),undefined);const far=chooseRefuge([points[0]],900,900,[],()=>3000)!;assert.equal(far.warning,3350);assert.equal(regionOf(far.point,900,900),0);
 assert.equal(pathDistance([{x:0,y:0},{x:48,y:0},{x:48,y:48}],{x:0,y:0},{x:48,y:48}),96);
});
test('sniper prefers useful flanks, avoids dead ends and recently used positions',()=>{const origin={x:450,y:50},target={x:450,y:450},flank={x:50,y:450},front={x:450,y:10};assert(sniperScore(flank,origin,target,[],3)>sniperScore(front,origin,target,[],3));assert(sniperScore(flank,origin,target,[flank],3)<sniperScore(flank,origin,target,[],3));assert.equal(sniperScore(flank,origin,target,[],1),-Infinity)});
test('sniper completes a useful route across planning intervals instead of reversing before arrival',()=>{
 const destinations:any[]=[];const s:any={clock:0,rush:{power:{dark:false}},player:{x:450,y:450,body:{velocity:{x:0,y:0}}},lineClear:()=>true,walkablePoint:()=>true,navigation:{invalidate:()=>{},routes:{route:(a:any,b:any)=>[a,b]},move:(_e:any,x:number,y:number)=>destinations.push({x,y})}},e:any={sprite:{body:{center:{x:450,y:50}}}},t=new SniperTactics(s);
 t.move(e,100);s.clock=1500;e.sprite.body.center={x:440,y:150};t.move(e,100);assert.deepEqual(destinations[1],destinations[0]);
 e.sprite.body.center={...destinations[0]};s.clock=1600;t.move(e,100);assert.notDeepEqual(destinations[2],destinations[0]);
});
test('throw impact requires motion into a solid surface, not floor, parallel scrape or moving away',()=>{const wall={x:100,y:0,width:48,height:300},from={x:90,y:80};assert(directedImpact(from,{x:620,y:0},wall));assert(!directedImpact(from,{x:0,y:620},wall));assert(!directedImpact(from,{x:-620,y:0},wall));assert(UROBOROS.attacks.charge.radius>305);assert(UROBOROS.throwSpeed*UROBOROS.throwMs/1000>350);assert(UROBOROS.visualScale[1]>UROBOROS.visualScale[0])});
test('dedicated medic heals exactly once, caps HP and rewards only an interrupted duty',()=>{
 const chain:any={setPosition(){return this},setColor(){return this},setText(){return this},setVelocity(){return this},setTint(){return this},play(){return this},lineStyle(){return this},lineBetween(){return this},setDepth(){return this},clear(){return this}};let drops=0;
 const s:any={clock:0,add:{graphics:()=>chain},survival:{stunned:()=>false},chaos:{interrupted:()=>false},lineClear:()=>true,addDrop:()=>drops++},leader:any={hp:250,max:500,sprite:{active:true,body:{center:{x:100,y:100}}}},enemy=()=>({hp:65,sprite:{...chain,x:100,y:180,body:{center:{x:100,y:180}}},label:{...chain}} as any);
 const medics=new CombatMedic(s),a=enemy();medics.add(a,leader);medics.update(a);assert.equal(leader.hp,250);s.clock=850;medics.update(a);assert.equal(leader.hp,350);s.clock=5000;medics.update(a);assert.equal(leader.hp,350);medics.defeated(a);assert.equal(drops,0);
 const b=enemy();medics.add(b,leader);medics.update(b);medics.defeated(b);medics.defeated(b);assert.equal(drops,1);
 leader.hp=490;const c=enemy();medics.add(c,leader);medics.update(c);s.clock+=850;medics.update(c);assert.equal(leader.hp,500);
 leader.hp=250;const killed=enemy();medics.add(killed,leader);medics.update(killed);killed.hp=0;s.clock+=850;assert.equal(medics.healing(killed),undefined);assert.equal(leader.hp,250);
});
test('medic replans physical stalls, gives up safely, and freezes its channel with time control',()=>{
 const chain:any={setPosition(){return this},setColor(){return this},setText(){return this},setVelocity(){return this},setTint(){return this},play(){return this},lineStyle(){return this},lineBetween(){return this},setDepth(){return this},clear(){return this}};let invalidations=0,moves=0;
 const s:any={clock:100,add:{graphics:()=>chain},survival:{stunned:()=>false},chaos:{interrupted:()=>false},walkablePoint:()=>true,lineClear:()=>true,navigation:{invalidate:()=>invalidations++,canReach:()=>true,move:()=>moves++}},leader:any={hp:200,max:500,sprite:{active:true,body:{center:{x:500,y:500}}}},e:any={hp:65,sprite:{...chain,body:{center:{x:100,y:100}}},label:{...chain}},medics=new CombatMedic(s);
 medics.add(e,leader);medics.update(e);for(let i=0;i<12;i++){s.clock+=1200;medics.update(e)}const stopped=moves;medics.update(e);assert.equal(moves,stopped);assert(invalidations>=10);assert.equal(leader.hp,200);
 const a:any={hp:65,sprite:{...chain,body:{center:{x:450,y:500}}},label:{...chain}};medics.add(a,leader);medics.update(a);medics.freeze(a,3000);s.clock+=3000;medics.update(a);assert.equal(leader.hp,200);s.clock+=850;medics.update(a);assert.equal(leader.hp,300);
});
