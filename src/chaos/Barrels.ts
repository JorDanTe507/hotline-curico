import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import type {Chunk} from '../world/WorldModel';
import {hash} from '../world/WorldModel';
import {CHAOS} from './config';
export interface Barrel {id:string;x:number;y:number;chunk:string;variant:number;destroyed:boolean}
export class Barrels {
 readonly ledger=new Map<string,Barrel>();readonly views=new Map<string,Phaser.Physics.Arcade.Image>();private generated=new Set<string>();
 constructor(private s:Game){}
 load(c:Chunk){const s=this.s,valid=(px:number,py:number)=>!s.worldModel.inApartment(Math.floor(px/48),Math.floor(py/48))&&!c.buildings.some(b=>px>=(c.cx*32+b.x-2)*48&&px<(c.cx*32+b.x+b.w+2)*48&&py>=(c.cy*32+b.y-2)*48&&py<(c.cy*32+b.y+b.h+2)*48)&&(s.coop?.livingActors()??[s]).every(a=>Math.hypot(px-a.player.x,py-a.player.y)>=230)&&!s.tio.occupies(px,py,190)&&!s.fortune.occupied(px,py,130)&&s.walkablePoint(px,py,1);
  if(!this.generated.has(c.key)){this.generated.add(c.key);if(hash(s.run.seed+1801,c.cx,c.cy)/4294967296<CHAOS.barrelChance)for(let i=0;i<90;i++){const n=hash(s.run.seed+1810+i,c.cx,c.cy),px=(c.cx*32+3+n%26)*48+24,py=(c.cy*32+3+Math.floor(n/29)%26)*48+24;if(!valid(px,py))continue;this.ledger.set(c.key+':0',{id:c.key+':0',x:px,y:py,chunk:c.key,variant:n%5,destroyed:false});if(n%3===0&&valid(px+96,py))this.ledger.set(c.key+':1',{id:c.key+':1',x:px+96,y:py,chunk:c.key,variant:(n+1)%5,destroyed:false});break}}
  for(const b of this.ledger.values())if(b.chunk===c.key&&!b.destroyed&&!this.views.has(b.id)&&!s.tio.occupies(b.x,b.y,150))this.show(b)
 }
 show(b:Barrel){if(b.destroyed||this.views.has(b.id))return;const s=this.s,im=s.physics.add.staticImage(b.x,b.y,'chaos-barrel-'+b.variant).setDepth(10).setData('chaosBarrel',b.id);im.setScale(Math.min(34/im.width,42/im.height));im.refreshBody();im.body!.setSize(30,36);s.walls.add(im);s.worldModel.setDynamicSolid(Math.floor(b.x/48),Math.floor(b.y/48),true);this.views.set(b.id,im)}
 atObstacle(o:unknown){return this.ledger.get((o as Phaser.GameObjects.GameObject)?.getData?.('chaosBarrel'))}
 atPoint(x:number,y:number){return [...this.ledger.values()].find(b=>!b.destroyed&&this.views.has(b.id)&&Math.floor(b.x/48)===Math.floor(x/48)&&Math.floor(b.y/48)===Math.floor(y/48))}
 removeView(b:Barrel){const im=this.views.get(b.id);if(im){if(im.body)this.s.physics.world.remove(im.body);if(this.s.walls.children)this.s.walls.remove(im,true,true);else im.destroy();this.views.delete(b.id)}this.s.worldModel.setDynamicSolid(Math.floor(b.x/48),Math.floor(b.y/48),false)}
 destroy(b:Barrel){if(b.destroyed)return false;b.destroyed=true;this.removeView(b);return true}
 unload(key:string){for(const b of this.ledger.values())if(b.chunk===key)this.removeView(b)}
 stop(){for(const b of this.ledger.values())this.removeView(b);this.ledger.clear();this.generated.clear()}
}
