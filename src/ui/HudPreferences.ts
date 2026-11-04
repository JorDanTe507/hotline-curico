interface StorageLike {getItem(key:string):string|null;setItem(key:string,value:string):void}
export const HUD_PREFERENCES_KEY='hotline-ui-v1';
export class HudPreferences {
 constructor(private storage:()=>StorageLike|undefined){}
 private read(){try{const v=JSON.parse(this.storage()?.getItem(HUD_PREFERENCES_KEY)??'null');return {minimap:v?.minimap!==false,helpers:v?.helpers!==false}}catch{return {minimap:true,helpers:true}}}
 private write(key:'minimap'|'helpers',value:boolean){const next={...this.read(),[key]:value};try{this.storage()?.setItem(HUD_PREFERENCES_KEY,JSON.stringify(next))}catch{}}
 get minimap(){return this.read().minimap}set minimap(value:boolean){this.write('minimap',value)}
 get helpers(){return this.read().helpers}set helpers(value:boolean){this.write('helpers',value)}
}
export const hudPreferences=new HudPreferences(()=>{try{return globalThis.localStorage}catch{return undefined}});
