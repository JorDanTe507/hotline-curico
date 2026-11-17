import type {Game,Foe} from '../scenes/Game';
import {sniperScore,type Point} from './TacticalRules';
interface Memory {target?:Point;recent:Point[];next:number;urgent:number;dark:boolean;last?:Point;check:number;reveal:number}
export class SniperTactics {
 private memories=new Map<Foe,Memory>();
 constructor(private s:Game){}
 private state(e:Foe){let m=this.memories.get(e);if(!m){m={recent:[],next:0,urgent:0,dark:false,check:0,reveal:0};this.memories.set(e,m)}return m}
 force(e:Foe){const m=this.state(e);m.target=undefined;m.next=0;m.urgent=this.s.clock+1100}
 reveal(e:Foe){this.state(e).reveal=this.s.clock+450}
 exposed(e:Foe){return this.s.clock<this.state(e).reveal}
 committed(e:Foe){return this.s.clock<this.state(e).urgent}
 private choose(e:Foe,m:Memory){
  const s=this.s,origin=e.sprite.body!.center,p=s.player,v=p.body!.velocity,target={x:p.x+v.x*.28,y:p.y+v.y*.28},angle=Math.atan2(origin.y-target.y,origin.x-target.x),candidates:Point[]=[];
  for(const distance of [310,440,560])for(const turn of [-2.2,-1.5,-1,-.6,.6,1,1.5,2.2]){const a=angle+turn;candidates.push({x:Math.floor((target.x+Math.cos(a)*distance)/48)*48+24,y:Math.floor((target.y+Math.sin(a)*distance)/48)*48+24})}
  const ranked=candidates.filter(p=>s.walkablePoint(p.x,p.y)&&s.lineClear(p.x,p.y,target.x,target.y)).map(p=>({p,score:sniperScore(p,origin,target,m.recent,[[48,0],[-48,0],[0,48],[0,-48]].filter(([dx,dy])=>s.walkablePoint(p.x+dx,p.y+dy)).length)})).filter(v=>Number.isFinite(v.score)).sort((a,b)=>b.score-a.score);
  for(const row of ranked.slice(0,6)){const path=s.navigation.routes.route(origin,row.p);if(path.length&&path.length<32){m.target=row.p;return}}
  m.target=undefined;
 }
 move(e:Foe,speed:number){const s=this.s,m=this.state(e),at=e.sprite.body!.center,dark=!!s.rush?.power?.dark;
  if(dark&&!m.dark)this.force(e);m.dark=dark;
  if(s.clock>=m.check){if(m.last&&Math.hypot(at.x-m.last.x,at.y-m.last.y)<7){m.target=undefined;m.next=0;s.navigation.invalidate(e)}m.last={x:at.x,y:at.y};m.check=s.clock+1000}
  if(m.target&&Math.hypot(m.target.x-at.x,m.target.y-at.y)<30){m.recent=[...m.recent,m.target].slice(-5);m.target=undefined}
  // Finish a useful route instead of reversing direction whenever the planning timer expires.
  if(m.target&&s.clock>=m.next){m.next=s.clock+1400;const range=Math.hypot(m.target.x-s.player.x,m.target.y-s.player.y);if(range<230||range>760||!s.lineClear(m.target.x,m.target.y,s.player.x,s.player.y))m.target=undefined}
  if(!m.target){m.next=s.clock+1400;this.choose(e,m)}
  if(m.target){s.navigation.move(e,m.target.x,m.target.y,speed*(this.committed(e)?1.7:dark?1.18:1));return true}
  return false;
 }
 remove(e:Foe){this.memories.delete(e)}
 freeze(e:Foe,delta:number){const m=this.memories.get(e);if(m){m.urgent+=delta;m.next+=delta;m.reveal+=delta;m.check+=delta}}
}
