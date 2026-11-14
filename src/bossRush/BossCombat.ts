import Phaser from 'phaser';
import type {Game,Foe} from '../scenes/Game';
import {bossAnimation,bossName} from '../bosses/expansion';
import {AudioSystem} from '../systems/AudioSystem';
import {BOSS_COMBAT as C,bombardmentTargets,turnToward,type CombatPoint} from './combatRules';

interface Mind {
  meleeAt:number; meleeUntil:number; meleeTarget?:CombatPoint;
  action?:'radio'|'bombardment'|'slam'|'machete'|'suppression';
  until:number; next:number; specialUsed:boolean; calls:number; radioAt:number;
  medicUsed:boolean; angle:number; updated:number; slamAt:number; macheteAt:number;
  wave:number; safe?:CombatPoint; pose?:Phaser.GameObjects.Image; machetes?:number; warning?:number; phase2?:boolean;
}
interface Impact extends CombatPoint {owner:Foe;at:number;marker:Phaser.GameObjects.Graphics;image:Phaser.GameObjects.Image}
interface Medic {leader:Foe;until:number;remaining:number}

/** Combat additions belong to the current Rush session, never to Wesker or city rounds. */
export class BossCombat {
  private minds=new Map<Foe,Mind>();
  private medics=new Map<Foe,Medic>();
  private impacts:Impact[]=[];
  private graphics:Phaser.GameObjects.Graphics;
  private blind:Phaser.GameObjects.Rectangle;
  private blindUntil=0;
  private blindAt=0;
  private stunUntil=0;
  private stunAt=0;
  private knockUntil=0;
  private velocity={x:0,y:0};
  private stopped=false;

  constructor(private s:Game) {
    this.graphics=s.add.graphics().setDepth(28);
    this.blind=s.add.rectangle(640,360,1280,720,0xfff4da,0).setScrollFactor(0).setDepth(45);
    s.events.on('postupdate',this.visibility,this);
    s.events.once('shutdown',()=>s.events.off('postupdate',this.visibility,this));
  }
  private visibility() {
    if(!this.stopped)for(const e of this.s.foes)if(e.boss===3)this.s.newBosses.stealth(e);
  }

  private state(e:Foe) {
    let m=this.minds.get(e);
    if(!m){
      m={meleeAt:0,meleeUntil:0,until:0,next:0,specialUsed:false,calls:0,radioAt:0,
        medicUsed:false,angle:0,updated:this.s.clock,slamAt:2500,macheteAt:3500,wave:0};
      this.minds.set(e,m);
    }
    return m;
  }

  private busy(except?:Foe) {
    return [...this.minds].some(([e,m])=>e!==except&&e.hp>0&&(m.action==='radio'||m.action==='bombardment'));
  }
  invulnerable(e:Foe) {const m=this.minds.get(e);return !this.stopped&&e.boss===2&&(m?.action==='radio'||m?.action==='bombardment');}
  phaseTwo(e:Foe){const m=this.state(e);m.phase2 ||= e.hp<=e.max*.5;return m.phase2;}

  observe(e:Foe) {
    if(this.stopped)return;
    if(e.boss<0||e.boss>4)return;
    const m=this.state(e);
    if(e.boss===4)this.phaseTwo(e);
    if(m.action==='radio'&&!this.s.radio.calling(e)){
      m.action=undefined;
      if(e.boss===1)m.radioAt=this.s.clock+6000;
      this.s.newBosses.interrupt(e,this.s.clock+1200);
    }
  }

  freezeEnemy(e:Foe,delta:number) {
    const medic=this.medics.get(e);if(medic)medic.until+=delta;
    const m=this.minds.get(e);
    if(!m)return;
    for(const key of ['meleeAt','meleeUntil','until','next','radioAt','slamAt','macheteAt'] as const)if(m[key])m[key]+=delta;
    m.updated=this.s.clock;
    for(const impact of this.impacts)if(impact.owner===e)impact.at+=delta;
  }

