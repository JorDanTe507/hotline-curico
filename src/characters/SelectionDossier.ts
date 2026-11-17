import {permanentProgress,type PermanentProgress} from '../systems/PermanentProgress';
import {developerSession} from '../systems/DeveloperSession';
import {newRun} from '../systems/run';
import {CHARACTERS} from './catalog';
import {createAbility} from './abilities';
import type {Judgment} from '../v20/Judgment';

export const SELECTION_SLOTS=12;
export const ENTRY_FRAME_MS=170;
/** Presentation state only; deliberately independent of the playable character catalog. */
export class SelectionVisit {
 readonly seen=new Set<number>();
 index:number|undefined;
 private started=0;
 private animate=false;
 focus(index:number,now:number){
  if(index<0||index>=SELECTION_SLOTS||index===this.index)return;
  this.index=index;this.animate=index<CHARACTERS.length&&!this.seen.has(index);this.started=now;
  if(index<CHARACTERS.length)this.seen.add(index);
 }
 visual(now:number){
  const character=this.index===undefined?undefined:CHARACTERS[this.index];
  if(!character)return {key:'',frame:5,offset:0,playing:false};
  const elapsed=Math.max(0,now-this.started),playing=this.animate&&elapsed<6*ENTRY_FRAME_MS;
  const frame=playing?Math.min(5,Math.floor(elapsed/ENTRY_FRAME_MS)):5;
  return {key:playing?`dossier-${character.id}-entry-${frame}`:`dossier-${character.id}-entry-5`,frame,playing,
   offset:playing?[-145,-104,-68,-35,-12,0][frame]:0};
 }
}

/** Read the existing stats/ability objects. Display base values rather than inventing relative bars. */
export function selectionDossier(index:number|undefined,mode:'traditional'|'rush'='traditional',progress?:PermanentProgress){
 const c=index===undefined?undefined:CHARACTERS[index];
 if(!c)return {name:'DESCONOCIDO',description:'NO EXISTEN REGISTROS DISPONIBLES',ability:'CLASIFICADA',
  detail:'Información reservada. Este operativo no está disponible.',stats:[] as [string,string][],locked:true,note:'EXPEDIENTE CLASIFICADO'};
 const base=c.stats(),useBase=mode==='rush'||developerSession.active&&developerSession.baseStats;
 const stats=useBase?{...base}:(progress??permanentProgress()).apply(c.id,{...base});
 const run=newRun();run.stats=stats;run.health=stats.maxHealth;const ability=createAbility(c,()=>stats,()=>run);
 const bonus=stats.maxHealth-base.maxHealth;const note=mode==='rush'?'BOSS RUSH · SIN MEJORAS PERMANENTES':useBase?'PRUEBA · ESTADÍSTICAS BASE':'MEJORAS PERMANENTES APLICADAS';
 const seconds=(ms:number)=>`${ms/1000} s`;
 const detail=c.ability.module==='calada'
  ?`Recupera ${ability.healRate} HP/s. Munición infinita y fuego con dos armas durante ${seconds(ability.duration)}.`
  :c.ability.module==='tryhard'
  ?`Daño ×${ability.weaponMultiplier}; velocidad ×${ability.movementMultiplier}. ${seconds(ability.duration)} iniciales, ampliables al eliminar enemigos.`
  :`Control temporal y ejecuciones encadenadas durante ${seconds(ability.duration)}. Recupera ${Math.round((ability as Judgment).executionHeal*100)}% de vida por ejecución normal.`;
 return {name:c.name,description:c.selectionDescription,ability:c.ability.name,detail,locked:false,note,
  stats:[['VIDA',`${stats.maxHealth} HP${bonus?' (+'+bonus+')':''}`],['ESCUDO INIC.',`${run.armor} / ${stats.maxArmor}`],['DAÑO FUEGO',`+${Math.round((stats.permanentFireDamage??0)*100)}%`],
   ['MOVILIDAD',`×${stats.speed}`],['REC. DASH',`−${Math.round((stats.permanentDash??0)*100)}%`]] as [string,string][]};
}
