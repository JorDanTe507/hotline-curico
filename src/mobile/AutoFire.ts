import {WEAPONS,isMelee,type Gun} from '../weapons/arsenal';
import {ENEMIES} from '../enemies/config';
import type {Game,Foe} from '../scenes/Game';
import type {MobilePreferences} from './MobilePreferences';
import type {TouchState} from './TouchState';
export interface AutoTarget {x:number;y:number;alive:boolean;active:boolean;threat:number}
/** Selection only: no damage, ammunition, cadence, leading or spread modifications. */
export function selectAutoTarget<T extends AutoTarget>(origin:{x:number;y:number},targets:readonly T[],range:number,preferences:Pick<MobilePreferences,'priority'|'distance'>,clear:(target:T)=>boolean):T|undefined {
 if(!Number.isFinite(range)||range<=0)return;
 const radius=preferences.distance==='near'?Math.min(range,300):range;
 return targets.filter(t=>t.alive&&t.active&&Number.isFinite(t.x)&&Number.isFinite(t.y)&&Math.hypot(t.x-origin.x,t.y-origin.y)<=radius&&clear(t)).sort((a,b)=>(preferences.priority==='dangerous'?b.threat-a.threat:0)||Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y))[0];
}
export function mobileAutoTarget(s:Game,t:TouchState,last:string):Foe|undefined {
 if(!t.available||last!=='touch'||!t.settings.value.autoShoot||t.aiming||t.down('throwable')||!s.registry.get('mobileUI')||s.coop||s.paused||s.ended||s.run.health<=0||s.bossDialogue.active||s.presentation.active||s.levelUp.active||s.roulette.active||s.rush?.peaceful||s.rush?.conversation||s.rush?.cardPanel||s.rush?.phase==='intro'||s.uroboros?.transforming||s.survival.executing||s.reloadAt)return;
 if(s.dash.active(s.clock)&&!(s.character.id==='nicolas'&&s.ultimate.active(s.clock)))return;
 const gun:Gun|undefined=s.guns[s.active];if(!gun||isMelee(gun.id)||!WEAPONS[gun.id]||gun.ammo<=0&&!(s.ultimate.active(s.clock)&&s.ultimate.infiniteAmmo))return;
 const candidates=s.foes.map(foe=>({foe,x:foe.sprite.x,y:foe.sprite.y,alive:foe.hp>0,active:foe.sprite.active&&foe.sprite.visible,threat:(foe.boss>=0?1000:0)+(ENEMIES[foe.tier]?.damage??0)}));
 return selectAutoTarget(s.player,candidates,WEAPONS[gun.id].range,t.settings.value,target=>!s.rush?.bossCombat?.invulnerable(target.foe)&&s.lineClear(s.player.x,s.player.y,target.x,target.y))?.foe;
}
