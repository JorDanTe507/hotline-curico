import Phaser from 'phaser';
import {menuMotion} from './MenuSkin';
/** Existing official art only; Jordan deliberately keeps his original portrait. */
export function combatPortrait(id:string,original:string){return id==='cervela'||id==='nicolas'?'dossier-'+id:original}
export function combatDialogueCard(s:Phaser.Scene,portrait:string,intro=false){
 const bg=s.add.rectangle(640,360,1280,720,0x070610,intro?.84:.72);
 const art=s.add.image(640,360,'menu-city-art').setAlpha(intro?.14:.035);art.setScale(Math.max(1280/art.width,720/art.height));
 const card=s.add.rectangle(640,365,1120,418,0x140b20,.88).setStrokeStyle(1,0xa53b73,.9);
 const trim=s.add.graphics();trim.lineStyle(3,0xff398f,.9).lineBetween(84,158,250,158).lineBetween(1030,574,1196,574);trim.lineStyle(1,0x80ede9,.4).lineBetween(435,285,1145,285);
 const facePlate=s.add.rectangle(intro?980:270,355,270,346,0x241128,.7).setStrokeStyle(1,0x713259);
 const face=s.add.image(intro?980:270,355,portrait);
 const name=s.add.text(intro?120:450,228,'',{fontFamily:'"Press Start 2P",monospace',fontSize:22,color:'#ff64ac',wordWrap:{width:intro?680:670}});
 const line=s.add.text(intro?120:450,312,'',{fontFamily:'monospace',fontSize:26,color:'#fff0fa',wordWrap:{width:intro?650:680},lineSpacing:8});
 const help=s.add.text(intro?120:450,523,'ENTER / CLIC / × · COMPLETAR / CONTINUAR →',{fontFamily:'monospace',fontSize:15,color:'#80ede9'});
 // Keep name and dialogue as the first two Text objects for the touch adapter.
 const panel=s.add.container(0,0,[bg,art,card,trim,facePlate,face,name,line,help]).setScrollFactor(0).setDepth(110);
 return {panel,face,name,line,help,enter:()=>{panel.setAlpha(1);if(menuMotion()){panel.setAlpha(0);s.tweens.add({targets:panel,alpha:1,duration:120})}}};
}
