import type {Game} from '../scenes/Game';
import {text} from '../scenes/Menu';
export class PauseMenu {
 confirming=false;
 constructor(private scene:Game){}
 private button(y:number,label:string,action:()=>void){const s=this.scene,b=text(s,450,y,label,27).setScrollFactor(0).setInteractive({useHandCursor:true});b.on('pointerover',()=>b.setColor('#ff4288'));b.on('pointerout',()=>b.setColor('#f4e9ff'));b.on('pointerdown',action);s.overlay.add(b)}
 show(){const s=this.scene;this.confirming=false;s.overlay.removeAll(true);s.overlay.add(s.add.rectangle(640,360,1280,720,0x080611,.92).setScrollFactor(0));s.overlay.add(text(s,450,200,'PAUSA',60,'#ff327d').setScrollFactor(0));this.button(340,'REANUDAR',()=>{s.blockPointerUntilRelease=true;s.pause()});this.button(420,'MENÚ PRINCIPAL',()=>this.ask());s.overlay.add(text(s,450,535,'ESC PARA CONTINUAR',18,'#79dfe6').setScrollFactor(0))}
 ask(){const s=this.scene;this.confirming=true;s.overlay.removeAll(true);s.overlay.add(s.add.rectangle(640,360,1280,720,0x080611,.95).setScrollFactor(0));s.overlay.add(text(s,270,240,'¿Seguro que quieres abandonar la partida?\nPerderás tu progreso actual.',26).setScrollFactor(0));this.button(400,'SÍ, SALIR',()=>s.abandonToMenu());this.button(480,'CANCELAR',()=>this.show())}
 close(){this.confirming=false;this.scene.overlay.removeAll(true)}
}
