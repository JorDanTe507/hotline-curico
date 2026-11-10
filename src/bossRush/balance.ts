import {WEAPONS} from '../weapons/arsenal';
import {chooseWeapon, type WeightedWeapon} from '../systems/WeaponLottery';
import {endlessScale} from './endless';

// Health, damage, speed, recovery, windup and reload. These apply only to Rush.
const tuning = [
  [1.12,1.18,1.32,.72,.87,.76],
  [1.16,1.23,1.30,.68,.91,.61],
  [1.13,1.15,1.32,.72,.94,.72],
  [1.12,1.17,1.27,.75,.94,.53],
  [1.17,1.24,1.36,.68,.89,.74],
  [1.15,1.16,1.24,.80,.94,.80],
] as const;
export function rushTuning(boss:number,cycle=1,double=false) {
  const [hp,damage,speed,recovery,warning,reload]=tuning[boss];
  const [healthScale,damageScale,speedScale]=endlessScale(cycle);
  return {hp:hp*healthScale*(double?.92:1),damage:damage*damageScale*(double?.90:1),speed:speed*speedScale,recovery,warning,reload};
}

export type LootTier='early'|'late'|'endless'|'double';
const pools:Record<LootTier,readonly number[]> = {
  early:[62,27,10,.9,.1], late:[30,24,31,13,2],
  endless:[24,22,32,17,5], double:[28,24,30,15,3],
};
const rarities=['common','uncommon','rare','epic','legendary'];
export function rushWeights(tier:LootTier, roulette=false):WeightedWeapon[] {
  const totals=roulette&&tier==='early'?[54,27,15,3,1]:pools[tier];
  return rarities.flatMap((rarity,i)=>{
    const ids=WEAPONS.flatMap((weapon,id)=>weapon.rarity===rarity?[id]:[]);
    return ids.map(id=>({id,weight:totals[i]/ids.length}));
  });
}
export function rushRewards(tier:LootTier,random=Math.random) {
  const result:{kind:'gun'|'ammo'|'med';id:number}[]=[{kind:'ammo',id:0}];
  if(tier!=='double'||random()<.7)result.push({kind:'gun',id:chooseWeapon(random,rushWeights(tier))});
  if(random()<(tier==='endless'?.18:.28))result.push({kind:'med',id:0});
  return result;
}
