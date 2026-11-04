import {CHAOS} from './config';
export class DamageBudget {
 throwableId?:number;chainCount=0;chainNotified=false;playerId=1;private dealt=new WeakMap<object,number>();private self=new Map<number,number>();
 constructor(readonly player=true,readonly normalCap:number=CHAOS.castNormalCap,readonly bossCap:number=CHAOS.castBossCap,readonly playerCap:number=CHAOS.castPlayerCap){}
 claim(target:object,damage:number,boss=false){const used=this.dealt.get(target)??0,n=Math.max(0,Math.min(damage,(boss?this.bossCap:this.normalCap)-used));this.dealt.set(target,used+n);return n}
 claimPlayer(damage:number,id=1){const used=this.self.get(id)??0,n=Math.max(0,Math.min(damage,this.playerCap-used));this.self.set(id,used+n);return n}
}
