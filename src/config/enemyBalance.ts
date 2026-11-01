import {ENEMIES} from '../enemies/config';
import {WEAPONS,weaponKind} from '../weapons/arsenal';

export const COMMON_FIREARM_DAMAGE_MULTIPLIER=.55;
export const BASIC_UNARMED_PICKUP_DISABLED_CHANCE=.10;

/** One roll at spawn, only for the basic matón. Special enemies retain their rules. */
export function enemyPickupPermission(tier:number,boss:number,random:()=>number=Math.random){
 if(boss>=0)return false;
 return ENEMIES[tier].pickup&&(tier!==0||random()>=BASIC_UNARMED_PICKUP_DISABLED_CHANCE);
}

export const isCommonEnemy=(tier:number,boss:number)=>boss<0&&ENEMIES[tier].behavior==='normal'&&tier!==4;
export function enemyGroundWeaponAllowed(tier:number,boss:number,id:number,permission=true){if(!permission||boss>=0||!ENEMIES[tier].pickup||!WEAPONS[id])return false;return !isCommonEnemy(tier,boss)||WEAPONS[id].rarity==='common'}

/** Source damage only: armor, resistance and ultimate are applied later, exactly once. */
export function commonEnemyFirearmDamage(base:number,weaponId:number,tier:number,boss:number){
 const common=isCommonEnemy(tier,boss);
 return base*(common&&weaponKind(weaponId)==='firearm'&&!WEAPONS[weaponId].explosive?COMMON_FIREARM_DAMAGE_MULTIPLIER:1);
}
