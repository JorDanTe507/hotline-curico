import test from 'node:test';
import assert from 'node:assert/strict';
import {ContinuousCoopPressure} from '../src/systems/ContinuousCoopPressure';
import type {Foe,Game} from '../src/scenes/Game';
import {LAST_SEEN_MEMORY,ROUTE_INTERVAL} from '../src/config/instinct';

test('un perseguidor inmóvil puede abandonar un destino bloqueado por otro visible',()=>{
 const actor=(playerId:number,x:number)=>({playerId,player:{x,y:0,body:{center:{x,y:0}}}});
 const players=[actor(1,100),actor(2,440)];
 let reachable=true,wall=false,searches=0;
 const scene={clock:0,coop:{livingActors:()=>players},lineClear:(_x:number,_y:number,x:number)=>x!==100||!wall,
  navigation:{invalidate(){},canReach(){searches++;return reachable}},perception:{forget(){}}};
 const pressure=new ContinuousCoopPressure(scene as unknown as Game);
 const foe={sprite:{x:0,y:0,body:{center:{x:0,y:0}}}} as Foe;
 assert.equal(pressure.target(foe)?.playerId,1);
 wall=true;reachable=false;
 scene.clock=ROUTE_INTERVAL;
 assert.equal(pressure.target(foe)?.playerId,1);
 assert.equal(searches,0);
 scene.clock=LAST_SEEN_MEMORY+ROUTE_INTERVAL;
 assert.equal(pressure.target(foe)?.playerId,2);
 assert.equal(searches,1);
});
