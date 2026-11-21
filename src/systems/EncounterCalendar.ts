export const encounterRules = {
  period: 300_000, warning: 10_000, stagger: 10_000, jitter: 5_000,
  doubleBase: .18, doubleStep: .045, doubleCap: .72, retry: 500, extraBossHealth:.85, extraBossDamage:.45,
  hordeRates: [1, .70, .45], smoothing: 2500,
};

interface Encounter {
  id:number; bosses:number[]; spawned:number; due:number;
}

/** The inclusive range from nextId to floor(now/period) represents the FIFO. */
export class EncounterCalendar {
  nextId=1;
  active?:Encounter;
  private bag:number[]=[];
  private lastPair='';
  constructor(private random=Math.random){}
  private draw(id:number, exclude=-1):number {
    if(!this.bag.some(value=>value!==exclude)){
      this.bag=Array.from({length:id>6?6:5},(_,i)=>i);
    }
    const choices=this.bag.filter(value=>value!==exclude);
    const boss=choices[Math.floor(this.random()*choices.length)];
    this.bag.splice(this.bag.indexOf(boss),1);
    return boss;
  }
  update(now:number,living:number,warn:(id:number)=>void,spawn:(boss:number,key:string)=>boolean){
    const r=encounterRules;
    if(this.active && this.active.spawned===this.active.bosses.length && !living){
      this.nextId++;this.active=undefined;
    }
    const scheduled=this.nextId*r.period;
    if(!this.active && now>=scheduled-r.warning){
      const first=this.nextId===6?5:this.draw(this.nextId);
      const bosses=[first];
      if(this.nextId>6 && this.random()<Math.min(r.doubleCap,r.doubleBase+(this.nextId-7)*r.doubleStep)){
        let second=this.draw(this.nextId,first);
        let pair=[first,second].sort().join(',');
        if(pair===this.lastPair){second=this.draw(this.nextId,first);pair=[first,second].sort().join(',')}
        this.lastPair=pair;bosses.push(second);
      }
      this.active={id:this.nextId,bosses,spawned:0,due:now>=scheduled && this.nextId>1?now+r.warning:scheduled};
      warn(this.nextId);
    }
    const event=this.active;
    if(!event || event.spawned===event.bosses.length || now<event.due)return;
    if(!spawn(event.bosses[event.spawned],event.id+'-'+event.spawned)){event.due=now+r.retry;return}
    event.spawned++;
    event.due=now+r.stagger+this.random()*r.jitter;
  }
}
