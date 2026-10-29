import {developerSession} from '../systems/DeveloperSession';
import {streetCell,paintStreet} from './Streets';
import {hash} from './WorldModel';
import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {ENVIRONMENT_TILES,actorDepth} from '../maps/environment';
import {CHUNK_SIZE,WORLD_TILE as T,collisionRects,type Chunk} from './WorldModel';
import {ChunkLootStore} from './ChunkLootStore';
interface Loaded {chunk:Chunk;map:Phaser.Tilemaps.Tilemap;objects:Phaser.GameObjects.GameObject[];bodies:Phaser.GameObjects.Rectangle[]}
const tile=(name:typeof ENVIRONMENT_TILES[number])=>ENVIRONMENT_TILES.indexOf(name);
export class WorldStreamer {
 readonly loaded=new Map<string,Loaded>();private center='';readonly loot:ChunkLootStore;private stopped=false;private groundAt=0;
 constructor(private s:Game){let storage:Storage|undefined;try{if(!developerSession.active)storage=sessionStorage}catch{/* Optional storage. */}this.loot=new ChunkLootStore(s.worldModel.seed,storage)}
 update(x:number,y:number){if(this.stopped)return;const cx=Math.floor(x/CHUNK_SIZE),cy=Math.floor(y/CHUNK_SIZE),key=`${cx},${cy}`;if(key===this.center)return;this.center=key;const wanted=new Set<string>();
  // Load neighbors before removing previous bodies: camera and movement never see a hole.
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const k=`${cx+dx},${cy+dy}`;wanted.add(k);if(!this.loaded.has(k))this.load(cx+dx,cy+dy)}
  for(const k of this.loaded.keys())if(!wanted.has(k))this.unload(k);
  this.sleepDrops();this.s.mapVisuals.setOriginVisible(x>-1200&&x<3120&&y>-900&&y<2250);
 }
 private image(frame:string,x:number,y:number,w:number,h:number,atlas='environment'){const image=['expansion','urban'].includes(atlas)?this.s.add.image(x,y,frame):this.s.add.image(x,y,atlas,frame);image.setScale(Math.min(w/image.width,h/image.height));return image}
 private load(cx:number,cy:number){const s=this.s,chunk=s.worldModel.chunk(cx,cy),ox=cx*CHUNK_SIZE,oy=cy*CHUNK_SIZE,map=s.make.tilemap({tileWidth:32,tileHeight:32,width:32,height:32}),set=map.addTilesetImage('map-tiles','map-tiles',32,32,0,0)!,citySet=map.addTilesetImage('city-tiles','city-tiles',32,32,0,0,100)!,streetSet=map.addTilesetImage('street-tiles','street-tiles',32,32,0,0,200)!,floor=map.createBlankLayer(`floor-${chunk.key}`,[set,citySet,streetSet],ox,oy)!.setScale(1.5).setDepth(-1),walls=map.createBlankLayer(`walls-${chunk.key}`,set,ox,oy)!.setScale(1.5).setDepth(3),objects:Phaser.GameObjects.GameObject[]=[],bodies:Phaser.GameObjects.Rectangle[]=[];
  const paint=s.add.graphics().setDepth(1),decor=s.add.graphics().setDepth(3.1);objects.push(paint,decor);
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){const gx=cx*32+x,gy=cy*32+y;if(s.worldModel.inApartment(gx,gy))continue;
   const {road,side}=streetCell(gx,gy);
   let material=road?'asphalt':side?'concrete':chunk.biome==='plaza'?'lilac':chunk.biome==='industrial'?'concrete':'slate';
   for(const b of chunk.buildings)if(x>b.x&&x<b.x+b.w-1&&y>b.y&&y<b.y+b.h-1)material=b.material??'wood';
   const building=chunk.buildings.find(b=>x>b.x&&x<b.x+b.w-1&&y>b.y&&y<b.y+b.h-1),room=building?.rooms?.find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);if(room&&(room.name==='Baño'||room.name==='Consultorio'))material='ceramic';else if(room&&building?.variant===2)material=building.type==='hotel'?'worn':material;
   floor.putTileAt(road?200+hash(s.run.seed,gx,gy)%2:side?202+hash(s.run.seed,gx,gy)%2:material==='concrete'?103:tile(material as typeof ENVIRONMENT_TILES[number]),x,y);paintStreet(paint,gx,gy,s.run.seed);
   if(chunk.cells[y][x]===1){walls.putTileAt(tile((chunk.buildings.find(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)?.wall??'brick') as typeof ENVIRONMENT_TILES[number]),x,y);decor.fillStyle(0x10131e,.5).fillRect(ox+x*T,oy+(y+1)*T-7,T,7)}

  }
  const solid=chunk.cells.map((row,y)=>row.map((v,x)=>s.worldModel.inApartment(cx*32+x,cy*32+y)?0:v));
  for(const r of collisionRects(solid)){const body=s.add.rectangle(ox+(r.x+r.w/2)*T,oy+(r.y+r.h/2)*T,r.w*T,r.h*T,0,0);s.physics.add.existing(body,true);s.walls.add(body);bodies.push(body)}
  for(const p of chunk.props){const px=ox+(p.x+p.w/2)*T,py=oy+(p.y+p.h/2)*T;if(p.solid!==false)objects.push(s.add.rectangle(px,py,p.w*T,p.h*T,0x11141c,.25).setDepth(4));const propImage=this.image(p.frame,px,py,p.w*T*(p.frame==='car-spark'?.86:1),p.h*T*(p.frame==='car-spark'?.88:1),p.atlas??'environment').setDepth(p.solid===false?2:actorDepth(oy+(p.y+p.h)*T));objects.push(propImage);if(p.frame==='aceite-0')s.tio.register(chunk.key+':'+p.x+','+p.y,px,py,propImage)}
  for(const b of chunk.buildings){const px=ox+(b.x+b.w/2)*T,py=oy+b.y*T+20;
   const facadeColor=b.type==='police'?0x21644e:b.type==='pharmacy'?0x286d65:b.type==='bank'?0x755b38:b.type==='restaurant'?0x8c2945:0x50304d,door=b.doors?.[1];if(door){const left=door.x-1-b.x,right=b.x+b.w-door.x-1;decor.fillStyle(facadeColor,.65).fillRect(ox+b.x*T,oy+b.y*T,left*T,T).fillRect(ox+(door.x+1)*T,oy+b.y*T,right*T,T)}
   objects.push(this.image(`facade-${b.facade??0}`,ox+(b.x+.55)*T,oy+(b.y+.55)*T,46,46,'urban').setDepth(4));
   const color=b.type==='pharmacy'?'#7dff9b':b.type==='police'?'#8cf0bd':b.type==='bank'?'#ffd88a':'#ff7cba';
   objects.push(s.add.text(px,py,b.name??'LOCAL',{fontFamily:'monospace',fontSize:12,color,stroke:'#0c101b',strokeThickness:4}).setOrigin(.5).setDepth(4));
   for(const room of b.rooms??[])objects.push(s.add.text(ox+(room.x+room.w/2)*T,oy+(room.y+room.h-.2)*T,room.name,{fontFamily:'monospace',fontSize:9,color:'#d9cbdc',stroke:'#100d19',strokeThickness:2}).setOrigin(.5).setAlpha(.65).setDepth(4));
  }
  // At most two cheap, static light pools per streamed chunk.
  for(const [lx,ly,color] of [[13,12,chunk.biome==='industrial'?0xffb757:0xff348e],[19,19,chunk.biome==='commercial'?0xff355d:0x4de4ef]].slice(0,s.registry.get('mobileUI')?1:2)){const gx=cx*32+lx,gy=cy*32+ly;if(s.worldModel.inApartment(gx,gy))continue;objects.push(this.image('light',ox+lx*T,oy+ly*T,180,180).setTint(color).setAlpha(.16).setBlendMode(Phaser.BlendModes.ADD).setDepth(24));objects.push(this.image('lamp',ox+lx*T,oy+ly*T-60,24,6).setTint(color).setDepth(24));objects.push(this.image('reflection',ox+lx*T,oy+ly*T+10,24,56).setTint(color).setAlpha(.18).setDepth(1))}
  this.loaded.set(chunk.key,{chunk,map,objects,bodies});for(const d of this.loot.take(chunk.key))s.addDrop(d.x,d.y,d.kind,d.id,d.weapon);
 }
 private sleepDrops(limit=false){const grouped=new Map<string,typeof this.s.drops>();let count=this.s.drops.length;for(const d of [...this.s.drops]){const k=`${Math.floor(d.sprite.x/CHUNK_SIZE)},${Math.floor(d.sprite.y/CHUNK_SIZE)}`;if(this.loaded.has(k)&&(!limit||count<=128||Math.hypot(d.sprite.x-this.s.player.x,d.sprite.y-this.s.player.y)<1100))continue;count--;const list=grouped.get(k)??[];list.push(d);grouped.set(k,list)}for(const [key,list] of grouped){this.loot.save(key,list.map(d=>({x:d.sprite.x,y:d.sprite.y,kind:d.kind,id:d.id,weapon:d.weapon?{...d.weapon}:undefined})));for(const d of list){if(d.ground)this.s.weaponInstances.sleep(d.ground);this.s.removeDrop(d)}}}
 manageGround(){if(this.stopped||this.s.clock<this.groundAt)return;this.groundAt=this.s.clock+1000;this.sleepDrops(true);for(const key of this.loaded.keys()){const dormant=this.loot.take(key),far=typeof dormant==='object'?dormant.filter(d=>Math.hypot(d.x-this.s.player.x,d.y-this.s.player.y)>1000):[];for(const d of dormant)if(!far.includes(d))this.s.addDrop(d.x,d.y,d.kind,d.id,d.weapon);this.loot.save(key,far)}}
 private unload(key:string){const c=this.loaded.get(key);if(!c)return;for(const b of c.bodies){if(b.body)this.s.physics.world.remove(b.body as Phaser.Physics.Arcade.StaticBody);if(this.s.walls.children)this.s.walls.remove(b,true,true);else b.destroy()}for(const o of c.objects)o.destroy();c.map.destroy();this.loaded.delete(key)}
 stop(){this.stopped=true;for(const k of [...this.loaded.keys()])this.unload(k);this.loot.clear()}
}
