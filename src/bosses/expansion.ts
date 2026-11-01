import {TORTURADO} from '../config/dynamicRounds';
export const BOSS_DEFINITIONS=[
 {name:'EL TORTURADO',hp:450,speed:TORTURADO.speed,damage:20,weapon:3,weaponName:'Escopeta pesada',range:650,prepare:350,cooldown:1100,mag:4,
  lines:['Así que hasta aquí llegaste...','Ya que te gusta fumar... me fumaré un cigarro sobre tu cadáver.']},
 {name:'EL COMANDANTE',hp:650,speed:100,damage:12,weapon:7,weaponName:'LA TRITURADORA',range:760,prepare:700,cooldown:1800,mag:32,
  lines:['En mi ciudad no existen los héroes.','Este no es un juego, mocoso.']},
 {name:'EL DEMOLEDOR',hp:850,speed:82,damage:90,weapon:11,weaponName:'EL SEPULTURERO',range:650,prepare:900,cooldown:2300,mag:1,
  lines:['¿Sabes qué es lo bonito de una explosión? Que no queda nadie para reclamar.','Ya puedes saltar, igual explota.']},
 {name:'EL VERDUGO',hp:1000,speed:105,damage:85,weapon:5,weaponName:'SENTENCIA',range:1400,prepare:1100,cooldown:1700,mag:5,
  lines:['No necesito perseguirte. Solo necesito que te detengas.','Tan lejos y aun así vas a caer.']},
 {name:'EL CARNICERO',hp:1300,speed:70,damage:55,weapon:15,weaponName:'EL JUICIO',range:140,prepare:900,cooldown:1900,mag:0,
  lines:['Aquí no enterramos a nadie. Los hacemos desaparecer.','Ni con respawn te salvas de esta.']}
] as const;
export const BOSS_TUNING={burstShots:8,burstInterval:90,chargeDuration:1500,chargeMultiplier:4.5,carniceroEngage:550,spinDuration:1000,spinInterval:350,spinDamage:.65,slamRadius:110,spinRadius:140,contactDamage:28,contactCooldown:1100} as const;
/** HP from the supplied sheet; missing movement/attack timings are provisional configuration. */
export function expansionBossStats(index:number,round:number){const c=BOSS_DEFINITIONS[index],cycle=Math.max(0,Math.floor((round-1)/25));return {hp:Math.round(c.hp*(1+cycle*.25)),speed:c.speed*(1+cycle*.04),damage:c.damage*(1+cycle*.12)}}
export const bossName=(index:number)=>BOSS_DEFINITIONS[index]?.name??'EL TORTURADO';
export const bossAnimation=(index:number,state:string)=>index===0?`torturado-${state}`:`boss-${index}-${state}`;
export const bossTexture=(index:number,state='idle')=>index===0?`torturado-${state}-0`:`boss-${index}-${state}-0`;
