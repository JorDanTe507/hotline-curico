import {WorldRoutes} from '../world/WorldRoutes';
import type {Game,Foe} from '../scenes/Game';
import {GridRoutes,type Point} from './GridRoutes';
import {ROUTE_INTERVAL,STUCK_INTERVAL} from '../config/instinct';
import {blocked} from '../maps/apartments';
interface Route {points:Point[];index:number;goal:string;next:number;checkAt:number;last:Point;stuck:number}
/** Follow tile centers using physics-body centers, not the actor's portrait origin. */
export class Navigation {
 readonly routes:GridRoutes|WorldRoutes;private states=new WeakMap<Foe,Route>();private buckets=new Map<string,Foe[]>();private ids=new WeakMap<Foe,number>();private sequence=0;private plans=0;
 constructor(private scene:Game){this.routes=scene.worldModel?new WorldRoutes(scene.worldModel):new GridRoutes(scene.grid)}
 invalidate(e:Foe){this.states.delete(e)}
 beginFrame(){this.plans=0;this.buckets.clear();for(const e of this.scene.foes){if(!this.ids.has(e))this.ids.set(e,this.sequence++);const p=e.sprite.body!.center,k=`${Math.floor(p.x/48)},${Math.floor(p.y/48)}`;const bucket=this.buckets.get(k)??[];bucket.push(e);this.buckets.set(k,bucket)}}
 canReach(a:Point,b:Point){return this.routes.canReach(a,b)}
 private open(x:number,y:number,r:number){for(const [dx,dy] of [[-r,-r],[r,-r],[-r,r],[r,r]])if(blocked(this.scene.grid,Math.floor((x+dx)/48),Math.floor((y+dy)/48)))return false;return true}
 move(e:Foe,tx:number,ty:number,speed:number){const s=this.scene,body=e.sprite.body!,p=body.center,goal={x:tx,y:ty},key=`${Math.floor(tx/48)},${Math.floor(ty/48)}`;let r=this.states.get(e);
 if(!r){r={points:[],index:0,goal:'',next:0,checkAt:s.clock+STUCK_INTERVAL,last:{x:p.x,y:p.y},stuck:0};this.states.set(e,r)}
 if(s.clock>=r.checkAt){if(r.index<r.points.length&&Math.hypot(p.x-r.last.x,p.y-r.last.y)<4){r.stuck++;r.next=0;r.points=[]}else r.stuck=0;r.last={x:p.x,y:p.y};r.checkAt=s.clock+STUCK_INTERVAL}
 if((!r.points.length||r.goal!==key)&&s.clock>=r.next&&this.plans<4){this.plans++;r.points=this.routes.route(p,goal);r.index=0;r.goal=key;r.next=s.clock+ROUTE_INTERVAL}
 if(!r.points.length){e.sprite.setVelocity(0);return}
 while(r.index<r.points.length&&Math.hypot(r.points[r.index].x-p.x,r.points[r.index].y-p.y)<4)r.index++;
 let target=r.points[r.index];if(!target){if(r.goal===key&&this.open(tx,ty,Math.max(body.halfWidth,body.halfHeight)+1))target=goal;else{e.sprite.setVelocity(0);return}}
 const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy);if(d<2){e.sprite.setVelocity(0);return}let vx=dx/d,vy=dy/d;
 // Soft local separation. There are no solid actor-vs-actor colliders to deadlock doorways.
 let sx=0,sy=0;const cx=Math.floor(p.x/48),cy=Math.floor(p.y/48);for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++)for(const other of this.buckets.get(`${cx+ox},${cy+oy}`)??[]){if(other===e)continue;const q=other.sprite.body!.center,dist=Math.hypot(p.x-q.x,p.y-q.y);if(dist<24){if(dist>.1){sx+=(p.x-q.x)/dist*(24-dist)/24;sy+=(p.y-q.y)/dist*(24-dist)/24}else{const a=(this.ids.get(e)!+1)*2.4;sx+=Math.cos(a);sy+=Math.sin(a)}}}
 const separation=Math.min(1,.35/(Math.hypot(sx,sy)||1));const proposedX=vx+sx*separation,proposedY=vy+sy*separation,n=Math.hypot(proposedX,proposedY)||1,radius=Math.max(body.halfWidth,body.halfHeight)+1;
 if(this.open(p.x+proposedX/n*18,p.y+proposedY/n*18,radius)){vx=proposedX/n;vy=proposedY/n}
 const velocity=Math.min(speed,d*40);e.sprite.setVelocity(vx*velocity,vy*velocity)
 }
}
