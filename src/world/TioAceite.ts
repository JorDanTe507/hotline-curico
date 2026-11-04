import {actorDepth} from '../maps/environment';
import {achievements} from '../systems/Achievements';
import type Phaser from 'phaser';import type {Game} from '../scenes/Game';import {ACEITE} from '../config/aceite';import {maxHealth} from '../systems/HealthCapacity';import {inputHub} from '../input/InputHub';
export class TioAceite {
 private round=0;private retryAt=0;private body?:Phaser.GameObjects.Rectangle;private occupied:{x:number;y:number}[]=[];
 private stalls=new Map<string,{x:number;y:number;image:Phaser.GameObjects.Image;until:number}>();private purchases=new Map<string,number>();private panel:Phaser.GameObjects.Container;private line:Phaser.GameObjects.Text;private portrait:Phaser.GameObjects.Image;private until=0;
 constructor(private s:Game){const bg=s.add.rectangle(640,530,700,150,0x0d1824,.95).setStrokeStyle(2,0xffd366);this.portrait=s.add.image(360,530,'aceite-portrait-0').setDisplaySize(120,120);this.line=s.add.text(450,485,'',{fontFamily:'monospace',fontSize:21,color:'#ffe6ad',wordWrap:{width:510}});this.panel=s.add.container(0,0,[bg,this.portrait,this.line]).setScrollFactor(0).setDepth(98).setVisible(false)}
 /** One live stall per round, owned by the run rather than a streamed chunk. */
 beginRound(){this.clearStall();this.round=this.s.run.round;this.retryAt=0;this.ensureStall()}
 private clearStall(){for(const p of this.stalls.values())p.image.destroy();this.stalls.clear();this.purchases.clear();if(this.body){if(this.s.walls.children)this.s.walls.remove(this.body,true,true);else this.body.destroy();this.body=undefined}for(const p of this.occupied)this.s.worldModel.setDynamicSolid(p.x,p.y,false);this.occupied=[];this.hide()}
 private ensureStall(){const s=this.s;if(this.stalls.size||s.clock<this.retryAt)return;this.retryAt=s.clock+ACEITE.spawnRetryMs;
  const px=Math.floor(s.player.x/48),py=Math.floor(s.player.y/48);
  for(let r=4;r<=ACEITE.spawnSearchTiles;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
   if(Math.abs(dx)!==r&&Math.abs(dy)!==r)continue;const tx=px+dx,ty=py+dy,x=tx*48+24,y=ty*48+24;
   let valid=true;for(let yy=ty-1;yy<=ty+3&&valid;yy++)for(let xx=tx-2;xx<=tx+2;xx++){
    const chunk=s.worldModel.chunk(Math.floor(xx/32),Math.floor(yy/32));
    if(s.worldModel.cell(xx,yy)||s.worldModel.inApartment(xx,yy)||chunk.buildings.some(b=>xx>=chunk.cx*32+b.x&&xx<chunk.cx*32+b.x+b.w&&yy>=chunk.cy*32+b.y&&yy<chunk.cy*32+b.y+b.h)||s.fortune.occupied(xx*48+24,yy*48+24,40)||s.fortune.ledger.load(s.worldModel,chunk).some(p=>Math.hypot(p.x-(xx*48+24),p.y-(yy*48+24))<55)){valid=false;break}
   }
   if(!valid||!s.navigation.canReach(s.player.body!.center,{x,y:y+96}))continue;
   const cells=[];for(let yy=ty-1;yy<=ty+1;yy++)for(let xx=tx-1;xx<=tx+1;xx++){cells.push({x:xx,y:yy});s.worldModel.setDynamicSolid(xx,yy,true)}
   if(!s.navigation.routes.route(s.player.body!.center,{x,y:y+96}).length){for(const p of cells)s.worldModel.setDynamicSolid(p.x,p.y,false);continue}
   this.occupied=cells;this.body=s.add.rectangle(x,y,144,144,0,0);s.walls.add(this.body);const image=s.add.image(x,y,'aceite-0');image.setScale(Math.min(144/image.width,144/image.height)).setDepth(actorDepth(y+72));this.stalls.set('round-'+this.round,{x,y,image,until:0});return;
  }
 }
 occupies(x:number,y:number,radius=160){return [...this.stalls.values()].some(p=>Math.hypot(p.x-x,p.y-y)<radius)}
 nearest(){return [...this.stalls.entries()].find(([,p])=>p.image.active&&Math.hypot(this.s.player.x-p.x,this.s.player.y-(p.y+96))<ACEITE.interactionRange&&this.s.lineClear(this.s.player.x,this.s.player.y,p.x,p.y+96))}
 interact(){const match=this.nearest();if(!match)return false;const [key,p]=match,s=this.s,used=this.purchases.get(key)??0;let message='¡Ya estás listo, sobrino!';if(s.run.health<maxHealth(s.run)){if(used>=ACEITE.limitPerStall)message='Por ahora se acabaron las porciones, sobrino.';else{s.run.health=Math.min(maxHealth(s.run),s.run.health+ACEITE.heal);achievements().event({type:'heal',method:'aceite'});this.purchases.set(key,used+1);p.until=s.clock+1500;message=`Come algo, sobrino. +${ACEITE.heal} HP\nPrueba gratuita · ${used+1}/${ACEITE.limitPerStall} por puesto`;s.combatHud.update()}}this.line.setText('TÍO ACEITE\n'+message);this.until=s.clock+2200;this.panel.setVisible(true);return true}
 update(){this.ensureStall();for(const [key,p] of this.stalls){if(!p.image.active){this.stalls.delete(key);continue}const preparing=p.until>this.s.clock;const frame=preparing?(p.until-this.s.clock>700?1:2):Math.floor(this.s.clock/1200)%2;p.image.setTexture(`aceite-${frame}`)}this.portrait.setTexture(`aceite-portrait-${Math.floor(this.s.clock/250)%2}`);this.panel.setVisible(this.s.clock<this.until&&!this.s.paused&&!this.s.ended);const near=this.nearest();if(near)this.s.hint.setText(`${inputHub(this.s.game).last==='gamepad'?'[×]':'[E]'} TÍO ACEITE · COMIDA (PRUEBA GRATUITA)`)}
 hide(){this.until=0;this.panel.setVisible(false)}
 stop(){this.clearStall()}
}
