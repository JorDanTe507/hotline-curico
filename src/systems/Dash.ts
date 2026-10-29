import {DASH_DURATION,DASH_COOLDOWN} from '../config/player';
export class Dash {
 private cooldown=DASH_COOLDOWN;
 setCooldown(value:number,now:number,temporary=false){const next=Math.max(temporary?400:DASH_COOLDOWN*.6,value);if(this.readyAt>now)this.readyAt=now+(this.readyAt-now)*next/this.cooldown;this.cooldown=next}
 until=0;
 readyAt=0;
 direction={x:0,y:1};
 last={x:0,y:1};
 active(now:number){return now<this.until}
 remember(x:number,y:number){const length=Math.hypot(x,y);if(length)this.last={x:x/length,y:y/length}}
 start(now:number,x:number,y:number){if(this.active(now)||now<this.readyAt)return false;this.remember(x,y);this.direction={...this.last};this.until=now+DASH_DURATION;this.readyAt=now+this.cooldown;return true}
 progress(now:number){return Math.max(0,Math.min(1,1-(this.readyAt-now)/this.cooldown))}
}
