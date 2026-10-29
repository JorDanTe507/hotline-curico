import type Phaser from 'phaser';import {hash,WORLD_TILE as T} from './WorldModel';
const mod=(n:number)=>((n%32)+32)%32;
export function streetCell(gx:number,gy:number){const x=mod(gx),y=mod(gy),vertical=x>=14&&x<=17,horizontal=y>=14&&y<=17;return {x,y,vertical,horizontal,road:vertical||horizontal,intersection:vertical&&horizontal,side:x<3||y<3||x>=29||y>=29||x===13||x===18||y===13||y===18}}
/** Normalize independent generated quadrants into the existing 32px tile pipeline. */
export function createStreetTiles(s:Phaser.Scene){if(s.textures.exists('street-tiles'))return;const source=s.textures.get('street-source').getSourceImage() as HTMLImageElement,canvas=s.textures.createCanvas('street-tiles',128,32)!,ctx=canvas.context,w=source.width/2,h=source.height/2;ctx.imageSmoothingEnabled=false;for(let i=0;i<4;i++)ctx.drawImage(source,(i%2)*w,Math.floor(i/2)*h,w,h,i*32,0,32,32);canvas.refresh()}
export function paintStreet(g:Phaser.GameObjects.Graphics,gx:number,gy:number,seed:number){const c=streetCell(gx,gy),px=gx*T,py=gy*T;
 if(c.vertical&&!c.horizontal&&!(c.y>=12&&c.y<=19)){g.fillStyle(0xd6ac48,.95).fillRect(Math.floor(gx/32)*32*T+16*T-5,py,2,T).fillRect(Math.floor(gx/32)*32*T+16*T+3,py,2,T);if(c.x===14||c.x===17){const laneX=px+(c.x===14?12:33);if(((gy%2)+2)%2===0)g.fillStyle(0xddd4dc,.85).fillRect(laneX,py+7,3,34)}}
 if(c.horizontal&&!c.vertical&&!(c.x>=12&&c.x<=19)){g.fillStyle(0xd6ac48,.95).fillRect(px,Math.floor(gy/32)*32*T+16*T-5,T,2).fillRect(px,Math.floor(gy/32)*32*T+16*T+3,T,2);if(c.y===14||c.y===17)if(((gx%2)+2)%2===0)g.fillStyle(0xddd4dc,.85).fillRect(px+7,py+(c.y===14?12:33),34,3)}
 if(c.vertical&&(c.y===12||c.y===19))for(let i=0;i<3;i++)g.fillStyle(0xe6d8e0,.8).fillRect(px+4+i*15,py+10,9,28);
 if(c.horizontal&&(c.x===12||c.x===19))for(let i=0;i<3;i++)g.fillStyle(0xe6d8e0,.8).fillRect(px+10,py+4+i*15,28,9);
 if(!c.horizontal&&(c.x===13||c.x===18)){const x=px+(c.x===13?T-7:0);g.fillStyle(0x95879d).fillRect(x,py,7,T).fillStyle(0x2b2533).fillRect(x,py+T-2,7,2)}
 if(!c.vertical&&(c.y===13||c.y===18)){const y=py+(c.y===13?T-7:0);g.fillStyle(0x95879d).fillRect(px,y,T,7).fillStyle(0x2b2533).fillRect(px+T-2,y,2,7)}
 if(!c.road)return;const variation=hash(seed,gx,gy);if(variation%37===0){g.fillStyle(0x18151e).fillCircle(px+24,py+24,10).lineStyle(2,0x665b71,.7).strokeCircle(px+24,py+24,10);for(let i=0;i<4;i++)g.lineBetween(px+18,py+18+i*4,px+30,py+18+i*4)}else if(variation%43===0){g.fillStyle(0x17121b).fillRect(px+8,py+8,16,25);for(let i=0;i<4;i++)g.fillStyle(0x51465b,.8).fillRect(px+9+i*4,py+9,1,23)}else if(variation%13===0)g.lineStyle(1,0x09070e,.8).lineBetween(px+8,py+6,px+24,py+23).lineBetween(px+24,py+23,px+20,py+39);
}

