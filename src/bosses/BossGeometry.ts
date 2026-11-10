/** Runtime geometry only. Source images, combat statistics and weapon ranges are unchanged. */
export const BOSS_OLD_SCALE=.62;
export const BOSS_VISUAL_SCALE=BOSS_OLD_SCALE*1.35;
export const BOSS_SHAPES=[
 {width:144,height:144,anchorX:72,feet:130,bodyX:49,bodyY:94,bodyW:46,bodyH:36,hitW:70,hitTop:26},
 {width:288,height:128,anchorX:144,feet:116,bodyX:121,bodyY:80,bodyW:46,bodyH:36,hitW:60,hitTop:20},
 {width:288,height:128,anchorX:144,feet:116,bodyX:121,bodyY:80,bodyW:46,bodyH:36,hitW:56,hitTop:24},
 {width:288,height:128,anchorX:144,feet:116,bodyX:121,bodyY:80,bodyW:46,bodyH:36,hitW:54,hitTop:22},
 {width:288,height:128,anchorX:144,feet:116,bodyX:121,bodyY:80,bodyW:46,bodyH:36,hitW:54,hitTop:22},
 {width:112,height:112,anchorX:56,feet:100,bodyX:36,bodyY:70,bodyW:40,bodyH:30,hitW:55,hitTop:27}
] as const;
export interface BossSprite {x:number;y:number;originX:number;originY:number;scaleX:number;scaleY:number;flipX?:boolean}
export function bossOriginY(index:number){const b=BOSS_SHAPES[index];return (b.feet-(b.feet-b.height/2)*BOSS_OLD_SCALE/BOSS_VISUAL_SCALE)/b.height}
export function bossTarget(index:number,s:BossSprite){const b=BOSS_SHAPES[index];return {x:s.x+(b.anchorX-b.width*s.originX)*s.scaleX,y:s.y+((b.hitTop+b.feet)/2-b.height*s.originY)*s.scaleY,rx:b.hitW*Math.abs(s.scaleX)/2,ry:(b.feet-b.hitTop)*Math.abs(s.scaleY)/2}}
export function bossHitAt(index:number,s:BossSprite,x:number,y:number){const b=bossTarget(index,s);return ((x-b.x)/b.rx)**2+((y-b.y)/b.ry)**2<=1}
/** Swept ellipse intersection entry in world pixels; respects Requiem hit ordering. */
export function bossSegmentDistance(index:number,s:BossSprite,a:{x:number;y:number},b:{x:number;y:number}){const e=bossTarget(index,s),x=(a.x-e.x)/e.rx,y=(a.y-e.y)/e.ry,dx=(b.x-a.x)/e.rx,dy=(b.y-a.y)/e.ry,c=x*x+y*y-1;if(c<=0)return 0;const aa=dx*dx+dy*dy;if(!aa)return undefined;const bb=2*(x*dx+y*dy),disc=bb*bb-4*aa*c;if(disc<0)return undefined;const t=(-bb-Math.sqrt(disc))/(2*aa);return t>=0&&t<=1?t*Math.hypot(b.x-a.x,b.y-a.y):undefined}
/** Distance to the receiving silhouette, without increasing an attack's own range. */
export function bossSurfaceDistance(index:number,s:BossSprite,x:number,y:number){const e=bossTarget(index,s),dx=Math.abs(x-e.x),dy=Math.abs(y-e.y);if((dx/e.rx)**2+(dy/e.ry)**2<=1)return 0;let lo=0,hi=Math.max(e.rx,e.ry)*Math.hypot(dx,dy);for(let i=0;i<32;i++){const t=(lo+hi)/2,v=(e.rx*dx/(t+e.rx*e.rx))**2+(e.ry*dy/(t+e.ry*e.ry))**2;if(v>1)lo=t;else hi=t}const t=(lo+hi)/2;return Math.hypot(dx-e.rx*e.rx*dx/(t+e.rx*e.rx),dy-e.ry*e.ry*dy/(t+e.ry*e.ry))}

export function bossAttachmentY(index:number,oldOffset:number){const b=BOSS_SHAPES[index];return (oldOffset/BOSS_OLD_SCALE+b.height/2-b.height*bossOriginY(index))*BOSS_VISUAL_SCALE}
