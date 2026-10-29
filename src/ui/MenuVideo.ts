import Phaser from 'phaser';
/** A muted texture inside the game canvas; never receives input or enters the sound manager. */
export class MenuVideo {
 video:Phaser.GameObjects.Video;
 private failed=false;private textureKey?:string;
 constructor(private scene:Phaser.Scene){
  this.video=scene.add.video(640,360).setDepth(-19).setVisible(false);
  const fit=()=>{const v=this.video.video;if(v?.videoWidth)this.video.setScale(Math.max(1280/v.videoWidth,720/v.videoHeight))};
  this.video.on(Phaser.GameObjects.Events.VIDEO_TEXTURE,(_video:Phaser.GameObjects.Video,texture:Phaser.Textures.Texture)=>{this.textureKey=texture.key;fit();if(!this.failed)this.video.setVisible(true)});
  this.video.on(Phaser.GameObjects.Events.VIDEO_PLAYING,fit);
  for(const event of [Phaser.GameObjects.Events.VIDEO_ERROR,Phaser.GameObjects.Events.VIDEO_UNSUPPORTED,Phaser.GameObjects.Events.VIDEO_LOCKED])this.video.on(event,()=>this.fallback());
  this.video.once(Phaser.GameObjects.Events.DESTROY,()=>{if(this.textureKey&&scene.textures.exists(this.textureKey))scene.textures.remove(this.textureKey)});
  this.video.loadURL('assets/video/menu.mp4',true).setMute(true).setVolume(0);
  const element=this.video.video;if(element){element.muted=true;element.defaultMuted=true;element.volume=0;element.loop=true;element.autoplay=true;element.playsInline=true;element.style.pointerEvents='none'}
  this.video.play(true);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{if(this.video.active)this.video.stop();const el=this.video.video;if(el){el.pause();el.removeAttribute('src');el.load()}});
 }
 fallback(){this.failed=true;this.video.setVisible(false);if(this.video.active)this.video.stop()}
}
