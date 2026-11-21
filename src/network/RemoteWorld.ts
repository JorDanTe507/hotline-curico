import Phaser from 'phaser';
import {buttons,type Action,type Controls} from './protocol';
import type {Snapshot} from './snapshot';
import {WEAPONS} from '../weapons/arsenal';

interface Feed {readonly state?:{frame:number;world:Snapshot};readonly closed:boolean;controls(value:Controls):void}
type Visual=Snapshot['shots'][number];
const keys:Record<string,Action>={Space:'dash',KeyX:'ultimate',KeyR:'reload',KeyQ:'switch',KeyE:'interact'};
const directions=['KeyW','KeyA','KeyS','KeyD'];

export class RemoteWorld extends Phaser.Scene {
 private entities=new Map<string,{image:Phaser.GameObjects.Image;x:number;y:number}>();
 private terrain!:Phaser.GameObjects.Image;
 private surface!:Phaser.Textures.CanvasTexture;
 private lastTerrain='';
 private hud!:Phaser.GameObjects.Text;
 private alert!:Phaser.GameObjects.Text;
 private lastFrame=-1;
 private pressed=new Set<string>();
 private angle=0;
 private fire=false;
 constructor(private feed:Feed){super('RemoteWorld')}
 create(){
  this.surface=this.textures.createCanvas('remote-terrain',31*32,19*32)!;
  this.terrain=this.add.image(0,0,'remote-terrain').setOrigin(0).setScale(1.5).setDepth(-10);
  this.cameras.main.setBackgroundColor('#130e1b');
  const style={fontFamily:'monospace',fontSize:18,color:'#ffdeef',backgroundColor:'#211221',padding:{x:12,y:6}};
  this.hud=this.add.text(12,12,'Conectando…',style).setDepth(9999).setScrollFactor(0);
  this.alert=this.add.text(640,624,'',{...style,align:'center'}).setOrigin(.5).setDepth(9999).setScrollFactor(0);
  const key=(e:KeyboardEvent)=>{
   if(!(e.code in keys)&&!directions.includes(e.code))return;
   e.preventDefault();if(e.repeat)return;
   if(e.type==='keydown')this.pressed.add(e.code);else this.pressed.delete(e.code);
   this.send();
  };
  const pointer=(p:Phaser.Input.Pointer)=>{
   this.angle=Math.atan2(p.y-this.scale.height/2,p.x-this.scale.width/2);
   this.fire=p.leftButtonDown();this.send();
  };
  const reset=()=>{this.fire=false;this.pressed.clear();this.send()};
  window.addEventListener('keydown',key);window.addEventListener('keyup',key);window.addEventListener('blur',reset);
  this.input.on('pointermove',pointer).on('pointerdown',pointer).on('pointerup',pointer).on('pointerupoutside',pointer);
  this.events.once('shutdown',()=>{
   reset();window.removeEventListener('keydown',key);window.removeEventListener('keyup',key);window.removeEventListener('blur',reset);
   this.terrain.destroy();this.textures.remove('remote-terrain');this.entities.clear();
  });
 }
 private send(){
  let held=this.fire?buttons.fire:0;
  for(const code of this.pressed)held|=buttons[keys[code]]??0;
  this.feed.controls({x:Number(this.pressed.has('KeyD'))-Number(this.pressed.has('KeyA')),
   y:Number(this.pressed.has('KeyS'))-Number(this.pressed.has('KeyW')),angle:this.angle,buttons:held});
 }
 private drawGround(t:Snapshot['terrain']){
  this.terrain.setPosition(t.left*48,t.top*48);
  if(t.tiles===this.lastTerrain)return;
  this.lastTerrain=t.tiles;
  const ctx=this.surface.context;ctx.clearRect(0,0,this.surface.width,this.surface.height);
  const sheets=['map-tiles','city-tiles','street-tiles','weather17-tiles'].map(k=>this.textures.get(k).getSourceImage() as HTMLImageElement);
  for(let n=0;n<t.tiles.length;n++){
   const tile=t.tiles.charCodeAt(n)-65;
   if(tile<0)continue;
   const sheet=sheets[Math.floor(tile/100)],index=tile%100,columns=sheet.width/32;
   ctx.drawImage(sheet,index%columns*32,Math.floor(index/columns)*32,32,32,n%31*32,Math.floor(n/31)*32,32,32);
  }
  this.surface.refresh();
 }
 private display(world:Snapshot){
  this.drawGround(world.terrain);
  const alive=new Set<string>();
  const sprite=(key:string,v:Omit<Visual,'id'>)=>{
   alive.add(key);
   let row=this.entities.get(key);
   if(!row){
    const image=this.add.image(v.x,v.y,v.tex,v.frame).setName(key);
    row={image,x:v.x,y:v.y};this.entities.set(key,row);
   }
   row.x=v.x;row.y=v.y;
   row.image.setTexture(v.tex,v.frame).setDisplaySize(v.w,v.h).setOrigin(v.ox,v.oy).setDepth(v.depth)
    .setFlip(v.flip,v.flipY).setRotation(v.rot).setAlpha(v.alpha);
  };
  for(const p of world.players)if(!p.dead){sprite('J'+p.slot,p);if(p.weapon)sprite('weapon'+p.slot,p.weapon)}
  for(const [prefix,list] of [['prop',world.props],['foe',world.foes],['shot',world.shots],['drop',world.drops]] as const)
   for(const entity of list)sprite(prefix+entity.id,entity);
  for(const c of [...world.coins.map(c=>({...c,tex:c.value>=50?'hc-special':c.value>=10?'hc-gold':c.value>=5?'hc-silver':'hc-copper'})),
   ...world.magnets.map(m=>({...m,tex:'hc-pocket'}))])
   sprite(c.tex+c.id,{...c,frame:'__BASE',w:28,h:28,ox:.5,oy:.5,rot:0,alpha:1,flip:false,flipY:false,depth:5});
  for(const [key,row] of this.entities)if(!alive.has(key)){row.image.destroy();this.entities.delete(key)}
  const p=world.players[1],seconds=Math.floor(world.elapsed/1000);
  const arms=p.guns.map((g,i)=>(i===p.active?'▶ ':'')+WEAPONS[g.id].name+' '+g.ammo+'/'+g.reserve).join('   ');
  this.hud.setText('J2 · '+p.character.toUpperCase()+'   VIDA '+Math.ceil(p.hp)+'   CHALECO '+Math.ceil(p.armor)+'   HC '+world.hc+
   '   '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+'\n'+arms+(p.reload?' · RECARGANDO':'')+
   '\n'+p.ability+' · '+(p.using?'ACTIVA':p.ready?'LISTA':p.charge+'/'+p.required));
  const fallen=world.players.find(a=>a.until);
  this.alert.setText(world.choices.length?'Q · Elegir   E · Confirmar\n'+world.choices.map((c,i)=>(world.choice===i?'▶ ':'')+c).join('   '):
   world.paused?'PAUSA':world.spectating?'ESPECTADOR':fallen?'J'+fallen.slot+' CAÍDO · '+Math.ceil((fallen.until-world.clock)/1000)+' s · Mantener E · '+Math.floor(fallen.rescue/30)+'%':'');
  this.alert.setVisible(!!this.alert.text);
 }
 update(_time:number,delta:number){
  if(this.feed.closed){this.scene.start('Menu');return}
  const state=this.feed.state;if(!state)return;
  if(state.frame!==this.lastFrame){this.display(state.world);this.lastFrame=state.frame}
  const blend=1-Math.exp(-delta/45);
  for(const {image,x,y} of this.entities.values()){
   if(Math.hypot(x-image.x,y-image.y)>400)image.setPosition(x,y);
   else image.setPosition(image.x+(x-image.x)*blend,image.y+(y-image.y)*blend);
  }
  const focus=this.entities.get(state.world.spectating?'J1':'J2');
  if(focus)this.cameras.main.centerOn(focus.image.x,focus.image.y);
 }
}
