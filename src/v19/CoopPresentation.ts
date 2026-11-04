import type {Game} from '../scenes/Game';import {CINEMATICS} from '../config/cinematics';import {AudioSystem} from '../systems/AudioSystem';import {achievements} from '../systems/Achievements';
/** Cooperative banners never reserve the other protagonist's presentation or freeze the world. */
export class CoopPresentation {active=false;scale=1;until=0;
 constructor(private s:Game){}
 start(){const s=this.s;if(!s.ultimate.ready||s.ultimate.active(s.clock)||s.paused||s.ended||s.run.health<=0||s.roulette.active||s.levelUp.active)return false;if(!s.ultimate.activate(s.clock,s.guns))return false;s.rogue.activated();s.reloadAt=0;this.until=s.clock+CINEMATICS[s.character.id].duration;achievements().event({type:'ultimate',character:s.character.id});AudioSystem.play(s,s.character.ability.activationSound,.7);return true}
 update(_delta:number){}complete(){}cancel(){this.until=0}
}
