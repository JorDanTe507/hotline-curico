import Phaser from 'phaser';
import type {Game, Foe} from '../scenes/Game';
import {gun, type Gun} from '../weapons/arsenal';
import {developerSession} from '../systems/DeveloperSession';
import {maxHealth} from '../systems/HealthCapacity';
import {BOSS_SHAPES, BOSS_VISUAL_SCALE, bossOriginY} from '../bosses/BossGeometry';
import {hudPreferences} from '../ui/HudPreferences';
import {playerInput} from '../input/InputHub';
import {UROBOROS_ATLAS as ATLAS} from './assets';
import {CRATES, DIRECTOR_START} from './Station';
import {INTRO_LINES, TRANSFORM_LINE, TRANSFORM_REPLIES, UROBOROS as C, WESKER} from './config';

type Attack = keyof typeof C.attacks;
type Point = {x:number; y:number};
type Stage = 1 | 2;
type Mode = 'intro' | 'pursue' | 'windup' | 'dash' | 'grab' | 'evade' | 'recover' | 'transform' | 'won';
interface ActorKit {guns:Gun[]; active:number; medkits:number; adrenaline:number; armor:number; charge:number; counts:number[]; selected:number}
interface Infection {level:number; elapsed:number; cures:number; protectedUntil:number; throwUntil:number; vx:number; vy:number; noticeUntil:number}
interface AttackPlan {kind:Attack; target:Point; angle:number}
interface Bolt {sprite:Phaser.GameObjects.Image; vx:number; vy:number; remaining:number}

export function captureUroborosKit(s: Game): ActorKit[] {
  return (s.coop ? [s,s.coop.actor(2)] : [s]).map(a=>({
    guns:a.guns.map(g=>({...g})), active:a.active, medkits:a.run.medkits, adrenaline:a.run.adrenaline,
    armor:a.run.armor, charge:a.ultimate.charge, counts:[...a.chaos.inventory.counts], selected:a.chaos.inventory.selected,
  }));
}
export type UroborosKit = ReturnType<typeof captureUroborosKit>;

export class UroborosEncounter {
  readonly foe: Foe;
  readonly initial: UroborosKit;
  readonly infections = new Map<number, Infection>();
  readonly cures: Phaser.GameObjects.Image[] = [];
  stage: Stage = 1;
  mode: Mode = 'intro';
  private time = 0;
  private until = 0;
  private lastAttack?: Attack;
  private evasions = 0;
  private vulnerableUntil = 0;
  private nextDodge: number = C.dodgeCooldown;
  private plan?: AttackPlan;
  private grabbed?: Game;
  private dashStart?: Point;
  private lethalPending = false;
  private stopped = false;
  private lastHit = 0;
  private bolts: Bolt[] = [];
  private effects: Phaser.GameObjects.Image[] = [];
  private graphics: Phaser.GameObjects.Graphics;
  private infectionAura: Phaser.GameObjects.Graphics;
  private markers = new Map<number, Phaser.GameObjects.Text>();
  private status: Phaser.GameObjects.Text;
  private icon: Phaser.GameObjects.Image;
  private meter: Phaser.GameObjects.Graphics;

