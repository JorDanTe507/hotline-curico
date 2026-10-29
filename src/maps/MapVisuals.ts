import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {TILE,COLS,ROWS,rooms,blocked} from './apartments';
import {ENVIRONMENT_TILES,furnishings,materialAt,actorDepth,BLOOD_LIMIT,IMPACT_LIMIT,AMBIENT_LIGHT_LIMIT} from './environment';

export function loadEnvironment(scene:Phaser.Scene){
 scene.load.image('city-tiles','assets/world/tiles.png');
 scene.load.atlas('city','assets/world/city.png','assets/world/city.json');
 scene.load.image('map-tiles','assets/maps/tiles.png');
 scene.load.atlas('environment','assets/maps/environment.png','assets/maps/environment.json');
}
/** Static tile layers and shared atlas; no per-frame texture or physics-body allocation. */
export class MapVisuals {
 readonly map:Phaser.Tilemaps.Tilemap;
 readonly floor:Phaser.Tilemaps.TilemapLayer;
 readonly structure:Phaser.Tilemaps.TilemapLayer;
 readonly objects:Phaser.GameObjects.Image[]=[];
 readonly blood:Phaser.GameObjects.Image[]=[];readonly impacts:Phaser.GameObjects.Image[]=[];
 readonly lights:{image:Phaser.GameObjects.Image;base:number;phase:number}[]=[];
 private stopped=false;private visuals:Phaser.GameObjects.GameObject[]=[];private originVisible=true;
 constructor(private s:Game){
  const previous=new Set(s.children.list);
  this.map=s.make.tilemap({tileWidth:32,tileHeight:32,width:COLS,height:ROWS});
  const tiles=this.map.addTilesetImage('map-tiles','map-tiles',32,32,0,0)!;
  this.floor=this.map.createBlankLayer('Piso',tiles)!.setScale(TILE/32).setDepth(0);
  this.structure=this.map.createBlankLayer('Estructura',tiles)!.setScale(TILE/32).setDepth(3);
  const trim=s.add.graphics().setDepth(3.1);
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
   const room=Math.min(2,Math.floor(y/9))*4+Math.min(3,Math.floor(x/10));
   const corridor=room!==11&&(x%10===1||x%10===9||y%9===1||y%9===8);
   this.floor.putTileAt(ENVIRONMENT_TILES.indexOf(corridor?'slate':materialAt(x,y)),x,y);
   if(s.grid[y][x]===1){
    const exterior=x===0||y===0||x===COLS-1||y===ROWS-1||(room===11&&(x===30||y===18));
    this.structure.putTileAt(ENVIRONMENT_TILES.indexOf(room===11&&x===COLS-1?'grate':exterior?'brick':room>=8?'steel':'wall'),x,y);
    // A top cap with a small lower face, contained entirely inside the solid cell.
    trim.fillStyle(0x10131e,.5).fillRect(x*TILE,(y+1)*TILE-9,TILE,9);
    trim.lineStyle(1,room>=8?0x5d8495:0x8b718a,.6).lineBetween(x*TILE,y*TILE+2,(x+1)*TILE,y*TILE+2);
   }
  }
  for(const p of furnishings()){
   const cx=(p.x+p.w/2)*TILE,cy=(p.y+p.h/2)*TILE,w=p.w*TILE,h=p.h*TILE;
   s.add.rectangle(cx,cy,w,h,0x12131c,.6).setStrokeStyle(1,0x636273,.45).setDepth(4);
   const image=this.image(p.frame,cx,cy,w,h).setDepth(actorDepth((p.y+p.h)*TILE));if(p.frame==='bed'&&(p.room===5||p.room===10))image.setTint(p.room===5?0xa8d6ff:0xebadc6);this.objects.push(image);
  }
  for(let i=0;i<12;i++)this.decorateRoom(i);
  this.thresholds();this.visuals=s.children.list.filter(o=>!previous.has(o));
 }
 private image(frame:string,x:number,y:number,width:number,height:number){
  const image=frame==='car'?this.s.add.image(x,y,`car-${['aveo','spark','lanos'][Math.abs(Math.floor(x+y+this.s.run.seed))%3]}`):this.s.add.image(x,y,'environment',frame);const scale=Math.min(width/image.width,height/image.height);return image.setScale(scale);
 }
 private decorateRoom(i:number){
  const s=this.s,rx=(i%4)*480,ry=Math.floor(i/4)*432,accent=[0x51deef,0xf54a99,0xf0bf74,0x6f9efb][i%4];
  // Room names are in-world wayfinding; never source-atlas category headings.
  s.add.text(rx+65,ry+66,rooms[i],{fontFamily:'monospace',fontSize:12,color:'#d8cddd',stroke:'#11121c',strokeThickness:3}).setAlpha(.78).setDepth(4);
  if([1,5,7,10].includes(i))this.image('rug',rx+310,ry+290,96,96).setAlpha(.65).setDepth(1);
  this.image('trash',rx+360,ry+340,18,18).setAlpha(.7).setRotation(i*.8).setDepth(1.1);
  this.image('plant',rx+24,ry+24,29,37).setDepth(actorDepth(ry+48));
  if(i===4)this.image('vending',rx+360,ry+24,36,38).setDepth(4);
  if(i===4)this.image('graffiti',rx+335,ry+60,70,35).setAlpha(.8).setDepth(4);
  if(i===6)s.add.rectangle(rx+192,ry+148,96,8,0x797684).setDepth(actorDepth(ry+192)+.01);
  if(i===8){this.image('pipes',rx+163,ry+168,55,32).setDepth(actorDepth(ry+192));this.image('graffiti',rx+350,ry+60,70,35).setDepth(4)}
  if(i===9)this.image('barrel',rx+207,ry+168,22,32).setDepth(actorDepth(ry+192));
  if(i===0)this.image('hotel',rx+320,ry+25,95,37).setDepth(4);
  if(i===11){
   // Parking paint is walkable; the car remains over the original solid footprint.
   const paint=s.add.graphics().setDepth(1);paint.lineStyle(2,0xbab2a2,.45).strokeRect(rx+137,ry+136,62,110).strokeRect(rx+276,ry+136,64,110);
   this.image('parking',rx+326,ry+26,27,27).setDepth(4);this.image('graffiti',rx+350,ry+60,68,34).setDepth(4);
   this.image('reflection',rx+305,ry+330,36,72).setTint(accent).setAlpha(.22).setDepth(1.2);
  }
  // Mounted lamps and shallow additive pools avoid dark fullscreen filters.
  this.image('lamp',rx+270,ry+49,35,8).setTint(accent).setDepth(24);
  if(this.lights.length<AMBIENT_LIGHT_LIMIT){
   const light=this.image('light',rx+270,ry+105,245,155).setTint(accent).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.17).setDepth(24);
   this.lights.push({image:light,base:.17,phase:i*1.7});
  }
  if(i===4||i===8){this.image('reflection',rx+270,ry+105,24,65).setTint(accent).setAlpha(.15).setDepth(1.2)}
  // A few permanent environmental stains; combat stains use the bounded round pool below.
  if(i===4||i===8||i===11)this.image('blood-1',rx+330,ry+210,30,30).setRotation(i).setAlpha(.4).setDepth(1.1);
 }
 private thresholds(){
  const s=this.s,g=s.add.graphics().setDepth(3.2);
  for(const y of [9,18])for(const x of [4,14,24,34]){
   g.fillStyle(0x212733).fillRect(x*TILE,y*TILE,2*TILE,TILE);g.lineStyle(2,0x5be0d8,.7).lineBetween(x*TILE+4,y*TILE+24,(x+2)*TILE-4,y*TILE+24);
   g.fillStyle(0x93a4ac).fillRect(x*TILE-4,y*TILE,4,TILE).fillRect((x+2)*TILE,y*TILE,4,TILE);
   this.image('exit',(x+1)*TILE,y*TILE-13,42,21).setDepth(4);
  }
  for(const x of [10,20,30])for(const y of [4,13,22]){
   g.fillStyle(0x212733).fillRect(x*TILE,y*TILE,TILE,2*TILE);g.lineStyle(2,0x5be0d8,.6).lineBetween(x*TILE+24,y*TILE+4,x*TILE+24,(y+2)*TILE-4);
   this.image('door',x*TILE+24,y*TILE-24,30,37).setDepth(4);
  }
 }
 setOriginVisible(visible:boolean){if(visible===this.originVisible)return;this.originVisible=visible;for(const o of this.visuals)if('setVisible' in o)(o as Phaser.GameObjects.Image).setVisible(visible)}
 update(now:number){if(this.stopped)return;for(const light of this.lights)light.image.setAlpha(light.base*(.94+.06*Math.sin(now/190+light.phase)))}
 bloodAt(x:number,y:number){
  if(this.stopped||blocked(this.s.grid,Math.floor(x/TILE),Math.floor(y/TILE)))return;
  const stain=this.image(`blood-${Phaser.Math.Between(0,2)}`,x,y,Phaser.Math.Between(35,52),52).setRotation(Math.random()*Math.PI*2).setAlpha(.72).setDepth(1.6);
  this.blood.push(stain);if(this.blood.length>BLOOD_LIMIT)this.blood.shift()!.destroy();
 }
 impactAt(x:number,y:number){
  if(this.stopped)return;
  // Find the actual solid tile next to a collision contact; no mark on open floor/range expiry.
  let point:{x:number;y:number}|undefined;
  for(const [dx,dy] of [[0,0],[9,0],[-9,0],[0,9],[0,-9]]){const tx=Math.floor((x+dx)/TILE),ty=Math.floor((y+dy)/TILE);if(this.s.grid[ty][tx]!==0){point={x:Phaser.Math.Clamp(x,tx*TILE+5,(tx+1)*TILE-5),y:Phaser.Math.Clamp(y,ty*TILE+5,(ty+1)*TILE-5)};break}}
  if(!point)return;
  const mark=this.image('impact',point.x,point.y,12,12).setAlpha(.55).setRotation(Math.random()*6.28).setDepth(12.5);
  this.impacts.push(mark);if(this.impacts.length>IMPACT_LIMIT)this.impacts.shift()!.destroy();
 }
 beginRound(){for(const stain of this.blood)stain.destroy();this.blood.length=0;for(const mark of this.impacts)mark.destroy();this.impacts.length=0}
 stop(){if(this.stopped)return;this.stopped=true;this.beginRound();for(const light of this.lights)light.image.destroy();this.lights.length=0;this.objects.length=0;this.map.destroy()}
}
