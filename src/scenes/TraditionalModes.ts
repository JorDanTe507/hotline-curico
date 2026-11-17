import Phaser from 'phaser';
import {AudioSystem} from '../systems/AudioSystem';
import {MusicManager} from '../systems/MusicManager';
import {TRADITIONAL_CHOICES} from '../ui/MenuPresentation';
export {TRADITIONAL_CHOICES} from '../ui/MenuPresentation';
export class TraditionalModes extends Phaser.Scene {
 constructor(){super('TraditionalModes')}
 create(){this.cameras.main.setBackgroundColor('#0d0816');MusicManager.get(this.game).menu();this.add.image(640,360,'menu-city-art').setDisplaySize(1280,720).setAlpha(.12);
  this.add.text(60,50,'MODO TRADICIONAL',{fontFamily:'"Press Start 2P",monospace',fontSize:26,color:'#ff58a4'});
  TRADITIONAL_CHOICES.forEach((item,i)=>{const x=350+i*580,locked=item.coop&&!!this.registry.get('mobileUI');const box=this.add.rectangle(x,367,520,482,0x1b1025,.97).setStrokeStyle(2,locked?0x624660:0xc53681);
   for(const [j,id]of (item.coop?['cervela','nicolas']:['cervela']).entries()){const image=this.add.image(x+(item.coop?(j?90:-90):0),265,'dossier-'+id+'-thumb').setDisplaySize(130,130);if(locked)image.setTint(0x736478)}
   this.add.text(x-225,368,item.label,{fontFamily:'"Press Start 2P",monospace',fontSize:item.coop?15:21,color:locked?'#a18d9f':'#ff80bb'});
   this.add.text(x-225,428,item.description,{fontFamily:'monospace',fontSize:24,color:'#e7d0e0',wordWrap:{width:450}});
   this.add.text(x-225,551,locked?'SOLO EN ESCRITORIO':'SELECCIONAR →',{fontFamily:'monospace',fontSize:18,color:locked?'#8c7b8f':'#8ee5e7'});
   if(!locked){const target=this.add.text(x-240,136,item.label,{fixedWidth:480,fixedHeight:470,fontSize:1,color:'#1b1025'}).setAlpha(.001).setInteractive({useHandCursor:true});target.on('menu-focus',()=>box.setStrokeStyle(3,0x8fece9)).on('pointerover',()=>box.setStrokeStyle(3,0x8fece9)).on('pointerout',()=>box.setStrokeStyle(2,0xc53681)).on('pointerdown',()=>this.choose(item.coop))}
  });this.add.text(60,659,'← VOLVER',{fontFamily:'"Press Start 2P",monospace',fontSize:14,color:'#87e6e8'}).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.scene.start('GameModes'));this.add.text(570,665,'FLECHAS / CRUCETA · ENTER / × · ESC / ○',{fontFamily:'monospace',fontSize:16,color:'#b99cb3'});
 }
 choose(coop:boolean){if(coop&&this.registry.get('mobileUI'))return;AudioSystem.play(this,'reward',.4);this.scene.start('CharacterSelect',{coop,fromTraditional:true})}
}
