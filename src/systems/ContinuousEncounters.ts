import {streamRandom} from '../world/ContinuousCityState';
import {pursuitRoute} from './BossPursuit';
import type {Game,Foe} from '../scenes/Game';
import {EncounterCalendar,encounterRules} from './EncounterCalendar';
import {AudioSystem} from './AudioSystem';
import {BOSS_DEFINITIONS,bossName} from '../bosses/expansion';
import {INTRO_LINES} from '../uroboros/config';
import {JORDAN_BOSS_LINES} from '../v20/dialogues';

type Message={text:string;priority:number;until:number};
export class ContinuousEncounters {
 readonly calendar:EncounterCalendar;
 private members=new Map<Foe,string>();
 private damageByBoss=new Map<number,number>();
 damageScale(id:number){return this.damageByBoss.get(id)??1}
 private seen=new Set<number>();
 private current?:Message;
 private queue:Message[]=[];
 private notice;
 private paint;
 private arrows=new Map<Foe,Phaser.GameObjects.Text>();
 private routes=new WeakMap<Foe,{target:Game['player'];points:{x:number;y:number}[];next:number;index:number}>();
 defenceUntil=0;
 constructor(private s:Game){
  this.calendar=new EncounterCalendar(streamRandom(s.run.seed,3108));
  this.notice=s.add.text(640,230,'',{fontFamily:'monospace',fontSize:17,align:'center',backgroundColor:'#1c0929',wordWrap:{width:610}}).setOrigin(.5).setScrollFactor(0).setDepth(98).setVisible(false);
  this.paint=s.add.graphics().setDepth(18);
 }
 get living(){return this.members.size}
 private message(text:string,priority:number){
  const next={text,priority,until:0};
  if(this.current && priority>this.current.priority)this.current=undefined;
  this.queue.push(next);this.queue.sort((a,b)=>b.priority-a.priority);this.queue.length=Math.min(4,this.queue.length);
 }
 update(){
  const s=this.s, now=s.continuous!.elapsed;
  this.calendar.update(now,this.living,id=>{
   AudioSystem.play(s,'critical');
   this.message(id===6?'ALERTA UROBOROS · WESKER EN CAMINO':'ALERTA · ENCUENTRO '+id,4);
  },(boss,key)=>{
   const placement=s.coop?.pressure;
   const point=placement?placement.spawnPoint(550,true):s.validPoint(550,true);
   if(!point)return false;
   const [x,y]=point;
   if(!placement&&(Math.hypot(x-s.player.x,y-s.player.y)<500||!s.walkablePoint(x,y,1)||s.fortune.occupied(x,y,100)||!s.navigation.canReach(s.player.body!.center,{x,y})))return false;
   const foe=s.spawnContinuousBoss(boss,[x,y]);
   const scheduled=this.calendar.nextId*encounterRules.period;
   const pressure=scheduled/(scheduled+600000);
   foe.max=foe.hp=Math.round(foe.max*(1+encounterRules.extraBossHealth*pressure));
   this.damageByBoss.set(boss,1+encounterRules.extraBossDamage*pressure);
   this.members.set(foe,key);
   const c=s.character,b=BOSS_DEFINITIONS[boss],i=c.id==='nicolas'?1:0;
   const lines=boss===5?INTRO_LINES[c.id]:c.id==='jordan'?JORDAN_BOSS_LINES[boss]:boss===0?[c.bossTaunt,c.bossReply]:[b.lines[i],'replies' in b?b.replies[i]:c.bossReply];
   const first=!this.seen.has(boss);this.seen.add(boss);
   this.message(first?bossName(boss)+' · '+(b?.weaponName??'UROBOROS')+'\n'+lines[0]+'\n'+c.name+' · '+lines[1]:bossName(boss),first?(boss===5?5:3):1);
   return true;
  });
  if(!this.current||now>=this.current.until){
   this.current=this.queue.shift();
   if(this.current)this.current.until=now+(this.current.priority===4?10000:5000);
   this.notice.setText(this.current?.text??'').setVisible(!!this.current);
  }
  this.draw();
 }
 /** Offscreen pursuit retains the same Arcade body and follows real map cells. */
 distant(e:Foe,player=this.s.player){
  if(!this.members.has(e))return false;
  const s=this.s,body=e.sprite.body!,d=Math.hypot(body.center.x-player.x,body.center.y-player.y);
  const near=d<1100||(!s.coop?.pressure&&s.cameras.main.worldView.contains(e.sprite.x,e.sprite.y));
  if(near&&s.lineClear(body.center.x,body.center.y,player.x,player.y))return false;
  const fits=(x:number,y:number)=>{
   for(const dx of [-body.halfWidth,body.halfWidth])for(const dy of [-body.halfHeight,body.halfHeight]){
    if(!s.walkablePoint(x+dx,y+dy))return false;
   }
   return true;
  };
  let route=this.routes.get(e);
  if(!route||route.target!==player||s.clock>=route.next){
   route={target:player,points:pursuitRoute(body.center,player.body!.center,fits),index:0,next:s.clock+(near?650:d>2000?2200:1200)};
   this.routes.set(e,route);
  }
  let point=route.points[route.index];
  if(point&&Math.hypot(point.x-body.center.x,point.y-body.center.y)<4)point=route.points[++route.index];
  e.sprite.setVelocity(0);
  if(point){
   const dx=point.x-body.center.x,dy=point.y-body.center.y,length=Math.hypot(dx,dy);
   const step=Math.min(length,8);
   if(length&&fits(body.center.x+dx/length*step,body.center.y+dy/length*step)){
    const speed=Math.min(90,length*20);e.sprite.setVelocity(dx/length*speed,dy/length*speed);
   }
  }
  return true;
 }
 defeated(e:Foe,environment=false){
  if(!this.members.delete(e))return;
  this.arrows.get(e)?.destroy();this.arrows.delete(e);
  const s=this.s,choices:Array<()=>string>=[];
  if(s.run.health<s.run.stats.maxHealth)choices.push(()=>{s.run.health=Math.min(s.run.stats.maxHealth,s.run.health+s.run.stats.maxHealth*.35);return 'SALUD RECUPERADA'});
  if(!environment&&!s.ultimate.active(s.clock)&&s.ultimate.charge<s.ultimate.requiredHits)choices.push(()=>{s.ultimate.charge=Math.min(s.ultimate.requiredHits,s.ultimate.charge+Math.ceil(s.ultimate.requiredHits*.35));return 'CARGA DE DEFINITIVA'});
  if(s.run.medkits<3)choices.push(()=>{s.run.medkits++;return 'BOTIQUÍN'});
  const reward=choices.length?choices[Math.floor(Math.random()*choices.length)]():(this.defenceUntil=s.clock+30000,'DEFENSA +15 % · 30 S');
  this.message('RECOMPENSA · '+reward,2);AudioSystem.play(s,'reward');
 }
 private draw(){
  const s=this.s,v=s.cameras.main.worldView;
  this.paint.clear();
  for(const e of this.members.keys()){
   const sprite=e.sprite,visible=v.contains(sprite.x,sprite.y);
   let arrow=this.arrows.get(e);
   if(!arrow){arrow=s.add.text(0,0,'',{fontFamily:'monospace',fontSize:13,backgroundColor:'#21091d',color:'#ffb3df'}).setOrigin(.5).setDepth(97);this.arrows.set(e,arrow)}
   arrow.setVisible(!visible);
   if(visible){const x=sprite.x-22,y=sprite.getBounds().top-5;
    this.paint.fillStyle(0x180718).fillRect(x,y,44,4).fillStyle(0xff397c).fillRect(x,y,44*e.hp/e.max,4);
   }else{
    const dx=sprite.x-v.centerX,dy=sprite.y-v.centerY;
    const scale=Math.min((v.width/2-95)/Math.abs(dx),(v.height/2-155)/Math.abs(dy));
    const direction=['→','↘','↓','↙','←','↖','↑','↗'][(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];
    arrow.setPosition(v.centerX+dx*scale,v.centerY+dy*scale).setText(direction+' '+bossName(e.boss).replace('EL ','')+' '+Math.round(Math.hypot(dx,dy)/48));
   }
  }
 }
 stop(){this.members.clear();this.queue=[];this.current=undefined;this.notice.setVisible(false);this.paint.clear();for(const arrow of this.arrows.values())arrow.destroy();this.arrows.clear()}
}
