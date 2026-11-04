export const HIT_XP_BASE=2;
export const HIT_XP_MULTIPLIER=1.20;
export const RARITY_WEIGHTS={common:60,uncommon:22,rare:13,epic:4.5,legendary:.5} as const;
export type Rarity=keyof typeof RARITY_WEIGHTS;
export const XP_BY_TIER=[10,18,28,48,64,26,34,16,22,52,28,24,110,42,32,16,30];
export const BOSS_XP_BY_TYPE=[180,230,280,330,400];
export const MAX_DAMAGE_REDUCTION=.75;
export const CLOSE_RANGE=160;
export const MIN_FIRE_INTERVALS=[160,320,60,450,100,650,900,1000/30];
export const xpRequired=(level:number)=>Math.round(100*Math.pow(1.18,level-1));
export interface PlayerStats {judgmentHeal?:number;judgmentChain?:number;judgmentDuration?:number;rerolls?:number;reloadReduction?:number;reserveBonus?:number;permanentDash?:number;permanentHealth?:number;permanentFireDamage?:number;caladaReduction?:number;tryhardMultiplier?:number;tryhardSpeed?:number;tryhardDuration?:number;maxHealth:number;maxArmor:number;damage:number;fireRate:number;speed:number;dashReduction:number;closeDamage:number;ultimateHits:number;ultimateHeal:number;ultimateDuration:number;magazine:number;medkitHeal:number;armorReduction:number;criticalChance:number;meleeDamage:number}
export const baseStats=():PlayerStats=>({maxHealth:100,maxArmor:50,damage:1,fireRate:0,speed:1,dashReduction:0,closeDamage:0,ultimateHits:40,ultimateHeal:20,ultimateDuration:12000,magazine:0,medkitHeal:40,armorReduction:0,criticalChance:0,meleeDamage:0});
