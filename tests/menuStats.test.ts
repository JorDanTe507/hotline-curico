import {test} from 'node:test';import assert from 'node:assert/strict';
import {PermanentProgress} from '../src/systems/PermanentProgress';
import {CHARACTERS} from '../src/characters/catalog';
import {selectionDossier} from '../src/characters/SelectionDossier';
import {MENU_ITEMS,MODE_CARDS,TRADITIONAL_CHOICES} from '../src/ui/MenuPresentation';
test('menus preserve ancillary functions, expose traditional and keep story as preview',()=>{
 assert(!MENU_ITEMS.some(x=>x.label==='JUGAR' as string));for(const id of ['modes','upgrades','achievements','options','daily','notes','restricted'])assert(MENU_ITEMS.some(x=>x.id===id));
 assert(!MENU_ITEMS.some(x=>x.id==='coop' as string));assert.deepEqual(TRADITIONAL_CHOICES.map(x=>[x.id,x.coop]),[['solo',false],['coop',true]]);assert.deepEqual(MODE_CARDS.map(x=>x.id),['traditional','boss-rush','story']);
});
test('preview reuses permanent apply on fresh stats, without double bonuses or saved mutations',()=>{
 const p=new PermanentProgress(undefined,false,false);
 for(const id of ['cervela','nicolas','jordan'] as const)for(const levels of [0,1,4]){
  p.data.characters[id].vitality=levels;p.data.characters[id].damage=2;p.data.characters[id].dash=2;
  const before=JSON.stringify(p.data),i=CHARACTERS.findIndex(c=>c.id===id),expected=p.apply(id,CHARACTERS[i].stats());
  for(let repeat=0;repeat<2;repeat++){const view=selectionDossier(i,'traditional',p);assert(view.stats[0][1].startsWith(expected.maxHealth+' HP'));assert.equal(view.stats[1][1],'0 / '+expected.maxArmor);assert.equal(view.stats[2][1],'+'+Math.round(expected.permanentFireDamage!*100)+'%');assert.equal(view.stats[4][1],'−6%')}
  assert.equal(JSON.stringify(p.data),before);assert.equal(CHARACTERS[i].stats().maxHealth,100);
 }
});
test('Boss Rush preview excludes purchased permanent upgrades, matching Game initial branch',()=>{
 const p=new PermanentProgress(undefined,false,false);p.data.characters.cervela.vitality=10;p.data.characters.cervela.damage=8;
 const v=selectionDossier(0,'rush',p);assert.equal(v.stats[0][1],'100 HP');assert.equal(v.stats[2][1],'+0%');assert.match(v.note,/SIN MEJORAS PERMANENTES/);
});
test('ability-only improvements remain in conditional ability text and update without restarting',()=>{
 const p=new PermanentProgress(undefined,false,false);const before=selectionDossier(2,'traditional',p);
 p.data.characters.jordan.ultimateDuration=2;p.data.characters.jordan.executionHeal=4;
 const after=selectionDossier(2,'traditional',p);assert.match(before.detail,/12 s/);assert.match(after.detail,/13 s/);assert.match(after.detail,/10%/);assert.equal(after.stats[3][1],'×1');
});
