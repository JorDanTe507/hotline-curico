import {encounterRules} from "./EncounterCalendar";
import {MAX_ALIVE_ENEMIES} from '../config/dynamicRounds';
import {enemyTier} from '../enemies/config';

export const continuousBalance = {
  initialPopulation: 6, cap: MAX_ALIVE_ENEMIES, halfPressureMs: 600_000,
  initialInterval: 1550, minimumInterval: 450, varietyStepMs: 75_000,
  extraHealth: .9, extraDamage: .45, spawnDistance: 500, retirementDistance: 1900,
  threats: ['Baja', 'Moderada', 'Alta', 'Extrema', 'Crítica'],
  thresholds: [.2, .45, .7, .85],
};

export class ContinuousDirector {
  elapsed = 0;
  private cooldown = 0;
  frequency=1;
  get pressure() { return this.elapsed / (this.elapsed + continuousBalance.halfPressureMs); }
  private lostAt?:number;
  loseParticipant(){this.lostAt??=this.elapsed}
  get population() {
    const {initialPopulation, cap} = continuousBalance;
    const joint = Math.min(cap, initialPopulation + Math.round((cap - initialPopulation) * this.pressure));
    if(this.lostAt===undefined)return joint;
    const transition=Math.min(1,(this.elapsed-this.lostAt)/30000);
    return Math.ceil(joint+(Math.ceil(joint/2)-joint)*transition);
  }
  get health() { return 1 + continuousBalance.extraHealth * this.pressure; }
  get damage() { return 1 + continuousBalance.extraDamage * this.pressure; }
  get time() {
    const seconds = Math.floor(this.elapsed / 1000);
    return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
      .map(value => String(value).padStart(2, '0')).join(':');
  }
  get label() {
    const level = continuousBalance.thresholds.filter(threshold => this.pressure >= threshold).length;
    return this.time + ' · Amenaza ' + continuousBalance.threats[level];
  }
  step(delta: number, alive: number, random = Math.random,bosses=0): number | undefined {
    this.elapsed += delta;
    const target=encounterRules.hordeRates[Math.min(2,bosses)];
    this.frequency+=(target-this.frequency)*(1-Math.exp(-delta/encounterRules.smoothing));
    this.cooldown = Math.max(0, this.cooldown - delta*this.frequency);
    if (this.cooldown || alive >= this.population) return;
    const {minimumInterval, initialInterval, varietyStepMs} = continuousBalance;
    this.cooldown = initialInterval - (initialInterval - minimumInterval) * this.pressure;
    return enemyTier(1 + Math.floor(this.elapsed / varietyStepMs), random());
  }
}
