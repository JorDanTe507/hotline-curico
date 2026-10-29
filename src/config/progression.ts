export const RARITY_WEIGHTS={common:65,rare:28,epic:7} as const;
export type Rarity=keyof typeof RARITY_WEIGHTS;
export const XP_BY_TIER=[10,15,15,25,25,20,20,12,15,30,20,15,100,30,25,12];
export const BOSS_XP=150;
export const MAX_DAMAGE_REDUCTION=.75;
export const CLOSE_RANGE=160;
export const MIN_FIRE_INTERVALS=[160,320,60,450,100,650,900,1000/30];
export const xpRequired=(level:number)=>Math.round(100*Math.pow(1.18,level-1));
export interface PlayerStats {rerolls?:number;reloadReduction?:number;reserveBonus?:number;permanentDash?:number;permanentHealth?:number;permanentFireDamage?:number;caladaReduction?:number;tryhardMultiplier?:number;tryhardSpeed?:number;tryhardDuration?:number;maxHealth:number;maxArmor:number;damage:number;fireRate:number;speed:number;dashReduction:number;closeDamage:number;ultimateHits:number;ultimateHeal:number;ultimateDuration:number;magazine:number;medkitHeal:number;armorReduction:number;criticalChance:number;meleeDamage:number}
export const baseStats=():PlayerStats=>({maxHealth:100,maxArmor:50,damage:1,fireRate:0,speed:1,dashReduction:0,closeDamage:0,ultimateHits:40,ultimateHeal:20,ultimateDuration:12000,magazine:0,medkitHeal:40,armorReduction:0,criticalChance:0,meleeDamage:0});
