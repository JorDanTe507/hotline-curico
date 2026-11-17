import {archiveBackdrop,archivePanel,archiveHeading,archiveButton,menuMotion} from '../ui/MenuSkin';
import {DEVELOPER_KEYPAD,DEVELOPER_NOTICE,developerRounds} from '../ui/DeveloperPresentation';
import {AudioSystem} from '../systems/AudioSystem';
import {CHARACTERS} from '../characters/catalog';
import Phaser from 'phaser';import {developerSession} from '../systems/DeveloperSession';import {permanentProgress} from '../systems/PermanentProgress';import {text} from './Menu';
export class Restricted extends Phaser.Scene {
 page=0;keyboardSubmission=false;private handled=new WeakSet<KeyboardEvent>();private password='';private character='cervela';private field?:Phaser.GameObjects.Text;private error?:Phaser.GameObjects.Text;
 constructor(){super('Restricted')}
 create(){this.handled=new WeakSet();this.password='';this.character='cervela';this.draw();const type=(e:KeyboardEvent)=>{if(developerSession.active||this.handled.has(e))return;this.handled.add(e);if(e.key==='Backspace')this.password=this.password.slice(0,-1);else if(e.key==='Enter'){this.keyboardSubmission=true;this.submit()}else if(/^[A-Za-z0-9 ]$/.test(e.key)&&this.password.length<24)this.password+=e.key;this.field?.setText('●'.repeat(this.password.length));this.pulse()};this.input.keyboard!.on('keydown',type);this.events.once('shutdown',()=>{this.password='';this.input.keyboard!.off('keydown',type)})}
 private submit(){if(developerSession.unlock(this.password)){this.password='';permanentProgress();this.draw()}else{this.error?.setText('CLAVE INCORRECTA');AudioSystem.play(this,'hurt',.25);if(this.error&&menuMotion()){this.error.setAlpha(.4);this.tweens.add({targets:this.error,alpha:1,duration:140})}}}
 private pulse(){if(this.field&&menuMotion()){this.tweens.killTweensOf(this.field);this.field.setAlpha(.55);this.tweens.add({targets:this.field,alpha:1,duration:120})}}
 appendCharacter(letter:string){this.password+=letter;this.field?.setText('●'.repeat(this.password.length));this.pulse()}
 eraseCharacter(){this.password=this.password.slice(0,-1);this.field?.setText('●'.repeat(this.password.length));this.pulse()}
 get roundCards(){return developerRounds(this.page)}
 private balanceLabel?:Phaser.GameObjects.Text;
 update(){if(developerSession.active)this.balanceLabel?.setText(permanentProgress().balance().toLocaleString('es-CL')+' HC')}
 private draw(){this.field=undefined;this.error=undefined;this.balanceLabel=undefined;this.children.removeAll(true);this.cameras.main.setBackgroundColor('#090612');archiveBackdrop(this);
  const label=(x:number,y:number,value:string,size=18,color='#decce5')=>text(this,x,y,value,size,color);
  const button=(x:number,y:number,value:string,fn:()=>void,width?:number,height?:number)=>{const t=archiveButton(label(x,y,value,17,'#8ceaf5'));if(width)t.setFixedSize(width,height??44);t.setInteractive({useHandCursor:true}).on('menu-focus',()=>t.setBackgroundColor('#59203f')).on('pointerdown',()=>{AudioSystem.play(this,'pickup',.25);fn()});return t};
  archiveHeading(label(42,30,developerSession.active?'CENTRO DE PRUEBAS':'ACCESO RESTRINGIDO'),26);label(42,77,developerSession.active?'MODO DESARROLLADOR // SESIÓN LOCAL':'SISTEMA INTERNO // HOTLINE CURICÓ',14,'#83e4e6');
  if(!developerSession.active){
   archivePanel(this,42,122,740,510);archivePanel(this,810,122,428,510);
   label(64,145,'● ACCESO PROTEGIDO',14,'#83e4e6');label(64,174,'Introduce la contraseña',17);archivePanel(this,64,205,690,55,0xb7407e);this.field=label(80,217,'●'.repeat(this.password.length),25,'#fff0fc').setFixedSize(650,38);
   [...DEVELOPER_KEYPAD].forEach((letter,i)=>button(64+i%9*77,284+Math.floor(i/9)*61,letter,()=>this.appendCharacter(letter),65,48).setFontSize(21).setAlign('center'));
   button(64,548,'← BORRAR',()=>this.eraseCharacter(),190);button(281,548,'ENTRAR →',()=>this.submit(),190);this.error=label(64,604,'',16,'#ff759b');
   archiveHeading(label(836,157,'TERMINAL DE\nOPERACIONES'),17).setLineSpacing(12);label(836,247,'AUTORIZACIÓN REQUERIDA',18,'#ff86bb');label(836,299,'ACCESO EXCLUSIVO\nPARA PRUEBAS',18).setLineSpacing(9);label(836,394,'● SISTEMA LOCAL',18,'#83e4e6');label(836,444,'TECLADO / CRUCETA: SELECCIONAR\nENTER / ×: CONFIRMAR\nESC / ○: VOLVER',14,'#bda9cb').setLineSpacing(12);
   const circuit=this.add.graphics().lineStyle(1,0x74315b,.8);for(let i=0;i<5;i++)circuit.lineBetween(836,550+i*10,1206-i*43,550+i*10);
  }else{
   label(42,103,DEVELOPER_NOTICE,15,'#dbc09e');archivePanel(this,42,133,860,155);label(58,145,'01 / PROTAGONISTA',12,'#a5e9e5');
   CHARACTERS.forEach((c,i)=>{const x=58+i*280,selected=this.character===c.id;archivePanel(this,x,173,266,101,selected?0x80ede9:0x713259);const image=this.add.image(x+48,223,'dossier-'+c.id+'-thumb').setDisplaySize(82,82);if(!selected)image.setTint(0xb7a1b3);label(x+101,193,c.name,19,selected?'#ffffff':'#c0a3bf');label(x+101,232,selected?'SELECCIONADO':'SELECCIONAR',12,selected?'#80ede9':'#bda9cb');const target=text(this,x,173,c.name,1,'#180e24').setFixedSize(266,101).setAlpha(.001).setInteractive({useHandCursor:true});target.on('pointerdown',()=>{this.character=c.id;AudioSystem.play(this,'pickup',.25);this.draw()})});
   archivePanel(this,930,133,308,155);label(946,149,'RECURSOS DE PRUEBA',13,'#a5e9e5');this.balanceLabel=label(946,187,permanentProgress().balance().toLocaleString('es-CL')+' HC',25,'#ffe297');label(946,231,'TEMPORALES / SESIÓN LOCAL',13,'#bda9cb');
   archivePanel(this,42,308,860,320);label(58,322,`02 / RONDAS · PÁGINA ${this.page+1}`,13,'#a5e9e5');
   for(const [slot,card]of this.roundCards.entries()){const x=58+slot%5*168,y=354+Math.floor(slot/5)*110;archivePanel(this,x,y,156,97,card.boss>=0?0xb7407e:0x713259);if(card.portrait){const image=this.add.image(x+110,y+54,...card.portrait).setDisplaySize(67,72).setAlpha(.22);image.setTint(0xeaa9d2)}const t=button(x,y,`RONDA ${card.round}${card.name?'\n'+card.name:''}`,()=>{developerSession.round=card.round;this.scene.start('Game',{characterId:this.character})},156,97);t.setFontSize(card.boss>=0?14:18).setWordWrapWidth(135).setLineSpacing(7).setBackgroundColor('rgba(36,14,36,0.35)')}
   if(this.page>0)button(58,582,'← ANTERIOR',()=>{this.page--;this.draw()},165,38);button(700,582,'SIGUIENTE →',()=>{this.page++;this.draw()},180,38);
   archivePanel(this,930,308,308,320);label(946,326,'03 / MODIFICADORES',13,'#a5e9e5');
   button(946,363,`INMORTALIDAD: ${developerSession.immortal?'ACTIVADA':'DESACTIVADA'}`,()=>{developerSession.immortal=!developerSession.immortal;this.draw()},276,53).setFontSize(14).setWordWrapWidth(256);
   button(946,429,`ESTADÍSTICAS: ${developerSession.baseStats?'BASE':'CON MEJORAS'}`,()=>{developerSession.baseStats=!developerSession.baseStats;this.draw()},276,53).setFontSize(14).setWordWrapWidth(256);
   button(946,495,'MEJORAS DE PRUEBA',()=>this.scene.start('Upgrades'),276,47).setFontSize(15);label(946,569,'COMPRAS Y RECOMPENSAS\nDE PRUEBA SIN GUARDADO',12,'#bda9cb').setLineSpacing(7);
  }
  button(42,658,'← VOLVER',()=>this.scene.start('Menu'),190,44);
 }
}
