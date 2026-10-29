import {Ultimate} from './Ultimate';
import type {Gun} from '../weapons/arsenal';
import {maxHealth,setHealthMultiplier} from './HealthCapacity';
/** A single activation budget: 8s + at most eight 750ms kill extensions. */
export class Tryhard extends Ultimate {
 private startedAt=0;
 override get duration(){return Math.min(14000,this.currentRun?.().stats.tryhardDuration??8000)}
 override get healRate(){return 0}
 override get infiniteAmmo(){return false}
 override get dualFire(){return false}
 override get damageReduction(){return false}
 override get weaponMultiplier(){return 1.35}
 override get movementMultiplier(){return this.currentRun?.().stats.tryhardSpeed??1.25}
 override get temporaryDashCooldown(){return Math.max(400,500*(1-(this.currentRun?.().stats.permanentDash??0)))}
 protected override get maximumHealth(){return this.currentRun?maxHealth(this.currentRun()):super.maximumHealth}
 override activate(now:number,guns:Gun[]=[]){if(!super.activate(now,guns))return false;this.startedAt=now;if(this.currentRun)setHealthMultiplier(this.currentRun(),this.currentRun().stats.tryhardMultiplier??5);return true}
 override tick(now:number,health:number,guns:Gun[]=[]){const run=this.currentRun?.();if(!run)return super.tick(now,health,guns);run.health=health;run.health=super.tick(now,health,guns);if(!this.active(now))setHealthMultiplier(run,1);return run.health}
 override stop(){super.stop();if(this.currentRun)setHealthMultiplier(this.currentRun(),1)}
 override trackGun(_gun:Gun,_now:number){}
 override extend(ms:number,now:number){if(ms<=0||!this.active(now))return;this.until=Math.min(this.startedAt+14000,this.until+ms);this.activeDuration=this.until-this.startedAt}
 override eliminated(now:number){this.extend(750,now)}
 override double(_guns:{id:number}[],_now:number){return false}
}

