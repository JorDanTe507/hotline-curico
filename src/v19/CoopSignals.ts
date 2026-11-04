import Phaser from 'phaser';
import type {CoopSession} from './CoopSession';
import {CriticalAlert,CRITICAL_BEAT_INTERVAL} from '../systems/CriticalAlert';
import {maxHealth} from '../systems/HealthCapacity';
import {AudioSystem} from '../systems/AudioSystem';

const color=(id:string)=>id==='cervela'?0xff2244:id==='jordan'?0x34dbff:0x2865ff;
/** World markers use the gameplay camera; danger borders use the fixed HUD camera. */
export class CoopSignals {
 readonly names:Phaser.GameObjects.Text[]=[];
 readonly outlines:Phaser.GameObjects.Image[][]=[];
 readonly arrows:Phaser.GameObjects.Graphics[]=[];
 readonly borders:Phaser.GameObjects.Graphics[]=[];
 readonly alerts=[new CriticalAlert(),new CriticalAlert()];
 order:number[]=[];private intensity=[0,0];private last=0;private nextBeat=0;
 constructor(private session:CoopSession,hud:Phaser.Scene){
  const s=session.host;
  for(let i=0;i<2;i++){
   const a=session.actor(i+1),tint=color(a.character.id);
   this.names.push(s.add.text(0,0,a.character.name,{fontFamily:'monospace',fontSize:13,fontStyle:'bold',color:'#ffffff',stroke:'#'+tint.toString(16).padStart(6,'0'),strokeThickness:4,shadow:{offsetX:1,offsetY:2,color:'#05030a',blur:0,fill:true,stroke:true}}).setOrigin(.5,1).setDepth(40));
   this.outlines.push(Array.from({length:8},()=>s.add.image(0,0,a.player.texture.key).setTintFill(tint).setVisible(false)));
   this.arrows.push(s.add.graphics().setDepth(39));
   this.borders.push(hud.add.graphics().setDepth(90));
  }
 }
 update(visible:boolean){
  const session=this.session,s=session.host,dt=Math.min(50,Math.max(0,s.clock-this.last));this.last=s.clock;
  const critical=this.alerts.map((alert,i)=>{const a=session.actor(i+1);return alert.update(session.incapacitated(i+1)?0:a.run.health,maxHealth(a.run),s.clock).active});
  this.order=this.order.filter(i=>critical[i]||this.intensity[i]>0);for(let i=0;i<2;i++)if(critical[i]&&!this.order.includes(i))this.order.push(i);
  for(let i=0;i<2;i++){
   const a=session.actor(i+1),p=a.player,down=session.state(i+1),zoom=s.cameras.main.zoom,tint=color(a.character.id);
   this.names[i].setVisible(visible&&!down.dead).setPosition(Math.round(p.x),Math.round(p.y-p.displayHeight*p.originY-8/zoom)).setScale(1/zoom);
   const outline=visible&&down.until>0&&!down.dead;
   this.outlines[i].forEach((image,k)=>{const angle=k*Math.PI/4;image.setVisible(outline);if(outline)image.setTexture(p.texture.key,p.frame.name).setOrigin(p.originX,p.originY).setScale(p.scaleX,p.scaleY).setRotation(p.rotation).setPosition(p.x+Math.cos(angle)*2/zoom,p.y+Math.sin(angle)*2/zoom).setDepth(p.depth-.01).setAlpha(.75+.2*Math.sin(s.clock/230))});
   const arrow=this.arrows[i];arrow.clear();const other=session.actor(i===0?2:1),fallen=session.state(i===0?2:1);
   if(visible&&!session.incapacitated(i+1)&&fallen.until>0&&!fallen.dead){const angle=Math.atan2(other.player.y-p.y,other.player.x-p.x),x=p.x+Math.cos(angle)*48/zoom,y=p.y+Math.sin(angle)*48/zoom,point=(r:number,t:number)=>({x:x+Math.cos(angle+t)*r/zoom,y:y+Math.sin(angle+t)*r/zoom}),tip=point(11,0),left=point(8,2.3),right=point(8,-2.3);arrow.fillStyle(color(other.character.id),1).lineStyle(2/zoom,0xffffff,.95).fillTriangle(tip.x,tip.y,left.x,left.y,right.x,right.y).strokeTriangle(tip.x,tip.y,left.x,left.y,right.x,right.y)}
   this.intensity[i]=Phaser.Math.Clamp(this.intensity[i]+(critical[i]?dt/220:-dt/320),0,1);const border=this.borders[i];border.clear().setVisible(visible&&this.intensity[i]>0);const rank=this.order.indexOf(i),inset=rank>0?32:2,pulse=.75+.25*(.5+.5*Math.sin(s.clock/190));
   for(let layer=0;layer<7;layer++){const edge=inset+layer*3;border.lineStyle(3,tint,(.48-layer*.055)*this.intensity[i]*pulse).strokeRect(edge,edge,1280-edge*2,720-edge*2)}
  }
  if(!visible||!critical.some(Boolean)){s.sound.stopByKey('sfx-critical');return}
  if(s.clock>=this.nextBeat){this.nextBeat=s.clock+CRITICAL_BEAT_INTERVAL;if(!s.sound.getAll('sfx-critical').some(sound=>sound.isPlaying))AudioSystem.play(s,'critical',.9)}
 }
 destroy(){this.session.host.sound.stopByKey('sfx-critical');for(const item of [...this.names,...this.outlines.flat(),...this.arrows,...this.borders])item.destroy()}
}