  constructor(private s: Game, kit: UroborosKit) {
    this.initial=kit;
    this.graphics=s.add.graphics().setDepth(17);
    this.infectionAura=s.add.graphics().setDepth(17);
    this.status=s.add.text(640,169,'',{fontFamily:'monospace',fontSize:16,color:'#ffcaff',stroke:'#130820',strokeThickness:4})
      .setOrigin(.5).setScrollFactor(0).setDepth(96);
    this.icon=s.add.image(640,199,ATLAS,'infection').setDisplaySize(24,24).setScrollFactor(0).setDepth(96);
    this.meter=s.add.graphics().setScrollFactor(0).setDepth(96);
    for (const [i,a] of this.actors().entries()) {
      const saved=kit[i];
      a.guns=saved?saved.guns.map(g=>({...g})):[gun(0)];
      if (!saved) continue;
      a.active=Math.max(0,Math.min(saved.active,a.guns.length-1));
      a.run.medkits=saved.medkits;
      a.run.adrenaline=saved.adrenaline;
      a.run.armor=saved.armor;
      a.ultimate.charge=Math.min(saved.charge,a.ultimate.requiredHits);
      a.chaos.inventory.counts.splice(0,saved.counts.length,...saved.counts);
      a.chaos.inventory.selected=saved.selected;
    }
    const {x,y}=DIRECTOR_START;
    const sprite=s.physics.add.sprite(x,y,ATLAS,'human-idle-down-0').setDepth(10);
    this.applyScale(sprite);
    const hp=Math.round(C.health*(s.coop?C.coopHealth:1)*(s.rush?.tuning(WESKER).hp??1));
    this.foe={sprite,boss:WESKER,tier:0,hp,max:hp,canPickupWeapons:false,next:0,pathAt:0,target:null,awake:true,
      label:s.add.text(x,y-55,'EL DIRECTOR',{fontFamily:'monospace',fontSize:13,color:'#fbc9ff',stroke:'#11091b',strokeThickness:3}).setOrigin(.5)};
    this.foe.collider=s.physics.add.collider(sprite,s.walls,()=>{
      if(this.mode==='dash'||this.mode==='evade')this.recover();
    });
    s.foes.push(this.foe);
    CRATES.forEach((p,i)=>s.fortune.placeUroborosCrate('uroboros-'+i,p.x,p.y,C.crateHP));
    s.rounds.state.stop();
    this.animate('idle',0,1);
  }

  start(done?:()=>void) {
    const enter=()=>{this.recover(900);done?.();};
    if(this.s.rush?.endless)this.s.time.delayedCall(850,enter);
    else this.dialogue(false,enter);
  }
  evadeBullet(origin?: Point) {
    const settings = C.bulletEvade;
    if (!this.s.rush?.combat || !origin || this.stopped || this.s.temporal.active ||
        !['pursue','recover','evade'].includes(this.mode) || this.time < this.vulnerableUntil ||
        Math.random() >= settings.chance) return false;
    const e = this.foe.sprite;
    if (this.mode !== 'evade') {
      const angle = Math.atan2(e.y-origin.y,e.x-origin.x) + Math.PI/2;
      const paths = [angle,angle+Math.PI].map(a=>this.clip(e,a,settings.distance));
      const path = paths.find(p=>Math.hypot(p.x-e.x,p.y-e.y)>=24);
      if (!path) return false;
      const dx=path.x-e.x,dy=path.y-e.y;
      this.animate('dash',dx,dy);
      e.setVelocity(dx*1000/C.dodgeMs,dy*1000/C.dodgeMs);
      this.mode='evade';
      this.until=this.time+C.dodgeMs;
    }
    if (++this.evasions >= settings.budget) {
      this.evasions = 0;
      this.vulnerableUntil = this.time + settings.cooldown;
    }
    return true;
  }
  get finished() { return this.mode==='won'; }
  get transforming() { return this.mode==='transform'; }

  private applyScale(sprite: Phaser.Physics.Arcade.Sprite) {
    const shape=BOSS_SHAPES[WESKER], factor=C.visualScale[this.stage-1]*(this.stage===2&&this.s.rush?1.10:1);
    const originalOrigin=bossOriginY(WESKER)*shape.height;
    const origin=shape.feet-(shape.feet-originalOrigin)/factor;
    // Keep the feet and the footprint in the same world coordinates.
    sprite.setScale(BOSS_VISUAL_SCALE*factor).setOrigin(.5,origin/shape.height);
    const body=sprite.body!;
    body.setSize(shape.bodyW/factor,shape.bodyH/factor,false).setOffset(
      shape.anchorX+(shape.bodyX-shape.anchorX)/factor,
      origin+(shape.bodyY-originalOrigin)/factor,
    );
    body.updateFromGameObject();
  }
  private actors() { return this.s.coop?[this.s,this.s.coop.actor(2)]:[this.s]; }
  private living() { return this.s.coop?.livingActors()??(this.s.run.health>0?[this.s]:[]); }
  state(id:number) {
    let state=this.infections.get(id);
    if (!state) {
      state={level:0,elapsed:0,cures:0,protectedUntil:0,throwUntil:0,vx:0,vy:0,noticeUntil:0};
      this.infections.set(id,state);
    }
    return state;
  }

