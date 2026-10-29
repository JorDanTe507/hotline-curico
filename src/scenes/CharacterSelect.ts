import Phaser from 'phaser';
import {CHARACTERS,type CharacterConfig} from '../characters/catalog';
import {AudioSystem} from '../systems/AudioSystem';
import {MusicManager} from '../systems/MusicManager';
import {text} from './Menu';
interface Card {shadow:Phaser.GameObjects.Image;reveal:Phaser.GameObjects.Image;glow:Phaser.GameObjects.Image;details:Phaser.GameObjects.Container;scale:number}
export class CharacterSelect extends Phaser.Scene {
 cards:Card[]=[];focused:number|undefined;confirming=false;private hovered:number|undefined;private pointerReady=false;private lastPointer={x:0,y:0};private enteredAt=0;private lastKeyAt=0;
 constructor(){super('CharacterSelect')}
 create(){this.enteredAt=performance.now();this.lastKeyAt=0;this.cards=[];this.focused=undefined;this.hovered=undefined;this.pointerReady=false;this.lastPointer={x:this.input.activePointer.x,y:this.input.activePointer.y};this.confirming=false;this.cameras.main.setBackgroundColor('#080811');MusicManager.get(this.game).menu();
  this.add.graphics().lineStyle(1,0x3b244e,.45).strokeRect(30,20,1220,680);text(this,640,48,'SELECCIONAR PERSONAJE',37,'#f4d8ed').setOrigin(.5);text(this,640,87,'REVELA TU INSTINTO',15,'#aa87af').setOrigin(.5);
  CHARACTERS.forEach((c,i)=>this.card(c,i));
  text(this,640,684,'RATÓN: REVELAR / ELEGIR · ← →: CAMBIAR · ENTER: CONFIRMAR',14,'#bdc0d8').setOrigin(.5);
  text(this,60,674,'← VOLVER [ESC]',18,'#67e7ec').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.back());
  const keyboard=this.input.keyboard!;const onKey=(e:KeyboardEvent)=>{if(this.confirming)return;if(e.code==='Escape')this.back();else if(['ArrowLeft','KeyA','ArrowRight','KeyD','Tab'].includes(e.code)){e.preventDefault();this.lastKeyAt=performance.now();this.pointerReady=false;this.lastPointer={x:this.input.activePointer.x,y:this.input.activePointer.y};const forward=['ArrowRight','KeyD','Tab'].includes(e.code);this.focus(this.focused===undefined?(forward?0:CHARACTERS.length-1):(this.focused+(forward?1:CHARACTERS.length-1))%CHARACTERS.length)}else if(e.code==='Enter'&&this.focused!==undefined)this.choose(this.focused)};
  const onMove=(p:Phaser.Input.Pointer)=>{const stamp=p.event?.timeStamp;if(stamp&&(stamp>1e12?stamp-performance.timeOrigin:stamp)<Math.max(this.enteredAt,this.lastKeyAt))return;if(p.x===this.lastPointer.x&&p.y===this.lastPointer.y)return;this.lastPointer={x:p.x,y:p.y};this.pointerReady=true;this.focus(this.hovered)};this.input.on('pointermove',onMove);keyboard.on('keydown',onKey);this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.input.off('pointermove',onMove);keyboard.off('keydown',onKey);this.time.removeAllEvents();this.time.clearPendingEvents();this.tweens.killAll()});
 }
 private card(c:CharacterConfig,i:number){const x=360+i*560,color=i%2?0x48dbea:0xf42e96;this.add.rectangle(x,378,490,548,0x121021,.65).setStrokeStyle(1,color,.5);this.add.ellipse(x,550,320,25,color,.08);const key=c.selectionPortrait.key,glow=this.add.image(x,334,key).setTintFill(color).setAlpha(0),shadow=this.add.image(x,334,key).setTintFill(0x020308),reveal=this.add.image(x,334,key).setAlpha(0);const scale=Math.min(420/shadow.width,440/shadow.height);for(const im of [shadow,reveal])im.setScale(scale);glow.setScale(scale*1.015);
  shadow.setInteractive({pixelPerfect:true,alphaTolerance:1,useHandCursor:true}).on('pointerover',()=>{this.hovered=i;if(this.pointerReady)this.focus(i)}).on('pointerout',()=>{if(this.hovered===i)this.hovered=undefined;if(this.pointerReady&&this.focused===i&&!this.confirming)this.focus(undefined)}).on('pointerdown',()=>this.choose(i));
  const name=text(this,x,570,c.name,28,'#'+color.toString(16).padStart(6,'0')).setOrigin(.5),ability=text(this,x,602,c.ability.name,19,'#f5e9fa').setOrigin(.5),description=text(this,x,630,c.selectionDescription,15,'#c2bfd1').setOrigin(.5).setWordWrapWidth(440).setAlign('center');const details=this.add.container(0,0,[name,ability,description]).setAlpha(0);this.cards.push({shadow,reveal,glow,details,scale});
 }
 focus(index:number|undefined){if(this.confirming||this.focused===index)return;this.focused=index;for(let i=0;i<this.cards.length;i++){const c=this.cards[i],on=i===index;this.tweens.killTweensOf([c.reveal,c.glow,c.details]);this.tweens.add({targets:[c.reveal,c.details],alpha:on?1:0,duration:250,ease:'Sine.easeOut'});this.tweens.add({targets:c.glow,alpha:on?.3:0,duration:250})}if(index!==undefined)AudioSystem.play(this,'pickup',.35)}
 choose(index:number){if(this.confirming||!CHARACTERS[index])return;this.focus(index);this.confirming=true;const c=CHARACTERS[index],card=this.cards[index];AudioSystem.play(this,'reward',.5);this.tweens.add({targets:[card.shadow,card.reveal,card.glow],scaleX:card.scale*1.025,scaleY:card.scale*1.025,duration:180,yoyo:true});this.add.text(640,658,c.name+' · CONFIRMADO',{fontFamily:'monospace',fontSize:18,color:'#ffffff'}).setOrigin(.5);this.time.delayedCall(380,()=>{MusicManager.get(this.game).newSession();this.scene.start('Intro',{characterId:c.id})})}
 back(){if(!this.confirming)this.scene.start('Menu')}
}



