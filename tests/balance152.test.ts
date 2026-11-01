import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WEAPONS,gun,reload,isLegendary} from '../src/weapons/arsenal';
import {availableWeights} from '../src/systems/WeaponLottery';
import {normalReward,bossRewards} from '../src/systems/Loot';
import {ENEMIES} from '../src/enemies/config';
import {commonEnemyFirearmDamage,enemyPickupPermission} from '../src/config/enemyBalance';
import {newRun,heal,takeMedkit} from '../src/systems/run';
import {receiveDamage} from '../src/systems/Armor';

test('Requiem reemplaza solo al Magnum, legendaria 1%, seis balas y recarga finita',()=>{
 assert.equal(WEAPONS[9].name,'Requiem');assert.equal(WEAPONS[9].rarity,'legendary');assert.ok(isLegendary(9));
 assert.equal(WEAPONS[1].name,'Revólver');assert.equal(WEAPONS[1].damage,35);assert.equal(WEAPONS[1].rate,520);
 assert.deepEqual(WEAPONS.map(w=>w.damage),[15,35,10,12,22,85,150,12,8,90,10,90,6,25,30,55]);
 assert.equal(WEAPONS[9].rate,1000);assert.equal(WEAPONS[9].reload,2400);
 assert.equal(availableWeights().find(w=>w.id===9)!.weight,1);
 const g=gun(9);assert.equal(g.ammo,6);assert.equal(g.reserve,12);g.ammo=0;reload(g);g.ammo=0;reload(g);g.ammo=0;assert.equal(reload(g),0);assert.equal(g.reserve,0);
 assert.ok(!ENEMIES.some(e=>e.weapon===9));assert.equal(ENEMIES[10].weapon,1);assert.equal(ENEMIES[10].damage,15);
});

test('diez por ciento exacto de básicos en muestra estratificada, una tirada y especiales intactos',()=>{
 let disabled=0;for(let i=0;i<10000;i++)if(!enemyPickupPermission(0,-1,()=>(i+.5)/10000))disabled++;
 assert.equal(disabled,1000);assert.equal(enemyPickupPermission(0,-1,()=>.099999),false);assert.equal(enemyPickupPermission(0,-1,()=>.1),true);
 for(let tier=1;tier<ENEMIES.length;tier++){let rolls=0;assert.equal(enemyPickupPermission(tier,-1,()=>{rolls++;return 0}),ENEMIES[tier].pickup);assert.equal(rolls,0)}
 let rolls=0;assert.equal(enemyPickupPermission(0,0,()=>{rolls++;return 0}),false);assert.equal(rolls,0);
});

test('daño común conserva proporciones y excluye jefes, élites, especiales, melee y explosiones',()=>{
 for(const tier of [0,1,2,5,6,10])for(const id of [0,1,2,3,4,5,7,8,9,10])assert.equal(commonEnemyFirearmDamage(WEAPONS[id].damage,id,tier,-1),WEAPONS[id].damage*.55);
 for(const tier of [3,4,9,11,12,13,14,15])assert.equal(commonEnemyFirearmDamage(40,0,tier,-1),40);
 for(const id of [6,11,12,13,14,15])assert.equal(commonEnemyFirearmDamage(40,id,0,-1),40);
 assert.equal(commonEnemyFirearmDamage(20,3,0,0),20);
});

test('mitigación una vez: fuente .55, chaleco/sobrante, resistencia y Calada siguen funcionando',()=>{
 const r=newRun();r.armor=10;
 const incoming=commonEnemyFirearmDamage(100,0,0,-1);assert.equal(incoming,55.00000000000001);
 receiveDamage(r,incoming,false);assert.equal(r.armor,0);assert.ok(Math.abs(r.health-55)<1e-8);
 r.health=100;r.armor=10;receiveDamage(r,incoming,true);assert.equal(r.armor,0);assert.ok(Math.abs(r.health-77)<1e-8);
 r.health=100;r.armor=50;r.stats.armorReduction=.2;receiveDamage(r,commonEnemyFirearmDamage(20,0,0,-1),true);assert.ok(Math.abs(r.armor-44.72)<1e-8);assert.equal(r.health,100);
});

test('botiquines antiguos 0/1/2 siguen válidos, tope tres y curación no repara chaleco',()=>{
 for(const initial of [0,1,2]){const r=newRun();r.medkits=initial;while(takeMedkit(r)){}assert.equal(r.medkits,3);assert.equal(takeMedkit(r),false);r.health=20;r.armor=7;assert.ok(heal(r));assert.equal(r.health,60);assert.equal(r.armor,7);assert.equal(r.medkits,2)}
});

test('Requiem infrecuente en botín; RPG y recompensa especial del jefe conservadas',()=>{
 let req=0;for(let i=0;i<10000;i++){let call=0;const reward=normalReward(()=>call++===0?.5:call===2?.9:(i+.5)/10000);if(reward.id===9&&reward.kind==='gun')req++}assert.ok(req>=100&&req<=103);
 assert.equal(normalReward(()=>.005).id,6);assert.equal(normalReward(()=>.015).id,7);
 let i=0;const rewards=bossRewards(()=>[.5,.9,.05][i++]);assert.equal(rewards.filter(r=>r.kind==='gun'&&r.id===6).length,1);
});