  private dialogue(transform:boolean, done:()=>void) {
    if(transform&&this.s.rush?.endless){this.s.physics.world.resume();done();return;}
    const actors=this.actors();
    const lines=transform
      ? [{name:'WESKER',portrait:ATLAS,frame:'mutant-portrait',text:TRANSFORM_LINE},
         ...actors.map(a=>({name:a.character.name,portrait:a.character.portrait,text:TRANSFORM_REPLIES[a.character.id]}))]
      : actors.flatMap(a=>[
          {name:'WESKER',portrait:ATLAS,frame:'human-portrait',text:INTRO_LINES[a.character.id][0]},
          {name:a.character.name,portrait:a.character.portrait,text:INTRO_LINES[a.character.id][1]},
        ]);
    for(const actor of actors)actor.player.setVelocity(0);
    this.foe.sprite.setVelocity(0);
    this.s.bossDialogue.start(done,lines);
  }

  hit(n:number) {
    if (this.stopped || this.finished || this.mode==='intro' || this.mode==='transform' || n<=0) return;
    const e=this.foe;
    const remaining=e.hp-n;
    if (remaining<=0 && this.stage===1) {
      this.lethalPending=true;
      e.hp=1;
    } else {
      e.hp=Math.max(0,remaining);
    }
    if (e.hp<=0) { this.win();return; }
    if(this.mode==='pursue'||this.mode==='recover'){
      this.lastHit=this.time+165;
      this.animate('hurt');
    }
  }

  private transform() {
    this.clearEffects();
    this.mode='transform';
    this.s.rush?.music('wesker-mutated',360);
    this.plan=undefined;
    this.grabbed=undefined;
    for(const actor of this.actors()){
      this.state(actor.playerId).throwUntil=0;
      actor.player.setVelocity(0);
    }
    this.s.physics.world.pause();
    this.animate('transform');
    const e=this.foe;
    this.effect('purge',e.sprite,120,620);
    this.until=this.time+620;
    e.sprite.setVelocity(0);
  }

  private recover(duration:number=C.recovery[this.stage-1]) {
    this.mode='recover';
    this.until=this.time+duration*(this.s.rush?.tuning(WESKER).recovery??1);
    this.plan=undefined;
    this.grabbed=undefined;
    this.foe.sprite.setVelocity(0);
  }

  private animate(action:string,dx=0,dy=1) {
    const form=this.stage===2?'mutant':'human';
    const direction=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
    const anim='uro-'+form+'-'+action+'-'+direction;
    const fallback='uro-'+form+'-idle-'+direction;
    this.foe.sprite.play(this.s.anims.exists(anim)?anim:fallback,true);
  }

  private contains(point:Point,radius:number, actor:Game) {
    return Math.hypot(actor.player.x-point.x,actor.player.y-point.y)<=radius
      &&this.s.lineClear(point.x,point.y,actor.player.x,actor.player.y);
  }

  private hurt(a:Game,damage:number,infects:boolean) {
    if (a.dash.active(this.s.clock))return;
    const hp=a.run.health, armor=a.run.armor+(a.run.temporaryArmor??0);
    a.damage(damage*(this.s.rush?.tuning(WESKER).damage??1),true);
    if(infects&&a.run.health>0&&(a.run.health<hp||a.run.armor+(a.run.temporaryArmor??0)<armor))this.infect(a);
  }

  infect(a:Game) {
    const state=this.state(a.playerId);
    state.level=Math.min(3,state.level+1);
    state.noticeUntil=this.s.clock+1700;
  }

  clearInfection(a:Game) {
    const state=this.state(a.playerId);
    state.level=0;
    state.elapsed=0;
    state.noticeUntil=0;
    this.refreshHud();
  }

