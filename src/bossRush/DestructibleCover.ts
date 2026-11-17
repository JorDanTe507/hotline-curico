import type Phaser from 'phaser';
import type {Game} from '../scenes/Game';
interface Cover {hp:number;max:number;cells:{x:number;y:number}[];image:Phaser.GameObjects.Image}
/** Only registered Commander props can break; structural walls remain structural. */
export class DestructibleCover {
 private cells=new Map<string,Cover>();
 constructor(private s:Game){}
 register(x:number,y:number,w:number,h:number,image:Phaser.GameObjects.Image){const cover:Cover={hp:120,max:120,image,cells:[]};for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){cover.cells.push({x:i,y:j});this.cells.set(`${i},${j}`,cover)}}
 damage(obstacle:unknown,damage:number){
  const tile=(obstacle as Phaser.GameObjects.GameObject)?.getData?.('world-cell') as {x:number;y:number}|undefined;
  const cover=tile&&this.cells.get(`${tile.x},${tile.y}`);if(!cover||damage<=0)return false;
  cover.hp=Math.max(0,cover.hp-damage);cover.image.setTint(cover.hp>cover.max*.5?0xd9acac:0x97646b);
  if(cover.hp)return true;
  const keys=new Set(cover.cells.map(p=>`${p.x},${p.y}`));
  for(const p of cover.cells){this.cells.delete(`${p.x},${p.y}`);this.s.worldModel.fixedGrid![p.y][p.x]=0;this.s.mapVisuals.impactAt(p.x*48+24,p.y*48+24)}
  for(const body of [...this.s.walls.getChildren()]){const p=body.getData('world-cell');if(!p||!keys.has(`${p.x},${p.y}`))continue;const object=body as Phaser.GameObjects.Rectangle;if(object.body)this.s.physics.world.remove(object.body as Phaser.Physics.Arcade.StaticBody);this.s.walls.remove(object,true,true)}
  this.s.worldModel.collisionRevision++;cover.image.destroy();return true;
 }
}
