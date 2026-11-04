import {WEAPONS,type Weapon} from '../weapons/arsenal';
import type {WeightedWeapon} from './WeaponLottery';
export const MYSTERY_RARITIES=[{rarity:'common',weight:5},{rarity:'rare',weight:35},{rarity:'epic',weight:45},{rarity:'legendary',weight:15}] as const;
/** Box-only grouping: the existing uncommon revolver participates in the 5% common pool. */
export const mysteryRarity=(w:Weapon)=>w.rarity==='uncommon'?'common':w.rarity==='mythic'?'legendary':w.rarity??'common';
const individual=(id:number,rarity:string)=>rarity==='legendary'?(id===7?.08:id===6?.42:id===9?.5:1):1;
export function mysteryWeights(weapons:readonly Weapon[]=WEAPONS):WeightedWeapon[]{
 const categories=MYSTERY_RARITIES.map(r=>({...r,pool:weapons.map((w,id)=>({w,id})).filter(({w})=>mysteryRarity(w)===r.rarity)})).filter(r=>r.pool.length);
 const total=categories.reduce((n,r)=>n+r.weight,0);
 return categories.flatMap(r=>{const sum=r.pool.reduce((n,p)=>n+individual(p.id,r.rarity),0);return r.pool.map(p=>({id:p.id,weight:100*r.weight/total*individual(p.id,r.rarity)/sum}))});
}
