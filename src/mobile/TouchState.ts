import {stick,type PadAction} from '../input/PadState';
export interface DeviceCapabilities {touchPoints:number;coarse:boolean;width:number;height:number}
/** Primary coarse touch input, never a desktop window's dimensions or browser name alone. */
export function mobileDevice(c:DeviceCapabilities){return c.touchPoints>0&&c.coarse&&c.width>0&&c.height>0}
export class TouchState {
 available=false;autoFire=true;deadzone=.12;move={x:0,y:0};aim={x:1,y:0};aiming=false;
 private held=new Set<PadAction>();private edges=new Set<PadAction>();
 movement(x:number,y:number){this.move=stick(x,y,this.deadzone)}
 target(x:number,y:number){const value=stick(x,y,this.deadzone);this.aiming=!!(value.x||value.y);if(this.aiming)this.aim=value}
 press(action:PadAction){if(!this.available||this.held.has(action))return false;this.held.add(action);this.edges.add(action);return true}
 release(action:PadAction){this.held.delete(action)}
 take(action:PadAction){return this.available&&this.edges.delete(action)}
 down(action:PadAction){return this.available&&(this.held.has(action)||(action==='fire'&&this.autoFire&&this.aiming))}
 clear(){this.held.clear();this.edges.clear();this.move={x:0,y:0};this.aiming=false}
}
