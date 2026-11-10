import type {CharacterId} from '../characters/catalog';
import {RUSH_BOSSES} from './config';

export interface EndlessRun {
  cleared: number; kills: number; doubles: number; damage: number; falls: number;
  combatMs: number; totalMs: number; clean: number; history: number[][];
  relays?:{from:CharacterId;to:CharacterId;cleared:number}[];
}
export const newEndless = (): EndlessRun => ({cleared:0,kills:0,doubles:0,damage:0,falls:0,combatMs:0,totalMs:0,clean:0,history:[]});
export const endlessCycle = (cleared:number) => Math.floor(cleared/3)+1;
export function endlessScale(cycle:number) {
  const anchors = [[1,1,1,1],[3,1.15,1.1,1.08],[5,1.30,1.20,1.15],[8,1.45,1.30,1.20],[10,1.50,1.35,1.25]];
  const i = anchors.findIndex(a=>a[0]>=cycle);
  if (i<=0) return (i===0?anchors[0]:anchors[4]).slice(1);
  const [from,...a]=anchors[i-1],[to,...b]=anchors[i],t=(cycle-from)/(to-from);
  return a.map((n,j)=>n+(b[j]-n)*t);
}
export const doubleChance = (cleared:number) => cleared<6?0:cleared<9?.18:cleared<12?.35:Math.min(.68,.55+Math.max(0,endlessCycle(cleared)-10)*.01);
export function selectEncounter(run:EndlessRun, random=Math.random) {
  const pool=RUSH_BOSSES.filter(b=>b.available).map(b=>Number(b.id));
  const previous=run.history.at(-1)??[];
  const single=pool.filter(id=>!previous.includes(id));
  const eligible=single.length?single:pool;
  const wantsDouble=random()<doubleChance(run.cleared);
  const pairs=eligible.flatMap((a,i)=>eligible.slice(i+1).filter(b=>a!==5&&b!==5).map(b=>[a,b]));
  const options=wantsDouble&&pairs.length?pairs:eligible.map(id=>[id]);
  const score=(ids:number[])=>run.history.reduce((sum,entry,i)=>sum+
    ids.filter(id=>entry.includes(id)).length*(i+1)+
    (ids.length===2&&entry.length===2&&ids.every(id=>entry.includes(id))?12:0),0);
  const minimum=Math.min(...options.map(score));
  const best=options.filter(ids=>score(ids)===minimum);
  return [...best[Math.floor(random()*best.length)]];
}
export function validEndless(value:unknown): value is EndlessRun {
  const v=value as EndlessRun|null;
  const ids=['cervela','nicolas','jordan'];
  if(v?.relays!==undefined&&(!Array.isArray(v.relays)||!v.relays.every(r=>r&&ids.includes(r.from)&&ids.includes(r.to)&&r.from!==r.to&&Number.isSafeInteger(r.cleared)&&r.cleared>=0&&r.cleared<=v.cleared)))return false;
  const finite=(n:number)=>Number.isFinite(n)&&n>=0;
  return !!v&&[v.cleared,v.kills,v.doubles,v.falls,v.clean].every(n=>finite(n)&&Number.isSafeInteger(n))&&
    [v.damage,v.combatMs,v.totalMs].every(finite)&&v.doubles<=v.cleared&&v.kills===v.cleared+v.doubles&&
    v.clean<=v.cleared&&Array.isArray(v.history)&&v.history.length<=8&&v.history.every(ids=>Array.isArray(ids)&&
      ids.length>=1&&ids.length<=2&&new Set(ids).size===ids.length&&ids.every(id=>RUSH_BOSSES.some(b=>b.id===id))&&
      (ids.length===1||!ids.includes(5)));
}
export interface EndlessResult extends EndlessRun {
  character: CharacterId; reason:'derrota'|'retirada'; date:string; bestCycle:number;
}
export const compareEndless=(a:EndlessResult,b:EndlessResult)=>
  b.cleared-a.cleared||a.damage-b.damage||a.falls-b.falls||a.combatMs-b.combatMs;
const KEY='hotline-rush-endless-records-v1';
export function endlessRecords(storage:Storage=localStorage):EndlessResult[] {
  try {
    const rows=JSON.parse(storage.getItem(KEY)??'[]');
    return Array.isArray(rows)?(rows as EndlessResult[]).filter(r=>validEndless(r)&&['cervela','nicolas','jordan'].includes(r.character)&&
      ['derrota','retirada'].includes(r.reason)&&Number.isFinite(Date.parse(r.date))).sort(compareEndless):[];
  } catch {return []}
}
export function saveEndless(result:EndlessResult,storage:Storage=localStorage) {
  const rows=[...endlessRecords(storage),result].sort(compareEndless);
  const kept=[...['cervela','nicolas','jordan'].flatMap(id=>rows.filter(r=>r.character===id&&!r.relays?.length).slice(0,10)),...rows.filter(r=>r.relays?.length).slice(0,10)];
  try {storage.setItem(KEY,JSON.stringify(kept));} catch {/* Storage optional. */}
}
