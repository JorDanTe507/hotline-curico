import type {Game} from '../scenes/Game';
import {TILE} from '../maps/apartments';
import {actorDepth} from '../maps/environment';

export const RUSH_ROOM_ART = 'rush-room-polish';

type Surface = (x:number,y:number) => string;

const arenaFloor:Record<string,Surface> = {
  '0': () => '0',
  '1': (x,y) => tileHash(x,y)%13===0 ? '1' : '0',
  '2': (x,y) => tileHash(x,y)%13===0 ? '1' : '0',
  '3': (x,y) => x>=12&&x<=16&&y>=7&&y<=8 ? '3' : '2',
  // The grates follow the long edges of the cutting table.
  '4': (x,y) => (y===9||y===12)&&x>=10&&x<=14 ? '3' : '0',
  safe: (x,y) => x>=5&&x<=8&&y>=4&&y<=7 ? '3' : tileHash(x,y)%13===0 ? 'wood-worn' : 'wood',
};

const wear = [0xffffff,0xf5f3f6,0xfaf8fc,0xf0eef2];
const tileHash = (x:number,y:number) => (Math.imul(x+37,73856093)^Math.imul(y+51,19349663))>>>0;

export function drawRoomTiles(s:Game, prefix:string, grid:number[][], surface=arenaFloor[prefix]) {
  for (const [y,row] of grid.entries()) for (const [x,cell] of row.entries()) {
    const hash=tileHash(x,y);
    const px=(x+.5)*TILE,py=(y+.5)*TILE;
    s.add.image(px,py,RUSH_ROOM_ART,`${prefix}-floor-${surface(x,y)}`)
      .setDisplaySize(TILE,TILE).setTint(wear[hash%wear.length]).setDepth(0);
    if(cell!==1)continue;
    const left=row[x-1]===1,right=row[x+1]===1;
    const above=grid[y-1]?.[x]===1,below=grid[y+1]?.[x]===1;
    if(left!==right&&above!==below){
      s.add.image(px,py,RUSH_ROOM_ART,prefix+'-corner').setDisplaySize(TILE,TILE)
        .setFlip(right,above).setDepth(3);
      continue;
    }
    const vertical=(above||below)&&!left&&!right;
    s.add.image(px,py,RUSH_ROOM_ART,`${prefix}-wall-plain`).setDisplaySize(TILE,TILE)
      .setAngle(vertical?90:0).setTint(wear[(hash>>>4)%wear.length]).setDepth(3);
  }
}

export function roomProp(s:Game,frame:string,x:number,y:number,w:number,h:number,depth=actorDepth(y)){
  const image=s.add.image(x,y,RUSH_ROOM_ART,frame).setOrigin(.5,1).setDepth(depth);
  return image.setScale(Math.min(w/image.width,h/image.height));
}
