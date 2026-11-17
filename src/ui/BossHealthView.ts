import Phaser from 'phaser';
import {bossName} from '../bosses/expansion';
import {bossHealthRows,bossHealthTrail,type BossHealthSource} from './BossHealthState';
import {menuMotion} from './MenuSkin';
/** One independent row per living boss; one lifetime for plate, label and fill. */
export class BossHealthView {
 readonly root:Phaser.GameObjects.Container;
 private rows:{root:Phaser.GameObjects.Container;paint:Phaser.GameObjects.Graphics;label:Phaser.GameObjects.Text;source?:BossHealthSource;trail:number;hp:number;flash:number}[]=[];
 private last=0;
 constructor(private scene:Phaser.Scene){this.root=scene.add.container(0,0).setScrollFactor(0).setDepth(96).setName('boss-health-view').setVisible(false)}
 update(foes:readonly BossHealthSource[],visible:boolean,now:number,coop=false){
  const data=bossHealthRows(foes),delta=Math.min(80,Math.max(0,now-this.last));this.last=now;this.root.setVisible(visible&&data.length>0);if(!visible)return;
  while(this.rows.length<data.length){const paint=this.scene.add.graphics(),label=this.scene.add.text(12,7,'',{fontFamily:'monospace',fontSize:14,color:'#ffe1ef',stroke:'#100819',strokeThickness:2}),root=this.scene.add.container(0,0,[paint,label]);this.root.add(root);this.rows.push({root,paint,label,trail:1,hp:0,flash:0})}
  this.rows.forEach((r,i)=>{const b=data[i];r.root.setVisible(!!b);if(!b)return;const w=coop?480:data.length>1?480:650,x=coop?400:data.length>1?100+i%2*500:315,y=coop?280+i*49:142+Math.floor(i/2)*49;
   if(r.source!==b.source){r.source=b.source;r.trail=b.ratio;r.hp=b.health;r.flash=0}
   if(r.hp-b.health>=b.max*.04)r.flash=now+140;r.hp=b.health;r.trail=bossHealthTrail(r.trail,b.ratio,delta,menuMotion());r.root.setPosition(x,y);r.label.setFontSize(coop?12:14).setText(`${bossName(b.id)}   ${Math.ceil(b.health)} / ${Math.ceil(b.max)} HP`);
   const g=r.paint;g.clear().fillStyle(0x10091b,.8).fillRect(0,0,w,44).lineStyle(1,0xa74778,.95).strokeRect(0,0,w,44).fillStyle(0x392137).fillRect(10,28,w-20,9).fillStyle(0xffb788,.6).fillRect(10,28,(w-20)*r.trail,9).fillStyle(menuMotion()&&now<r.flash?0xffc0dc:0xff398f).fillRect(10,28,(w-20)*b.ratio,9);
   g.lineStyle(1,0x160b20,.5);for(let n=1;n<16;n++)g.lineBetween(10+(w-20)*n/16,28,10+(w-20)*n/16,37);g.lineStyle(2,0xff70b4).lineBetween(0,0,28,0).lineBetween(w-28,44,w,44);
  });
 }
}
