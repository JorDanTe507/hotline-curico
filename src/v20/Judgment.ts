import {Ultimate} from '../systems/Ultimate';import type {Gun} from '../weapons/arsenal';import {maxHealth} from '../systems/HealthCapacity';import {events19} from '../v19/Events';
export class Judgment extends Ultimate {
 actions=0;executions=0;chainUntil=0;healed=0;private paradox=false;private startedAt=0;private damagedRound=-1;private cleanCandidate=-1;private shieldUntil=0;private shield=0;private bosses=new Set<object>();private bossKills=new Set<number>();
 private level(id:string){return this.currentRun?.().upgrades['jordan-'+id]??0}
 override get duration(){return Math.min(16000,12000+(this.currentRun?.().stats.judgmentDuration??0)+1000*this.level('borrowed')+2000*this.level('eternal'))}
 get chainDuration(){return Math.min(3500,2500+(this.currentRun?.().stats.judgmentChain??0)+250*this.level('pulse'))}
 get executionHeal(){return Math.min(.12,.08+(this.currentRun?.().stats.judgmentHeal??0)+.02*this.level('breath'))}
 get bossDamage(){return this.level('inevitable')?.25:.2}
 override get healRate(){return 0}override get infiniteAmmo(){return false}override get dualFire(){return false}override get damageReduction(){return false}
 override trackGun(_g:Gun,_now:number){}override double(){return false}override extend(){}
 receivedDamage(){this.damagedRound=this.currentRun?.().round??0}
 override activate(now:number,guns:Gun[]=[]){if(!super.activate(now,guns))return false;this.startedAt=now;this.actions=this.executions=this.healed=0;this.paradox=false;this.bosses.clear();this.bossKills.clear();this.chainUntil=now+this.chainDuration;events19.emit({type:'jordan-activate'});return true}
 canTarget(target:object,boss:boolean,now:number){return this.active(now)&&this.actions<10&&!this.bosses.has(target)}
 execute(target:object,boss:boolean,now:number){if(!this.canTarget(target,boss,now))return false;this.bosses.add(target);this.actions++;if(!boss)this.executions++;this.chainUntil=now+this.chainDuration;const run=this.currentRun?.();if(run&&!boss){const n=Math.min(maxHealth(run)-run.health,maxHealth(run)*this.executionHeal);if(n>0){run.health+=n;this.healed+=n}}if(this.executions===10&&run&&this.damagedRound!==run.round)this.cleanCandidate=run.round;events19.emit({type:'jordan-chain',value:this.executions,method:this.damagedRound===run?.round?'damaged':'clean'});if(run&&this.healed>=maxHealth(run)*.5)events19.emit({type:'jordan-heal'});if(this.executions>=5&&!this.paradox&&this.level('paradox')){this.paradox=true;this.until=Math.min(this.startedAt+16000,now+this.duration,this.until+3000)}return true}
 override roundComplete(){const round=this.currentRun?.().round;if(this.cleanCandidate===round&&this.damagedRound!==round)events19.emit({type:'jordan-clean-round',value:10});this.cleanCandidate=-1}
 bossKilled(index:number,bossRush=false){if(!this.until)return;this.bossKills.add(index);if(bossRush&&this.bossKills.size===2)events19.emit({type:'jordan-rush',value:2})}
 finish(now:number){if(!this.until)return;this.until=0;this.charge=0;const run=this.currentRun?.();events19.emit({type:'jordan-chain',value:this.executions,method:this.damagedRound===run?.round?'damaged':'clean'});if(run&&this.healed>=maxHealth(run)*.5)events19.emit({type:'jordan-heal'});if(run&&run.health>0&&this.level('last')){const amount=maxHealth(run)*.15;this.shield=Math.max(0,amount-(run.temporaryArmor??0));run.temporaryArmor=Math.max(run.temporaryArmor??0,amount);this.shieldUntil=now+5000}}
 override tick(now:number,health:number){const run=this.currentRun?.();if(run&&this.shieldUntil&&now>=this.shieldUntil){run.temporaryArmor=Math.max(0,(run.temporaryArmor??0)-this.shield);this.shield=0;this.shieldUntil=0}if(health<=0){this.stop();return 0}if(this.until&&(now>=this.until||now>=this.chainUntil||this.actions>=10))this.finish(now);return health}
 override stop(){super.stop();this.chainUntil=0;this.bosses.clear()}
}
