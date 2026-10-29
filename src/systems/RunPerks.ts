import type {Run} from './run';import {maxHealth} from './HealthCapacity';
export class RunPerks {
 private saved=false;private immunityUntil=0;private bloodAt=-Infinity;private speedUntil=0;private armorRound=-1;get temporaryArmor(){return this.run.temporaryArmor??0}set temporaryArmor(value:number){this.run.temporaryArmor=value}
 constructor(private run:Run,private character:'cervela'|'nicolas'){}
 get invulnerableUntil(){return this.immunityUntil}
 revive(now:number,immortal=false){if(immortal||this.saved||!this.run.upgrades.secondChance||this.run.health>0)return false;this.saved=true;this.run.health=1;this.immunityUntil=now+2000;return true}
 killed(now:number){const r=this.run,blood=r.upgrades.bloodlust??0;if(blood&&now>=this.bloodAt){r.health=Math.min(maxHealth(r),r.health+(this.character==='cervela'?[3,5,7]:[2,3,4])[blood-1]);this.bloodAt=now+1000}if(r.upgrades.killerInstinct)this.speedUntil=now+3000}
 speed(now:number){return now<this.speedUntil?1+[.1,.15,.2][(this.run.upgrades.killerInstinct??1)-1]:1}
 beginRound(){this.temporaryArmor=0}
 checkArmor(){const r=this.run,n=r.upgrades.emergencyShield??0;if(n&&r.health>0&&r.health<maxHealth(r)*.3&&this.armorRound!==r.round){this.armorRound=r.round;this.temporaryArmor=[25,35,45][n-1];return true}return false}
 absorb(raw:number){const taken=Math.min(this.temporaryArmor,Math.max(0,raw));this.temporaryArmor-=taken;return raw-taken}
}
