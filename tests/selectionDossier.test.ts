import {test} from 'node:test';import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/characters/catalog';
import {SELECTION_SLOTS,ENTRY_FRAME_MS,SelectionVisit,selectionDossier} from '../src/characters/SelectionDossier';
test('selection: each entry runs once per visit, returning freezes the final frame and a new visit resets',()=>{
 const visit=new SelectionVisit();visit.focus(0,0);assert.equal(visit.visual(0).frame,0);assert.equal(visit.visual(ENTRY_FRAME_MS*4).frame,4);
 visit.focus(1,100);assert.equal(visit.visual(100).key,'dossier-nicolas-entry-0');visit.focus(0,120);assert.equal(visit.visual(120).key,'dossier-cervela-entry-5');
 visit.focus(2,140);assert.equal(visit.visual(140).key,'dossier-jordan-entry-0');assert.equal(visit.visual(140+6*ENTRY_FRAME_MS).key,'dossier-jordan-entry-5');
 const next=new SelectionVisit();next.focus(0,2000);assert.equal(next.visual(2000).playing,true);
});
test('selection: twelve visual slots do not expand the three-character gameplay catalog',()=>{
 assert.equal(CHARACTERS.length,3);assert.equal(SELECTION_SLOTS,12);const visit=new SelectionVisit();
 for(let i=3;i<SELECTION_SLOTS;i++){visit.focus(i,i);assert.equal(visit.visual(i).key,'');const data=selectionDossier(i);assert.equal(data.name,'DESCONOCIDO');assert.equal(data.description,'NO EXISTEN REGISTROS DISPONIBLES');assert.equal(data.ability,'CLASIFICADA');assert.deepEqual(data.stats,[]);assert(data.locked)}
 assert.equal(visit.seen.size,0);
});
test('selection: rapidly interrupted entries cannot revive the previous character',()=>{
 const visit=new SelectionVisit();for(let i=0;i<40;i++)visit.focus(i%3,i);assert.equal(visit.index,0);assert.equal(visit.visual(100).key,'dossier-cervela-entry-5');
 visit.focus(12,100);assert.equal(visit.index,0);visit.focus(-1,100);assert.equal(visit.index,0);
});
test('selection: labels read original catalog and stats without changing their values',()=>{
 const before=CHARACTERS.map(c=>JSON.stringify(c.stats()));for(const [i,c]of CHARACTERS.entries()){
  const data=selectionDossier(i);assert.equal(data.name,c.name);assert.equal(data.description,c.selectionDescription);assert.equal(data.ability,c.ability.name);
  assert.equal(data.stats[0][1],c.stats().maxHealth+' HP');assert.equal(data.stats[2][1],'+0%');assert.equal(data.locked,false);
 }assert.deepEqual(CHARACTERS.map(c=>JSON.stringify(c.stats())),before);
});
