export const REQUIEM_ID=9;
export const REQUIEM_PENETRATION_MULTIPLIERS:readonly number[]=[1,.85,.70,.55];

/** Owned by one projectile; damage always derives from the original shot, never compounded. */
export class RequiemPenetration {
 private targets=new WeakSet<object>();
 hits=0;
 constructor(private multipliers:readonly number[]=REQUIEM_PENETRATION_MULTIPLIERS){}
 get exhausted(){return this.hits>=this.multipliers.length}
 has(target:object){return this.targets.has(target)}
 hit(target:object){
  if(this.exhausted||this.targets.has(target))return undefined;
  this.targets.add(target);return this.multipliers[this.hits++];
 }
}

export interface Point {x:number;y:number}
/** Intersection position along a swept projectile segment, including low frame rates. */
export function segmentTargetDistance(a:Point,b:Point,target:Point,radius:number){
 const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
 const along=length?Math.max(0,Math.min(length,((target.x-a.x)*dx+(target.y-a.y)*dy)/length)):0;
 const x=a.x+(length?dx*along/length:0),y=a.y+(length?dy*along/length:0);
 return Math.hypot(target.x-x,target.y-y)<=radius?along:undefined;
}
