import {CITY} from '../atmosphere/CityState';
import {FORTUNE} from '../config/fortune';
import {bossIndex} from '../bosses/config';
import {bossName} from '../bosses/expansion';
import {RequiemRoundChallenge} from './RequiemRoundChallenge';
import {developerSession} from './DeveloperSession';
import type {ShotCredit} from './Ultimate';
import {achievements} from './Achievements';
import {armorDrop} from './Armor';
import type {Game,Foe} from '../scenes/Game';
import {RoundState,clockText} from './RoundState';
import {MAX_ALIVE_ENEMIES,SURVIVAL_SPAWN_INTERVAL} from '../config/dynamicRounds';
import {enemyTier,SPECIAL_ENCOUNTER} from '../enemies/config';
import {bossRewards} from './Loot';
export class RoundDirector {
 readonly requiem=new RequiemRoundChallenge(()=>developerSession.active);private lastStarted=0;private ordered=true;
 private extras:{point:[number,number];sector:string;due:number;expires:number}[]=[];private special=false;private queued=false;state=new RoundState();private nextSpawn=0;private rewarded=new WeakSet<Foe>();private announcementUntil=0;
 constructor(private scene:Game,private random=Math.random){}
 startNext(){const s=this.scene;if(s.ended||s.roulette.active)return;if(s.levelUp.active||s.run.pendingLevels){this.queued=true;return}this.queued=false;this.ordered=this.ordered&&s.run.round===this.lastStarted&&(this.lastStarted===0||this.state.phase==='rest');this.extras=[];s.retireEnemies();s.mapVisuals.beginRound();s.presentation.complete();s.fortune.leaveRest();s.run.round++;this.lastStarted=s.run.round;s.tio.beginRound();this.requiem.begin(s.run.round,s.guns[s.active]?.id,this.ordered);achievements().event({type:'roundStart',value:s.run.round});s.perks.beginRound();this.special=s.run.round>=SPECIAL_ENCOUNTER.minRound&&s.run.round%5!==0&&this.random()<SPECIAL_ENCOUNTER.chance;s.economy.reached(s.run.round);this.state.begin(s.run.round,s.clock);this.nextSpawn=s.clock;this.announcementUntil=s.clock+1800;s.banner.setText(`RONDA ${s.run.round.toString().padStart(2,'0')} — ${this.state.plan.type}`);for(let i=0;i<5;i++)s.drop();
  const begin=()=>{if(s.ended)return;if(this.state.plan.type==='BOSS'){s.spawn(4,bossIndex(s.run.round));s.bossDialogue.start(()=>this.state.fight())}else this.spawnBatch();s.combatHud.update()};if(s.run.round===1)s.roulette.start(()=>{s.awardWeapon(s.roulette.winner);begin()});else begin()
 }
 queueReinforcements(points:[number,number][],sector:string){const s=this.scene;if(this.state.phase!=='combat'||this.state.plan.type==='BOSS'||this.extras.length||s.foes.length>=CITY.eventEnemyCap)return false;const selected=points.slice(0,Math.min(2,CITY.eventEnemyCap-s.foes.length));if(!selected.length)return false;for(const point of selected)this.extras.push({point,sector,due:s.clock+CITY.spawnWarning,expires:s.clock+10000});if(this.state.plan.type==='EXTERMINIO'){this.state.plan.target+=selected.length;this.state.pending+=selected.length}return true}
 private updateExtras(){const s=this.scene;for(const item of [...this.extras]){if(s.clock<item.due)continue;if(s.clock<item.expires&&s.foes.length>=MAX_ALIVE_ENEMIES)continue;const [x,y]=item.point,valid=s.clock<item.expires&&Math.hypot(x-s.player.x,y-s.player.y)>=CITY.minSpawnDistance&&!s.worldModel.cell(Math.floor(x/48),Math.floor(y/48));if(valid)s.spawn(enemyTier(s.run.round,Math.random()),-1,item.point);else if(this.state.plan.type==='EXTERMINIO')this.state.plan.target--;if(this.state.plan.type==='EXTERMINIO')this.state.pending--;this.extras.splice(this.extras.indexOf(item),1);if(!this.extras.length)s.city?.director.resolve(item.sector)}}
 private spawnBatch(){const s=this.scene,state=this.state;if(state.phase!=='combat')return;let count=0;if(state.plan.type==='EXTERMINIO')count=Math.min(MAX_ALIVE_ENEMIES-s.foes.length,Math.max(0,state.pending-this.extras.length));else if(state.plan.type==='SUPERVIVENCIA'&&s.clock>=this.nextSpawn){count=Math.min(MAX_ALIVE_ENEMIES-s.foes.length,Math.max(1,2+Math.floor(s.run.round/4)));this.nextSpawn=s.clock+SURVIVAL_SPAWN_INTERVAL}
  for(let i=0;i<count;i++){s.spawn(this.special&&s.foes.filter(e=>e.tier===12).length<SPECIAL_ENCOUNTER.maxAlive?12:enemyTier(s.run.round,Math.random()),-1);this.special=false;if(state.plan.type==='EXTERMINIO')state.pending--}
 }
 killed(e:Foe,attack?:ShotCredit){if(this.rewarded.has(e))return;this.rewarded.add(e);this.requiem.killed(e,attack);const s=this.scene;this.state.recordKill(e.round??s.run.round);if(armorDrop(e.boss>=0,this.random)){const p=s.lootPoint(e.sprite.x+90,e.sprite.y+65);s.addDrop(p.x,p.y,'armor',0)}if(e.boss>=0){const rewards=bossRewards(this.random);for(let i=0;i<rewards.length;i++){const r=rewards[i],point=s.lootPoint(e.sprite.x+(i-1)*40,e.sprite.y+30);s.addDrop(point.x,point.y,r.kind,r.id)}this.announcementUntil=s.clock+10000;s.banner.setText('BOSS DERROTADO')}}
 update(){const s=this.scene,state=this.state;if(s.levelUp.active||s.run.pendingLevels)return;if(this.queued){this.startNext();return}if(s.roulette.active||state.phase==='stopped'||state.phase==='boss-intro')return;if(state.phase==='rest'){const boss=state.plan.type==='BOSS';s.banner.setText(`${boss?'BOSS DERROTADO · ':''}RONDA COMPLETADA\nSIGUIENTE RONDA EN: ${clockText(state.restUntil-s.clock)}`);if(state.next(s.clock))this.startNext();return}
  this.updateExtras();if(!this.extras.length&&state.complete(s.foes.length,s.clock)){if(this.requiem.complete(s.run.round,!s.ended&&s.run.health>0))achievements().event({type:'requiemRoundComplete'});achievements().event({type:'roundComplete',roundType:state.plan.type,health:s.run.health});s.economy.complete(s.run.round,state.plan.type);s.retireEnemies();s.perks.beginRound();state.rest(s.clock);state.restUntil=s.clock+FORTUNE.restTime;s.fortune.offerRest();s.banner.setText(`${state.plan.type==='BOSS'?'BOSS DERROTADO · ':''}RONDA COMPLETADA\nSIGUIENTE RONDA EN: ${clockText(FORTUNE.restTime)}`);return}this.spawnBatch();if(s.clock>=this.announcementUntil)s.banner.setText('')
 }
 get label(){const state=this.state,round=this.scene.run.round.toString().padStart(2,'0');return `RONDA ${round} — ${state.plan.type}\n${state.plan.type==='EXTERMINIO'?`ELIMINADOS: ${Math.min(state.kills,state.plan.target)}/${state.plan.target}`:state.plan.type==='SUPERVIVENCIA'?`TIEMPO RESTANTE: ${clockText(state.endsAt-this.scene.clock)}`:bossName(bossIndex(this.scene.run.round))}`}
 continueNow(){if(this.state.phase==='rest'&&!this.scene.roulette.active)this.startNext()}
 stop(){this.extras=[];this.requiem.cancel();this.queued=false;this.state.stop()}
}

