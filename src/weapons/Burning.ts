import type {Game,Foe} from '../scenes/Game';
import type {ShotCredit} from '../systems/Ultimate';
interface Burn {until:number;next:number;attack?:ShotCredit}
/** Refreshes duration, never stacks independent damage timers per flame particle. */
export class Burning {
 private foes=new Map<Foe,Burn>();private player?:Burn;
 constructor(private s:Game){}
 ignite(enemy:Foe,attack:ShotCredit){const old=this.foes.get(enemy);this.foes.set(enemy,{until:this.s.clock+1000,next:old?.next??this.s.clock+250,attack})}
 ignitePlayer(){this.player={until:this.s.clock+1000,next:this.player?.next??this.s.clock+250}}
 update(){const s=this.s;for(const [e,b] of this.foes){if(!e.sprite.active||e.hp<=0){this.foes.delete(e);continue}while(b.next<=s.clock&&b.next<=b.until){b.next+=250;s.hit(e,2,b.attack)}if(s.clock>=b.until)this.foes.delete(e)}if(this.player){const b=this.player;while(b.next<=s.clock&&b.next<=b.until&&!s.ended){b.next+=250;s.damage(2,true,false)}if(s.clock>=b.until)this.player=undefined}}
 stop(){this.foes.clear();this.player=undefined}
}
