import {bossIndex} from '../bosses/config';
import {bossName} from '../bosses/expansion';
import {bossPortraits} from './MenuPresentation';
/** Same on-screen alphabet as the existing authentication scene. Physical input remains unchanged. */
export const DEVELOPER_KEYPAD='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const DEVELOPER_NOTICE='Los cambios de prueba no se guardan. La sesión termina al recargar.';
export function developerRounds(page:number){return Array.from({length:10},(_,slot)=>{const round=page*10+slot+1,index=bossIndex(round);return {round,boss:index,name:index>=0?bossName(index):'',portrait:index>=0?bossPortraits[index]:undefined}})}
