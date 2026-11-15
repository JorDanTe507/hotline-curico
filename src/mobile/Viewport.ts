export interface ViewportBounds {width:number;height:number;left:number;top:number}
/** Visual viewport includes browser bars and offsets; desktop keeps its layout viewport. */
export function viewportBounds(width:number,height:number,visual?:Partial<ViewportBounds>):ViewportBounds {
 const positive=(v:unknown,fallback:number)=>typeof v==='number'&&Number.isFinite(v)&&v>0?v:fallback;
 const offset=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,v):0;
 return {width:positive(visual?.width,width),height:positive(visual?.height,height),left:offset(visual?.left),top:offset(visual?.top)};
}
export function currentViewport():ViewportBounds {const v=window.visualViewport;return viewportBounds(window.innerWidth,window.innerHeight,v?{width:v.width,height:v.height,left:v.offsetLeft,top:v.offsetTop}:undefined)}
