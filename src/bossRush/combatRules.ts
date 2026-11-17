export const BOSS_COMBAT = {
  torturedPhase: {threshold:.5,cadence:.82,reload:.8},
  melee: {range:92, warning:380, cooldown:2100, damage:18, knockSpeed:185, knockMs:170},
  suppression: {duration:5200, interval:110, turnRate:1.0, recovery:1700},
  radio: {call:1450,calls:2, threshold:.5, damageInterrupt:60, cooldown:22000, count:3, doubleCount:2, maxAlive:3, medicChance:.35},
  medic: {duration:12000, budget:60},
  bombardment: {waves:3, impacts:20, call:1600, cooldown:24000, warning:850, stagger:45, interval:450, radius:160, safeRadius:36, damage:110},
  sniper: {headshotChance:.20, damage:90, cueMs:300, toolCooldown:9500, blindMs:550, blindImmunity:4000},
  butcher: {meleeRange:112, slamRadius:158, warning:950, slamCooldown:10000, stunMs:300, stunImmunity:2500,
    macheteCooldown:6500, macheteRange:620, recovery:1500,phaseCooldown:.82,phaseRecovery:.85,followupWarning:600},
} as const;

export function rollHeadshot(random:()=>number=Math.random) {
  return random()<BOSS_COMBAT.sniper.headshotChance;
}

/** An active vest is remaining armor, not temporary shields or an inventory flag. */
export function applyHeadshot(run:{health:number;armor:number;temporaryArmor?:number}) {
  const protectedHit=run.armor>0;
  run.armor=0;
  run.temporaryArmor=0;
  run.health=protectedHit?1:0;
  return protectedHit;
}

export function turnToward(current:number,target:number,maximum:number) {
  const difference=Math.atan2(Math.sin(target-current),Math.cos(target-current));
  return current+Math.max(-maximum,Math.min(maximum,difference));
}

export interface CombatPoint {x:number;y:number}
export function bombardmentTargets(points:CombatPoint[],safe:CombatPoint,wave:number,random:()=>number=Math.random) {
  const c=BOSS_COMBAT.bombardment;
  const candidates=points.filter(p=>Math.hypot(p.x-safe.x,p.y-safe.y)>c.radius+c.safeRadius);
  for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]]}
  const selected:CombatPoint[]=[];
  for(let i=0;i<candidates.length&&selected.length<c.impacts;i++){
    const point=candidates[(i+wave*53)%candidates.length];
    if(selected.every(p=>Math.hypot(p.x-point.x,p.y-point.y)>c.radius*.85))selected.push(point);
  }
  return selected;
}
