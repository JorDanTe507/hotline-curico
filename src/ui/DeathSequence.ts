import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {MusicManager} from '../systems/MusicManager';
export const DEATH_TRANSITION_MS=1200;
/** One real-time tween; combat clocks, enemies and survival timers are already stopped. */
export class DeathSequence {
 phase:'idle'|'transition'|'revealing'|'screen'='idle';private shade?:Phaser.GameObjects.Rectangle;private navigating=false;private enter=()=>this.navigate(true);private escape=()=>this.navigate(false);
 constructor(private s:Game){}
 start(){if(this.phase!=='idle')return false;this.phase='transition';this.shade=this.s.add.rectangle(640,360,1280,720,0x05030b,0).setScrollFactor(0).setDepth(190);this.s.tweens.add({targets:this.shade,fillAlpha:.95,duration:DEATH_TRANSITION_MS,ease:'Sine.easeIn',onComplete:()=>{if(this.phase==='transition')this.show()}});return true}
 private show(){const s=this.s,c=s.character;this.phase='revealing';s.combatHud.name.setVisible(false);const parts:Phaser.GameObjects.GameObject[]=[];parts.push(s.add.rectangle(640,360,1280,720,0x07050f,1));const art=s.add.image(350,360,c.deathScreen.key);art.setScale(Math.min(660/art.width,680/art.height));parts.push(art,s.add.rectangle(710,360,2,630,0xe51e76,.6));
  const label=(x:number,y:number,value:string,size:number,color='#f5e5f2')=>s.add.text(x,y,value,{fontFamily:'monospace',fontSize:size,color,stroke:'#09040c',strokeThickness:2}).setOrigin(.5);
  parts.push(label(977,142,'HAS FALLADO',49,'#ff255b'),label(977,207,c.name,31,'#ff3a97'),label(977,292,'«'+c.deathScreen.quote+'»',21,'#edb4d5').setWordWrapWidth(430).setAlign('center'));
  parts.push(label(977,387,`RONDA ${s.run.round}  ·  BAJAS ${s.run.kills}  ·  JEFES ${s.run.bosses}\nTIEMPO ${Math.floor(s.run.elapsed/60)}m ${Math.floor(s.run.elapsed%60)}s\nRONDAS COMPLETADAS ${s.economy.completedRounds} · HC GANADOS: ${s.economy.earned}`,16,'#b6a4bd').setAlign('center'));
  for(const [y,value,retry,color] of [[510,'REINTENTAR',true,0xff2a8f],[595,'MENÚ PRINCIPAL',false,0xa28bc7]] as const){const box=s.add.rectangle(977,y,430,65,0x160b20,.95).setStrokeStyle(2,color).setInteractive({useHandCursor:true});box.on('pointerover',()=>box.setFillStyle(0x302039)).on('pointerout',()=>box.setFillStyle(0x160b20)).on('pointerdown',()=>this.navigate(retry));parts.push(box,label(977,y,value,25,'#'+color.toString(16).padStart(6,'0')))}
  parts.push(label(977,660,'ENTER: REINTENTAR · ESC: MENÚ',13,'#aa8eaf'));for(const part of parts)(part as Phaser.GameObjects.Image).setScrollFactor(0);s.overlay.add(parts).setScrollFactor(0).setAlpha(0);s.tweens.add({targets:s.overlay,alpha:1,duration:220,onComplete:()=>{if(this.phase==='revealing')this.phase='screen'}});s.input.keyboard!.on('keydown-ENTER',this.enter);s.input.keyboard!.on('keydown-ESC',this.escape);
 }
 private navigate(retry:boolean){if(this.phase!=='screen'||this.navigating)return;this.navigating=true;this.s.input.enabled=false;MusicManager.get(this.s.game).stop();if(retry)this.s.scene.restart({retry:true,characterId:this.s.character.id});else this.s.scene.start('Menu')}
 stop(){this.phase='idle';if(this.shade){this.s.tweens.killTweensOf(this.shade);this.shade.destroy();this.shade=undefined}this.s.input.keyboard?.off('keydown-ENTER',this.enter);this.s.input.keyboard?.off('keydown-ESC',this.escape)}
}

