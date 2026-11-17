import Phaser from 'phaser';
import {CHARACTERS} from '../characters/catalog';
import {SELECTION_SLOTS,SelectionVisit,selectionDossier} from '../characters/SelectionDossier';
import {AudioSystem} from '../systems/AudioSystem';
import {MusicManager} from '../systems/MusicManager';
import type {RushStart} from '../bossRush/state';
type SelectionRush={kind:'campaign'}|{kind:'practice';boss:number;weapon:number};
interface Slot {panel:Phaser.GameObjects.Rectangle;label:Phaser.GameObjects.Text;thumb?:Phaser.GameObjects.Image;lock?:Phaser.GameObjects.Graphics}
export class CharacterSelect extends Phaser.Scene {
 coop=false;private fromModes=false;private fromTraditional=false;private rush?:SelectionRush;
 init(data:{coop?:boolean;rush?:SelectionRush;fromModes?:boolean;fromTraditional?:boolean}={}){this.fromTraditional=data.fromTraditional===true;this.fromModes=data.fromModes===true;this.rush=data.rush;this.coop=!this.rush&&data.coop===true&&!this.registry.get('mobileUI')}
 cards:Slot[]=[];focused:number|undefined;confirming=false;visit=new SelectionVisit();
 private hero!:Phaser.GameObjects.Image;private badge!:Phaser.GameObjects.Text;private silhouette!:Phaser.GameObjects.Graphics;
 private nameLabel!:Phaser.GameObjects.Text;private description!:Phaser.GameObjects.Text;private abilityLabel!:Phaser.GameObjects.Text;
 private abilityDetail!:Phaser.GameObjects.Text;private statsLabel!:Phaser.GameObjects.Text;private confirm!:Phaser.GameObjects.Text;
 private pageLabel!:Phaser.GameObjects.Text;private warning!:Phaser.GameObjects.Text;private info!:Phaser.GameObjects.Container;
 private enteredAt=0;private lastKeyAt=0;private lastPointer={x:0,y:0};private visualKey='';
 constructor(){super('CharacterSelect')}
 private label(x:number,y:number,value:string,size=16,color='#f8e9f3',pixel=false){return this.add.text(x,y,value,{fontFamily:pixel?'"Press Start 2P", monospace':'monospace',fontSize:size,color,lineSpacing:7})}
 create(){
  this.cards=[];this.focused=undefined;this.confirming=false;this.visit=new SelectionVisit();this.visualKey='';
  this.enteredAt=performance.now();this.lastKeyAt=0;this.lastPointer={x:this.input.activePointer.x,y:this.input.activePointer.y};
  this.cameras.main.setBackgroundColor('#090611');if(this.rush)MusicManager.get(this.game).rush('menu');else MusicManager.get(this.game).menu();
  this.add.rectangle(640,360,1244,684,0x10091a).setStrokeStyle(1,0x693354);
  this.label(38,28,'CURICÓ P.D. / ARCHIVO DE OPERATIVOS',11,'#ef5098',true);
  this.label(38,60,'SELECCIÓN DE PERSONAJE',23,'#fff0f5',true);
  this.label(825,30,'REGISTRO VISUAL · 2.1.0',10,'#99768f',true);
  this.add.rectangle(1020,370,422,570,0x24101f).setStrokeStyle(2,0xff348e,.65);
  this.hero=this.add.image(1020,370,'dossier-cervela').setDepth(2);
  const maskShape=this.make.graphics({x:0,y:0});maskShape.fillStyle(0xffffff).fillRect(810,89,420,562);this.hero.setMask(maskShape.createGeometryMask());
  this.badge=this.label(0,0,'',11,'#ffb6d6',true).setBackgroundColor('#12091e').setPadding(8).setDepth(3);
  this.silhouette=this.add.graphics().setDepth(2);this.silhouette.fillStyle(0x0a0610).fillCircle(1020,240,55).fillRoundedRect(926,298,188,286,55);
  this.label(845,654,'ARCHIVO / CUERPO COMPLETO',9,'#9b768c',true);
  this.add.rectangle(550,372,500,562,0x0d0917).setDepth(5);
  const parts=[this.label(323,118,'EXPEDIENTE PERSONAL',11,'#b892a7',true),
   this.nameLabel=this.label(323,160,'',27,'#ff4599',true),this.description=this.label(323,218,'',21).setWordWrapWidth(445),
   this.label(323,310,'HABILIDAD ESPECIAL',12,'#ff4599',true),this.abilityLabel=this.label(323,346,'',16,'#fff0f5',true).setWordWrapWidth(445),
   this.abilityDetail=this.label(323,386,'',19,'#dcc9db').setWordWrapWidth(445),this.label(323,491,'ESTADÍSTICAS INICIALES',11,'#7ee6e8',true),
   this.statsLabel=this.label(323,523,'',17,'#dfd0e0'),this.warning=this.label(323,639,'',13,'#ff8eb9')];
  this.info=this.add.container(0,0,parts).setDepth(6);
  for(let i=0;i<SELECTION_SLOTS;i++)this.slot(i);
  this.pageLabel=this.label(48,627,'',11,'#bd8eac',true);
  this.label(230,627,'▼',20,'#ff4599').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.focus(((this.focused??0)+6)%SELECTION_SLOTS));
  this.label(40,663,'← VOLVER',13,'#80eaeb',true).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.back());
  this.confirm=this.label(432,663,'CONFIRMAR →',13,'#fff0f5',true).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.choose(this.focused??0));
  this.label(815,687,'FLECHAS / CRUCETA · ENTER / × · ESC / ○',12,'#b39aae');
  const keyboard=this.input.keyboard!;const onKey=(e:KeyboardEvent)=>{
   if(this.confirming)return;if(e.code==='Escape')this.back();
   else if(['ArrowLeft','ArrowUp','KeyA','KeyW','ArrowRight','ArrowDown','KeyD','KeyS','Tab'].includes(e.code)){
    e.preventDefault();this.lastKeyAt=performance.now();this.lastPointer={x:this.input.activePointer.x,y:this.input.activePointer.y};
    const forward=['ArrowRight','ArrowDown','KeyD','KeyS','Tab'].includes(e.code)&&!e.shiftKey;this.focus(((this.focused??0)+(forward?1:SELECTION_SLOTS-1))%SELECTION_SLOTS);
   }else if(e.code==='Enter')this.choose(this.focused??0);
  };keyboard.on('keydown',onKey);
  this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{keyboard.off('keydown',onKey);this.time.removeAllEvents();this.time.clearPendingEvents();this.tweens.killAll();this.hero.clearMask(true);maskShape.destroy()});this.focus(0);
 }
 private slot(i:number){
  const panel=this.add.rectangle(154,0,232,74,0x1c1026).setStrokeStyle(1,0x61304d).setInteractive({useHandCursor:true});
  const label=this.label(104,0,CHARACTERS[i]?.name??'DESCONOCIDO',i<3?11:9,'#e3c7dd',true);
  let thumb:Phaser.GameObjects.Image|undefined,lock:Phaser.GameObjects.Graphics|undefined;
  if(CHARACTERS[i])thumb=this.add.image(70,0,`dossier-${CHARACTERS[i].id}-thumb`).setDisplaySize(52,52);
  else{lock=this.add.graphics();lock.fillStyle(0x302236).fillCircle(70,0,9).fillRoundedRect(54,11,32,24,7);lock.lineStyle(2,0xa87998).strokeRoundedRect(68,4,13,12,4).fillStyle(0x99708b).fillRect(66,11,17,13)}
  panel.on('pointerover',(p:Phaser.Input.Pointer)=>{const stamp=p.event?.timeStamp??0,now=performance.now();
   if(now-this.enteredAt<80||now-this.lastKeyAt<100||stamp&&(stamp>1e12?stamp-performance.timeOrigin:stamp)<this.lastKeyAt)return;
   if(p.x===this.lastPointer.x&&p.y===this.lastPointer.y)return;this.lastPointer={x:p.x,y:p.y};this.focus(i);
  }).on('pointerdown',()=>{if(this.focused===i)this.choose(i);else this.focus(i)});this.cards.push({panel,label,thumb,lock});
 }
 focus(index:number|undefined){
  if(this.confirming||index===undefined||index<0||index>=SELECTION_SLOTS||this.focused===index)return;
  this.focused=index;this.visit.focus(index,performance.now());const data=this.selectionInfo();
  this.nameLabel.setText(data.name).setColor(data.locked?'#9e7f99':'#ff4599');this.description.setText(data.description);
  this.abilityLabel.setText(data.ability);this.abilityDetail.setText(data.detail);this.statsLabel.setText(data.locked?'DATOS NO DISPONIBLES':data.stats.map(([k,v])=>k.padEnd(13)+v).join('\n'));
  this.warning.setText(data.locked?'ACCESO BLOQUEADO':data.note);this.confirm.setText(data.locked?'BLOQUEADO':'CONFIRMAR →').setColor(data.locked?'#927487':'#fff0f5');
  const start=Math.floor(index/6)*6;this.cards.forEach((c,i)=>{const visible=i>=start&&i<start+6,y=145+(i-start)*82;
   c.panel.setPosition(154,y).setVisible(visible);c.panel.input!.enabled=visible;c.panel.setFillStyle(i===index?0x4b1539:0x1c1026).setStrokeStyle(i===index?3:1,i===index?0xff48a0:0x61304d);
   c.label.setY(y-7).setVisible(visible);c.thumb?.setY(y).setVisible(visible);c.lock?.setY(y-20).setVisible(visible);
  });this.pageLabel.setText(`${String(index+1).padStart(2,'0')} / 12`);
  this.tweens.killTweensOf(this.info);this.info.setAlpha(.5);this.tweens.add({targets:this.info,alpha:1,duration:130});AudioSystem.play(this,'pickup',.35);this.update();
 }
 selectionInfo(){return selectionDossier(this.focused,this.rush?'rush':'traditional')}
 selectionVisual(){return this.visit.visual(performance.now())}
 update(){
  if(!this.hero)return;const visual=this.selectionVisual(),locked=!visual.key;this.hero.setVisible(!locked);this.silhouette.setVisible(locked);this.badge.setVisible(!locked);if(locked)return;
  if(this.visualKey!==visual.key){this.visualKey=visual.key;this.hero.setTexture(visual.key);this.hero.setScale(Math.min(410/this.hero.width,554/this.hero.height))}
  this.hero.setPosition(1020+visual.offset,650-this.hero.displayHeight/2);this.badge.setPosition(this.hero.x-this.hero.displayWidth/2,650-80*this.hero.scaleY);
  this.badge.setFontSize(10).setFixedSize(68*this.hero.scaleX,80*this.hero.scaleY).setText(`0${visual.frame+1}`);this.hero.setAlpha(this.focused===2&&visual.playing&&visual.frame===1?.75:1);
 }
 choose(index:number){
  if(this.confirming||index<0||index>=SELECTION_SLOTS)return;
  if(!CHARACTERS[index]){this.focus(index);this.warning.setText('EXPEDIENTE CLASIFICADO · NO DISPONIBLE');this.cameras.main.shake(90,.002);return}
  this.focus(index);this.confirming=true;const c=CHARACTERS[index];AudioSystem.play(this,'reward',.5);this.cameras.main.flash(100,255,48,142,false);this.confirm.setText('CONFIRMADO');
  this.time.delayedCall(380,()=>{if(this.rush){const rush:RushStart={...this.rush,character:c.id};this.scene.start('Game',{characterId:c.id,coop:false,rush});return}MusicManager.get(this.game).newSession();this.scene.start(this.coop?'CoopLobby':'Intro',{characterId:c.id,fromTraditional:this.fromTraditional})});
 }
 back(){if(!this.confirming)this.scene.start(this.rush?'BossRush':this.fromTraditional?'TraditionalModes':this.fromModes?'GameModes':'Menu',this.rush?.kind==='practice'?{practice:true,focusBoss:this.rush.boss,terminalReady:true}:{})}
}
