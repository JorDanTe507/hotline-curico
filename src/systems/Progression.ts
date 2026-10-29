import {BOSS_XP,XP_BY_TIER,RARITY_WEIGHTS,xpRequired,type Rarity} from '../config/progression';
import {UPGRADES,EMERGENCY_UPGRADES,type Upgrade,type UpgradeContext} from './UpgradeCatalog';
import type {Run} from './run';
export class Progression {
 private rewarded=new WeakSet<object>();
 constructor(readonly run:Run){}
 defeated(enemy:{hp:number;tier:number;boss:number}){if(enemy.hp>0||this.rewarded.has(enemy))return 0;this.rewarded.add(enemy);const xp=enemy.boss>=0?BOSS_XP:XP_BY_TIER[enemy.tier]??10;this.addXP(xp);return xp}
 addXP(amount:number){if(!Number.isFinite(amount)||amount<=0)return 0;const r=this.run;let levels=0;r.xp+=Math.floor(amount);while(r.xp>=xpRequired(r.level)){r.xp-=xpRequired(r.level);r.level++;r.pendingLevels++;levels++}return levels}
 options(context:UpgradeContext,random=Math.random,exclude:readonly string[]=[]){
  const pool=UPGRADES.filter(u=>u.available(context)&&!exclude.includes(u.id)).map(u=>context.abilityModule==='tryhard'&&u.id==='charge'?{...u,name:'Tryhard acelerado'}:context.abilityModule==='tryhard'&&u.id==='duration'?{...u,name:'Tiempo Tryhard',description:'+1 s de duración inicial. Límite total 14 s.'}:u),chosen:Upgrade[]=[];
  while(chosen.length<3&&pool.length){const rarities=(Object.keys(RARITY_WEIGHTS) as Rarity[]).filter(r=>pool.some(u=>u.rarity===r));const total=rarities.reduce((s,r)=>s+RARITY_WEIGHTS[r],0);let ticket=Math.min(.999999999,Math.max(0,random()))*total;let rarity=rarities[rarities.length-1];for(const r of rarities){ticket-=RARITY_WEIGHTS[r];if(ticket<0){rarity=r;break}}const category=pool.filter(u=>u.rarity===rarity),item=category[Math.min(category.length-1,Math.floor(Math.max(0,random())*category.length))];chosen.push(item);pool.splice(pool.indexOf(item),1)}
  for(const item of EMERGENCY_UPGRADES)if(chosen.length<3)chosen.push(item);
  return chosen;
 }
 apply(id:string,offered:readonly Upgrade[],context:UpgradeContext){const item=offered.find(u=>u.id===id);if(!this.run.pendingLevels||!item||!item.available(context))return false;item.apply(context);this.run.upgrades[id]=(this.run.upgrades[id]??0)+1;this.run.pendingLevels--;return true}
}

