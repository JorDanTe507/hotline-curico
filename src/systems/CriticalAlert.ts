import {CRITICAL_ALERT_INTERVAL} from '../config/survival';
export const CRITICAL_BEAT_INTERVAL=CRITICAL_ALERT_INTERVAL;
/** Hysteresis prevents chatter between the enter (25%) and exit (>30%) thresholds. */
export class CriticalAlert {
 active=false;private nextBeat=0;
 update(health:number,maximum:number,now:number,blocked=false){const ratio=health/maximum;if(health<=0||ratio>.3)this.active=false;else if(ratio<=.25)this.active=true;if(blocked)return {active:false,beat:false};const beat=this.active&&now>=this.nextBeat;if(beat)this.nextBeat=now+CRITICAL_BEAT_INTERVAL;return {active:this.active,beat}}
 reset(){this.active=false;this.nextBeat=0}
}
