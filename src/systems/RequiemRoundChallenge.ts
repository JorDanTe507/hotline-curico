import {REQUIEM_ID} from '../weapons/RequiemPenetration';
import {roundPlan} from './RoundState';

export interface OffensiveCredit {weaponId?:number;method?:string;fromPlayer?:boolean;secondary?:boolean;achievementToken?:object}
/** Transient combat evidence; never serialized, and never inferred from the weapon held at the end. */
export class RequiemRoundChallenge {
 private active=false;private invalid=true;private started=false;private seenDeveloper=false;
 private round=0;private duration=0;private target=0;private type='';private elapsed=0;private attacks=0;
 private enemies=new Set<object>();private defeated=new Set<object>();private shots=new WeakSet<object>();
 constructor(private disabled:()=>boolean=()=>false){}
 begin(round:number,equipped:number|undefined,ordered:boolean){
  const plan=roundPlan(round);this.round=round;this.type=plan.type;this.duration=plan.duration;this.target=plan.target;
  this.active=true;this.started=equipped===REQUIEM_ID;this.seenDeveloper=this.disabled();this.invalid=!ordered||!this.started||this.seenDeveloper;
  this.elapsed=0;this.attacks=0;this.enemies.clear();this.defeated.clear();this.shots=new WeakSet();
 }
 private check(){if(this.disabled()){this.seenDeveloper=true;this.invalid=true}}
 tick(delta:number){if(this.active){this.check();this.elapsed+=Number.isFinite(delta)?Math.max(0,delta):0}}
 spawn(enemy:object,round:number){if(this.active&&round===this.round){this.check();this.enemies.add(enemy)}}
 offensive(method:string,weapon?:number,token?:object){
  if(!this.active)return;this.check();
  if(method!=='shot'||weapon!==REQUIEM_ID||!token){this.invalid=true;return}
  this.attacks++;this.shots.add(token);
 }
 damage(enemy:object,credit?:OffensiveCredit){
  if(!this.active||credit?.fromPlayer===false)return;this.check();
  if(!this.enemies.has(enemy)||credit?.secondary||credit?.method!=='shot'||credit.weaponId!==REQUIEM_ID||!credit.achievementToken||!this.shots.has(credit.achievementToken))this.invalid=true;
 }
 killed(enemy:object,credit?:OffensiveCredit){
  if(!this.active)return;this.damage(enemy,credit);
  if(this.enemies.has(enemy)&&(credit?.fromPlayer===false||(credit?.achievementToken&&this.shots.has(credit.achievementToken))))this.defeated.add(enemy);
 }
 complete(round:number,successful:boolean){
  if(!this.active)return false;this.check();this.active=false;
  return successful&&round===this.round&&this.started&&!this.invalid&&!this.seenDeveloper&&this.enemies.size>0&&this.attacks>0&&this.elapsed>0&&
   (this.type==='SUPERVIVENCIA'?this.elapsed+1e-6>=this.duration:this.defeated.size>=this.target&&this.defeated.size===this.enemies.size);
 }
 cancel(){this.active=false;this.invalid=true;this.enemies.clear();this.defeated.clear()}
}
