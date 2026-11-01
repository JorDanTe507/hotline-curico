import Phaser from 'phaser';
import type {Game,Foe} from '../scenes/Game';
import {BOSS_DEFINITIONS,BOSS_TUNING as T,expansionBossStats,bossAnimation} from './expansion';
interface State {phase:'move'|'windup'|'burst'|'recover'|'charge'|'spin';until:number;next:number;remaining:number;x:number;y:number;pattern:number;image:Phaser.GameObjects.Image}
export class NewBosses {
 private states=new WeakMap<Foe,State>();private images=new Set<Phaser.GameObjects.Image>();private graphics:Phaser.GameObjects.Graphics;
 constructor(private s:Game){this.graphics=s.add.graphics().setDepth(9)}
 begin(){this.graphics.clear()}
 private state(e:Foe){let m=this.states.get(e);if(!m){const image=this.s.add.image(e.sprite.x,e.sprite.y,`boss-${e.boss}-weapon`).setOrigin(.15,.5).setDepth(14);this.images.add(image);m={phase:'move',until:this.s.clock+1200,next:0,remaining:0,x:0,y:0,pattern:0,image};this.states.set(e,m)}return m}
 update(e:Foe){const s=this.s,c=BOSS_DEFINITIONS[e.boss],stats=expansionBossStats(e.boss,s.run.round),m=this.state(e),p=s.player,dist=Math.hypot(p.x-e.sprite.x,p.y-e.sprite.y),los=s.lineClear(e.sprite.x,e.sprite.y,p.x,p.y),a=Math.atan2(p.y-e.sprite.y,p.x-e.sprite.x),g=s.survival.mind(e).weapon!;
  if(!s.tweens.isTweening(e.sprite))e.sprite.setAlpha(1);e.sprite.setVelocity(0).setFlipX(p.x<e.sprite.x);e.label.setPosition(e.sprite.x,e.sprite.y-57).setText(c.name+(m.phase==='recover'?' · ENFRIANDO':''));
  m.image.setVisible(m.phase==='move'||m.phase==='recover');m.image.setPosition(e.sprite.x+Math.cos(a)*8,e.sprite.y+10).setDisplaySize(e.boss===4?56:64,24).setRotation(a).setFlipY(Math.cos(a)<0);
  if(c.mag>0&&!g.ammo&&!g.reserve){s.navigation.move(e,p.x,p.y,stats.speed);if(dist<65&&los&&s.clock>=m.next){s.damage(T.contactDamage);m.next=s.clock+T.contactCooldown}return}
  if(m.phase==='recover'){e.sprite.play(bossAnimation(e.boss,'reload'),true);if(s.clock<m.until)return;if(g.ammo===0&&c.mag>0){const n=Math.min(c.mag,g.reserve);g.ammo=n;g.reserve-=n}m.phase='move';m.until=s.clock+400}
  if(m.phase==='move'){
   e.sprite.play(bossAnimation(e.boss,'walk'),true);if(!los||dist>(e.boss===4?120:380))s.navigation.move(e,p.x,p.y,stats.speed);
   else if(e.boss===3&&dist<250)s.navigation.move(e,e.sprite.x-Math.cos(a)*100,e.sprite.y-Math.sin(a)*100,stats.speed);
   if(los&&dist<(e.boss===4?T.carniceroEngage:c.range+120)&&s.clock>=m.until){m.phase='windup';m.until=s.clock+c.prepare;m.x=p.x;m.y=p.y}return;
  }
  if(m.phase==='windup'){
   e.sprite.play(bossAnimation(e.boss,'shoot'),true);
   if(e.boss===2||e.boss===4)this.graphics.lineStyle(3,0xff547e,.85).strokeCircle(m.x,m.y,e.boss===2?120:140);
   else this.graphics.lineStyle(e.boss===3?2:5,e.boss===3?0xff174e:0xffab47,.8).lineBetween(e.sprite.x,e.sprite.y,m.x,m.y);
   if(s.clock<m.until)return;
   if(e.boss===4){m.phase=dist>170?'charge':m.pattern++%2?'spin':'charge';m.until=s.clock+(m.phase==='spin'?T.spinDuration:T.chargeDuration);m.next=s.clock;return}
   if(!g.ammo){m.phase='recover';m.until=s.clock+c.cooldown;return}
   if(e.boss===1){m.phase='burst';m.remaining=Math.min(T.burstShots,g.ammo);m.next=s.clock;return}
   const angle=Math.atan2(m.y-e.sprite.y,m.x-e.sprite.x);if(s.lineClear(e.sprite.x,e.sprite.y,m.x,m.y)){
    if(e.boss===2)for(const spread of [-.16,0,.16])s.shoot(e.sprite.x,e.sprite.y,angle+spread,stats.damage,true,Math.min(c.range,Math.max(120,Math.hypot(m.x-e.sprite.x,m.y-e.sprite.y))),0,1,true,11);
    else s.shoot(e.sprite.x,e.sprite.y,angle,stats.damage,true,c.range,0,1,false,5);g.ammo--;
   }m.phase='recover';m.until=s.clock+c.cooldown;return;
  }
  if(m.phase==='burst'){
   this.graphics.lineStyle(2,0xffac55,.4).lineBetween(e.sprite.x,e.sprite.y,m.x,m.y);
   if(s.clock>=m.next&&m.remaining>0){if(s.lineClear(e.sprite.x,e.sprite.y,m.x,m.y))s.shoot(e.sprite.x,e.sprite.y,Math.atan2(m.y-e.sprite.y,m.x-e.sprite.x),stats.damage,true,c.range,.07,1,false,7);g.ammo--;m.remaining--;m.next=s.clock+T.burstInterval}
   if(!m.remaining){m.phase='recover';m.until=s.clock+c.cooldown}return;
  }
  if(m.phase==='charge'){
   s.navigation.move(e,m.x,m.y,stats.speed*T.chargeMultiplier);this.graphics.lineStyle(2,0xff538e,.8).strokeCircle(m.x,m.y,T.slamRadius);
   if(s.clock>=m.until||Math.hypot(e.sprite.x-m.x,e.sprite.y-m.y)<30){this.slam(e,stats.damage,T.slamRadius);m.phase='recover';m.until=s.clock+c.cooldown}return;
  }
  if(m.phase==='spin'){
   this.graphics.lineStyle(5,0xff4477,.8).strokeCircle(e.sprite.x,e.sprite.y,T.spinRadius);
   if(s.clock>=m.next){this.slam(e,stats.damage*T.spinDamage,T.spinRadius);m.next=s.clock+T.spinInterval}
   if(s.clock>=m.until){m.phase='recover';m.until=s.clock+c.cooldown}
  }
 }
 private slam(e:Foe,damage:number,radius:number){const s=this.s;if(Math.hypot(s.player.x-e.sprite.x,s.player.y-e.sprite.y)<radius&&s.lineClear(e.sprite.x,e.sprite.y,s.player.x,s.player.y))s.damage(damage);const pulse=s.add.circle(e.sprite.x,e.sprite.y,radius,0xff3665,.18).setStrokeStyle(2,0xff7598).setDepth(4);s.tweens.add({targets:pulse,alpha:0,duration:300,onComplete:()=>pulse.destroy()});s.cameras.main.shake(100,.003)}
 remove(e:Foe){const m=this.states.get(e);if(m){this.images.delete(m.image);m.image.destroy();this.states.delete(e)}}
 stop(){for(const image of this.images)image.destroy();this.images.clear();this.graphics.destroy()}
}
