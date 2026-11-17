import type {Run} from '../systems/run';
import {ENEMIES} from '../enemies/config';
export const level=(r:Run,id:string)=>r.roguelite?Math.max(0,r.upgrades[id]??0):0;
export const value=(r:Run,id:string,values:readonly number[])=>values[Math.min(values.length-1,level(r,id))]??values[0];
/** Only Traditional opts into these rules. Rush continues using its existing statistics. */
export const ROGUE_RULES={
 cellular:[0,.5,1,1.5,2],piercing:[1,1.1,1.2,1.3],ghostReduction:[0,.1,.15,.2],ghostMs:[0,1000,1500,2000],
 criticalReduction:[0,.1,.15,.2],breathReduction:[0,.1,.15],breathSpeed:[1,1.1,1.2],breathMs:[0,3000,4000],
 reload:[0,.05,.1,.18,.25],explosive:[1,1.1,1.2,1.3],regen:[0,3,6,10,15],
 caladaDuration:[0,2000,4000,6000],tryhardDuration:[0,2000,4000,6000],titan:[0,.75,1.5,2.25,3],wall:[0,.1,.2],
 smokerStacks:[0,5,10],smokerMs:[0,3000,4500],actions:[10,12,15,17,20],judgmentTime:[0,1000,2000,4000],
 furyStacks:[20,20,25,30,35],magnet:[0,40,80,120,180],
} as const;
export const passiveRate=(r:Run)=>value(r,'cellular',ROGUE_RULES.cellular)+(level(r,'heart')>=5?.2:0);
export const armorCapacity=(r:Run,armor=level(r,'armor'),fortress=level(r,'v19-fortress'))=>Math.round((50+25*armor)*(fortress?1.5:1));
export const tryhardBonus=(r:Run)=>value(r,'nicolas-duration',ROGUE_RULES.tryhardDuration);
export const tryhardLimit=(r:Run)=>14000+tryhardBonus(r);
export const actionLimit=(r:Run)=>value(r,'jordan-actions',ROGUE_RULES.actions);
export const armored=(e:{tier:number;boss:number})=>e.boss<0&&ENEMIES[e.tier]?.behavior==='shield';
export const piercingDamage=(r:Run,e:{tier:number;boss:number},amount:number,primary:boolean)=>primary&&armored(e)?amount*value(r,'piercing',ROGUE_RULES.piercing):amount;
export const traditionalXP=(level:number)=>level<=10?Math.round(100*1.18**(level-1)):Math.round(100*1.18**9*(1+.16*(level-10)+.006*(level-10)**2));
