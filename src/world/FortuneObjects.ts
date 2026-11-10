import {CHAOS} from '../chaos/config';
import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import type {ShotCredit} from '../systems/Ultimate';
import {FORTUNE,CRATE_MELEE_DAMAGE_MULTIPLIER} from '../config/fortune';
import {hudPreferences} from '../ui/HudPreferences';
import {mysteryWeights} from '../systems/MysteryLottery';
import {permanentProgress} from '../systems/PermanentProgress';
import {FortuneLedger,crateReward,safeWeapon,type FortuneObject} from './FortuneState';
import type {Chunk} from './WorldModel';
import {actorDepth} from '../maps/environment';
interface View {item:FortuneObject;image:Phaser.Physics.Arcade.Image;price?:Phaser.GameObjects.Text}
export class FortuneObjects {
 readonly ledger=new FortuneLedger();readonly views=new Map<string,View>();private graphics:Phaser.GameObjects.Graphics;private message='';private until=0;private stopped=false;
 private continuePoint?:{x:number;y:number;label:Phaser.GameObjects.Text};private restId?:string;private busy=false;
 pending?:{id:string;actor:Game;until:number};
 get confirmationText(){return this.pending?`CAJA MISTERIOSA · CONFIRMAR ${FORTUNE.mysteryCost} HC · [E / ×]`:''}
 cancelConfirmation(){this.pending=undefined}
 constructor(private s:Game){this.graphics=s.add.graphics().setDepth(16)}
 load(chunk:Chunk){if(this.stopped)return;for(const item of this.ledger.load(this.s.worldModel,chunk))this.show(item)}
 placeUroborosCrate(id:string,x:number,y:number,hp:number){
  const item:FortuneObject={id,kind:'crate',chunk:'station',x,y,hp,progress:0,opened:false,rewarded:false,uroboros:true};
  this.ledger.objects.set(id,item);
  this.show(item);
 }
 private show(item:FortuneObject){if(this.views.has(item.id)||(item.kind==='crate'&&item.opened))return;const s=this.s;
  if(!item.opened&&(Math.hypot(item.x-s.player.x,item.y-s.player.y)<100||s.foes.some(e=>Math.hypot(item.x-e.sprite.x,item.y-e.sprite.y)<100)))return;
  const texture=`fortune-${item.kind}${item.opened?'-open':item.kind==='crate'&&item.hp<FORTUNE.crateHP?'-hurt':''}`,image=s.physics.add.staticImage(item.x,item.y,item.uroboros?'uroboros':texture,item.uroboros?'crate':undefined).setDepth(actorDepth(item.y+24));
  if(item.uroboros)image.setDisplaySize(46,42).refreshBody();else image.setScale(item.kind==='mystery'?1.05:.9);
  image.setData('fortune',item.id);image.body!.checkCollision.none=item.kind!=='crate';
  if(item.kind==='crate'){image.body!.setSize(34,34);s.walls.add(image);s.worldModel.setDynamicSolid(Math.floor(item.x/48),Math.floor(item.y/48),true)}
  const price=item.kind==='mystery'?s.add.text(item.x,item.y+42,`${FORTUNE.mysteryCost} HC`,{fontFamily:'monospace',fontSize:14,color:'#ffe26d',stroke:'#100819',strokeThickness:4,align:'center'}).setOrigin(.5).setDepth(18):undefined;this.views.set(item.id,{item,image,price});
 }
 private hide(id:string){const view=this.views.get(id);if(!view)return;const {item,image}=view;if(item.kind==='safe'&&!item.opened)item.progress=0;view.price?.destroy();if(this.pending?.id===id)this.cancelConfirmation();if(item.kind==='crate'){this.s.worldModel.setDynamicSolid(Math.floor(item.x/48),Math.floor(item.y/48),false);if(image.body)this.s.physics.world.remove(image.body);if(this.s.walls.children)this.s.walls.remove(image,true,true);else image.destroy()}else image.destroy();this.views.delete(id)}
 occupied(x:number,y:number,radius=70){return [...this.views.values()].some(v=>Math.hypot(v.item.x-x,v.item.y-y)<radius)}
 unload(chunk:string){for(const [id,v] of this.views)if(v.item.chunk===chunk)this.hide(id)}
 atObstacle(object:unknown){const id=(object as Phaser.GameObjects.GameObject)?.getData?.('fortune') as string|undefined;return id?this.views.get(id)?.item:undefined}
 atPoint(x:number,y:number){return [...this.views.values()].find(v=>v.item.kind==='crate'&&!v.item.opened&&Math.floor(v.item.x/48)===Math.floor(x/48)&&Math.floor(v.item.y/48)===Math.floor(y/48))?.item}
 damage(item:FortuneObject,amount:number,_credit?:ShotCredit){if(!this.ledger.damage(item,amount)){const view=this.views.get(item.id);if(view&&!item.uroboros&&item.hp<FORTUNE.crateHP)view.image.setTexture('fortune-crate-hurt');return false}
  const s=this.s;this.hide(item.id);
  if(item.uroboros){
   s.add.image(item.x,item.y,'uroboros','crate-open').setDisplaySize(46,44).setDepth(2);
   if(this.ledger.claim(item))s.uroboros?.dropCure(item.x,item.y);
   return true;
  }
  const debris=s.add.image(item.x,item.y,'fortune-crate-dead').setDepth(2);s.tweens.add({targets:debris,alpha:0,duration:550,onComplete:()=>debris.destroy()});
  if(this.ledger.claim(item)){const owner=s.coop?.actor(_credit?.playerId??1)??s,kind=crateReward(Math.random,owner.rogue?.has('scrapper'));if(kind==='hc')s.economy.supply(FORTUNE.crateHC);else if(kind!=='none')s.addDrop(item.x,item.y,kind,0);if(Math.random()<CHAOS.crateChance)s.addDrop(item.x+25,item.y,'throwable',Math.floor(Math.random()*5))}return true;
 }
 melee(x:number,y:number,angle:number,range:number,damage:number){const view=[...this.views.values()].filter(v=>v.item.kind==='crate'&&!v.item.opened&&Math.hypot(v.item.x-x,v.item.y-y)<=range&&Math.cos(Math.atan2(v.item.y-y,v.item.x-x)-angle)>.35&&this.s.lineClear(x,y,v.item.x+(x-v.item.x)*.6,v.item.y+(y-v.item.y)*.6)).sort((a,b)=>Math.hypot(a.item.x-x,a.item.y-y)-Math.hypot(b.item.x-x,b.item.y-y))[0];if(!view)return false;this.s.mapVisuals.impactAt(view.item.x,view.item.y);return this.damage(view.item,damage*CRATE_MELEE_DAMAGE_MULTIPLIER)}
 blast(x:number,y:number,radius:number,damage:number,credit?:ShotCredit){for(const {item} of [...this.views.values()])if(item.kind==='crate'&&!item.opened&&Math.hypot(item.x-x,item.y-y)<radius)this.damage(item,damage,credit)}
 private near(item:FortuneObject,actor:Game){return actor.run.health>0&&!this.s.coop?.incapacitated(actor.playerId)&&Math.hypot(item.x-actor.player.x,item.y-actor.player.y)<FORTUNE.range&&this.s.lineClear(actor.player.x,actor.player.y,item.x,item.y)}
 private nearest(){const owner=this.s.coop?.actor(this.s.coop.interactionId||1)??this.s;return [...this.views.values()].filter(v=>v.item.kind!=='crate'&&!v.item.opened&&this.near(v.item,owner)).sort((a,b)=>Math.hypot(a.item.x-this.s.player.x,a.item.y-this.s.player.y)-Math.hypot(b.item.x-this.s.player.x,b.item.y-this.s.player.y))[0]}
 interact(){const s=this.s,view=this.nearest(),point=this.continuePoint;
  if(point&&Math.hypot(point.x-s.player.x,point.y-s.player.y)<80&&(!view||Math.hypot(point.x-s.player.x,point.y-s.player.y)<Math.hypot(view.item.x-s.player.x,view.item.y-s.player.y))){s.rounds.continueNow();return true}
  if(!view)return false;const item=view.item;if(item.kind==='safe')return true;
  if(this.busy||s.rounds.state.phase!=='rest'){this.message='CAJA MISTERIOSA · DISPONIBLE EN DESCANSO';this.until=s.clock+1400;return true}
  const owner=s.coop?.actor(s.coop.interactionId||1)??s;
  if(this.pending?.id!==item.id){this.pending={id:item.id,actor:owner,until:s.clock+6000};view.price?.setText(`CONFIRMAR ${FORTUNE.mysteryCost} HC\n[E / ×] · ALEJARSE CANCELA`);return true}
  if(this.pending.actor.playerId!==owner.playerId)return true;
  if(s.clock>this.pending.until||!this.near(item,owner)){this.cancelConfirmation();return true}
  this.cancelConfirmation();
  const wallet=permanentProgress();if(!wallet.spend(FORTUNE.mysteryCost)){this.message=`CAJA MISTERIOSA · NECESITAS ${FORTUNE.mysteryCost} HC`;this.until=s.clock+1800;return true}
  this.busy=true;item.opened=true;view.image.setTexture('fortune-mystery-open');
  if(!s.roulette.start(()=>{this.busy=false;if(this.ledger.claim(item))owner.awardWeapon(s.roulette.winner);s.rounds.state.restUntil=Math.max(s.rounds.state.restUntil,s.clock+5000)},mysteryWeights())){wallet.award(FORTUNE.mysteryCost);this.busy=false;item.opened=false;view.image.setTexture('fortune-mystery')}
  return true;
 }
 update(delta:number){const s=this.s;if(this.stopped||s.paused||s.ended||s.roulette.active||s.levelUp.active||s.coop?.actor(2).levelUp.active||s.presentation.active||s.bossDialogue.active)return;this.graphics.clear();const view=this.nearest();
  const actors=s.coop?.livingActors()??[s];if(this.pending){const pending=this.views.get(this.pending.id);if(!pending||pending.item.opened||!this.near(pending.item,this.pending.actor)||s.clock>this.pending.until||s.rounds.state.phase!=='rest')this.cancelConfirmation()}
  for(const row of this.views.values()){
   const eligible=actors.filter(a=>this.near(row.item,a)).sort((a,b)=>Math.hypot(row.item.x-a.player.x,row.item.y-a.player.y)-Math.hypot(row.item.x-b.player.x,row.item.y-b.player.y));
   row.price?.setVisible(!row.item.opened&&eligible.length>0).setText(this.pending?.id===row.item.id?`CONFIRMAR ${FORTUNE.mysteryCost} HC\n[E / ×] · ALEJARSE CANCELA`:`${FORTUNE.mysteryCost} HC${hudPreferences.helpers?' · [E / ×] COMPRAR':''}`);
   if(row.item.kind!=='safe'||row.item.opened)continue;
   if(this.ledger.advance(row.item,delta,eligible.length>0)&&this.ledger.claim(row.item)){row.image.setTexture('fortune-safe-open');eligible[0].awardWeapon(safeWeapon());if(Math.random()<CHAOS.safeChance)s.addDrop(row.item.x+40,row.item.y,'throwable',Math.floor(Math.random()*5))}
   if(eligible.length){this.graphics.lineStyle(3,0x514b41,.7).strokeCircle(row.item.x,row.item.y,53);this.graphics.lineStyle(4,0xffd343,1).beginPath().arc(row.item.x,row.item.y,53,-Math.PI/2,-Math.PI/2+2*Math.PI*row.item.progress/FORTUNE.safeTime).strokePath()}
  }
  if(view){const item=view.item;if(item.kind==='safe'){
    s.hint.setText(`CAJA FUERTE · APERTURA AUTOMÁTICA · ${Math.ceil(item.progress/FORTUNE.safeTime*100)}%`);
   }else{s.hint.setText(`CAJA MISTERIOSA · [E / ×] ${FORTUNE.mysteryCost} HC${s.rounds.state.phase==='rest'?'':' · EN DESCANSO'}`);this.graphics.lineStyle(2,0xffd34b,.55).strokeCircle(item.x,item.y,58+Math.sin(s.clock/180)*2)}
  }
  if(this.continuePoint&&Math.hypot(this.continuePoint.x-s.player.x,this.continuePoint.y-s.player.y)<80)s.hint.setText('CONTINUAR RONDA · [E / ×]');
  if(s.clock<this.until)s.hint.setText(this.message);
  if(this.pending)s.hint.setText(this.confirmationText);
 }
 offerRest(){const s=this.s;if(this.restId){this.hide(this.restId);this.ledger.objects.delete(this.restId)}this.continuePoint?.label.destroy();
  const find=(side:number)=>{for(let ring=3;ring<=10;ring++)for(let i=-ring;i<=ring;i++){const x=(Math.floor(s.player.x/48)+side*ring)*48+24,y=(Math.floor(s.player.y/48)+i)*48+24;if(!this.occupied(x,y,100)&&s.walkablePoint(x,y,1)&&s.navigation.canReach(s.player.body!.center,{x,y})&&s.lineClear(s.player.x,s.player.y,x,y)&&!s.foes.some(e=>Math.hypot(e.sprite.x-x,e.sprite.y-y)<120))return {x,y}}return s.lootPoint(s.player.x+side*150,s.player.y)};
  const p=find(1),id=`rest:${s.run.round}`,item:FortuneObject={id,chunk:`${Math.floor(p.x/1536)},${Math.floor(p.y/1536)}`,kind:'mystery',...p,hp:0,progress:0,opened:false,rewarded:false};this.restId=id;this.ledger.objects.set(id,item);this.show(item);
  const next=find(-1);this.continuePoint={...next,label:s.add.text(next.x,next.y,'▶ SIGUIENTE RONDA\n[E / ×]',{fontFamily:'monospace',fontSize:13,color:'#79f9ff',backgroundColor:'#101124',padding:{x:6,y:6},align:'center'}).setOrigin(.5).setDepth(18)};
 }
 leaveRest(){this.cancelConfirmation();this.continuePoint?.label.destroy();this.continuePoint=undefined}
 stop(){if(this.stopped)return;this.stopped=true;for(const id of [...this.views.keys()])this.hide(id);this.leaveRest();this.ledger.clear();this.graphics.destroy()}
}
