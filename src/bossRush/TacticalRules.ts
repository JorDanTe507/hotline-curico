export interface Point {x:number;y:number}
export function regionOf(p:Point,width:number,height:number){return Math.min(2,Math.max(0,Math.floor(p.y/height*3)))*3+Math.min(2,Math.max(0,Math.floor(p.x/width*3)))}
export function shuffle<T>(values:readonly T[],random:()=>number){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
/** Region selection has no player-distance weighting. Travel is checked afterwards. */
export function chooseRefuge(points:readonly Point[],width:number,height:number,recent:readonly number[],evaluate:(p:Point)=>number|undefined,random:()=>number=Math.random){
 const groups=new Map<number,Point[]>();for(const p of points){const r=regionOf(p,width,height),rows=groups.get(r)??[];rows.push(p);groups.set(r,rows)}
 const regions=shuffle([...groups.keys()],random).sort((a,b)=>Number(recent.includes(a))-Number(recent.includes(b)));
 for(const region of regions)for(const point of shuffle(groups.get(region)!,random).slice(0,16)){const travel=evaluate(point);if(travel!==undefined&&Number.isFinite(travel))return {point,region,warning:Math.max(850,Math.ceil(travel+350))}}
}
export function pathDistance(path:readonly Point[],start:Point,end:Point){if(!path.length)return Infinity;let result=Math.hypot(path[0].x-start.x,path[0].y-start.y);for(let i=1;i<path.length;i++)result+=Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y);return result+Math.hypot(end.x-path.at(-1)!.x,end.y-path.at(-1)!.y)}
export function sniperScore(point:Point,origin:Point,target:Point,recent:readonly Point[],exits:number){
 const range=Math.hypot(point.x-target.x,point.y-target.y),travel=Math.hypot(point.x-origin.x,point.y-origin.y);
 if(range<230||range>760||travel<100||exits<2)return -Infinity;
 const delta=Math.abs(Math.atan2(Math.sin(Math.atan2(point.y-target.y,point.x-target.x)-Math.atan2(origin.y-target.y,origin.x-target.x)),Math.cos(Math.atan2(point.y-target.y,point.x-target.x)-Math.atan2(origin.y-target.y,origin.x-target.x))));
 return 220-Math.abs(range-440)*.2+Math.min(delta,Math.PI/2)*100-Math.max(0,travel-550)*.2-recent.reduce((n,p)=>n+(Math.hypot(p.x-point.x,p.y-point.y)<135?220:0),0);
}
