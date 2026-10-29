import {padControls} from '../input/PadControls';
import {characterById} from '../characters/catalog';
import {MenuVideo} from '../ui/MenuVideo';
import {MusicManager} from '../systems/MusicManager';
import {AudioSystem} from '../systems/AudioSystem';
import {Typewriter} from '../systems/Typewriter';
import Phaser from 'phaser';
export const text=(s:Phaser.Scene,x:number,y:number,t:string,size=22,color='#f4e9ff')=>s.add.text(x,y,t,{fontFamily:'monospace',fontSize:size,color});
export function button(s:Phaser.Scene,y:number,label:string,action:()=>void){const t=text(s,100,y,label,28).setInteractive({useHandCursor:true});t.on('pointerover',()=>t.setColor('#ff327d'));t.on('pointerout',()=>t.setColor('#f4e9ff'));t.on('pointerdown',action);return t}
export class Menu extends Phaser.Scene{backgroundVideo!:MenuVideo;constructor(){super('Menu')}create(){this.cameras.main.setBackgroundColor('#090815');const bg=this.add.image(640,360,'menu-background').setDepth(-20);this.backgroundVideo=new MenuVideo(this);bg.setScale(Math.max(1280/bg.width,720/bg.height));this.add.rectangle(1020,360,520,720,0x080611,.68);MusicManager.get(this.game).menu();text(this,850,80,'C U R I C Ó   /   3 5 ° S',18,'#57e6ef');text(this,845,156,'HOTLINE',68,'#ff2878');text(this,845,238,'CURICÓ',68);text(this,850,355,'EL TURNO NUNCA TERMINA',18,'#ae8aba');button(this,465,'JUGAR  →',()=>{this.scene.start('CharacterSelect')}).setX(850);button(this,580,'MEJORAS',()=>this.scene.start('Upgrades')).setX(850);button(this,530,'OPCIONES → CONTROLES',()=>{this.scene.start('Controls')}).setX(850);text(this,850,660,'VERSIÓN 1.5.1 · PC + TÁCTIL',11,'#746381');text(this,850,630,'LOGROS',22,'#83eefa').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.scene.start('Achievements'));text(this,35,674,'NOTAS DE ACTUALIZACIÓN',17,'#a88fb8').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.scene.start('ReleaseNotes'));text(this,1000,692,'ACCESO RESTRINGIDO',14,'#796e8d').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.scene.start('Restricted'));this.cameras.main.fadeIn(300)}}
export class Controls extends Phaser.Scene{padTab=false;private clearPad?:()=>void;constructor(){super('Controls')}create(){this.showTab(false)}showTab(pad:boolean){this.clearPad?.();this.children.removeAll(true);this.padTab=pad;if(pad){this.clearPad=padControls(this)}else this.keyboardControls();for(const [x,label,on] of [[100,'TECLADO Y RATÓN',false],[550,'MANDO PS4',true]] as const)text(this,x,25,label,20,on===pad?'#ff418e':'#8e819f').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.showTab(on));if(pad)button(this,670,'← VOLVER',()=>this.scene.start('Menu'))}keyboardControls(){this.cameras.main.setBackgroundColor('#090815');text(this,100,80,'CONTROLES',48,'#ff2878');text(this,100,180,'WASD         Movimiento\nRATÓN        Apuntar\nCLIC IZQ.    Disparar\nR            Recargar\nE            Recoger / sustituir arma activa\nQ            Cambiar arma\nF            Usar botiquín (+40)\nESPACIO      Dash (WASD / última dirección)\nG            Lanzar arma\nV            Ejecutar enemigo aturdido\nX            Habilidad del protagonista\nESC          Pausa',21);const volume=text(this,800,220,'',22,'#58e7ec');const refresh=()=>volume.setText(`EFECTOS: ${Math.round(AudioSystem.volume*100)}%`);refresh();for(const [x,label,step] of [[800,'−',-.1],[1000,'+',.1]] as const){const b=text(this,x,280,label,40).setInteractive({useHandCursor:true});b.on('pointerdown',()=>{AudioSystem.setVolume(AudioSystem.volume+step);refresh();AudioSystem.play(this,'pickup')})}const music=MusicManager.get(this.game);const musicVolume=text(this,800,410,'',22,'#58e7ec');const refreshMusic=()=>musicVolume.setText(`MÚSICA: ${Math.round(music.volume*100)}%`);refreshMusic();for(const [x,label,step] of [[800,'−',-.1],[1000,'+',.1]] as const){text(this,x,460,label,40).setInteractive({useHandCursor:true}).on('pointerdown',()=>{music.setVolume(music.volume+step);refreshMusic()})}text(this,800,550,'Volúmenes independientes',16,'#ae8aba');button(this,620,'← VOLVER',()=>this.scene.start('Menu'))}}
export class Intro extends Phaser.Scene{
 constructor(){super('Intro')}
 private character=characterById('cervela');
 init(data:{characterId?:string}={}){this.character=characterById(data.characterId)}
 create(){
 MusicManager.get(this.game).stop();this.cameras.main.setBackgroundColor('#100b20');
 this.add.image(940,340,this.character.portrait).setDisplaySize(270,320);
 text(this,100,240,this.character.name,32,'#ff2878');
 const line=text(this,100,310,'',28);
 const writer=new Typewriter(this,line);
 writer.start(this.character.intro);
 text(this,100,565,'ENTER / CLIC: COMPLETAR · CONTINUAR →',18,'#58e7ec');
 let leaving=false;
 const advance=()=>{if(leaving)return;if(!writer.complete){writer.finish();return}leaving=true;writer.stop();this.scene.start('Game',{retry:false,characterId:this.character.id})};
 this.input.on('pointerdown',advance);this.input.keyboard!.on('keydown-ENTER',advance);
 this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.input.off('pointerdown',advance);this.input.keyboard!.off('keydown-ENTER',advance)});
 }
}




