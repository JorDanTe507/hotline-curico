import Phaser from 'phaser';
import {AudioSystem} from './AudioSystem';
/** A reusable, cancellable line. Enter first completes it, then advances. */
export class Typewriter {
 private timer?:Phaser.Time.TimerEvent;
 private index=0;
 private line='';
 complete=true;
 constructor(private scene:Phaser.Scene,private target:Phaser.GameObjects.Text,private interval=38){scene.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.stop())}
 start(line:string){this.stop();this.line=line;this.index=0;this.complete=false;this.target.setText('');this.timer=this.scene.time.addEvent({delay:this.interval,loop:true,callback:()=>{this.index++;this.target.setText(this.line.slice(0,this.index));if(this.index%3===1&&/\S/.test(this.line[this.index-1]))AudioSystem.play(this.scene,'voice');if(this.index>=this.line.length)this.finish()}})}
 finish(){this.target.setText(this.line);this.complete=true;this.stop()}
 stop(){this.timer?.remove(false);this.timer=undefined;AudioSystem.stopVoice(this.scene)}
}
