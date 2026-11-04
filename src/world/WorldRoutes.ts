import type {Point} from '../systems/GridRoutes';
import {WorldModel,WORLD_TILE as T} from './WorldModel';
interface Node {x:number;y:number;g:number;f:number;parent?:Node}
/** Bounded A*, four-connected. Connected streets are guaranteed by construction. */
export class WorldRoutes {
 searches=0;private cache=new Map<string,Point[]>();
 constructor(private world:WorldModel){}
 canReach(a:Point,b:Point){const path=this.route(a,b),end=path.at(-1);return !!end&&Math.floor(end.x/T)===Math.floor(b.x/T)&&Math.floor(end.y/T)===Math.floor(b.y/T)}
 route(a:Point,b:Point,partial=false):Point[]{const sx=Math.floor(a.x/T),sy=Math.floor(a.y/T),tx=Math.floor(b.x/T),ty=Math.floor(b.y/T);if(this.world.cell(tx,ty)!==0||(!partial&&this.world.cell(sx,sy)!==0))return [];const key=`${this.world.collisionRevision}:${partial}:${sx},${sy}:${tx},${ty}`;const cached=this.cache.get(key);if(cached)return cached.map(p=>({...p}));this.searches++;
  const heap:Node[]=[],best=new Map<string,number>();const push=(n:Node)=>{let i=heap.length;heap.push(n);while(i){const p=(i-1)>>1;if(heap[p].f<=n.f)break;heap[i]=heap[p];i=p}heap[i]=n};
  const pop=()=>{const root=heap[0],last=heap.pop()!;if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c}heap[i]=last}return root};
  const first={x:sx,y:sy,g:0,f:Math.abs(sx-tx)+Math.abs(sy-ty)};push(first);best.set(`${sx},${sy}`,0);let end:Node|undefined,closest:Node=first,expanded=0;
  while(heap.length&&expanded++<6000){const n=pop();if(n.g!==best.get(`${n.x},${n.y}`))continue;if(Math.abs(n.x-tx)+Math.abs(n.y-ty)<Math.abs(closest.x-tx)+Math.abs(closest.y-ty))closest=n;if(n.x===tx&&n.y===ty){end=n;break}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=n.x+dx,y=n.y+dy,k=`${x},${y}`,g=n.g+1;if(x<Math.min(sx,tx)-16||x>Math.max(sx,tx)+16||y<Math.min(sy,ty)-16||y>Math.max(sy,ty)+16||this.world.cell(x,y)!==0||g>=(best.get(k)??Infinity))continue;best.set(k,g);push({x,y,g,f:g+Math.abs(x-tx)+Math.abs(y-ty),parent:n})}}
  // Long pursuits may exhaust a bounded search. Walk a real partial route and replan;
  // never substitute a teleport or claim that the destination was reached.
  if(!end&&partial&&closest!==first)end=closest;
  const path:Point[]=[];while(end){path.push({x:end.x*T+T/2,y:end.y*T+T/2});end=end.parent}path.reverse();if(this.cache.size>=128)this.cache.delete(this.cache.keys().next().value!);this.cache.set(key,path);return path.map(p=>({...p}));
 }
}
