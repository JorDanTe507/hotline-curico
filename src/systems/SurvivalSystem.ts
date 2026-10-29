import {achievements} from './Achievements';
import {playerDamage} from './PlayerModifiers';
import {MINIGUN_SPINUP,MINIGUN_MOVEMENT} from '../weapons/Minigun';
import {WEAPON_SEARCH_INTERVAL} from '../config/instinct';
import Phaser from 'phaser';
import type {Game,Foe,Drop} from '../scenes/Game';
import type {Gun} from '../weapons/arsenal';
import {WEAPONS,reload,gun,isMelee} from '../weapons/arsenal';
import {blocked} from '../maps/apartments';
import {ENEMIES,enemyAnimation} from '../enemies/config';
import {AudioSystem} from './AudioSystem';
import * as C from '../config/survival';
export type EnemyAction='esperar'|'perseguir'|'buscar arma'|'recoger arma'|'atacar'|'preparar ejecución'|'aturdido'|'muerto';
interface Mind {owner:string;spinAt?:number;state:EnemyAction;stunUntil:number;nextSearch:number;weapon?:Gun;reloadAt:number;target?:Drop;visual?:Phaser.GameObjects.Image}
interface Thrown {sprite:Phaser.Physics.Arcade.Sprite;weapon:Gun;left:number;last:{x:number;y:number};collider?:Phaser.Physics.Arcade.Collider}
export class SurvivalSystem {
 private minds=new WeakMap<Foe,Mind>();private ownerSequence=0;
 private claims=new Map<Drop,Foe>();
 private enemyExecution?:{enemy:Foe;until:number};
 private playerExecution?:{enemy:Foe;until:number};
 private nextEnemyExecution=0;
 private thrown:Thrown[]=[];
 constructor(private game:Game){}
 get executing(){return !!this.playerExecution}
 mind(e:Foe):Mind {let m=this.minds.get(e);if(!m){m={owner:'enemy-'+(++this.ownerSequence),state:'esperar',stunUntil:0,reloadAt:0,nextSearch:0};this.minds.set(e,m)}return m}
 speed(e:Foe){return C.enemyMovementSpeed(ENEMIES[e.tier].speed,e.boss>=0)}
 private distance(e:Foe){return Phaser.Math.Distance.Between(e.sprite.x,e.sprite.y,this.game.player.x,this.game.player.y)}
 private clear(e:Foe){const s=this.game;return s.lineClear(e.sprite.x,e.sprite.y,s.player.x,s.player.y)}
 private release(e:Foe){const m=this.mind(e);if(m.target){if(this.claims.get(m.target)===e)this.claims.delete(m.target);m.target=undefined}}
 private cancelEnemyExecution(){if(this.enemyExecution){const e=this.enemyExecution.enemy;if(e.sprite.active){e.sprite.clearTint();e.sprite.setTint(e.tier===0?0xffffff:ENEMIES[e.tier].color);e.sprite.setScale(e.boss<0?42/96:62/96,e.boss<0?58/112:88/112)}this.mind(e).state='perseguir';this.enemyExecution=undefined}}
 markAttack(e:Foe){if(e.boss<0)this.mind(e).state='atacar'}
 equipInitial(e:Foe){const initial=e.boss>=0?3:ENEMIES[e.tier].weapon;if(initial===undefined)return;const g=gun(initial);if(e.boss>=0){g.ammo=4;g.reserve=60}this.equip(e,g)}
 equip(e:Foe,g:Gun){const m=this.mind(e);if(!this.game.weaponInstances.register(g,'enemy',m.owner))return false;const old=m.weapon;m.weapon=undefined;if(old&&old!==g)this.game.addDrop(e.sprite.x,e.sprite.y,'gun',old.id,old);m.visual?.destroy();m.visual=undefined;m.weapon=g;m.reloadAt=0;m.spinAt=undefined;return true}
 died(e:Foe,drop=false){this.onHit(e);this.release(e);const m=this.mind(e),g=m.weapon;m.weapon=undefined;m.visual?.destroy();m.visual=undefined;m.state='muerto';if(g){if(drop)this.game.addDrop(e.sprite.body!.center.x,e.sprite.body!.center.y,'gun',g.id,g);else this.game.weaponInstances.retire(g,'enemy')}}
 onHit(e:Foe){if(this.enemyExecution?.enemy===e)this.cancelEnemyExecution()}
 stun(e:Foe,extra=0){if(e.boss>=0)return;this.onHit(e);this.release(e);const m=this.mind(e);m.spinAt=undefined;m.stunUntil=this.game.clock+C.STUN_DURATION+extra;m.state='aturdido';e.sprite.setVelocity(0)}
 tryExecute(){const s=this.game;if(this.executing||s.ended||s.paused||s.roulette.active||s.levelUp.active||s.dash.active(s.clock)||s.reloadAt)return false;const enemy=s.foes.filter(e=>e.boss<0&&e.hp>0&&e.sprite.active&&this.mind(e).stunUntil>s.clock&&this.distance(e)<=C.PLAYER_EXECUTION_RANGE&&this.clear(e)).sort((a,b)=>this.distance(a)-this.distance(b))[0];if(!enemy)return false;
  this.onHit(enemy);this.release(enemy);this.playerExecution={enemy,until:s.clock+C.PLAYER_EXECUTION_DURATION};enemy.sprite.setVelocity(0);s.player.setVelocity(0);s.appearance.hold('melee');AudioSystem.play(s,'execute',.7);return true;
 }
 punch(angle:number){const s=this.game;if(s.ended||s.paused||s.roulette.active||s.levelUp.active||this.executing||s.dash.active(s.clock))return false;const targets=s.foes.filter(e=>e.hp>0&&e.sprite.active&&this.distance(e)<=58&&this.clear(e)&&Math.cos(Math.atan2(e.sprite.y-s.player.y,e.sprite.x-s.player.x)-angle)>.35).sort((a,b)=>this.distance(a)-this.distance(b));s.appearance.hold('melee');if(!targets.length)return false;const e=targets[0];s.hit(e,playerDamage(20,s.run.stats,this.distance(e),true));AudioSystem.play(s,'execute',.3);return true}
 throwWeapon(angle:number){const s=this.game;if(s.ended||s.paused||s.roulette.active||s.levelUp.active||this.executing||s.dash.active(s.clock)||!s.guns.length)return false;
  const weapon=s.guns[s.active];if(!s.weaponInstances.fly(weapon))return false;s.guns.splice(s.active,1);s.ultimate.releaseGun(weapon);s.active=Math.min(s.active,Math.max(0,s.guns.length-1));s.reloadAt=0;
  const sprite=s.physics.add.sprite(s.player.x,s.player.y,`weapon-${weapon.id}`).setDepth(14);const width=weapon.id<2?26:44;sprite.setDisplaySize(width,width*sprite.height/sprite.width).setRotation(angle);sprite.body!.setSize(sprite.width,sprite.height);sprite.setVelocity(Math.cos(angle)*C.THROW_SPEED,Math.sin(angle)*C.THROW_SPEED);
  const shot:Thrown={sprite,weapon,left:C.THROW_RANGE,last:{x:s.player.x,y:s.player.y}};this.thrown.push(shot);shot.collider=s.physics.add.collider(sprite,s.walls,()=>this.land(shot));AudioSystem.play(s,'throw',.7);return true;
 }
 private land(t:Thrown){if(!t.sprite.active)return;const s=this.game;let {x,y}=t.last;if(blocked(s.grid,Math.floor(x/48),Math.floor(y/48))){const points:{x:number;y:number}[]=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const tx=Math.floor(x/48)+dx,ty=Math.floor(y/48)+dy;if(!blocked(s.grid,tx,ty))points.push({x:tx*48+24,y:ty*48+24})}points.sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));if(points.length){x=points[0].x;y=points[0].y}}t.collider?.destroy();t.sprite.destroy();s.addDrop(x,y,'gun',t.weapon.id,t.weapon)}
 update(dt:number){const s=this.game;
  if(this.enemyExecution){const {enemy,until}=this.enemyExecution;if(!enemy.sprite.active||enemy.hp<=0||this.mind(enemy).stunUntil>s.clock||s.dash.active(s.clock)||this.executing||this.distance(enemy)>C.ENEMY_EXECUTION_RANGE||!this.clear(enemy))this.cancelEnemyExecution();else if(s.clock>=until){this.cancelEnemyExecution();s.damage(1000,true)}}
  if(this.playerExecution){const {enemy,until}=this.playerExecution;s.appearance.show(Math.floor(s.clock/90)%2?'melee':'hurt');if(!enemy.sprite.active||enemy.hp<=0){this.playerExecution=undefined}else if(s.clock>=until){this.playerExecution=undefined;s.hit(enemy,(enemy.hp+1)*(1+s.run.stats.meleeDamage),{...s.ultimate.shot(s.clock),method:'execute'});achievements().event({type:'execute'})}}
  for(const t of this.thrown){if(!t.sprite.active)continue;const {x,y}=t.sprite;if(!blocked(s.grid,Math.floor(x/48),Math.floor(y/48)))t.last={x,y};t.left-=Math.hypot(t.sprite.body!.velocity.x,t.sprite.body!.velocity.y)*dt/1000;t.sprite.rotation+=dt*.015;
   const e=s.foes.find(e=>e.sprite.active&&e.hp>0&&Phaser.Math.Distance.Between(x,y,e.sprite.x,e.sprite.y)<(e.boss>=0?30:24)&&s.lineClear(t.last.x,t.last.y,e.sprite.x,e.sprite.y));if(e){const level=s.run.upgrades.brutalThrow??0;this.stun(e,250*level);if(level)s.hit(e,10*level,{...s.ultimate.shot(s.clock),method:'throw',weaponId:t.weapon.id});this.land(t)}else if(t.left<=0)this.land(t);
  }this.thrown=this.thrown.filter(t=>t.sprite.active);
 }
 /** Higher priorities consume the enemy's turn; bosses always use their existing AI. */
 updateEnemy(e:Foe){if(e.boss>=0)return false;const s=this.game,m=this.mind(e);e.sprite.setVelocity(0);if(m.visual)m.visual.setPosition(e.sprite.x,e.sprite.y+5);
  if(e.hp<=0||!e.sprite.active){m.state='muerto';this.release(e);return true}
  if(this.playerExecution?.enemy===e){m.state='aturdido';e.label.setText('EJECUTANDO');return true}
  if(m.stunUntil>s.clock){m.state='aturdido';e.label.setText('★ ATURDIDO ★');e.sprite.setAlpha(.65+.3*Math.sin(s.clock/90));return true}
  e.sprite.setAlpha(1);
  if(this.enemyExecution?.enemy===e){m.state='preparar ejecución';e.label.setText('¡EJECUCIÓN! · ALÉJATE');e.sprite.setTint(Math.floor(s.clock/80)%2?0xff174e:0xffffff);e.sprite.play(enemyAnimation(e.tier,'attack'),true);return true}
  e.label.setText(e.tier===0?(m.weapon?'Matón · '+WEAPONS[m.weapon.id].name:ENEMIES[0].name):ENEMIES[e.tier].name);
  const sight=s.perception.update(e),dist=this.distance(e),los=this.clear(e);
  if(sight?.visible&&dist<=C.ENEMY_EXECUTION_RANGE&&los&&!s.dash.active(s.clock)&&!this.executing&&!this.enemyExecution&&s.clock>=this.nextEnemyExecution&&s.clock>=e.next){
   // A failed roll also consumes the global attempt window: no frame-by-frame probability inflation.
   this.nextEnemyExecution=s.clock+C.ENEMY_EXECUTION_COOLDOWN;
   if(Math.random()<C.ENEMY_EXECUTION_CHANCE){this.release(e);this.enemyExecution={enemy:e,until:s.clock+C.ENEMY_EXECUTION_PREPARE};m.state='preparar ejecución';e.sprite.play(enemyAnimation(e.tier,'attack'),true);e.label.setText('¡EJECUCIÓN! · ALÉJATE');return true}
  }
  if(e.tier===0&&!m.weapon&&e.sprite.anims.isPlaying&&e.sprite.anims.currentAnim?.key==='maton-attack'&&e.next>s.clock){m.state='atacar';return true}
  // Only unarmed matones acquire ground weapons; close combat takes priority.
  if(ENEMIES[e.tier].pickup&&!(m.weapon&&(isMelee(m.weapon.id)||m.weapon.ammo>0||m.weapon.reserve>0))&&!(sight?.visible&&dist<=65)){
   if(m.target&&(!s.drops.includes(m.target)||!m.target.sprite.active))this.release(e);
   if(!m.target&&s.clock>=m.nextSearch){m.nextSearch=s.clock+WEAPON_SEARCH_INTERVAL;const candidates=s.drops.filter(d=>d.ground?.available&&d.weapon&&(!isMelee(d.id)&&(d.weapon.ammo>0||d.weapon.reserve>0))&&!this.claims.has(d)&&Phaser.Math.Distance.Between(d.sprite.x,d.sprite.y,e.sprite.x,e.sprite.y)<=C.WEAPON_DETECTION_RADIUS).sort((a,b)=>Phaser.Math.Distance.Between(a.sprite.x,a.sprite.y,e.sprite.x,e.sprite.y)-Phaser.Math.Distance.Between(b.sprite.x,b.sprite.y,e.sprite.x,e.sprite.y));
    for(const d of candidates){const tx=Math.floor(d.sprite.x/48),ty=Math.floor(d.sprite.y/48);if(!blocked(s.grid,tx,ty)&&s.navigation.canReach(e.sprite.body!.center,{x:d.sprite.x,y:d.sprite.y})){m.target=d;this.claims.set(d,e);break}}
   }
   if(m.target){const d=m.target,distGun=Phaser.Math.Distance.Between(d.sprite.x,d.sprite.y,e.sprite.x,e.sprite.y);if(distGun<28&&s.lineClear(e.sprite.x,e.sprite.y,d.sprite.x,d.sprite.y)){m.state='recoger arma';const acquired=d.ground?s.weaponInstances.take(d.ground,'enemy',m.owner):undefined;if(acquired){const old=m.weapon;m.weapon=undefined;s.removeDrop(d);if(old)s.addDrop(e.sprite.x,e.sprite.y,'gun',old.id,old);this.equip(e,acquired);e.next=s.clock+300}this.release(e);return true}
    m.state='buscar arma';this.move(e,d.sprite.x,d.sprite.y);return true;
   }
  }else this.release(e);
  if(m.weapon&&(isMelee(m.weapon.id)||m.weapon.ammo>0||m.weapon.reserve>0)){
   if(!sight){m.state='esperar';return true}
   const g=m.weapon,w=WEAPONS[g.id],melee=isMelee(g.id),attackRange=ENEMIES[e.tier].weapon===undefined?w.range:Math.min(w.range,ENEMIES[e.tier].range);if(!m.visual)m.visual=s.add.image(e.sprite.x,e.sprite.y,`weapon-${g.id}`).setOrigin(.15,.5).setDepth(13);m.visual.setTexture(s.weaponCombat.texture(g));const a=Math.atan2(sight.y-e.sprite.y,sight.x-e.sprite.x),width=s.weaponCombat.width(g);m.visual.setDisplaySize(width,width*m.visual.height/m.visual.width).setPosition(e.sprite.x+Math.cos(a)*8,e.sprite.y+5).setRotation(s.weaponCombat.rotation(g,a)).setFlipY(Math.cos(a)<0);if(m.reloadAt&&s.clock>=m.reloadAt){reload(g);m.reloadAt=0}if(!melee&&!g.ammo&&!m.reloadAt&&g.reserve)m.reloadAt=s.clock+w.reload;
   m.state='perseguir';if(dist>Math.min(320,attackRange*.65)||!los||!sight.visible)this.move(e,sight.x,sight.y);
   const wants=sight.visible&&los&&dist<attackRange&&!m.reloadAt&&(melee||g.ammo>0);if(g.id===7){if(wants){m.spinAt??=s.clock;m.visual.setTexture(`minigun-${s.clock-m.spinAt<MINIGUN_SPINUP?'spin':'fire'}-${Math.floor(s.clock/70)%2}`);if(s.clock-m.spinAt<MINIGUN_SPINUP)return true}else m.spinAt=undefined}if(wants&&s.clock>=e.next){m.state='atacar';if(!melee)g.ammo--;const cadence=w.rate*ENEMIES[e.tier].cadence/1100;e.next=g.id===7&&s.clock-e.next<cadence?e.next+cadence:s.clock+cadence;if(g.id===7)e.sprite.setVelocity(e.sprite.body!.velocity.x*MINIGUN_MOVEMENT,e.sprite.body!.velocity.y*MINIGUN_MOVEMENT);const a=Math.atan2(s.player.y-e.sprite.y,s.player.x-e.sprite.x);s.weaponCombat.use(g,e.sprite.x,e.sprite.y,a,e)}return true;
  }
  m.state=e.awake?'perseguir':'esperar';if(e.tier>0){if(sight){if(dist>42||!los||!sight.visible)this.move(e,sight.x,sight.y);if(sight.visible&&los&&dist<65&&s.clock>=e.next){e.next=s.clock+1100;e.sprite.play(enemyAnimation(e.tier,'attack'),true);s.damage(ENEMIES[e.tier].damage)}}return true}return false;
 }
 private move(e:Foe,tx:number,ty:number){this.game.navigation.move(e,tx,ty,this.speed(e)*ENEMIES[e.tier].aggression)}
 stop(){this.cancelEnemyExecution();this.playerExecution=undefined;for(const t of this.thrown){t.collider?.destroy();t.sprite.destroy()}this.thrown=[];this.claims.clear()}
}