  update() {
    const s=this.s;
    if(this.stopped)return;
    this.graphics.clear();
    this.blind.setFillStyle(0xfff4da,s.clock<this.blindUntil?.85:0);
    if(!s.rush?.combat||this.stopped)return;
    for(const impact of [...this.impacts]){
      if(impact.owner.hp<=0||!impact.owner.sprite.active){this.cancelImpact(impact);continue}
      if(s.temporal.active)continue;
      impact.image.setPosition(impact.x,impact.y-Math.max(0,Math.min(180,(impact.at-s.clock)*.36)));
      if(s.clock>=impact.at){
        this.cancelImpact(impact);
        s.chaos.effect('blast',impact.x,impact.y,C.bombardment.radius*2);
        AudioSystem.play(s,'frag',.45);
        // Bombardment has no boss, barrel or furniture damage path.
        if(Math.hypot(s.player.x-impact.x,s.player.y-impact.y)<C.bombardment.radius&&
          s.lineClear(impact.x,impact.y,s.player.x,s.player.y)){
          s.damage(C.bombardment.damage*s.rush.tuning(2).damage,false,true,false,2);
        }
      }
    }
  }

  private cancelImpact(impact:Impact) {
    impact.marker.destroy();
    impact.image.destroy();
    this.impacts=this.impacts.filter(i=>i!==impact);
  }

  playerLocked() {
    if(this.s.clock>=Math.max(this.stunUntil,this.knockUntil))return false;
    this.s.player.setVelocity(this.s.clock<this.knockUntil?this.velocity.x:0,this.s.clock<this.knockUntil?this.velocity.y:0);
    return true;
  }

  hitPlayer(e:Foe,damage:number,stun=0) {
    const s=this.s,before=s.run.health+s.run.armor+(s.run.temporaryArmor??0);
    s.damage(damage,false,true,false,e.boss);
    if(s.ended||s.run.health+s.run.armor+(s.run.temporaryArmor??0)>=before)return;
    const angle=Math.atan2(s.player.y-e.sprite.y,s.player.x-e.sprite.x);
    this.velocity={x:Math.cos(angle)*C.melee.knockSpeed,y:Math.sin(angle)*C.melee.knockSpeed};
    this.knockUntil=s.clock+C.melee.knockMs;
    if(stun&&s.clock>=this.stunAt){this.stunUntil=s.clock+stun;this.stunAt=this.stunUntil+C.butcher.stunImmunity;}
  }

  close(e:Foe) {
    if(this.stopped||e.boss<0||e.boss>4)return false;
    const s=this.s,m=this.state(e),from=e.sprite;
    if(m.action)return false;
    const range=e.boss===4?C.butcher.meleeRange:C.melee.range;
    const distance=Math.hypot(s.player.x-from.x,s.player.y-from.y);
    if(!m.meleeUntil&&s.clock>=m.meleeAt&&distance<range&&s.lineClear(from.x,from.y,s.player.x,s.player.y)){
      m.meleeUntil=s.clock+C.melee.warning;
      m.meleeTarget={x:s.player.x,y:s.player.y};
      m.meleeAt=m.meleeUntil+C.melee.cooldown;
      if(e.boss>0)s.newBosses.interrupt(e,m.meleeUntil+600);
    }
    if(!m.meleeUntil)return false;
    from.setVelocity(0).play(bossAnimation(e.boss,'shoot'),true);
    e.label.setText(bossName(e.boss)+' · ¡GOLPE!');
    this.graphics.lineStyle(3,0xffb66c,.9).strokeCircle(from.x,from.y,range);
    if(s.clock>=m.meleeUntil){
      m.meleeUntil=0;
      if(distance<range&&s.lineClear(from.x,from.y,s.player.x,s.player.y)){
        this.hitPlayer(e,C.melee.damage*s.rush!.tuning(e.boss).damage);
        AudioSystem.play(s,'punch',.6);
      }
    }
    return true;
  }

