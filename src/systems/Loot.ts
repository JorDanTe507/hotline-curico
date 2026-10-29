import {ROULETTE_WEIGHTS} from '../config/roulette';
import {NORMAL_MINIGUN_CHANCE} from '../config/roulette';
import {NORMAL_RPG_CHANCE,BOSS_RPG_CHANCE,BOSS_MEDKIT_CHANCE} from '../config/dynamicRounds';
export interface Reward {kind:'ammo'|'gun'|'med';id:number}
export function normalReward(random= Math.random):Reward{const rarity=random();if(rarity<NORMAL_RPG_CHANCE)return {kind:'gun',id:6};if(rarity<NORMAL_RPG_CHANCE+NORMAL_MINIGUN_CHANCE)return {kind:'gun',id:7};const r=random();return {kind:r<.23?'med':r<.53?'ammo':'gun',id:ordinaryWeapon(random)}}
/** The ordinary guaranteed gun is NOT another RPG roll. Exactly one special roll. */
export function bossRewards(random= Math.random):Reward[]{const rewards:Reward[]=[{kind:'ammo',id:0},{kind:'gun',id:ordinaryWeapon(random)}];if(random()<BOSS_MEDKIT_CHANCE)rewards.push({kind:'med',id:0});if(random()<BOSS_RPG_CHANCE)rewards.push({kind:'gun',id:6});return rewards}

function ordinaryWeapon(random:()=>number){const pool=ROULETTE_WEIGHTS.filter(w=>w.id!==6&&w.id!==7);let value=random()*pool.reduce((n,w)=>n+w.weight,0);for(const w of pool){value-=w.weight;if(value<0)return w.id}return pool[pool.length-1].id}
