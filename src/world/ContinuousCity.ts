import type {Game} from '../scenes/Game';
import {AudioSystem} from '../systems/AudioSystem';
import {CHUNK_SIZE,hash} from './WorldModel';
import {streetCell} from './Streets';
import {StreetClimate,SectorSupplies,cityRules,streamRandom} from './ContinuousCityState';

type Traffic={x:number;y:number;dx:number;dy:number;starts:number;crash:boolean;hit:WeakSet<object>};
export class ContinuousCity {
 readonly climate;readonly supplies=new SectorSupplies();
 private weatherRandom;private trafficRandom;
 private mark?:{x:number;y:number;at:number};
 private traffic?:Traffic;private wreckUntil=0;
 private paint;private car;private cache;private sign;private sky='';private flashAt=0;
 private stationKey='';private station?:{x:number;y:number};
 updateMs=0;
 constructor(private s:Game){
  this.climate=new StreetClimate(s.run.seed);this.weatherRandom=streamRandom(s.run.seed,3111);this.trafficRandom=streamRandom(s.run.seed,3112);
  this.paint=s.add.graphics().setDepth(16);
  this.car=s.add.image(0,0,'car-aveo').setDisplaySize(85,42).setDepth(12).setVisible(false);
  this.cache=s.add.image(0,0,'environment','crate').setDisplaySize(38,32).setDepth(5).setVisible(false);
  this.sign=s.add.text(24,205,'',{fontFamily:'monospace',fontSize:14,color:'#ffe7ac',backgroundColor:'#201323'}).setScrollFactor(0).setDepth(92).setVisible(false);
 }
 private updateStation(cx:number,cy:number,now:number){
  const s=this.s,key=cx+','+cy;this.supplies.visited.add(key);
  if(this.stationKey!==key){
   this.stationKey=key;this.station=undefined;
   const h=hash(s.run.seed+3130,Math.floor(cx/3),Math.floor(cy/3));
   if((cx%3+3)%3===h%3&&(cy%3+3)%3===Math.floor(h/3)%3){
    const x=(cx*32+13.5)*48,y=(cy*32+16.5)*48;
    if(s.walkablePoint(x,y)&&!s.fortune.occupied(x,y,80))this.station={x,y};
   }
  }
  const p=this.station,ready=!!p&&this.supplies.ready(key,now);
  this.cache.setVisible(ready);
  if(!p||!ready)return;
  this.cache.setPosition(p.x,p.y);
  if(Math.hypot(s.player.x-p.x,s.player.y-p.y)<44&&this.supplies.claim(key,now)){
   s.addDrop(p.x,p.y,'ammo',0);this.cache.setVisible(false);
  }
 }
 private escape(x:number,y:number){
  return [[100,0],[-100,0],[0,100],[0,-100]].some(([dx,dy])=>this.s.walkablePoint(x+dx,y+dy)&&this.s.lineClear(x,y,x+dx,y+dy));
 }
 private planTraffic(cx:number,cy:number,now:number){
  const s=this.s,r=this.trafficRandom;
  const horizontal=r()<.5,dir=r()<.5?-1:1,dx=horizontal?dir:0,dy=horizontal?0:dir;
  const lane=(dir>0?15.5:16.5)*48,x=horizontal?s.player.x-dx*850:cx*CHUNK_SIZE+lane,y=horizontal?cy*CHUNK_SIZE+lane:s.player.y-dy*850;
  const chance=s.worldModel.biome(cx,cy)==='commercial'?1:s.worldModel.biome(cx,cy)==='industrial'?.78:.65;
  if(r()>chance||s.foes.some(e=>Math.hypot(e.sprite.x-x,e.sprite.y-y)<100)||!this.escape(s.player.x,s.player.y))return;
  for(let i=0;i<=1800;i+=24){
   const px=x+i*dx,py=y+i*dy;
   if(!streetCell(Math.floor(px/48),Math.floor(py/48)).road||!s.walkablePoint(px,py)||!s.walkablePoint(px+dy*20,py+dx*20)||!s.walkablePoint(px-dy*20,py-dx*20)||s.fortune.occupied(px,py,45))return;
  }
  if(!this.climate.reserve(now,9000,(s.encounters?.living??0)>1))return;
  this.traffic={x,y,dx,dy,starts:now+cityRules.trafficWarning,crash:r()<.3,hit:new WeakSet()};
  this.sign.setText('TRÁNSITO '+(dx>0?'→':dx<0?'←':dy>0?'↓':'↑')).setVisible(true);AudioSystem.play(s,'motor',.35);
 }
 private impact(x:number,y:number,radius:number,damage:number,hit:WeakSet<object>){
  const s=this.s;
  const touches=(actor:{x:number;y:number})=>Math.hypot(actor.x-x,actor.y-y)<=radius&&s.lineClear(x,y,actor.x,actor.y);
  if(!hit.has(s.player)&&touches(s.player)){
   hit.add(s.player);if(!s.coop?.incapacitated(s.playerId)&&!s.dash.active(s.clock))s.damage(damage);
  }
  if(s.ended)return;
  for(const e of [...s.foes])if(!hit.has(e)&&touches(e.sprite)){
   hit.add(e);s.hit(e,e.boss>=0?Math.min(damage,e.max*.035):damage,{environment:true,fromPlayer:false,eligible:false,secondary:true,targets:new WeakSet()});
  }
 }
 update(now:number){
  const start=performance.now(),s=this.s,cx=Math.floor(s.player.x/CHUNK_SIZE),cy=Math.floor(s.player.y/CHUNK_SIZE);
  this.updateStation(cx,cy,now);
  const {strike,traffic}=this.climate.advance(now),sky=this.climate.sky;
  if(this.sky!==sky){this.sky=sky;s.city.forceWeather(sky==='storm'||sky==='rain'?'rain':'clear');if(sky==='storm')s.city.announce('Tormenta eléctrica')}
  this.paint.clear();
  if(sky==='storm'&&now>=this.flashAt){this.flashAt=now+1900+this.weatherRandom()*4900;if(s.city.quality.level>0)s.cameras.main.flash(85,70,84,115,false)}
  if(strike&&!this.mark&&!this.traffic){
   const x=s.player.x+(this.weatherRandom()-.5)*200,y=s.player.y+(this.weatherRandom()-.5)*200;
   if(!s.city.inside(x,y)&&s.walkablePoint(x,y)&&this.escape(x,y)&&this.climate.reserve(now,1500,(s.encounters?.living??0)>1)){
    this.mark={x,y,at:now+cityRules.lightningWarning};AudioSystem.play(s,'electric',.28);
   }
  }
  if(this.mark){
   const {x,y,at}=this.mark;
   if(now>=at){this.mark=undefined;this.impact(x,y,cityRules.strikeRadius,32,new WeakSet());if(s.ended)return;
    this.paint.lineStyle(5,0xffffef).lineBetween(x-32,y-200,x,y);
   }else{this.paint.fillStyle(0x8ec7ff,.2).fillCircle(x,y,70).lineStyle(3,0xb9ecff).strokeCircle(x,y,70).strokeCircle(x,y,70*(at-now)/1500)}
  }
  if(traffic&&!this.traffic&&!this.mark&&!this.wreckUntil)this.planTraffic(cx,cy,now);
  const t=this.traffic;
  if(t&&now>=t.starts){
   this.sign.setVisible(false);
   const distance=Math.min(1800,(now-t.starts)*cityRules.trafficSpeed/1000),x=t.x+t.dx*distance,y=t.y+t.dy*distance;
   this.car.setPosition(x,y).setRotation(Math.atan2(t.dy,t.dx)).setVisible(true);
   this.impact(x,y,40,38,t.hit);if(s.ended)return;
   if(distance>=1800||t.crash&&distance>=1000){
    this.traffic=undefined;
    if(t.crash){this.wreckUntil=now+12000;this.car.setTint(0x91656b).setAngle(this.car.angle+18)}
    else this.car.setVisible(false);
   }
  }
  if(this.wreckUntil&&now>this.wreckUntil-2500){
   this.car.setAlpha(Math.max(0,(this.wreckUntil-now)/2500));
   if(now>=this.wreckUntil){this.wreckUntil=0;this.car.setVisible(false).clearTint().setAlpha(1)}
  }
  this.updateMs=performance.now()-start;
 }
 diagnostics(){
  const s=this.s,stream=s.worldStreamer,visited=this.supplies.visited.size;
  const heap=(performance as Performance&{memory?:{usedJSHeapSize:number}}).memory?.usedJSHeapSize;
  return {active:stream.loaded.size,prepared:[...s.worldModel.cache.keys()].filter(k=>!stream.loaded.has(k)).length,
   visited,supplyRecords:this.supplies.used.size,pending:stream.pending,activeEntities:s.children.length,
   coinGroups:s.coins?.ledger.coins.size??0,frameMs:s.game.loop.delta,heapBytes:heap??null,
   peakLoadMs:stream.maxLoadMs,loadMs:stream.lastLoadMs,updateMs:this.updateMs};
 }
 stop(){this.traffic=undefined;this.mark=undefined;this.car.setVisible(false);this.paint.clear();this.cache.setVisible(false);this.sign.setVisible(false)}
}
