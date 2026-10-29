import {maxHealth} from './HealthCapacity';
import {baseStats,type PlayerStats} from '../config/progression';
import {MEDKIT_CAPACITY} from '../config/instinct';
export interface Run {seed:number;level:number;xp:number;pendingLevels:number;upgrades:Record<string,number>;stats:PlayerStats;temporaryArmor?:number;health:number;healthMultiplier?:number;armor:number;medkits:number;round:number;kills:number;bosses:number;elapsed:number}
export const newRun=():Run=>({seed:Math.floor(Math.random()*4294967296),level:1,xp:0,pendingLevels:0,upgrades:{},stats:baseStats(),health:100,healthMultiplier:1,armor:0,medkits:1,round:0,kills:0,bosses:0,elapsed:0});
export function heal(run:Run){if(run.medkits<=0||run.health>=maxHealth(run))return false;run.health=Math.min(maxHealth(run),run.health+run.stats.medkitHeal);run.medkits--;return true}
export function takeMedkit(run:Run){if(run.medkits>=MEDKIT_CAPACITY)return false;run.medkits++;return true}
