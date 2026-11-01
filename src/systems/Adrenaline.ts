import type {Run} from './run';
import type {Ultimate} from './Ultimate';
export const ADRENALINE_CAPACITY=1;
export function takeAdrenaline(run:Run){if((run.adrenaline??0)>=ADRENALINE_CAPACITY)return false;run.adrenaline=1;return true}
export function useAdrenaline(run:Run,ultimate:Ultimate,now:number,allowed=true){
 if(!allowed||run.health<=0||!run.adrenaline)return 'unavailable';
 if(ultimate.active(now)||ultimate.pending)return 'active';
 if(ultimate.ready)return 'full';
 ultimate.charge=ultimate.requiredHits;run.adrenaline=0;return 'used';
}
