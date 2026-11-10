import type {CharacterId} from '../characters/catalog';
import type Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {actorDepth} from '../maps/environment';
import {drawRoomTiles,roomProp,RUSH_ROOM_ART} from './RoomArt';
import {TILE} from '../maps/apartments';
import {ENTRY, stationGrid} from '../uroboros/Station';

type Cell = readonly [number, number];
type Prop = readonly [x: number, y: number, width: number, height: number, frame: string];
interface Layout {
  width: number; height: number; start: Cell; boss: Cell; exit: Cell;
  walls?: readonly Cell[]; barrels?: readonly Cell[]; props: readonly Prop[]; supplies: readonly Cell[];
}
const arenas: Record<number, Layout> = {
  0: {width: 24, height: 19, start: [11, 16], boss: [11, 6], exit: [11, 17],
    props: [[2,3,2,1,'cover'],[20,3,2,1,'cover'],[10,9,3,2,'detail'],[3,12,2,1,'desk'],[19,12,2,1,'cage']],
    barrels: [[3,5],[20,13]], supplies: [[3,9],[20,9],[15,15]]},
  1: {width: 26, height: 18, start: [12, 15], boss: [12, 4], exit: [12, 16],
    props: [[2,2,2,2,'detail'],[22,2,2,2,'detail'],[6,6,3,1,'cover'],[17,6,3,1,'cover'],
      [4,10,3,1,'parapet'],[19,10,3,1,'crate'],[8,13,3,1,'cover'],[15,13,3,1,'parapet']],
    barrels: [[4,8],[21,8]], supplies: [[4,5],[21,5],[5,14],[20,14]]},
  2: {width: 26, height: 19, start: [12, 16], boss: [12, 6], exit: [12, 17],
    walls: [[5,4],[6,4],[7,4],[18,4],[19,4],[20,4]],
    props: [[11,2,4,2,'container'],[3,8,2,1,'scaffold'],[21,8,2,1,'debris'],[9,10,2,1,'cover'],
      [15,10,2,1,'cover'],[4,13,2,1,'detail'],[20,13,2,1,'cover']],
    barrels: [[7,5],[18,12]], supplies: [[6,7],[19,7],[6,15],[19,15]]},
  3: {width: 30, height: 19, start: [14, 16], boss: [14, 4], exit: [14, 17],
    walls: [[7,4],[7,5],[7,6],[22,4],[22,5],[22,6],[7,12],[7,13],[22,12],[22,13]],
    props: [[3,3,3,2,'console'],[24,3,3,2,'panel'],[12,7,5,2,'detail'],[3,12,3,2,'panel'],
      [24,12,3,2,'console'],[10,12,2,1,'cover'],[18,12,2,1,'cover']],
    barrels: [[5,9],[23,9]], supplies: [[4,7],[25,7],[8,15],[21,15]]},
  4: {width: 25, height: 20, start: [12, 17], boss: [12, 8], exit: [12, 18],
    walls: [[1,1],[23,1],[1,18],[23,18]],
    props: [[2,3,3,2,'cooler'],[6,2,2,2,'crates'],[10,2,3,2,'hooks'],[18,2,2,2,'rack'],
      [21,6,2,3,'detail'],[10,10,5,2,'cover'],[2,9,3,1,'rack'],[19,12,3,1,'rack'],
      [3,14,2,2,'crates'],[18,16,2,2,'crates']],
    barrels: [[3,12],[22,14]], supplies: [[6,6],[18,7],[5,16],[21,15]]},
};
const safe: Layout = {
  width: 16, height: 12, start: [7, 9], boss: [7, 3], exit: [7, 10],
  props: [[1,1,3,2,'safe-window'],[6,1,3,2,'safe-desk'],[11,1,4,2,'safe-bar'],
    [5,4,4,1,'safe-sofa'],[6,6,2,1,'safe-table'],[2,6,2,1,'crate'],
    [11,5,2,1,'crate'],[12,8,2,1,'crate']],
  supplies: [],
};
export const SAFE_ACTOR_POINTS = {cervela:[4,3],nicolas:[7,3],jordan:[13,3]} as const;
export const SAFE_POINTS = {ammo: [2, 7], medkit: [11, 6], armor: [13, 6], weapon: [12, 9], cards: [6, 7], suspend: [9, 9], retire:[10,10]} as const;
export const cellPoint = ([x, y]: Cell) => ({x: (x + .5) * TILE, y: (y + .5) * TILE});

export function rushMap(boss: number, resting: boolean) {
  if (!resting && boss === 5) return {grid: stationGrid(), start: ENTRY, width: 40, height: 28, layout: undefined};
  const layout = resting ? safe : arenas[boss];
  if (!layout) return;
  const {width, height, start, props, walls = []} = layout;
  const grid = Array.from({length: height}, (_, y) =>
    Array.from({length: width}, (_, x): number => +(x === 0 || x === width - 1 || y === 0 || y === height - 1)));
  for (const [x, y] of walls) grid[y][x] = 1;
  for (const [x, y, w, h] of props) for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) grid[y + j][x + i] = 2;
  }
  return {grid, start: cellPoint(start), width, height, layout};
}

