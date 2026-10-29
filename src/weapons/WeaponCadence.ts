import type {Gun} from '../weapons/arsenal';
/** Clocks follow weapon identity, never the faster weapon or the currently selected slot. */
export class WeaponCadence {
 private clocks=new WeakMap<Gun,number>();
 next(gun:Gun){return this.clocks.get(gun)??0}
 fire(gun:Gun,now:number,interval:number,steady=false){if(now+1e-6<this.next(gun))return false;const previous=this.next(gun);this.clocks.set(gun,steady&&previous>0&&now-previous<interval?previous+interval:now+interval);return true}
}
