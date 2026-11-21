import {CHUNK_SIZE} from './WorldModel';
export interface SectorFocus {x:number;y:number;vx:number;vy:number;halfW:number;halfH:number}
export function nearbySectors(centres:readonly SectorFocus[],loaded:ReadonlyMap<string,unknown>){
 const pending=new Map<string,{cx:number;cy:number;urgent:boolean;distance:number}>();
 for(const {x,y,vx,vy,halfW,halfH} of centres){
  const cx=Math.floor(x/CHUNK_SIZE),cy=Math.floor(y/CHUNK_SIZE);
  for(let j=cy-1;j<=cy+1;j++)for(let i=cx-1;i<=cx+1;i++){
   const key=i+','+j;if(loaded.has(key))continue;
   const ox=(i+.5)*CHUNK_SIZE-x,oy=(j+.5)*CHUNK_SIZE-y;
   const urgent=Math.abs(ox)<=halfW+48+CHUNK_SIZE/2&&Math.abs(oy)<=halfH+48+CHUNK_SIZE/2;
   const distance=Math.hypot(ox-vx*.65,oy-vy*.65),other=pending.get(key);
   pending.set(key,{cx:i,cy:j,urgent:urgent||!!other?.urgent,distance:Math.min(distance,other?.distance??Infinity)});
  }
 }
 return [...pending.values()].sort((a,b)=>Number(b.urgent)-Number(a.urgent)||a.distance-b.distance);
}
