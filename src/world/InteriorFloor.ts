import {ENVIRONMENT_TILES} from '../maps/environment';
import type {Building} from './WorldModel';
/** A hotel variant changes its layout, never selects a wall/graffiti swatch as a floor. */
export function interiorFloor(b:Building,x:number,y:number){const room=b.rooms?.find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);return room&&(room.name==='Baño'||room.name==='Consultorio')?'ceramic':b.material??'wood'}
export function interiorTile(b:Building,x:number,y:number){const material=interiorFloor(b,x,y);return material==='concrete'?103:ENVIRONMENT_TILES.indexOf(material as typeof ENVIRONMENT_TILES[number])}
