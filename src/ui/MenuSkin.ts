import Phaser from 'phaser';
import {presentationPreferences} from './PresentationPreferences';
export const MENU_INK={background:0x090611,panel:0x180e24,edge:0x713259,pink:0xff398f,cyan:0x80ede9,muted:'#bda9cb'};
export function menuMotion(){return presentationPreferences.animated&&!matchMedia('(prefers-reduced-motion: reduce)').matches}
/** Decorative only. Negative depths keep the existing transactions and input targets intact. */
export function archiveBackdrop(s:Phaser.Scene){
 if(s.children.getByName('archive-backdrop'))return;
 const art=s.add.image(640,360,'menu-city-art').setAlpha(.16).setDepth(-30).setName('archive-backdrop');art.setScale(Math.max(1280/art.width,720/art.height));
 s.add.rectangle(640,360,1280,720,MENU_INK.background,.65).setDepth(-29);
 const g=s.add.graphics().setDepth(-28);g.lineStyle(1,MENU_INK.edge,.22);for(let x=40;x<1280;x+=80)g.lineBetween(x,0,x,720);g.lineStyle(2,MENU_INK.pink,.8).lineBetween(42,15,204,15).lineBetween(1076,705,1238,705);
 if(menuMotion())s.cameras.main.fadeIn(140);
}
export function archivePanel(s:Phaser.Scene,x:number,y:number,w:number,h:number,color=MENU_INK.edge){return s.add.rectangle(x+w/2,y+h/2,w,h,MENU_INK.panel,.94).setStrokeStyle(1,color,.8)}
export function archiveHeading(t:Phaser.GameObjects.Text,size=26){return t.setFontFamily('"Press Start 2P",monospace').setFontSize(size).setColor('#ff64ac')}
export function archiveMeter(s:Phaser.Scene,x:number,y:number,w:number,value:number,color=MENU_INK.pink){const g=s.add.graphics();g.fillStyle(0x38233e).fillRect(x,y,w,8);g.fillStyle(color).fillRect(x,y,w*Phaser.Math.Clamp(value,0,1),8);g.lineStyle(1,color,.5).strokeRect(x,y,w,8);return g}
/** Owner-following decorative plates are destroyed with their text, including daily refreshes. */
export function archiveButton(t:Phaser.GameObjects.Text){t.setPadding(9,6,9,6).setBackgroundColor('#32132d');t.on('pointerover',()=>t.setBackgroundColor('#59203f')).on('pointerout',()=>t.setBackgroundColor('#32132d'));return t}
