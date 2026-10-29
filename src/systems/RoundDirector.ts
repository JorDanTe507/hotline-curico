import {achievements} from './Achievements';
import {armorDrop} from './Armor';
import type {Game,Foe} from '../scenes/Game';
import {RoundState,clockText} from './RoundState';
import {MAX_ALIVE_ENEMIES,SURVIVAL_SPAWN_INTERVAL} from '../config/dynamicRounds';
import {enemyTier,SPECIAL_ENCOUNTER} from '../enemies/config';
import {bossRewards} from './Loot';
export class RoundDirector {
 private special=false;private queued=false;state=new RoundState();private nextSpawn=0;private rewarded=new WeakSet<Foe>();private announcementUntil=0;
 constructor(private scene:Game,private random=Math.random){}
 startNext(){const s=this.scene;if(s.ended||s.roulette.active)return;if(s.levelUp.active||s.run.pendingLevels){this.queued=true;return}this.queued=false;s.retireEnemies();s.mapVisuals.beginRound();s.presentation.complete();s.run.round++;achievements().event({type:'roundStart',value:s.run.round});s.perks.beginRound();this.special=s.run.round>=SPECIAL_ENCOUNTER.minRound&&s.run.round%5!==0&&this.random()<SPECIAL_ENCOUNTER.chance;s.economy.reached(s.run.round);this.state.begin(s.run.round,s.clock);this.nextSpawn=s.clock;this.announcementUntil=s.clock+1800;s.banner.setText(`RONDA ${s.run.round.toString().padStart(2,'0')} — ${this.state.plan.type}`);for(let i=0;i<5;i++)s.drop();
  s.roulette.start(()=>{if(s.ended)return;s.awardWeapon(s.roulette.winner);if(this.state.plan.type==='BOSS'){s.spawn(4,0);s.bossDialogue.start(()=>this.state.fight())}else this.spawnBatch();s.combatHud.update()})
 }
 private spawnBatch(){const s=this.scene,state=this.state;if(state.phase!=='combat')return;let count=0;if(state.plan.type==='EXTERMINIO')count=Math.min(MAX_ALIVE_ENEMIES-s.foes.length,state.pending);else if(state.plan.type==='SUPERVIVENCIA'&&s.clock>=this.nextSpawn){count=Math.min(MAX_ALIVE_ENEMIES-s.foes.length,Math.max(1,2+Math.floor(s.run.round/4)));this.nextSpawn=s.clock+SURVIVAL_SPAWN_INTERVAL}
  for(let i=0;i<count;i++){s.spawn(this.special&&s.foes.filter(e=>e.tier===12).length<SPECIAL_ENCOUNTER.maxAlive?12:enemyTier(s.run.round,Math.random()),-1);this.special=false;if(state.plan.type==='EXTERMINIO')state.pending--}
 }
 killed(e:Foe){if(this.rewarded.has(e))return;this.rewarded.add(e);const s=this.scene;this.state.recordKill(e.round??s.run.round);if(armorDrop(e.boss>=0,this.random)){const p=s.lootPoint(e.sprite.x+90,e.sprite.y+65);s.addDrop(p.x,p.y,'armor',0)}if(e.boss>=0){const rewards=bossRewards(this.random);for(let i=0;i<rewards.length;i++){const r=rewards[i],point=s.lootPoint(e.sprite.x+(i-1)*40,e.sprite.y+30);s.addDrop(point.x,point.y,r.kind,r.id)}this.announcementUntil=s.clock+10000;s.banner.setText('BOSS DERROTADO')}}
 update(){const s=this.scene,state=this.state;if(s.levelUp.active||s.run.pendingLevels)return;if(this.queued){this.startNext();return}if(s.roulette.active||state.phase==='stopped'||state.phase==='boss-intro')return;if(state.phase==='rest'){const boss=state.plan.type==='BOSS';s.banner.setText(`${boss?'BOSS DERROTADO · ':''}RONDA COMPLETADA\nSIGUIENTE RONDA EN: ${clockText(state.restUntil-s.clock)}`);if(state.next(s.clock))this.startNext();return}
  if(state.complete(s.foes.length,s.clock)){achievements().event({type:'roundComplete',roundType:state.plan.type,health:s.run.health});s.economy.complete(s.run.round,state.plan.type);s.retireEnemies();s.perks.beginRound();state.rest(s.clock);s.banner.setText(`${state.plan.type==='BOSS'?'BOSS DERROTADO · ':''}RONDA COMPLETADA\nSIGUIENTE RONDA EN: 00:10`);return}this.spawnBatch();if(s.clock>=this.announcementUntil)s.banner.setText('')
 }
 get label(){const state=this.state,round=this.scene.run.round.toString().padStart(2,'0');return `RONDA ${round} — ${state.plan.type}\n${state.plan.type==='EXTERMINIO'?`ELIMINADOS: ${Math.min(state.kills,state.plan.target)}/${state.plan.target}`:state.plan.type==='SUPERVIVENCIA'?`TIEMPO RESTANTE: ${clockText(state.endsAt-this.scene.clock)}`:'EL TORTURADO'}`}
 stop(){this.queued=false;this.state.stop()}
}

