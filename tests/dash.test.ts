import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Dash} from '../src/systems/Dash';
import {PLAYER_SPEED,DASH_SPEED,DASH_DURATION,DASH_COOLDOWN} from '../src/config/player';
test('velocidad normal +15%, dash x3 y parámetros exactos',()=>{assert.equal(PLAYER_SPEED,253);assert.equal(DASH_SPEED,759);assert.equal(DASH_DURATION,180);assert.equal(DASH_COOLDOWN,1200)});
test('dash en ocho direcciones normalizadas, bloqueo y fin exacto de invulnerabilidad',()=>{for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const d=new Dash();assert.ok(d.start(100,x,y));assert.ok(Math.abs(Math.hypot(d.direction.x,d.direction.y)-1)<1e-12);assert.ok(d.active(279));assert.equal(d.active(280),false);assert.equal(d.start(300,-x,-y),false);assert.equal(d.start(1299,x,y),false);assert.ok(d.start(1300,x,y))}});
test('última dirección, dirección fija, progreso y estado nuevo',()=>{const d=new Dash();d.remember(-1,1);d.start(0,0,0);const original={...d.direction};d.remember(1,0);assert.deepEqual(d.direction,original);assert.ok(d.direction.x<0&&d.direction.y>0);assert.equal(d.progress(0),0);assert.equal(d.progress(600),.5);assert.equal(d.progress(1200),1);const fresh=new Dash();assert.equal(fresh.readyAt,0);assert.equal(fresh.active(0),false);assert.ok(fresh.start(0,0,0))});
