import type {CharacterId} from '../characters/catalog';

export type SafeLine = readonly [speaker: CharacterId, text: string];
export const SAFE_DIALOGUES = {
  'cervela:nicolas': [
    [
      ["cervela", "¿No te aburrís de jugar Tibia?"],
      ["nicolas", "¿Y tú no te aburrís de ser tan maricon?"],
      ["cervela", "Aweonao no mas."],
    ],
    [
      ["cervela", "Oye, ¿y alguna recomendación pal siguiente?"],
      ["nicolas", "Vo simplemente hacele parry y era"],
      ["cervela", "Te pregunté cómo matarlo, no cómo jugar al Dark Souls."],
    ],
    [
      ["cervela", "¿Y vai ganando?"],
      ["nicolas", "No me hablís, estoy haciendo enies hard"],
      ["cervela", "Como si te pagaran por hacer esa wea"],
    ],
  ],
  'cervela:jordan': [
    [
      ["cervela", "Pasa una chelita ps"],
      ["jordan", "Cuando dejes de hacer que el angel stremee por ti"],
      ["cervela", "Tampoco queria tomar"],
    ],
    [
      ["cervela", "¿Tanto color le day con el reloj, dime la hora?"],
      ["jordan", "No tiene pilas."],
      ["cervela", "Mira el saco de wea pa grande"],
    ],
    [
      ["jordan", "Siempre tan elegante cervelita"],
      ["cervela", "Hay que tener estilo hasta plomear weones"],
      ["jordan", "Bueno, eso no te lo niego"],
    ],
  ],
  'nicolas:cervela': [
    [
      ["nicolas", "¿Cuántos cigarros llevai hoy?"],
      ["cervela", "Dos cajetillas"],
      ["nicolas", "A vo queri batir un record"],
    ],
    [
      ["nicolas", "Oye, ¿cómo hiciste pa ganarle al último?"],
      ["cervela", "Le disparé hasta que dejó de moverse."],
      ["nicolas", "Tremenda guía, gracias."],
    ],
    [
      ["nicolas", "Tu definitiva es básicamente fumar y volverte loco."],
      ["cervela", "Basicamente"],
      ["nicolas", "Qué buen sistema de salud."],
    ],
  ],
  'nicolas:jordan': [
    [
      ["nicolas", "Oye, ¿de verdad podís detener el tiempo?"],
      ["jordan", "Mas o menos"],
      ["nicolas", "Que necesitai un nerfeo urgente."],
    ],
    [
      ["jordan", "¿No deberías estar preparándote para la siguiente pelea?"],
      ["nicolas", "Estoy practicando reflejos."],
      ["jordan", "Y mandibula tambien parece ps"],
    ],
    [
      ["nicolas", "¿Y qué estai tomando?"],
      ["jordan", "Una chela."],
      ["nicolas", "Ah, pensé que era un mini escudo."],
    ],
  ],
  'jordan:cervela': [
    [
      ["jordan", "¿Qué tanto mirai por la ventana?"],
      ["cervela", "Estoy viendo si queda algún desgraciado afuera."],
      ["jordan", "Pense que habias visto una pichula caminando"],
      ["cervela", "Ah, ¿te comiste un payaso?"],
    ],
    [
      ["cervela", "Oye, ¿y ese reloj que hace?"],
      ["jordan", "Deja con la duda a los weones maricones"],
      ["cervela", "...."],
    ],
    [
      ["jordan", "¿Y si un día te quedai sin cigarros?"],
      ["cervela", "Ese día sí que se acaba el mundo."],
      ["jordan", "jmmm, prioridades."],
    ],
  ],
  'jordan:nicolas': [
    [
      ["jordan", "¿Qué estai jugando?"],
      ["nicolas", "Estoy haciendo las diarias en el gla y marineford, despues los jefes"],
      ["jordan", "Qué coincidencia."],
      ["nicolas", "La diferencia es que acá tengo respawn."],
    ],
    [
      ["jordan", "¿Algún consejo para el siguiente jefe?"],
      ["nicolas", "No morir."],
      ["jordan", "Gracias, master."],
      ["nicolas", "De nada, solo cobro a besos"],
    ],
    [
      ["nicolas", "¿Cómo funciona exactamente tu definitiva?"],
      ["jordan", "Basicamente se detiene el tiempo"],
      ["nicolas", "¿Como flash o quicksilver?"],
      ["jordan", "Mas o menos pero esos acaban rapido yo no"],
    ],
  ],
} as const satisfies Record<string, readonly (readonly SafeLine[])[]>;

export type SafePair = keyof typeof SAFE_DIALOGUES;
export type SafeHistory = Partial<Record<SafePair, number>>;

export function chooseSafeDialogue(player: CharacterId, npc: CharacterId, history: SafeHistory, random = Math.random) {
  if (player === npc) return;
  const key = (player + ':' + npc) as SafePair;
  const variants = SAFE_DIALOGUES[key];
  const choices = variants.map((_, i) => i).filter(i => i !== history[key]);
  const chosen = choices[Math.floor(random() * choices.length)];
  history[key] = chosen;
  return variants[chosen];
}
