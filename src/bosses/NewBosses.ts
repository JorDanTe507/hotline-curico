import {BOSS_VISUAL_SCALE,BOSS_OLD_SCALE,bossAttachmentY} from './BossGeometry';
import Phaser from 'phaser';
import {clippedTarget} from '../chaos/Inventory';
import {AudioSystem} from '../systems/AudioSystem';
import {blocked} from '../maps/apartments';
import type {Game,Foe} from '../scenes/Game';
import {BOSS_DEFINITIONS,BOSS_TUNING as T,expansionBossStats,bossAnimation} from './expansion';
interface State {phase:'move'|'windup'|'burst'|'recover'|'charge'|'spin'|'throw';until:number;next:number;remaining:number;x:number;y:number;pattern:number;attacks?:number;special?:'frag'|'fire'|'smoke';pose?:Phaser.GameObjects.Image;repathAt?:number;lastPosition?:{x:number;y:number};position?:{x:number;y:number};image:Phaser.GameObjects.Image}
export class NewBosses {
 private states=new WeakMap<Foe,State>();private images=new Set<Phaser.GameObjects.Image>();private graphics:Phaser.GameObjects.Graphics;
 freezeEnemy(e:Foe,dt:number){const m=this.states.get(e);if(m){if(m.until)m.until+=dt;if(m.next)m.next+=dt}}

