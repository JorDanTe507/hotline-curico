import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {WEAPONS,isLegendary} from '../weapons/arsenal';
import {availableWeights,chooseWeapon} from '../systems/WeaponLottery';
import {ROULETTE_SPIN_MS,ROULETTE_TOTAL_MS} from '../config/roulette';
import {AudioSystem} from '../systems/AudioSystem';
/** Runs on real frame delta while the simulation, scene timers and tweens are frozen. */
export class WeaponRoulette {
 active=false;winner=-1;elapsed=0;private view?:Phaser.GameObjects.Container;
 private strip?:Phaser.GameObjects.Container;private mask?:Phaser.Display.Masks.GeometryMask;
 private maskShape?:Phaser.GameObjects.Graphics;private title?:Phaser.GameObjects.Text;
 private glows:Phaser.GameObjects.Rectangle[]=[];private result?:Phaser.GameObjects.Text;private done?:()=>void;private revealed=false;
 private readonly spacing=146;private readonly winningIndex=24;
 constructor(private s:Game,private random=Math.random){}
 start(done:()=>void){if(this.active||this.s.ended||this.s.levelUp.active)return false;
  this.glows=[];this.winner=chooseWeapon(this.random);this.elapsed=0;this.revealed=false;this.done=done;this.active=true;
  const s=this.s;s.critical.suspend();s.stopMinigun();s.physics.world.pause();s.time.paused=true;s.tweens.pauseAll();
  s.player.anims.pause();for(const e of s.foes)e.sprite.anims.pause();
  const panel=s.add.rectangle(640,350,1080,286,0x10091d,.9).setStrokeStyle(2,0xff2887);
  const edge=s.add.rectangle(640,208,1080,2,0x4de8ec);
  const style={fontFamily:'monospace',fontSize:25,color:'#73f8ff',stroke:'#080511',strokeThickness:3};
  this.title=s.add.text(640,229,'OBTENIENDO ARMA...',style).setOrigin(.5);
  this.result=s.add.text(640,463,'',{...style,fontSize:20,color:'#ff70ad'}).setOrigin(.5);
  this.view=s.add.container(0,0,[panel,edge,this.title,this.result]).setScrollFactor(0).setDepth(150);
  this.strip=s.add.container(640,350);this.view.add(this.strip);
  const choices=availableWeights();
  for(let i=0;i<=this.winningIndex+5;i++){
   const id=i===this.winningIndex?this.winner:choices[Math.floor(Math.random()*choices.length)].id,legendary=isLegendary(id),x=i*this.spacing;
   if(legendary){const glow=s.add.rectangle(x,0,142,151,0xffc95b,.1).setStrokeStyle(4,0xffda72,.35);this.glows.push(glow);this.strip.add(glow)}
   const card=s.add.rectangle(x,0,136,145,legendary?0x36202d:0x19182b,.98).setStrokeStyle(2,legendary?0xffc95b:0xd3328c);
   const icon=s.add.image(x,-12,`weapon-${id}`);const scale=Math.min(94/icon.width,88/icon.height);icon.setScale(scale);
   const name=s.add.text(x,50,id===7?'LA BARREDORA':WEAPONS[id].name.toUpperCase(),{...style,fontSize:12,color:legendary?'#ffd470':'#e8ecff',wordWrap:{width:126}}).setOrigin(.5);
   this.strip.add([card,icon,name]);if(legendary)this.strip.add(s.add.rectangle(x,-69,124,3,0xffda72).setAlpha(.9));
  }
  this.maskShape=s.add.graphics().setScrollFactor(0).fillStyle(0xffffff).fillRect(113,274,1054,154).setVisible(false);
  this.mask=this.maskShape.createGeometryMask();this.strip.setMask(this.mask);
  this.view.add(s.add.rectangle(640,350,3,170,0x54f7ff));
  // Indicator sits above the masked strip and stays fixed.
  this.view.setDepth(152);panel.setDepth(0);return true;
 }
 update(delta:number){if(!this.active)return;this.elapsed+=Math.max(0,delta);for(const glow of this.glows)glow.setAlpha(.55+.35*Math.sin(this.elapsed/130));
  const t=Math.min(1,this.elapsed/ROULETTE_SPIN_MS),ease=1-Math.pow(1-t,4);
  this.strip!.x=640-this.winningIndex*this.spacing*ease;
  if(t===1&&!this.revealed){this.revealed=true;this.title!.setText('¡ARMA OBTENIDA!');this.result!.setText(WEAPONS[this.winner].name.toUpperCase());AudioSystem.play(this.s,'reward')}
  if(this.elapsed>=ROULETTE_TOTAL_MS){const done=this.done;this.cancel();this.s.blockPointerUntilRelease=true;done?.();this.s.levelUp.openIfNeeded()}
 }
 cancel(){this.glows=[];this.done=undefined;const wasActive=this.active;this.active=false;this.strip?.clearMask();this.strip?.destroy(true);this.view?.destroy(true);this.mask?.destroy();this.maskShape?.destroy();this.strip=undefined;this.view=undefined;this.mask=undefined;this.maskShape=undefined;
  if(wasActive){const s=this.s;s.time.paused=s.paused;if(!s.paused&&!s.ended){s.physics.world.resume();s.tweens.resumeAll();s.player.anims.resume();for(const e of s.foes)e.sprite.anims.resume()}}
 }
}

