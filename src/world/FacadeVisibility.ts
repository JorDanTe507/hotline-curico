export interface FacadeRect {x:number;y:number;width:number;height:number}
export function needsFacadeReveal(inside:FacadeRect,visual:FacadeRect,actors:readonly {x:number;y:number}[],revealed=false){const margin=revealed?32:10;return actors.some(p=>{const overlaps=(r:FacadeRect)=>p.x>=r.x-margin&&p.x<=r.x+r.width+margin&&p.y>=r.y-14-margin&&p.y<=r.y+r.height+45+margin;return overlaps(inside)||overlaps(visual)})}
export const fadeFacade=(alpha:number,revealed:boolean,delta:number)=>alpha+((revealed?.13:1)-alpha)*(1-Math.exp(-Math.max(0,Math.min(100,delta))/120));
