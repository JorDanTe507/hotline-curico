import type {CharacterId} from '../characters/catalog';
import type {SafeLine,SafePair,SafeHistory} from './dialogues';

// Texts approved by the user, in the order of each directed handoff.
export const RELAY_DIALOGUES = {
  'jordan:cervela': [
    ['Te toca, cervelita.', 'Ya era hora, conchetumare.', 'A la vuelta traete un six pack que no queda'],
    ['¿Vas a pelear con el cigarro en la boca?', '¿Y vo vai a tener este en la boca?', 'Ahhh bueno....'],
  ],
  'jordan:nicolas': [
    ['Ya, Nicolito, le toca.', 'Espérate, estoy terminando una diaria.', 'Oe oe pencon, dejate'],
    ['No te vayai a morir.', 'Tranquilo, tengo experiencia haciendo jefes.', 'Acá no tenís respawn, Pichulon.'],
  ],
  'cervela:jordan': [
    ['Ya, anda a lucirte con tu reloj culiao.', '¿El que deja con la duda a los maricones?', 'Otra vez el mismo chistecito'],
    ['Pásame la chela y anda a pelear.', '¿Y el cigarro no te basta?', 'Que no se pierdan las costumbres.'],
  ],
  'cervela:nicolas': [
    ['Ya, maquina del gaming, te toca.', 'Fácilito este game', 'En algo concordamos'],
    ['Deja de jugar esa wea y anda a pelear.', 'Pero si estaba haciendo Enies Hard.', 'Ahora vai a hacer Boss Rush Hard.'],
  ],
  'nicolas:jordan': [
    ['Ya, te toca. Usa esa wea del tiempo.', '¿Y si no quiero?', 'Entonces me vas a tener que besar'],
    ['Te dejé el jefe facilito.', 'Vale, termino aqui y unos ¿trabitas?', 'Como me lee la mente estimado'],
  ],
  'nicolas:cervela': [
    ['Ya, anda a fumar y matar weones.', 'Qué manera de resumir mi talento.', 'De nada, mastrer.'],
    ['Te toca, voy a seguir jugando.', 'Vo no descansai, cambiái de juego nomás.', 'Hay que mantener los reflejos.'],
  ],
} as const satisfies Record<SafePair,readonly (readonly string[])[]>;

export function relayLines(from:CharacterId,to:CharacterId,history:SafeHistory,random=Math.random):SafeLine[] {
  const key=(from+':'+to) as SafePair;
  const variants=RELAY_DIALOGUES[key];
  if(!variants)return [];
  const previous=history[key],choice=previous===0?1:previous===1?0:Number(random()>=.5);
  history[key]=choice;
  return variants[choice].map((line,i)=>[i===1?to:from,line]);
}

export function transferRatio(value:number,fromMax:number,toMax:number){
  return Math.max(0,Math.min(1,value/Math.max(1,fromMax)))*toMax;
}
