import {test} from 'node:test';import assert from 'node:assert/strict';
import {CHARACTERS,characterById} from '../src/characters/catalog';
import {createAbility} from '../src/characters/abilities';
import {Tryhard} from '../src/systems/Tryhard';
import {Ultimate} from '../src/systems/Ultimate';
import {baseStats} from '../src/config/progression';
import {gun} from '../src/weapons/arsenal';
import {newRun} from '../src/systems/run';
import {UPGRADES,type UpgradeContext} from '../src/systems/UpgradeCatalog';
import {Progression} from '../src/systems/Progression';
import {Dash} from '../src/systems/Dash';
import {readFileSync} from 'node:fs';

test('configuración de dos protagonistas, bases independientes y recursos propios sin fumar',()=>{
 assert.deepEqual(CHARACTERS.map(c=>c.id),['cervela','nicolas']);assert.equal(characterById(undefined).id,'cervela');
 const c=characterById('nicolas');assert.equal(c.stats().maxHealth,100);assert.equal(c.stats().maxArmor,50);assert.notEqual(c.stats(),c.stats());
 assert.ok(!/cigar|fumar|humo/i.test([c.intro,c.ability.line,c.bossReply,c.bossTaunt,...c.lowHealthLines].join(' ')));
 for(const pose of Object.keys(c.normal) as (keyof typeof c.normal)[])for(const state of [c.normal,c.wounded])for(const key of state[pose]){const png=readFileSync(`public/assets/characters/nicolas/${key.slice(8)}.png`);assert.equal(png.readUInt32BE(16),68);assert.equal(png.readUInt32BE(20),128)}
 for(const key of [c.portrait,...c.woundedPortraits,c.specialPortrait])assert.ok(readFileSync(`public/assets/characters/nicolas/${key.slice(8)}.png`).length>100);
});
test('Tryhard requiere 40 impactos únicos, dura 8s, usa munición real y nunca regenera',()=>{
 const a=new Tryhard(),g=gun(0),enemy={};for(let i=0;i<40;i++){const shot=a.shot(0);assert.ok(a.hit(enemy,shot,0));assert.equal(a.hit(enemy,shot,0),false)}assert.ok(a.ready);assert.ok(a.activate(100,[g]));g.ammo--;
 assert.equal(a.tick(1100,20,[g]),20);assert.equal(a.weaponMultiplier,1.35);assert.equal(a.movementMultiplier,1.25);assert.equal(a.temporaryDashCooldown,500);assert.equal(a.infiniteAmmo,false);assert.equal(a.damageReduction,false);assert.equal(a.double([g,gun(1)],1100),false);
 assert.equal(a.tick(8100,20,[g]),20);assert.equal(g.ammo,9);assert.equal(a.active(8100),false);assert.equal(a.charge,0);
});
test('cada baja extiende 750ms, máximo total 14s; terminar/reintentar elimina bonificaciones',()=>{
 const a=new Tryhard();a.charge=40;a.activate(100);a.eliminated(200);assert.equal(a.until,8850);for(let i=0;i<30;i++)a.eliminated(200);assert.equal(a.until,14100);assert.equal(a.activeDuration,14000);a.eliminated(14100);assert.equal(a.until,14100);assert.equal(a.tick(14100,0),0);assert.equal(a.until,0);a.charge=40;a.activate(20000);assert.equal(a.until,28000);a.stop();assert.equal(a.active(20001),false);
});
test('factoría excluye definitivas simultáneas y conserva los efectos de Cervela',()=>{
 const c=createAbility(characterById('cervela'),baseStats),n=createAbility(characterById('nicolas'),baseStats);assert.ok(c instanceof Ultimate);assert.ok(n instanceof Tryhard);assert.equal(c.healRate,20);assert.equal(c.duration,12000);assert.equal(c.infiniteAmmo,true);assert.equal(c.damageReduction,true);assert.equal(c.weaponMultiplier,1);assert.equal(n.healRate,0);
});
test('Nicolás no recibe regeneración de Calada; duración Tryhard válida; carga y mejoras generales tienen efecto',()=>{
 const run=newRun(),p=new Progression(run),context:UpgradeContext={abilityModule:'tryhard',run,guns:[],addAmmo:()=>{},spawnSupply:()=>{}};
 for(let i=0;i<100;i++)assert.ok(p.options(context).every(u=>u.id!=='regen'));
 for(const id of ['regen']){run.pendingLevels=1;const u=UPGRADES.find(u=>u.id===id)!;assert.equal(p.apply(id,[u],context),false)}
 const charge=UPGRADES.find(u=>u.id==='charge')!;run.pendingLevels=1;assert.ok(p.apply('charge',[charge],context));const a=new Tryhard(()=>run.stats);assert.equal(a.requiredHits,36);const damage=UPGRADES.find(u=>u.id==='damage')!;run.pendingLevels=1;assert.ok(p.apply('damage',[damage],context));assert.equal(run.stats.damage,1.1);
});
test('dash Tryhard baja a 500ms y restaura el enfriamiento general al salir',()=>{
 const d=new Dash();d.setCooldown(500,0,true);d.start(0,1,0);assert.equal(d.readyAt,500);assert.equal(d.start(499,1,0),false);assert.equal(d.start(500,1,0),true);d.setCooldown(1200,500,true);assert.equal(d.readyAt,1700);assert.equal(d.start(1699,1,0),false);assert.equal(d.start(1700,1,0),true);
});
