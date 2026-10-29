import {inputHub} from '../input/InputHub';
import {maxHealth,healthMultiplier} from '../systems/HealthCapacity';
import {xpRequired} from '../config/progression';
import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {WEAPONS,isMelee} from '../weapons/arsenal';
import {ARMOR_CAPACITY} from '../config/armor';
function label(s:Phaser.Scene,x:number,y:number,value:string,size=17,color='#fff1fa'){
 return s.add.text(x,y,value,{fontFamily:'monospace',fontSize:size,color,stroke:'#130a1d',strokeThickness:3,shadow:{offsetX:1,offsetY:2,color:'#05030a',blur:2,fill:true,stroke:true}}).setScrollFactor(0).setDepth(92)
}
export class CombatHud {
 name:Phaser.GameObjects.Text;weapon:Phaser.GameObjects.Text;round:Phaser.GameObjects.Text;dash:Phaser.GameObjects.Text;boss:Phaser.GameObjects.Text;
 healthBar:Phaser.GameObjects.Rectangle;armorBar:Phaser.GameObjects.Rectangle;dashBar:Phaser.GameObjects.Rectangle;bossBar:Phaser.GameObjects.Rectangle;
 xpLabel:Phaser.GameObjects.Text;xpBar:Phaser.GameObjects.Rectangle;private minigunIcon:Phaser.GameObjects.Image;private armorLabel:Phaser.GameObjects.Text;private enemies:Phaser.GameObjects.Text;
 private mobile=false;private parts:Phaser.GameObjects.GameObject[]=[];
 setMobile(value:boolean){if(this.mobile===value)return;this.mobile=value;for(const p of this.parts)(p as Phaser.GameObjects.Image).setVisible(!value&&!this.s.ended)}
 constructor(private s:Game){const before=new Set(s.children.list);
  this.minigunIcon=s.add.image(444,31,'minigun-hud').setDisplaySize(32,32).setScrollFactor(0).setDepth(92).setVisible(false);
  this.xpLabel=label(s,24,190,'NIVEL 1 · XP 0/100',13,'#98e9b8');s.add.rectangle(24,213,280,5,0x22483b,.25).setOrigin(0,.5).setScrollFactor(0).setDepth(91);this.xpBar=s.add.rectangle(24,213,0,5,0x77efb0).setOrigin(0,.5).setScrollFactor(0).setDepth(92);
  this.name=label(s,110,14,s.character.name+'  ♥ 100',19);
  s.add.rectangle(110,48,180,11,0x9b245d,.18).setOrigin(0,.5).setStrokeStyle(1,0xff76b7,.8).setScrollFactor(0).setDepth(91);
  this.healthBar=s.add.rectangle(110,48,180,7,0xff328d,.95).setOrigin(0,.5).setScrollFactor(0).setDepth(92);
  s.add.rectangle(110,70,180,11,0x11456b,.18).setOrigin(0,.5).setStrokeStyle(1,0x66dfff,.8).setScrollFactor(0).setDepth(91);
  this.armorBar=s.add.rectangle(110,70,0,7,0x23caff,.95).setOrigin(0,.5).setScrollFactor(0).setDepth(92);
  this.armorLabel=label(s,110,84,'CHALECO 0/50',12,'#78eaff');
  this.enemies=label(s,24,108,'ENEMIGOS: 0',16);
  this.round=label(s,24,132,'',16);
  this.weapon=label(s,640,14,'',17).setOrigin(.5,0).setAlign('center');
  this.dash=label(s,1000,17,'DASH LISTO',16,'#5ae8df');
  s.add.rectangle(1000,48,220,4,0x176361,.2).setOrigin(0,.5).setScrollFactor(0).setDepth(91);
  this.dashBar=s.add.rectangle(1000,48,220,4,0x5ae8df).setOrigin(0,.5).setScrollFactor(0).setDepth(92);
  this.boss=label(s,640,113,'',18,'#ff8cb7').setOrigin(.5);
  this.bossBar=s.add.rectangle(330,139,620,8,0xff327d).setOrigin(0,.5).setScrollFactor(0).setDepth(92).setVisible(false);this.parts=s.children.list.filter(o=>!before.has(o));
 }
 update(){const s=this.s,g=s.guns[s.active],w=g?WEAPONS[g.id]:undefined,health=Math.max(0,s.run.health),armor=Math.max(0,s.run.armor);
  this.xpLabel.setText(`NIVEL ${s.run.level} · XP ${s.run.xp}/${xpRequired(s.run.level)}`);this.xpBar.width=280*s.run.xp/xpRequired(s.run.level);this.minigunIcon.setVisible(g?.id===7);this.name.setText(`${s.character.name}  ♥ ${Math.ceil(health)}/${maxHealth(s.run)} HP`);this.healthBar.width=180*health/maxHealth(s.run);this.healthBar.setFillStyle(healthMultiplier(s.run)>1?0x6c99ff:health>0&&health<=maxHealth(s.run)*.25?0xff173f:0xff328d);this.armorBar.width=180*armor/s.run.stats.maxArmor;this.armorLabel.setText(`CHALECO ${Math.ceil(armor)}/${s.run.stats.maxArmor}${s.perks.temporaryArmor?` +${Math.ceil(s.perks.temporaryArmor)} TEMP`:""}`);
  this.enemies.setText(`ENEMIGOS: ${s.foes.length}`);this.round.setText(s.rounds.label);
  if(g)this.minigunIcon.setVisible(true).setTexture(g.id===7?'minigun-hud':g.id>=8?`weapon-${g.id}-hud`:`weapon-${g.id}`);this.weapon.setText(`${w?w.name.toUpperCase():'DESARMADO'}  ${g?(isMelee(g.id)?'CUERPO A CUERPO':s.ultimate.active(s.clock)&&s.ultimate.infiniteAmmo?'∞':(g.id===12?'FUEL ':'')+g.ammo+'/'+g.reserve):'—'}${s.reloadAt?' · RECARGANDO':''}\nBOTIQUINES: ${s.run.medkits}/2 ${inputHub(s.game).last==='gamepad'?'[SHARE]   [R1]':'[F]   [Q]'} ARMA ${s.guns.length?s.active+1:0}/${s.guns.length}`);
  this.minigunIcon.setPosition(640-this.weapon.width/2-24,31);
  this.dash.setText(s.clock>=s.dash.readyAt?'DASH LISTO':'DASH RECARGANDO');this.dashBar.width=220*s.dash.progress(s.clock);
  const boss=s.foes.find(e=>e.boss>=0);this.boss.setText(boss?`EL TORTURADO — ${Math.ceil(boss.hp)}/${boss.max} HP`:'');this.bossBar.setVisible(!!boss);if(boss)this.bossBar.width=620*boss.hp/boss.max;if(this.mobile)for(const p of this.parts)(p as Phaser.GameObjects.Image).setVisible(false);
 }
}