  handle(e:Foe) {
    const s=this.s;
    if(this.stopped||!s.rush?.combat)return false;
    const m=this.state(e);
    if(m.action==='radio')return true;
    if(m.action==='suppression')return this.suppress(e,m);
    if(m.action==='bombardment')return this.bombard(e,m);
    if(m.action==='machete')return this.machete(e,m);
    if(m.action==='slam')return this.groundSlam(e,m);
    const distance=Math.hypot(s.player.x-e.sprite.x,s.player.y-e.sprite.y);
    if(e.boss===2&&e.hp<=e.max*.5&&!m.specialUsed&&!this.busy(e)){
      m.specialUsed=true;
      this.startCall(e,m,()=>{m.action='bombardment';m.wave=0;m.next=s.clock;m.until=0});
      return true;
    }
    if(e.boss===1&&e.hp<=e.max*C.radio.threshold&&m.calls<C.radio.calls&&s.clock>=m.radioAt&&
       s.foes.filter(f=>f.rushSupport===e).length<C.radio.maxAlive&&!this.busy(e)){
      m.radioAt=s.clock+6000;
      this.startCall(e,m,()=>{m.calls++;m.radioAt=s.clock+C.radio.cooldown;this.reinforce(e,m);m.action=undefined;s.newBosses.interrupt(e,s.clock+1200)},C.radio.damageInterrupt);
      return true;
    }
    if(this.close(e))return true;
    if(e.boss===4&&!this.busy(e)&&distance<260&&s.clock>=m.slamAt){
      m.action='slam';m.until=s.clock+C.butcher.warning;m.slamAt=s.clock+C.butcher.slamCooldown;
      s.newBosses.interrupt(e,m.until+C.butcher.recovery);
      return true;
    }
    if(e.boss===4&&distance>230&&distance<C.butcher.macheteRange&&s.clock>=m.macheteAt&&
       s.lineClear(e.sprite.x,e.sprite.y,s.player.x,s.player.y)){
      m.machetes=this.phaseTwo(e)?2:1;m.warning=950;
      m.action='machete';m.until=s.clock+m.warning;m.macheteAt=s.clock+C.butcher.macheteCooldown*(m.machetes===2?C.butcher.phaseCooldown:1);
      const velocity=s.player.body!.velocity;
      const target={x:s.player.x+velocity.x*.2,y:s.player.y+velocity.y*.2};
      m.meleeTarget=s.lineClear(e.sprite.x,e.sprite.y,target.x,target.y)?target:{x:s.player.x,y:s.player.y};
      s.newBosses.interrupt(e,m.until+C.butcher.recovery);
      return true;
    }
    return false;
  }

  private startCall(e:Foe,m:Mind,complete:()=>void,interrupt=Infinity) {
    m.action='radio';e.sprite.setVelocity(0).play(bossAnimation(e.boss,'reload'),true);
    this.s.newBosses.interrupt(e,this.s.clock+5000);
    this.s.radio.requestBossCall(e,complete,interrupt);
  }

  private reinforce(e:Foe,m:Mind) {
    const s=this.s,limit=s.rush!.encounter.length===2?C.radio.doubleCount:C.radio.count;
    const available=Math.min(limit,C.radio.maxAlive-s.foes.filter(f=>f.rushSupport===e).length);
    const points=s.radio.reinforcementPoints(available);
    const medic=!m.medicUsed&&Math.random()<C.radio.medicChance;
    for(const [i,p] of points.entries()){
      const f=s.spawn(medic&&i===0?14:i%2?2:1,-1,[p.x,p.y]);
      f.rushSupport=e;f.awake=true;
      if(f.tier===14){m.medicUsed=true;this.medics.set(f,{leader:e,until:s.clock+C.medic.duration,remaining:C.medic.budget})}
    }
  }

  medicHealing(e:Foe) {
    const state=this.medics.get(e);
    if(!state||this.s.clock>=state.until||state.leader.hp<=0||state.remaining<=0)return;
    const target=state.leader;
    const amount=Math.min(15,state.remaining,target.max-target.hp);
    if(amount<=0||Math.hypot(e.sprite.x-target.sprite.x,e.sprite.y-target.sprite.y)>=350||
      !this.s.lineClear(e.sprite.x,e.sprite.y,target.sprite.x,target.sprite.y))return;
    state.remaining-=amount;
    return {target,amount};
  }

