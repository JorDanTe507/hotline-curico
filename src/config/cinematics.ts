import type {CharacterId} from '../characters/catalog';import {ULTIMATE_PRESENTATION_DURATION} from './dynamicRounds';
export interface CinematicConfig {art:string;line:string;color:number;textColor:string;width:number;height:number;duration:number}
export const CINEMATICS:Record<CharacterId,CinematicConfig>={
 cervela:{art:'v14-cervela-banner',line:'HAGAMOS ESTO UNA VEZ MÁS',color:0xff2878,textColor:'#ffe8f5',width:1200,height:450,duration:ULTIMATE_PRESENTATION_DURATION},
 nicolas:{art:'v14-nicolas-banner',line:'HAGAMOS ESTO RÁPIDO, QUE TENGO QUE IR A HACER LOS JEFES',color:0xb63bff,textColor:'#ffe8f5',width:1200,height:450,duration:ULTIMATE_PRESENTATION_DURATION}
};
