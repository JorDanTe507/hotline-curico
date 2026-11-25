import {combatDialogueCard,combatPortrait} from '../ui/CombatPresentation';
import {keyboardGuide} from '../ui/KeyboardGuide';
import {archiveBackdrop,archivePanel,archiveHeading,archiveButton,archiveMeter} from '../ui/MenuSkin';
import {MENU_ITEMS,type MenuAction} from '../ui/MenuPresentation';
import type {Game} from './Game';
import {hudPreferences} from '../ui/HudPreferences';
import {CURRENT_VERSION,RELEASE_NOTES} from '../config/releaseNotes';
import {padControls} from '../input/PadControls';
import {characterById} from '../characters/catalog';
import {MusicManager} from '../systems/MusicManager';
import {AudioSystem} from '../systems/AudioSystem';
import {Typewriter} from '../systems/Typewriter';
import Phaser from 'phaser';
export const text=(s:Phaser.Scene,x:number,y:number,t:string,size=22,color='#f4e9ff')=>s.add.text(x,y,t,{fontFamily:'monospace',fontSize:size,color});
export function button(s:Phaser.Scene,y:number,label:string,action:()=>void){const t=text(s,100,y,label,28).setInteractive({useHandCursor:true});t.on('pointerover',()=>t.setColor('#ff327d'));t.on('pointerout',()=>t.setColor('#f4e9ff'));t.on('pointerdown',action);return t}
export class Menu extends Phaser.Scene {
 menuItems:readonly typeof MENU_ITEMS[number][]=MENU_ITEMS;exitMessage='';private notice!:Phaser.GameObjects.Text;
 private menuButtons:{box:Phaser.GameObjects.Rectangle;label:Phaser.GameObjects.Text}[]=[];private focusIndex=-1;
 constructor(){super('Menu')}
 create(){
  this.exitMessage='';this.menuButtons=[];this.focusIndex=-1;this.menuItems=MENU_ITEMS;
  this.cameras.main.setBackgroundColor('#090815');const bg=this.add.image(640,360,'menu-city-art').setDepth(-20);bg.setScale(Math.min(1280/bg.width,720/bg.height));MusicManager.get(this.game).menu();
  this.add.rectangle(1060,350,390,650,0x0b0615,.88).setStrokeStyle(1,0x7d2a59,.7);
  for(const [y,line,color] of [[50,'HOTLINE','#fff1fa'],[100,'CURICÓ','#ff348c']] as const)this.add.text(888,y,line,{fontFamily:'"Press Start 2P",monospace',fontSize:30,color,stroke:'#10091b',strokeThickness:3});
  this.menuItems.forEach((item,i)=>{const y=197+i*46,box=this.add.rectangle(1060,y+21,348,42,0x180d22,.95).setStrokeStyle(1,0x75314f),label=this.add.text(886,y,item.label,{fontFamily:'"Press Start 2P",monospace',fontSize:12,color:'#f6dced',align:'center',padding:{top:15}}).setFixedSize(348,42).setInteractive({useHandCursor:true});label.on('pointerover',()=>this.focusOption(i)).on('menu-focus',()=>this.focusOption(i)).on('pointerdown',()=>this.activate(item.id));this.menuButtons.push({box,label})});
  this.notice=text(this,38,646,'',17,'#8de3e8').setWordWrapWidth(760);
  text(this,38,688,`VERSIÓN ${CURRENT_VERSION} · ${RELEASE_NOTES[0].title}`,12,'#d0b5d5');text(this,885,660,'FLECHAS / CRUCETA · ENTER / ×',12,'#c4a6be');this.focusOption(0);this.cameras.main.fadeIn(250);
 }
 focusOption(index:number){if(this.focusIndex===index)return;this.focusIndex=index;this.menuButtons.forEach((b,i)=>{b.box.setFillStyle(i===index?0x501337:0x180d22,.95).setStrokeStyle(i===index?3:1,i===index?0xff4596:0x75314f);b.label.setColor(i===index?'#ffffff':'#d8b8ce')});AudioSystem.play(this,'pickup',.3)}
 activate(id:MenuAction){if(document.querySelector('.hc-party:not([hidden])'))return;AudioSystem.play(this,'reward',.35);const routes:Partial<Record<MenuAction,string>>={modes:'GameModes',upgrades:'Upgrades',achievements:'Achievements',options:'Controls',daily:'DailyChallenges',notes:'ReleaseNotes',restricted:'Restricted'};if(id==='exit'){this.exitMessage='Para salir, cierra esta pestaña del navegador.';this.notice.setText(this.exitMessage);return}const scene=routes[id];if(scene)this.scene.start(scene)}
}
export class Controls extends Phaser.Scene{padTab=false;fromPause=false;init(data:{fromPause?:boolean}={}){this.fromPause=!!data.fromPause}close(){if(this.fromPause){const game=this.scene.get('Game') as any;game.pauseMenu.blockEscapeUntil=performance.now()+40;game.pauseMenu.show();this.scene.stop()}else this.scene.start('Menu')}private clearPad?:()=>void;constructor(){super('Controls')}create(){if(this.fromPause)this.scene.bringToTop();this.showTab(false)}showTab(pad:boolean){this.clearPad?.();this.children.removeAll(true);this.padTab=pad;archiveBackdrop(this);if(pad){this.clearPad=padControls(this)}else this.keyboardControls();for(const [x,label,on] of [[100,'TECLADO Y RATÓN',false],[550,'MANDO PS4',true]] as const)text(this,x,25,label,20,on===pad?'#ff418e':'#8e819f').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.showTab(on));if(pad)archiveButton(button(this,655,'← VOLVER',()=>this.close()))}keyboardControls(){archivePanel(this,785,90,450,510);keyboardGuide(this);for(const [key,name,y] of [['minimap','Mostrar minimapa',115],['helpers','Mostrar ayudas del HUD',155]] as const){const toggle=text(this,800,y,'',16,'#79e9df').setInteractive({useHandCursor:true});const refresh=()=>toggle.setText(name+': '+(hudPreferences[key]?'SÍ':'NO'));refresh();toggle.on('pointerdown',()=>{hudPreferences[key]=!hudPreferences[key];if(key==='helpers'&&this.fromPause)(this.scene.get('Game') as Game).refreshHudHelp();refresh()})}this.cameras.main.setBackgroundColor(this.fromPause?'rgba(9,8,21,0.75)':'#090815');archiveHeading(text(this,42,83,'CONTROLES',48,'#ff2878'));const volume=text(this,800,220,'',22,'#58e7ec');const fxMeter=archiveMeter(this,800,260,350,AudioSystem.volume);const refresh=()=>{volume.setText(`EFECTOS: ${Math.round(AudioSystem.volume*100)}%`);fxMeter.clear().fillStyle(0x38233e).fillRect(800,260,350,8).fillStyle(0xff398f).fillRect(800,260,350*AudioSystem.volume,8)};refresh();for(const [x,label,step] of [[800,'−',-.1],[1000,'+',.1]] as const){const b=text(this,x,280,label,40).setInteractive({useHandCursor:true});b.on('pointerdown',()=>{AudioSystem.setVolume(AudioSystem.volume+step);refresh();AudioSystem.play(this,'pickup')})}const music=MusicManager.get(this.game);const musicVolume=text(this,800,410,'',22,'#58e7ec');const musicMeter=archiveMeter(this,800,450,350,music.volume);const refreshMusic=()=>{musicVolume.setText(`MÚSICA: ${Math.round(music.volume*100)}%`);musicMeter.clear().fillStyle(0x38233e).fillRect(800,450,350,8).fillStyle(0x80ede9).fillRect(800,450,350*music.volume,8)};refreshMusic();for(const [x,label,step] of [[800,'−',-.1],[1000,'+',.1]] as const){text(this,x,460,label,40).setInteractive({useHandCursor:true}).on('pointerdown',()=>{music.setVolume(music.volume+step);refreshMusic()})}text(this,800,550,'Volúmenes independientes',16,'#ae8aba');archiveButton(button(this,655,'← VOLVER',()=>this.close()))}}
export class Intro extends Phaser.Scene{
 constructor(){super('Intro')}
 private character=characterById('cervela');writer!:Typewriter;
 init(data:{characterId?:string}={}){this.character=characterById(data.characterId)}
 create(){
 MusicManager.get(this.game).stop();this.cameras.main.setBackgroundColor('#100b20');
 const view=combatDialogueCard(this,combatPortrait(this.character.id,this.character.portrait),true);view.name.setText(this.character.name);view.face.setScale(Math.min(244/view.face.width,320/view.face.height));view.enter();
 const writer=this.writer=new Typewriter(this,view.line);
 writer.start(this.character.intro);
 let leaving=false;
 const advance=()=>{if(leaving)return;if(!writer.complete){writer.finish();return}leaving=true;writer.stop();this.scene.start('Game',{retry:false,characterId:this.character.id})};
 this.input.on('pointerdown',advance);this.input.keyboard!.on('keydown-ENTER',advance);
 this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.input.off('pointerdown',advance);this.input.keyboard!.off('keydown-ENTER',advance)});
 }
}




