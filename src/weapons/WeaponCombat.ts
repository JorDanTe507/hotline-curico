import {achievements} from '../systems/Achievements';
import {enemyAnimation,ENEMIES} from '../enemies/config';
import Phaser from 'phaser';
import type {Game,Foe} from '../scenes/Game';
import {WEAPONS,isMelee,weaponWidth,type Gun} from './arsenal';
import {playerDamage} from '../systems/PlayerModifiers';
import {AudioSystem,SHOTS} from '../systems/AudioSystem';
export class WeaponCombat {
 private usedUntil=new WeakMap<Gun,number>();
 constructor(private s:Game,private random:()=>number=Math.random){}
 use(g:Gun,x:number,y:number,angle:number,enemy?:Foe){const s=this.s,w=WEAPONS[g.id];this.usedUntil.set(g,s.clock+170);const definition=enemy&&enemy.boss<0?ENEMIES[enemy.tier]:undefined,baseWeapon=definition?.weapon,enemyDamage=baseWeapon===undefined?w.damage:w.damage*definition!.damage/WEAPONS[baseWeapon].damage;
  if(!isMelee(g.id)){s.shoot(x,y,angle,enemy?enemyDamage:w.damage,!!enemy,w.range,w.spread,w.pellets,!!w.explosive,g.id);return}
  AudioSystem.play(s,SHOTS[g.id],enemy?.45:1);if(!enemy)achievements().event({type:'weapon',weapon:g.id});
  const arc=s.add.graphics().setDepth(16).lineStyle(3,g.id===15?0xff5680:0x8edcfa,.65);arc.beginPath().arc(x,y,w.range,angle-.8,angle+.8).strokePath();s.tweens.add({targets:arc,alpha:0,duration:160,onComplete:()=>arc.destroy()});
  if(enemy){enemy.sprite.play(enemyAnimation(enemy.tier,'attack'),true);if(Math.hypot(s.player.x-x,s.player.y-y)<=w.range&&s.lineClear(x,y,s.player.x,s.player.y))s.damage(enemyDamage);return}
  s.appearance.hold('melee');const targets=s.foes.filter(e=>e.sprite.active&&e.hp>0&&Math.hypot(e.sprite.x-x,e.sprite.y-y)<=w.range&&Math.cos(Math.atan2(e.sprite.y-y,e.sprite.x-x)-angle)>.35&&s.lineClear(x,y,e.sprite.x,e.sprite.y)).sort((a,b)=>Math.hypot(a.sprite.x-x,a.sprite.y-y)-Math.hypot(b.sprite.x-x,b.sprite.y-y));
  if(targets[0]){const e=targets[0];s.hit(e,playerDamage(w.damage,s.run.stats,Math.hypot(e.sprite.x-x,e.sprite.y-y),true)*(s.ultimate.active(s.clock)?s.ultimate.weaponMultiplier:1),{...s.ultimate.shot(s.clock),weaponId:g.id,method:'melee'});if(e.hp>0&&this.random()<(w.stunChance??0))s.survival.stun(e)}
 }
 texture(g:Gun){if(g.id===7)return this.s.minigunTexture();return g.id>=8&&this.s.clock<(this.usedUntil.get(g)??0)?`weapon-${g.id}-fire-${Math.floor(this.s.clock/65)%2}`:`weapon-${g.id}`}
 rotation(g:Gun,angle:number){if(!isMelee(g.id))return angle;const until=this.usedUntil.get(g)??0;return until>this.s.clock?angle-.9+1.8*(1-(until-this.s.clock)/170):angle}
 width(g:Gun){return weaponWidth(g.id)}
}

