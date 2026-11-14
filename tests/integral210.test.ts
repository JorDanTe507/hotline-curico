import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PermanentProgress,migratePermanent,RunEconomy} from '../src/systems/PermanentProgress';
import {ECONOMY} from '../src/config/permanent';
import {Ultimate} from '../src/systems/Ultimate';
import {Tryhard} from '../src/systems/Tryhard';
import {Judgment} from '../src/v20/Judgment';
import {newRun} from '../src/systems/run';
import {AchievementService,ACHIEVEMENTS} from '../src/systems/Achievements';
import {bossIndex} from '../src/bosses/config';

const storage=()=>{const map=new Map<string,string>();return {getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v)}}};
test('legacy escrow survives repeated migration and can be assigned exactly once',()=>{
 const store=storage();store.setItem(ECONOMY.key,JSON.stringify({currency:5432,characters:{jordan:{vitality:3}}}));
 const p=new PermanentProgress(store);assert.equal(p.data.currency,5432);for(const id of ['cervela','nicolas','jordan'] as const)assert.equal(p.balance(id),0);
 assert.equal(p.purchase('jordan','damage'),false);assert.deepEqual(migratePermanent(p.data),p.data);
 assert.ok(p.claimLegacy('jordan'));assert.equal(p.claimLegacy('cervela'),false);assert.equal(p.balance('jordan'),5432);assert.equal(p.balance('cervela'),0);
 const again=new PermanentProgress(store);assert.equal(again.balance('jordan'),5432);assert.equal(again.level('jordan','vitality'),3);assert.equal(again.data.currency,0);
});
test('earnings and spending belong to their protagonist, never to the other wallets',()=>{
 const p=new PermanentProgress(storage()),a=new RunEconomy(p,'nicolas'),b=new RunEconomy(p,'jordan');a.supply(500);b.supply(800);
 assert.equal(p.balance('cervela'),0);assert.equal(p.balance('nicolas'),500);assert.equal(p.balance('jordan'),800);
 assert.equal(p.purchase('cervela','vitality'),false);assert.ok(p.purchase('jordan','vitality'));assert.equal(p.balance('jordan'),600);assert.equal(p.balance('nicolas'),500);
});
test('voluntary ultimate cancellation consumes charge and restores finite ammunition without healing exploits',()=>{
 const r=newRun();r.health=25;const g={id:0,ammo:3,reserve:12};const a=new Ultimate(()=>r.stats,()=>r);a.charge=40;assert.ok(a.activate(0,[g]));assert.equal(a.tick(1000,25,[g]),37);g.ammo=0;assert.ok(a.cancel([g]));assert.equal(g.ammo,3);assert.equal(a.charge,0);assert.equal(a.ready,false);assert.equal(a.active(1001),false);assert.equal(a.cancel([g]),false);
 for(const Ability of [Tryhard,Judgment]){const run=newRun(),u=new Ability(()=>run.stats,()=>run);u.charge=40;u.activate(0);assert.ok(u.cancel());assert.equal(u.active(1),false);assert.equal(run.healthMultiplier,1);assert.equal(u.charge,0)}
});
test('six-boss rotation includes Wesker at 30 and 60, preserves later rounds',()=>{
 assert.deepEqual([5,10,15,20,25,30,35,60,65].map(bossIndex),[0,1,2,3,4,5,0,5,0]);assert.equal(bossIndex(31),-1);
});
test('new legendary definitions preserve IDs, secret state, descriptions and persistence',()=>{
 const a=new AchievementService(storage(),()=>false);const requiem=ACHIEVEMENTS.find(x=>x.id==='wesker-requiem')!,dark=ACHIEVEMENTS.find(x=>x.id==='verdugo-dark')!;
 assert.equal(requiem.secret,true);assert.equal(dark.secret,false);assert.equal(requiem.rarity,'legendary');assert.equal(dark.rarity,'legendary');assert.equal(requiem.description,'Hasta los monstruos tienen su última bala.');assert.equal(dark.description,'No necesitas verlo para acabar con él.');
 a.event({type:'weskerRequiem'});a.event({type:'verdugoDark'});assert.ok(a.data.unlocked[requiem.id]&&a.data.unlocked[dark.id]);assert.equal(a.notifications.filter(n=>n.id===requiem.id).length,1);
});
