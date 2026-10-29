import {test} from 'node:test';import assert from 'node:assert/strict';
import {newRun,heal} from '../src/systems/run';
import {Progression} from '../src/systems/Progression';
import {UPGRADES,EMERGENCY_UPGRADES,type UpgradeContext} from '../src/systems/UpgradeCatalog';
import {xpRequired,RARITY_WEIGHTS} from '../src/config/progression';
import {magazineCapacity,fireInterval,playerDamage,dashCooldown} from '../src/systems/PlayerModifiers';
import {gun,reload,WEAPONS} from '../src/weapons/arsenal';
import {receiveDamage,takeArmor} from '../src/systems/Armor';
import {Ultimate} from '../src/systems/Ultimate';
import {Dash} from '../src/systems/Dash';
function setup(){const run=newRun(),progression=new Progression(run),guns=[gun(7)],supplies:string[]=[];const c:UpgradeContext={run,guns,addAmmo:(g,n)=>g.reserve+=n,spawnSupply:k=>supplies.push(k)};return {run,p:progression,c,supplies}}
function applyAll(id:string){const v=setup(),item=UPGRADES.find(u=>u.id===id)!;for(let i=0;i<item.maxLevel;i++){v.run.pendingLevels++;assert.ok(v.p.apply(id,[item],v.c))}v.run.pendingLevels=1;assert.equal(v.p.apply(id,[item],v.c),false);v.run.pendingLevels=0;return v}
test('XP solo por muerte, una vez por objeto, con categorías y sobrante/múltiples niveles',()=>{
 const {run,p}=setup();assert.equal(run.level,1);assert.equal(run.xp,0);const e={hp:1,tier:0,boss:-1};assert.equal(p.defeated(e),0);e.hp=0;assert.equal(p.defeated(e),10);assert.equal(p.defeated(e),0);
 for(const [tier,xp] of [[1,15],[2,15],[3,25],[4,25]])assert.equal(p.defeated({hp:0,tier,boss:-1}),xp);
 assert.equal(p.defeated({hp:0,tier:4,boss:0}),150);assert.equal(run.level,3);assert.equal(run.xp,22);assert.equal(run.pendingLevels,2);assert.deepEqual([1,2,3,4].map(xpRequired),[100,118,139,164]);
 assert.equal(p.addXP(NaN),0);assert.equal(p.addXP(-10),0);
});
test('catálogo 24 mejoras, rarezas 65/28/7 y elecciones únicas',()=>{
 const {p,c}=setup();assert.equal(UPGRADES.length,24);assert.equal(new Set(UPGRADES.map(u=>u.id)).size,24);assert.deepEqual(RARITY_WEIGHTS,{common:65,rare:28,epic:7});
 for(let seed=0;seed<100;seed++){let state=seed+1;const random=()=>((state=(state*1664525+1013904223)>>>0)/4294967296);const items=p.options(c,random);assert.equal(items.length,3);assert.equal(new Set(items.map(u=>u.id)).size,3);assert.ok(items.every(u=>u.available(c)))}
 const counts={common:0,rare:0,epic:0};for(let i=0;i<1000;i++){let n=0;const items=p.options(c,()=>n++===0?(i+.5)/1000:.3);counts[items[0].rarity]++}assert.deepEqual(counts,{common:650,rare:280,epic:70});
});
test('todos los máximos excluyen mejoras; emergencias siempre tres válidas y con efecto incluso a tope',()=>{
 const {p,c,run,supplies}=setup();for(const u of UPGRADES)run.upgrades[u.id]=u.maxLevel;
 const options=p.options(c);assert.deepEqual(options.map(u=>u.id),EMERGENCY_UPGRADES.map(u=>u.id));
 run.armor=50;for(const item of options){run.pendingLevels++;assert.ok(p.apply(item.id,options,c))}assert.deepEqual(supplies,['med','armor']);assert.equal(c.guns[0].reserve,600);
 c.guns=[];run.pendingLevels++;assert.ok(p.apply('emergency-ammo',options,c));assert.equal(supplies.at(-1),'ammo');
 delete run.upgrades.heart;assert.equal(p.options(c).length,3);assert.ok(p.options(c).some(u=>u.id==='heart'));
});
test('elección única, solo ofrecidas y aplicables; acumulación y reinicio por partida',()=>{
 const {p,c,run}=setup(),heart=UPGRADES[0];run.health=40;run.pendingLevels=1;assert.equal(p.apply('damage',[heart],c),false);assert.ok(p.apply('heart',[heart],c));assert.equal(run.health,60);assert.equal(run.stats.maxHealth,120);assert.equal(p.apply('heart',[heart],c),false);run.round=20;assert.equal(run.stats.maxHealth,120);assert.equal(newRun().stats.maxHealth,100);assert.deepEqual(newRun().upgrades,{});
});
test('límites vida/chaleco, 25 de protección por nivel y botiquín con vida ampliada',()=>{
 const heart=applyAll('heart');assert.equal(heart.run.stats.maxHealth,200);assert.equal(heart.run.health,200);
 const armor=applyAll('armor');assert.equal(armor.run.stats.maxArmor,150);assert.equal(armor.run.armor,100);takeArmor(armor.run);assert.equal(armor.run.armor,150);
 const med=applyAll('medkit');med.run.stats.maxHealth=200;med.run.health=60;assert.ok(heal(med.run));assert.equal(med.run.health,140);assert.equal(med.run.stats.medkitHeal,80);
});
test('modificadores todas las armas incluida minigun, cargadores y límites técnicos',()=>{
 const {run}=applyAll('rate');const base=run.stats;for(let id=0;id<8;id++){assert.ok(fireInterval(id,base)<WEAPONS[id].rate);assert.ok(playerDamage(WEAPONS[id].damage,applyAll('damage').run.stats,500,false,()=>1)>WEAPONS[id].damage)}assert.ok(Math.abs(fireInterval(7,base)-50/1.32)<1e-8);
 const mag=applyAll('magazine');assert.equal(magazineCapacity(7,mag.run.stats),320);assert.equal(magazineCapacity(0,mag.run.stats),16);const g=gun(7);g.ammo=0;g.reserve=400;assert.equal(reload(g,magazineCapacity(7,mag.run.stats)),320);assert.equal(g.reserve,80);
 const close=applyAll('close').run.stats;assert.ok(Math.abs(playerDamage(20,close,160,false,()=>1)-29)<1e-8);assert.equal(playerDamage(20,close,161,false,()=>1),20);
 const melee=applyAll('melee').run.stats;assert.equal(playerDamage(20,melee,30,true,()=>1),32);assert.equal(playerDamage(20,melee,30,false,()=>1),20);
 const crit=applyAll('critical').run.stats;assert.equal(playerDamage(20,crit,500,false,()=>.199),40);assert.equal(playerDamage(20,crit,500,false,()=>.201),20);
 assert.ok(Math.abs(applyAll('speed').run.stats.speed-1.2)<1e-8);
});
test('dash reduce como máximo 40% y reescala enfriamiento pendiente',()=>{
 const {run}=applyAll('dash'),d=new Dash();d.start(0,1,0);d.setCooldown(dashCooldown(run.stats),600);assert.equal(d.readyAt,960);assert.equal(d.start(959,1,0),false);assert.ok(d.start(960,1,0));assert.equal(d.readyAt,1680);assert.equal(dashCooldown(run.stats),720);
});
test('ulti mínimos y mejoras activas: 20 impactos, 32 HP/s, 16s y vida 200',()=>{
 const {run}=setup();run.stats=applyAll('charge').run.stats;const u=new Ultimate(()=>run.stats);assert.equal(u.requiredHits,20);u.charge=20;run.stats.ultimateHeal=32;run.stats.ultimateDuration=16000;run.stats.maxHealth=200;assert.ok(u.activate(0));assert.equal(u.until,16000);assert.equal(u.tick(1000,120),152);assert.equal(u.tick(2000,190),200);u.extend(1000,2000);assert.equal(u.until,17000);assert.equal(u.activeDuration,17000);
});
test('placas solo protegen daño cubierto, combinan con ulti y nunca dan invulnerabilidad',()=>{
 const {run}=applyAll('plates');run.stats.maxArmor=150;run.armor=150;const a=receiveDamage(run,100,true);assert.ok(Math.abs(a.absorbed-40.8)<1e-8);assert.equal(run.health,100);
 run.armor=20;run.health=100;const b=receiveDamage(run,100,true);assert.ok(Math.abs(b.healthDamage-(60-20/.68))<1e-8);assert.equal(run.armor,0);
 run.stats.armorReduction=1;run.armor=150;const before=run.armor;receiveDamage(run,100,true);assert.equal(before-run.armor,25);receiveDamage(run,10000,true);assert.equal(run.health,0);
});
