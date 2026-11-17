import type Phaser from 'phaser';
import type {Game} from '../scenes/Game';
interface Cover {hp:number;max:number;cells:{x:number;y:number}[];image:Phaser.GameObjects.Image;axeOnly:boolean;hits:WeakSet<object>}
/** Only explicitly registered props can break; structural walls remain structural. */
export class DestructibleCover {
 private cells=new Map<string,Cover>();
 constructor(private s:Game){}
 register(x:number,y:number,w:number,h:number,image:Phaser.GameObjects.Image,hp=120,axeOnly=false){const cover:Cover={hp,max:hp,image,cells:[],axeOnly,hits:new WeakSet()};for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){cover.cells.push({x:i,y:j});this.cells.set(`${i},${j}`,cover)}}
 between(from:{x:number;y:number},to:{x:number;y:number}){const length=Math.hypot(to.x-from.x,to.y-from.y);for(let d=8;d<length;d+=8){const x=Math.floor((from.x+(to.x-from.x)*d/length)/48),y=Math.floor((from.y+(to.y-from.y)*d/length)/48);if(this.cells.has(`${x},${y}`))return true;if(this.s.worldModel.cell(x,y))return false}return false}
 strike(from:{x:number;y:number},to:{x:number;y:number},range:number,damage:number,token:object){
  const length=Math.hypot(to.x-from.x,to.y-from.y)||1;
  for(const cover of new Set(this.cells.values())){if(!cover.axeOnly||cover.hits.has(token))continue;const xs=cover.cells.map(p=>p.x),ys=cover.cells.map(p=>p.y),x=Math.max(Math.min(...xs)*48,Math.min((Math.max(...xs)+1)*48,from.x)),y=Math.max(Math.min(...ys)*48,Math.min((Math.max(...ys)+1)*48,from.y)),distance=Math.hypot(x-from.x,y-from.y);
   if(distance>range||distance>0&&((x-from.x)*(to.x-from.x)+(y-from.y)*(to.y-from.y))/(distance*length)<.4)continue;cover.hits.add(token);this.hit(cover,damage);return true;
  }return false;
 }
 damage(obstacle:unknown,damage:number){
  const tile=(obstacle as Phaser.GameObjects.GameObject)?.getData?.('world-cell') as {x:number;y:number}|undefined;
  const cover=tile&&this.cells.get(`${tile.x},${tile.y}`);if(!cover||cover.axeOnly||damage<=0)return false;return this.hit(cover,damage);
 }
 private hit(cover:Cover,damage:number){
  cover.hp=Math.max(0,cover.hp-damage);cover.image.setTint(cover.hp>cover.max*.5?0xd9acac:0x97646b);
  if(cover.hp)return true;
  const keys=new Set(cover.cells.map(p=>`${p.x},${p.y}`));
  for(const p of cover.cells){this.cells.delete(`${p.x},${p.y}`);this.s.worldModel.fixedGrid![p.y][p.x]=0;this.s.mapVisuals.impactAt(p.x*48+24,p.y*48+24)}
  for(const body of [...this.s.walls.getChildren()]){const p=body.getData('world-cell');if(!p||!keys.has(`${p.x},${p.y}`))continue;const object=body as Phaser.GameObjects.Rectangle;if(object.body)this.s.physics.world.remove(object.body as Phaser.Physics.Arcade.StaticBody);this.s.walls.remove(object,true,true)}
  this.s.worldModel.collisionRevision++;cover.image.destroy();return true;
 }
}