export function partnerSpawn(grid:number[][],first:Cell,start:{x:number;y:number},barrels:readonly Cell[]=[]) {
  const origin=cellPoint(first);
  const open=(x:number,y:number)=>!barrels.some(([bx,by])=>Math.abs(x-bx)<=1&&Math.abs(y-by)<=1)&&[-1,0,1].every(dy=>[-1,0,1].every(dx=>grid[y+dy]?.[x+dx]===0));
  const seen=new Set([first.join(',')]), queue:Cell[]=[first];
  for(const [x,y] of queue)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const px=x+dx,py=y+dy,key=px+','+py;
    if(grid[py]?.[px]===0&&!seen.has(key)){seen.add(key);queue.push([px,py]);}
  }
  return queue.map(cell=>({cell,point:cellPoint(cell)})).filter(({cell,point})=>open(...cell)&&
    Math.hypot(point.x-start.x,point.y-start.y)>260&&Math.hypot(point.x-origin.x,point.y-origin.y)>170)
    .sort((a,b)=>Math.hypot(a.point.x-origin.x,a.point.y-origin.y)-Math.hypot(b.point.x-origin.x,b.point.y-origin.y))[0]?.point;
}

export function drawRushMap(s: Game, layout: Layout, boss: number, resting: boolean, actors: Map<CharacterId, Phaser.GameObjects.Sprite>) {
  const prefix=resting?'safe':String(boss);
  drawRoomTiles(s,prefix,s.grid);
  for (const [x,y,w,h,frame] of layout.props) {
    const key=resting?frame==='crate'?'safe-crate':frame:prefix+'-'+frame;
    roomProp(s,key,(x+w/2)*TILE,(y+h)*TILE,w*TILE,(h+.65)*TILE);
  }
  const decor:readonly Prop[] = resting
    ? [[1,4,1,1,'plant'],[12,9,1,1,'wheel'],[6,7,1,1,'upgrade'],[7,0,2,1,'sign'],[12,0,2,1,'lamp']]
    : [[Math.floor(layout.width/2)-1,0,2,1,'sign'],[2,0,2,1,'lamp'],[layout.width-4,0,2,1,'lamp'],
       ...(([[[4,0,1,1,'chains'],[21,1,1,1,'medical']],[[7,0,3,2,'tent']],[],[[9,8,2,1,'cable']],[]] as readonly (readonly Prop[])[])[boss]??[])];
  for(const [x,y,w,h,frame] of decor)roomProp(s,prefix+'-'+frame,(x+w/2)*TILE,(y+h)*TILE,w*TILE,h*TILE,3.4);
  if(!resting){
    const stains = [
      [[3,4,'blood',70,0],[19,4,'blood-small',46,35],[11,10,'blood',100,67],[19,12,'blood-small',66,115],[5,12,'papers',43,0]],
      [],
      [[6,5,'blood',65,40],[21,8,'blood',80,145],[16,11,'blood',72,264]],
      [],
      [[9,9,'blood',62,28],[13,9,'blood-small',69,12],[14,11,'blood',88,62],[11,12,'blood-small',70,112],[5,4,'blood',58,240],[21,9,'blood-small',58,0]],
    ] as const;
    for(const [x,y,frame,size,angle] of stains[boss]??[]){
      const p=cellPoint([x,y]);
      roomProp(s,prefix+'-'+frame,p.x,p.y,size,size,1).setOrigin(.5).setAngle(angle).setAlpha(.82);
    }
  }
  if (resting) addSafeRoomActors(s,actors);
  const p = cellPoint(layout.exit);
  const door = s.add.image(p.x,p.y+17,RUSH_ROOM_ART,prefix+'-gate').setOrigin(.5,1).setDepth(8);
  door.setScale(Math.min(72 / door.width, 72 / door.height));
  return door;
}

function addSafeRoomActors(s: Game, actors: Map<CharacterId, Phaser.GameObjects.Sprite>) {
  const atlas = 'rush-safe-actors';
  for (const [id,x,y,scale] of [['cervela',4.3,3.75,.32],['nicolas',7.62,3.65,.48],['jordan',13.55,1.72,.30]] as const) {
    if (s.character.id === id) continue;
    const key = 'rush-safe-' + id;
    if (!s.anims.exists(key)) s.anims.create({key, frameRate: id==='nicolas'?7:4, repeat:-1,
      repeatDelay:id==='nicolas'?500:1700, frames:Array.from({length:6},(_,i)=>({key:atlas,frame:id+'-'+i}))});
    const sprite = s.add.sprite(x*TILE,y*TILE,atlas,id+'-0').setName(key).setOrigin(.5,1).setScale(scale)
      .setDepth(id==='jordan'?actorDepth(3*TILE)+.02:actorDepth(y*TILE)+.08).play(key);
    if(id==='jordan')roomProp(s,'safe-bar-front',13*TILE,3*TILE,4*TILE,2.65*TILE,actorDepth(3*TILE)+.04);
    actors.set(id,sprite);
  }
}
