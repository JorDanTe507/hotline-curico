import {isolateActor} from '../bosses/isolateActor';
import {BOSS_ATLAS,BOSS_FRAME} from '../bosses/atlasFrames';
import type Phaser from 'phaser';
export function loadFortuneAssets(s:Phaser.Scene){s.load.image('fortune-source','assets/v16/fortune.png');s.load.image('bosses-source','assets/v16/bosses.png')}
export function createFortuneAssets(s:Phaser.Scene){
 const cut=(source:string,key:string,x:number,y:number,w:number,h:number,sizeW:number,sizeH:number,remove=true,anchor?:{x:number;feet:number})=>{
  if(s.textures.exists(key))return;const image=s.textures.get(source).getSourceImage() as HTMLImageElement,temp=document.createElement('canvas');temp.width=w;temp.height=h;
  const ctx=temp.getContext('2d')!;ctx.drawImage(image,x,y,w,h,0,0,w,h);const pixels=ctx.getImageData(0,0,w,h),d=pixels.data;
  if(remove){const seen=new Uint8Array(w*h),queue:number[]=[];for(let i=0;i<w;i++)queue.push(i,(h-1)*w+i);for(let j=0;j<h;j++)queue.push(j*w,j*w+w-1);
   for(let i=0;i<queue.length;i++){const n=queue[i];if(seen[n])continue;seen[n]=1;const k=n*4;const background=Math.max(d[k],d[k+1],d[k+2])<=35&&(source!=='bosses-source'||(d[k]<=9&&d[k+1]<=9&&d[k+2]<=20&&d[k+2]>=d[k]+4&&d[k+2]>=d[k+1]+4));if(d[k+3]&&!background)continue;d[k+3]=0;const xx=n%w,yy=Math.floor(n/w);if(xx)queue.push(n-1);if(xx<w-1)queue.push(n+1);if(yy)queue.push(n-w);if(yy<h-1)queue.push(n+w)}ctx.putImageData(pixels,0,0);
  }
  if(anchor){isolateActor(d,w,h,anchor.x-x,anchor.feet-y);ctx.putImageData(pixels,0,0)}
  const out=s.textures.createCanvas(key,sizeW,sizeH)!,scale=Math.min((sizeW-4)/w,(sizeH-4)/h);out.context.imageSmoothingEnabled=false;if(anchor)out.context.drawImage(temp,BOSS_FRAME.anchorX-(anchor.x-x),BOSS_FRAME.feet-(anchor.feet-y));else out.context.drawImage(temp,(sizeW-w*scale)/2,(sizeH-h*scale)/2,w*scale,h*scale);out.refresh();
 };
 for(const [name,x,y,w,h] of [['crate',790,132,92,92],['crate-hurt',937,130,97,96],['crate-dead',1080,129,138,99],['safe',792,334,96,122],['safe-progress',940,334,100,122],['safe-open',1084,332,141,126],['mystery',780,477,200,138],['mystery-open',1023,463,220,155]] as const)cut('fortune-source',`fortune-${name}`,x,y,w,h, name.startsWith('mystery')?96:48,name.startsWith('mystery')?64:56);
 for(let index=1;index<=4;index++){
  const y=(index-1)*256;cut('bosses-source',`boss-${index}-portrait`,8,y+8,235,235,220,220,false);
  const cells=BOSS_ATLAS[index-1];for(const [frame,x] of cells.moveX.entries())cut('bosses-source',`boss-${index}-move-${frame}`,x,cells.moveY,cells.moveWidth,104,BOSS_FRAME.width,BOSS_FRAME.height,true,{x:x+cells.moveWidth/2,feet:cells.floor});
  for(const [frame,[x,top,w,h,cx,feet]] of cells.attacks.entries())cut('bosses-source',`boss-${index}-attack-${frame}`,x,top,w,h,BOSS_FRAME.width,BOSS_FRAME.height,true,{x:cx,feet});
  cut('bosses-source',`boss-${index}-weapon`,1204,y+31,312,70,96,32);
  for(const [state,frames,repeat] of [['idle',[0],-1],['walk',[0,4],-1],['shoot',[0,1],0],['reload',[1],-1],['hurt',[0],0],['dead',[0],0],['dash',[0,4],-1]] as const){
   for(let n=0;n<frames.length;n++){const source=state==='shoot'?`boss-${index}-attack-${frames[n]}`:`boss-${index}-move-${frames[n]}`;const image=s.textures.get(source).getSourceImage() as HTMLCanvasElement,key=`boss-${index}-${state}-${n}`;if(!s.textures.exists(key)){const canvas=s.textures.createCanvas(key,BOSS_FRAME.width,BOSS_FRAME.height)!;canvas.context.imageSmoothingEnabled=false;canvas.context.drawImage(image,0,0);canvas.refresh()}}
   const key=`boss-${index}-${state}`;if(!s.anims.exists(key))s.anims.create({key,frames:frames.map((_,n)=>({key:`boss-${index}-${state}-${n}`})),frameRate:7,repeat});
  }
 }
}
