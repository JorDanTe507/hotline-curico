import {hash} from './WorldModel';

export const cityRules={lightningWarning:1500,strikeRadius:70,trafficWarning:2300,trafficSpeed:290,
  restockMs:18*60000,restockExploration:5,maxRefills:2,stormRest:90000};
export function streamRandom(seed:number,salt:number){
 let counter=0;return ()=>hash(seed,salt,counter++)/4294967296;
}
export type Sky='clear'|'rain'|'storm'|'calm';
export class StreetClimate {
 sky:Sky='clear';changeAt:number;strikeAt=Infinity;trafficAt:number;safeUntil=0;
 private weather;private traffic;
 constructor(seed:number){
  this.weather=streamRandom(seed,3101);this.traffic=streamRandom(seed,3102);
  this.changeAt=60000+this.weather()*60000;this.trafficAt=this.nextTraffic(0);
 }
 private nextTraffic(now:number){return now+120000+this.traffic()*120000}
 advance(now:number){
  if(now>=this.changeAt){
   this.sky=this.sky==='clear'?'rain':this.sky==='rain'?'storm':this.sky==='storm'?'calm':'clear';
   this.changeAt=now+(this.sky==='calm'?cityRules.stormRest:this.sky==='storm'?45000:60000)+this.weather()*60000;
   this.strikeAt=this.sky==='storm'?now+6000:Infinity;
  }
  const strike=now>=this.strikeAt,traffic=now>=this.trafficAt;
  if(strike)this.strikeAt=now+12000+this.weather()*15000;
  if(traffic)this.trafficAt=this.nextTraffic(now);
  return {strike,traffic};
 }
 reserve(now:number,duration:number,double:boolean){
  if(now<this.safeUntil)return false;
  this.safeUntil=now+duration+(double?9000:4000);return true;
 }
}
export class SectorSupplies {
 readonly visited=new Set<string>();
 readonly used=new Map<string,{count:number;at:number;explored:number}>();
 ready(key:string,now:number){
  const row=this.used.get(key);
  return !row||row.count<=cityRules.maxRefills&&now-row.at>=cityRules.restockMs&&this.visited.size-row.explored>=cityRules.restockExploration;
 }
 claim(key:string,now:number){
  if(!this.ready(key,now))return false;
  this.used.set(key,{count:(this.used.get(key)?.count??0)+1,at:now,explored:this.visited.size});return true;
 }
 snapshot(){return {version:1,visited:[...this.visited],used:[...this.used]} as const}
 static from(snapshot:ReturnType<SectorSupplies['snapshot']>){
  if(snapshot?.version!==1||!Array.isArray(snapshot.visited)||!Array.isArray(snapshot.used))throw Error('Estado sectorial incompatible');
  const state=new SectorSupplies();for(const key of snapshot.visited){
   if(typeof key!=='string'||state.visited.has(key))throw Error('Sector inválido');state.visited.add(key);
  }
  for(const [key,row] of snapshot.used){
   if(typeof key!=='string'||state.used.has(key)||!Number.isInteger(row.count)||row.count<1||row.count>3||
      !Number.isFinite(row.at)||row.at<0||!Number.isInteger(row.explored)||row.explored<0||row.explored>state.visited.size)throw Error('Reposición inválida');
   state.used.set(key,{...row});
  }
  return state;
 }
}
