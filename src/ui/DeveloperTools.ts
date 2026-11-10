import {captureUroborosKit} from '../uroboros/Encounter';
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
 if(s.uroboros){uroborosTools(s);return}
 s.pauseMenu.testing=true;s.pauseMenu.uroborosToolsOpen=false;s.overlay.removeAll(true);
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
 actions.push(['RADIOOPERADOR',()=>resume(()=>spawn(16))],['PROYECTO UROBOROS',()=>uroborosTools(s)]);
 for(const [i,[name,action]] of actions.entries()){const b=text(s,50+i%3*410,115+Math.floor(i/3)*52,name,17,'#f3d6ef').setScrollFactor(0).setInteractive({useHandCursor:true});b.on('pointerdown',action);s.overlay.add(b)}
 s.overlay.add(text(s,50,345,'GENERAR ENEMIGO · '+(enemyPage+1)+'/2',20,'#74eafa').setScrollFactor(0));
 for(const [slot,cfg] of ENEMIES.slice(enemyPage*9,enemyPage*9+9).entries()){const b=text(s,50+slot%3*410,390+Math.floor(slot/3)*50,cfg.name.toUpperCase(),16).setScrollFactor(0).setInteractive({useHandCursor:true});b.on('pointerdown',()=>resume(()=>spawn(enemyPage*9+slot)));s.overlay.add(b)}
 for(const [x,name,action] of [[50,'OTROS ENEMIGOS',()=>developerTools(s,1-enemyPage)],[500,'VOLVER A PAUSA',()=>s.pauseMenu.show()],[950,'REANUDAR',()=>resume(()=>{})]] as const){const b=text(s,x,650,name,19,'#74eafa').setScrollFactor(0).setInteractive({useHandCursor:true});b.on('pointerdown',action);s.overlay.add(b)}
}
function uroborosTools(s:Game){
 const encounter=s.uroboros;
 s.pauseMenu.uroborosToolsOpen=true;
 s.pauseMenu.testing=true;
 s.overlay.removeAll(true);
 s.overlay.add(s.add.rectangle(640,360,1280,720,0x090616,.96).setScrollFactor(0));
 s.overlay.add(text(s,50,40,'PROYECTO UROBOROS',30,'#ffc1fa').setScrollFactor(0));
 let target=1;
 const actor=()=>s.coop?.actor(target)??s;
 const status=text(s,50,90,'Encuentro experimental · Comisaría de Curicó',17,'#ddd0e4').setScrollFactor(0);
 s.overlay.add(status);
 const actions:[string,()=>void][]=encounter?[
  ['REINICIAR COMBATE',()=>encounter.restart()],
  ['MENÚ DESARROLLADOR',()=>s.scene.start('Restricted')],
  ['RESTAURAR SALUD',()=>{const a=actor();if(!s.coop?.incapacitated(target))a.run.health=maxHealth(a.run)}],
  ['RECARGAR DEFINITIVA',()=>{const a=actor();a.ultimate.charge=a.ultimate.requiredHits}],
  ['FORZAR SEGUNDA FASE',()=>encounter.forceTransformation()],
  ['FORZAR TRANSFORMACIÓN AL 50%',()=>encounter.forceTransformation()],
  ['APLICAR INFECCIÓN',()=>encounter.infect(actor())],
  ['ELIMINAR INFECCIÓN',()=>encounter.clearInfection(actor())],
  ['GENERAR CURA DE PRUEBA',()=>encounter.dropCure(actor().player.x,actor().player.y)],
  ['LIMPIAR EFECTOS ACTIVOS',()=>encounter.resetAttack()],
  ...(s.coop?[['CAMBIAR OBJETIVO J1 / J2',()=>{target=target===1?2:1;status.setText('Objetivo de pruebas · J'+target)}] as [string,()=>void]]:[]),
 ]:[
  ['INICIAR COMBATE CONTRA WESKER',()=>s.scene.restart({
   characterId:s.character.id,coop:!!s.coop,partnerId:s.coop?.actor(2).character.id,
   uroboros:true,kit:captureUroborosKit(s),
  })],
  ['VOLVER A COMBATE · PRUEBAS',()=>developerTools(s)],
 ];
 actions.push(['VOLVER A PAUSA',()=>s.pauseMenu.show()]);
 for(const [i,[name,action]] of actions.entries()){
  const button=text(s,50+(i%2)*600,150+Math.floor(i/2)*68,name,19,'#f3d6ef')
   .setScrollFactor(0).setInteractive({useHandCursor:true});
  button.on('pointerdown',action);
  s.overlay.add(button);
 }
}
