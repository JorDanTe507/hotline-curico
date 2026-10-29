import {TILE,COLS,ROWS} from './apartments';

export const ENVIRONMENT_TILES=['slate','lilac','checker','wood','ceramic','blue','red','asphalt','concrete','industrial','brick','wall','steel','grate','worn'] as const;
export const ROOM_MATERIALS=['slate','wood','checker','ceramic','lilac','blue','ceramic','wood','industrial','concrete','red','asphalt'] as const;
export const BLOOD_LIMIT=64,IMPACT_LIMIT=80,AMBIENT_LIGHT_LIMIT=16;
export const actorDepth=(feetY:number)=>10+Math.atan(feetY/(ROWS*TILE))*2/Math.PI;
export interface Furnishing {frame:string;x:number;y:number;w:number;h:number;room:number}
/** Every large furnishing occupies existing type-2 cells, without changing the collision grid. */
export function furnishings():Furnishing[]{
 const plans=[['desk','vending'],['bed','wardrobe'],['counter','machine'],['washer','dryer'],['sofa','table'],['bed','nightstand'],['counter','washer'],['bed','wardrobe'],['machine','barrel'],['container','crate'],['bed','wardrobe'],['car','crate']];
 const vertical=new Set([1,5,7,10,11]);const result:Furnishing[]=[];
 for(let i=0;i<12;i++){const x=(i%4)*10+3,y=Math.floor(i/4)*9+3;
  if(i===6){result.push({frame:'washer',x,y,w:1,h:1,room:i},{frame:'dryer',x:x+1,y,w:1,h:1,room:i},{frame:'shelves',x,y:y+1,w:1,h:1,room:i})}
  else if(vertical.has(i)){result.push({frame:plans[i][0],x,y,w:1,h:2,room:i},{frame:plans[i][1],x:x+1,y,w:1,h:1,room:i})}
  else{result.push({frame:plans[i][0],x,y,w:2,h:1,room:i},{frame:plans[i][1],x,y:y+1,w:1,h:1,room:i})}
 }
 return result;
}
export function materialAt(x:number,y:number){const room=Math.min(2,Math.floor(y/9))*4+Math.min(3,Math.floor(x/10));return ROOM_MATERIALS[room]}
export function solidCells(grid:number[][]){const result:{x:number;y:number}[]=[];for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(grid[y][x]!==0)result.push({x,y});return result}
