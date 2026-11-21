import type {Point} from './GridRoutes';

/** Bounded search through corridors that fit the boss. If the player is in a
 * smaller room, finish at the closest accessible cell and guard the entrance. */
export function pursuitRoute(start:Point,goal:Point,fits:(x:number,y:number)=>boolean){
 const tile=48, sx=Math.floor(start.x/tile),sy=Math.floor(start.y/tile);
 const gx=Math.floor(goal.x/tile),gy=Math.floor(goal.y/tile);
 const nodes=[{x:sx,y:sy,parent:-1}], visited=new Set([sx+','+sy]);
 let best=0,remaining=Math.hypot(sx-gx,sy-gy);
 for(let i=0;i<nodes.length&&i<2400&&remaining>0;i++){
  const from=nodes[i];
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=from.x+dx,y=from.y+dy,key=x+','+y;
   if(visited.has(key))continue;
   visited.add(key);
   if(!fits(x*tile+24,y*tile+24))continue;
   nodes.push({x,y,parent:i});
   const distance=Math.hypot(x-gx,y-gy);
   if(distance<remaining){remaining=distance;best=nodes.length-1}
  }
 }
 const path:Point[]=[];
 for(let i=best;i>0;i=nodes[i].parent)path.push({x:nodes[i].x*tile+24,y:nodes[i].y*tile+24});
 return path.reverse();
}
