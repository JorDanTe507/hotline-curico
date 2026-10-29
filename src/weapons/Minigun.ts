import type {Gun} from './arsenal';
export const MINIGUN_ID=7;
export const MINIGUN_SPINUP=600;
export const MINIGUN_MOVEMENT=.8;
export const MINIGUN_SECOND_DAMAGE=.5;
/** Continuous trigger state follows gun identity; release interrupts preparation. */
export class MinigunTrigger {
 private held=new Map<Gun,number>();
 hold(gun:Gun,now:number){if(!this.held.has(gun))this.held.set(gun,now);return now-this.held.get(gun)!+1e-6>=MINIGUN_SPINUP}
 progress(gun:Gun,now:number){const start=this.held.get(gun);return start===undefined?0:Math.min(1,(now-start)/MINIGUN_SPINUP)}
 retain(guns:Gun[]){for(const gun of this.held.keys())if(!guns.includes(gun))this.held.delete(gun)}
 reset(){this.held.clear()}
}
