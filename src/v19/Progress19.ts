import {DailyService} from './DailyService';import {events19} from './Events';import {developerSession} from '../systems/DeveloperSession';import {achievements} from '../systems/Achievements';
let daily:DailyService|undefined,trialDaily:DailyService|undefined;
export function dailies(){let storage:Storage|undefined;try{storage=localStorage}catch{}if(developerSession.active){if(!trialDaily)trialDaily=new DailyService({getItem:key=>storage?.getItem(key)??null,setItem:()=>{}});return trialDaily}if(!daily)daily=new DailyService(storage);return daily}
let started=false;
export function startProgress19(){if(started)return;started=true;events19.on(e=>{if(developerSession.active)return;const completed=dailies().event(e);achievements().event({type:'v19:'+e.type,value:e.value??1,character:e.character,weapon:e.weapon,method:e.method,boss:e.boss!==undefined});if(completed)achievements().event({type:'v19:daily',value:completed})})}