  useCure(a:Game) {
    const state=this.state(a.playerId);
    if(!state.level||!state.cures||!this.living().some(actor=>actor.playerId===a.playerId)||this.s.paused||this.transforming||this.s.bossDialogue.active||this.finished)return false;
    state.cures--;
    this.s.rush?.markCure();
    this.clearInfection(a);
    this.effect('purge',a.player,90,480);
    return true;
  }

  dropCure(x:number,y:number) {
    if(this.finished)return;
    const vial=this.s.add.image(x,y,ATLAS,'cure').setDisplaySize(22,36).setDepth(12);
    this.cures.push(vial);
  }

  pickup(a:Game) {
    if(this.stopped||!this.living().some(actor=>actor.playerId===a.playerId))return false;
    const vial=this.cures.find(item=>this.contains(item,78,a));
    if(!vial)return false;
    this.cures.splice(this.cures.indexOf(vial),1);
    vial.destroy();
    this.state(a.playerId).cures++;
    this.refreshHud();
    return true;
  }

  /** Called before input movement so the normal player collider limits throws. */
  locked(a:Game) {
    if(this.grabbed===a) { a.player.setVelocity(0);return true; }
    const state=this.state(a.playerId);
    if(this.s.clock>=state.throwUntil)return false;
    a.player.setVelocity(state.vx,state.vy);
    return true;
  }

  private updateInfection(elapsed:number) {
    for(const a of this.living()) {
      const state=this.state(a.playerId);
      if(!state.level)continue;
      state.elapsed+=Math.min(elapsed,250);
      if(state.elapsed>=C.infectionTick) {
        state.elapsed-=C.infectionTick;
        a.damage(C.infectionDps[state.level-1],true,false,true);
        if(this.s.ended)return;
      }
    }
  }

  private prepare(kind:Attack, actor:Game) {
    const e=this.foe.sprite, target={x:actor.player.x,y:actor.player.y};
    const angle=Math.atan2(target.y-e.y,target.x-e.x);
    const center=kind==='tentacles'?target:{x:e.x,y:e.y};
    this.plan={kind,target:center,angle};
    this.lastAttack=kind;
    this.mode='windup';
    const warning=C.attacks[kind].windup,tuning=this.s.rush?.tuning(WESKER);
    this.until=this.time+(tuning?Math.max(400,warning*tuning.warning):warning);
    e.setVelocity(0);
    const pose=kind==='charge'?(this.stage===1?'grab':'roar'):'idle';
    this.animate(pose,Math.cos(angle),Math.sin(angle));
  }

  private warning() {
    const p=this.plan!;
    if(p.kind==='charge')return;
    const a=C.attacks[p.kind], e=this.foe.sprite;
    this.graphics.lineStyle(3,0xff3d79,.95).fillStyle(0xf83288,.16);
    if(p.kind==='projectile') {
      const end=this.clip(e,p.angle,a.radius);
      this.graphics.lineBetween(e.x,e.y,end.x,end.y);
      this.graphics.strokeCircle(end.x,end.y,19);
    } else {
      this.graphics.fillCircle(p.target.x,p.target.y,a.radius).strokeCircle(p.target.x,p.target.y,a.radius);
    }
  }

  private clip(origin:Point,angle:number,range:number) {
    let last={x:origin.x,y:origin.y};
    for(let d=8;d<=range;d+=8) {
      const p={x:origin.x+Math.cos(angle)*d,y:origin.y+Math.sin(angle)*d};
      if(!this.s.walkablePoint(p.x,p.y))break;
      last=p;
    }
    return last;
  }

