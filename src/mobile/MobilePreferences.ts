export const MOBILE_PREFERENCES_KEY='hotline-mobile-controls-v2';
export interface MobilePreferences {size:number;opacity:number;layout:'standard'|'wide';autoShoot:boolean;priority:'nearest'|'dangerous';distance:'near'|'weapon';fireOnAim:boolean}
export const MOBILE_DEFAULTS:MobilePreferences={size:1,opacity:.64,layout:'standard',autoShoot:true,priority:'nearest',distance:'weapon',fireOnAim:true};
export function readMobilePreferences(raw:unknown):MobilePreferences {
 const p=(raw??{}) as Partial<MobilePreferences>,number=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
 return {size:number(p.size,.85,1.2,1),opacity:number(p.opacity,.3,.9,.64),layout:p.layout==='wide'?'wide':'standard',autoShoot:typeof p.autoShoot==='boolean'?p.autoShoot:true,priority:p.priority==='dangerous'?'dangerous':'nearest',distance:p.distance==='near'?'near':'weapon',fireOnAim:typeof p.fireOnAim==='boolean'?p.fireOnAim:true};
}
interface StorageLike {getItem(key:string):string|null;setItem(key:string,value:string):void}
export class MobileSettings {
 value:MobilePreferences;private storage?:StorageLike;
 constructor(storage?:StorageLike){try{this.storage=storage??globalThis.localStorage;this.value=readMobilePreferences(JSON.parse(this.storage?.getItem(MOBILE_PREFERENCES_KEY)??'null'))}catch{this.value=readMobilePreferences(null)}}
 set(patch:Partial<MobilePreferences>){this.value=readMobilePreferences({...this.value,...patch});try{this.storage?.setItem(MOBILE_PREFERENCES_KEY,JSON.stringify(this.value))}catch{/* Keep settings usable when storage is unavailable. */}}
 reset(){this.set({...MOBILE_DEFAULTS})}
}
