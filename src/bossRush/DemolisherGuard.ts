import type Phaser from 'phaser';
import type {Game,Foe,Shot} from '../scenes/Game';
import {enemyAnimation} from '../enemies/config';
import {segmentTargetDistance} from '../weapons/RequiemPenetration';
interface Guard {leader:Foe;active:boolean;landAt:number;drop?:Phaser.GameObjects.Image}
/** The existing shield enemy acts as a passive escort only when created by Rush. */
export class DemolisherGuard {
 private guards=new Map<Foe,Guard>();
 constructor(private s:Game){}
 private target(leader:Foe){
  const s=this.s,a=Math.atan2(s.player.y-leader.sprite.y,s.player.x-leader.sprite.x),distance=Math.min(110,Math.max(46,Math.hypot(s.player.x-leader.sprite.x,s.player.y-leader.sprite.y)*.55));
  for(const turn of [0,.3,-.3,.6,-.6,1,-1])for(const r of [distance,70,46]){const p={x:leader.sprite.x+Math.cos(a+turn)*r,y:leader.sprite.y+Math.sin(a+turn)*r};if(s.walkablePoint(p.x,p.y)&&s.lineClear(leader.sprite.x,leader.sprite.y,p.x,p.y))return p}
  return s.lootPoint(leader.sprite.x+Math.cos(a)*110,leader.sprite.y+Math.sin(a)*110);
 }
 deploy(leader:Foe){
  const s=this.s,p=this.target(leader),e=s.spawn(3,-1,[p.x,p.y]);e.rushSupport=leader;e.awake=true;e.canPickupWeapons=false;e.next=Infinity;
  const state:Guard={leader,active:true,landAt:s.clock+220};this.guards.set(e,state);
  e.sprite.setAlpha(0);state.drop=s.add.image(p.x,p.y-110,e.sprite.texture.key,e.sprite.frame.name).setOrigin(e.sprite.originX,e.sprite.originY).setScale(e.sprite.scaleX,e.sprite.scaleY).setDepth(e.sprite.depth+1);
  s.tweens.add({targets:state.drop,y:p.y,duration:220,onComplete:()=>{state.drop?.destroy();state.drop=undefined;if(e.sprite.active)e.sprite.setAlpha(1)}});
 }
 has(e:Foe){return this.guards.has(e)}
 invulnerable(e:Foe){return this.guards.get(e)?.active===true}
 freeze(e:Foe,delta:number){const g=this.guards.get(e);if(g)g.landAt+=delta}
 release(leader:Foe){for(const [e,g]of this.guards)if(g.leader===leader&&g.active){g.active=false;e.hp=e.max=35;e.sprite.setAlpha(1).setVelocity(0);e.label.setText('ESCOLTA · EXPUESTO')}}
 update(e:Foe){
  const g=this.guards.get(e);if(!g)return false;const s=this.s;e.sprite.setVelocity(0);e.label.setPosition(e.sprite.x,e.sprite.y-42);
  if(s.clock<g.landAt)return true;
  e.sprite.setAlpha(1).setFlipX(s.player.x<e.sprite.x).play(enemyAnimation(e.tier,'idle'),true);
  if(g.active&&g.leader.hp>0){const p=this.target(g.leader);if(Math.hypot(p.x-e.sprite.x,p.y-e.sprite.y)>8){s.navigation.move(e,p.x,p.y,480);e.sprite.play(enemyAnimation(e.tier,'walk'),true)}e.label.setText('ESCOLTA · ESCUDO ACTIVO')}
  return true;
 }
 intercept(shot:Shot){
  if(shot.enemy)return false;const to={x:shot.sprite.x,y:shot.sprite.y},from=shot.previous??to;
  for(const [e,g]of this.guards)if(g.active&&this.s.clock>=g.landAt&&e.sprite.active&&e.hp>0&&segmentTargetDistance(from,to,e.sprite,30)!==undefined)return true;
  return false;
 }
 remove(foe:Foe){for(const [e,g]of this.guards)if(e===foe||g.leader===foe){g.drop?.destroy();this.guards.delete(e)}}
}
