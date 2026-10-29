import {test} from 'node:test';import assert from 'node:assert/strict';
import {WeaponCadence} from '../src/weapons/WeaponCadence';
import {gun,WEAPONS} from '../src/weapons/arsenal';
import {Ultimate} from '../src/systems/Ultimate';
test('cadencias independientes: pistola y subfusil no se aceleran entre sí',()=>{const clock=new WeaponCadence(),a=gun(0),b=gun(2),fired=[[],[]] as number[][];for(let t=0;t<1000;t++){if(clock.fire(a,t,WEAPONS[a.id].rate))fired[0].push(t);if(clock.fire(b,t,WEAPONS[b.id].rate))fired[1].push(t)}assert.deepEqual(fired[0],[0,260,520,780]);assert.deepEqual(fired[1],[0,90,180,270,360,450,540,630,720,810,900,990]);assert.equal(a.ammo,10);assert.equal(b.ammo,30)});
test('pistola y RPG mantienen sus intervalos de 260/1500 ms',()=>{const c=new WeaponCadence(),a=gun(0),b=gun(6);assert.ok(c.fire(a,0,260));assert.ok(c.fire(b,0,1500));assert.ok(c.fire(a,260,260));assert.equal(c.fire(b,1499,1500),false);assert.ok(c.fire(b,1500,1500))});
test('disparos durante ulti no cargan aunque impacten después de terminar',()=>{const u=new Ultimate();u.charge=40;u.activate(0);const shot=u.shot(11000);u.tick(12000,50);assert.equal(u.hit({},shot,12001),false);assert.equal(u.charge,0);assert.ok(u.hit({},u.shot(12001),12001))});
