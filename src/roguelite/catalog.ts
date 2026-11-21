import {magneticProfile} from '../economy/CoinLedger';
import type {Upgrade,UpgradeContext} from '../systems/UpgradeCatalog';
import {maxHealth,healthMultiplier} from '../systems/HealthCapacity';
import {createAbility} from '../characters/abilities';
import {characterById} from '../characters/catalog';
import {passiveRate} from './rules';
import {ROGUE_RULES as R,armorCapacity} from './rules';
interface Evolution {name?:string;max?:number;icon?:string;values:readonly string[];special?:string;apply?:Upgrade['apply'];hidden?:boolean;characters?:readonly string[]}
const pct=(n:number)=>`${Math.round(n*100)} %`;
const numeric=(values:readonly number[],unit:string)=>values.map(n=>`${n}${unit}`);
export const EVOLUTIONS:Record<string,Evolution>={
 ghostBullet:{values:['Sin perforación adicional','15 % de atravesar a un segundo objetivo al 50 %','25 % de atravesar a un segundo objetivo al 50 %','35 % de atravesar a un segundo objetivo al 50 %']},
 bloodlust:{values:['Sin curación por baja','Cervela 3 HP; Nicolás/Jordan 2 HP por baja','Cervela 5 HP; Nicolás/Jordan 3 HP por baja','Cervela 7 HP; Nicolás/Jordan 4 HP por baja']},
 emergencyShield:{values:numeric([0,25,35,45],' protección temporal bajo 30 % HP')},
 explosiveAmmo:{values:numeric([0,5,8,12],' % de explosión secundaria')},
 killerInstinct:{values:['Sin impulso por baja','+10 % movimiento 3 s; dash restante −20 %','+15 % movimiento 3 s; dash restante −20 %','+20 % movimiento 3 s; dash restante −20 %']},
 brutalThrow:{values:['Sin daño adicional de arma arrojada','+10 daño y +0,25 s de aturdimiento','+20 daño y +0,5 s de aturdimiento','+30 daño y +0,75 s de aturdimiento']},
 'jordan-pulse':{values:['2,5 s entre acciones','2,75 s entre acciones','3 s entre acciones','3,25 s entre acciones','3,5 s entre acciones']},
 heart:{values:numeric([0,20,40,60,80,100],' HP máximos'),special:'Máximo: regeneración pasiva +0,2 HP/s.'},
 armor:{values:numeric([0,25,50,75,100],' capacidad de chaleco'),special:'Capacidad recalculada con Fortaleza; independiente del orden.',apply:({run:r})=>{r.stats.maxArmor=armorCapacity(r,(r.upgrades.armor??0)+1);r.armor=Math.min(r.stats.maxArmor,r.armor+25)}},
 'v19-fortress':{values:['Sin multiplicador','Capacidad de chaleco ×1,5; +20 por ronda'],apply:({run:r})=>{r.stats.maxArmor=armorCapacity(r,r.upgrades.armor??0,1)}},
 damage:{values:numeric([0,10,20,30,40,50],' % daño'),special:'Máximo: +10 % daño primario contra enemigos bajo 25 % HP.'},
 rate:{values:numeric([0,8,16,24,32],' % cadencia'),special:'Máximo: +5 puntos porcentuales de crítico.',apply:c=>{c.run.stats.fireRate+=.08;if((c.run.upgrades.rate??0)===3)c.run.stats.criticalChance+=.05}},
 speed:{values:numeric([0,5,10,15,20],' % movimiento'),special:'Máximo: +8 % movimiento durante 2 s después de un dash.'},
 dash:{values:numeric([0,10,20,30,40],' puntos de reducción del dash'),special:'Máximo: dash recupera 1 HP, cada 8 s.'},
 close:{values:numeric([0,15,30,45],' % daño a ≤160 px'),special:'Máximo: +10 % daño con armas cuerpo a cuerpo.',apply:c=>{c.run.stats.closeDamage+=.15;if((c.run.upgrades.close??0)===2)c.run.stats.meleeDamage+=.1}},
 medkit:{values:numeric([40,50,60,70,90],' HP por botiquín'),special:'Máximo: +10 HP adicionales por botiquín.',apply:c=>{c.run.stats.medkitHeal+=(c.run.upgrades.medkit??0)===3?20:10}},
 magazine:{values:numeric([0,15,30,45,60],' % capacidad compatible'),special:'Máximo: recargas convencionales duran 10 % menos.'},
 plates:{values:numeric([0,8,16,24,35],' % mitigación protegida'),special:'Máximo: +3 puntos extra de mitigación de chaleco.',apply:c=>{c.run.stats.armorReduction+=(c.run.upgrades.plates??0)===3?.11:.08}},
 critical:{values:numeric([0,5,10,15,20],' % crítico'),special:'Máximo: daño crítico ×2,2.',apply:c=>{c.run.stats.criticalChance+=.05;if((c.run.upgrades.critical??0)===3)c.run.stats.criticalMultiplier=2.2}},
 tacticalReload:{max:4,icon:'rogue-reload',values:R.reload.map(n=>`${pct(n)} menos tiempo de recarga`),special:'Máximo: +15 % daño durante 2 s al completar una recarga.',apply:c=>{const n=c.run.upgrades.tacticalReload??0;c.run.stats.reloadReduction=(c.run.stats.reloadReduction??0)+R.reload[Math.min(4,n+1)]-R.reload[Math.min(4,n)]}},
 'v19-last-breath':{name:'Último aliento',max:2,icon:'rogue-breath',values:['Sin efecto','Bajo 25 % HP: −10 % daño y +10 % movimiento, 3 s','Bajo 25 % HP: −15 % daño y +20 % movimiento, 4 s'],special:'Reutilización de 15 s; no sustituye salvaciones mortales.'},
 'v19-survival-instinct':{name:'Instinto de supervivencia II',max:3,icon:'rogue-survival',values:['Sin efecto','Bajo 30 % HP: −10 % daño','Bajo 30 % HP: −15 % daño','Bajo 30 % HP: −20 % daño; protección adicional al entrar'],special:'Conserva una salvación por ronda. N3: −20 % adicional durante 1 s, cada 15 s.'},
 'v19-killing-machine':{name:'Furia acumulada',max:4,icon:'rogue-fury',values:['Sin racha','Hasta 20 cargas ×2 % daño','Hasta 25 cargas ×2 % daño','Hasta 30 cargas ×2 % daño','Hasta 35 cargas ×2 % daño; máximo da +15 % cadencia'],special:'Cada baja renueva 12 s. Conserva el potencial original del primer nivel.'},
 regen:{name:'Pulmones de hierro',max:4,icon:'rogue-lungs',values:R.regen.map(n=>`+${n} HP/s durante Última Calada`),apply:c=>{const n=c.run.upgrades.regen??0;c.run.stats.ultimateHeal+=(R.regen[Math.min(4,n+1)]-R.regen[Math.min(4,n)])/.6}},
 'jordan-borrowed':{name:'Tiempo prestado',max:3,icon:'rogue-time',values:R.judgmentTime.map(n=>`+${n/1000} s de Juicio Final`)},
 'jordan-breath':{name:'Veredicto absoluto',icon:'rogue-verdict',values:['8 % del máximo por ejecución confirmada','10 % del máximo por ejecución confirmada','12 % del máximo por ejecución confirmada'],special:'Se conserva el porcentaje real y las mejoras permanentes; límite 12 %.'},
};
interface NewRow {id:string;name:string;rarity:Upgrade['rarity'];values:readonly string[];icon:string;characters?:readonly string[];special?:string;hidden?:boolean}
const rows:NewRow[]=[
 {id:'cellular',name:'Regeneración celular',rarity:'common',values:R.cellular.map(n=>`+${n} HP/s pasivos`),icon:'cellular'},
 {id:'piercing',name:'Munición perforante',rarity:'rare',values:R.piercing.map(n=>`+${Math.round((n-1)*100)} % daño contra matones blindados`),icon:'piercing'},
 {id:'ghost-step',name:'Paso fantasma',rarity:'rare',values:['Sin protección posterior','−10 % daño durante 1 s después del dash','−15 % daño durante 1,5 s después del dash','−20 % daño durante 2 s después del dash'],icon:'ghost',special:'Empieza al terminar el dash; no modifica su invulnerabilidad.'},
 {id:'magnet',name:'Atracción magnética',rarity:'uncommon',values:['Radio base','Campo magnético · +24 px','Polaridad mejorada · +48 px; velocidad +20 %','Magnetismo avanzado · +72 px; velocidad +40 %','Núcleo magnético · +104 px; velocidad +65 %'],icon:'magnet',special:'Radio combinado máximo 192 px. No aumenta el valor de los HC.'},
 {id:'explosive-gunner',name:'Artillero explosivo',rarity:'rare',values:['Sin mejora','+10 % daño de fragmentación','+20 % daño de fragmentación','+30 % daño y +8 % radio de fragmentación'],icon:'explosive',special:'No convierte Molotov, flash, eléctrica ni cuchillo en explosivos.'},
 {id:'cervela-duration',name:'Humo interminable',rarity:'epic',values:R.caladaDuration.map(n=>`+${n/1000} s de Última Calada`),icon:'smoke',characters:['cervela']},
 {id:'cervela-smoker',name:'Fumador compulsivo',rarity:'legendary',values:['Sin racha de definitiva','Bajas en Calada: +3 % daño, hasta 5 cargas, 3 s','Bajas en Calada: +3 % daño, hasta 10 cargas, 4,5 s'],icon:'smoker',characters:['cervela'],special:'Desaparece al acabar Calada; no cambia la munición infinita.'},
 {id:'nicolas-titan',name:'Titán de acero',rarity:'epic',values:R.titan.map(n=>`Multiplicador de vida Tryhard +${n}`),icon:'titan',characters:['nicolas'],special:'N4: 1000 HP con base 100 y sin otras mejoras. Conserva fracción de HP.'},
 {id:'nicolas-duration',name:'Partida interminable',rarity:'epic',values:R.tryhardDuration.map(n=>`+${n/1000} s iniciales y al límite de Tryhard`),icon:'party',characters:['nicolas']},
 {id:'nicolas-wall',name:'Muro imparable',rarity:'legendary',values:['Sin resistencia Tryhard','−10 % daño durante Tryhard','−20 % daño durante Tryhard'],icon:'wall',characters:['nicolas'],special:'La mitigación roguelite combinada tiene techo 60 % antes del chaleco.'},
 {id:'jordan-actions',name:'Sentencia múltiple',rarity:'rare',values:R.actions.map(n=>`${n} acciones máximas por Juicio Final`),icon:'sentence',characters:['jordan']},
];
export const NEW_TRADITIONAL_UPGRADES:Upgrade[]=rows.map(row=>{const definition:Evolution={...row,icon:'rogue-'+row.icon,max:row.values.length-1};EVOLUTIONS[row.id]=definition;return{id:row.id,name:row.name,description:row.special??row.values[1],icon:row.id==='magnet'?'hc-magnet-perk':definition.icon!,rarity:row.rarity,maxLevel:definition.max!,characters:row.characters??['cervela','nicolas','jordan'],currentLevel:c=>c.run.upgrades[row.id]??0,available:c=>!!c.run.roguelite&&!row.hidden&&(c.run.upgrades[row.id]??0)<definition.max!&&(!row.characters||row.characters.includes(character(c))),apply:()=>{}}});
const character=(c:UpgradeContext)=>({calada:'cervela',tryhard:'nicolas',judgment:'jordan'}[c.abilityModule??'']??'');
export function evolve(u:Upgrade):Upgrade {const d=EVOLUTIONS[u.id];if(!d)return u;return {...u,name:d.name??u.name,icon:d.icon??u.icon,maxLevel:d.max??u.maxLevel,description:d.special??u.description,available:c=>(!u.characters||u.characters.includes(character(c)))&&(c.run.upgrades[u.id]??0)<(d.max??u.maxLevel)&&!d.hidden&&(u.id!=='regen'||c.abilityModule==='calada')&&(u.id!=='duration'||c.abilityModule!=='judgment'),apply:d.apply??u.apply}}
export function evolutionPreview(u:Upgrade,c:UpgradeContext){const d=EVOLUTIONS[u.id],n=u.currentLevel(c),next=Math.min(u.maxLevel,n+1);
 const first=structuredClone(c.run),last=structuredClone(c.run);u.apply({...c,run:last,guns:c.guns.map(g=>({...g})),addAmmo:()=>{},spawnSupply:()=>{}});last.upgrades[u.id]=next;
 const stat:Record<string,string>={heart:'maxHealth',armor:'maxArmor','v19-fortress':'maxArmor',damage:'damage',rate:'fireRate',speed:'speed',dash:'dashReduction',close:'closeDamage',medkit:'medkitHeal',magazine:'magazine',plates:'armorReduction',critical:'criticalChance',tacticalReload:'reloadReduction'};
 const effective=(r:typeof c.run)=>{const stats=r.stats as unknown as Record<string,number>;if(stat[u.id]){const key=stat[u.id],percent=['fireRate','dashReduction','closeDamage','magazine','armorReduction','criticalChance','reloadReduction'].includes(key);return `${Math.round((stats[key]??0)*(percent?100:1000))/(percent?1:1000)}${percent?' %':key==='maxHealth'||key==='medkitHeal'?' HP':key==='damage'||key==='speed'?' ×':' de chaleco'}`}
 const ability=createAbility(characterById(character(c)),()=>r.stats,()=>r);if(['cervela-duration','nicolas-duration','jordan-borrowed','duration'].includes(u.id))return `${ability.duration/1000} s de definitiva`;if(u.id==='regen')return `${ability.healRate} HP/s en Calada`;if(u.id==='magnet'){const m=magneticProfile(r.stats.magnetLevel,r.upgrades.magnet);return `${m.radius} px · atracción ×${m.speed}`}if(u.id==='cellular')return `${passiveRate(r)} HP/s pasivos`;if(u.id==='nicolas-titan')return `${Math.round(r.stats.maxHealth*((r.stats.tryhardMultiplier??5)+2+R.titan[Math.min(4,r.upgrades[u.id]??0)]))} HP temporales`;if(u.id==='jordan-pulse')return `${(ability as import('../v20/Judgment').Judgment).chainDuration/1000} s entre acciones`;if(u.id==='jordan-breath')return `${Math.round(((ability as import('../v20/Judgment').Judgment).executionHeal)*1000)/10} % HP por ejecución confirmada`;return undefined};
 const beforeValue=effective(first),afterValue=effective(last);if(beforeValue!==undefined&&afterValue!==undefined)return {current:beforeValue,next:afterValue,special:next===u.maxLevel?d?.special:undefined};
 if(d)return {current:d.values[Math.min(n,d.values.length-1)],next:d.values[Math.min(next,d.values.length-1)],special:next===u.maxLevel?d.special:undefined};
 const before=structuredClone(c.run),after=structuredClone(c.run);u.apply({...c,run:after,guns:c.guns.map(g=>({...g})),addAmmo:()=>{},spawnSupply:()=>{}});after.upgrades[u.id]=(after.upgrades[u.id]??0)+1;
 const changed=(Object.keys(after.stats) as (keyof typeof after.stats)[]).filter(k=>after.stats[k]!==before.stats[k]);const labels:Record<string,string>={maxHealth:'HP máximos',maxArmor:'Chaleco máximo',damage:'Daño ×',fireRate:'Cadencia adicional',speed:'Movimiento ×',dashReduction:'Reducción dash',closeDamage:'Daño cercano',ultimateHits:'Impactos de carga',ultimateDuration:'Duración (ms)',ultimateHeal:'Regeneración base',magazine:'Cargador adicional',medkitHeal:'HP/botiquín',armorReduction:'Reducción protegida',criticalChance:'Probabilidad crítica',meleeDamage:'Daño melee adicional',reloadReduction:'Reducción recarga',reserveBonus:'Reserva adicional'};
 const fmt=(r:typeof c.run)=>changed.map(k=>`${labels[k]??k}: ${Math.round((r.stats[k]??0)*1000)/1000}`).join(' · ');return {current:changed.length?fmt(before):n?`Nivel ${n}`:'Sin efecto adquirido',next:changed.length?fmt(after):u.description,special:undefined};
}
