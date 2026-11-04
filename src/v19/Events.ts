export interface GameEvent19 {type:string;value?:number;character?:string;method?:string;weapon?:number;throwable?:number;boss?:number;player?:number}
type Listener=(event:GameEvent19)=>void;
const listeners=new Set<Listener>();
export const events19={on(fn:Listener){listeners.add(fn);return ()=>listeners.delete(fn)},emit(event:GameEvent19){for(const fn of listeners)fn(event)}};
