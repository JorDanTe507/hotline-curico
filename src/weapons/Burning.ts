import type {Game,Foe} from '../scenes/Game';
import type {ShotCredit} from '../systems/Ultimate';
interface Burn {damage:number;until:number;next:number;attack?:ShotCredit}
/** Refreshes duration, never stacks independent damage timers per flame particle. */
export class Burning {
 private foes=new Map<Foe,Burn>();private player?:Burn;
 freezeEnemy(e:Foe,dt:number){const b=this.foes.get(e);if(b){b.until+=dt;b.next+=dt}}

 constructor(private s:Game){}
 shareTargets(other:Burning){this.foes=other.foes}
 ignite(enemy:Foe,attack:ShotCredit,duration=1000,damage=2){const old=this.foes.get(enemy);this.foes.set(enemy,{damage,until:this.s.clock+duration,next:old?.next??this.s.clock+250,attack})}
 ignitePlayer(duration=1000,damage=2){this.player={damage,until:this.s.clock+duration,next:this.player?.next??this.s.clock+250}}
 update(){const s=this.s;for(const [e,b] of this.foes){if(s.temporal?.active)continue;if(!e.sprite.active||e.hp<=0){this.foes.delete(e);continue}while(b.next<=s.clock&&b.next<=b.until){b.next+=250;s.hit(e,b.damage,b.attack)}if(s.clock>=b.until)this.foes.delete(e)}if(this.player){const b=this.player;while(b.next<=s.clock&&b.next<=b.until&&!s.ended){b.next+=250;s.damage(b.damage,true,false)}if(s.clock>=b.until)this.player=undefined}}
 stop(){this.foes.clear();this.player=undefined}
}
