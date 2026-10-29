import {MAX_DAMAGE_REDUCTION} from '../config/progression';
import type {Run} from './run';
import {ARMOR_CAPACITY,NORMAL_ARMOR_DROP_CHANCE,BOSS_ARMOR_DROP_CHANCE} from '../config/armor';
import {ULTIMATE_DAMAGE_REDUCTION} from '../config/instinct';
/** Mitigation precedes absorption: armor has no timer or automatic regeneration. */
export function receiveDamage(run:Run,raw:number,ultimateActive:boolean){
 const baseMultiplier=ultimateActive?1-(run.stats.caladaReduction??ULTIMATE_DAMAGE_REDUCTION):1;
 let incoming=Math.max(0,Number.isFinite(raw)?raw:0)*baseMultiplier;
 const temporaryAbsorbed=Math.min(incoming,run.temporaryArmor??0);run.temporaryArmor=Math.max(0,(run.temporaryArmor??0)-temporaryAbsorbed);incoming-=temporaryAbsorbed;
 const armorMultiplier=Math.max(1-Math.max(0,run.stats.armorReduction),(1-MAX_DAMAGE_REDUCTION)/baseMultiplier);
 const protectedDamage=Math.min(incoming,Math.max(0,run.armor)/armorMultiplier);
 const absorbed=protectedDamage*armorMultiplier,healthDamage=incoming-protectedDamage,amount=absorbed+healthDamage;
 run.armor=Math.max(0,run.armor-absorbed);run.health=Math.max(0,run.health-healthDamage);return {amount:amount+temporaryAbsorbed,absorbed:absorbed+temporaryAbsorbed,healthDamage};
}
export function takeArmor(run:Run){if(run.armor>=run.stats.maxArmor)return false;run.armor=run.stats.maxArmor;return true}
export function armorDrop(boss:boolean,random=Math.random){return random()<(boss?BOSS_ARMOR_DROP_CHANCE:NORMAL_ARMOR_DROP_CHANCE)}
