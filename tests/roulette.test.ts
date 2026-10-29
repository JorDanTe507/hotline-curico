import {test} from 'node:test';import assert from 'node:assert/strict';
import {ROULETTE_WEIGHTS} from '../src/config/roulette';
import {availableWeights,chooseWeapon} from '../src/systems/WeaponLottery';
import {gun,WEAPONS,reload} from '../src/weapons/arsenal';
import {MinigunTrigger} from '../src/weapons/Minigun';
import {WeaponCadence} from '../src/weapons/WeaponCadence';
import {normalReward,bossRewards} from '../src/systems/Loot';
import {readFileSync} from 'node:fs';

test('pesos propuestos y normalizados suman 100; dieciséis armas funcionales',()=>{
 assert.ok(Math.abs(ROULETTE_WEIGHTS.reduce((s,w)=>s+w.weight,0)-100)<1e-10);
 const weights=availableWeights();assert.equal(weights.length,16);assert.ok(Math.abs(weights.reduce((s,w)=>s+w.weight,0)-100)<1e-10);
 assert.deepEqual(weights.map(w=>w.id).sort((a,b)=>a-b),Array.from({length:16},(_,i)=>i));
 assert.ok(Math.abs(weights.find(w=>w.id===7)!.weight-1)<1e-10);
 assert.throws(()=>chooseWeapon(Math.random,[]));
});
test('selección ponderada recorre todos los intervalos y no entrega armas incompletas',()=>{
 const weights=availableWeights();let left=0;
 for(const w of weights){assert.equal(chooseWeapon(()=>(left+w.weight/2)/100),w.id);left+=w.weight}
 assert.equal(chooseWeapon(()=>0),0);assert.equal(chooseWeapon(()=>1),15);
 const counts=new Array(16).fill(0);for(let n=0;n<100000;n++)counts[chooseWeapon(()=>(n+.5)/100000)]++;
 assert.deepEqual(counts,[18000,13000,12000,11000,9000,5000,1000,1000,9000,7000,6000,3000,3000,700,700,600]);
});
test('RPG y minigun tienen cada uno 1% de botín normal, sin alterar la recompensa especial del boss',()=>{
 assert.equal(normalReward(()=>.009999).id,6);assert.equal(normalReward(()=>.01).id,7);
 assert.equal(normalReward(()=>.019999).id,7);assert.notEqual(normalReward(()=>.02).id,7);
 let rpg=0,mini=0;for(let i=0;i<10000;i++){const r=normalReward(()=>(i+.5)/10000);if(r.kind==='gun'&&r.id===6)rpg++;if(r.kind==='gun'&&r.id===7)mini++}assert.equal(rpg,100);assert.equal(mini,100);
 let i=0;const rewards=bossRewards(()=>[.5,.9,.099999][i++]);assert.equal(i,3);assert.equal(rewards.filter(w=>w.kind==='gun'&&w.id===6).length,1);
});
test('minigun: 600 ms continuos; soltar y cambiar de arma reinician; dos instancias independientes',()=>{
 const t=new MinigunTrigger(),a=gun(7),b=gun(7);assert.equal(t.hold(a,100),false);assert.equal(t.hold(a,699),false);assert.equal(t.hold(a,700),true);
 assert.equal(t.hold(b,700),false);t.retain([b]);assert.equal(t.hold(a,701),false);assert.equal(t.hold(b,1300),true);t.reset();assert.equal(t.hold(b,1301),false);
});
test('minigun entrega 20 balas por segundo a 60 FPS sin acumular deriva',()=>{
 const c=new WeaponCadence(),g=gun(7),trigger=new MinigunTrigger();let fired=0;
 for(let frame=0;frame<96;frame++){const now=frame*1000/60+.00001;if(trigger.hold(g,now)&&c.fire(g,now,50,true))fired++}
 assert.equal(fired,20);assert.equal(WEAPONS[7].damage,12);assert.equal(WEAPONS[7].mag,200);assert.equal(WEAPONS[7].reload,4000);
 g.ammo=0;g.reserve=230;assert.equal(reload(g),200);assert.equal(g.reserve,30);
});
test('minigun tiene recursos individuales, cuadros 32×32 y audio PCM',()=>{
 for(const name of ['pickup','hud','spin-0','spin-1','fire-0','fire-1','flash']){const png=readFileSync(`public/assets/weapons/minigun/${name}.png`);assert.equal(png.readUInt32BE(16),32);assert.equal(png.readUInt32BE(20),32)}
 for(const name of ['minigun','motor','reward'])assert.equal(readFileSync(`public/assets/audio/${name}.wav`).toString('ascii',0,4),'RIFF');
});
