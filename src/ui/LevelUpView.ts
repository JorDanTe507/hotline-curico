import {achievements} from '../systems/Achievements';
import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import type {Upgrade,UpgradeContext} from '../systems/UpgradeCatalog';
import {dashCooldown} from '../systems/PlayerModifiers';
import {AudioSystem} from '../systems/AudioSystem';
const COLORS={common:0x5de9e9,rare:0x779fff,epic:0xff46a0};
const NAMES={common:'COMÚN',rare:'RARA',epic:'ÉPICA'};
export class LevelUpView {
 active=false;options:Upgrade[]=[];generation=0;rerolls=0;maxRerolls=1;private panel?:Phaser.GameObjects.Container;private locked=false;
 private keys:Phaser.Input.Keyboard.Key[];
 constructor(private s:Game){this.keys=[Phaser.Input.Keyboard.KeyCodes.ONE,Phaser.Input.Keyboard.KeyCodes.TWO,Phaser.Input.Keyboard.KeyCodes.THREE].map(k=>s.input.keyboard!.addKey(k));}
 private context():UpgradeContext{const s=this.s;return {abilityModule:s.character.ability.module,run:s.run,guns:s.guns,addAmmo:(g,n)=>s.ultimate.addAmmo(g,n),spawnSupply:kind=>{const p=s.lootPoint(s.player.x+35,s.player.y+25);s.addDrop(p.x,p.y,kind,0)}}}
 openIfNeeded(){const s=this.s;if(this.active||s.ended||s.paused||s.roulette.active||s.bossDialogue.active||!s.run.pendingLevels)return false;
  s.presentation.complete();s.critical.suspend();s.combatHud.update();this.active=true;this.locked=false;this.rerolls=this.maxRerolls=s.run.stats.rerolls??1;s.stopMinigun();s.physics.world.pause();s.time.paused=true;s.tweens.pauseAll();s.player.anims.pause();for(const e of s.foes)e.sprite.anims.pause();this.render();return true;
 }
 private render(options?:Upgrade[]){const s=this.s;this.panel?.destroy(true);this.generation++;this.options=options??s.progression.options(this.context());const generation=this.generation;
  const parts:Phaser.GameObjects.GameObject[]=[s.add.rectangle(640,360,1280,720,0x080711,.45)];
  const text=(x:number,y:number,value:string,size:number,color='#f5edf8')=>s.add.text(x,y,value,{fontFamily:'monospace',fontSize:size,color,stroke:'#090712',strokeThickness:2}).setOrigin(.5);
  parts.push(text(640,111,'¡SUBISTE DE NIVEL!',40,'#ff4eaa'),text(640,162,`NIVEL ${s.run.level} · ${s.run.pendingLevels} ELECCIÓN${s.run.pendingLevels===1?'':'ES'} PENDIENTE${s.run.pendingLevels===1?'':'S'}`,17,'#81eaf0'));
  this.options.forEach((item,i)=>{const x=300+i*340,color=COLORS[item.rarity],current=item.currentLevel(this.context());
   const card=s.add.rectangle(x,365,300,340,0x17152a,.98).setStrokeStyle(2,color).setInteractive({useHandCursor:true});card.on('pointerover',()=>card.setFillStyle(0x29213d)).on('pointerout',()=>card.setFillStyle(0x17152a)).on('pointerdown',()=>this.choose(i,generation));
   const icon=s.add.image(x,263,(['charge','duration'].includes(item.id)?s.character.specialPortrait:({walk1:s.character.normal.walk[0],back:s.character.normal.back[0],shoot:s.character.normal.pistol[0],hurt:s.character.normal.hurt[0]} as Record<string,string>)[item.icon]??item.icon)),scale=Math.min(54/icon.width,54/icon.height);icon.setScale(scale);
   const title=text(x,319,item.name,19).setWordWrapWidth(260).setAlign('center');
   const desc=text(x,402,item.description,16,'#c5c6dd').setWordWrapWidth(254).setAlign('center');
   const rarity=text(x,214,NAMES[item.rarity],13,'#'+color.toString(16).padStart(6,'0'));
   const level=text(x,493,item.repeatable?`REPETIBLE · ${current} ELEGIDAS`:`MEJORA ${current}/${item.maxLevel} → ${current+1}/${item.maxLevel}`,14,'#a9dce8');
   parts.push(card,icon,title,desc,rarity,level,text(x,563,`[${i+1}] ELEGIR`,17));
  });
  const change=text(640,625,`CAMBIAR CARTAS (${this.rerolls}/${this.maxRerolls})`,21,this.rerolls?'#6be9ef':'#796b85').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.reroll());if(!this.rerolls)change.disableInteractive();parts.push(change);
  this.panel=s.add.container(0,0,parts).setScrollFactor(0).setDepth(170);for(const key of this.keys)Phaser.Input.Keyboard.JustDown(key);
 }
 reroll(){if(!this.active||this.locked||this.rerolls<=0)return false;const old=this.options.map(u=>u.id),pool=this.s.progression.options(this.context(),Math.random,old);if(pool.every(u=>old.includes(u.id)))return false;this.rerolls--;achievements().event({type:'reroll',character:this.s.character.id});this.render(pool);return true}
 update(){if(!this.active)return;for(let i=0;i<3;i++)if(Phaser.Input.Keyboard.JustDown(this.keys[i])){this.choose(i,this.generation);break}}
 choose(index:number,generation=this.generation){if(!this.active||this.s.paused||this.s.ended||this.locked||generation!==this.generation||!this.options[index])return false;this.locked=true;const s=this.s,oldDuration=s.run.stats.ultimateDuration;
  if(!s.progression.apply(this.options[index].id,this.options,this.context())){this.locked=false;return false}
  s.dash.setCooldown(s.ultimate.active(s.clock)?s.ultimate.temporaryDashCooldown??dashCooldown(s.run.stats):dashCooldown(s.run.stats),s.clock,true);s.ultimate.extend(s.run.stats.ultimateDuration-oldDuration,s.clock);s.ultimate.charge=Math.min(s.ultimate.charge,s.ultimate.requiredHits);s.combatHud.update();AudioSystem.play(s,'reward');
  s.blockPointerUntilRelease=true;
  if(s.run.pendingLevels){this.rerolls=this.maxRerolls=s.run.stats.rerolls??1;this.render();this.locked=false}else this.close();return true;
 }
 close(resume=true){const s=this.s;this.active=false;this.locked=true;this.options=[];this.generation++;this.panel?.destroy(true);this.panel=undefined;for(const key of this.keys){Phaser.Input.Keyboard.JustDown(key)}
  if(resume&&!s.ended&&!s.paused&&!s.roulette.active&&!s.bossDialogue.active){s.time.paused=false;s.tweens.resumeAll();s.physics.world.resume();s.player.anims.resume();for(const e of s.foes)e.sprite.anims.resume()}
 }
}

