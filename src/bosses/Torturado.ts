import type {Game,Foe} from '../scenes/Game';
import {TORTURADO as C} from '../config/dynamicRounds';
import {blocked} from '../maps/apartments';
interface State {ammo:number;reloadAt:number;fireAt:number;prepareAt:number;aim:{x:number;y:number};special:boolean;nextSpecial:number;nextCharge:number;chargeUntil:number;meleeAt:number;poseUntil:number}
export function torturadoStats(round:number){const level=Math.max(0,Math.floor(round/5)-1);return {hp:Math.round(C.health*(1+level*C.healthScaling)),speed:C.speed*(1+level*C.speedScaling),damage:C.damage*(1+level*C.damageScaling)}}
export class Torturado {
 private states=new WeakMap<Foe,State>();
 constructor(private scene:Game){}
 private state(e:Foe){let m=this.states.get(e);if(!m){const g=this.scene.survival.mind(e).weapon!;m={get ammo(){return g.ammo},set ammo(n:number){g.ammo=n},reloadAt:0,fireAt:this.scene.clock+1200,prepareAt:0,aim:{x:0,y:0},special:false,nextSpecial:this.scene.clock+3000,nextCharge:this.scene.clock+C.chargeCooldown,chargeUntil:0,meleeAt:0,poseUntil:0};this.states.set(e,m)}return m}
 update(e:Foe){const s=this.scene,p=s.player,body=p.body!.center,m=this.state(e),cfg=torturadoStats(s.run.round),dist=Math.hypot(p.x-e.sprite.x,p.y-e.sprite.y),los=s.lineClear(e.sprite.x,e.sprite.y,p.x,p.y),sprite=e.sprite;sprite.setVelocity(0);e.label.setPosition(sprite.x,sprite.y-55).setText(m.reloadAt?'EL TORTURADO · RECARGANDO':m.prepareAt&&m.special?'¡DESCARGA! · ESQUIVA':'EL TORTURADO');
  if(s.clock>=m.nextCharge&&dist>170&&!m.prepareAt){m.chargeUntil=s.clock+C.chargeDuration;m.nextCharge=s.clock+C.chargeCooldown}
  const speed=cfg.speed*(s.clock<m.chargeUntil?C.chargeMultiplier:1);
  if(!los||dist>C.distance||(s.clock<m.chargeUntil&&dist>120))s.navigation.move(e,body.x,body.y,speed);else if(dist<120){const a=Math.atan2(sprite.y-p.y,sprite.x-p.x),tx=sprite.x+Math.cos(a)*96,ty=sprite.body!.center.y+Math.sin(a)*96;if(!blocked(s.grid,Math.floor(tx/48),Math.floor(ty/48)))s.navigation.move(e,tx,ty,speed)}
  if(dist<C.meleeRange&&los&&s.clock>=m.meleeAt){m.meleeAt=s.clock+C.meleeCooldown;m.prepareAt=0;m.fireAt=s.clock+500;m.poseUntil=s.clock+250;sprite.play('torturado-shoot',true);s.damage(C.meleeDamage);return}
  if(m.reloadAt){if(s.clock>=m.reloadAt){m.reloadAt=0;const g=s.survival.mind(e).weapon!,n=Math.min(C.magazine-m.ammo,g.reserve);m.ammo+=n;g.reserve-=n}else{sprite.play('torturado-reload',true);return}}
  if(m.prepareAt){sprite.setVelocity(0).setTint(m.special?0xff498d:0xffdabd);if(s.clock>=m.prepareAt){sprite.clearTint();m.prepareAt=0;if(s.lineClear(sprite.x,sprite.y,m.aim.x,m.aim.y)){const angle=Math.atan2(m.aim.y-sprite.y,m.aim.x-sprite.x);s.shoot(sprite.x,sprite.y,angle,cfg.damage,true,C.range,m.special?C.specialSpread:C.spread,m.special?C.specialPellets:C.pellets,false,3);m.ammo--;sprite.play('torturado-shoot',false);m.poseUntil=s.clock+240}m.fireAt=s.clock+C.cadence;if(m.special)m.nextSpecial=s.clock+C.specialCooldown}return}
  sprite.clearTint();if(s.clock<m.poseUntil)return;
  if(m.ammo<=0){if(s.survival.mind(e).weapon!.reserve>0){m.reloadAt=s.clock+C.reload;sprite.play('torturado-reload',true)}else s.navigation.move(e,body.x,body.y,speed);return}
  if(los&&dist<C.range&&s.clock>=m.fireAt){m.special=s.clock>=m.nextSpecial;m.prepareAt=s.clock+(m.special?C.specialPrepare:C.prepare);m.aim={x:p.x,y:p.y};sprite.play('torturado-shoot',true);return}
  const current=sprite.anims.currentAnim?.key;if(current==='torturado-hurt'&&sprite.anims.isPlaying)return;sprite.play(s.clock<m.chargeUntil?'torturado-dash':sprite.body!.velocity.length()>4?'torturado-walk':'torturado-idle',true);sprite.setFlipX(p.x<sprite.x)
 }
}

