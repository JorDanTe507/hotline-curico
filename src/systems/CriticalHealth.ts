import type {Game} from '../scenes/Game';
import Phaser from 'phaser';
import {AudioSystem} from './AudioSystem';
import {CriticalAlert} from './CriticalAlert';
import {maxHealth} from './HealthCapacity';
import {CRITICAL_DIALOGUE_COOLDOWN,CRITICAL_DIALOGUE_DURATION} from '../config/instinct';
export const WOUNDED_LINES=['Necesito curarme...','Estoy en la mierda...','Con un cigarrito estoy impecable...'];
export class CriticalHealth {
 setMobile(value:boolean){this.hudPortrait.setVisible(!value&&!this.scene.ended)}
 readonly alert=new CriticalAlert();private nextDialogue=0;private dialogueUntil=0;
 private warning:Phaser.GameObjects.Text;private border:Phaser.GameObjects.Graphics;private dialogue:Phaser.GameObjects.Container;private hudPortrait:Phaser.GameObjects.Image;
 constructor(private scene:Game){
  this.warning=scene.add.text(640,82,'VIDA CRÍTICA',{fontFamily:'monospace',fontSize:28,fontStyle:'bold',color:'#ff3155',stroke:'#16010b',strokeThickness:3}).setOrigin(.5).setScrollFactor(0).setDepth(93).setVisible(false);
  this.border=scene.add.graphics().setScrollFactor(0).setDepth(89).setVisible(false);
  for(let i=0;i<5;i++)this.border.lineStyle(4,0xff2255,.25-i*.04).strokeRect(i*4,i*4,1280-i*8,720-i*8);
  const bg=scene.add.rectangle(0,0,380,116,0x100916,.92).setOrigin(0).setStrokeStyle(1,0xa6265a);
  const portrait=scene.add.image(57,58,scene.character.woundedPortraits[0]);portrait.setScale(Math.min(104/portrait.width,104/portrait.height));
  const line=scene.add.text(120,25,'',{fontFamily:'monospace',fontSize:18,color:'#fff0f4',wordWrap:{width:245}});
  this.hudPortrait=scene.add.image(56,51,scene.character.portrait).setScrollFactor(0).setDepth(93);this.hudPortrait.setScale(Math.min(74/this.hudPortrait.width,74/this.hudPortrait.height));
  this.dialogue=scene.add.container(880,535,[bg,portrait,line]).setScrollFactor(0).setDepth(94).setVisible(false);
 }
 get portraitKey(){return this.hudPortrait.texture.key}
 update(health:number,now:number,dead:boolean){const s=this.scene,c=s.character,blocked=dead||s.ended||s.paused||s.levelUp?.active||s.roulette?.active||s.bossDialogue?.active,{active:critical,beat}=this.alert.update(health,maxHealth(s.run),now,blocked);if(blocked){this.suspend();return}this.warning.setVisible(critical);this.border.setVisible(critical).setAlpha(.55+.35*(.5+.5*Math.sin(now/190)));
  if(critical&&now>=this.nextDialogue){this.nextDialogue=now+CRITICAL_DIALOGUE_COOLDOWN;this.dialogueUntil=now+CRITICAL_DIALOGUE_DURATION;const index=Phaser.Math.Between(0,c.lowHealthLines.length-1),key=c.woundedPortraits[index%c.woundedPortraits.length],portrait=this.dialogue.list[1] as Phaser.GameObjects.Image;portrait.setTexture(key).setScale(Math.min(104/portrait.width,104/portrait.height));(this.dialogue.list[2] as Phaser.GameObjects.Text).setText(c.lowHealthLines[index]);this.hudPortrait.setTexture(key);}
  if(!critical){this.dialogueUntil=0;this.hudPortrait.setTexture(c.portrait)}this.hudPortrait.setVisible(!dead&&!s.registry.get('mobileUI')).setScale(Math.min(74/this.hudPortrait.width,74/this.hudPortrait.height));
  let clearCorner=false;if(critical&&now<this.dialogueUntil){const cam=this.scene.cameras.main,objects=[this.scene.player,...this.scene.foes.map(e=>e.sprite),...this.scene.shots.map(p=>p.sprite)];for(const [x,y] of [[880,535],[20,190],[880,190]]){if(!objects.some(o=>o.active&&o.x-cam.scrollX>x-25&&o.x-cam.scrollX<x+405&&o.y-cam.scrollY>y-35&&o.y-cam.scrollY<y+145)){this.dialogue.setPosition(x,y);clearCorner=true;break}}}
  this.dialogue.setVisible(critical&&now<this.dialogueUntil&&clearCorner);
  if(s.registry.get('mobileUI')){this.warning.setY(170);this.dialogue.setPosition(450,175).setScale(.85)}else{this.warning.setY(82);this.dialogue.setScale(1)}
  if(beat&&!this.scene.sound.getAll('sfx-critical').some(sound=>sound.isPlaying))AudioSystem.play(this.scene,'critical',.6);
  if(!critical)this.scene.sound.stopByKey('sfx-critical');
 }
 suspend(){this.warning.setVisible(false);this.border.setVisible(false);this.dialogue.setVisible(false);this.scene.sound.stopByKey('sfx-critical')}
 stop(){this.suspend();this.hudPortrait.setVisible(false);this.dialogueUntil=0;this.alert.reset()}
}
