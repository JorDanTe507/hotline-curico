export const TILE=48,COLS=40,ROWS=28;
export const rooms=['RECEPCIÓN','DORMITORIO 01','COCINA','BAÑOS','SALA COMÚN','DORMITORIO 02','LAVANDERÍA','DORMITORIO 03','MANTENIMIENTO','BODEGA','DORMITORIO 04','PATIO / ESTACIONAMIENTO'];
export function createMap(){const grid:number[][]=Array.from({length:ROWS},(_,y)=>Array.from({length:COLS},(_,x)=>x===0||y===0||x===COLS-1||y===ROWS-1?1:0));
for(const x of [10,20,30])for(let y=1;y<ROWS-1;y++)if(![4,5,13,14,22,23].includes(y))grid[y][x]=1;
for(const y of [9,18])for(let x=1;x<COLS-1;x++)if(![4,5,14,15,24,25,34,35].includes(x))grid[y][x]=1;
for(let ry=0;ry<3;ry++)for(let rx=0;rx<4;rx++){const x=rx*10+3,y=ry*9+3;grid[y][x]=2;grid[y][x+1]=2;grid[y+1][x]=2;}
return grid;}
export const blocked=(grid:number[][],x:number,y:number)=>!grid[y]||grid[y][x]!==0;
export function pathStep(grid:number[][],sx:number,sy:number,tx:number,ty:number){const queue=[[sx,sy]],seen=new Set([`${sx},${sy}`]),prev=new Map<string,number[]>();let end:number[]|undefined;
for(let i=0;i<queue.length;i++){const [x,y]=queue[i];if(x===tx&&y===ty){end=[x,y];break}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;if(!blocked(grid,nx,ny)&&!seen.has(k)){seen.add(k);prev.set(k,[x,y]);queue.push([nx,ny]);}}}
if(!end)return null;while(true){const p=prev.get(end.join(','));if(!p||p[0]===sx&&p[1]===sy)return end;end=p;}}

