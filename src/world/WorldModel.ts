import {zoneChoice,type UrbanZone} from './UrbanZones';
import {templateFor,type BuildingType} from './BuildingTemplates';
import {createMap,COLS,ROWS} from '../maps/apartments';
export const CHUNK_TILES=32,WORLD_TILE=48,CHUNK_SIZE=CHUNK_TILES*WORLD_TILE;
export type Biome='residential'|'commercial'|'plaza'|'industrial';
export interface WorldProp {frame:string;x:number;y:number;w:number;h:number;solid?:boolean;atlas?:'city'|'environment'|'expansion'|'urban'|'urban17'}
export interface Building {urbanKind?:UrbanZone['kind'];closed?:boolean;x:number;y:number;w:number;h:number;type?:BuildingType;name?:string;facade?:number;variant?:number;material?:string;wall?:string;rooms?:{name:string;x:number;y:number;w:number;h:number}[];doors?:{x:number;y:number}[]}
export interface Chunk {key:string;cx:number;cy:number;biome:Biome;cells:number[][];props:WorldProp[];buildings:Building[];zones?:UrbanZone[]}
export function hash(seed:number,x:number,y:number){let n=(seed^Math.imul(x,374761393)^Math.imul(y,668265263))>>>0;n=Math.imul(n^(n>>>13),1274126177);return (n^(n>>>16))>>>0}
export class WorldModel {
 readonly dynamicSolids=new Set<string>();collisionRevision=0;
 setDynamicSolid(x:number,y:number,solid:boolean){const key=`${x},${y}`,before=this.dynamicSolids.has(key);if(solid)this.dynamicSolids.add(key);else this.dynamicSolids.delete(key);if(before!==solid)this.collisionRevision++}
 readonly grid:number[][];readonly apartment=createMap();readonly cache=new Map<string,Chunk>();generated=0;
 constructor(readonly seed:number){
  for(const x of [14,15,16,17]){this.apartment[0][x]=0;this.apartment[27][x]=0}for(const y of [13,14,15,16,17]){this.apartment[y][0]=0;this.apartment[y][39]=0}
  const rows=new Map<number,number[]>();const row=(y:number)=>{let r=rows.get(y);if(!r){r=new Proxy(Array(COLS).fill(0),{get:(a,k)=>typeof k==='string'&&/^-?\d+$/.test(k)?this.cell(Number(k),y):Reflect.get(a,k)});if(rows.size>128)rows.delete(rows.keys().next().value!);rows.set(y,r)}return r};
  this.grid=new Proxy(Array.from({length:ROWS},(_,y)=>row(y)),{get:(a,k)=>typeof k==='string'&&/^-?\d+$/.test(k)?row(Number(k)):Reflect.get(a,k)});
 }
 inApartment(x:number,y:number){return x>=0&&y>=0&&x<COLS&&y<ROWS}
 biome(cx:number,cy:number):Biome{const distance=Math.max(Math.abs(cx),Math.abs(cy));if(distance<=1)return 'residential';if(cx>=4&&Math.abs(cy)<=2)return 'industrial';if(distance>=4&&hash(this.seed,Math.floor(cx/3),Math.floor(cy/3))%3!==0)return 'industrial';return (['commercial','plaza','residential'] as Biome[])[hash(this.seed,Math.floor(cx/3),Math.floor(cy/3))%3]}
 cell(x:number,y:number){if(this.dynamicSolids.has(`${x},${y}`))return 1;if(this.inApartment(x,y))return this.apartment[y][x];const cx=Math.floor(x/32),cy=Math.floor(y/32);return this.chunk(cx,cy).cells[y-cy*32][x-cx*32]}
 chunk(cx:number,cy:number){const key=`${cx},${cy}`,cached=this.cache.get(key);if(cached){this.cache.delete(key);this.cache.set(key,cached);return cached}const chunk=this.generate(cx,cy);this.generated++;if(this.cache.size>=64)this.cache.delete(this.cache.keys().next().value!);this.cache.set(key,chunk);return chunk}
 private generate(cx:number,cy:number):Chunk{
  const biome=this.biome(cx,cy),cells=Array.from({length:32},()=>Array(32).fill(0)),props:WorldProp[]=[],buildings:Building[]=[],zones:UrbanZone[]=[],baseX=cx*32,baseY=cy*32;
  const touchesApartment=(x:number,y:number,w:number,h:number)=>baseX+x<COLS+1&&baseX+x+w>-1&&baseY+y<ROWS+1&&baseY+y+h>-1;
  const reserved:{x:number;y:number;w:number;h:number}[]=[];
  const overlap=(a:{x:number;y:number;w:number;h:number},b:{x:number;y:number;w:number;h:number})=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const connected=()=>{const seen=new Set<number>(),queue=[0];seen.add(0);for(let k=0;k<queue.length;k++){const n=queue[k],x=n%32,y=Math.floor(n/32);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=ny*32+nx;if(nx>=0&&ny>=0&&nx<32&&ny<32&&!cells[ny][nx]&&!seen.has(key)){seen.add(key);queue.push(key)}}}return seen.size===cells.flat().filter(c=>c===0).length};
  const free=(r:{x:number;y:number;w:number;h:number})=>r.x>=1&&r.y>=1&&r.x+r.w<=31&&r.y+r.h<=31&&!touchesApartment(r.x,r.y,r.w,r.h)&&!props.some(p=>(p.solid!==false||p.atlas!=='urban17')&&overlap(p,r))&&!reserved.some(p=>overlap(p,r))&&Array.from({length:r.h},(_,j)=>Array.from({length:r.w},(_,i)=>cells[r.y+j][r.x+i]===0)).flat().every(Boolean);
  const prop=(frame:string,x:number,y:number,w=1,h=1,atlas:WorldProp['atlas']='environment',solid=true)=>{const r={x,y,w,h};if(!free(r))return false;if(solid){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)cells[j][i]=2;if(!connected()){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)cells[j][i]=0;return false}}if(frame==='car'){frame='car-'+['aveo','spark','lanos'][hash(this.seed,baseX+x,baseY+y)%3];atlas='expansion'}props.push({...r,frame,atlas,solid});return true};
  for(const [q,[x,y]] of [[3,3],[20,3],[3,20],[20,20]].entries()){
   const n=hash(this.seed+q,cx,cy),t=templateFor(this.seed,cx,cy,q,biome);
   const zone=zoneChoice(hash(this.seed+1707+q,cx,cy));
   if(zone&&!touchesApartment(x,y,11,11)){
    zones.push({kind:zone,x,y,w:11,h:11});
    const item=(name:string,dx:number,dy:number,w=1,h=1,solid=true)=>{if(!solid){props.push({frame:'v17-'+name,x:x+dx,y:y+dy,w,h,atlas:'urban17',solid:false});return true}return prop('v17-'+name,x+dx,y+dy,w,h,'urban17',true)};
    if(zone==='parking'){
     for(const [i,car] of ['spark','lanos','aveo','cerato'].entries()){item('parking-mark',1+i*2,2,2,3,false);item('parking-'+car,1+i*2,2,1,2);item('parking-stop',1+i*2,1,1,1)}item('parking-sign',0,7,1,2);item('parking-booth',7,8,3,2);
    }else if(zone==='alley'){
     for(const dx of [0,3,7,10])for(let dy=0;dy<10;dy++)cells[y+dy][x+dx]=1;
     item('alley-bin',4,2,1,2);item('alley-bags',6,6);item('alley-trash',1,4);item('alley-pallet',8,7,2,1);item('alley-drain',5,4,1,1,false);item('alley-lamp',3,3,1,2,false);item('alley-lamp',7,7,1,2,false);item('alley-door',3,6,1,2,false);
    }else{
     const bw=zone==='copec'?9:11,bh=zone==='copec'?5:10,bx=x,by=y;
     const doors=[{x:bx+4,y:by},{x:bx+4,y:by+bh-1}];
     for(let yy=by;yy<by+bh;yy++)for(let xx=bx;xx<bx+bw;xx++)if(xx===bx||xx===bx+bw-1||yy===by||yy===by+bh-1)cells[yy][xx]=1;
     for(const d of doors){cells[d.y][d.x]=cells[d.y][d.x+1]=0;reserved.push({x:d.x,y:d.y===by?d.y-1:d.y,w:2,h:2})}
     buildings.push({urbanKind:zone,x:bx,y:by,w:bw,h:bh,type:zone==='copec'?'convenience':undefined,name:zone==='copec'?'COPEC · MINIMARKET':'BODEGA INDUSTRIAL',material:'concrete',wall:'steel',doors,rooms:[{x:bx+3,y:by+1,w:3,h:bh-2,name:'Pasillo'}]});
     if(zone==='copec'){
      item('copec-shelf',1,1,2,1);item('copec-shelf2',6,1,1,1);item('copec-fridge',7,1,1,2);item('copec-counter',1,2,2,1);item('copec-facade',0,0,4,1,false);item('copec-canopy',0,6,9,3,false);item('copec-pump93',1,7,1,2);item('copec-pump95',4,7,1,2);item('copec-pump97',7,7,1,2);item('copec-sign',9,0,1,2);item('copec-barrier',9,8,1,1);item('copec-cone',9,6);item('copec-bin',9,3,1,1);item('copec-ice',9,4,1,1);
     }else{
      item('warehouse-shelf',1,1,2,2);item('warehouse-shelf2',8,1,2,2);item('warehouse-pallet',1,5,2,1);item('warehouse-machine',7,5,3,2);item('warehouse-crate',1,7,1,1);item('lights-generator',8,7,2,2);item('warehouse-door',4,0,2,1,false);item('warehouse-lamp',0,3,1,1,false);
     }
    }
    reserved.push({x,y,w:11,h:11});continue;
   }
   if(biome==='industrial'&&q===3&&n%2===0){prop(n%3?'container':'truck',x,y,2,4,'city');prop('container-blue',x+4,y,2,4,'city');prop('forklift',x+1,y+6,2,2,'city');prop('barrel',x+7,y+6);continue}
   if(biome==='plaza'||(biome==='commercial'&&q===3&&n%3===0)){
    if(n%2){prop('car',x+1,y+1,1,2);prop('car',x+5,y+1,1,2);prop('bin-yellow',x+7,y+6,1,1,'urban')}else{prop('tree',x,y,2,2,'city');prop('tree',x+6,y+6,2,2,'city');prop('bench-urban',x+4,y,2,1,'urban');prop('fountain',x+2,y+3,2,2,'city')}continue;
   }
   const w=t.id==='convenience'?7:9+n%2,h=9+Math.floor(n/2)%2;if(touchesApartment(x,y,w,h))continue;
   const doors=[{x:x+Math.floor(w/2),y:y+h-1},{x:x+Math.floor(w/2),y}],b:Building={x,y,w,h,type:t.id,name:t.name,facade:t.facade,variant:n%4,material:t.material,wall:t.wall,doors,rooms:[]};buildings.push(b);
   for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(i===x||j===y||i===x+w-1||j===y+h-1)cells[j][i]=1;
   for(const d of doors){cells[d.y][d.x]=0;cells[d.y][d.x-1]=0;reserved.push({x:d.x-1,y:d.y===y?y-1:d.y,w:2,h:2})}
   const mid=x+Math.floor(w/2),cuts=[y+3,y+6],bands=[{y:y+1,h:2},{y:y+4,h:2},{y:y+7,h:h-8}];
   for(const [row,split] of cuts.entries()){const gap=mid+(n%3-1)*(row?-1:1);for(let i=x+1;i<x+w-1;i++)if(i<gap-1||i>gap)cells[split][i]=1}
   const modules=bands.flatMap(band=>[{x:x+1,y:band.y,w:mid-x-2,h:band.h},{x:mid+1,y:band.y,w:x+w-mid-2,h:band.h}]);
   const hotelRooms=['Recepción','Individual','Doble','Baño','Estar',['Servicio','Deteriorada','Cerrada'][n%3]];
   const roomOrder=t.id==='hotel'?hotelRooms.map((_,i)=>i<4?hotelRooms[(i+n%4)%4]:hotelRooms[n%2?(i===4?5:4):i]):t.rooms.map((_,i)=>t.rooms[(i+n%6)%6]);
   const furniture:Record<string,string>={'Recepción':'desk','Vestíbulo':'desk','Cajas':'counter','Oficinas':'desk','Espera':'sofa','Bóveda':'vault-urban','Ventas':'shelves','Mostrador':'counter','Medicamentos':'shelves','Bodega':'crate','Consultorio':'bed','Baño':'washer','Interrogatorio':'table','Celdas':'fence-urban','Productos':'shelves','Cámara fría':'machine','Oficina':'desk','Reparación':'car','Herramientas':'shelves','Elevadores':'machine','Almacén':'crate','Salón':'table','Mesas':'table','Cocina':'machine','Caja':'counter','Refrigeradores':'machine','Individual':'bed','Doble':'bed-blue','Estar':'sofa','Servicio':'washer','Deteriorada':'bed-blue'};
   modules.forEach((r,i)=>{const roomName=roomOrder[i],frame=furniture[roomName]??'nightstand';b.rooms!.push({...r,name:roomName});if(roomName==='Cerrada'){for(let j=r.y;j<r.y+r.h;j++)for(let k=r.x;k<r.x+r.w;k++)cells[j][k]=1;return}const px=n%2&&r.w>1?r.x+r.w-1:r.x,hp=roomName!=='Doble'&&(frame==='bed'||frame==='bed-blue'||frame==='car')&&r.h>1?2:1;prop(frame,px,r.y,1,hp,['fence-urban','vault-urban'].includes(frame)?'urban':'environment');if(roomName==='Doble'&&r.w>1)prop('bed',r.x===px?r.x+r.w-1:r.x,r.y,1,hp);if((roomName==='Mesas'||roomName==='Salón')&&r.w>1)prop('chair-urban',r.x===px?r.x+r.w-1:r.x,r.y,1,1,'urban')});
   b.rooms!.push({x:mid-1,y:y+1,w:2,h:h-2,name:'Pasillo'});
   if(t.id==='supermarket'){if(n%2)for(let j=y+2;j<y+h-2;j+=2)prop('shelves',x+w-2,j);else for(let i=x+1;i<x+w-1;i+=2)prop('shelves',i,y+h-2)}
  }
  const outdoor=['bin-green','bin-open','bin-blue','bin-yellow','bags','cardboard','pallet','urban-barrel','tires','rubble','planter','bench-urban','streetlamp','trafficlight','sign-road','hydrant','manhole-urban','drain-urban','pole-urban','fence-urban','barrier-urban','cone-urban','graffiti-urban','generator-urban','phone','guard-booth','public-toilet'];
  for(let k=0;k<9;k++){const n=hash(this.seed+301+k,cx,cy),x=1+n%30,y=1+Math.floor(n/31)%30,name=outdoor[n%outdoor.length],r={x,y,w:1,h:1};if((x>=13&&x<=18)||(y>=13&&y<=18)||buildings.some(b=>overlap(b,r)))continue;const large=['bin-green','bin-open','bin-blue','bench-urban','barrier-urban'].includes(name);prop(name,x,y,large?2:1,1,'urban',!['graffiti-urban','manhole-urban','drain-urban','rubble'].includes(name))}
  // Border sidewalks and the four-tile avenues at local coordinates 14..17 stay open.
  for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(this.inApartment(baseX+x,baseY+y))cells[y][x]=this.apartment[baseY+y][baseX+x];
  return {key:`${cx},${cy}`,cx,cy,biome,cells,props,buildings,zones};
 }
}
export function collisionRects(cells:number[][]){const result:{x:number;y:number;w:number;h:number}[]=[];let previous=new Map<string,number>();for(let y=0;y<cells.length;y++){const next=new Map<string,number>();for(let x=0;x<cells[y].length;){if(!cells[y][x]){x++;continue}const start=x;while(x<cells[y].length&&cells[y][x])x++;const w=x-start,k=`${start}:${w}`,index=previous.get(k);if(index!==undefined){result[index].h++;next.set(k,index)}else{next.set(k,result.length);result.push({x:start,y,w,h:1})}}previous=next}return result}

