import {test} from 'node:test';import assert from 'node:assert/strict';
import {CriminalAccess,criminalFile,CRT_SOURCE} from '../src/bossRush/Presentation';
test('CRT access has seven decorative characters, can skip, and does not replay within a visit',()=>{
 const access=new CriminalAccess();access.enter(100);assert.equal(access.view(100).ready,false);assert.equal(access.view(1000).bullets.length,7);assert.equal(access.view(1250).ready,true);access.enter(2000);assert.equal(access.view(2000).ready,true);
 const next=new CriminalAccess();next.enter(2000);assert.equal(next.view(2000).ready,false);next.skip();assert(next.view(2000).ready);
});
test('criminal files preserve boss order and the original available/unlocked predicate',()=>{
 for(let unlocked=0;unlocked<=6;unlocked++)for(let i=0;i<6;i++){const file=criminalFile(i,unlocked)!;assert.equal(file.available,i<unlocked);assert.equal(file.number,'BR-00'+(i+1));if(!file.available){assert.equal(file.name,'EXPEDIENTE RESTRINGIDO');assert.equal(file.weapon,'CLASIFICADA');assert.equal(file.operation,'');assert.equal(file.threat,'');assert.equal(file.description,'')}}
 assert.match(criminalFile(5,6)!.name,/WESKER/);assert.equal(criminalFile(6,6),undefined);
});
test('CRT safe rectangle is inside the source geometry',()=>{assert(CRT_SOURCE.x>0&&CRT_SOURCE.y>0);assert(CRT_SOURCE.x+CRT_SOURCE.widthSafe<CRT_SOURCE.width);assert(CRT_SOURCE.y+CRT_SOURCE.heightSafe<CRT_SOURCE.height)});
