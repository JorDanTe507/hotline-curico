import {ROULETTE_WEIGHTS} from '../config/roulette';
import {WEAPONS} from '../weapons/arsenal';
export interface WeightedWeapon {id:number;weight:number}
export function availableWeights():WeightedWeapon[]{
 const available=ROULETTE_WEIGHTS.filter(w=>w.id!==null&&!!WEAPONS[w.id]&&w.weight>0);
 const total=available.reduce((sum,w)=>sum+w.weight,0);
 return available.map(w=>({id:w.id!,weight:100*w.weight/total}));
}
export function chooseWeapon(random=Math.random,weights=availableWeights()){
 if(!weights.length)throw new Error('No hay armas funcionales en la ruleta');
 const total=weights.reduce((sum,w)=>sum+w.weight,0);let ticket=Math.max(0,Math.min(1,random()))*total;
 for(const w of weights){ticket-=w.weight;if(ticket<0)return w.id}
 return weights[weights.length-1].id;
}
