import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {Typewriter} from '../systems/Typewriter';
const LINES=[{name:'EL TORTURADO',portrait:'torturado-portrait',text:'Así que hasta aquí llegaste...'},{name:'EL TORTURADO',portrait:'torturado-portrait',text:'Ya que te gusta fumar... me fumaré un cigarro sobre tu cadáver.'},{name:'CERVELA',portrait:'portrait',text:'Vas a tener que quitármelo primero.'}];
export class BossDialogue {
 active=false;private panel:Phaser.GameObjects.Container;private portrait:Phaser.GameObjects.Image;private name:Phaser.GameObjects.Text;private writer:Typewriter;private index=0;private done?:()=>void;
 constructor(private scene:Game){const bg=scene.add.rectangle(640,360,1280,720,0x080611,.92),card=scene.add.rectangle(640,365,1050,360,0x1a0c22).setStrokeStyle(2,0xfa327d);this.portrait=scene.add.image(285,350,'torturado-portrait');this.name=scene.add.text(450,250,'',{fontFamily:'monospace',fontSize:28,color:'#ff4287'});const line=scene.add.text(450,315,'',{fontFamily:'monospace',fontSize:25,color:'#fff0fa',wordWrap:{width:640}});this.writer=new Typewriter(scene,line);const help=scene.add.text(450,490,'ENTER / CLIC: COMPLETAR · CONTINUAR',{fontFamily:'monospace',fontSize:16,color:'#6be6e8'});this.panel=scene.add.container(0,0,[bg,card,this.portrait,this.name,line,help]).setScrollFactor(0).setDepth(110).setVisible(false);
 scene.input.on('pointerdown',this.advance,this);scene.input.keyboard!.on('keydown-ENTER',this.advance,this);scene.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.stop();scene.input.off('pointerdown',this.advance,this);scene.input.keyboard!.off('keydown-ENTER',this.advance,this)});
 }
 start(done:()=>void){this.stop();this.active=true;this.done=done;this.index=0;this.panel.setVisible(true);this.scene.physics.world.pause();this.scene.critical.suspend();this.line()}
 private line(){const c=this.scene.character,l=this.index===1?{...LINES[1],text:c.bossTaunt}:this.index===2?{name:c.name,portrait:c.portrait,text:c.bossReply}:LINES[this.index];this.name.setText(l.name);this.portrait.setTexture(l.portrait).setScale(Math.min(220/this.portrait.width,250/this.portrait.height));this.writer.start(l.text)}
 advance(){if(!this.active)return;if(!this.writer.complete){this.writer.finish();return}if(++this.index<LINES.length){this.line();return}const done=this.done;this.stop();this.scene.input.keyboard!.resetKeys();this.scene.physics.world.resume();this.scene.nextFire=this.scene.clock+200;done?.()}
 stop(){this.active=false;this.done=undefined;this.writer.stop();this.panel.setVisible(false)}
}

