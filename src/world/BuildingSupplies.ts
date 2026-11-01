import {FORTUNE} from '../config/fortune';
import {hash,type Chunk,type WorldModel} from './WorldModel';
import {fortuneCandidates} from './FortuneState';
/** Reserved medical IDs do not add new building templates. One roll per building, never per prop. */
export const MEDICAL_SUPPLY_CHANCE:Readonly<Record<string,number>>={hospital:.8,'medical-center':.8,pharmacy:.75,supermarket:.5};
export const medicalSupplyChance=(type?:string)=>MEDICAL_SUPPLY_CHANCE[type??'']??0;
export function buildingMedkits(world:WorldModel,chunk:Chunk){
 const result:{id:string;x:number;y:number;type:string}[]=[],fortune=fortuneCandidates(world,chunk);
 for(const b of chunk.buildings){const chance=b.name?.startsWith('COPEC')?.35:medicalSupplyChance(b.type);if(!chance||b.closed||hash(world.seed+16201,chunk.cx*32+b.x,chunk.cy*32+b.y)/4294967296>=chance)continue;
  const open=(x:number,y:number)=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h&&chunk.cells[y]?.[x]===0;
  const doors=(b.doors??[]).filter(d=>open(d.x,d.y)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{const x=d.x+dx,y=d.y+dy;return !open(x,y)&&(x<b.x||x>=b.x+b.w||y<b.y||y>=b.y+b.h)&&chunk.cells[y]?.[x]===0}));
  const queue=doors.map(d=>[d.x,d.y]),seen=new Set(queue.map(([x,y])=>`${x},${y}`));for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,key=`${xx},${yy}`;if(open(xx,yy)&&!seen.has(key)){seen.add(key);queue.push([xx,yy])}}}
  const points=queue.filter(([x,y])=>x>b.x&&x<b.x+b.w-1&&y>b.y&&y<b.y+b.h-1&&!world.inApartment(chunk.cx*32+x,chunk.cy*32+y)&&!(b.doors??[]).some(d=>Math.hypot(x-d.x,y-d.y)<2)&&!chunk.props.some(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h)&&!fortune.some(p=>Math.hypot(p.x-(chunk.cx*32+x+.5)*48,p.y-(chunk.cy*32+y+.5)*48)<FORTUNE.range+20));
  points.sort(([ax,ay],[bx,by])=>hash(world.seed+16202,chunk.cx*32+ax,chunk.cy*32+ay)-hash(world.seed+16202,chunk.cx*32+bx,chunk.cy*32+by));
  if(points[0]){const [x,y]=points[0];result.push({id:`${chunk.key}:medical:${b.x},${b.y}`,type:b.type!,x:(chunk.cx*32+x+.5)*48,y:(chunk.cy*32+y+.5)*48})}
 }return result;
}
