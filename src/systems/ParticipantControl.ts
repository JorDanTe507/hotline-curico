export type ControlSource = 'local-pad' | 'remote-client';
type Departure = 'grace-expired' | 'voluntary' | 'permanent-death' | 'session-closed';

/** One participant and one input source. Timestamps are monotonic real milliseconds. */
export class ParticipantControl {
  readonly allowance = 60000;
  remaining = this.allowance;
  status: 'controlled' | 'grace' | Departure = 'controlled';
  private lostAt = 0;
  private stableAt = 0;

  constructor(readonly source:ControlSource) {}

  remainingAt(now:number) {
    return this.status==='grace'?Math.max(0,this.remaining-(now-this.lostAt)):this.remaining;
  }
  tick(now:number) {
    if(this.status==='grace' && this.remainingAt(now)===0){
      this.remaining=0;
      this.status='grace-expired';
    }else if(this.status==='controlled' && now-this.stableAt>=120000){
      this.remaining=this.allowance;
    }
  }
  observe(source:ControlSource,available:boolean,now:number) {
    if(source!==this.source)return;
    this.tick(now);
    if(this.status==='controlled' && !available){
      this.lostAt=now;
      this.status='grace';
    }else if(this.status==='grace' && available){
      this.remaining=this.remainingAt(now);
      this.stableAt=now;
      this.status='controlled';
    }
  }
  finish(reason:Exclude<Departure,'grace-expired'>){
    if(this.status==='controlled'||this.status==='grace')this.status=reason;
  }
}
