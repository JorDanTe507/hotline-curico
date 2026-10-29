import {developerSession} from '../systems/DeveloperSession';
import Phaser from 'phaser';
import {text} from './Menu';
import {characterById} from '../characters/catalog';
import {PERMANENT,upgradeCost,type PermanentCharacter} from '../config/permanent';
import {permanentProgress} from '../systems/PermanentProgress';
import {AudioSystem} from '../systems/AudioSystem';
export class Upgrades extends Phaser.Scene {
 get progress(){return permanentProgress()}selected:PermanentCharacter='cervela';private parts:Phaser.GameObjects.GameObject[]=[];private buying=false;
 constructor(){super('Upgrades')}
 create(){this.cameras.main.setBackgroundColor('#090610');this.draw();const back=()=>this.scene.start('Menu');this.input.keyboard!.on('keydown-ESC',back);this.events.once('shutdown',()=>this.input.keyboard!.off('keydown-ESC',back))}
 private draw(){for(const part of this.parts)part.destroy();this.parts=[];const add=<T extends Phaser.GameObjects.GameObject>(p:T)=>{this.parts.push(p);return p},progress=this.progress,id=this.selected,c=characterById(id),color=id==='cervela'?0xff2878:0xc43cff;
 if(developerSession.active)add(text(this,720,80,'PRUEBA · NO SE GUARDA',16,'#ffdc77'));add(text(this,42,28,'MEJORAS',38,'#ff3289'));add(text(this,1020,38,`${progress.data.currency} HC`,25,'#ffe57c'));
 for(const [i,who] of (['cervela','nicolas'] as const).entries()){const tab=add(text(this,42+i*170,100,who.toUpperCase(),23,who===id?'#ffffff':'#9c729e')).setInteractive({useHandCursor:true});tab.on('pointerdown',()=>{this.selected=who;this.draw()})}
 const portrait=add(this.add.image(175,370,c.selectionPortrait.key));portrait.setScale(Math.min(285/portrait.width,435/portrait.height));add(text(this,42,596,c.name,25));add(text(this,42,636,id==='cervela'?'Resistencia, regeneración\ny fuego sostenido':'Velocidad, daño y\nresistencia temporal',16,'#bfa9ca'));
 const texture=this.textures.get('upgrade-atlas');const source=texture.getSourceImage() as HTMLImageElement;
 PERMANENT[id].forEach(([key,name,description,max],i)=>{const x=355+(i%3)*300,y=125+Math.floor(i/3)*174,level=progress.level(id,key),cost=upgradeCost(level),full=level>=max;
 add(this.add.rectangle(x+140,y+78,280,162,0x160b20,.93).setStrokeStyle(1,color,.8));
 const frame=`${id}-${i}`;if(i===6&&!texture.has(frame))texture.add(frame,0,0,0,Math.round(source.width/6),Math.round(source.height/3));if(!texture.has(frame)){const sx=source.width/1774,sy=source.height/887;texture.add(frame,0,Math.round((32+i*290)*sx),Math.round((id==='cervela'?70:505)*sy),Math.round(264*sx),Math.round(210*sy))}
 if(i===6)add(text(this,x+34,y+28,'↻',37,'#78eafa').setOrigin(.5));else add(this.add.image(x+34,y+28,'upgrade-atlas',frame).setDisplaySize(44,35));
 add(text(this,x+65,y+9,name,16,'#ff51aa').setWordWrapWidth(185));add(text(this,x+12,y+53,description,16).setWordWrapWidth(254));add(text(this,x+12,y+94,`NIVEL ${level}/${max}`,15,'#baa5cc'));
 for(let n=0;n<max;n++)add(this.add.rectangle(x+18+n*24,y+119,19,11,n<level?color:0x39263f));
 const box=add(this.add.rectangle(x+140,y+143,252,32,full?0x292031:0x3d1335).setStrokeStyle(1,full?0x665270:color));const label=add(text(this,x+140,y+143,full?'MÁX.':`${cost} HC · COMPRAR`,17,full?'#a58fae':progress.data.currency>=cost?'#ffe57c':'#b9a3bd')).setOrigin(.5);
 if(!full){box.setInteractive({useHandCursor:true});box.on('pointerover',()=>box.setFillStyle(0x5d1c50)).on('pointerout',()=>box.setFillStyle(0x3d1335)).on('pointerdown',()=>{if(this.buying)return;this.buying=true;const success=progress.purchase(id,key);AudioSystem.play(this,success?'reward':'hurt',.5);this.draw();if(success){const flash=this.add.rectangle(x+140,y+78,280,162,color,.35);this.tweens.add({targets:flash,alpha:0,duration:250,onComplete:()=>flash.destroy()})}this.buying=false})}label.disableInteractive();
 });
 const back=add(text(this,1080,675,'← VOLVER',22,'#62eaf0')).setInteractive({useHandCursor:true});back.on('pointerdown',()=>this.scene.start('Menu'));
 if(!progress.persisted)add(text(this,355,660,'Guardado local no disponible: progreso solo en esta sesión.',14,'#ffc47b'));
 }
}
