import type Phaser from 'phaser';
import {AudioSystem} from '../systems/AudioSystem';
import {ATMOSPHERE,approach} from './AtmosphereStyle';
/** A single scene-owned loop. Never bypasses Phaser's user-gesture audio lock. */
export class RainAmbience {
 private sound?:Phaser.Sound.BaseSound;private gain=0;private unsubscribe:()=>void;
 constructor(private scene:Phaser.Scene){this.unsubscribe=AudioSystem.onVolume(()=>this.applyVolume())}
 private applyVolume(){if(this.sound&&'setVolume' in this.sound)(this.sound as Phaser.Sound.WebAudioSound).setVolume(this.gain*ATMOSPHERE.rainGain*AudioSystem.volume)}
 update(delta:number,raining:boolean,indoors=false){this.gain=approach(this.gain,raining?(indoors?.32:1):0,delta,1200);
  const manager=this.scene.sound;if(manager.locked||!this.scene.cache.audio.exists('sfx-rain-ambient'))return;
  if(this.gain>.002&&AudioSystem.volume>0){if(!this.sound)this.sound=manager.add('sfx-rain-ambient',{loop:true,volume:0});if(!this.sound.isPlaying)this.sound.play({loop:true,volume:this.gain*ATMOSPHERE.rainGain*AudioSystem.volume});this.applyVolume()}
  else if(this.sound?.isPlaying){this.applyVolume();this.sound.stop()}
 }
 stop(){this.unsubscribe();this.sound?.stop();this.sound?.destroy();this.sound=undefined;this.gain=0}
}
