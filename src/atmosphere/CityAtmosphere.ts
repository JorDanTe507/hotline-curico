import {ActorLighting} from './ActorLighting';
import {ATMOSPHERE,approach,poweredTint} from './AtmosphereStyle';
import {RainAmbience} from './RainAmbience';
import Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {WorldRoutes} from '../world/WorldRoutes';
import {CHUNK_SIZE,hash} from '../world/WorldModel';
import {CITY,WeatherCycle,EventDirector,EffectQuality,type Weather,type CityEvent,type DirectorContext} from './CityState';
import {AudioSystem} from '../systems/AudioSystem';
import {maxHealth} from '../systems/HealthCapacity';
/** Presentation is bounded to the streamed neighborhood; logical sector states outlive sprites. */
export class CityAtmosphere {
 readonly weather=new WeatherCycle();readonly director=new EventDirector();readonly quality=new EffectQuality();
 private actors=new ActorLighting();
 private beforeRender=()=>{if(this.director.blackout(this.sector,this.s.clock))this.actors.apply([this.s.player,...(this.s.coop?[this.s.coop.actor(2).player]:[]),...this.s.foes.map(e=>e.sprite)])};
 private afterRender=()=>this.actors.restore();
 private ambience:RainAmbience;private splashes:Phaser.GameObjects.Image[]=[];private rain:Phaser.GameObjects.Image[]=[];private fog:Phaser.GameObjects.TileSprite[]=[];private notice:Phaser.GameObjects.Text;private noticeUntil=0;private rainAlpha=0;private fogAlpha=0;private previousRound=0;
 constructor(private s:Game){
  this.ambience=new RainAmbience(s);s.events.on(Phaser.Scenes.Events.PRE_RENDER,this.beforeRender);s.events.on(Phaser.Scenes.Events.RENDER,this.afterRender);
  if(!s.textures.exists('rain173-drop')){const g=s.make.graphics({x:0,y:0});g.fillStyle(0x9dd4ee).fillRect(1,0,1,8).fillRect(0,8,1,8);g.generateTexture('rain173-drop',2,16);g.clear().fillStyle(0xb4dce8).fillRect(0,2,2,1).fillRect(6,2,2,1).fillRect(3,0,2,1);g.generateTexture('rain173-splash',8,3);g.destroy()}
  for(let i=0;i<160;i++)this.rain.push(s.add.image(0,0,'rain173-drop').setDepth(7).setVisible(false));
  for(let i=0;i<24;i++)this.splashes.push(s.add.image(0,0,'rain173-splash').setDepth(1.8).setVisible(false));
  for(let i=0;i<2;i++){const fog=s.add.tileSprite(640,360,1280,720,'v17-weather-fog').setScrollFactor(0).setDepth(i?12.8:7).setAlpha(0).setTint(i?0xc4d6df:0xaabacb);fog.setTileScale(i?2.3:1.7);this.fog.push(fog)}
  this.notice=s.add.text(1240,180,'',{fontFamily:'monospace',fontSize:13,color:'#a5c5d6',stroke:'#10101a',strokeThickness:3}).setOrigin(1,0).setScrollFactor(0).setDepth(92);s.events.once('shutdown',()=>this.stop())
 }

