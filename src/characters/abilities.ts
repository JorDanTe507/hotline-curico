import {Ultimate} from '../systems/Ultimate';
import {Tryhard} from '../systems/Tryhard';
import type {CharacterConfig} from './catalog';
import type {PlayerStats} from '../config/progression';
import type {Run} from '../systems/run';
const modules={calada:Ultimate,tryhard:Tryhard};
export function createAbility(character:CharacterConfig,stats:()=>PlayerStats,run?:()=>Run){return new modules[character.ability.module](stats,run)}
