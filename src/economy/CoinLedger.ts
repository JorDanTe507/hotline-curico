export interface Point {x:number;y:number}
export interface Coin extends Point {id:number;value:number;speed:number;owner?:number}
export interface Collector extends Point {id:number;radius:number;speed:number}
export interface CoinSnapshot {version:1;next:number;coins:{id:number;x:number;y:number;value:number}[]}
export const MAGNET={base:48,permanent:[0,8,16,24,32,40],radius:[0,24,48,72,104],speed:[1,1.1,1.2,1.4,1.65],cap:192,pocketChance:.025} as const;
export function magneticProfile(permanent=0,perk=0){const p=Math.min(5,Math.max(0,Math.floor(permanent))),l=Math.min(4,Math.max(0,Math.floor(perk)));return {radius:Math.min(MAGNET.cap,MAGNET.base+MAGNET.permanent[p]+MAGNET.radius[l]),speed:MAGNET.speed[l]}}
const valid=(n:number)=>Number.isSafeInteger(n)&&n>0;
/** Run-owned values; sprites are optional views. Removal precedes any credit callback. */
export class CoinLedger {
 readonly coins=new Map<number,Coin>();private buckets=new Map<string,Set<number>>();private next=1;private taken=new WeakSet<Coin>();
 inspections=0;merges=0;generated=0;collected=0;
 private key(p:Point){return `${Math.floor(p.x/192)},${Math.floor(p.y/192)}`}
 private index(c:Coin){const k=this.key(c),b=this.buckets.get(k)??new Set<number>();b.add(c.id);this.buckets.set(k,b)}
 private unindex(c:Coin){const k=this.key(c),b=this.buckets.get(k);b?.delete(c.id);if(!b?.size)this.buckets.delete(k)}
 near(p:Point,r:number){const out:Coin[]=[];for(let y=Math.floor((p.y-r)/192);y<=Math.floor((p.y+r)/192);y++)for(let x=Math.floor((p.x-r)/192);x<=Math.floor((p.x+r)/192);x++)for(const id of this.buckets.get(`${x},${y}`)??[]){const c=this.coins.get(id)!;this.inspections++;if(Math.hypot(c.x-p.x,c.y-p.y)<=r)out.push(c)}return out}
 deposit(value:number,p:Point,clear:(a:Point,b:Point)=>boolean){if(!valid(value)||!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error('Invalid HC deposit');if(this.generated>Number.MAX_SAFE_INTEGER-value)throw Error('HC overflow');const target=this.near(p,56).filter(c=>clear(c,p)).sort((a,b)=>a.id-b.id)[0];this.generated+=value;if(target){target.value+=value;this.merges++;return target}const c={id:this.next++,x:p.x,y:p.y,value,speed:0};this.coins.set(c.id,c);this.index(c);return c}
 take(id:number){const c=this.coins.get(id);if(!c)return;this.unindex(c);this.coins.delete(id);this.collected+=c.value;this.taken.add(c);return c}
 rollback(c:Coin){if(!this.taken.has(c)||this.coins.has(c.id))return false;this.taken.delete(c);this.coins.set(c.id,c);this.index(c);this.collected-=c.value;return true}
 step(ms:number,actors:Collector[],clear:(a:Point,b:Point)=>boolean,credit:(n:number,id:number,p:Point)=>unknown){const candidates=new Map<number,Coin>();for(const a of actors)for(const c of this.near(a,a.radius))candidates.set(c.id,c);const dt=Math.min(50,Math.max(0,ms))/1000;for(const c of candidates.values()){const a=actors.filter(a=>Math.hypot(a.x-c.x,a.y-c.y)<=a.radius&&clear(c,a)).sort((a,b)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(b.x-c.x,b.y-c.y)||a.id-b.id)[0];if(!a){c.owner=undefined;c.speed=0;continue}c.owner=a.id;const d=Math.hypot(a.x-c.x,a.y-c.y);if(d<=16){const taken=this.take(c.id);if(taken&&credit(taken.value,a.id,taken)===false)this.rollback(taken);continue}c.speed=Math.min(620*a.speed,c.speed+1100*a.speed*dt);const travel=Math.min(d-8,c.speed*dt),p={x:c.x+(a.x-c.x)/d*travel,y:c.y+(a.y-c.y)/d*travel};if(clear(c,p)){this.unindex(c);c.x=p.x;c.y=p.y;this.index(c)}}}
 get pending(){let n=0;for(const c of this.coins.values())n+=c.value;return n}
 snapshot():CoinSnapshot{return {version:1,next:this.next,coins:[...this.coins.values()].map(({id,x,y,value})=>({id,x,y,value}))}}
 static restore(raw:CoinSnapshot){if(raw?.version!==1||!Array.isArray(raw.coins)||raw.coins.length>100000)throw Error('Invalid coin snapshot');const out=new CoinLedger();for(const c of raw.coins){if(!valid(c.id)||!valid(c.value)||!Number.isFinite(c.x)||!Number.isFinite(c.y)||out.coins.has(c.id)||out.generated>Number.MAX_SAFE_INTEGER-c.value)throw Error('Invalid coin record');out.coins.set(c.id,{...c,speed:0});out.index(out.coins.get(c.id)!);out.generated+=c.value;out.next=Math.max(out.next,c.id+1)}return out}
 clear(){this.coins.clear();this.buckets.clear()}
}
