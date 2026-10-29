import Phaser from 'phaser';
export const MUSIC_TRACKS=['neon-combat','combat-loop','underground-thriller'] as const;
export const MUSIC_FILES=['neon-noir',...MUSIC_TRACKS];
/** Owned by the game, never a scene: one live music instance, including during fades. */
export class MusicManager {
 private static instances=new WeakMap<Phaser.Game,MusicManager>();
 private current?:Phaser.Sound.BaseSound;
 private requested?:string;
 private fadeRemaining=0;
 private fadeDuration=250;
 private index=-1;
 volume=.35;
 get currentTrack(){return this.current?.key}
 get combatIndex(){return this.index}
 static get(game:Phaser.Game){let m=this.instances.get(game);if(!m){m=new MusicManager(game);this.instances.set(game,m)}return m}
 static preload(scene:Phaser.Scene){for(const name of MUSIC_FILES)scene.load.audio(`music-${name}`,`assets/music/${name}.mp3`)}
 private constructor(private game:Phaser.Game){
  try{const n=Number(localStorage.getItem('hotline-music')??'.35');if(Number.isFinite(n))this.volume=Phaser.Math.Clamp(n,0,1)}catch{/* Optional persistence. */}
  game.sound.on(Phaser.Sound.Events.UNLOCKED,this.unlock,this);
  game.events.on(Phaser.Core.Events.STEP,this.update,this);
  game.events.once(Phaser.Core.Events.DESTROY,()=>{this.stop();game.sound.off(Phaser.Sound.Events.UNLOCKED,this.unlock,this);game.events.off(Phaser.Core.Events.STEP,this.update,this)});
 }
 setVolume(value:number){this.volume=Phaser.Math.Clamp(value,0,1);this.applyVolume();try{localStorage.setItem('hotline-music',String(this.volume))}catch{/* In-memory volume is still usable. */}}
 private applyVolume(){if(this.current)(this.current as Phaser.Sound.WebAudioSound).setVolume(this.volume*(this.fadeRemaining?this.fadeRemaining/this.fadeDuration:1))}
 private unlock(){if(this.requested)this.play(this.requested)}
 private play(key:string){if(this.requested===key&&this.current&&!this.fadeRemaining)return;this.stop();this.requested=key;if(this.game.sound.locked)return;this.current=this.game.sound.add(key,{loop:true,volume:this.volume});this.current.play()}
 menu(){this.play('music-neon-noir')}
 newSession(){this.stop();this.index=-1}
 combat(retry:boolean){this.index=retry?(this.index+1)%MUSIC_TRACKS.length:0;this.play(`music-${MUSIC_TRACKS[this.index]}`)}
 death(duration=250){this.fadeDuration=duration;this.requested=undefined;if(this.current)this.fadeRemaining=this.fadeDuration}
 stop(){this.requested=undefined;this.fadeRemaining=0;if(this.current){this.current.stop();this.current.destroy();this.current=undefined}}
 private update(_time:number,delta:number){if(!this.fadeRemaining)return;this.fadeRemaining=Math.max(0,this.fadeRemaining-delta);if(!this.fadeRemaining)this.stop();else this.applyVolume()}
}
