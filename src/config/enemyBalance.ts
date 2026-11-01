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

export const NORMAL_WEAPON_DROP_CHANCE=.35;
export const BASIC_WEAPON_PICKUP_CHANCE=.05;
export function dropsEquippedWeapon(tier:number,boss:number,random:()=>number=Math.random){return !isCommonEnemy(tier,boss)||random()<NORMAL_WEAPON_DROP_CHANCE}
/** One attempt per enemy/weapon, including a weapon unloaded and restored by streaming. */
export class WeaponPickupOpportunities {
 private attempted=new WeakSet<object>();private instanceIds=new Set<string>();
 allow(tier:number,drop:object,random:()=>number=Math.random){if(tier!==0)return true;const id=(drop as {instanceId?:string}).instanceId;if(id?this.instanceIds.has(id):this.attempted.has(drop))return false;if(id)this.instanceIds.add(id);else this.attempted.add(drop);return random()<BASIC_WEAPON_PICKUP_CHANCE}
}
