export type Weather='clear'|'rain'|'fog';
export type CityEvent='blackout'|'flicker'|'weather-pulse'|'ambush'|'reinforcements';
export const CITY={weatherWeights:[40,35,25],weatherMinRounds:2,weatherMaxRounds:4,transition:3500,blackoutMin:20000,blackoutMax:45000,cooldown:45000,sectorCooldown:90000,combatCooldown:90000,eventMinRound:2,combatMinRound:3,maxExtraPerRound:4,spawnWarning:1800,eventEnemyCap:20,minSpawnDistance:650,maxSpawnDistance:1200,criticalRatio:.35};
export interface DirectorContext {round:number;now:number;healthRatio:number;armor:number;alive:number;boss:boolean;combat:boolean;sector:string;weather:Weather;quality:number}
export class WeatherCycle {
 weather:Weather='clear';untilRound=0;lastRound=0;
 constructor(private random=Math.random){}
 beginRound(round:number,boss=false){if(round<=this.lastRound)return false;this.lastRound=round;if(boss||round<this.untilRound)return false;let ticket=this.random()*CITY.weatherWeights.reduce((a,b)=>a+b,0),index=0;for(;index<2;index++){ticket-=CITY.weatherWeights[index];if(ticket<0)break}this.weather=(['clear','rain','fog'] as const)[index];this.untilRound=round+CITY.weatherMinRounds+Math.floor(this.random()*(CITY.weatherMaxRounds-CITY.weatherMinRounds+1));return true}
 force(weather:Weather,round:number){this.weather=weather;this.untilRound=round+3;this.lastRound=round}
}
export interface SectorEvent {kind:CityEvent;started:number;until:number;resolved:boolean}
export class EventDirector {
 readonly sectors=new Map<string,SectorEvent>();nextAt=30000;combatReadyAt=0;last?:CityEvent;lastRound=0;extraThisRound=0;history:{sector:string;kind:CityEvent;at:number}[]=[];
 constructor(private random=Math.random){}
 tick(c:DirectorContext):CityEvent|undefined{for(const e of this.sectors.values())if(!e.resolved&&c.now>=e.until)e.resolved=true;if(c.round!==this.lastRound){this.lastRound=c.round;this.extraThisRound=0}if(!c.combat||c.round<CITY.eventMinRound||c.now<this.nextAt)return;const prior=this.sectors.get(c.sector);if(prior&&(!prior.resolved||c.now<prior.started+CITY.sectorCooldown))return;const safe=c.healthRatio>CITY.criticalRatio&&c.alive<12&&c.quality>0&&!c.boss&&c.round>=CITY.combatMinRound&&c.now>=this.combatReadyAt&&this.extraThisRound<CITY.maxExtraPerRound;
 const pool:CityEvent[]=['blackout','flicker','weather-pulse'];if(safe&&this.random()<.3)pool.push('ambush','reinforcements');const options=pool.filter(k=>k!==this.last),kind=options[Math.floor(this.random()*options.length)];return this.start(kind,c)?kind:undefined}
 start(kind:CityEvent,c:DirectorContext,forced=false){if(c.round!==this.lastRound){this.lastRound=c.round;this.extraThisRound=0}const fight=kind==='ambush'||kind==='reinforcements',prior=this.sectors.get(c.sector);if(!c.combat||(prior&&!prior.resolved)||fight&&(c.boss||c.healthRatio<=CITY.criticalRatio||c.alive>=CITY.eventEnemyCap||this.extraThisRound>=CITY.maxExtraPerRound||(!forced&&c.now<this.combatReadyAt)))return false;const duration=kind==='blackout'?CITY.blackoutMin+this.random()*(CITY.blackoutMax-CITY.blackoutMin):fight?12000:7000;this.sectors.set(c.sector,{kind,started:c.now,until:c.now+duration,resolved:false});this.last=kind;this.nextAt=c.now+CITY.cooldown;if(fight)this.combatReadyAt=c.now+CITY.combatCooldown;this.history.push({sector:c.sector,kind,at:c.now});if(this.history.length>64)this.history.shift();return true}
 blackout(sector:string,now:number){const e=this.sectors.get(sector);return !!e&&!e.resolved&&e.kind==='blackout'&&now<e.until}
 restore(sector:string){const e=this.sectors.get(sector);if(e)e.resolved=true}
 resolve(sector:string){this.restore(sector)}
}
/** Stable windows and hysteresis; elapsed values supplied only during active gameplay. */
export class EffectQuality {
 level=2;average=16.7;private elapsed=0;private samples=0;private total=0;private stable=0;
 update(ms:number){if(ms<=0||ms>250)return;this.elapsed+=ms;this.total+=ms;this.samples++;this.stable+=ms;if(this.elapsed<4000)return;this.average=this.total/this.samples;this.elapsed=this.total=this.samples=0;if(this.stable<12000)return;if(this.average>28&&this.level>0){this.level--;this.stable=0}else if(this.average<19&&this.level<2){this.level++;this.stable=0}}
 get budget(){return [{rain:24,fog:1,reflections:false},{rain:55,fog:1,reflections:true},{rain:100,fog:2,reflections:true}][this.level]}
}
