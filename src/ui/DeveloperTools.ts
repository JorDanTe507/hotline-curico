import type {Game} from '../scenes/Game';
import {text} from '../scenes/Menu';
import {developerSession} from '../systems/DeveloperSession';
import {ENEMIES} from '../enemies/config';
import {bossName} from '../bosses/expansion';
import {magazineCapacity} from '../systems/PlayerModifiers';
import {gun,isMelee,singleTank,MINIGUN_CAPACITY} from '../weapons/arsenal';
import {maxHealth} from '../systems/HealthCapacity';

/** Developer-only controls use the normal combat/round entry points. */
export function developerTools(s:Game,enemyPage=0){
 if(!developerSession.active||!s.paused||s.ended)return;
 s.pauseMenu.testing=true;s.overlay.removeAll(true);
 s.overlay.add(s.add.rectangle(640,360,1280,720,0x090616,.96).setScrollFactor(0));
 s.overlay.add(text(s,50,25,`PRUEBAS DE COMBATE · ${s.character.name}`,27,'#74eafa').setScrollFactor(0));
 const label=text(s,50,65,'Sesión aislada · sin logros, diarios ni HC permanente',16,'#ffdc77').setScrollFactor(0);s.overlay.add(label);
 const actors=()=>s.coop?[s,s.coop.actor(2)]:[s];
 const resume=(action:()=>void)=>{s.blockPointerUntilRelease=true;s.pauseMenu.testing=false;s.pause();action()};
 const charge=()=>{s.temporal.end();for(const a of actors()){a.presentation.cancel();a.ultimate.stop();a.ultimate.charge=a.ultimate.requiredHits}if(label.active)label.setText('BARRAS RECARGADAS · X / △ para activar')};
 const spawn=(tier:number)=>{const p=s.lootPoint(s.player.x+200,s.player.y+80),e=s.spawn(tier,-1,[p.x,p.y]);if(s.rounds.state.plan.type==='EXTERMINIO')s.rounds.state.plan.target++;return e};
 const actions:[string,()=>void][]=[
  ['RECUPERAR VIDA',()=>{for(const a of actors())if(!s.coop?.incapacitated(a.playerId)){a.run.health=maxHealth(a.run);a.hurtAt=0}label.setText('VIDA RECUPERADA')}],
  ['RELLENAR MUNICIÓN',()=>{for(const a of actors()){if(!a.guns.length)a.guns=[gun(0)];for(const g of a.guns)if(!isMelee(g.id)){g.ammo=magazineCapacity(g.id,a.run.stats);g.reserve=singleTank(g.id)?0:g.ammo*3;if(singleTank(g.id))g.ammo=MINIGUN_CAPACITY}a.reloadAt=0}label.setText('MUNICIÓN RECUPERADA')}],
  ['RECARGAR DEFINITIVAS',charge],
  ['ACTIVAR DEFINITIVA J1',()=>resume(()=>{charge();s.presentation.start()})],
  ['GENERAR 10 MATONES',()=>resume(()=>{for(let i=0;i<10;i++)spawn(0)})],
  ['LIMPIAR ENEMIGOS',()=>{s.temporal.end();s.retireEnemies();label.setText('ENEMIGOS RETIRADOS')}],
 ];
 for(let i=0;i<5;i++)actions.push([`JEFE: ${bossName(i)}`,()=>resume(()=>{s.temporal.end();s.run.pendingLevels=0;s.run.round=(i+1)*5-1;s.rounds.startNext()})]);
 actions.push(['RADIOOPERADOR',()=>resume(()=>spawn(16))]);
 for(const [i,[name,action]] of actions.entries()){const b=text(s,50+i%3*410,115+Math.floor(i/3)*52,name,17,'#f3d6ef').setScrollFactor(0).setInteractive({useHandCursor:true});b.on('pointerdown',action);s.overlay.add(b)}
 s.overlay.add(text(s,50,345,'GENERAR ENEMIGO · '+(enemyPage+1)+'/2',20,'#74eafa').setScrollFactor(0));
 for(const [slot,cfg] of ENEMIES.slice(enemyPage*9,enemyPage*9+9).entries()){const b=text(s,50+slot%3*410,390+Math.floor(slot/3)*50,cfg.name.toUpperCase(),16).setScrollFactor(0).setInteractive({useHandCursor:true});b.on('pointerdown',()=>resume(()=>spawn(enemyPage*9+slot)));s.overlay.add(b)}
 for(const [x,name,action] of [[50,'OTROS ENEMIGOS',()=>developerTools(s,1-enemyPage)],[500,'VOLVER A PAUSA',()=>s.pauseMenu.show()],[950,'REANUDAR',()=>resume(()=>{})]] as const){const b=text(s,x,650,name,19,'#74eafa').setScrollFactor(0).setInteractive({useHandCursor:true});b.on('pointerdown',action);s.overlay.add(b)}
}
