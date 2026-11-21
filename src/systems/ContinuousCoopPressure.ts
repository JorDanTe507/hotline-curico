import type {Foe, Game} from '../scenes/Game';
import {LAST_SEEN_MEMORY, ROUTE_INTERVAL} from '../config/instinct';
import {CHUNK_SIZE,WORLD_TILE} from '../world/WorldModel';
import {continuousBalance} from './ContinuousDirector';

interface Focus {id:number;next:number;x:number;y:number;since:number}

/** Placement and targeting for the existing single simulation. */
export class ContinuousCoopPressure {
 private lastSpawn=0;
 private targets=new WeakMap<Foe,Focus>();
 constructor(private readonly game:Game){}

 spawnPoint(distance:number,boss=false):[number,number]|undefined{
  const g=this.game,coop=g.coop!,actors=coop.livingActors();
  if(!actors.length)return;
  const density=new Map(actors.map(a=>[a.playerId,0]));
  for(const foe of g.foes){
   let closest:Game|undefined,range=continuousBalance.retirementDistance;
   for(const actor of actors){
    const d=Math.hypot(foe.sprite.x-actor.player.x,foe.sprite.y-actor.player.y);
    if(d<range){closest=actor;range=d}
   }
   if(closest)density.set(closest.playerId,density.get(closest.playerId)!+1);
  }
  actors.sort((a,b)=>density.get(a.playerId)!-density.get(b.playerId)!||
   Number(a.playerId===this.lastSpawn)-Number(b.playerId===this.lastSpawn));
  const views=[...new Set([coop.views!.cameraFor(1),coop.views!.cameraFor(2)])];
  if(views.some(camera=>camera.worldView.width<=0))return;
  const players=coop.sectorPlayers();
  for(const actor of actors){
   let searches=0;
   for(let i=0;i<48&&searches<4;i++){
    const angle=Math.random()*Math.PI*2,r=distance+Math.random()*600;
    const x=(Math.floor((actor.player.x+r*Math.cos(angle))/WORLD_TILE)+.5)*WORLD_TILE;
    const y=(Math.floor((actor.player.y+r*Math.sin(angle))/WORLD_TILE)+.5)*WORLD_TILE;
    if(!g.worldStreamer.loaded.has(Math.floor(x/CHUNK_SIZE)+','+Math.floor(y/CHUNK_SIZE)))continue;
    if(coop.partnerControl?.source==='remote-client'&&!coop.state(2).dead){
     const p=coop.actor(2).player;
     if(Math.abs(x-p.x)<=g.scale.width/2+WORLD_TILE&&Math.abs(y-p.y)<=g.scale.height/2+WORLD_TILE)continue;
    }
    if(views.some(({worldView:v})=>x>=v.left-WORLD_TILE&&x<=v.right+WORLD_TILE&&y>=v.top-WORLD_TILE&&y<=v.bottom+WORLD_TILE))continue;
    if(players.some(p=>Math.hypot(x-p.x,y-p.y)<distance)||!g.walkablePoint(x,y,1)||g.fortune.occupied(x,y,boss?100:65))continue;
    searches++;
    if(g.navigation.canReach(actor.player.body!.center,{x,y})){
     this.lastSpawn=actor.playerId;
     return [x,y];
    }
   }
  }
 }

 target(foe:Foe){
  const g=this.game,coop=g.coop!,actors=coop.livingActors(),old=this.targets.get(foe);
  const current=actors.find(a=>a.playerId===old?.id);
  if(!actors.length)return;
  if(current&&old&&g.clock<old.next)return current;
  const {x,y}=foe.sprite;
  const score=(a:Game)=>{
   const d=Math.hypot(a.player.x-x,a.player.y-y);
   return d+(d<continuousBalance.retirementDistance&&!g.lineClear(x,y,a.player.x,a.player.y)?300:0);
  };
  let chosen=current??actors[0];
  const other=actors.find(a=>a!==chosen);
  let since=old?.since??g.clock;
  let moved=!old||Math.hypot(x-old.x,y-old.y)>=WORLD_TILE/2;
  if(other){
   if(score(other)+(current?2*WORLD_TILE:0)<score(chosen))chosen=other;
   else if(old&&!moved&&g.clock-since>=LAST_SEEN_MEMORY&&!g.lineClear(x,y,chosen.player.x,chosen.player.y)){
    since=g.clock;
    if(Math.hypot(other.player.x-x,other.player.y-y)<continuousBalance.retirementDistance&&
       g.lineClear(x,y,other.player.x,other.player.y)&&!g.navigation.canReach(foe.sprite.body!.center,chosen.player.body!.center))chosen=other;
   }
  }
  if(old?.id!==chosen.playerId){
   g.navigation.invalidate(foe);
   g.perception.forget(foe);
   moved=true;
  }
  this.targets.set(foe,{id:chosen.playerId,next:g.clock+ROUTE_INTERVAL,x:moved?x:old!.x,y:moved?y:old!.y,since:moved?g.clock:since});
  return chosen;
 }
}
