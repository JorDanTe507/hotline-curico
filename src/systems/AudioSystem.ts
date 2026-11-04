import Phaser from 'phaser';
export const SHOTS=['pistol','revolver','smg','shotgun','assault','sniper','rpg','minigun','uzi','magnum','sawedoff','m79','flame','bat','crowbar','axe'] as const;
export const EFFECTS=[...SHOTS,'explosion','reload','pickup','hurt','kill','voice','dash','throw','execute','critical','ultimate','motor','reward','tryhard','achievement','punch','grenade-throw','frag','shrapnel','bottle','fire-loop','flashbang','electric','knife-throw','knife-hit','knife-pickup','barrel','throwable-pickup'] as const;
export type Effect=typeof EFFECTS[number];
// One Phaser sound manager shared across scenes; individual sounds self-remove on completion.
export class AudioSystem {
 static stopCombat(scene:Phaser.Scene){for(const key of EFFECTS)scene.sound.stopByKey(`sfx-${key}`)}
 private static manager?:Phaser.Sound.BaseSoundManager;
 private static volumeListeners=new Set<()=>void>();
 static onVolume(listener:()=>void){this.volumeListeners.add(listener);return ()=>{this.volumeListeners.delete(listener)}}
 static volume=.55;
 static voiceVolume=.6;
 static init(){try{const v=Number(localStorage.getItem('hotline-sfx')??'.55');if(Number.isFinite(v))this.volume=Phaser.Math.Clamp(v,0,1)}catch{/* Storage is optional. */}}
 static setVolume(value:number){const before=this.volume;this.volume=Phaser.Math.Clamp(value,0,1);for(const sound of this.manager?.getAllPlaying()??[]){if(sound.key.startsWith("sfx-")){if(!this.volume)sound.stop();else if(before>0&&"setVolume" in sound)(sound as Phaser.Sound.WebAudioSound).setVolume((sound as unknown as {currentConfig:{volume:number}}).currentConfig.volume*this.volume/before)}}for(const listener of this.volumeListeners)listener();try{localStorage.setItem('hotline-sfx',String(this.volume))}catch{/* In-memory setting remains usable. */}}
 static preload(scene:Phaser.Scene){scene.load.audio('sfx-rain-ambient','assets/audio/rain-ambient.wav');for(const key of EFFECTS)scene.load.audio(`sfx-${key}`,`assets/audio/${key}.wav`)}
 static play(scene:Phaser.Scene,key:Effect,gain=1){this.manager=scene.sound;if(this.volume<=0||!scene.cache.audio.exists(`sfx-${key}`))return;if(scene.sound.getAll(`sfx-${key}`).filter(sound=>sound.isPlaying).length>=3)return;if(key!=='critical'&&key!=='voice'&&key!=='ultimate'&&scene.sound.getAllPlaying().filter(sound=>sound.key.startsWith('sfx-')&&sound.isPlaying).length>=16)return;scene.sound.play(`sfx-${key}`,{volume:this.volume*gain*(key==='voice'?this.voiceVolume:1),rate:key==='voice'?Phaser.Math.FloatBetween(.96,1.08):1})}
 static shot(scene:Phaser.Scene,id:number){this.play(scene,SHOTS[id])}
 static stopVoice(scene:Phaser.Scene){scene.sound.stopByKey('sfx-voice')}
}


