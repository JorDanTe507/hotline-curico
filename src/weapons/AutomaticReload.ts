import {WEAPONS,isMelee,singleTank,type Gun} from './arsenal';
/** Eligibility only. Game.reloadGun remains the single reload implementation. */
export function needsAutomaticReload(g:Gun|undefined){return !!g&&!!WEAPONS[g.id]&&!isMelee(g.id)&&!singleTank(g.id)&&g.ammo===0&&g.reserve>0}
