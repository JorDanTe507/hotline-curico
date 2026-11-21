import type {Action,MovementIntent} from '../network/protocol';
import {ParticipantControl} from '../systems/ParticipantControl';
import {ContinuousRescue,RESCUE_MS} from '../systems/ContinuousRescue';
import {maxHealth} from '../systems/HealthCapacity';
import {ContinuousCoopPressure} from '../systems/ContinuousCoopPressure';
import {ContinuousCoopCameras} from './ContinuousCoopCameras';
import {SessionWallet} from '../economy/SessionWallet';
import {RunEconomy} from '../systems/PermanentProgress';
import {developerSession} from '../systems/DeveloperSession';
import type {DamageBudget} from '../chaos/DamageBudget';
import Phaser from 'phaser';import type {Game,Foe,Shot} from '../scenes/Game';import {characterById} from '../characters/catalog';import {PlayerAppearance} from '../characters/PlayerAppearance';import {newRun} from '../systems/run';import {RunPerks} from '../systems/RunPerks';import {Progression} from '../systems/Progression';import {createAbility} from '../characters/abilities';import {Dash} from '../systems/Dash';import {WeaponCombat} from '../weapons/WeaponCombat';import {SurvivalSystem} from '../systems/SurvivalSystem';import {Burning} from '../weapons/Burning';import {ChaosSystem} from '../chaos/ChaosSystem';import {LevelUpView} from '../ui/LevelUpView';import {UltimateView} from '../ui/UltimateView';import {CriticalHealth} from '../systems/CriticalHealth';import {WeaponCadence} from '../weapons/WeaponCadence';import {MinigunTrigger} from '../weapons/Minigun';import {permanentProgress} from '../systems/PermanentProgress';import {Rogue19} from './Rogue19';import {Goals19} from './Goals19';import {coopInput} from './CoopInput';import {inputHub,type InputHub} from '../input/InputHub';import {CoopPresentation} from './CoopPresentation';import {events19} from './Events';import {gun} from '../weapons/arsenal';import {magazineCapacity} from '../systems/PlayerModifiers';
interface Incapacitation {until:number;progress:number;dead:boolean;baseScaleX:number;baseScaleY:number}
/** A player-owned context delegates only shared world services to the real scene.
 * Existing combat methods run with this context, preserving one simulation and one enemy list.
 */
