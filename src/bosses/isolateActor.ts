/** Keep the actor anchored in this irregular atlas cell, excluding labels, panel lines and neighboring poses. */
export function isolateActor(data:Uint8ClampedArray,w:number,h:number,cx:number,feet:number){
 const seen=new Uint8Array(w*h),parts:{pixels:number[];score:number;left:number;right:number;top:number;bottom:number;hot:number}[]=[];
 for(let start=0;start<w*h;start++){if(seen[start]||!data[start*4+3])continue;const pixels=[start];seen[start]=1;let score=0,left=w,right=0,top=h,bottom=0,hot=0;
  for(let i=0;i<pixels.length;i++){const n=pixels[i],x=n%w,y=Math.floor(n/w),k=n*4;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);if(Math.abs(x-cx)<23&&y>feet-95&&y<feet-4)score++;if(data[k]>140&&data[k+1]>35&&data[k+2]<150)hot++;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,next=yy*w+xx;if(xx<0||xx>=w||yy<0||yy>=h||seen[next]||!data[next*4+3])continue;seen[next]=1;pixels.push(next)}
  }parts.push({pixels,score,left,right,top,bottom,hot});
 }
 const main=parts.sort((a,b)=>b.score-a.score)[0];if(!main)return;
 const keep=new Uint8Array(w*h);for(const part of parts){
  const flash=part.pixels.length>4&&part.hot>part.pixels.length*.15&&part.left>cx+25&&part.top>=main.top&&part.bottom<main.bottom-12&&part.right-part.left>=(part.bottom-part.top)*.8;
  if(part===main||flash)for(const n of part.pixels)keep[n]=1;
 }for(let n=0;n<w*h;n++)if(!keep[n])data[n*4+3]=0;
}