  private releaseAttack() {
    const p=this.plan!, a=C.attacks[p.kind], e=this.foe.sprite;
    const dx=Math.cos(p.angle),dy=Math.sin(p.angle);
    if(p.kind==='charge') {
      this.mode='dash';
      this.until=this.time+Math.min(C.dashMs,a.radius/C.dashSpeed*1000);
      this.dashStart={x:e.x,y:e.y};
      this.animate('dash',dx,dy);
      e.setVelocity(dx*C.dashSpeed,dy*C.dashSpeed);
      return;
    }
    if(p.kind==='projectile') {
      const sprite=this.s.add.image(e.x,e.y,ATLAS,'projectile').setDisplaySize(48,20).setRotation(p.angle).setDepth(18);
      this.bolts.push({sprite,vx:dx*390,vy:dy*390,remaining:a.radius});
      this.animate('strike',dx,dy);
    } else {
      this.animate(p.kind==='sweep'?'sweep':'strike',dx,dy);
      if(p.kind!=='strike')this.effect(p.kind==='tentacles'?'tentacles':'impact',p.target,a.radius*1.7,420);
      for(const target of this.living())if(this.contains(p.target,a.radius,target))this.hurt(target,a.damage,a.infects);
    }
    if(!this.s.ended)this.recover();
  }

  private charge() {
    const e=this.foe.sprite, p=this.plan!;
    if(e.body!.blocked.none===false||this.time>=this.until) { this.recover();return; }
    const start=this.dashStart!;
    if(!this.s.lineClear(start.x,start.y,e.x,e.y)) { this.recover();return; }
    for(const a of this.living()) {
      const state=this.state(a.playerId);
      if(this.s.clock<state.protectedUntil||a.dash.active(this.s.clock)||!this.contains(e,48,a))continue;
      this.grabbed=a;
      a.player.setVelocity(0);
      e.setVelocity(0);
      this.mode='grab';
      this.until=this.time+C.grabMs;
      this.animate(this.stage===2?'sweep':'grab',Math.cos(p.angle),Math.sin(p.angle));
      return;
    }
  }

  private throwGrabbed() {
    const a=this.grabbed;
    const angle=this.plan!.angle;
    this.recover();
    if(!a||!this.living().includes(a))return;
    const state=this.state(a.playerId);
    state.protectedUntil=this.s.clock+C.grabProtection;
    this.hurt(a,C.attacks.charge.damage,true);
    if(a.run.health<=0)return;
    const end=this.clip(a.player,angle,C.throwSpeed*C.throwMs/1000);
    const distance=Math.hypot(end.x-a.player.x,end.y-a.player.y);
    state.throwUntil=this.s.clock+distance/C.throwSpeed*1000;
    state.vx=Math.cos(angle)*C.throwSpeed;
    state.vy=Math.sin(angle)*C.throwSpeed;
  }

  private updateBolts(elapsed:number) {
    const dt=Math.min(elapsed,50)/1000;
    this.bolts=this.bolts.filter(bolt=>{
      const sprite=bolt.sprite;
      const from={x:sprite.x,y:sprite.y};
      const next={x:from.x+bolt.vx*dt,y:from.y+bolt.vy*dt};
      bolt.remaining-=Math.hypot(next.x-from.x,next.y-from.y);
      if(bolt.remaining<=0||!this.s.walkablePoint(next.x,next.y)||!this.s.lineClear(from.x,from.y,next.x,next.y)) {
        sprite.destroy();return false;
      }
      sprite.setPosition(next.x,next.y);
      const victim=this.living().find(a=>this.contains(next,24,a)&&!a.dash.active(this.s.clock));
      if(!victim)return true;
      this.hurt(victim,C.attacks.projectile.damage,C.attacks.projectile.infects);
      sprite.destroy();
      return false;
    });
  }