export class CoopSession {
 readonly pressure?:ContinuousCoopPressure;
 readonly views?:ContinuousCoopCameras;
 partnerControl?:ParticipantControl;
 sessionEnd?:'voluntary'|'technical'|'match-ended';
 private padSeen=false;
 private partnerRemoved=false;
 private rescue=[new ContinuousRescue(),new ContinuousRescue()];
 readonly host:Game;private second:Game;private inputs:InputHub[];private states:Incapacitation[]=[];private stopped=false;finishing=false;targetId=0;interactionId=0;reviveNotice='';private originalPlayer?:Game['player'];private focus=0;private activeCount=2;private separation=780;private cameraBlend=0;private cameraCenter?:{x:number;y:number};private positions:{x:number;y:number}[]=[];
 constructor(s:Game){this.host=s;const state:Record<PropertyKey,any>={playerId:2,character:characterById(s.coopPartner&&characterById(s.coopPartner).id!==s.character.id?characterById(s.coopPartner).id:s.character.id==='cervela'?'nicolas':'cervela'),run:newRun(),guns:[],active:0,nextPunch:0,nextFire:0,reloadAt:0,reloadStartedAt:0,reloadReadyUntil:0,reloadSpeed:1,hurtAt:0,blockPointerUntilRelease:true,minigun:new MinigunTrigger(),minigunFiringUntil:0,motor:undefined,cadence:new WeaponCadence(),dash:new Dash(),trailAt:0,adrenalineMessage:'',adrenalineNoticeUntil:0};state.run.roguelite=s.run.roguelite;state.economy=new RunEconomy(permanentProgress(),state.character.id);let actor:Game;actor=new Proxy(s,{get(target,key){if(key in state)return state[key];const value=Reflect.get(target,key);return typeof value==='function'?value.bind(actor):value},set(target,key,value){if(key in state)state[key]=value;else Reflect.set(target,key,value);return true}});this.second=actor;const wallet=new SessionWallet(permanentProgress(),[s.character.id,state.character.id]);s.economy.wallet=state.economy.wallet=wallet;state.economy.defer=s.economy.defer;state.run.stats=developerSession.active&&developerSession.baseStats?state.character.stats():permanentProgress().apply(state.character.id,state.character.stats());state.run.health=state.run.stats.maxHealth;state.run.seed=s.run.seed;state.player=s.physics.add.sprite(s.player.x+65,s.player.y,state.character.normal.idle[0]).setDisplaySize(31,55).setDepth(10);state.player.body.setSize(38,46).setOffset(15,72);if(state.character.id==='jordan'){state.player.setDisplaySize(44,48);state.player.body.setSize(38,46).setOffset(29,64)}s.physics.add.collider(state.player,s.walls,(_player,obstacle)=>s.uroboros?.staticImpact(actor,obstacle));state.keys=s.keys;state.aim=s.add.graphics().setDepth(12);state.equipped=s.add.image(state.player.x,state.player.y,'weapon-0').setOrigin(.15,.5).setDepth(13).setVisible(false);state.perks=new RunPerks(state.run,state.character.id);state.progression=new Progression(state.run);state.weaponCombat=new WeaponCombat(actor);state.survival=new SurvivalSystem(actor);state.survival.shareEnemyState(s.survival);state.burning=new Burning(actor);state.burning.shareTargets(s.burning);state.appearance=new PlayerAppearance(actor);state.ultimate=createAbility(state.character,()=>state.run.stats,()=>state.run);state.ultimate.playerId=2;state.rogue=new Rogue19(actor);state.goals=new Goals19(actor);state.chaos=new ChaosSystem(actor,s.chaos.barrels);state.chaos.shareRecoverableKnives(s.chaos);state.combatHud={update:()=>{},setMobile:()=>{}};state.critical=new CriticalHealth(actor);state.ultimateView=new UltimateView(actor);state.presentation=new CoopPresentation(actor);state.levelUp=new LevelUpView(actor);s.presentation.cancel();s.presentation=new CoopPresentation(s) as unknown as Game['presentation'];this.inputs=[coopInput(s,1),coopInput(s,2)];for(const a of [s,actor])this.states.push({until:0,progress:0,dead:false,baseScaleX:a.player.scaleX,baseScaleY:a.player.scaleY});this.positions=[s,actor].map(a=>({x:a.player.x,y:a.player.y}));s.cameras.main.stopFollow();if(s.continuous){this.partnerControl=new ParticipantControl('local-pad');this.padSeen=!!inputHub(s.game).pad;
 const disconnected=(event:GamepadEvent)=>{
  const current=inputHub(s.game).pad;
  if(current?.index===event.gamepad.index){this.padSeen=true;this.observePartnerPad(false,performance.now())}
 };
 const paired=()=>{this.padSeen=true;this.observePartnerPad(true,performance.now())};
 window.addEventListener('gamepadconnected',paired);
 window.addEventListener('gamepaddisconnected',disconnected);
 s.events.once('shutdown',()=>{window.removeEventListener('gamepadconnected',paired);window.removeEventListener('gamepaddisconnected',disconnected)});this.views=new ContinuousCoopCameras(s);this.pressure=new ContinuousCoopPressure(s)}const pre=(_t:number,delta:number)=>{this.pollPartnerControl();if(!this.controlBlocked(2)&&!this.incapacitated(2))actor.preDash(_t,delta)};s.events.on('preupdate',pre);s.events.once('shutdown',()=>s.events.off('preupdate',pre));s.scene.launch('CoopHud',{session:this});events19.emit({type:'coop'});this.hideSolo()}
 get remoteChoice(){return this.focus}
 bindRemote(intent:MovementIntent){
  if(this.partnerControl?.source!=='local-pad'||this.partnerControl.status!=='controlled'||this.incapacitated(2))throw Error('Participación no disponible');
  this.partnerControl=new ParticipantControl('remote-client');
  const local=this.inputs[1];
  this.inputs[1]=new Proxy(local,{get(target,key){
   if(key==='movement')return ()=>intent.read(performance.now());
   if(key==='take')return (action:Action)=>intent.take(action);
   if(key==='just')return (_:unknown,action:Action)=>intent.take(action);
   if(key==='down')return (action:Action)=>intent.down(action);
   if(key==='holding')return (_:unknown,action:Action)=>intent.down(action);
   if(key==='firing'||key==='manualFiring')return ()=>intent.down('fire');
   if(key==='angle')return ()=>intent.angle;
   return Reflect.get(target,key);
  }});
  this.observeControl('remote-client',false,performance.now());
 }
 controlBlocked(id:number){return id===2&&!!this.partnerControl&&this.partnerControl.status!=='controlled'}
 private pollPartnerControl(){
  const control=this.partnerControl;
  if(!control||this.stopped||this.finishing||this.host.ended)return;
  if(control.source==='remote-client'){
   this.observeControl('remote-client',control.status==='controlled',performance.now());return;
  }
  const connected=this.connected;
  // A development session can be created before a local pad has been paired.
  if(connected)this.padSeen=true;
  if(!this.padSeen)return;
  this.observePartnerPad(connected,performance.now());
 }
 observePartnerPad(connected:boolean,now:number){this.observeControl('local-pad',connected,now)}
 observeControl(source:ParticipantControl['source'],connected:boolean,now:number){
  const control=this.partnerControl,s=this.host,a=this.second;
  if(!control||control.source!==source||this.stopped||this.finishing||s.ended||this.partnerRemoved)return;
  const state=this.state(2);
  // Honour a bleed-out already due on the simulation timeline before removing its actor.
  if(state.until&&s.clock>=state.until)this.advanceRescue(2);
  const before=control.status;
  control.observe(source,connected,now);
  if(before===control.status)return;
  if(control.status==='grace'){
   a.player.setVelocity(0);(a.player.body as Phaser.Physics.Arcade.Body).moves=false;a.stopMinigun();a.chaos.cancel();
   a.survival.cancelPlayerExecution();
   if(a.levelUp.active)a.levelUp.close();
   if(s.fortune.pending?.actor===a)s.fortune.cancelConfirmation();
  }else if(control.status==='controlled'){
   (a.player.body as Phaser.Physics.Arcade.Body).moves=true;
  }else if(control.status==='grace-expired')this.removePartner();
 }
 remoteLeft(){
  const control=this.partnerControl;
  if(control?.source!=='remote-client'||this.partnerRemoved||this.stopped||this.state(2).dead)return;
  control.finish('voluntary');this.removePartner();
 }
 private removePartner(){
   const s=this.host,a=this.second,state=this.state(2);
   this.partnerRemoved=true;
   state.until=state.progress=0;
   a.run.pendingLevels=0;a.reloadAt=0;a.presentation.cancel();a.ultimate.stop();
   if(s.temporal.owner===a)s.temporal.end();
   a.player.disableBody(true,true);a.equipped.setVisible(false);a.aim.clear();
   s.continuous!.loseParticipant();
   // Already posted personal balances stay in their original accounts.
   s.economy.wallet=a.economy.wallet=new SessionWallet(permanentProgress(),[s.character.id]);
   if(!this.livingActors().length){this.finishing=true;s.finish()}
 }
 sectorPlayers(){
  const players=[this.originalPlayer??this.host.player,this.second.player];
  return players.filter((_,index)=>!this.states[index].dead&&!(index===1&&this.partnerRemoved));
 }
 actor(id:number){return id===2?this.second:this.host}
 input(id:number){return this.inputs[(this.interactionId||id)===2?1:0]}
 get connected(){return this.partnerControl?.source==='remote-client'?this.partnerControl.status==='controlled':!!inputHub(this.host.game).pad}
 state(id:number){return this.states[id-1]}
 incapacitated(id:number){const state=this.states[id-1];return !!state&&(state.dead||state.until>0||(id===2&&this.partnerRemoved))}
 worldAnchor(){const actors=this.livingActors();if(!actors.length)return {x:this.host.player.x,y:this.host.player.y};return {x:actors.reduce((n,a)=>n+a.player.x,0)/Math.max(1,actors.length),y:actors.reduce((n,a)=>n+a.player.y,0)/Math.max(1,actors.length)}}
 withWorld<T>(fn:()=>T){const p=this.host.player;try{this.host.player=this.livingActors()[0]?.player??p;return fn()}finally{this.host.player=p}}
 livingActors(){return [this.host,this.second].filter(a=>!this.incapacitated(a.playerId)&&a.run.health>0)}
 roundStarted(){this.second.run.round=this.host.run.round;this.second.perks.beginRound()}
 completedMatch(){if(this.host.economy.completedRounds>=1&&[this.host.character.id,this.second.character.id].sort().join(':')==='cervela:jordan')events19.emit({type:'jordan-known',character:'jordan',method:'cervela',value:this.host.economy.completedRounds})}
 roundComplete(){this.second.rogue.roundComplete();this.second.ultimate.roundComplete()}
 initialRolls(done:()=>void){const s=this.host;s.roulette.start(()=>{s.guns=[gun(s.roulette.winner,magazineCapacity(s.roulette.winner,s.run.stats))];s.active=0;s.roulette.start(()=>{this.second.guns=[gun(s.roulette.winner,magazineCapacity(s.roulette.winner,this.second.run.stats))];this.second.active=0;done()});(s.roulette as any).title?.setText('J2 · OBTENIENDO ARMA...')});(s.roulette as any).title?.setText('J1 · OBTENIENDO ARMA...')}
 executingEnemy(e:Foe){return this.host.survival.executingEnemy(e)||this.second.survival.executingEnemy(e)}
 modal(delta:number){if(this.stopped)return false;const s=this.host,hub=inputHub(s.game);if(s.paused||s.roulette.active||s.levelUp.active||this.second.levelUp.active)s.cameras.main.setZoom(1);if(hub.take('pause')&&!s.ended&&!s.levelUp.active&&!this.second.levelUp.active){if(s.tio.dialogueActive)s.tio.hide();else s.pause();}if(this.second.levelUp.active){if(this.partnerControl?.source==='remote-client'){
 const view=this.second.levelUp,remote=this.inputs[1];
 if(remote.take('switch'))this.focus=(this.focus+1)%view.options.length;
 this.focus=Math.min(this.focus,view.options.length-1);view.focus(this.focus);
 if(remote.take('interact')){view.choose(this.focus);this.focus=0}
 return true}const count=this.second.levelUp.rerolls>0?4:3;this.focus=Math.min(this.focus,count-1);if(hub.take('right')||hub.take('down'))this.focus=(this.focus+1)%count;if(hub.take('left')||hub.take('up'))this.focus=(this.focus+count-1)%count;this.second.levelUp.focus(this.focus);const panel=(this.second.levelUp as any).panel as Phaser.GameObjects.Container|undefined;panel?.list.filter(o=>o instanceof Phaser.GameObjects.Rectangle&&o.input?.enabled).forEach((o,i)=>(o as Phaser.GameObjects.Rectangle).setStrokeStyle(i===this.focus?5:2,i===this.focus?0x8dffff:0x713c8c));const reroll=panel?.list.find(o=>o instanceof Phaser.GameObjects.Text&&o.text.startsWith('CAMBIAR CARTAS')) as Phaser.GameObjects.Text|undefined;reroll?.setColor(this.focus===3?'#ffffff':this.second.levelUp.rerolls?'#6be9ef':'#796b85');if(hub.take('interact')){if(this.focus===3){this.second.levelUp.reroll();this.focus=0}else this.second.levelUp.choose(this.focus)}return true}return false}
 secondStep(delta:number,elapsed:number,dt:number){if(this.incapacitated(1)){this.host.survival.update(dt);this.host.burning.update()}const a=this.second;a.run.elapsed+=elapsed/1000;if(this.partnerControl?.status==='grace'&&!this.incapacitated(2)){a.rogue.tick();a.run.health=a.ultimate.tick(a.clock,a.run.health,a.guns);a.rogue.passive(elapsed)}if(this.incapacitated(2)||this.controlBlocked(2)){a.survival.update(dt);a.burning.update();a.chaos.update(elapsed,Math.atan2(inputHub(this.host.game).aim.y,inputHub(this.host.game).aim.x));return true}if(a.updatePlayer(delta,elapsed,dt)===false)return false;a.chaos.update(elapsed,Math.atan2(inputHub(this.host.game).aim.y,inputHub(this.host.game).aim.x));a.goals.update();a.ultimateView.update(Math.atan2(inputHub(this.host.game).aim.y,inputHub(this.host.game).aim.x));a.critical.update(a.run.health,a.clock,false);return true}
 interrupted(e:Foe){return this.host.clock<(e.interruptUntil??0)}
 applyEnemyMovement(){for(const e of this.host.foes)if(e.hp>0&&(e.electricUntil??0)>this.host.clock){const v=e.sprite.body!.velocity,factor=e.boss>=0?.85:.55;e.sprite.setVelocity(v.x*factor,v.y*factor)}}
 target(e:Foe){
  this.clearTarget();
  const score=(p:Game)=>Math.hypot(p.player.x-e.sprite.x,p.player.y-e.sprite.y)+(this.host.lineClear(e.sprite.x,e.sprite.y,p.player.x,p.player.y)?0:300);
  const actor=this.pressure?this.pressure.target(e):this.livingActors().sort((a,b)=>score(a)-score(b))[0];
  if(actor){
   this.targetId=actor.playerId;
   this.originalPlayer=this.host.player;
   this.host.player=actor.player;
  }
 }
 clearTarget(){if(this.originalPlayer)this.host.player=this.originalPlayer;this.originalPlayer=undefined;this.targetId=0}
 enemyShot(shot:Shot){const a=this.livingActors().find(a=>Math.hypot(a.player.x-shot.sprite.x,a.player.y-shot.sprite.y)<23);if(!a)return false;if(!shot.explosive)a.damage(shot.damage,shot.weaponId===12);this.host.impact(shot);return true}
 damageOthers(owner:number,x:number,y:number,radius:number,damage:number,budget?:DamageBudget){const previous=this.targetId;this.targetId=0;try{for(const a of this.livingActors())if(a.playerId!==owner&&Math.hypot(a.player.x-x,a.player.y-y)<radius&&this.host.lineClear(x,y,a.player.x,a.player.y))a.damage(budget?.claimPlayer(damage,a.playerId)??damage,true)}finally{this.targetId=previous}}
 withInteraction<T>(actor:Game,fn:()=>T){const s=this.host,keys=['player','run','character','keys','ultimate','perks'] as const,saved=keys.map(k=>s[k]);this.interactionId=actor.playerId;try{for(const k of keys)(s as any)[k]=actor[k];return fn()}finally{keys.forEach((k,i)=>(s as any)[k]=saved[i]);this.interactionId=0}}
 interact(actor:Game){return this.withInteraction(actor,()=>this.host.tio.interact()||this.host.fortune.interact())}
 fortuneUpdate(delta:number){this.host.fortune.update(delta)}
 down(id:number){const a=this.actor(id),state=this.state(id);if(this.finishing||this.incapacitated(id))return;a.run.health=0;a.reloadAt=0;a.stopMinigun();a.ultimate.stop();if(this.host.temporal.owner===a)this.host.temporal.end();a.run.health=0;a.presentation.cancel();a.critical.stop();a.chaos.cancel();a.survival.cancelPlayerExecution();a.player.setVelocity(0);a.equipped.setVisible(false);a.appearance.death();state.until=this.views?this.rescue[id-1].deadline(this.host.clock):this.host.clock+120000;state.progress=0;if(!this.livingActors().length){this.finishing=true;this.host.finish()}}
 canRescue(id:number){
  if(!this.views||this.controlBlocked(id)||this.incapacitated(id))return false;
  const other=id===1?2:1,a=this.actor(id).player,b=this.actor(other).player;
  return !!this.state(other).until&&Math.hypot(a.x-b.x,a.y-b.y)<85&&this.host.lineClear(a.x,a.y,b.x,b.y);
 }
 private advanceRescue(id:number){
  const actor=this.actor(id),other=id===1?2:1,helper=this.actor(other),state=this.state(id),now=this.host.clock;
  const near=this.canRescue(other),held=near&&this.inputs[other-1].holding(helper.keys.E,'interact');
  const event=this.rescue[id-1].advance(state,now,held);
  if(event==='expired'){
   if(id===2)this.partnerControl?.finish('permanent-death');
   this.host.continuous!.loseParticipant();
   const {x,y}=actor.player,r=actor.run;
   for(const weapon of actor.guns.splice(0))actor.addDrop(x,y,'gun',weapon.id,weapon);
   for(const [kind,count] of [['med',r.medkits],['adrenaline',r.adrenaline]] as const)
    for(let i=0;i<count;i++)actor.addDrop(x,y,kind,0);
   r.medkits=r.adrenaline=0;
   if(r.armor>0)actor.addDrop(x,y,'armor',r.armor);
   r.armor=0;
   const inventory=actor.chaos.inventory;
   inventory.counts.forEach((_,type)=>{while(inventory.spend(type))actor.addDrop(x,y,'throwable',type)});
   actor.player.disableBody(true,true);actor.aim.clear();actor.equipped.setVisible(false);
   return;
  }
  if(event==='revived'){
   actor.run.health=maxHealth(actor.run)*.3;
   actor.rogue.invulnerableUntil=Math.max(actor.rogue.invulnerableUntil,now+1500);
   actor.player.setScale(state.baseScaleX,state.baseScaleY).setAlpha(1);
   actor.appearance.show('idle');return;
  }
  const dx=actor.player.x-helper.player.x,dy=actor.player.y-helper.player.y;
  const offscreen=!this.views!.cameraFor(other).worldView.contains(actor.player.x,actor.player.y);
  const arrow=['→','↘','↓','↙','←','↖','↑','↗'][(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];
  const guide=offscreen?arrow+' '+Math.round(Math.hypot(dx,dy))+' px':near?'Mantén '+(other===1?'E':'×'):'Acércate';
  this.reviveNotice='RESCATAR J'+id+' · '+Math.ceil((state.until-now)/1000)+' s\n'+guide+' · '+Math.floor(state.progress/RESCUE_MS*100)+'%';
 }
 afterFrame(elapsed:number){this.clearTarget();const s=this.host;this.reviveNotice='';for(const id of [1,2]){const a=this.actor(id),state=this.state(id);if(this.views&&state.until)this.advanceRescue(id);else if(state.until){if(s.clock>=state.until){state.dead=true;state.until=0;a.player.setAlpha(.45);a.player.setVelocity(0)}else{a.player.setScale(state.baseScaleX*(1+.025*Math.sin(s.clock/600)),state.baseScaleY*(1+.025*Math.sin(s.clock/600)));const other=this.actor(id===1?2:1),held=!this.incapacitated(other.playerId)&&Math.hypot(a.player.x-other.player.x,a.player.y-other.player.y)<85&&s.lineClear(a.player.x,a.player.y,other.player.x,other.player.y);state.progress=held?state.progress+elapsed:0;if(held)this.reviveNotice=`REANIMANDO J${id} · ${Math.floor(state.progress/3500*100)}%`;if(state.progress>=3500){state.until=0;state.progress=0;a.run.health=20;a.player.setScale(state.baseScaleX,state.baseScaleY).setAlpha(1);a.appearance.show('idle');a.hurtAt=s.clock+1000}}}if(!state.until&&!state.dead&&a.run.health>0)a.player.setDepth(10+a.player.y/10000)}
 if(this.views){
  const [first,second]=this.sectorPlayers();
  if(first)this.views.update(first,this.partnerControl?.source==='remote-client'?first:second??first,elapsed);
  this.fortuneUpdate(elapsed);this.hideSolo();return;
 }
 const list=this.livingActors(),first=list[0],second=list[1],changed=list.length!==this.activeCount;if(changed){this.cameraBlend=750;if(second)this.separation=Math.max(780,Math.hypot(second.player.x-first.player.x,second.player.y-first.player.y));this.activeCount=list.length}this.separation=Math.max(780,this.separation-Math.max(0,elapsed)*.18);let center=first?{x:first.player.x,y:first.player.y}:this.cameraCenter??{x:s.player.x,y:s.player.y},zoom=1;if(first&&second){const dx=second.player.x-first.player.x,dy=second.player.y-first.player.y,d=Math.hypot(dx,dy);const priorDistance=Math.hypot(this.positions[1].x-this.positions[0].x,this.positions[1].y-this.positions[0].y);if(!s.continuous&&d>this.separation&&!(priorDistance>this.separation&&d<priorDistance)){const x=first.player.x+dx/d*this.separation,y=first.player.y+dy/d*this.separation;if(s.walkablePoint(x,y)&&s.lineClear(second.player.x,second.player.y,x,y))second.player.body!.reset(x,y);else for(const a of [first,second]){const old=this.positions[a.playerId-1];a.player.body!.reset(old.x,old.y);a.player.setVelocity(0)}}center={x:(first.player.x+second.player.x)/2,y:(first.player.y+second.player.y)/2};zoom=Math.max(.75,Math.min(1,900/(Math.min(d,780)+400)))}const previous=this.cameraCenter??center,factor=this.cameraBlend>0?Math.min(1-Math.exp(-Math.max(0,elapsed)/180),Math.max(0,elapsed)*.7/Math.max(1,Math.hypot(center.x-previous.x,center.y-previous.y))):1;this.cameraCenter={x:previous.x+(center.x-previous.x)*factor,y:previous.y+(center.y-previous.y)*factor};s.cameras.main.setZoom(s.cameras.main.zoom+(zoom-s.cameras.main.zoom)*factor).centerOn(this.cameraCenter.x,this.cameraCenter.y);if(this.cameraBlend>0)this.cameraBlend=Math.max(Math.hypot(center.x-this.cameraCenter.x,center.y-this.cameraCenter.y)>20?32:0,this.cameraBlend-Math.max(0,elapsed));this.positions=[s,this.second].map(a=>({x:a.player.x,y:a.player.y}));this.fortuneUpdate(elapsed);this.hideSolo()}
 private hideSolo(){const s=this.host;s.combatHud.setMobile(true);for(const a of [s,this.second]){a.ultimateView.setMobile(true);for(const key of ['warning','border','dialogue','hudPortrait'])((a.critical as any)[key] as Phaser.GameObjects.Image)?.setVisible(false);((a.chaos as any).hud as Phaser.GameObjects.Container).setVisible(false)}for(const value of Object.values(s.combatHud))if(value&&typeof (value as any).setVisible==='function')(value as Phaser.GameObjects.Image).setVisible(false);s.banner.setVisible(false);s.hint.setVisible(false);for(const o of s.children.list)if(o instanceof Phaser.GameObjects.Text&&o.text.startsWith('PRUEBAS ·'))o.setVisible(false)}
 stop(){if(this.stopped)return;this.stopped=true;if(this.partnerControl)this.sessionEnd??=this.finishing?'match-ended':'technical';this.partnerControl?.finish('session-closed');this.views?.stop();this.clearTarget();this.host.scene.stop('CoopHud');const a=this.second;a.stopMinigun();a.chaos.stop();a.burning.stop();a.survival.stop();a.critical.stop();a.ultimateView.stop();a.presentation.cancel();a.levelUp.close(false)}
}
