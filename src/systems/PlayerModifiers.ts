import {CLOSE_RANGE,MIN_FIRE_INTERVALS,type PlayerStats} from '../config/progression';
import {WEAPONS} from '../weapons/arsenal';
export const magazineCapacity=(id:number,stats:PlayerStats)=>Math.max(0,Math.ceil(WEAPONS[id].mag*(1+stats.magazine)-1e-9));
export const fireInterval=(id:number,stats:PlayerStats)=>Math.max((WEAPONS[id].minInterval??MIN_FIRE_INTERVALS[id]??WEAPONS[id].rate),WEAPONS[id].rate/(1+stats.fireRate));
export const dashCooldown=(stats:PlayerStats)=>1200*(1-Math.min(.58,stats.dashReduction));
export function playerDamage(base:number,stats:PlayerStats,distance:number,melee=false,random=Math.random){return base*stats.damage*(melee?1:1+(stats.permanentFireDamage??0))*(1+(distance<=CLOSE_RANGE?stats.closeDamage:0))*(melee?1+stats.meleeDamage:1)*(random()<stats.criticalChance?2:1)}

export const reloadDuration=(milliseconds:number,stats:PlayerStats)=>milliseconds*(1-Math.min(.25,stats.reloadReduction??0));
export const reserveAmount=(amount:number,stats:PlayerStats)=>Math.ceil(amount*(1+Math.min(.8,stats.reserveBonus??0))-1e-9);