 constructor(private s:Game){this.graphics=s.add.graphics().setDepth(9)}
 begin(){this.graphics.clear()}
 private state(e:Foe){let m=this.states.get(e);if(!m){const image=this.s.add.image(e.sprite.x,e.sprite.y,`boss-${e.boss}-weapon`).setOrigin(.15,.5).setDepth(14);this.images.add(image);m={phase:'move',until:this.s.clock+1200,next:0,remaining:0,x:0,y:0,pattern:0,image};this.states.set(e,m)}return m}
 update(e:Foe){const s=this.s,c=BOSS_DEFINITIONS[e.boss],stats=expansionBossStats(e.boss,s.run.round),m=this.state(e),p=s.player,dist=Math.hypot(p.x-e.sprite.x,p.y-e.sprite.y),los=s.lineClear(e.sprite.x,e.sprite.y,p.x,p.y),a=Math.atan2(p.y-e.sprite.y,p.x-e.sprite.x),g=s.survival.mind(e).weapon!;
  const tuning=s.rush?.tuning(e.boss),speed=stats.speed*(tuning?.speed??1),damage=stats.damage*(tuning?.damage??1);
  const recovery=tuning?Math.max(350,c.cooldown*tuning.recovery):c.cooldown;
  const reload=tuning?Math.max(350,c.cooldown*tuning.reload):c.cooldown;
  if(!s.tweens.isTweening(e.sprite))e.sprite.setAlpha(1);e.sprite.setVelocity(0).setFlipX(p.x<e.sprite.x);e.label.setPosition(e.sprite.x,e.sprite.y-72).setText(c.name+(m.phase==='recover'?' · ENFRIANDO':''));
  m.image.setVisible(m.phase==='move'||m.phase==='recover');m.image.setPosition(e.sprite.x+Math.cos(a)*8*BOSS_VISUAL_SCALE/BOSS_OLD_SCALE,e.sprite.y+bossAttachmentY(e.boss,10)).setDisplaySize((e.boss===4?56:64)*BOSS_VISUAL_SCALE/BOSS_OLD_SCALE,24*BOSS_VISUAL_SCALE/BOSS_OLD_SCALE).setRotation(a).setFlipY(Math.cos(a)<0);
  if(c.mag>0&&!g.ammo&&!g.reserve){s.navigation.move(e,p.x,p.y,speed);if(dist<65&&los&&s.clock>=m.next){s.damage(T.contactDamage*(tuning?.damage??1));m.next=s.clock+T.contactCooldown}return}
  if(m.phase==='recover'){e.sprite.play(bossAnimation(e.boss,e.boss===1?'idle':'reload'),true);if(s.clock<m.until){if(tuning&&e.boss!==4)this.reposition(e,m,a,speed*(e.boss===1&&g.ammo?1.24:.75));return}if(g.ammo===0&&c.mag>0){const n=Math.min(c.mag,g.reserve);g.ammo=n;g.reserve-=n}m.phase='move';m.until=s.clock+400}
  if(m.phase==='move'){
   e.sprite.play(bossAnimation(e.boss,'walk'),true);if(!los||dist>(e.boss===4?120:380))s.navigation.move(e,p.x,p.y,speed);
   else if(e.boss===3&&dist<250)s.navigation.move(e,e.sprite.x-Math.cos(a)*100,e.sprite.y-Math.sin(a)*100,speed);
   else if(tuning&&(e.boss!==4||dist<100))this.reposition(e,m,a,speed);
   if(los&&dist<(e.boss===4?T.carniceroEngage:c.range+120)&&s.clock>=m.until){
    m.attacks=(m.attacks??0)+1;
    if(tuning&&((e.boss===2&&m.attacks%3===2&&dist>135&&dist<470)||(e.boss===3&&m.attacks%5===4&&!s.rush?.power?.dark))){
      m.special=e.boss===3?'smoke':m.attacks%2===0?'frag':'fire';m.phase='throw';m.until=s.clock+950;m.x=p.x;m.y=p.y;return;
    }
    m.phase='windup';m.until=s.clock+(tuning?Math.max(420,c.prepare*tuning.warning):c.prepare);m.x=p.x;m.y=p.y;m.position=undefined;
    if(tuning&&e.boss===3){const velocity=p.body!.velocity,lead=Math.min(.28,84/Math.max(1,velocity.length()));const x=p.x+velocity.x*lead,y=p.y+velocity.y*lead;if(s.lineClear(e.sprite.x,e.sprite.y,x,y)){m.x=x;m.y=y}}}return;
  }
  if(m.phase==='throw'){
   this.throwSpecial(e,m,damage,recovery);
   return;
  }
  if(m.phase==='windup'){
   e.sprite.play(bossAnimation(e.boss,'shoot'),true);
   if(e.boss===2||e.boss===4)this.graphics.lineStyle(3,0xff547e,.85).strokeCircle(m.x,m.y,e.boss===2?120:140);
   else if(e.boss===3&&tuning)this.sniperWarning(e,m,c.range);
   else this.graphics.lineStyle(e.boss===3?2:5,e.boss===3?0xff174e:0xffab47,.8).lineBetween(e.sprite.x,e.sprite.y,m.x,m.y);
   if(s.clock<m.until)return;
   if(e.boss===4){const spin=dist<=170&&m.pattern++%(tuning?3:2)!==0;m.phase=spin?'spin':'charge';m.until=s.clock+(m.phase==='spin'?T.spinDuration:T.chargeDuration*(tuning?.warning??1));m.next=s.clock;return}
   if(!g.ammo){m.phase='recover';m.until=s.clock+reload;return}
   if(e.boss===1){m.phase='burst';m.remaining=Math.min(T.burstShots,g.ammo);m.next=s.clock;return}
   const angle=Math.atan2(m.y-e.sprite.y,m.x-e.sprite.x);if(s.lineClear(e.sprite.x,e.sprite.y,m.x,m.y)){
    if(e.boss===2)for(const spread of [-.16,0,.16])s.shoot(e.sprite.x,e.sprite.y,angle+spread,damage,true,Math.min(c.range,Math.max(120,Math.hypot(m.x-e.sprite.x,m.y-e.sprite.y))),0,1,true,11,e.boss);
    else s.shoot(e.sprite.x,e.sprite.y,angle,damage,true,c.range,0,1,false,5,e.boss);g.ammo--;
   }m.phase='recover';m.until=s.clock+(g.ammo?recovery:reload);return;
  }
  if(m.phase==='burst'){
   this.graphics.lineStyle(2,0xffac55,.4).lineBetween(e.sprite.x,e.sprite.y,m.x,m.y);
   if(s.clock>=m.next&&m.remaining>0){if(s.lineClear(e.sprite.x,e.sprite.y,m.x,m.y))s.shoot(e.sprite.x,e.sprite.y,Math.atan2(m.y-e.sprite.y,m.x-e.sprite.x),damage,true,c.range,.07,1,false,7,e.boss);g.ammo--;m.remaining--;m.next=s.clock+T.burstInterval*(tuning?.recovery??1)}
   if(!m.remaining){m.phase='recover';m.until=s.clock+(g.ammo?recovery:reload)}return;
  }
  if(m.phase==='charge'){
   s.navigation.move(e,m.x,m.y,speed*T.chargeMultiplier);this.graphics.lineStyle(2,0xff538e,.8).strokeCircle(m.x,m.y,T.slamRadius);
   if(s.clock>=m.until||Math.hypot(e.sprite.x-m.x,e.sprite.y-m.y)<30){this.slam(e,damage,T.slamRadius);m.phase='recover';m.until=s.clock+(g.ammo?recovery:reload)}return;
  }
  if(m.phase==='spin'){
   this.graphics.lineStyle(5,0xff4477,.8).strokeCircle(e.sprite.x,e.sprite.y,T.spinRadius);
   if(s.clock>=m.next){this.slam(e,damage*T.spinDamage,T.spinRadius);m.next=s.clock+T.spinInterval}
   if(s.clock>=m.until){m.phase='recover';m.until=s.clock+(g.ammo?recovery:reload)}
  }
 }
 private throwSpecial(e:Foe,m:State,damage:number,recovery:number){
  const s=this.s,kind=m.special!,from=e.sprite;
  const target=clippedTarget(from,{x:m.x,y:m.y},400,(x,y)=>s.worldModel.cell(Math.floor(x/48),Math.floor(y/48))!==0);
  const progress=Math.min(1,1-(m.until-s.clock)/950);
  if(kind==='smoke')from.play(bossAnimation(e.boss,'shoot'),true);
  else {
    const index=Math.min(5,Math.floor(progress*6));
    const frame=kind+'-pose-'+index;
    m.pose??=s.add.image(from.x,from.y,'rush-attack-polish',frame).setDepth(from.depth+.05).setOrigin(.5,1);
    m.pose.setPosition(from.x,from.body!.bottom).setScale(.82).setFlipX(target.x<from.x).setFrame(frame);
    from.setAlpha(0);
  }
  this.graphics.lineStyle(2,kind==='smoke'?0xccbddc:0xff9558,.85).strokeCircle(target.x,target.y,kind==='smoke'?55:80);
  e.label.setText(kind==='smoke'?'GRANADA DE HUMO':kind==='frag'?'¡FRAGMENTACIÓN!':'¡MOLOTOV!');
  if(s.clock<m.until)return;
  m.pose?.destroy();m.pose=undefined;from.setAlpha(1);
  if(kind==='smoke')this.smoke(from,target);
  else s.chaos.bossThrow(kind==='frag'?0:1,e.boss,from,target,damage*.68);
  m.phase='recover';m.until=s.clock+Math.max(800,recovery);
 }
 private smoke(from:{x:number;y:number},target:{x:number;y:number}){
  const s=this.s;
  AudioSystem.play(s,'grenade-throw',.4);
  const projectile=s.add.sprite(from.x,from.y,'rush-attack-polish','smoke-flight-0').setDepth(15).setDisplaySize(20,15);
  projectile.play('rush-smoke-flight');
  s.tweens.add({targets:projectile,x:target.x,y:target.y,duration:410,onComplete:()=>{
    projectile.destroy();
    if(!s.rush?.combat)return;
    const cloud=s.add.sprite(target.x,target.y,'rush-attack-polish','smoke-cloud-0').setDepth(22).setAlpha(.83);
    cloud.setScale(1.6).play('rush-smoke-cloud');
    s.tweens.add({targets:cloud,alpha:0,delay:2600,duration:1000,onComplete:()=>cloud.destroy()});
  }});
 }
 private sniperWarning(e:Foe,m:State,range:number){
  const s=this.s,from=e.sprite,angle=Math.atan2(m.y-from.y,m.x-from.x);
  if(s.rush?.power?.dark){
    e.label.setText('EL VERDUGO · APUNTANDO');
    this.graphics.lineStyle(2,0xffcba0,.9).strokeCircle(from.x,from.y,24);
    return;
  }
  let last={x:from.x,y:from.y};
  for(let distance=12;distance<=range;distance+=12){
    const point={x:from.x+Math.cos(angle)*distance,y:from.y+Math.sin(angle)*distance};
    if(!s.lineClear(last.x,last.y,point.x,point.y))break;
    last=point;
  }
  this.graphics.lineStyle(2,0xff174e,.85).lineBetween(from.x,from.y,last.x,last.y);
 }
 private reposition(e:Foe,m:State,angle:number,speed:number){
  const s=this.s,at=e.sprite.body!.center;
  if(s.clock>=(m.repathAt??0)){
    if(m.lastPosition&&Math.hypot(m.lastPosition.x-at.x,m.lastPosition.y-at.y)<8){m.position=undefined;s.navigation.invalidate(e);}
    m.lastPosition={x:at.x,y:at.y};m.repathAt=s.clock+550;
  }
  if(!m.position||Math.hypot(m.position.x-at.x,m.position.y-at.y)<24){
    const side=m.pattern++%2?1:-1;
    m.position=[side*.5,-side*.5,side*.8,-side*.8,.32,-.32].map(offset=>{
      const a=angle+offset*Math.PI;
      return {x:Math.floor((at.x+Math.cos(a)*145)/48)*48+24,y:Math.floor((at.y+Math.sin(a)*145)/48)*48+24};
    }).find(p=>!blocked(s.grid,Math.floor(p.x/48),Math.floor(p.y/48))&&s.navigation.canReach(at,p));
  }
  const target=m.position??s.player;s.navigation.move(e,target.x,target.y,speed);
 }
 private slam(e:Foe,damage:number,radius:number){const s=this.s;if(Math.hypot(s.player.x-e.sprite.x,s.player.y-e.sprite.y)<radius&&s.lineClear(e.sprite.x,e.sprite.y,s.player.x,s.player.y))s.damage(damage);s.coop?.damageOthers(s.coop.targetId||s.playerId,e.sprite.x,e.sprite.y,radius,damage);s.rush?.friendlyArea(e.boss,e.sprite,radius,damage);const pulse=s.add.circle(e.sprite.x,e.sprite.y,radius,0xff3665,.18).setStrokeStyle(2,0xff7598).setDepth(4);s.tweens.add({targets:pulse,alpha:0,duration:300,onComplete:()=>pulse.destroy()});s.cameras.main.shake(100,.003)}
 remove(e:Foe){const m=this.states.get(e);if(m){this.images.delete(m.image);m.image.destroy();m.pose?.destroy();this.states.delete(e)}}
 stop(){for(const image of this.images)image.destroy();this.images.clear();this.graphics.destroy()}
}
