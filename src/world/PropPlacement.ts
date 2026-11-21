export interface Footprint {x:number;y:number;w:number;h:number}
/** Preserve connections through a small neighborhood, not a detour around the whole block. */
export function preservesLocalPassage(cells:number[][],r:Footprint){
 const minX=Math.max(0,r.x-2),minY=Math.max(0,r.y-2),maxX=Math.min(cells[0].length-1,r.x+r.w+1),maxY=Math.min(cells.length-1,r.y+r.h+1);
 const inside=(x:number,y:number)=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h;
 const label=(placed:boolean)=>{const labels=new Map<string,number>();let component=0;for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const key=`${x},${y}`;if(cells[y][x]||placed&&inside(x,y)||labels.has(key))continue;const queue=[[x,y]];labels.set(key,++component);for(let i=0;i<queue.length;i++){const [a,b]=queue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=a+dx,ny=b+dy,k=`${nx},${ny}`;if(nx<minX||ny<minY||nx>maxX||ny>maxY||cells[ny][nx]||placed&&inside(nx,ny)||labels.has(k))continue;labels.set(k,component);queue.push([nx,ny])}}}return labels};
 const before=label(false),after=label(true),connections=new Map<number,number>();for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){if(x!==minX&&x!==maxX&&y!==minY&&y!==maxY)continue;const key=`${x},${y}`,a=before.get(key),b=after.get(key);if(a===undefined)continue;if(b===undefined)return false;const previous=connections.get(a);if(previous!==undefined&&previous!==b)return false;connections.set(a,b)}return true;
}
