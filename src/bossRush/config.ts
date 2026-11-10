export const RUSH_BOSSES = [
  {id: 0, name: 'El Torturado', arena: 'Pabellón de Castigo', track: 'tortured', available: true},
  {id: 1, name: 'El Comandante', arena: 'Cuartel de la Trituradora', track: 'commander', available: true},
  {id: 2, name: 'El Demoledor', arena: 'Planta de Demolición', track: 'demolisher', available: true},
  {id: 3, name: 'El Verdugo', arena: 'Subestación Eléctrica', track: 'executioner', available: true},
  {id: 4, name: 'El Carnicero', arena: 'Matadero de Curicó', track: 'butcher', available: true},
  {id: 5, name: 'Wesker', arena: 'Comisaría de Raccoon City', track: 'wesker-human', available: true},
] as const;

export const RUSH_TRACKS = [
  'menu', 'intro', ...RUSH_BOSSES.map(boss => boss.track), 'wesker-mutated', 'safe-room',
] as const;
export const RUSH_BALANCE = {
  talkRange: 74, restMs: 60_000, recovery: .25, reward: 180,
  ammoPrice: 35, medkitPrice: 80, armorPrice: 100, weaponPrice: 140,
  damagePenalty: 50, fallPenalty: 1000,
} as const;
