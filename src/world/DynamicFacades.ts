import Phaser from 'phaser';import type {Game} from '../scenes/Game';import type {Chunk} from './WorldModel';import {WORLD_TILE as T,CHUNK_SIZE} from './WorldModel';import {actorDepth} from '../maps/environment';import {needsFacadeReveal,fadeFacade,type FacadeRect} from './FacadeVisibility';
interface Facade {image:Phaser.GameObjects.Image;inside:FacadeRect;visual:FacadeRect;revealed:boolean;hold:number;mask:Phaser.Display.Masks.GeometryMask;shape:Phaser.GameObjects.Graphics}
export class DynamicFacades {
 readonly sectors=new Map<string,Facade[]>();private elapsed=0;
 constructor(private s:Game){s.events.on(Phaser.Scenes.Events.POST_UPDATE,this.update,this)}
 load(chunk:Chunk){const rows:Facade[]=[];for(const b of chunk.buildings){const key=b.urbanKind==='copec'?'v17-copec-facade':b.urbanKind?undefined:`facade-${b.facade??0}`;if(!key||!this.s.textures.exists(key))continue;const x=(chunk.cx*32+b.x)*T,y=(chunk.cy*32+b.y)*T,width=b.w*T,height=b.h*T,source=this.s.textures.get(key).getSourceImage() as HTMLImageElement,scale=Math.min(width/source.width,height/source.height),w=source.width*scale,h=source.height*scale;
   const image=this.s.add.image(x+width/2,y+height,key).setOrigin(.5,1).setScale(scale).setDepth(actorDepth(y+height)+.02).setData('electrical',true),visual={x:x+(width-w)/2,y:y+height-h,width:w,height:h};
   // Existing floor openings stay visibly open; the mask does not introduce entrances.
   const shape=this.s.add.graphics().setVisible(false).fillStyle(0xffffff);const bottom=chunk.cells[b.y+b.h-1],doors=(b.doors??[]).filter(d=>d.y===b.y+b.h-1);let start=b.x,end=b.x+b.w;
   if(doors.length){start=doors[0].x;end=start;while(start>b.x&&bottom[start-1]===0)start--;while(end<b.x+b.w&&bottom[end]===0)end++;shape.fillRect(visual.x,visual.y,w,Math.max(0,visual.height-T));shape.fillRect(visual.x,y+height-T,Math.max(0,(chunk.cx*32+start)*T-visual.x),T);shape.fillRect((chunk.cx*32+end)*T,y+height-T,Math.max(0,visual.x+w-(chunk.cx*32+end)*T),T)}else shape.fillRect(visual.x,visual.y,w,h);
   const mask=shape.createGeometryMask();image.setMask(mask);rows.push({image,inside:{x,y,width,height},visual,revealed:false,hold:0,mask,shape});
  }this.sectors.set(chunk.key,rows)}
 private update(_time:number,delta:number){if(this.s.paused||this.s.ended)return;this.elapsed+=delta;if(this.elapsed<80)return;const dt=this.elapsed;this.elapsed=0;const actors=(this.s.coop?[this.s,this.s.coop.actor(2)]:[this.s]).filter(a=>!this.s.coop?.state(a.playerId).dead).map(a=>({x:a.player.x,y:a.player.y}));
  for(const [key,rows] of this.sectors){const [cx,cy]=key.split(',').map(Number);if(!actors.some(a=>Math.abs(a.x-(cx+.5)*CHUNK_SIZE)<CHUNK_SIZE*1.6&&Math.abs(a.y-(cy+.5)*CHUNK_SIZE)<CHUNK_SIZE*1.6)){for(const row of rows)if(row.image.alpha!==1){row.image.setAlpha(1);row.revealed=false}continue}for(const row of rows){const reveal=needsFacadeReveal(row.inside,row.visual,actors,row.revealed);if(reveal)row.hold=this.s.clock+250;row.revealed=reveal||this.s.clock<row.hold;row.image.setAlpha(fadeFacade(row.image.alpha,row.revealed,dt))}}
 }
 unload(key:string){for(const row of this.sectors.get(key)??[]){row.image.clearMask();row.mask.destroy();row.shape.destroy();row.image.destroy()}this.sectors.delete(key)}
 stop(){this.s.events.off(Phaser.Scenes.Events.POST_UPDATE,this.update,this);for(const key of [...this.sectors.keys()])this.unload(key)}
}
