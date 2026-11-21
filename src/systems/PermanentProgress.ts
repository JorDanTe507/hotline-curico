import {SessionWallet} from '../economy/SessionWallet';
import {achievements} from './Achievements';
import {developerSession} from './DeveloperSession';
import {ECONOMY,PERMANENT,upgradeCost,type PermanentCharacter} from '../config/permanent';
import type {PlayerStats} from '../config/progression';
export interface PermanentSave {dailyClaims?:string[];version:number;currency:number;balances?:Record<PermanentCharacter,number>;activeCharacter?:PermanentCharacter;characters:Record<PermanentCharacter,Record<string,number>>}
interface StorageLike {getItem(key:string):string|null;setItem(key:string,value:string):void}
const integer=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(0,Math.floor(v))):0;
export function migratePermanent(raw:unknown):PermanentSave {
 const data=raw as Partial<PermanentSave>|null,out:PermanentSave={version:1,dailyClaims:Array.isArray(data?.dailyClaims)?data!.dailyClaims.filter(x=>typeof x==='string').slice(-512):[],currency:integer(data?.currency,Number.MAX_SAFE_INTEGER),characters:{cervela:{},nicolas:{},jordan:{}}};
 for(const id of Object.keys(PERMANENT) as PermanentCharacter[])for(const [key,,,max] of PERMANENT[id])out.characters[id][key]=integer(data?.characters?.[id]?.[key],max);
 out.version=2;out.balances={cervela:0,nicolas:0,jordan:0};for(const id of Object.keys(PERMANENT) as PermanentCharacter[])out.balances[id]=integer(data?.balances?.[id],Number.MAX_SAFE_INTEGER);out.activeCharacter=data?.activeCharacter&&data.activeCharacter in PERMANENT?data.activeCharacter:'cervela';
 return out;
}
/** One atomic JSON snapshot per purchase/reward. Failure keeps play usable in memory. */
export class PermanentProgress {
 data:PermanentSave;persisted=true;
 select(id:PermanentCharacter){this.data.activeCharacter=id;this.save()}
 balance(id:PermanentCharacter=this.data.activeCharacter??'cervela'){return this.data.balances?.[id]??0}
 claimLegacy(id:PermanentCharacter){const n=this.data.currency;if(n<=0||n>Number.MAX_SAFE_INTEGER-this.balance(id))return false;this.data.balances![id]=this.balance(id)+n;this.data.currency=0;this.save();return true}
 constructor(private storage?:StorageLike,readonly testing=false,initialize=true){let raw:unknown;try{raw=JSON.parse(storage?.getItem(ECONOMY.key)??'null')}catch{}this.data=migratePermanent(raw);if(initialize)this.save()}
 private save(){if(this.testing){this.persisted=true;return}try{if(this.storage)this.storage.setItem(ECONOMY.key,JSON.stringify(this.data));this.persisted=!!this.storage}catch{this.persisted=false}}
 awardOnce(id:string,amount:number){if(this.data.dailyClaims?.includes(id))return true;this.data.dailyClaims=[...(this.data.dailyClaims??[]),id].slice(-512);this.award(amount);return true}
 level(id:PermanentCharacter,key:string){return this.data.characters[id][key]??0}
 purchase(id:PermanentCharacter,key:string){const definition=PERMANENT[id].find(d=>d[0]===key);if(!definition)return false;const level=this.level(id,key),cost=upgradeCost(level);if(level>=definition[3]||this.balance(id)<cost)return false;this.data.balances![id]-=cost;this.data.characters[id][key]=level+1;this.save();if(!this.testing)achievements().event({type:'purchase',character:id,maxed:PERMANENT[id].every(d=>this.level(id,d[0])>=d[3])});return true}
 spend(amount:number,id:PermanentCharacter=this.data.activeCharacter??'cervela'){if(!Number.isSafeInteger(amount)||amount<=0||this.balance(id)<amount)return false;this.data.balances![id]-=amount;this.save();return true}
 award(amount:number,id:PermanentCharacter=this.data.activeCharacter??'cervela'){const valid=integer(amount,Number.MAX_SAFE_INTEGER-this.balance(id));this.data.balances![id]+=valid;this.save();return valid}
 transact(entries:{id:PermanentCharacter;amount:number}[]){const deltas=new Map<PermanentCharacter,number>();for(const e of entries){if(!(e.id in this.data.characters)||!Number.isSafeInteger(e.amount))return false;deltas.set(e.id,(deltas.get(e.id)??0)+e.amount)}for(const [id,n] of deltas){const next=this.balance(id)+n;if(!Number.isSafeInteger(next)||next<0)return false}for(const [id,n] of deltas)this.data.balances![id]+=n;this.save();return true}
 apply(id:PermanentCharacter,stats:PlayerStats){const l=this.data.characters[id];stats.magnetLevel=l.magnet??0;stats.rerolls=1+(l.rerolls??0);stats.permanentHealth=10*l.vitality;stats.maxHealth+=stats.permanentHealth;stats.permanentFireDamage=(id==='nicolas'?.04:.03)*l.damage;stats.permanentDash=.03*l.dash;stats.dashReduction+=stats.permanentDash;
 if(id==='cervela'){stats.ultimateHeal+=l.regeneration;stats.ultimateDuration+=500*l.ultimateDuration;stats.caladaReduction=.4+.02*l.damageReduction}
 else if(id==='jordan'){stats.judgmentHeal=.005*l.executionHeal;stats.judgmentChain=100*l.chainTime;stats.judgmentDuration=500*l.ultimateDuration}
 else{stats.tryhardMultiplier=5+.25*l.overload;stats.tryhardSpeed=1.25+.03*l.adrenaline;stats.tryhardDuration=8000+500*l.ultimateDuration}
 return stats}
}
let shared:PermanentProgress|undefined,trial:PermanentProgress|undefined;
export function permanentProgress(){if(!shared){let storage:StorageLike|undefined;try{storage=globalThis.localStorage}catch{}shared=new PermanentProgress(storage,false,!developerSession.active)}if(developerSession.active){if(!trial){trial=new PermanentProgress(undefined,true);trial.data=migratePermanent(shared.data);trial.data.balances={cervela:1_000_000,nicolas:1_000_000,jordan:1_000_000}}return trial}return shared}
export class RunEconomy {
 earned=0;completedRounds=0;private enemies=new WeakSet<object>();private completed=new Set<number>();private milestones=new Set<number>();
 wallet:SessionWallet;defer?:(amount:number,x:number,y:number)=>void;
 constructor(private progress:PermanentProgress,private character:PermanentCharacter='cervela'){this.wallet=new SessionWallet(progress,[character])}
 get balance(){return this.wallet.balance}
 spend(amount:number){return this.wallet.spend(amount)}
 refund(amount:number){return this.wallet.refund(amount)}
 collect(amount:number){return this.grant(amount)}
 private grant(amount:number){const n=this.wallet.credit(amount);this.earned+=n;return n}
 defeated(enemy:{hp:number;boss:number},x=0,y=0){if(enemy.hp>0||this.enemies.has(enemy))return false;this.enemies.add(enemy);const amount=enemy.boss>=0?ECONOMY.bossKill:ECONOMY.normalKill;if(this.defer)this.defer(amount,x,y);else this.grant(amount);return true}
 supply(amount:number){this.grant(amount)}
 special(x=0,y=0){if(this.defer)this.defer(50,x,y);else this.grant(50)}
 reached(round:number){if(round>0&&round%5===0&&!this.milestones.has(round)){this.milestones.add(round);this.grant(ECONOMY.milestone)}}
 complete(round:number,type:string){if(this.completed.has(round))return false;this.completed.add(round);this.completedRounds++;this.grant(type==='EXTERMINIO'?ECONOMY.extermination:type==='SUPERVIVENCIA'?ECONOMY.survival:0);return true}
}
