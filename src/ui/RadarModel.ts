export interface RadarPoint {x:number;y:number}
export interface RadarActor extends RadarPoint {id:number;color:number;angle:number;down:boolean}
export interface RadarEnemy extends RadarPoint {boss:boolean}
export const RADAR_RANGE=900;
export const SEARCH_DELAY=15000;
export class RadarSearch {
 private round=-1;private kills=0;private lastKill=0;
 update(now:number,state:{round:number;phase:string;kills:number;plan:{type:string;target:number}}){
  if(this.round!==state.round){this.round=state.round;this.kills=state.kills;this.lastKill=now}
  if(state.kills!==this.kills){this.kills=state.kills;this.lastKill=now}
  if(state.phase!=='combat'){this.lastKill=now;return false}
  const remaining=Math.max(0,state.plan.target-state.kills);
  return state.plan.type!=='SUPERVIVENCIA'&&remaining>=1&&remaining<=4&&now-this.lastKill>=SEARCH_DELAY;
 }
}
export function radarSnapshot(actors:RadarActor[],enemies:RadarEnemy[],search:boolean){
 const active=actors.filter(a=>!a.down),anchor=active.length?active:actors,center=anchor.length?{x:anchor.reduce((n,a)=>n+a.x,0)/anchor.length,y:anchor.reduce((n,a)=>n+a.y,0)/anchor.length}:{x:0,y:0};
 const range=Math.max(RADAR_RANGE,...active.map(a=>Math.hypot(a.x-center.x,a.y-center.y)+180));
 const project=(p:RadarPoint)=>{const dx=(p.x-center.x)/range,dy=(p.y-center.y)/range,length=Math.hypot(dx,dy),scale=length>.9?.9/length:1;return {x:dx*scale,y:dy*scale,edge:length>.9}};
 return {center,range,actors:actors.map(a=>({...a,...project(a)})),enemies:enemies.filter(e=>search||Math.hypot(e.x-center.x,e.y-center.y)<=range*.9).map(e=>({...e,...project(e)}))};
}
