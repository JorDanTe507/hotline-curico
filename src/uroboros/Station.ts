import type {Game} from '../scenes/Game';
import type Phaser from 'phaser';
import {COLS, ROWS, TILE} from '../maps/apartments';
import {actorDepth} from '../maps/environment';
import {fadeFacade, needsFacadeReveal} from '../world/FacadeVisibility';
import {RUSH_ROOM_ART,roomProp} from '../bossRush/RoomArt';
import {UROBOROS_ATLAS} from './assets';

export const point = (x: number, y: number) => ({x: (x + .5) * TILE, y: (y + .5) * TILE});
export const ENTRY = point(18, 24);
export const STATION_EXIT=point(19,26);
export const DIRECTOR_START = point(19, 8);
export const CRATES = [point(5, 4), point(33, 4), point(5, 23)];
const rooms = [
  {x: 2, y: 2, w: 11, h: 8, doors: [6, 7, 10, 11], name: 'OFICINA ABANDONADA'},
  {x: 27, y: 2, w: 11, h: 8, doors: [28, 29, 32, 33], name: 'ARCHIVO POLICIAL'},
  {x: 2, y: 17, w: 11, h: 9, doors: [5, 6, 10, 11], name: 'DEPÓSITO'},
  {x: 27, y: 17, w: 11, h: 9, doors: [28, 29, 33, 34], name: 'CALABOZOS'},
] as const;
const furniture = [
  [4,6,3,'desk'],[9,4,1,'filing'],[30,4,2,'shelf'],[34,6,2,'shelf'],
  [4,20,2,'shelf'],[9,22,1,'filing'],[30,22,2,'bars'],[34,20,2,'bars'],
  [15,12,1,'wall'],[24,12,1,'wall'],[17,18,5,'counter'],[19,3,1,'statue'],
] as const;

export function stationSurface(x:number,y:number) {
  const room = rooms.find(r=>x>r.x&&x<r.x+r.w-1&&y>r.y&&y<r.y+r.h-1);
  if(room===rooms[2])return 'store';
  if(room===rooms[3])return 'cell';
  if(room===rooms[1])return '1';
  if(room===rooms[0])return (x*7+y*13)%11===0?'0':'1';
  // The cross hall stops one tile before the side corridors and the reception.
  if(x>=14&&x<=25&&y>=8&&y<=17)return '3';
  return '0';
}

export function stationGrid() {
  const grid = Array.from({length: ROWS}, (_,y) =>
    Array.from({length: COLS}, (_,x): number => +(x===0||y===0||x===COLS-1||y===ROWS-1)));
  for (const room of rooms) {
    const opening = room.y > 10 ? room.y : room.y + room.h - 1;
    for (let y=room.y;y<room.y+room.h;y++) for (let x=room.x;x<room.x+room.w;x++) {
      if (y===opening && (room.doors as readonly number[]).includes(x)) continue;
      if (y===room.y||y===room.y+room.h-1||x===room.x||x===room.x+room.w-1) grid[y][x]=1;
    }
  }
  for (const [x,y,w] of furniture) for (let i=0;i<w;i++) grid[y][x+i]=2;
  return grid;
}

export function decorateStation(scene: Game) {
  const high: {image: Phaser.GameObjects.Image; x:number;y:number;width:number;height:number; revealed:boolean}[] = [];
  const art = (key:string,x:number,y:number,w:number,h:number,depth:number) =>
    scene.add.image(x,y,UROBOROS_ATLAS,key).setDisplaySize(w,h).setDepth(depth);
  const label = (name:string,x:number,y:number,size=15) =>
    scene.add.text(x,y,name,{fontFamily:'monospace',fontSize:size,color:'#f8d8bd',stroke:'#140a16',strokeThickness:3}).setOrigin(.5).setDepth(4);
  for (const room of rooms) {
    label(room.name,(room.x+room.w/2)*TILE,(room.y+room.h/2)*TILE);
    const y = room.y > 10 ? room.y : room.y+room.h-1;
    for (const x of room.doors) scene.add.rectangle(point(x,y).x,point(x,y).y+18,44,5,0xd3a865,.8).setDepth(1);
  }
  art('emblem',960,680,170,165,.2).setAlpha(.68);
  label(scene.rush?'COMISARÍA DE RACCOON CITY':'COMISARÍA DE CURICÓ',960,scene.rush?64:100,24);
  label('HALL CENTRAL',960,515,19);
  if(!scene.rush){label('SALIDA SELLADA · CONTENCIÓN',960,1266,13);art('door',960,1292,100,72,3.2);}
  else for(const [key,x,y,w,h] of [['window',15,3,65,75],['window',24,3,65,75],['sign',19,2,92,42],['lab',6,20,38,56]] as const)
    roomProp(scene,'station-'+key,point(x,y).x,point(x,y).y,w,h,3.5);
  for (const [x,y,w,key] of furniture) {
    const width=w*TILE-4,height=key==='statue'?79:key==='filing'?64:54;
    const bottom=(y+1)*TILE;
    const frame='station-'+key;
    const image=scene.rush&&scene.textures.get(RUSH_ROOM_ART).has(frame)
      ?roomProp(scene,frame,x*TILE+w*TILE/2,bottom,width,height+24)
      :art(key,x*TILE+w*TILE/2,bottom,width,height,actorDepth(bottom)+.02).setOrigin(.5,1);
    high.push({image,x:x*TILE,y:bottom-height,width,height,revealed:false});
  }
  for (const [i,[x,y]] of [[14,9],[25,9],[14,19],[25,19],[12,4],[27,22]].entries()) {
    const p=point(x,y);
    if(scene.rush&&i<4)roomProp(scene,'station-lamp',p.x,p.y-12,36,18,4);
    else art('lamp',p.x,p.y-22,25,25,4);
    scene.add.ellipse(p.x,p.y,114,88,i%2?0xd63b77:0xf6a94c,.13).setDepth(4);
    art(i%2?'glass':'paper',p.x+50,p.y+12,42,29,.3).setAlpha(.82);
  }
  art('blood',1090,490,65,61,.4);
  art('tentacles',1125,220,78,52,4).setAlpha(.55);
  const update=(_time:number,delta:number)=>{
    const actors=scene.coop?.livingActors().map(a=>a.player)??[scene.player];
    for (const cover of high) {
      cover.revealed=needsFacadeReveal(cover,cover,actors,cover.revealed);
      cover.image.setAlpha(fadeFacade(cover.image.alpha,cover.revealed,delta));
    }
  };
  scene.events.on('postupdate',update);
  scene.events.once('shutdown',()=>scene.events.off('postupdate',update));
}
