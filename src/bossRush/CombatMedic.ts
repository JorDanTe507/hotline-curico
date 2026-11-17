import type Phaser from 'phaser';
import type {Game,Foe} from '../scenes/Game';
import {enemyAnimation} from '../enemies/config';
interface Duty {leader:Foe;healed:boolean;rewarded:boolean;channelAt:number;started:number;progressAt:number;nextPlan:number;target?:{x:number;y:number};last?:{x:number;y:number};checkAt:number;abandoned?:boolean}
export class CombatMedic {
 private duties=new Map<Foe,Duty>();private paint:Phaser.GameObjects.Graphics;
 constructor(private s:Game){this.paint=s.add.graphics().setDepth(17)}
 add(e:Foe,leader:Foe){e.rushMedic=true;e.next=Infinity;e.canPickupWeapons=false;this.duties.set(e,{leader,healed:false,rewarded:false,channelAt:0,started:this.s.clock,progressAt:this.s.clock,nextPlan:0,checkAt:0});e.sprite.setTint(0xb6ffd2)}
 begin(){this.paint.clear()}
 update(e:Foe){const d=this.duties.get(e);if(!d)return false;const s=this.s,leader=d.leader;e.sprite.setVelocity(0);e.label.setPosition(e.sprite.x,e.sprite.y-45).setColor('#8dffb8');
  if(leader.hp<=0||!leader.sprite.active)return true;
  if(d.abandoned){e.label.setText('MÉDICO · APOYO CANCELADO');return true}
  if(d.healed){e.label.setText('MÉDICO · CURACIÓN UTILIZADA');e.sprite.play(enemyAnimation(14,'idle'),true);return true}
  if(s.survival.stunned(e)||s.chaos.interrupted(e)){d.channelAt=0;d.progressAt=s.clock;return true}
  const at=e.sprite.body!.center,to=leader.sprite.body!.center;
  if(Math.hypot(at.x-to.x,at.y-to.y)<=115&&s.lineClear(at.x,at.y,to.x,to.y)){
   if(!d.channelAt)d.channelAt=s.clock+850;e.sprite.play(enemyAnimation(14,'idle'),true);e.label.setText('MÉDICO · CURANDO');this.paint.lineStyle(3,0x76ffae,.8).lineBetween(at.x,at.y,to.x,to.y);
   const healing=this.healing(e);if(healing){leader.hp=Math.min(leader.max,leader.hp+healing.amount);e.label.setText('MÉDICO · +20 %');}
   return true;
  }
  d.channelAt=0;e.label.setText('MÉDICO · APOYO AL COMANDANTE');
  if(s.clock>=d.checkAt){if(d.last&&Math.hypot(at.x-d.last.x,at.y-d.last.y)<7){d.target=undefined;d.nextPlan=0;s.navigation.invalidate(e)}else d.progressAt=s.clock;d.last={x:at.x,y:at.y};d.checkAt=s.clock+1200}
  if(s.clock-d.progressAt>12000){d.abandoned=true;e.label.setText('MÉDICO · APOYO CANCELADO');return true}
  if(s.clock>=d.nextPlan||!d.target){d.nextPlan=s.clock+700;d.target=Array.from({length:12},(_,i)=>({x:to.x+Math.cos(i*Math.PI/6)*80,y:to.y+Math.sin(i*Math.PI/6)*80})).filter(p=>s.walkablePoint(p.x,p.y)&&s.lineClear(p.x,p.y,to.x,to.y)).sort((a,b)=>Math.hypot(a.x-at.x,a.y-at.y)-Math.hypot(b.x-at.x,b.y-at.y)).find(p=>s.navigation.canReach(at,p))}
  if(d.target){s.navigation.move(e,d.target.x,d.target.y,135);e.sprite.play(enemyAnimation(14,'walk'),true)}
  else if(s.clock-d.started>15000){d.abandoned=true;e.label.setText('MÉDICO · APOYO CANCELADO');}
  return true;
 }
 healing(e:Foe):{target:Foe;amount:number}|undefined{const d=this.duties.get(e);if(!d||d.healed||!d.channelAt||this.s.clock<d.channelAt||e.hp<=0||d.leader.hp<=0)return;const from=e.sprite.body!.center,to=d.leader.sprite.body!.center;if(Math.hypot(from.x-to.x,from.y-to.y)>115||!this.s.lineClear(from.x,from.y,to.x,to.y))return;d.healed=true;return{target:d.leader,amount:Math.min(d.leader.max*.2,d.leader.max-d.leader.hp)}}
 defeated(e:Foe){const d=this.duties.get(e);if(d&&!d.healed&&!d.rewarded){d.rewarded=true;this.s.addDrop(e.sprite.x,e.sprite.y,'med',0)}}
 freeze(e:Foe,delta:number){const d=this.duties.get(e);if(d){if(d.channelAt)d.channelAt+=delta;d.started+=delta;d.progressAt+=delta;d.checkAt+=delta}}
 remove(e:Foe){this.duties.delete(e);for(const d of this.duties.values())if(d.leader===e){d.channelAt=0;d.abandoned=true}}
 stop(){this.duties.clear();this.paint.destroy()}
}