  startSuppression(e:Foe) {
    const s=this.s,m=this.state(e);
    m.action='suppression';m.until=s.clock+C.suppression.duration;m.next=s.clock;
    m.angle=Math.atan2(s.player.y-e.sprite.y,s.player.x-e.sprite.x);m.updated=s.clock;
  }

  private suppress(e:Foe,m:Mind) {
    const s=this.s,g=s.survival.mind(e).weapon!,delta=Math.min(80,s.clock-m.updated)/1000;
    m.updated=s.clock;
    m.angle=turnToward(m.angle,Math.atan2(s.player.y-e.sprite.y,s.player.x-e.sprite.x),C.suppression.turnRate*delta);
    e.sprite.setVelocity(0).play(bossAnimation(e.boss,'shoot'),true);
    const target={x:e.sprite.x+Math.cos(m.angle)*760,y:e.sprite.y+Math.sin(m.angle)*760};
    this.graphics.lineStyle(2,0xffc56d,.65).lineBetween(e.sprite.x,e.sprite.y,target.x,target.y);
    if(s.clock>=m.until||g.ammo<=0){m.action=undefined;s.newBosses.interrupt(e,s.clock+C.suppression.recovery);return true}
    if(s.clock>=m.next){
      m.next=s.clock+C.suppression.interval;
      const near={x:e.sprite.x+Math.cos(m.angle)*30,y:e.sprite.y+Math.sin(m.angle)*30};
      if(s.lineClear(e.sprite.x,e.sprite.y,near.x,near.y)){
        s.shoot(e.sprite.x,e.sprite.y,m.angle,12*s.rush!.tuning(1).damage,true,760,.035,1,false,7,1);
        g.ammo--;
      }
    }
    return true;
  }

  private bombard(e:Foe,m:Mind) {
    const s=this.s,c=C.bombardment;
    e.sprite.setVelocity(0);
    if(s.clock<m.next)return true;
    if(m.wave>=c.waves){m.action=undefined;s.newBosses.interrupt(e,s.clock+1800);return true}
    const points=s.radio.reinforcementPoints(100,0);
    const safePoints=points.filter(p=>{
      if(Math.hypot(p.x-s.player.x,p.y-s.player.y)>320||
        s.chaos.fires.some(f=>Math.hypot(f.x-p.x,f.y-p.y)<(f.radius??90)+c.safeRadius))return false;
      const path=s.navigation.routes.route(s.player.body!.center,p);
      return path.length>0&&path.length*48<=360;
    });
    m.safe=safePoints.find(p=>Math.hypot(p.x-s.player.x,p.y-s.player.y)>220)??safePoints[0];
    if(!m.safe&&s.walkablePoint(s.player.x,s.player.y)&&!s.chaos.fires.some(f=>Math.hypot(f.x-s.player.x,f.y-s.player.y)<(f.radius??90)+c.safeRadius))m.safe={x:s.player.x,y:s.player.y};
    if(!m.safe){m.next=s.clock+500;return true}
    const targets=bombardmentTargets([{x:s.player.x,y:s.player.y},...points],m.safe,m.wave);
    if(!targets.length){m.next=s.clock+500;return true}
    for(const [i,point] of targets.entries()){
      const marker=s.add.graphics().setDepth(27);
      marker.lineStyle(3,0xffb453,.95).strokeCircle(point.x,point.y,c.radius)
        .lineBetween(point.x-12,point.y,point.x+12,point.y).lineBetween(point.x,point.y-12,point.x,point.y+12);
      const image=s.add.image(point.x,point.y-180,'rush-attack-polish','frag-flight-0').setDisplaySize(24,24).setDepth(29);
      this.impacts.push({...point,owner:e,at:s.clock+c.warning+i*c.stagger,marker,image});
    }
    m.wave++;m.next=s.clock+c.warning+(targets.length-1)*c.stagger+c.interval;
    e.label.setText('BOMBARDEO · OLEADA '+m.wave+'/'+c.waves);
    return true;
  }

