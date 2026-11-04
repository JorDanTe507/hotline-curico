export interface DailyDefinition {id:string;name:string;description:string;event:string;target:number;reward:number;icon:string;accept?:(e:{weapon?:number;throwable?:number;method?:string})=>boolean}
export const DAILY_POOL:DailyDefinition[]=[
 {id:'kills',name:'Limpieza de barrio',description:'Elimina 50 enemigos.',event:'kill',target:50,reward:150,icon:'daily-kill'},
 {id:'throwables',name:'Arsenal del caos',description:'Elimina 20 enemigos con arrojadizos.',event:'throwable-kill',target:20,reward:200,icon:'daily-throwable'},
 {id:'rounds',name:'Sigue respirando',description:'Completa cinco rondas.',event:'round',target:5,reward:150,icon:'daily-survive'},
 {id:'boss',name:'Cara a cara',description:'Derrota a un jefe.',event:'boss',target:1,reward:150,icon:'daily-boss'},
 {id:'shotgun',name:'A quemarropa',description:'Elimina 20 enemigos con escopeta.',event:'kill',target:20,reward:150,icon:'daily-weapon',accept:e=>[3,10].includes(e.weapon??-1)},
 {id:'barrels',name:'Dominó rojo',description:'Detona cinco barriles.',event:'barrel',target:5,reward:100,icon:'daily-throwable'},
 {id:'knives',name:'Nada se desperdicia',description:'Recupera cinco cuchillos.',event:'knife-recover',target:5,reward:100,icon:'daily-throwable'},
 {id:'interrupt',name:'Silencio de radio',description:'Interrumpe una llamada eliminando al radioperador.',event:'radio-interrupt',target:1,reward:150,icon:'daily-special'},
 {id:'supply',name:'Recibido',description:'Usa una radio de suministros.',event:'radio-use',target:1,reward:100,icon:'daily-special'}
];
