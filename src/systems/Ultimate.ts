import {baseStats,type PlayerStats} from '../config/progression';
import {ULTIMATE_HITS,ULTIMATE_DURATION,ULTIMATE_HEAL_PER_SECOND} from '../config/instinct';
import type {Gun} from '../weapons/arsenal';
import type {Run} from './run';
export interface ShotCredit {method?:string;achievementToken?:object;achievementHit?:boolean;achievementPending?:number;origin?:{x:number;y:number};damageMultiplier?:number;closeBonus?:number;critical?:boolean;fromPlayer?:boolean;procTargets?:WeakSet<object>;secondary?:boolean;weaponId?:number;eligible:boolean;targets:WeakSet<object>}
interface SavedAmmo {ammo:number;reserve:number;gained:number}
export class Ultimate {
 activeDuration=ULTIMATE_DURATION;
 constructor(private stats:()=>PlayerStats=baseStats,protected currentRun?:()=>Run){}
 protected get maximumHealth(){return this.stats().maxHealth}
 get requiredHits(){return Math.max(20,this.stats().ultimateHits)}
 get duration(){return this.stats().ultimateDuration}
 get healRate(){return this.stats().ultimateHeal}
 get infiniteAmmo(){return true}
 get dualFire(){return true}
 get damageReduction(){return true}
 get weaponMultiplier(){return 1}
 get movementMultiplier(){return 1}
 get temporaryDashCooldown():number|undefined{return undefined}
 eliminated(_now:number){}
 extend(ms:number,now:number){if(ms>0&&this.active(now)){this.until+=ms;this.activeDuration+=ms}}
 charge=0;until=0;pending=false;private lastTick=0;private saved=new Map<Gun,SavedAmmo>();
 active(now:number){return now<this.until}
 get ready(){return this.charge>=this.requiredHits&&!this.pending}
 shot(now:number,player=true):ShotCredit{return {eligible:player&&!this.active(now)&&!this.pending,targets:new WeakSet<object>()}}
 hit(enemy:object,shot:ShotCredit,now:number,alive=true){if(!alive||!shot.eligible||this.active(now)||this.pending||shot.targets.has(enemy))return false;shot.targets.add(enemy);this.charge=Math.min(this.requiredHits,this.charge+1);return true}
 reserve(){if(!this.ready)return false;this.charge=0;this.pending=true;return true}
 activate(now:number,guns:Gun[]=[]){if((!this.ready&&!this.pending)||this.active(now))return false;this.charge=0;this.pending=false;this.activeDuration=this.duration;this.until=now+this.activeDuration;this.lastTick=now;this.saved.clear();for(const g of guns)this.trackGun(g,now);return true}
 trackGun(gun:Gun,now:number){if(this.active(now)&&!this.saved.has(gun))this.saved.set(gun,{ammo:gun.ammo,reserve:gun.reserve,gained:0})}
 releaseGun(gun:Gun){this.saved.delete(gun)}
 addAmmo(gun:Gun,amount:number){gun.reserve+=amount;const saved=this.saved.get(gun);if(saved)saved.gained+=amount}
 private restore(guns:Gun[]){for(const g of guns){const old=this.saved.get(g);if(old){g.ammo=old.ammo;g.reserve=old.reserve+old.gained}}this.saved.clear()}
 stop(){this.until=0;this.charge=0;this.pending=false;this.saved.clear()}
 tick(now:number,health:number,guns:Gun[]=[]){if(health<=0){this.stop();return 0}if(!this.until)return health;const end=Math.min(now,this.until);health=Math.min(this.maximumHealth,health+Math.max(0,end-this.lastTick)*this.healRate/1000);this.lastTick=end;if(now>=this.until){this.restore(guns);this.until=0;this.charge=0}return health}
 double(weapons:{id:number}[],now:number){return this.active(now)&&weapons.length===2}
}
