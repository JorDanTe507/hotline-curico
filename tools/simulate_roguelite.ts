import {writeFileSync} from 'node:fs';
import {Progression} from '../src/systems/Progression';import {newRun} from '../src/systems/run';import {roundPlan} from '../src/systems/RoundState';import {ENEMIES,enemyTier} from '../src/enemies/config';import {bossIndex} from '../src/bosses/config';import {BOSS_XP_BY_TYPE,XP_BY_TIER} from '../src/config/progression';
let seed=7319;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
const rows:object[]=[];
for(const module of ['calada','tryhard','judgment'])for(const rate of [.35,.7,1])for(const share of [1,.5]){
 const run=newRun(),legacy=newRun();run.roguelite=true;const p=new Progression(run),old=new Progression(legacy),context={run,abilityModule:module,guns:[],addAmmo:()=>{},spawnSupply:()=>{}};let xp=0,kills=0,carry=0;
 const priority=['heart','cellular','armor','tacticalReload','regen','nicolas-titan','jordan-actions','jordan-breath','damage','piercing'];
 const choose=()=>{while(run.pendingLevels){const options=p.options(context,random);options.sort((a,b)=>{const score=(u:typeof a)=>(run.upgrades[u.id]??0)*2+(priority.includes(u.id)?20-priority.indexOf(u.id):0);return score(b)-score(a)});if(!p.apply(options[0].id,options,context))throw Error('Blocked level')}};
 const award=(amount:number)=>{carry+=amount*share;const grant=Math.floor(carry);carry-=grant;p.addXP(grant);old.addXP(grant);xp+=grant;choose();legacy.pendingLevels=0};
 for(let round=1;round<=60;round++){
  run.round=round;const plan=roundPlan(round);if(plan.type==='BOSS'){award(BOSS_XP_BY_TYPE[bossIndex(round)]);kills++}else{
   const count=plan.type==='EXTERMINIO'?plan.target:Math.floor(plan.duration/1000*rate);
   for(let i=0;i<count;i++){const tier=enemyTier(round,random());award(XP_BY_TIER[tier]);const impacts=Math.ceil(ENEMIES[tier].hp/35);award(impacts*2.4);kills++}
  }
  if([10,20,30,40,60].includes(round))rows.push({module,killsPerSecond:rate,xpShare:share,round,kills,xp,oldLevel:legacy.level,level:run.level,choices:run.level-1,maxed:Object.entries(run.upgrades).filter(([id,n])=>p.options(context,()=>0).find(u=>u.id===id)?.maxLevel===n).length,upgrades:{...run.upgrades}});
 }
}
// Count maxima from the actual catalog rather than from a random offer.
import {UPGRADES} from '../src/systems/UpgradeCatalog';import {NEW_TRADITIONAL_UPGRADES,evolve} from '../src/roguelite/catalog';
const catalog=[...UPGRADES.map(evolve),...NEW_TRADITIONAL_UPGRADES];for(const row of rows as any[]){row.maxedEvolutions=Object.entries(row.upgrades).filter(([id,n])=>{const u=catalog.find(u=>u.id===id);return u&&u.maxLevel>1&&u.maxLevel===n}).length;row.maxed=Object.entries(row.upgrades).filter(([id,n])=>catalog.find(u=>u.id===id)?.maxLevel===n).length;}
writeFileSync('test-results/roguelite-simulation.json',JSON.stringify({assumptions:'XP model, not AI combat: exact roundPlan and tier weights; 0.35/0.7/1 kills/s during survival; base enemy HP/35 damage estimates impact XP; half-share models balanced co-op attribution; boss kill XP only; no changes to HC or enemy difficulty.',rows},null,2));
console.log('module | rate | XP share | round | old level | new level | maxed perks');for(const r of rows as any[])if(r.killsPerSecond===.7)console.log([r.module,r.killsPerSecond,r.xpShare,r.round,r.oldLevel,r.level,r.maxed].join(' | '));
