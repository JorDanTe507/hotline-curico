export interface HudCamera {scrollX:number;scrollY:number;width:number;height:number;zoom:number}
export interface HudActor {x:number;y:number;displayHeight:number}
/** Coordinates in the camera's viewport, shared by canvas and DOM HUDs. */
export function actorScreenTop(actor:HudActor,camera:HudCamera){return (actor.y-actor.displayHeight*.65-camera.scrollY-camera.height/2)*camera.zoom+camera.height/2}
export function hudOcclusion(actors:readonly HudActor[],camera:HudCamera,top:number,bottom:number){
 return actors.some(a=>{const y=actorScreenTop(a,camera),feet=y+a.displayHeight*camera.zoom;return feet>top-12&&y<bottom+16})?.16:1;
}
