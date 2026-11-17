import {menuMotion} from './MenuSkin';
import {combatDialogueCard,combatPortrait} from './CombatPresentation';
import {JORDAN_BOSS_LINES} from '../v20/dialogues';
import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {Typewriter} from '../systems/Typewriter';
import {BOSS_DEFINITIONS} from '../bosses/expansion';
const LINES=[{name:'EL TORTURADO',portrait:'torturado-portrait',text:'Así que hasta aquí llegaste...'},{name:'EL TORTURADO',portrait:'torturado-portrait',text:'Ya que te gusta fumar... me fumaré un cigarro sobre tu cadáver.'},{name:'CERVELA',portrait:'portrait',text:'Vas a tener que quitármelo primero.'}];
export interface BossLine {name:string;portrait:string;text:string;frame?:string}
export class BossDialogue {
 active=false;private panel:Phaser.GameObjects.Container;private portrait:Phaser.GameObjects.Image;private name:Phaser.GameObjects.Text;private writer:Typewriter;private index=0;private done?:()=>void;private custom?:readonly BossLine[];
 constructor(private scene:Game){const view=combatDialogueCard(scene,'torturado-portrait');this.portrait=view.face;this.name=view.name;this.writer=new Typewriter(scene,view.line);this.panel=view.panel.setVisible(false);
 scene.input.on('pointerdown',this.advance,this);scene.input.keyboard!.on('keydown-ENTER',this.advance,this);scene.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.stop();scene.input.off('pointerdown',this.advance,this);scene.input.keyboard!.off('keydown-ENTER',this.advance,this)});
 }
 start(done:()=>void,lines?:readonly BossLine[]){this.stop();this.custom=lines;this.active=true;this.done=done;this.index=0;this.panel.setVisible(true).setAlpha(1);if(menuMotion())this.scene.tweens.add({targets:this.panel,alpha:{from:0,to:1},duration:120});this.scene.physics.world.pause();this.scene.critical.suspend();this.line()}
 private line(){const custom=this.custom?.[this.index];if(custom){this.show(custom);return}const c=this.scene.character,index=this.scene.foes.find(e=>e.boss>=0)?.boss??0,b=BOSS_DEFINITIONS[index];const l=c.id==='jordan'?this.index===0?{name:b.name,portrait:index===0?'torturado-portrait':`boss-${index}-portrait`,text:b.name}:this.index===1?{name:b.name,portrait:index===0?'torturado-portrait':`boss-${index}-portrait`,text:JORDAN_BOSS_LINES[index][0]}:{name:c.name,portrait:c.portrait,text:JORDAN_BOSS_LINES[index][1]}:index===0?(this.index===1?{...LINES[1],text:c.bossTaunt}:this.index===2?{name:c.name,portrait:c.portrait,text:c.bossReply}:LINES[this.index]):this.index===2?{name:c.name,portrait:c.portrait,text:('replies' in b?b.replies[c.id==='cervela'?0:1]:c.bossReply)}:{name:b.name,portrait:`boss-${index}-portrait`,text:this.index===0?`${b.name} · ${b.weaponName}`:b.lines[c.id==='cervela'?0:1]};this.show(l)}
 private show(l:BossLine){this.name.setText(l.name);this.portrait.setTexture(l.portrait===this.scene.character.portrait?combatPortrait(this.scene.character.id,l.portrait):l.portrait,l.frame).setScale(Math.min(244/this.portrait.width,320/this.portrait.height));this.writer.start(l.text)}
 advance(){if(!this.active)return;if(!this.writer.complete){this.writer.finish();return}if(++this.index<(this.custom?.length??LINES.length)){this.line();return}const done=this.done;this.stop();this.scene.input.keyboard!.resetKeys();this.scene.physics.world.resume();this.scene.nextFire=this.scene.clock+200;done?.()}
 stop(){this.scene.tweens.killTweensOf(this.panel);this.active=false;this.done=undefined;this.custom=undefined;this.writer.stop();this.panel.setVisible(false)}
}

