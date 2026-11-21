import Phaser from 'phaser';
import type {Game} from '../scenes/Game';

type Actor = Phaser.Physics.Arcade.Sprite;

/** Two viewports render the same scene. Screen-fixed objects retain one full-canvas camera. */
export class ContinuousCoopCameras {
 private readonly right: Phaser.Cameras.Scene2D.Camera;
 private readonly overlay: Phaser.Cameras.Scene2D.Camera;
 private lastPointer?:{x:number;y:number;dx:number;dy:number;actorX:number;actorY:number};
 private changing=false;
 private holdAim=false;
 private split = false;
 private fraction = 0;
 constructor(private readonly scene: Game){
  this.right=scene.cameras.add(0,0,1,1,false,'continua-j2').setVisible(false);
  this.right.inputEnabled=false;
  this.right.setBackgroundColor('#070610');
  this.overlay=scene.cameras.add(0,0,scene.scale.width,scene.scale.height,false,'continua-ui').setVisible(false);
  this.overlay.transparent=true;
  scene.events.on('prerender',this.filter,this);
 }
 get divided(){return this.fraction>0}
 cameraFor(id:number){return id===2&&this.divided?this.right:this.scene.cameras.main}
 pointerTarget(pointer:Phaser.Input.Pointer,actor:Actor){
  const cam=this.cameraFor(1),last=this.lastPointer;
  const stationary=last&&pointer.x===last.x&&pointer.y===last.y;
  if(stationary&&(this.changing||(this.holdAim&&actor.x===last.actorX&&actor.y===last.actorY))){
   last.actorX=actor.x;last.actorY=actor.y;
   this.holdAim=true;
   return new Phaser.Math.Vector2(actor.x+last.dx,actor.y+last.dy);
  }
  this.holdAim=false;
  const point=cam.getWorldPoint(Phaser.Math.Clamp(pointer.x,cam.x,cam.x+cam.width-1),pointer.y);
  this.lastPointer={x:pointer.x,y:pointer.y,dx:point.x-actor.x,dy:point.y-actor.y,actorX:actor.x,actorY:actor.y};
  return point;
 }
 private filter(){
  if(!this.divided)return;
  const main=this.scene.cameras.main;
  const mask=main.id|this.right.id|this.overlay.id;
  for(const object of this.scene.children.list){
   const display=object as Phaser.GameObjects.Image;
   const fixed=display.scrollFactorX===0&&display.scrollFactorY===0;
   object.cameraFilter=(object.cameraFilter&~mask)|(fixed?main.id|this.right.id:this.overlay.id);
  }
 }
 private clearFilters(){
  const mask=this.scene.cameras.main.id|this.right.id|this.overlay.id;
  for(const object of this.scene.children.list)object.cameraFilter&=~mask;
 }
 update(first:Actor,second:Actor,elapsed:number){
  const main=this.scene.cameras.main,w=this.scene.scale.width,h=this.scene.scale.height;
  // The HUD occupies the first 270 logical pixels. Reserve one sprite of space
  // around each actor, and another sprite before merging to absorb short reversals.
  const hudHeight=270,margin=Math.max(first.displayHeight,second.displayHeight);
  const availableW=w-2*margin,availableH=h-hudHeight-2*margin;
  const dx=Math.abs(first.x-second.x),dy=Math.abs(first.y-second.y);
  if(dx>availableW||dy>availableH)this.split=true;
  else if(dx<availableW-2*margin&&dy<availableH-2*margin)this.split=false;
  const old=this.fraction;
  this.fraction=Phaser.Math.Clamp(old+(this.split?1:-1)*elapsed/260,0,1);
  this.changing=old!==this.fraction;
  const f=Phaser.Math.Easing.Sine.InOut(this.fraction);
  const rightWidth=Math.round(w*f/2),leftWidth=w-rightWidth;
  const midX=(first.x+second.x)/2,midY=(first.y+second.y)/2-hudHeight/2;
  main.setViewport(0,0,leftWidth,h).setZoom(1).centerOn(
   Phaser.Math.Linear(midX,first.x,f)-rightWidth/2*(1-f),
   Phaser.Math.Linear(midY,first.y-hudHeight/2,f));
  this.right.setVisible(this.divided).setViewport(leftWidth,0,Math.max(1,rightWidth),h)
   .centerOn(Phaser.Math.Linear(midX+leftWidth/2,second.x,f),Phaser.Math.Linear(midY,second.y-hudHeight/2,f));
  this.overlay.setVisible(this.divided).setViewport(0,0,w,h);
  if(old>0&&!this.divided)this.clearFilters();
 }
 stop(){
  const s=this.scene;
  s.events.off('prerender',this.filter,this);
  if(!s.cameras.cameras.includes(this.right))return;
  this.clearFilters();
  s.cameras.remove([this.right,this.overlay]);
  s.cameras.main.setViewport(0,0,s.scale.width,s.scale.height);
 }
}
