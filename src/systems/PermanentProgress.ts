import {achievements} from './Achievements';
import {developerSession} from './DeveloperSession';
import {ECONOMY,PERMANENT,upgradeCost,type PermanentCharacter} from '../config/permanent';
import type {PlayerStats} from '../config/progression';
export interface PermanentSave {version:number;currency:number;characters:Record<PermanentCharacter,Record<string,number>>}
interface StorageLike {getItem(key:string):string|null;setItem(key:string,value:string):void}
const integer=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(0,Math.floor(v))):0;
export function migratePermanent(raw:unknown):PermanentSave {
 const data=raw as Partial<PermanentSave>|null,out:PermanentSave={version:1,currency:integer(data?.currency,Number.MAX_SAFE_INTEGER),characters:{cervela:{},nicolas:{}}};
 for(const id of ['cervela','nicolas'] as const)for(const [key,,,max] of PERMANENT[id])out.characters[id][key]=integer(data?.characters?.[id]?.[key],max);
 return out;
}
/** One atomic JSON snapshot per purchase/reward. Failure keeps play usable in memory. */
export class PermanentProgress {
 data:PermanentSave;persisted=true;
 constructor(private storage?:StorageLike,readonly testing=false,initialize=true){let raw:unknown;try{raw=JSON.parse(storage?.getItem(ECONOMY.key)??'null')}catch{}this.data=migratePermanent(raw);if(initialize)this.save()}
 private save(){if(this.testing){this.persisted=true;return}try{if(this.storage)this.storage.setItem(ECONOMY.key,JSON.stringify(this.data));this.persisted=!!this.storage}catch{this.persisted=false}}
 level(id:PermanentCharacter,key:string){return this.data.characters[id][key]??0}
 purchase(id:PermanentCharacter,key:string){const definition=PERMANENT[id].find(d=>d[0]===key);if(!definition)return false;const level=this.level(id,key),cost=upgradeCost(level);if(level>=definition[3]||this.data.currency<cost)return false;this.data.currency-=cost;this.data.characters[id][key]=level+1;this.save();if(!this.testing)achievements().event({type:'purchase',character:id,maxed:PERMANENT[id].every(d=>this.level(id,d[0])>=d[3])});return true}
 award(amount:number){const valid=integer(amount,Number.MAX_SAFE_INTEGER-this.data.currency);this.data.currency+=valid;this.save();return valid}
 apply(id:PermanentCharacter,stats:PlayerStats){const l=this.data.characters[id];stats.rerolls=1+(l.rerolls??0);stats.permanentHealth=10*l.vitality;stats.maxHealth+=stats.permanentHealth;stats.permanentFireDamage=(id==='cervela'?.03:.04)*l.damage;stats.permanentDash=.03*l.dash;stats.dashReduction+=stats.permanentDash;
 if(id==='cervela'){stats.ultimateHeal+=l.regeneration;stats.ultimateDuration+=500*l.ultimateDuration;stats.caladaReduction=.4+.02*l.damageReduction}
 else{stats.tryhardMultiplier=5+.25*l.overload;stats.tryhardSpeed=1.25+.03*l.adrenaline;stats.tryhardDuration=8000+500*l.ultimateDuration}
 return stats}
}
let shared:PermanentProgress|undefined,trial:PermanentProgress|undefined;
export function permanentProgress(){if(!shared){let storage:StorageLike|undefined;try{storage=globalThis.localStorage}catch{}shared=new PermanentProgress(storage,false,!developerSession.active)}if(developerSession.active){if(!trial){trial=new PermanentProgress(undefined,true);trial.data=migratePermanent(shared.data);trial.data.currency=1_000_000}return trial}return shared}
export class RunEconomy {
 earned=0;completedRounds=0;private enemies=new WeakSet<object>();private completed=new Set<number>();private milestones=new Set<number>();
 constructor(private progress:PermanentProgress){}
 private grant(amount:number){this.earned+=this.progress.award(amount)}
 defeated(enemy:{hp:number;boss:number}){if(enemy.hp>0||this.enemies.has(enemy))return false;this.enemies.add(enemy);this.grant(enemy.boss>=0?ECONOMY.bossKill:ECONOMY.normalKill);return true}
 special(){this.grant(50)}
 reached(round:number){if(round>0&&round%5===0&&!this.milestones.has(round)){this.milestones.add(round);this.grant(ECONOMY.milestone)}}
 complete(round:number,type:string){if(this.completed.has(round))return false;this.completed.add(round);this.completedRounds++;this.grant(type==='EXTERMINIO'?ECONOMY.extermination:type==='SUPERVIVENCIA'?ECONOMY.survival:0);return true}
}
