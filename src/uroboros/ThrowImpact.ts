/** A scrape parallel to a wall, or moving away from it, is not a throw impact. */
export function directedImpact(from:{x:number;y:number},velocity:{x:number;y:number},wall:{x:number;y:number;width:number;height:number}){
 const x=Math.max(wall.x,Math.min(wall.x+wall.width,from.x))-from.x,y=Math.max(wall.y,Math.min(wall.y+wall.height,from.y))-from.y;
 return x*velocity.x+y*velocity.y>1;
}
