import {inputHub} from '../input/InputHub';
import {maxHealth} from '../systems/HealthCapacity';
import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {ULTIMATE_HITS,ULTIMATE_DURATION,ULTIMATE_HEAL_PER_SECOND} from '../config/instinct';
export class UltimateView {
 setMobile(value:boolean){for(const p of [this.status,this.bar,this.background])p.setVisible(!value&&!this.scene.ended)}
 private status:Phaser.GameObjects.Text;private bar:Phaser.GameObjects.Rectangle;private aura:Phaser.GameObjects.Graphics;private healing:Phaser.GameObjects.Text;private second:Phaser.GameObjects.Image;private background:Phaser.GameObjects.Rectangle;
 constructor(private scene:Game){
  this.status=scene.add.text(28,608,`${scene.character.ability.name} 0/${ULTIMATE_HITS}`,{fontFamily:'monospace',fontSize:16,color:'#f8c4e5'}).setScrollFactor(0).setDepth(91);
  this.background=scene.add.rectangle(28,640,280,7,0x39233b).setOrigin(0,.5).setScrollFactor(0).setDepth(91);
  this.bar=scene.add.rectangle(28,640,0,7,0xd74f9b).setOrigin(0,.5).setScrollFactor(0).setDepth(92);
  this.aura=scene.add.graphics().setDepth(8);this.healing=scene.add.text(0,0,`+${ULTIMATE_HEAL_PER_SECOND} VIDA/S`,{fontFamily:'monospace',fontSize:10,color:'#80ffb0'}).setOrigin(.5).setDepth(14).setVisible(false);
  this.second=scene.add.image(0,0,'weapon-0').setOrigin(.15,.5).setDepth(13).setVisible(false);
 }
 update(angle:number){const s=this.scene,name=s.character.ability.name,color=s.character.ability.color,active=s.ultimate.active(s.clock),ready=s.ultimate.ready;
  this.status.setText(s.ultimate.pending?name+' · ACTIVANDO':active?`${name} · ${Math.ceil((s.ultimate.until-s.clock)/1000)}s`:ready?`ULTI LISTA — PRESIONA ${inputHub(s.game).last==='gamepad'?'△':'X'}`:`${name} ${s.ultimate.charge}/${s.ultimate.requiredHits}`);
  const show=!s.registry.get('mobileUI');this.status.setVisible(show);this.bar.setVisible(show);this.background.setVisible(show);
  this.bar.width=280*(active?(s.ultimate.until-s.clock)/s.ultimate.activeDuration:s.ultimate.charge/s.ultimate.requiredHits);this.bar.setFillStyle(active?0xff398f:ready?0x63e7ee:0xd74f9b);
  this.aura.clear();this.healing.setVisible(active&&s.ultimate.healRate>0);if(active){this.aura.lineStyle(2,color,.55).strokeEllipse(s.player.x,s.player.y+9,52+Math.sin(s.clock/100)*4,65).fillStyle(color,.08).fillEllipse(s.player.x,s.player.y+9,54,67);this.healing.setPosition(s.player.x,s.player.y-45).setText(s.run.health<maxHealth(s.run)?`+${s.ultimate.healRate} VIDA/S`:'VIDA COMPLETA');s.player.setTint(s.ultimate.healRate>0?0xffc5e4:0xff8da9)}else s.player.clearTint();
  const double=s.ultimate.double(s.guns,s.clock)&&!s.survival.executing;this.second.setVisible(double);if(double){const g=s.guns[1-s.active];this.second.setTexture(s.weaponCombat.texture(g));const width=s.weaponCombat.width(g);this.second.setDisplaySize(width,width*this.second.height/this.second.width).setPosition(s.player.x-Math.sin(angle)*9,s.player.y+Math.cos(angle)*9).setRotation(s.weaponCombat.rotation(g,angle)).setFlipY(Math.cos(angle)<0)}
 }
 stop(){this.aura.clear();this.healing.setVisible(false);this.second.setVisible(false);this.scene.player.clearTint()}
}

