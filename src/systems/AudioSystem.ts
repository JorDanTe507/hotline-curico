import Phaser from 'phaser';
export const SHOTS=['pistol','revolver','smg','shotgun','assault','sniper','rpg','minigun','uzi','magnum','sawedoff','m79','flame','bat','crowbar','axe'] as const;
export const EFFECTS=[...SHOTS,'explosion','reload','pickup','hurt','kill','voice','dash','throw','execute','critical','ultimate','motor','reward','tryhard','achievement','punch','grenade-throw','frag','shrapnel','bottle','fire-loop','flashbang','electric','knife-throw','knife-hit','knife-pickup','barrel','throwable-pickup'] as const;
export type Effect=typeof EFFECTS[number];
// One Phaser sound manager shared across scenes; individual sounds self-remove on completion.
export class AudioSystem {
 static stopCombat(scene:Phaser.Scene){for(const key of EFFECTS)this.stop(scene,key)}
 static stop(scene:Phaser.Scene,key:Effect){for(const sound of scene.sound.getAllPlaying())if(sound.key===`sfx-${key}`||sound.key.startsWith(`sfx-${key}-v`))sound.stop()}
 private static seed=0x51f07;private static lastVariant=new Map<string,number>();
 private static random(){let x=this.seed;x^=x<<13;x^=x>>>17;x^=x<<5;this.seed=x;return (x>>>0)/4294967296}
 private static manager?:Phaser.Sound.BaseSoundManager;
 private static volumeListeners=new Set<()=>void>();
 static onVolume(listener:()=>void){this.volumeListeners.add(listener);return ()=>{this.volumeListeners.delete(listener)}}
 static volume=.55;
 static voiceVolume=.6;
 static init(){try{const v=Number(localStorage.getItem('hotline-sfx')??'.55');if(Number.isFinite(v))this.volume=Phaser.Math.Clamp(v,0,1)}catch{/* Storage is optional. */}}
 static setVolume(value:number){const before=this.volume;this.volume=Phaser.Math.Clamp(value,0,1);for(const sound of this.manager?.getAllPlaying()??[]){if(sound.key.startsWith("sfx-")){if(!this.volume)sound.stop();else if(before>0&&"setVolume" in sound)(sound as Phaser.Sound.WebAudioSound).setVolume((sound as unknown as {currentConfig:{volume:number}}).currentConfig.volume*this.volume/before)}}for(const listener of this.volumeListeners)listener();try{localStorage.setItem('hotline-sfx',String(this.volume))}catch{/* In-memory setting remains usable. */}}
 static preload(scene:Phaser.Scene){scene.load.audio('sfx-rain-ambient','assets/audio/rain-ambient.wav');for(const key of EFFECTS)scene.load.audio(`sfx-${key}`,`assets/audio/${key}.wav`);for(const key of [...SHOTS,'reload'])for(let i=0;i<4;i++)scene.load.audio(`sfx-${key}-v${i}`,`assets/audio/variants/${key}-${i}.wav`)}
 static play(scene:Phaser.Scene,key:Effect,gain=1){this.manager=scene.sound;if(this.volume<=0)return;const varied=(SHOTS as readonly string[]).includes(key)||key==='reload';let soundKey=`sfx-${key}`;if(varied){let pick=Math.floor(this.random()*4);if(pick===this.lastVariant.get(key))pick=(pick+1)%4;if(scene.cache.audio.exists(`${soundKey}-v${pick}`))soundKey+=`-v${pick}`}
 if(!scene.cache.audio.exists(soundKey))return;const playing=scene.sound.getAllPlaying();if(playing.filter(s=>s.key===`sfx-${key}`||s.key.startsWith(`sfx-${key}-v`)).length>=3)return;if(!['critical','voice','ultimate'].includes(key)&&playing.filter(s=>s.key.startsWith('sfx-')).length>=16)return;
 const played=scene.sound.play(soundKey,{volume:Math.min(1,Math.max(0,this.volume*gain*(key==='voice'?this.voiceVolume:varied?.94+this.random()*.06:1))),rate:varied?.985+this.random()*.03:key==='voice'?Phaser.Math.FloatBetween(.96,1.08):1});if(played&&varied&&/-v[0-3]$/.test(soundKey))this.lastVariant.set(key,Number(soundKey.at(-1)))}
 static shot(scene:Phaser.Scene,id:number){this.play(scene,SHOTS[id])}
 static stopVoice(scene:Phaser.Scene){scene.sound.stopByKey('sfx-voice')}
}


