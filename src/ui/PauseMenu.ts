import {gameplayHud} from './GameplayHudState';
import {developerTools} from './DeveloperTools';
import {cityDevPanel} from '../atmosphere/CityDevPanel';
import {developerSession} from '../systems/DeveloperSession';
import type {Game} from '../scenes/Game';
import {text} from '../scenes/Menu';
export class PauseMenu {
 uroborosToolsOpen=false;
 confirming=false;configuring=false;testing=false;blockEscapeUntil=0;
 constructor(private scene:Game){}
 private button(y:number,label:string,action:()=>void){const s=this.scene,b=text(s,469,y,label,23).setPadding(12,9,12,9).setFixedSize(345,50).setBackgroundColor('#32132d').setScrollFactor(0).setInteractive({useHandCursor:true});b.on('pointerover',()=>b.setColor('#ff4288'));b.on('pointerout',()=>b.setColor('#f4e9ff'));b.on('pointerdown',action);s.overlay.add(b)}
 show(){const s=this.scene;this.uroborosToolsOpen=false;this.confirming=false;this.configuring=false;this.testing=false;s.overlay.removeAll(true);const v=gameplayHud(s);s.overlay.add(s.add.rectangle(640,360,1280,720,0x080611,.88).setScrollFactor(0));for(const x of [55,440,855])s.overlay.add(s.add.rectangle(x,160,370,450,0x1a0e24,.98).setOrigin(0).setStrokeStyle(1,0x9f3b75).setScrollFactor(0));s.overlay.add(s.add.text(60,75,'PAUSA // HOTLINE CURICÓ',{fontFamily:'"Press Start 2P",monospace',fontSize:25,color:'#ff64ad'}).setScrollFactor(0));const portrait=s.add.image(240,350,s.character.selectionPortrait.key);portrait.setScale(Math.min(300/portrait.width,345/portrait.height)).setScrollFactor(0);s.overlay.add(portrait);s.overlay.add(text(s,80,557,s.character.name,25,'#ff7eb6').setScrollFactor(0));s.overlay.add(text(s,878,192,'ESTADO DE LA PARTIDA',19,'#ff7eb6').setScrollFactor(0));s.overlay.add(text(s,878,249,`RONDA ${s.run.round}\nELIMINADOS ${s.run.kills}\nTIEMPO ${Math.floor(s.run.elapsed/60).toString().padStart(2,'0')}:${Math.floor(s.run.elapsed%60).toString().padStart(2,'0')}\n${v.currencyName} ${v.currency.toLocaleString('es-CL')}\nNIVEL ${v.level}\n${s.character.ability.name}\n${v.ultimate.active?'ACTIVA · '+v.ultimate.seconds.toFixed(1)+'s':v.ultimate.ready?'LISTA':s.ultimate.charge+'/'+s.ultimate.requiredHits}`,19,'#d7c1e2').setLineSpacing(20).setWordWrapWidth(315).setScrollFactor(0));this.button(285,'REANUDAR',()=>{s.blockPointerUntilRelease=true;s.pause()});this.button(345,'CONFIGURACIÓN',()=>{this.configuring=true;s.overlay.removeAll(true);s.scene.launch('Controls',{fromPause:true})});this.button(405,'MENÚ PRINCIPAL',()=>this.ask());if(!s.rush&&developerSession.active){this.button(465,'CIUDAD 1.7 · PRUEBAS',()=>cityDevPanel(s));this.button(525,'COMBATE · PRUEBAS',()=>developerTools(s))}s.overlay.add(text(s,450,640,'ESC PARA CONTINUAR',18,'#79dfe6').setScrollFactor(0))}
 showUroborosResult(){
  const s=this.scene;
  s.paused=true;
  this.uroborosToolsOpen=false;
  s.overlay.removeAll(true);
  s.overlay.add(s.add.rectangle(640,360,1280,720,0x080611,.78).setScrollFactor(0));
  s.overlay.add(text(s,340,230,'PRUEBA UROBOROS COMPLETADA',32,'#f0afff').setScrollFactor(0));
  this.button(360,'REINICIAR COMBATE',()=>s.uroboros?.restart());
  this.button(425,'MENÚ DESARROLLADOR',()=>s.scene.start('Restricted'));
 }
 ask(){const s=this.scene;this.confirming=true;s.overlay.removeAll(true);s.overlay.add(s.add.rectangle(640,360,1280,720,0x080611,.95).setScrollFactor(0));s.overlay.add(text(s,270,240,'¿Seguro que quieres abandonar la partida?\nPerderás tu progreso actual.',26).setScrollFactor(0));this.button(400,'SÍ, SALIR',()=>s.abandonToMenu());this.button(480,'CANCELAR',()=>this.show())}
 close(){this.confirming=false;this.configuring=false;this.testing=false;this.scene.overlay.removeAll(true)}
}
