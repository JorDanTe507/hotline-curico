import assert from 'node:assert/strict';
import test from 'node:test';
import {ContinuousDirector,continuousBalance} from '../src/systems/ContinuousDirector';

test('continuous sessions use simulation time and maintain a bounded population for two hours',()=>{
 const director=new ContinuousDirector();
 assert.equal(director.time,'00:00:00');
 let alive=0,spawns=0;
 for(let tick=0;tick<144000;tick++){
  if(tick%40===0&&alive)alive--;
  if(director.step(50,alive)!==undefined){alive++;spawns++}
  assert.ok(alive<=director.population&&alive<=continuousBalance.cap);
  if(tick===35999)assert.equal(director.time,'00:30:00');
  if(tick===71999)assert.equal(director.time,'01:00:00');
 }
 assert.equal(director.time,'02:00:00');
 assert.ok(spawns>3000&&director.health>1&&director.damage>1);
 assert.equal(director.label,'02:00:00 · Amenaza Crítica');
 assert.equal(new ContinuousDirector().elapsed,0);
});
