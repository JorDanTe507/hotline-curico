import {RUSH_BOSSES} from './config';
import {BOSS_DEFINITIONS} from '../bosses/expansion';
import {bossPortraits} from '../ui/MenuPresentation';
export const CRT_SOURCE={width:1448,height:1086,x:350,y:145,widthSafe:650,heightSafe:460} as const;
export class CriminalAccess {
 private started?:number;
 enter(now:number){if(this.started===undefined)this.started=now}
 skip(){this.started=-Infinity}
 view(now:number){const elapsed=this.started===undefined?0:now-this.started;return {ready:elapsed>=1150,
  bullets:'●'.repeat(Math.max(0,Math.min(7,Math.floor((elapsed-180)/95)))),
  status:elapsed<180?'ENCENDIENDO TERMINAL':elapsed<900?'VERIFICANDO ACCESO':'ACCESO AUTORIZADO'}}
}
export function criminalFile(index:number,unlocked:number){
 const boss=RUSH_BOSSES[index];if(!boss)return undefined;
 const available=boss.available&&index<unlocked;
 return {index,number:'BR-'+String(index+1).padStart(3,'0'),available,name:available?boss.name.toUpperCase():'EXPEDIENTE RESTRINGIDO',
  arena:available?boss.arena:'INFORMACIÓN CENSURADA',weapon:available?(index===5?'PROYECTO UROBOROS':BOSS_DEFINITIONS[index].weaponName):'CLASIFICADA',
  portrait:bossPortraits[index],...(available?FILE_NARRATIVES[index]:{operation:'',threat:'',description:''})};
}
/** Flavour text only: these classifications never feed combat or progression. */
export const FILE_NARRATIVES=[
 {operation:'SILENCIO EN EL PABELLÓN',threat:'VIOLENCIA CERCANA',description:'Entre rejas y rastros de experimentación, el objetivo convierte el castigo en su respuesta.'},
 {operation:'ROMPER EL CERCO',threat:'CONTROL MILITAR',description:'Desde su cuartel, el Comandante sostiene una posición que solo cede ante una ofensiva decidida.'},
 {operation:'ZONA DE IMPACTO',threat:'EXPLOSIVOS',description:'La planta industrial es su arsenal. Cada lanzamiento obliga a abandonar terreno seguro.'},
 {operation:'CORTE DE SUMINISTRO',threat:'ENTORNO HOSTIL',description:'La subestación esconde al Verdugo entre humo, sombras y descargas. Vigila los espacios abiertos.'},
 {operation:'ÚLTIMO TURNO',threat:'PERSECUCIÓN',description:'El matadero sigue abierto. Su encargado no piensa dejar salir al próximo visitante.'},
 {operation:'ARCHIVO UROBOROS',threat:'CONTENCIÓN CRÍTICA',description:'La comisaría guarda un objetivo ligado a Umbrella. El expediente no termina con su apariencia humana.'},
] as const;
