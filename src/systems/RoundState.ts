import {REST_DURATION} from '../config/dynamicRounds';
export type RoundType='EXTERMINIO'|'SUPERVIVENCIA'|'BOSS';
export type RoundPhase='combat'|'rest'|'boss-intro'|'stopped';
export function roundPlan(round:number):{type:RoundType;target:number;duration:number}{if(round%5===0)return {type:'BOSS',target:1,duration:0};const cycle=Math.floor((round-1)/5),slot=round%5;if(slot===1||slot===3)return {type:'EXTERMINIO',target:15+5*(cycle*2+(slot===3?1:0)),duration:0};return {type:'SUPERVIVENCIA',target:0,duration:(90+30*(cycle*2+(slot===4?1:0)))*1000}}
export class RoundState {
 round=0;plan=roundPlan(1);phase:RoundPhase='stopped';kills=0;pending=0;endsAt=0;restUntil=0;
 begin(round:number,now:number){this.round=round;this.plan=roundPlan(round);this.kills=0;this.pending=this.plan.type==='EXTERMINIO'?this.plan.target:0;this.phase=this.plan.type==='BOSS'?'boss-intro':'combat';this.endsAt=this.plan.type==='SUPERVIVENCIA'?now+this.plan.duration:0;this.restUntil=0}
 fight(){if(this.phase==='boss-intro')this.phase='combat'}
 recordKill(round:number){if(this.phase==='combat'&&round===this.round)this.kills++}
 complete(alive:number,now:number){if(this.phase!=='combat')return false;if(this.plan.type==='SUPERVIVENCIA')return now>=this.endsAt;return this.kills>=this.plan.target&&this.pending===0&&alive===0}
 rest(now:number){this.phase='rest';this.restUntil=now+REST_DURATION}
 next(now:number){return this.phase==='rest'&&now>=this.restUntil}
 stop(){this.phase='stopped';this.pending=0;this.endsAt=0;this.restUntil=0}
}
export function clockText(ms:number){const seconds=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`}
