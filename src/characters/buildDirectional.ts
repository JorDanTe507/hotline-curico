/** Asset preparation only: measured poses from the supplied, nonuniform presentation sheets. */
export const DIRECTIONS=['down','left','right','up'] as const;
export type Facing=typeof DIRECTIONS[number];
export const FRAME_W=96,FRAME_H=112,FEET=102;
const groups=[[137,475],[480,810],[816,1146],[1152,1515]];
const six=[[166,220,274,329,384,439],[514,568,620,675,728,781],[844,899,954,1009,1063,1118],[1185,1244,1302,1360,1419,1478]];
const specs=[
 {pose:'idle',top:65,bottom:218,centers:[[185,264,342,420],[525,602,679,753],[868,945,1024,1100],[1209,1290,1373,1456]]},
 {pose:'walk',top:227,bottom:362,centers:six},
 {pose:'run',top:372,bottom:500,centers:six},
 {pose:'melee',top:510,bottom:645,centers:[six[0],[520,578,637,696,756],[851,909,970,1030,1090],six[3]]},
 {pose:'hurt',top:655,bottom:814,centers:[[180,260,340,423],[522,599,674,752],[862,939,1014,1090],[1199,1280,1362,1444]]},
 {pose:'dead',top:825,bottom:988,centers:[[162,216,270,324,378,433],[512,568,623,679,735,789],[852,914,977,1039,1102],[1188,1244,1301,1358,1415,1473]]}
];
export function buildDirectional(image:HTMLImageElement,id?:string){
 const tiles:HTMLCanvasElement[]=[],poses:Record<string,Record<string,number[]>>={},audit:{pose:string;direction:string;frame:number;clipped:boolean}[]=[];
 for(const spec of specs){poses[spec.pose]={};for(const [di,direction] of DIRECTIONS.entries()){
  const x=groups[di][0]+4,right=groups[di][1]-3,w=right-x,h=spec.bottom-spec.top,c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d')!;ctx.drawImage(image,x,spec.top,w,h,0,0,w,h);const pixels=ctx.getImageData(0,0,w,h),d=pixels.data,seen=new Uint8Array(w*h),queue:number[]=[];
  for(let xx=0;xx<w;xx++)queue.push(xx,(h-1)*w+xx);for(let yy=0;yy<h;yy++)queue.push(yy*w,yy*w+w-1);
  for(let at=0;at<queue.length;at++){const n=queue[at];if(seen[n])continue;seen[n]=1;const k=n*4,max=Math.max(d[k],d[k+1],d[k+2]),min=Math.min(d[k],d[k+1],d[k+2]);if(d[k+3]&&!(min>170&&max-min<35))continue;d[k+3]=0;const xx=n%w,yy=Math.floor(n/w);if(xx)queue.push(n-1);if(xx<w-1)queue.push(n+1);if(yy)queue.push(n-w);if(yy<h-1)queue.push(n+w)}
  seen.fill(0);const raw:{pixels:number[];l:number;t:number;r:number;b:number;clipped:boolean}[]=[];
  for(let start=0;start<w*h;start++){if(seen[start]||!d[start*4+3])continue;const points=[start];seen[start]=1;let l=w,t=h,r=0,b=0;for(let at=0;at<points.length;at++){const n=points[at],xx=n%w,yy=Math.floor(n/w);l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,yy);b=Math.max(b,yy);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=xx+dx,ny=yy+dy,k=ny*w+nx;if(nx<0||nx>=w||ny<0||ny>=h||seen[k]||!d[k*4+3])continue;seen[k]=1;points.push(k)}}if(points.length>200&&r-l>12&&b-t>10&&r-l<100)raw.push({pixels:points,l,t,r,b,clipped:l===0||r===w-1||t===0||b===h-1});}
  raw.sort((a,b)=>a.l-b.l);const reference=Math.max(...raw.map(r=>r.b-r.t+1)),scale=90/reference,indices:number[]=[];
  for(const [i,r] of raw.entries()){const tile=document.createElement('canvas');tile.width=r.r-r.l+1;tile.height=r.b-r.t+1;const tc=tile.getContext('2d')!,pd=tc.createImageData(tile.width,tile.height),hips:number[]=[];for(const n of r.pixels){const xx=n%w,yy=Math.floor(n/w),k=((yy-r.t)*tile.width+xx-r.l)*4;pd.data.set(d.subarray(n*4,n*4+4),k);if(yy>=r.t+tile.height*.55&&yy<=r.t+tile.height*.7)hips.push(xx-r.l)}tc.putImageData(pd,0,0);hips.sort((a,b)=>a-b);const anchor=spec.pose==='dead'?(tile.width/2):(hips[Math.floor(hips.length/2)]??tile.width/2),out=document.createElement('canvas');out.width=FRAME_W;out.height=FRAME_H;const oc=out.getContext('2d')!;oc.imageSmoothingEnabled=false;oc.drawImage(tile,FRAME_W/2-anchor*scale,FEET-tile.height*scale,tile.width*scale,tile.height*scale);audit.push({pose:spec.pose,direction,frame:i,clipped:r.clipped});if(!r.clipped){indices.push(tiles.length);tiles.push(out)}}
  poses[spec.pose][direction]=spec.pose==='dead'&&direction==='right'?indices.reverse():indices;if(spec.pose==='dead'){const ordered=direction==='right'?[...raw].reverse():raw,last=ordered.at(-1);if((id==='cervela'&&direction==='left')||!last||indices.length<2||(last.b-last.t+1)>reference*.6)poses.dead[direction]=[]}
 }}
 const atlas=document.createElement('canvas');atlas.width=FRAME_W*16;atlas.height=FRAME_H*Math.ceil(tiles.length/16);const ctx=atlas.getContext('2d')!;for(const [i,t] of tiles.entries())ctx.drawImage(t,i%16*FRAME_W,Math.floor(i/16)*FRAME_H);return {image:atlas.toDataURL('image/png'),poses,audit,count:tiles.length};
}
