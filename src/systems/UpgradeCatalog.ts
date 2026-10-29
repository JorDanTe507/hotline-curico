import {maxHealth,healthMultiplier} from './HealthCapacity';
import type {Run} from './run';
import {isMelee,type Gun} from '../weapons/arsenal';
import type {Rarity} from '../config/progression';
import {magazineCapacity} from './PlayerModifiers';
export interface UpgradeContext {abilityModule?:string;run:Run;guns:Gun[];addAmmo:(gun:Gun,amount:number)=>void;spawnSupply:(kind:'med'|'armor'|'ammo')=>void}
export interface Upgrade {characters?:readonly string[];id:string;name:string;description:string;icon:string;rarity:Rarity;maxLevel:number;currentLevel:(c:UpgradeContext)=>number;apply:(c:UpgradeContext)=>void;available:(c:UpgradeContext)=>boolean;repeatable?:boolean}
function perk(id:string,name:string,description:string,icon:string,rarity:Rarity,maxLevel:number,apply:Upgrade['apply']):Upgrade{return {characters:id==='regen'?['cervela']:['cervela','nicolas'],id,name,description,icon,rarity,maxLevel,apply,currentLevel:c=>c.run.upgrades[id]??0,available:c=>(c.run.upgrades[id]??0)<maxLevel&&!(c.abilityModule==='tryhard'&&['regen'].includes(id))}}
export const UPGRADES:Upgrade[]=[
 perk('heart','Corazón de acero','+20 vida máxima y cura 20 HP.','medkit','epic',5,({run:r})=>{r.stats.maxHealth=Math.min(200+(r.stats.permanentHealth??0),r.stats.maxHealth+20);r.health=Math.min(maxHealth(r),r.health+20*healthMultiplier(r))}),
 perk('armor','Blindaje reforzado','+25 de capacidad máxima de chaleco. Otorga 25 puntos.','armor','rare',4,({run:r})=>{r.stats.maxArmor=Math.min(150,r.stats.maxArmor+25);r.armor=Math.min(r.stats.maxArmor,r.armor+25)}),
 perk('damage','Balas reforzadas','+10% de daño.','weapon-0','rare',5,({run:r})=>{r.stats.damage+=.1}),
 perk('rate','Gatillo rápido','+8% de disparos por segundo, con límite por arma.','weapon-7','common',4,({run:r})=>{r.stats.fireRate+=.08}),
 perk('speed','Reflejos felinos','+5% de velocidad de movimiento.','walk1','common',4,({run:r})=>{r.stats.speed+=.05}),
 perk('dash','Dash mejorado','−10% de enfriamiento del dash.','back','rare',4,({run:r})=>{r.stats.dashReduction=Math.min(.58,r.stats.dashReduction+.1)}),
 perk('close','Furia de combate','+15% de daño a enemigos a 160 px o menos.','shoot','rare',3,({run:r})=>{r.stats.closeDamage+=.15}),
 perk('charge','Última Calada acelerada','−4 impactos para cargar la ulti. Mínimo: 20.','ultimate-special','rare',5,({run:r})=>{r.stats.ultimateHits=Math.max(20,r.stats.ultimateHits-4)}),
 perk('regen','Recuperación extrema','+3 HP/s de regeneración durante la ulti.','medkit','epic',4,({run:r})=>{r.stats.ultimateHeal+=3}),
 perk('duration','Tiempo prestado','+1 segundo de duración de Última Calada.','ultimate-special','epic',4,({run:r})=>{r.stats.ultimateDuration+=1000;r.stats.tryhardDuration=Math.min(14000,(r.stats.tryhardDuration??8000)+1000)}),
 perk('magazine','Munición adicional','+15% de capacidad de cargador; no rellena el actual.','ammo','common',4,({run:r})=>{r.stats.magazine+=.15}),
 perk('medkit','Primeros auxilios','+10 HP de curación por botiquín.','medkit','common',4,({run:r})=>{r.stats.medkitHeal+=10}),
 perk('plates','Placas resistentes','−8% de daño sobre la parte protegida por el chaleco.','armor','common',4,({run:r})=>{r.stats.armorReduction+=.08}),
 perk('critical','Puntería letal','+5 puntos porcentuales de crítico. Los críticos infligen ×2.','weapon-5','epic',4,({run:r})=>{r.stats.criticalChance+=.05}),
 perk('melee','Ejecutor','+15% de daño cuerpo a cuerpo. Golpea desarmado con clic.','hurt','common',4,({run:r})=>{r.stats.meleeDamage+=.15}),
 perk('secondChance','Segunda oportunidad','Evita una muerte: 1 HP y 2 s de inmunidad. Una vez por partida.','medkit','epic',1,()=>{}),
 perk('ghostBullet','Bala fantasma','15 / 25 / 35% de atravesar; segundo objetivo recibe 50%.','weapon-5','epic',3,()=>{}),
 perk('bloodlust','Sed de sangre','Cura por baja: Cervela 3/5/7; Nicolás 2/3/4 HP. Cada 1 s.','hurt','epic',3,()=>{}),
 perk('emergencyShield','Blindaje de emergencia','Bajo 30% HP: 25/35/45 de protección temporal. Una vez por ronda.','armor','rare',3,()=>{}),
 perk('explosiveAmmo','Munición explosiva','5 / 8 / 12% de explosión secundaria pequeña; sin daño propio.','weapon-6','rare',3,()=>{}),
 perk('killerInstinct','Instinto asesino','Baja: +10/15/20% de velocidad durante 3 s; no se acumula.','walk1','rare',3,()=>{}),
 perk('tacticalReload','Recarga táctica','−5% tiempo de recarga. Máximo −25%.','ammo','common',5,({run:r})=>{r.stats.reloadReduction=(r.stats.reloadReduction??0)+.05}),
 perk('brutalThrow','Lanzamiento brutal','+10 daño arrojado y +0,25 s de aturdimiento por nivel.','weapon-13','common',3,()=>{}),
 perk('deepPockets','Bolsillos profundos','+20% munición de reserva recibida. No cambia el cargador.','ammo','common',4,({run:r})=>{r.stats.reserveBonus=(r.stats.reserveBonus??0)+.2}),
];
export const EMERGENCY_UPGRADES:Upgrade[]=[
 {...perk('emergency-health','Segundo aliento','Cura 30 HP. Con vida completa, deja un botiquín en el suelo.','medkit','common',Infinity,c=>{if(c.run.health<maxHealth(c.run))c.run.health=Math.min(maxHealth(c.run),c.run.health+30);else c.spawnSupply('med')}),repeatable:true},
 {...perk('emergency-armor','Placas de emergencia','Repara 50 de chaleco. Si está completo, deja uno en el suelo.','armor','common',Infinity,c=>{if(c.run.armor<c.run.stats.maxArmor)c.run.armor=Math.min(c.run.stats.maxArmor,c.run.armor+50);else c.spawnSupply('armor')}),repeatable:true},
 {...perk('emergency-ammo','Reserva de munición','Un cargador de reserva por arma compatible. Sin ellas, deja munición.','ammo','common',Infinity,c=>{const guns=c.guns.filter(g=>g.id!==6&&!isMelee(g.id));if(guns.length)for(const g of guns)c.addAmmo(g,magazineCapacity(g.id,c.run.stats));else c.spawnSupply('ammo')}),repeatable:true},
];

