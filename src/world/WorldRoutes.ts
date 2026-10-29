import type {Point} from '../systems/GridRoutes';
import {WorldModel,WORLD_TILE as T} from './WorldModel';
interface Node {x:number;y:number;g:number;f:number;parent?:Node}
/** Bounded A*, four-connected. Connected streets are guaranteed by construction. */
export class WorldRoutes {
 searches=0;private cache=new Map<string,Point[]>();
 constructor(private world:WorldModel){}
 canReach(a:Point,b:Point){return this.world.cell(Math.floor(a.x/T),Math.floor(a.y/T))===0&&this.world.cell(Math.floor(b.x/T),Math.floor(b.y/T))===0}
 route(a:Point,b:Point):Point[]{if(!this.canReach(a,b))return [];const sx=Math.floor(a.x/T),sy=Math.floor(a.y/T),tx=Math.floor(b.x/T),ty=Math.floor(b.y/T),key=`${sx},${sy}:${tx},${ty}`;const cached=this.cache.get(key);if(cached)return cached.map(p=>({...p}));this.searches++;
  const heap:Node[]=[],best=new Map<string,number>();const push=(n:Node)=>{let i=heap.length;heap.push(n);while(i){const p=(i-1)>>1;if(heap[p].f<=n.f)break;heap[i]=heap[p];i=p}heap[i]=n};
  const pop=()=>{const root=heap[0],last=heap.pop()!;if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c}heap[i]=last}return root};
  push({x:sx,y:sy,g:0,f:Math.abs(sx-tx)+Math.abs(sy-ty)});best.set(`${sx},${sy}`,0);let end:Node|undefined,expanded=0;
  while(heap.length&&expanded++<6000){const n=pop();if(n.g!==best.get(`${n.x},${n.y}`))continue;if(n.x===tx&&n.y===ty){end=n;break}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=n.x+dx,y=n.y+dy,k=`${x},${y}`,g=n.g+1;if(x<Math.min(sx,tx)-16||x>Math.max(sx,tx)+16||y<Math.min(sy,ty)-16||y>Math.max(sy,ty)+16||this.world.cell(x,y)!==0||g>=(best.get(k)??Infinity))continue;best.set(k,g);push({x,y,g,f:g+Math.abs(x-tx)+Math.abs(y-ty),parent:n})}}
  const path:Point[]=[];while(end){path.push({x:end.x*T+T/2,y:end.y*T+T/2});end=end.parent}path.reverse();if(this.cache.size>=128)this.cache.delete(this.cache.keys().next().value!);this.cache.set(key,path);return path.map(p=>({...p}));
 }
}
