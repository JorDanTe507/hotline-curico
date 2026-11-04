import {CHAOS} from '../chaos/config';
import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import type {ShotCredit} from '../systems/Ultimate';
import {FORTUNE,CRATE_MELEE_DAMAGE_MULTIPLIER} from '../config/fortune';
import {inputHub} from '../input/InputHub';
import {permanentProgress} from '../systems/PermanentProgress';
import {FortuneLedger,crateReward,safeWeapon,type FortuneObject} from './FortuneState';
import type {Chunk} from './WorldModel';
import {actorDepth} from '../maps/environment';
interface View {item:FortuneObject;image:Phaser.Physics.Arcade.Image}
export class FortuneObjects {
 readonly ledger=new FortuneLedger();readonly views=new Map<string,View>();private graphics:Phaser.GameObjects.Graphics;private message='';private until=0;private stopped=false;
 private continuePoint?:{x:number;y:number;label:Phaser.GameObjects.Text};private restId?:string;private busy=false;
 constructor(private s:Game){this.graphics=s.add.graphics().setDepth(16)}
 load(chunk:Chunk){if(this.stopped)return;for(const item of this.ledger.load(this.s.worldModel,chunk))this.show(item)}
 private show(item:FortuneObject){if(this.views.has(item.id)||(item.kind==='crate'&&item.opened))return;const s=this.s;
  if(!item.opened&&(Math.hypot(item.x-s.player.x,item.y-s.player.y)<100||s.foes.some(e=>Math.hypot(item.x-e.sprite.x,item.y-e.sprite.y)<100)))return;
  const texture=`fortune-${item.kind}${item.opened?'-open':item.kind==='crate'&&item.hp<FORTUNE.crateHP?'-hurt':''}`,image=s.physics.add.staticImage(item.x,item.y,texture).setDepth(actorDepth(item.y+24));
  image.setScale(item.kind==='mystery'?1.05:.9).setData('fortune',item.id);image.body!.checkCollision.none=item.kind!=='crate';
  if(item.kind==='crate'){image.body!.setSize(34,34);s.walls.add(image);s.worldModel.setDynamicSolid(Math.floor(item.x/48),Math.floor(item.y/48),true)}
  this.views.set(item.id,{item,image});
 }
 private hide(id:string){const view=this.views.get(id);if(!view)return;const {item,image}=view;if(item.kind==='crate'){this.s.worldModel.setDynamicSolid(Math.floor(item.x/48),Math.floor(item.y/48),false);if(image.body)this.s.physics.world.remove(image.body);if(this.s.walls.children)this.s.walls.remove(image,true,true);else image.destroy()}else image.destroy();this.views.delete(id)}
 occupied(x:number,y:number,radius=70){return [...this.views.values()].some(v=>Math.hypot(v.item.x-x,v.item.y-y)<radius)}
 unload(chunk:string){for(const [id,v] of this.views)if(v.item.chunk===chunk)this.hide(id)}
 atObstacle(object:unknown){const id=(object as Phaser.GameObjects.GameObject)?.getData?.('fortune') as string|undefined;return id?this.views.get(id)?.item:undefined}
 atPoint(x:number,y:number){return [...this.views.values()].find(v=>v.item.kind==='crate'&&!v.item.opened&&Math.floor(v.item.x/48)===Math.floor(x/48)&&Math.floor(v.item.y/48)===Math.floor(y/48))?.item}
 damage(item:FortuneObject,amount:number,_credit?:ShotCredit){if(!this.ledger.damage(item,amount)){const view=this.views.get(item.id);if(view&&item.hp<FORTUNE.crateHP)view.image.setTexture('fortune-crate-hurt');return false}
  const s=this.s;this.hide(item.id);const debris=s.add.image(item.x,item.y,'fortune-crate-dead').setDepth(2);s.tweens.add({targets:debris,alpha:0,duration:550,onComplete:()=>debris.destroy()});
  if(this.ledger.claim(item)){const owner=s.coop?.actor(_credit?.playerId??1)??s,kind=crateReward(Math.random,owner.rogue?.has('scrapper'));if(kind==='hc')s.economy.supply(FORTUNE.crateHC);else if(kind!=='none')s.addDrop(item.x,item.y,kind,0);if(Math.random()<CHAOS.crateChance)s.addDrop(item.x+25,item.y,'throwable',Math.floor(Math.random()*5))}return true;
 }
 melee(x:number,y:number,angle:number,range:number,damage:number){const view=[...this.views.values()].filter(v=>v.item.kind==='crate'&&!v.item.opened&&Math.hypot(v.item.x-x,v.item.y-y)<=range&&Math.cos(Math.atan2(v.item.y-y,v.item.x-x)-angle)>.35&&this.s.lineClear(x,y,v.item.x+(x-v.item.x)*.6,v.item.y+(y-v.item.y)*.6)).sort((a,b)=>Math.hypot(a.item.x-x,a.item.y-y)-Math.hypot(b.item.x-x,b.item.y-y))[0];if(!view)return false;this.s.mapVisuals.impactAt(view.item.x,view.item.y);return this.damage(view.item,damage*CRATE_MELEE_DAMAGE_MULTIPLIER)}
 blast(x:number,y:number,radius:number,damage:number,credit?:ShotCredit){for(const {item} of [...this.views.values()])if(item.kind==='crate'&&!item.opened&&Math.hypot(item.x-x,item.y-y)<radius)this.damage(item,damage,credit)}
 private nearest(){return [...this.views.values()].filter(v=>v.item.kind!=='crate'&&!v.item.opened&&Math.hypot(v.item.x-this.s.player.x,v.item.y-this.s.player.y)<FORTUNE.range&&this.s.lineClear(this.s.player.x,this.s.player.y,v.item.x,v.item.y)).sort((a,b)=>Math.hypot(a.item.x-this.s.player.x,a.item.y-this.s.player.y)-Math.hypot(b.item.x-this.s.player.x,b.item.y-this.s.player.y))[0]}
 interact(){const s=this.s,view=this.nearest(),point=this.continuePoint;
  if(point&&Math.hypot(point.x-s.player.x,point.y-s.player.y)<80&&(!view||Math.hypot(point.x-s.player.x,point.y-s.player.y)<Math.hypot(view.item.x-s.player.x,view.item.y-s.player.y))){s.rounds.continueNow();return true}
  if(!view)return false;const item=view.item;if(item.kind==='safe')return true;
  if(this.busy||s.rounds.state.phase!=='rest'){this.message='CAJA MISTERIOSA · DISPONIBLE EN DESCANSO';this.until=s.clock+1400;return true}
  const wallet=permanentProgress();if(!wallet.spend(FORTUNE.mysteryCost)){this.message=`CAJA MISTERIOSA · NECESITAS ${FORTUNE.mysteryCost} HC`;this.until=s.clock+1800;return true}
  this.busy=true;item.opened=true;view.image.setTexture('fortune-mystery-open');
  if(!s.roulette.start(()=>{this.busy=false;if(this.ledger.claim(item))s.awardWeapon(s.roulette.winner);s.rounds.state.restUntil=Math.max(s.rounds.state.restUntil,s.clock+5000)})){wallet.award(FORTUNE.mysteryCost);this.busy=false;item.opened=false;view.image.setTexture('fortune-mystery')}
  return true;
 }
 update(delta:number){if(this.stopped)return;const s=this.s;this.graphics.clear();const view=this.nearest();
  if(view){const item=view.item;if(item.kind==='safe'){
    const hub=inputHub(s.game),p=s.input.activePointer,world=s.cameras.main.getWorldPoint(p.x,p.y),mouse=!p.wasTouch&&p.isDown&&Math.hypot(world.x-item.x,world.y-item.y)<45;
    const held=hub.holding(s.keys.E,'interact')||mouse;
    if(this.ledger.advance(item,delta,held,true)&&this.ledger.claim(item)){view.image.setTexture('fortune-safe-open');s.awardWeapon(safeWeapon());if(Math.random()<CHAOS.safeChance)s.addDrop(item.x+40,item.y,'throwable',Math.floor(Math.random()*5))}
    this.graphics.lineStyle(3,0x514b41,.7).strokeCircle(item.x,item.y,53);this.graphics.lineStyle(4,0xffd343,1).beginPath().arc(item.x,item.y,53,-Math.PI/2,-Math.PI/2+2*Math.PI*item.progress/FORTUNE.safeTime).strokePath();
    s.hint.setText(`CAJA FUERTE · MANTÉN INTERACCIÓN · ${Math.ceil(item.progress/FORTUNE.safeTime*100)}%`);
   }else{s.hint.setText(`CAJA MISTERIOSA · [E / ×] ${FORTUNE.mysteryCost} HC${s.rounds.state.phase==='rest'?'':' · EN DESCANSO'}`);this.graphics.lineStyle(2,0xffd34b,.55).strokeCircle(item.x,item.y,58+Math.sin(s.clock/180)*2)}
  }
  if(this.continuePoint&&Math.hypot(this.continuePoint.x-s.player.x,this.continuePoint.y-s.player.y)<80)s.hint.setText('CONTINUAR RONDA · [E / ×]');
  if(s.clock<this.until)s.hint.setText(this.message);
 }
 offerRest(){const s=this.s;if(this.restId){this.hide(this.restId);this.ledger.objects.delete(this.restId)}this.continuePoint?.label.destroy();
  const find=(side:number)=>{for(let ring=3;ring<=10;ring++)for(let i=-ring;i<=ring;i++){const x=(Math.floor(s.player.x/48)+side*ring)*48+24,y=(Math.floor(s.player.y/48)+i)*48+24;if(!this.occupied(x,y,100)&&s.walkablePoint(x,y,1)&&s.navigation.canReach(s.player.body!.center,{x,y})&&s.lineClear(s.player.x,s.player.y,x,y)&&!s.foes.some(e=>Math.hypot(e.sprite.x-x,e.sprite.y-y)<120))return {x,y}}return s.lootPoint(s.player.x+side*150,s.player.y)};
  const p=find(1),id=`rest:${s.run.round}`,item:FortuneObject={id,chunk:`${Math.floor(p.x/1536)},${Math.floor(p.y/1536)}`,kind:'mystery',...p,hp:0,progress:0,opened:false,rewarded:false};this.restId=id;this.ledger.objects.set(id,item);this.show(item);
  const next=find(-1);this.continuePoint={...next,label:s.add.text(next.x,next.y,'▶ SIGUIENTE RONDA\n[E / ×]',{fontFamily:'monospace',fontSize:13,color:'#79f9ff',backgroundColor:'#101124',padding:{x:6,y:6},align:'center'}).setOrigin(.5).setDepth(18)};
 }
 leaveRest(){this.continuePoint?.label.destroy();this.continuePoint=undefined}
 stop(){if(this.stopped)return;this.stopped=true;for(const id of [...this.views.keys()])this.hide(id);this.leaveRest();this.ledger.clear();this.graphics.destroy()}
}