  private pursue() {
    const e=this.foe, s=this.s;
    const target=this.living().sort((a,b)=>
      Math.hypot(a.player.x-e.sprite.x,a.player.y-e.sprite.y)-Math.hypot(b.player.x-e.sprite.x,b.player.y-e.sprite.y))[0];
    if(!target)return;
    const dx=target.player.x-e.sprite.x,dy=target.player.y-e.sprite.y,d=Math.hypot(dx,dy);
    if(s.lineClear(e.sprite.x,e.sprite.y,target.player.x,target.player.y)) {
      const pool:Attack[]=this.stage===2
        ? ['charge','sweep','projectile','ground','strike','tentacles','burst']
        : ['charge','strike'];
      const available=pool.filter(kind=>{
        const reach=kind==='charge'?290:kind==='tentacles'?245:kind==='projectile'?530:C.attacks[kind].radius-10;
        return d<=reach;
      });
      if(available.length){
        const alternatives=available.filter(kind=>kind!==this.lastAttack);
        const choices=alternatives.length?alternatives:available;
        this.prepare(choices[Math.floor(Math.random()*choices.length)],target);
        return;
      }
      if(!s.rush&&this.stage===1&&d<360&&this.time>=this.nextDodge) {
        const p=this.clip(e.sprite,Math.atan2(dy,dx)+Math.PI/2,65);
        if(Math.hypot(p.x-e.sprite.x,p.y-e.sprite.y)>32) {
          this.animate('run',p.x-e.sprite.x,p.y-e.sprite.y);
          this.nextDodge=this.time+C.dodgeCooldown;
          this.mode='evade';
          this.until=this.time+C.dodgeMs;
          const angle=Math.atan2(p.y-e.sprite.y,p.x-e.sprite.x);
          e.sprite.setVelocity(Math.cos(angle)*C.dodgeSpeed,Math.sin(angle)*C.dodgeSpeed);
          return;
        }
      }
    }
    s.navigation.move(e,target.player.x,target.player.y,C.speed[this.stage-1]*(s.rush?.tuning(WESKER).speed??1));
    if(this.time>=this.lastHit)this.animate('walk',dx,dy);
  }

  refreshHud() {
    if(this.stopped)return;
    const actors=this.actors(), living=this.living();
    this.infectionAura.clear();
    this.status.setVisible(!this.s.registry.get('mobileUI'));
    this.status.setText(actors.map(a=>{
      const state=this.state(a.playerId), input=playerInput(a).last;
      const shortcut=hudPreferences.helpers?` [${input==='gamepad'?'↑':input==='touch'?'CURA':'U'}]`:'';
      return `${this.s.coop?'J'+a.playerId+' · ':''}INFECCIÓN ${state.level}/3 · CURAS ${state.cures}${shortcut}`;
    }).join('     '));
    this.meter.clear();
    for(const [i,a] of actors.entries()){
      const state=this.state(a.playerId), level=state.level;
      let label=this.markers.get(a.playerId);
      if(!label){
        label=this.s.add.text(0,0,'',{fontFamily:'monospace',fontSize:12,color:'#f5a5ff',stroke:'#190c22',strokeThickness:4})
          .setOrigin(.5).setDepth(21);
        this.markers.set(a.playerId,label);
      }
      const visible=living.includes(a)&&level>0;
      label.setVisible(visible).setPosition(a.player.x,a.player.y-62);
      if(visible){
        label.setText(this.s.clock<state.noticeUntil?'¡INFECTADO!':'INFECCIÓN '+level+'/3');
        this.infectionAura.lineStyle(2,0xd447ef,.65).strokeEllipse(a.player.x,a.player.y+17,36+level*8,18+level*3);
      }
      const x=actors.length===1?530:i===0?395:665;
      this.meter.fillStyle(0x1d142b,.92).fillRect(x,191,220,8);
      this.meter.lineStyle(1,0xb57ac1,.85).strokeRect(x,191,220,8);
      this.meter.fillStyle(level===3?0xff3878:0xd64af1,.95).fillRect(x+1,192,218*level/3,6);
    }
    this.icon.setVisible(actors.some(a=>this.state(a.playerId).level>0));
    this.icon.setPosition(actors.length===1?511:640,195);
  }

