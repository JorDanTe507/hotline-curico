import {ENEMIES} from '../enemies/config';
import type {Game,Foe} from '../scenes/Game';
import {DETECTION_RADII,BOSS_DETECTION_RADIUS,PERCEPTION_INTERVAL,LAST_SEEN_MEMORY} from '../config/instinct';
interface Sighting {x:number;y:number;visible:boolean;seenAt:number;next:number;known:boolean}
export class Perception {
 private states=new WeakMap<Foe,Sighting>();
 constructor(private scene:Game){}
 update(e:Foe){const s=this.scene;if((s.worldModel&&s.rounds?.state.phase==='combat')||s.rounds?.state.plan.type==='SUPERVIVENCIA'||e.boss>=0){const p=s.player.body!.center;e.awake=true;return {x:p.x,y:p.y,visible:(e.boss>=0||Math.hypot(e.sprite.x-s.player.x,e.sprite.y-s.player.y)<=ENEMIES[e.tier].detection)&&s.lineClear(e.sprite.x,e.sprite.y,s.player.x,s.player.y),seenAt:s.clock,next:s.clock,known:true}}let m=this.states.get(e);if(!m){m={x:0,y:0,visible:false,seenAt:0,next:0,known:false};this.states.set(e,m)}
 if(s.clock>=m.next){m.next=s.clock+PERCEPTION_INTERVAL;const p=s.player.body!.center,r=e.boss>=0?BOSS_DETECTION_RADIUS:ENEMIES[e.tier].detection;m.visible=Math.hypot(e.sprite.x-s.player.x,e.sprite.y-s.player.y)<=r&&s.lineClear(e.sprite.x,e.sprite.y,s.player.x,s.player.y);if(m.visible){m.x=p.x;m.y=p.y;m.seenAt=s.clock;m.known=true}}
 if(!m.visible&&(s.clock-m.seenAt>LAST_SEEN_MEMORY||Math.hypot(e.sprite.body!.center.x-m.x,e.sprite.body!.center.y-m.y)<20))m.known=false;
 e.awake=m.known;return m.known?m:undefined;
 }
}
