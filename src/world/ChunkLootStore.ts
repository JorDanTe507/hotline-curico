import type {Gun} from '../weapons/arsenal';
export interface StoredDrop {x:number;y:number;kind:'gun'|'ammo'|'med'|'armor';id:number;weapon?:Gun}
/** Dormant loot lives in session storage, not in active Phaser objects. Cleared per run. */
export class ChunkLootStore {
 private memory=new Map<string,StoredDrop[]>();private prefix:string;private storage?:Storage;
 constructor(seed:number,storage?:Storage){this.prefix=`hotline-world-${seed}-${Math.random().toString(36).slice(2)}:`;this.storage=storage}
 save(key:string,drops:StoredDrop[]){if(!drops.length)return;drops=[...this.take(key),...drops];try{if(this.storage){this.storage.setItem(this.prefix+key,JSON.stringify(drops));return}}catch{/* Quota or disabled storage: bounded in-memory fallback. */}if(this.memory.size>=256)this.memory.delete(this.memory.keys().next().value!);this.memory.set(key,drops)}
 take(key:string):StoredDrop[]{let drops=this.memory.get(key)??[];this.memory.delete(key);try{const data=this.storage?.getItem(this.prefix+key);if(data){drops=JSON.parse(data);this.storage!.removeItem(this.prefix+key)}}catch{/* Preserve fallback when storage is unavailable. */}return drops}
 clear(){this.memory.clear();try{if(this.storage)for(let i=this.storage.length-1;i>=0;i--){const k=this.storage.key(i);if(k?.startsWith(this.prefix))this.storage.removeItem(k)}}catch{/* Session storage will be discarded by the browser. */}}
}