  update(elapsed:number) {
    if(this.stopped||this.finished||this.s.ended||this.s.bossDialogue.active)return;
    this.graphics.clear();
    const e=this.foe;
    e.label.setPosition(e.sprite.x,e.sprite.y-(e.sprite.displayOriginY-27)*e.sprite.scaleY-12);
    this.refreshHud();
    if(this.s.temporal.active) {
      this.updateInfection(elapsed);
      if(!this.stopped&&this.mode==='windup')this.warning();
      return;
    }
    this.time+=Math.min(100,elapsed);
    if(this.stage===1&&e.hp<=e.max*C.mutation&&!this.transforming){
      this.transform();
      return;
    }
    if(this.transforming){
      if(this.time>=this.until){
        this.stage=2;
        this.applyScale(e.sprite);
        this.animate('roar');
        this.dialogue(true,()=>{
          if(this.lethalPending){e.hp=0;this.win();}
          else this.recover(C.recovery[1]);
        });
      }
      return;
    }
    this.updateInfection(elapsed);
    if(this.s.ended)return;
    for(const vial of this.cures)vial.setAlpha(.85+Math.sin(this.time/180)*.15);
    this.updateBolts(elapsed);
    if(this.s.ended)return;
    if(this.mode==='windup') {
      this.warning();
      if(this.time>=this.until)this.releaseAttack();
    } else if(this.mode==='dash') {
      this.charge();
    } else if(this.mode==='grab') {
      if(this.time>=this.until)this.throwGrabbed();
    } else if(this.mode==='evade') {
      if(this.time>=this.until)this.recover(360);
    } else if(this.mode==='recover') {
      if(this.time>=this.until)this.mode='pursue';
    } else if(this.mode==='pursue') {
      this.pursue();
    }
  }

  private effect(key:string,p:Point,size:number,duration:number) {
    const image=this.s.add.image(p.x,p.y,ATLAS,key).setDepth(16);
    image.setScale(size/image.width);
    this.effects.push(image);
    this.s.tweens.add({targets:image,alpha:0,duration,onComplete:()=>{
      image.destroy();
      this.effects=this.effects.filter(fx=>fx!==image);
    }});
  }

  clearEffects() {
    this.graphics.clear();
    for(const bolt of this.bolts)bolt.sprite.destroy();
    this.bolts=[];
    for(const image of this.effects) {
      this.s.tweens.killTweensOf(image);
      image.destroy();
    }
    this.effects=[];
    for(const state of this.infections.values())state.throwUntil=0;
    this.grabbed=undefined;
  }

  resetAttack() {
    this.clearEffects();
    if(this.mode!=='transform'&&this.mode!=='intro'&&!this.finished)this.recover();
  }

  stop() {
    if(this.stopped)return;
    this.stopped=true;
    this.clearEffects();
    for(const a of this.actors()){this.clearInfection(a);this.state(a.playerId).cures=0;}
    for(const marker of this.markers.values())marker.setVisible(false);
    for(const vial of this.cures)vial.destroy();
    this.cures.length=0;
    this.status.setVisible(false);
    this.icon.setVisible(false);
    this.meter.clear();
    this.infectionAura.clear();
  }

  forceTransformation() {
    if(this.stopped||this.stage!==1||this.transforming)return;
    this.foe.hp=Math.min(this.foe.hp,this.foe.max*C.mutation);
  }

  private win() {
    const s=this.s,e=this.foe;
    this.mode='won';
    this.stop();
    e.collider?.destroy();
    s.foes=s.foes.filter(f=>f!==e);
    this.effect('impact',e.sprite,135,570);
    const feetY=e.sprite.y+(BOSS_SHAPES[WESKER].feet-e.sprite.displayOriginY)*e.sprite.scaleY;
    const fallen=s.add.sprite(e.sprite.x,feetY,ATLAS,'defeat-0').setOrigin(.5,1).setScale(.82*C.visualScale[1]).setDepth(11);
    fallen.play('uro-defeat');
    e.sprite.destroy();
    e.label.destroy();
    s.temporal.end(false);
    if(s.rush){s.rush.defeated();return;}
    for(const shot of s.shots) {
      if(shot.collider?.active)shot.collider.destroy();
      if(shot.sprite.active)shot.sprite.destroy();
    }
    s.shots.length=0;
    for(const a of this.actors()) {
      a.player.setVelocity(0);
      a.ultimate.stop();
      a.chaos.stop();
    }
    s.physics.world.pause();
    s.time.delayedCall(560,()=>s.pauseMenu.showUroborosResult());
  }

  restart() {
    if(!developerSession.active)return;
    this.s.scene.restart({
      retry:true, characterId:this.s.character.id, coop:!!this.s.coop,
      partnerId:this.s.coop?.actor(2).character.id, uroboros:true, kit:this.initial,
    });
  }
}
