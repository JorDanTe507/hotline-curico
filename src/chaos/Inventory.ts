import {THROWABLES,throwableValid} from './config';
export class ThrowableInventory {
 readonly counts=[0,0,0,0,0];selected=0;
 select(id:number){if(!throwableValid(id))return false;this.selected=id;return true}
 cycle(direction=1){this.selected=(this.selected+direction+5)%5}
 canTake(id:number){return throwableValid(id)&&this.counts[id]<THROWABLES[id].capacity}
 take(id:number){if(!this.canTake(id))return false;this.counts[id]++;return true}
 spend(id=this.selected){if(!throwableValid(id)||this.counts[id]<=0)return false;this.counts[id]--;return true}
}
export interface Point {x:number;y:number}
/** Shared preview/flight clipping. Checks every six pixels, including the destination. */
export function clippedTarget(from:Point,to:Point,range:number,solid:(x:number,y:number)=>boolean){const dx=to.x-from.x,dy=to.y-from.y,length=Math.min(range,Math.hypot(dx,dy)),angle=Math.atan2(dy,dx);let last={...from};for(let d=6;d<=length+6;d+=6){const distance=Math.min(d,length),p={x:from.x+Math.cos(angle)*distance,y:from.y+Math.sin(angle)*distance};if(solid(p.x,p.y))return last;last=p;if(distance===length)break}return last}
