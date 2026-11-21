import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ContinuousRescue} from '../src/systems/ContinuousRescue';
import {ContinuousDirector} from '../src/systems/ContinuousDirector';

test('Fatiga individual y cinco minutos efectivos desde la recuperación',()=>{
 const rescue=new ContinuousRescue(),other=new ContinuousRescue();
 let now=0;
 for(const duration of [45000,35000,25000,20000,20000]){
  const until=rescue.deadline(now);
  assert.equal(until-now,duration);
  now+=3000;
  assert.equal(rescue.advance({until,dead:false,progress:0},now,true),'revived');
  now+=299999;
 }
 assert.equal(other.deadline(now)-now,45000);
 now++;
 assert.equal(rescue.deadline(now)-now,45000);
});
test('Acción sostenida, pausa, decaimiento y resolución única',()=>{
 const rescue=new ContinuousRescue(),state={until:rescue.deadline(100),dead:false,progress:0};
 rescue.advance(state,1100,false);
 assert.equal(state.progress,0);
 rescue.advance(state,3100,true);
 rescue.advance(state,3100,false);
 assert.equal(state.progress,2000);
 rescue.advance(state,4100,false);
 assert.equal(state.progress,1250);
 assert.equal(rescue.advance(state,5849,true),undefined);
 assert.equal(rescue.advance(state,5850,true),'revived');
 assert.equal(rescue.advance(state,6850,true),undefined);
 state.until=rescue.deadline(7000);
 assert.equal(rescue.advance(state,state.until,true),'expired');
 assert.equal(state.dead,true);
 assert.equal(rescue.advance(state,100000,true),undefined);
});
test('Presupuesto global interpola durante 30 segundos y respeta la población existente',()=>{
 const director=new ContinuousDirector();
 director.loseParticipant();
 assert.equal(director.population,6);
 assert.equal(director.step(15000,6),undefined);
 assert.equal(director.population,5);
 director.loseParticipant();
 assert.equal(director.step(15000,6),undefined);
 const solo=new ContinuousDirector();solo.elapsed=director.elapsed;
 assert.equal(director.population,Math.ceil(solo.population/2));
});
