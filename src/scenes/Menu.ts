import {CURRENT_VERSION,RELEASE_NOTES} from '../config/releaseNotes';
import {MenuVideo} from '../ui/MenuVideo';
import {presentationPreferences} from '../ui/PresentationPreferences';
import {padControls} from '../input/PadControls';
import {characterById} from '../characters/catalog';
import {MusicManager} from '../systems/MusicManager';
import {AudioSystem} from '../systems/AudioSystem';
import {Typewriter} from '../systems/Typewriter';
import Phaser from 'phaser';
export const text=(s:Phaser.Scene,x:number,y:number,t:string,size=22,color='#f4e9ff')=>s.add.text(x,y,t,{fontFamily:'monospace',fontSize:size,color});
export function button(s:Phaser.Scene,y:number,label:string,action:()=>void){const t=text(s,100,y,label,28).setInteractive({useHandCursor:true});t.on('pointerover',()=>t.setColor('#ff327d'));t.on('pointerout',()=>t.setColor('#f4e9ff'));t.on('pointerdown',action);return t}
export class Menu extends Phaser.Scene{constructor(){super('Menu')}create(){
 this.cameras.main.setBackgroundColor('#090815');const bg=this.add.image(640,360,'menu-background').setDepth(-20);bg.setScale(Math.min(1280/bg.width,720/bg.height));MusicManager.get(this.game).menu();if(presentationPreferences.animated)new MenuVideo(this);
 text(this,38,24,'HOTLINE',49,'#ff2878').setStroke('#120819',5);text(this,38,80,'CURICÓ',49).setStroke('#120819',5);
 this.add.rectangle(640,638,1280,164,0x080611,.7);const actions:[string,()=>void][]=[['JUGAR  →',()=>this.scene.start('CharacterSelect')],...(!this.registry.get('mobileUI')?[['MULTIJUGADOR LOCAL',()=>this.scene.start('CharacterSelect',{coop:true})] as [string,()=>void]]:[]),['OPCIONES → CONTROLES',()=>this.scene.start('Controls')],['MEJORAS',()=>this.scene.start('Upgrades')],['LOGROS',()=>this.scene.start('Achievements')],['DESAFÍOS DIARIOS',()=>this.scene.start('DailyChallenges')],['NOTAS DE ACTUALIZACIÓN',()=>this.scene.start('ReleaseNotes')],['ACCESO RESTRINGIDO',()=>this.scene.start('Restricted')]];
 for(const [i,[label,action]] of actions.entries())button(this,576+Math.floor(i/4)*56,label,action).setX(38+(i%4)*310).setFontSize(label.length>20?16:18).setStroke('#080611',3);
 text(this,38,688,`VERSIÓN ${CURRENT_VERSION} · ${RELEASE_NOTES[0].title}`,12,'#d0b5d5');this.cameras.main.fadeIn(300)
}}
export class Controls extends Phaser.Scene{padTab=false;fromPause=false;init(data:{fromPause?:boolean}={}){this.fromPause=!!data.fromPause}close(){if(this.fromPause){const game=this.scene.get('Game') as any;game.pauseMenu.blockEscapeUntil=performance.now()+40;game.pauseMenu.show();this.scene.stop()}else this.scene.start('Menu')}private clearPad?:()=>void;constructor(){super('Controls')}create(){if(this.fromPause)this.scene.bringToTop();this.showTab(false)}showTab(pad:boolean){this.clearPad?.();this.children.removeAll(true);this.padTab=pad;if(pad){this.clearPad=padControls(this)}else this.keyboardControls();for(const [x,label,on] of [[100,'TECLADO Y RATÓN',false],[550,'MANDO PS4',true]] as const)text(this,x,25,label,20,on===pad?'#ff418e':'#8e819f').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.showTab(on));if(pad)button(this,670,'← VOLVER',()=>this.close())}keyboardControls(){this.cameras.main.setBackgroundColor(this.fromPause?'rgba(9,8,21,0.75)':'#090815');text(this,100,80,'CONTROLES',48,'#ff2878');text(this,100,180,'WASD         Movimiento\nRATÓN        Apuntar\nCLIC IZQ.    Disparar\nR            Recargar\nE            Recoger / sustituir arma activa\nQ            Cambiar arma\nF            Usar botiquín (+40)\nESPACIO      Dash (WASD / última dirección)\nG            Lanzar arma\nH            Usar adrenalina\nV            Ejecutar enemigo aturdido\nX            Habilidad del protagonista\nESC          Pausa\nB / BOTÓN DER. Mantener y soltar arrojadizo\nC            Cambiar arrojadizo\nE            Recuperar cuchillo',17);const volume=text(this,800,220,'',22,'#58e7ec');const refresh=()=>volume.setText(`EFECTOS: ${Math.round(AudioSystem.volume*100)}%`);refresh();for(const [x,label,step] of [[800,'−',-.1],[1000,'+',.1]] as const){const b=text(this,x,280,label,40).setInteractive({useHandCursor:true});b.on('pointerdown',()=>{AudioSystem.setVolume(AudioSystem.volume+step);refresh();AudioSystem.play(this,'pickup')})}const music=MusicManager.get(this.game);const musicVolume=text(this,800,410,'',22,'#58e7ec');const refreshMusic=()=>musicVolume.setText(`MÚSICA: ${Math.round(music.volume*100)}%`);refreshMusic();for(const [x,label,step] of [[800,'−',-.1],[1000,'+',.1]] as const){text(this,x,460,label,40).setInteractive({useHandCursor:true}).on('pointerdown',()=>{music.setVolume(music.volume+step);refreshMusic()})}text(this,800,550,'Volúmenes independientes',16,'#ae8aba');const animated=text(this,800,590,'',16,'#58e7ec').setInteractive({useHandCursor:true});const refreshAnimated=()=>animated.setText('MENÚ ANIMADO: '+(presentationPreferences.animated?'SÍ':'NO'));refreshAnimated();animated.on('pointerdown',()=>{presentationPreferences.animated=!presentationPreferences.animated;refreshAnimated()});button(this,620,'← VOLVER',()=>this.close())}}
export class Intro extends Phaser.Scene{
 constructor(){super('Intro')}
 private character=characterById('cervela');
 init(data:{characterId?:string}={}){this.character=characterById(data.characterId)}
 create(){
 MusicManager.get(this.game).stop();this.cameras.main.setBackgroundColor('#100b20');
 const face=this.add.image(940,340,this.character.portrait);if(this.character.id==='jordan')face.setScale(Math.min(270/face.width,320/face.height));else face.setDisplaySize(270,320);
 text(this,100,240,this.character.name,32,'#ff2878');
 const line=text(this,100,310,'',28);if(this.character.id==='jordan')line.setWordWrapWidth(650);
 const writer=new Typewriter(this,line);
 writer.start(this.character.intro);
 text(this,100,565,'ENTER / CLIC: COMPLETAR · CONTINUAR →',18,'#58e7ec');
 let leaving=false;
 const advance=()=>{if(leaving)return;if(!writer.complete){writer.finish();return}leaving=true;writer.stop();this.scene.start('Game',{retry:false,characterId:this.character.id})};
 this.input.on('pointerdown',advance);this.input.keyboard!.on('keydown-ENTER',advance);
 this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.input.off('pointerdown',advance);this.input.keyboard!.off('keydown-ENTER',advance)});
 }
}




