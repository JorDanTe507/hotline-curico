import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hudOcclusion,actorScreenTop} from '../src/ui/HudOcclusion';
import {endlessHealthScale} from '../src/bossRush/endless';
import {rushTuning} from '../src/bossRush/balance';
import {bombardmentTargets,BOSS_COMBAT as C} from '../src/bossRush/combatRules';
test('HUD fades when an actor enters its viewport area, including scrolling, zoom and coop',()=>{
 const cam={scrollX:0,scrollY:400,width:1280,height:720,zoom:1},normal={x:640,y:760,displayHeight:55},top={x:640,y:480,displayHeight:55};
 assert.equal(hudOcclusion([normal],cam,0,132),1);assert.equal(hudOcclusion([top],cam,0,132),.16);assert.equal(hudOcclusion([normal,top],cam,0,275),.16);
 assert.equal(hudOcclusion([top],{...cam,scrollY:0},0,132),1);assert.equal(actorScreenTop(top,cam),44.25);
 assert.equal(hudOcclusion([normal],{...cam,zoom:.75},90,189),1);
});
test('infinite HP is above campaign immediately and grows every encounter for all six bosses and doubles',()=>{
 for(let boss=0;boss<6;boss++){
  assert(rushTuning(boss,1,false,0).hp>rushTuning(boss).hp);
  for(let cleared=1;cleared<=120;cleared++){
   const now=rushTuning(boss,Math.floor(cleared/3)+1,cleared%2===0,cleared),previous=rushTuning(boss,Math.floor((cleared-1)/3)+1,cleared%2!==0,cleared-1);
   assert(now.hp>previous.hp);assert.equal(now.hp,rushTuning(boss,1,false,cleared).hp);
  }
 }
 assert(endlessHealthScale(300)>endlessHealthScale(30));
});
test('dense randomized airstrikes keep a real safe disk and shorten the old warning',()=>{
 const points=Array.from({length:26*19},(_,i)=>({x:i%26*48+24,y:Math.floor(i/26)*48+24})),safe={x:600,y:600};let n=507;const random=()=>((n=Math.imul(n,1664525)+1013904223>>>0)/2**32);
 const layouts=new Set<string>();
 for(let wave=0;wave<100;wave++){const targets=bombardmentTargets(points,safe,wave,random);assert.equal(targets.length,20);assert(targets.every(p=>Math.hypot(p.x-safe.x,p.y-safe.y)>C.bombardment.radius+C.bombardment.safeRadius));layouts.add(JSON.stringify(targets));const covered=points.filter(p=>targets.some(t=>Math.hypot(p.x-t.x,p.y-t.y)<C.bombardment.radius)).length;assert(covered/points.length>.50)}
 assert.equal(layouts.size,100);assert(C.bombardment.warning<1000&&C.bombardment.damage>=100);assert(C.radio.call>500&&C.radio.call<2000);assert(C.suppression.duration>3500);
});
