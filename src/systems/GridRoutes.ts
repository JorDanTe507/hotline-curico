import {blocked,TILE} from '../maps/apartments';
export interface Point {x:number;y:number}
/** Full four-connected routes. Start/end must be walkable; corners cannot be cut. */
export class GridRoutes {
 private components:number[][];private cache=new Map<string,Point[]>();searches=0;
 constructor(private grid:number[][]){this.components=grid.map(r=>r.map(()=>-1));let id=0;
 for(let y=0;y<grid.length;y++)for(let x=0;x<grid[y].length;x++)if(!blocked(grid,x,y)&&this.components[y][x]<0){const q=[[x,y]];this.components[y][x]=id;for(let i=0;i<q.length;i++){const [cx,cy]=q[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(!blocked(grid,nx,ny)&&this.components[ny][nx]<0){this.components[ny][nx]=id;q.push([nx,ny])}}}id++}}
 canReach(a:Point,b:Point){const ax=Math.floor(a.x/TILE),ay=Math.floor(a.y/TILE),bx=Math.floor(b.x/TILE),by=Math.floor(b.y/TILE);return !blocked(this.grid,ax,ay)&&!blocked(this.grid,bx,by)&&this.components[ay][ax]===this.components[by][bx]}
 route(a:Point,b:Point):Point[]{if(!this.canReach(a,b))return [];const sx=Math.floor(a.x/TILE),sy=Math.floor(a.y/TILE),tx=Math.floor(b.x/TILE),ty=Math.floor(b.y/TILE),key=`${sx},${sy}:${tx},${ty}`;const cached=this.cache.get(key);if(cached)return cached.map(p=>({...p}));this.searches++;
 const q=[[sx,sy]],prev=new Map<string,number[]|null>([[`${sx},${sy}`,null]]);for(let i=0;i<q.length;i++){const [x,y]=q[i];if(x===tx&&y===ty)break;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;if(!blocked(this.grid,nx,ny)&&!prev.has(k)){prev.set(k,[x,y]);q.push([nx,ny])}}}
 const path:Point[]=[];let at:number[]|null=[tx,ty];while(at){path.push({x:at[0]*TILE+TILE/2,y:at[1]*TILE+TILE/2});at=prev.get(at.join(','))??null}path.reverse();if(this.cache.size>=256)this.cache.delete(this.cache.keys().next().value!);this.cache.set(key,path);return path.map(p=>({...p}))}
}
