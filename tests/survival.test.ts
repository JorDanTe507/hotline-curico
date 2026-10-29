import {test} from 'node:test';
import assert from 'node:assert/strict';
import {enemyMovementSpeed} from '../src/config/survival';
import {ENEMIES} from '../src/enemies/config';
import {PLAYER_SPEED} from '../src/config/player';
test('V0.4: todas las clases normales +20%, jefes y Cervela conservan velocidad',()=>{
 const base=ENEMIES.slice(0,5).map(e=>e.speed);
 assert.deepEqual(base,[105,85,90,65,120]);
 assert.deepEqual(base.map(n=>enemyMovementSpeed(n,false)),[126,102,108,78,144]);
 assert.deepEqual(base.map(n=>enemyMovementSpeed(n,true)),base);
 assert.equal(PLAYER_SPEED,253);
});
