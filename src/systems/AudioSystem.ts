import Phaser from 'phaser';
export const SHOTS=['pistol','revolver','smg','shotgun','assault','sniper','rpg','minigun','uzi','magnum','sawedoff','m79','flame','bat','crowbar','axe'] as const;
export const EFFECTS=[...SHOTS,'explosion','reload','pickup','hurt','kill','voice','dash','throw','execute','critical','ultimate','motor','reward','tryhard','achievement'] as const;
export type Effect=typeof EFFECTS[number];
// One Phaser sound manager shared across scenes; individual sounds self-remove on completion.
export class AudioSystem {
 static stopCombat(scene:Phaser.Scene){for(const key of EFFECTS)scene.sound.stopByKey(`sfx-${key}`)}
 static volume=.55;
 static voiceVolume=.6;
 static init(){try{const v=Number(localStorage.getItem('hotline-sfx')??'.55');if(Number.isFinite(v))this.volume=Phaser.Math.Clamp(v,0,1)}catch{/* Storage is optional. */}}
 static setVolume(value:number){this.volume=Phaser.Math.Clamp(value,0,1);try{localStorage.setItem('hotline-sfx',String(this.volume))}catch{/* In-memory setting remains usable. */}}
 static preload(scene:Phaser.Scene){for(const key of EFFECTS)scene.load.audio(`sfx-${key}`,`assets/audio/${key}.wav`)}
 static play(scene:Phaser.Scene,key:Effect,gain=1){if(this.volume<=0||!scene.cache.audio.exists(`sfx-${key}`))return;if(scene.sound.getAll(`sfx-${key}`).filter(sound=>sound.isPlaying).length>=3)return;if(key!=='critical'&&key!=='voice'&&key!=='ultimate'&&scene.sound.getAllPlaying().filter(sound=>sound.key.startsWith('sfx-')&&sound.isPlaying).length>=16)return;scene.sound.play(`sfx-${key}`,{volume:this.volume*gain*(key==='voice'?this.voiceVolume:1),rate:key==='voice'?Phaser.Math.FloatBetween(.96,1.08):1})}
 static shot(scene:Phaser.Scene,id:number){this.play(scene,SHOTS[id])}
 static stopVoice(scene:Phaser.Scene){scene.sound.stopByKey('sfx-voice')}
}


