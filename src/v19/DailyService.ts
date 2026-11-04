import {DAILY_POOL} from './DailyDefinitions';import type {GameEvent19} from './Events';
export interface DailyEntry {day:string;id:string;progress:number;claimed:boolean}
interface Storage {getItem(k:string):string|null;setItem(k:string,v:string):void}
const KEY='hotline-daily-v1';
/** UTC calendar schedule: restarting never rerolls objectives. Old completed rewards survive rollover. */
export class DailyService {
 entries:DailyEntry[]=[];day='';persisted=true;
 constructor(private storage?:Storage,private now=()=>Date.now()){try{const raw=JSON.parse(storage?.getItem(KEY)??'null');this.day=typeof raw?.day==='string'?raw.day:'';this.entries=Array.isArray(raw?.entries)?raw.entries.filter((e:DailyEntry)=>DAILY_POOL.some(d=>d.id===e.id)&&/^\d{4}-\d{2}-\d{2}$/.test(e.day)).map((e:DailyEntry)=>({...e,progress:Math.max(0,Math.min(this.definition(e).target,Number.isFinite(e.progress)?Math.floor(e.progress):0)),claimed:e.claimed===true})):[]}catch{}this.refresh()}
 definition(e:DailyEntry){return DAILY_POOL.find(d=>d.id===e.id)!}
 private save(){try{this.storage?.setItem(KEY,JSON.stringify({day:this.day,entries:this.entries}));this.persisted=!!this.storage}catch{this.persisted=false}}
 refresh(){const day=new Date(this.now()).toISOString().slice(0,10);if(day===this.day)return;this.entries=this.entries.filter(e=>!e.claimed&&e.progress>=this.definition(e).target).slice(-96);this.day=day;let seed=Math.floor(Date.parse(day)/86400000),pool=[...DAILY_POOL];for(let i=0;i<3;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const d=pool.splice(seed%pool.length,1)[0];this.entries.push({day,id:d.id,progress:0,claimed:false})}this.save()}
 event(e:GameEvent19){this.refresh();let completed=0;for(const row of this.entries){const d=this.definition(row);if(row.day!==this.day||row.claimed||row.progress>=d.target||d.event!==e.type||d.accept&&!d.accept(e))continue;row.progress=Math.min(d.target,row.progress+(e.type==='boss'?1:e.value??1));if(row.progress===d.target)completed++}this.save();return completed}
 claim(row:DailyEntry,wallet:{awardOnce:(id:string,amount:number)=>boolean}){this.refresh();if(!this.entries.includes(row)||row.claimed||row.progress<this.definition(row).target)return false;if(!wallet.awardOnce('daily:'+row.day+':'+row.id,this.definition(row).reward))return false;row.claimed=true;this.save();return true}
 get remaining(){return Math.max(0,Date.parse(this.day)+86400000-this.now())}
}
