import test from 'node:test';
import assert from 'node:assert/strict';
import {newLobby,choose,canStart} from '../src/party/lobby';

test('lobby valida plazas, preparación, conexión y compatibilidad',()=>{
 const lobby=newLobby();
 choose(lobby,0,'hero','jordan');
 choose(lobby,1,'hero','jordan');
 assert.equal(lobby.heroes[1],null);
 choose(lobby,1,'hero','cervela');
 choose(lobby,0,'ready',true);
 choose(lobby,1,'ready',true);
 assert.equal(canStart(lobby,false),false);
 assert.equal(canStart(lobby,true),true);
 choose(lobby,1,'mode','traditional');
 assert.equal(lobby.mode,'continuous');
 choose(lobby,1,'hero','nicolas');
 assert.deepEqual(lobby.ready,[true,false]);
 choose(lobby,0,'mode','traditional');
 assert.deepEqual(lobby.ready,[false,false]);
 choose(lobby,0,'ready',true);choose(lobby,1,'ready',true);
 assert.equal(canStart(lobby,true),false);
});