 get sector(){return `${Math.floor(this.s.player.x/CHUNK_SIZE)},${Math.floor(this.s.player.y/CHUNK_SIZE)}`}
 context():DirectorContext{const s=this.s;return {round:s.run.round,now:s.clock,healthRatio:s.run.health/maxHealth(s.run),armor:s.run.armor,alive:s.foes.length,boss:s.rounds.state.plan.type==='BOSS'||s.foes.some(e=>e.boss>=0),combat:s.rounds.state.phase==='combat'&&!s.roulette.active&&!s.presentation.active&&!s.levelUp.active,sector:this.sector,weather:this.weather.weather,quality:this.quality.level}}
 announce(value:string){this.notice.setText(value);this.noticeUntil=this.s.clock+3300}
 forceWeather(value:Weather){this.weather.force(value,this.s.run.round);this.announce(value==='clear'?'El cielo se despeja.':value==='rain'?'Empieza a llover.':'La niebla cubre las calles.')}
 forceEvent(kind:CityEvent){const c=this.context();if(!this.director.start(kind,c,true))return false;return this.dispatch(kind,c)}
 private dispatch(kind:CityEvent,c:DirectorContext){if(kind==='ambush'||kind==='reinforcements'){const points=this.spawnPoints(Math.min(2,CITY.maxExtraPerRound-this.director.extraThisRound));if(!points.length||!this.s.rounds.queueReinforcements(points,c.sector)){this.director.resolve(c.sector);return false}this.director.extraThisRound+=points.length;this.announce(kind==='ambush'?'Pasos en un acceso cercano…':'Se oyen motores a lo lejos…');AudioSystem.play(this.s,'motor',.16)}else {this.announce(kind==='blackout'?'Falla el tendido de toda la ciudad.':kind==='flicker'?'Las luces titilan.':'El viento cambia.');if(kind==='blackout')AudioSystem.play(this.s,'motor',.12)}return true}
 spawnPoints(count:number){const s=this.s,camera=s.cameras.main.worldView,route=new WorldRoutes(s.worldModel),out:[number,number][]=[];for(let i=0;i<120&&out.length<count;i++){const angle=i*2.399963,range=CITY.minSpawnDistance+(i%5)*110,gx=Math.floor((s.player.x+Math.cos(angle)*range)/48),gy=Math.floor((s.player.y+Math.sin(angle)*range)/48),x=gx*48+24,y=gy*48+24,distance=Math.hypot(x-s.player.x,y-s.player.y);if(distance<CITY.minSpawnDistance||distance>CITY.maxSpawnDistance||camera.contains(x,y)||out.some(p=>Math.hypot(x-p[0],y-p[1])<120)||s.foes.some(e=>Math.hypot(x-e.sprite.x,y-e.sprite.y)<100))continue;let clear=true;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(s.worldModel.cell(gx+dx,gy+dy))clear=false;if(!clear||!route.route(s.player,{x,y}).length)continue;out.push([x,y])}return out}
 inside(x:number,y:number){const gx=Math.floor(x/48),gy=Math.floor(y/48);if(this.s.worldModel.inApartment(gx,gy))return true;const cx=Math.floor(gx/32),cy=Math.floor(gy/32),chunk=this.s.worldModel.chunk(cx,cy),xx=gx-cx*32,yy=gy-cy*32;return chunk.buildings.some(b=>xx>=b.x&&xx<b.x+b.w&&yy>=b.y&&yy<b.y+b.h)}
 update(delta:number){const s=this.s;if(s.ended||s.paused)return;this.quality.update(delta);if(s.run.round!==this.previousRound){this.previousRound=s.run.round;this.weather.beginRound(s.run.round,s.rounds.state.plan.type==='BOSS')}
 const c=this.context(),event=this.director.tick(c);if(event)this.dispatch(event,c);const pulse=this.director.sectors.get(this.sector),boost=pulse&&!pulse.resolved&&pulse.kind==='weather-pulse'?1.2:1;this.rainAlpha=approach(this.rainAlpha,this.weather.weather==='rain'?1:0,delta);this.fogAlpha=approach(this.fogAlpha,this.weather.weather==='fog'?1:0,delta);this.ambience.update(delta,this.weather.weather==='rain',this.inside(s.player.x,s.player.y));
 const budget=this.quality.budget,view=s.cameras.main.worldView;
 for(const [i,drop] of this.rain.entries()){
  if(i>=budget.rain||this.rainAlpha<.01){drop.setVisible(false);continue}
  const n=hash(s.run.seed+173,i,1),speed=.52+(n%53)/100,length=16+n%22,cycle=Math.floor((s.clock*speed+n%1000)/(view.height+80));
  const x=view.x+(hash(s.run.seed+cycle,i,3)%Math.max(1,Math.floor(view.width))),y=view.y+((s.clock*speed+n%1000)%(view.height+80))-40;
  drop.setPosition(x,y).setDisplaySize(n%4===0?2:1,length).setRotation(.14).setVisible(!this.inside(x,y)).setAlpha(ATMOSPHERE.rainOpacity*this.rainAlpha*boost*(.65+(n%35)/100));
 }
 for(const [i,splash] of this.splashes.entries()){
  const phase=(s.clock+i*137)%1100,n=Math.floor((s.clock+i*137)/1100),x=view.x+hash(s.run.seed+n,i,6)%Math.max(1,Math.floor(view.width)),y=view.y+hash(s.run.seed+n,i,7)%Math.max(1,Math.floor(view.height));
  const visible=this.rainAlpha>.03&&i<Math.floor(budget.rain/7)&&phase<180&&!this.inside(x,y)&&!s.worldModel.cell(Math.floor(x/48),Math.floor(y/48));
  splash.setPosition(x,y).setVisible(visible).setScale(1+phase/180).setAlpha(.55*this.rainAlpha*(1-phase/180));
 }
 for(const [i,fog] of this.fog.entries()){fog.tilePositionX=s.cameras.main.scrollX*.15+s.clock*(i?-.009:.006);fog.tilePositionY=s.cameras.main.scrollY*.15+s.clock*(i?.002:-.001);fog.setAlpha(i<budget.fog?(i?ATMOSPHERE.fogActors:ATMOSPHERE.fogGround)*this.fogAlpha*boost:0)}

 this.refreshLighting();
 this.notice.setVisible(s.clock<this.noticeUntil);if(s.registry.get('mobileUI'))this.notice.setPosition(1240,180)
 }
 refreshLighting(){const s=this.s,budget=this.quality.budget;
 for(const [key,loaded] of s.worldStreamer.loaded){const black=this.director.blackout(key,s.clock),flicker=this.director.sectors.get(key),dimming=black?ATMOSPHERE.blackoutShade:flicker&&!flicker.resolved&&flicker.kind==='flicker'?.06*(.5+.5*Math.sin(s.clock/320)):0;loaded.shade.setAlpha(dimming);for(const object of loaded.objects){const image=object as Phaser.GameObjects.Image;if(!image.getData('electrical'))continue;const base=image.getData('poweredTint')??image.tintTopLeft;image.setData('poweredTint',base).setTint(poweredTint(base,black?ATMOSPHERE.blackoutElectrical:1))}loaded.wet.setAlpha(this.rainAlpha*.62);loaded.puddles.forEach(p=>p.setAlpha(budget.reflections?this.rainAlpha*.65:0));loaded.normalLights.forEach((im,i)=>im.setAlpha((black?0:i%2?.8:budget.reflections?.16:.08)*(flicker&&!flicker.resolved&&flicker.kind==='flicker'?.65+.35*Math.sin(s.clock/320):1)));loaded.emergency.forEach((im,i)=>{im.setVisible(black);if(black)im.setTexture('v17-lights-'+(i?'yellow':'red')+'-'+(Math.floor(s.clock/500)%4)).setAlpha(.85)})}
 for(const light of s.mapVisuals.lights){const key=`${Math.floor(light.image.x/CHUNK_SIZE)},${Math.floor(light.image.y/CHUNK_SIZE)}`;light.image.setAlpha(this.director.blackout(key,s.clock)?0:light.base*(.94+.06*Math.sin(s.clock/190+light.phase)))}
 for(const image of s.mapVisuals.electrical){const key=`${Math.floor(image.x/CHUNK_SIZE)},${Math.floor(image.y/CHUNK_SIZE)}`,base=image.getData('poweredTint')??image.tintTopLeft;image.setData('poweredTint',base).setTint(poweredTint(base,this.director.blackout(key,s.clock)?ATMOSPHERE.blackoutElectrical:1))}
 }

 status(){return `${this.weather.weather.toUpperCase()} · ${this.sector} · FX ${this.quality.level} · ${(1000/this.quality.average).toFixed(0)} FPS\nEVENTO: ${this.director.blackout(this.sector,this.s.clock)?'apagón general':this.director.sectors.get(this.sector)?.kind??'ninguno'} · EXTRAS ${this.director.extraThisRound}/${CITY.maxExtraPerRound}`}
 stop(){this.s.events.off(Phaser.Scenes.Events.PRE_RENDER,this.beforeRender);this.s.events.off(Phaser.Scenes.Events.RENDER,this.afterRender);this.actors.restore();this.ambience.stop();for(const o of [...this.rain,...this.splashes,...this.fog,this.notice])o.destroy();this.director.clear()}
}
