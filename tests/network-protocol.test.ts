import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeClient,MovementIntent} from '../src/network/protocol';

test('El protocolo sólo admite identificación o intención acotada',()=>{
 const input={v:1,type:'input',seq:1,x:-1,y:.5};
 assert.deepEqual(decodeClient(JSON.stringify(input)),input);
 for(const patch of [{v:2},{type:'credit'},{hc:40},{slot:1},{seq:0},{seq:1.5},{x:2},{y:null}]){
  assert.equal(decodeClient(JSON.stringify({...input,...patch})),undefined);
 }
 for(const raw of ['{','null','[]','x'.repeat(513)])assert.equal(decodeClient(raw),undefined);
});
test('Duplicados y paquetes atrasados no modifican ni prolongan el movimiento',()=>{
 const intent=new MovementIntent(),input={v:1,type:'input',seq:4,x:1,y:1} as const;
 assert(intent.accept(input,0));assert(Math.hypot(intent.read(0).x,intent.read(0).y)<=1);
 assert(!intent.accept({...input,x:-1},200));assert(!intent.accept({...input,seq:3},300));
 assert.deepEqual(intent.read(351),{x:0,y:0});
 intent.clear();assert.equal(intent.seq,4);
 assert(intent.accept({...input,seq:5},400));
});

test('Intenciones de acciones remotas validadas y consumidas una sola vez',()=>{
 const now=performance.now(),intent=new MovementIntent();
 const msg={v:1,type:'input',seq:1,x:0,y:1,angle:-1,buttons:41} as const;
 assert.deepEqual(decodeClient(JSON.stringify(msg)),msg);
 for(const patch of [{angle:4},{buttons:64},{buttons:-1},{buttons:.5},{health:9},{angle:null}])
  assert.equal(decodeClient(JSON.stringify({...msg,...patch})),undefined);
 intent.accept(msg,now);assert.equal(intent.angle,-1);assert(intent.down('fire'));
 assert(intent.take('dash'));assert(!intent.take('dash'));assert(intent.down('interact'));
 intent.accept({...msg,seq:2},now);assert(!intent.take('dash'));
 intent.clear();assert(!intent.down('interact'));
});
