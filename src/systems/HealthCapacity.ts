import type {Run} from './run';
export const healthMultiplier=(run:Run)=>run.healthMultiplier??1;
export const maxHealth=(run:Run)=>run.stats.maxHealth*healthMultiplier(run);
/** Capacity changes preserve the current fraction, including zero, without rounding. */
export function setHealthMultiplier(run:Run,multiplier:number){const before=maxHealth(run);run.healthMultiplier=multiplier;run.health=run.health<=0?0:Math.min(maxHealth(run),run.health*maxHealth(run)/before)}
