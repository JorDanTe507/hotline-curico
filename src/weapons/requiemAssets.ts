import type Phaser from 'phaser';

export function loadRequiem(s:Phaser.Scene){s.load.image('requiem-source','assets/weapons/requiem/source.png')}

/** Normalize the transparent reference-derived art once; all existing weapon consumers keep ID 9. */
export function createRequiem(s:Phaser.Scene){
 if(s.textures.exists('weapon-9'))return;
 const image=s.textures.get('requiem-source').getSourceImage() as HTMLImageElement;
 const scan=document.createElement('canvas');scan.width=image.width;scan.height=image.height;
 const ctx=scan.getContext('2d')!;ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,scan.width,scan.height).data;
 let left=scan.width,top=scan.height,right=-1,bottom=-1;
 for(let y=0;y<scan.height;y++)for(let x=0;x<scan.width;x++)if(pixels[(y*scan.width+x)*4+3]>32){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y)}
 const w=right-left+1,h=bottom-top+1,scale=Math.min(30/w,26/h);
 for(const key of ['weapon-9','weapon-9-pickup','weapon-9-hud','weapon-9-fire-0','weapon-9-fire-1']){
  const canvas=s.textures.createCanvas(key,32,32)!,c=canvas.context;c.imageSmoothingEnabled=false;
  c.drawImage(image,left,top,w,h,(32-w*scale)/2,(32-h*scale)/2,w*scale,h*scale);
  if(key.includes('-fire-')){c.fillStyle=key.endsWith('0')?'#fff0aa':'#ffae40';c.fillRect(29,9,3,2)}
  canvas.refresh();
 }
 const tracer=s.textures.createCanvas('requiem-tracer',16,3)!;
 tracer.context.fillStyle='#e3ae51';tracer.context.fillRect(0,0,16,3);
 tracer.context.fillStyle='#fff2c8';tracer.context.fillRect(6,1,10,1);tracer.refresh();
 const icon=s.textures.createCanvas('achievement-12',64,64)!,c=icon.context;
 c.fillStyle='#211627';c.fillRect(0,0,64,64);c.strokeStyle='#ffce47';c.lineWidth=3;c.strokeRect(2,2,60,60);
 c.imageSmoothingEnabled=false;c.drawImage(s.textures.get('weapon-9').getSourceImage() as HTMLCanvasElement,4,4,56,56);icon.refresh();
}
