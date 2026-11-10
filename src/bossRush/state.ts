import {CHARACTERS, type CharacterId} from '../characters/catalog';
import {ADRENALINE_CAPACITY} from '../systems/Adrenaline';
import {THROWABLES} from '../chaos/config';
import {MEDKIT_CAPACITY} from '../config/instinct';
import {WEAPONS, type Gun} from '../weapons/arsenal';
import {RUSH_BALANCE, RUSH_BOSSES} from './config';
import {validEndless,type EndlessRun} from './endless';
import type {SafeHistory} from './dialogues';

export const RUSH_CARDS = [
  {id: 'health', label: '+15 de salud máxima'},
  {id: 'damage', label: '+10 % de daño'},
  {id: 'armor', label: '+20 de escudo máximo'},
  {id: 'charge', label: '+20 % de carga definitiva · requiere 3 impactos menos en infinito'},
  {id: 'mobility', label: '+8 % de velocidad'},
  {id:'reload',label:'−8 % de tiempo de recarga'},
  {id:'resist',label:'−5 % de daño recibido'},
  {id:'medkits',label:'+1 de capacidad de botiquines'},
  {id:'healing',label:'+8 HP por botiquín'},
  {id:'reserve',label:'+12 % de munición en suministros'},
  {id:'dash',label:'−7 % de enfriamiento del dash'},
] as const;
export type RushCard = typeof RUSH_CARDS[number]['id'];
export const CARD_LIMITS:Record<RushCard,number>={health:3,damage:3,armor:2,charge:2,mobility:2,reload:2,resist:2,medkits:2,healing:2,reserve:2,dash:2};
export function rushOffer(upgrades:readonly RushCard[],random=Math.random) {
  const pool=RUSH_CARDS.map(c=>c.id).filter(id=>upgrades.filter(v=>v===id).length<CARD_LIMITS[id]);
  return Array.from({length:Math.min(3,pool.length)},()=>pool.splice(Math.floor(random()*pool.length),1)[0]);
}
export type RushStart =
  | {kind: 'campaign'; character: CharacterId}
  | {kind: 'practice'; character: CharacterId; boss: number; weapon: number}
  | {kind: 'resume'; rest: RushRest; consumed?:boolean};

export interface RushInventory {
  guns: Gun[]; active: number; health: number; armor: number; medkits: number;
  adrenaline: number; charge: number; counts: number[]; selected: number;
}

export interface RushRest {
  endless?: EndlessRun; encounter?: number[];
  version: 1; character: CharacterId; next: number; credits: number; inventory: RushInventory;
  stats: RushStats; dialogueHistory?: SafeHistory; relayHistory?:SafeHistory; upgrades: RushCard[]; offer: RushCard[]; chose: boolean; remaining: number;
}

export interface RushStats {date?:string;times: number[]; damage: number; falls: number; character: CharacterId}
export const rushScore = (stats: RushStats) =>
  Math.round(stats.times.reduce((sum, time) => sum + time, 0) / 1000 + stats.damage * RUSH_BALANCE.damagePenalty + stats.falls * RUSH_BALANCE.fallPenalty);

const SUSPEND = 'hotline-rush-suspend-v1';
const RESULTS = 'hotline-rush-results-v1';
const UNLOCKED = 'hotline-rush-unlocked-v1';
const number = (n: unknown, cap = 1e9): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= cap;
const index = (n: unknown, length: number): n is number => number(n, length - 1) && Number.isInteger(n);
const character = (id: unknown): id is CharacterId => CHARACTERS.some(c => c.id === id);
const card = (id: unknown): id is RushCard => RUSH_CARDS.some(c => c.id === id);

function read(key: string): unknown {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null'); }
  catch { return null; }
}

function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

function validStats(value: unknown): value is RushStats {
  const v = value as RushStats | null;
  return !!v && character(v.character) && Array.isArray(v.times) && v.times.length <= RUSH_BOSSES.length &&
    v.times.every(t => number(t)) && number(v.damage) && number(v.falls) && Number.isInteger(v.falls);
}

export function validRest(value: unknown): value is RushRest {
  const v = value as RushRest | null;
  const inv = v?.inventory;
  if (!v || v.version !== 1 || !character(v.character) || !index(v.next, RUSH_BOSSES.length) || (!v.endless&&v.next < 1) ||
      !number(v.credits) || !validStats(v.stats) || (!v.endless&&v.stats.character !== v.character) ||
      v.stats.times.length !== (v.endless?RUSH_BOSSES.length:v.next) || !Array.isArray(v.upgrades) || v.upgrades.length > 50 ||
      !v.upgrades.every(card) || !Array.isArray(v.offer) || v.offer.length > 3 ||
      !v.offer.every(card) || new Set(v.offer).size !== v.offer.length || typeof v.chose !== 'boolean' ||
      !number(v.remaining, RUSH_BALANCE.restMs) || !inv) return false;
  if(v.endless&&(!validEndless(v.endless)||v.endless.cleared%3!==0||!Array.isArray(v.encounter)||v.encounter[0]!==v.next||
    v.encounter.length<1||v.encounter.length>2||new Set(v.encounter).size!==v.encounter.length||
    !v.encounter.every(id=>index(id,RUSH_BOSSES.length))||(v.encounter.length===2&&v.encounter.includes(5))))return false;
  return Array.isArray(inv.guns) && inv.guns.length <= 2 && inv.guns.every(g =>
    !!g && index(g.id, WEAPONS.length) && number(g.ammo, 2000) && number(g.reserve, 100000)) &&
    index(inv.active, Math.max(1, inv.guns.length)) && number(inv.health, 1000) && inv.health > 0 &&
    number(inv.armor, 1000) && index(inv.medkits, MEDKIT_CAPACITY + Math.min(CARD_LIMITS.medkits,v.upgrades.filter(id=>id==='medkits').length) + 1) && index(inv.adrenaline, ADRENALINE_CAPACITY + 1) &&
    number(inv.charge, 1000) && index(inv.selected, THROWABLES.length) && Array.isArray(inv.counts) &&
    inv.counts.length === THROWABLES.length && inv.counts.every((n, i) => index(n, THROWABLES[i].capacity + 1));
}

export const suspendedRush = () => { const value = read(SUSPEND); return validRest(value) ? value : undefined; };
export function consumeRush(){const saved=suspendedRush();if(!saved)return;try{localStorage.removeItem(SUSPEND);return saved;}catch{return undefined}}
export const suspendRush = (rest: RushRest) => validRest(rest) && write(SUSPEND, rest);
export function clearRush() { try { localStorage.removeItem(SUSPEND); } catch { /* Storage optional. */ } }
export const unlockedRush = () => { const n = read(UNLOCKED); return index(n, RUSH_BOSSES.length + 1) ? n : 0; };
export function unlockRush(boss: number) { if (boss + 1 > unlockedRush()) write(UNLOCKED, boss + 1); }

interface Results {completed: number; best: RushStats[]}
export function rushResults(): Results {
  const value = read(RESULTS) as Results | null;
  return {
    completed: number(value?.completed) && Number.isInteger(value!.completed) ? value!.completed : 0,
    best: Array.isArray(value?.best) ? value.best.filter(r => validStats(r) && r.times.length === RUSH_BOSSES.length)
      .sort((a,b) => rushScore(a)-rushScore(b)).slice(0,10) : [],
  };
}
export function recordRush(stats: RushStats) {
  const result = rushResults();
  result.completed++;
  result.best = [...result.best, {...stats,date:new Date().toISOString()}].sort((a, b) => rushScore(a) - rushScore(b)).slice(0, 10);
  write(RESULTS, result);
}
