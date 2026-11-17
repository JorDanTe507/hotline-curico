import type Phaser from 'phaser';
/** Lightweight vector ornaments; no protagonist art is created here. */
export function hudSegments(g:Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,n=10,color=0x9c4d7a){g.lineStyle(1,color,.65).strokeRect(x,y,w,h);for(let i=1;i<n;i++)g.lineBetween(x+w*i/n,y,x+w*i/n,y+h)}
export function paintUltimate(g:Phaser.GameObjects.Graphics,id:string,x:number,y:number,w:number,h:number,p:number,ready:boolean,active:boolean,clock:number,motion:boolean){p=Math.max(0,Math.min(1,p));const pulse=motion&&ready?.7+.3*Math.sin(clock/150):1;
 g.fillStyle(0x130b1e,.96).fillRoundedRect(x-9,y-9,w+18,h+18,4);
 if(id==='cervela'){g.fillStyle(0x975423).fillRect(x,y,w*.17,h);g.fillStyle(0x564453).fillRect(x+w*.17,y,w*.83,h);g.fillStyle(0xf4dec8).fillRect(x+w*.17,y,w*.83*p,h);g.fillStyle(ready?0xffb328:0xeb5947,pulse).fillRect(x+w*.17+w*.83*p-5,y-2,7,h+4);g.lineStyle(1,0xc09374).strokeRect(x,y,w,h);if(ready||active){g.lineStyle(2,0xc6acc7,.5);for(let i=0;i<3;i++){const xx=x+w-4+i*4,yy=y-6-i*5;g.lineBetween(xx,yy,xx+(motion?Math.sin(clock/280+i)*4:2),yy-7)}}}
 else if(id==='nicolas'){g.fillStyle(0x30264b).fillRect(x,y,w,h);g.fillStyle(active?0xc063ff:0x44dcff,pulse).fillRect(x,y,w*p,h);hudSegments(g,x,y,w,h,12,0x8a8cff);if(ready){g.lineStyle(1,0xf2ceff,pulse).strokeRect(x-3,y-3,w+6,h+6)}}
 else{g.fillStyle(0x513f22).fillRect(x+25,y,w-25,h);g.fillStyle(0xffcf53,pulse).fillRect(x+25,y,(w-25)*p,h);hudSegments(g,x+25,y,w-25,h,9,0xe5b850);g.lineStyle(2,0xffda7b,pulse).strokeCircle(x+8,y+h/2,13);const angle=-Math.PI/2+p*Math.PI*2;g.lineBetween(x+8,y+h/2,x+8+Math.cos(angle)*10,y+h/2+Math.sin(angle)*10);g.lineBetween(x+8,y+h/2,x+8,y+h/2-6)}
}
