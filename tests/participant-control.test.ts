import assert from 'node:assert/strict';
import {test} from 'node:test';
import {ParticipantControl} from '../src/systems/ParticipantControl';
import {ContinuousRescue} from '../src/systems/ContinuousRescue';

test('El mando local y la sesión remota son fuentes distintas',()=>{
 const p=new ParticipantControl('remote-client');
 p.observe('local-pad',false,10);assert.equal(p.status,'controlled');
 p.observe('remote-client',false,20);p.observe('remote-client',false,30020);
 assert.equal(p.remainingAt(30020),30000);
 p.observe('remote-client',true,60020);
 assert.equal(p.status,'grace-expired');
 p.observe('remote-client',true,200000);p.finish('permanent-death');
 assert.equal(p.status,'grace-expired');
});
test('Cada corte consume el saldo y sólo 120 s continuos lo restauran',()=>{
 const p=new ParticipantControl('local-pad');
 const pad=(active:boolean,t:number)=>p.observe('local-pad',active,t);
 pad(false,1000);pad(true,11000);pad(false,130999);
 assert.equal(p.remainingAt(130999),50000);
 pad(true,140999);pad(false,260999);assert.equal(p.remainingAt(260999),60000);
 p.tick(320998);assert.equal(p.status,'grace');
 p.tick(320999);assert.equal(p.status,'grace-expired');
});
test('Los terminales conservan su causa ante eventos tardíos',()=>{
 for(const reason of ['voluntary','session-closed','permanent-death'] as const){
  const p=new ParticipantControl('remote-client');
  p.observe('remote-client',false,0);p.finish(reason);p.tick(65000);
  p.observe('remote-client',true,70000);assert.equal(p.status,reason);
 }
});
test('Un corte interrumpe al rescatista; el reloj real puede vencer durante una pausa',()=>{
 const control=new ParticipantControl('local-pad'),rescue=new ContinuousRescue();
 const fallen={until:rescue.deadline(0),progress:0,dead:false};
 rescue.advance(fallen,2000,true);
 control.observe('local-pad',false,2500);
 rescue.advance(fallen,3000,control.status==='controlled');
 assert.equal(fallen.progress,1250);
 control.tick(62500);assert.equal(control.status,'grace-expired');
 assert.equal(fallen.dead,false);assert.equal(fallen.until,45000);
});