  private machete(e:Foe,m:Mind) {
    const s=this.s,target=m.meleeTarget!;
    e.sprite.setVelocity(0).setAlpha(0);
    const index=Math.min(5,Math.floor(Math.max(0,1-(m.until-s.clock)/(m.warning??950))*6));
    m.pose??=s.add.image(e.sprite.x,e.sprite.body!.bottom,'rush-attack-polish','machete-pose-0').setOrigin(.5,1).setScale(.82);
    m.pose.setPosition(e.sprite.x,e.sprite.body!.bottom).setDepth(e.sprite.depth+.05)
      .setFlipX(target.x<e.sprite.x).setFrame('machete-pose-'+index);
    this.graphics.lineStyle(2,0xffcc94,.85).lineBetween(e.sprite.x,e.sprite.y,target.x,target.y);
    e.label.setText('EL CARNICERO · MACHETE');
    if(s.clock>=m.until){
      m.pose.destroy();m.pose=undefined;e.sprite.setAlpha(1);m.action=undefined;
      s.chaos.bossThrow(4,4,e.sprite,target,32*s.rush!.tuning(4).damage);
      if((m.machetes??1)>1){m.machetes!--;m.action='machete';m.warning=C.butcher.followupWarning;m.until=s.clock+m.warning;m.meleeTarget={x:s.player.x,y:s.player.y};}
      else s.newBosses.interrupt(e,s.clock+C.butcher.recovery*(this.phaseTwo(e)?C.butcher.phaseRecovery:1));
    }
    return true;
  }

  private groundSlam(e:Foe,m:Mind) {
    const s=this.s,radius=C.butcher.slamRadius;
    e.sprite.setVelocity(0).play(bossAnimation(e.boss,'shoot'),true);
    this.graphics.lineStyle(4,0xff9d69,.9).strokeCircle(e.sprite.x,e.sprite.y,radius);
    e.label.setText('EL CARNICERO · ¡IMPACTO!');
    if(s.clock>=m.until){
      m.action=undefined;
      const ring=s.add.circle(e.sprite.x,e.sprite.y,radius,0xff8055,.15).setStrokeStyle(3,0xffbb91).setDepth(18);
      s.tweens.add({targets:ring,alpha:0,duration:350,onComplete:()=>ring.destroy()});
      s.chaos.effect('barrel-blast',e.sprite.x,e.sprite.y,90);
      s.cameras.main.shake(120,.003);
      if(Math.hypot(s.player.x-e.sprite.x,s.player.y-e.sprite.y)<radius&&
        s.lineClear(e.sprite.x,e.sprite.y,s.player.x,s.player.y)){
        this.hitPlayer(e,30*s.rush!.tuning(4).damage,C.butcher.stunMs);
      }
    }
    return true;
  }

  flash(x:number,y:number) {
    const s=this.s;
    if(s.clock<this.blindAt||Math.hypot(s.player.x-x,s.player.y-y)>200||!s.lineClear(x,y,s.player.x,s.player.y))return;
    if(s.dash.active(s.clock))return;
    this.blindUntil=s.clock+C.sniper.blindMs;this.blindAt=this.blindUntil+C.sniper.blindImmunity;
  }

  remove(e:Foe) {
    const m=this.minds.get(e);m?.pose?.destroy();this.s.radio.cancelBossCall(e);this.minds.delete(e);this.medics.delete(e);
    for(const impact of [...this.impacts])if(impact.owner===e)this.cancelImpact(impact);
    for(const support of [...this.s.foes])if(support.rushSupport===e){
      this.s.radio.retire(support);this.s.survival.died(support,false);support.collider?.destroy();
      support.sprite.destroy();support.label.destroy();this.medics.delete(support);
      this.s.foes=this.s.foes.filter(f=>f!==support);
    }
    if(e.boss===3)this.s.rush?.power?.update(false);
  }

  stop() {
    if(this.stopped)return;
    this.stopped=true;
    this.s.events.off('postupdate',this.visibility,this);
    for(const e of this.s.foes)if(e.boss===3){e.sprite.setAlpha(1);e.label.setAlpha(1)}
    for(const e of [...this.minds.keys()])this.remove(e);
    for(const impact of [...this.impacts])this.cancelImpact(impact);
    this.blindUntil=this.stunUntil=this.knockUntil=0;
    this.blind.destroy();this.graphics.destroy();
  }
}
