import type {CharacterConfig} from '../characters/catalog';

export const WESKER = 5;
export const UROBOROS = {
  health: 1450,
  coopHealth: 1.4,
  mutation: .50,
  visualScale: [1.30, 1.40],
  speed: [165, 205],
  recovery: [850, 600],
  dodgeSpeed: 230,
  bulletEvade:{chance:.24,budget:10,cooldown:2800,distance:48},
  dodgeCooldown: 4800,
  dodgeMs: 225,
  dashSpeed: 600,
  dashMs: 610,
  grabMs: 440,
  grabProtection: 3200,
  throwSpeed: 365,
  throwMs: 280,
  infectionDps: [1.5, 2.5, 4],
  infectionTick: 1000,
  crateHP: 32,
  attacks: {
    strike: {windup: 350, radius: 74, damage: 17, infects: false},
    charge: {windup: 500, radius: 305, damage: 27, infects: true},
    ground: {windup: 750, radius: 125, damage: 25, infects: true},
    tentacles: {windup: 850, radius: 96, damage: 23, infects: true},
    sweep: {windup: 640, radius: 145, damage: 34, infects: true},
    burst: {windup: 730, radius: 118, damage: 38, infects: true},
    projectile: {windup: 610, radius: 530, damage: 28, infects: false},
  },
} as const;

export const INTRO_LINES: Record<CharacterConfig['id'], readonly [string, string]> = {
  cervela: ['Siete minutos. Siete minutos es todo lo que puedo dedicar a jugar contigo.', '¿7 minutos? ¡Qué máquina!'],
  nicolas: ['Tu resistencia es inútil. La evolución no espera a los débiles.', '¿No creo que tengas segunda fase o sí?'],
  jordan: ['No eres más que otro experimento destinado al fracaso.', '¿Y tú eres el científico o el experimento que salió mal?'],
};

export const TRANSFORM_LINE = '¡La evolución no puede detenerse! ¡Yo soy el futuro!';
export const TRANSFORM_REPLIES: Record<CharacterConfig['id'], string> = {
  cervela: 'Al parecer no eran solo 7 minutos.',
  nicolas: '¡Lo sabía! ¡Tenía segunda fase el bastardo!',
  jordan: 'Tentáculos... como ciertas animaciones japonesas, pero este quiere matarme.',
};
