// Four ordinary bare-hand hits on a 30 HP crate; actor damage is unchanged.
export const CRATE_MELEE_DAMAGE_MULTIPLIER=.375;
export const FORTUNE={crateHP:30,crateHC:50,safeTime:6000,range:90,mysteryCost:500,restTime:30000,
 crateChance:.65,safeChance:.28,mysteryChance:.12,maxCratesPerChunk:2} as const;
export const CRATE_REWARDS=[{kind:'ammo',weight:45},{kind:'med',weight:22.5},{kind:'adrenaline',weight:7.5},{kind:'hc',weight:20},{kind:'none',weight:5}] as const;
export const SAFE_RARITIES=[{rarity:'rare',weight:55},{rarity:'epic',weight:35},{rarity:'legendary',weight:9},{rarity:'mythic',weight:1}] as const;
