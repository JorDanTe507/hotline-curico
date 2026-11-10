import {characterById, type CharacterId} from '../characters/catalog';
import {chooseSafeDialogue, type SafeHistory} from './dialogues';
import {relayLines,transferRatio} from './relay';
import {SafeConversation} from './SafeConversation';
import type Phaser from 'phaser';
import type {Game, Foe, Drop} from '../scenes/Game';
import {maxHealth} from '../systems/HealthCapacity';
import {developerSession} from '../systems/DeveloperSession';
import {achievements} from '../systems/Achievements';
import {endlessCycle,newEndless,saveEndless,selectEncounter,type EndlessRun,type EndlessResult} from './endless';
import {rushRewards,rushWeights,rushTuning} from './balance';
import {upgradeFrame} from '../ui/LevelUpView';
import {takeMedkit} from '../systems/run';
import {MusicManager} from '../systems/MusicManager';
import {gun, WEAPONS, isMelee} from '../weapons/arsenal';
import {ammoGrant, reserveAmount,dashCooldown} from '../systems/PlayerModifiers';
import {cellPoint, drawRushMap, rushMap, partnerSpawn, SAFE_POINTS, SAFE_ACTOR_POINTS} from './Arenas';
import {STATION_EXIT} from '../uroboros/Station';
import {PowerCut} from './PowerCut';
import {roomProp} from './RoomArt';
import {RUSH_BALANCE as B, RUSH_BOSSES} from './config';
import {clearRush, recordRush, RUSH_CARDS, rushOffer, suspendRush, unlockRush,
  type RushStart, type RushRest, type RushInventory, type RushCard, type RushStats} from './state';

export type RushEntry = RushStart | {kind: 'next'; rest: RushRest};
export class RushSession {
  readonly boss: number;
  readonly encounter:number[];
  readonly endless?:EndlessRun;
  result?:EndlessResult;
  private damageTaken=0;
  private rifleHit=false;
  private cureUsed=false;
  private medkitUsed=false;
  private killed=new Set<number>();
  private friendlyDamage=new WeakMap<Foe,number>();
  get cycle(){return this.endless?endlessCycle(this.endless.cleared-(this.phase==='loot'?1:0)):1;}
  tuning(boss:number){return rushTuning(boss,this.cycle,this.encounter.length===2);}
  elapsed(ms:number){if(this.endless)this.endless.totalMs+=ms;}
  markMedkit(){if(this.combat)this.medkitUsed=true;}
  markCure(){if(this.combat)this.cureUsed=true;}
  get medkitBonus(){return this.rest?.upgrades.filter(id=>id==='medkits').length??0;}
  get resistance(){return this.rest?.upgrades.filter(id=>id==='resist').length??0;}
  readonly map: NonNullable<ReturnType<typeof rushMap>>;
  readonly practice: boolean;
  phase: 'intro' | 'fight' | 'loot' | 'rest' | 'leaving';
  door?: Phaser.GameObjects.Image;
  power?:PowerCut;
  rest?: RushRest;
  cardPanel?: Phaser.GameObjects.Container;
  companionOpen=false;
  practiceWon = false;
  conversation?: SafeConversation;
  readonly actors = new Map<CharacterId, Phaser.GameObjects.Sprite>();
  private readonly dialogueHistory: SafeHistory;
  private readonly relayHistory:SafeHistory;
  private readonly stats: RushStats;
  private credits: number;
  private noticeUntil = 0;
  get balance() { return this.credits; }
  private started = 0;
  private until = 0;
  private status?: Phaser.GameObjects.Text;
  private rewardDrop?: Drop;
  get pendingWeapon() { return this.rewardDrop?.sprite.active ? this.rewardDrop : undefined; }

  constructor(private s: Game, readonly entry: RushEntry) {
    this.practice = entry.kind === 'practice';
    this.rest = 'rest' in entry ? entry.rest : undefined;
    this.boss = entry.kind === 'practice' ? entry.boss : this.rest?.next ?? 0;
    this.endless=this.rest?.endless;
    this.encounter=this.rest?.encounter??[this.boss];
    this.phase = entry.kind === 'resume' ? 'rest' : 'intro';
    this.map = rushMap(this.boss, this.phase === 'rest')!;
    this.stats = this.rest ? {...this.rest.stats, times: [...this.rest.stats.times]} :
      {character: s.character.id, times: [], damage: 0, falls: 0};
    this.credits = this.rest?.credits ?? 0;
    this.dialogueHistory = {...this.rest?.dialogueHistory};
    this.relayHistory={...this.rest?.relayHistory};
  }

  get label() {
    if (this.endless) return `INFINITO · CICLO ${this.cycle} · ${this.endless.cleared} SUPERADOS\n${this.safe?'SALA SEGURA':this.encounter.map(id=>RUSH_BOSSES[id].name).join(' + ')}`;
    if (this.phase === 'rest') return 'BOSS RUSH · SALA SEGURA';
    return `BOSS RUSH · ${this.practice ? 'PRÁCTICA' : (this.boss + 1) + '/' + RUSH_BOSSES.length}\n${RUSH_BOSSES[this.boss].name.toUpperCase()}`;
  }
  get safe() { return this.phase === 'rest'; }
  get peaceful() { return this.phase === 'loot' || this.safe; }
  get combat() { return this.phase === 'fight'; }

  decorate() {
    if (this.map.layout) this.door = drawRushMap(this.s, this.map.layout, this.boss, this.safe, this.actors);
    else {const p=STATION_EXIT;this.door=roomProp(this.s,'station-door',p.x,p.y,61,64,8);}
  }

  start() {
    const s = this.s;
    for(const [key,count,repeat] of [['smoke-flight',4,-1],['smoke-cloud',6,0]] as const){
      const name='rush-'+key;
      if(!s.anims.exists(name))s.anims.create({key:name,frames:Array.from({length:count},(_,i)=>({key:'rush-attack-polish',frame:key+'-'+i})),frameRate:10,repeat});
    }
    const worldW = this.map.width * 48, worldH = this.map.height * 48;
    const viewW = Math.max(worldW,s.cameras.main.width), viewH = Math.max(worldH,s.cameras.main.height);
    s.cameras.main.setBounds((worldW-viewW)/2,(worldH-viewH)/2,viewW,viewH);
    s.cameras.main.centerOn(this.map.start.x,this.map.start.y);
    this.status = s.add.text(640, 133, '', {fontFamily:'monospace', fontSize:19, color:'#ffe6c7', stroke:'#10091b', strokeThickness:4})
      .setOrigin(.5).setScrollFactor(0).setDepth(95);
    if (this.entry.kind === 'campaign' || this.entry.kind === 'next') clearRush();
    if (this.rest) {
      for (const card of this.rest.upgrades) this.apply(card, false);
      this.restore(this.rest.inventory);
    } else {
      const weapon = this.entry.kind === 'practice' ? this.entry.weapon : 0;
      s.guns = [gun(weapon)];
      s.ultimate.charge = Math.floor(s.ultimate.requiredHits / 2);
    }
    if (this.safe) {
      s.banner.setText('');
      this.until = s.clock + this.rest!.remaining;
      this.music('safe-room');
      for (const [station, cell] of Object.entries(SAFE_POINTS)) {
        const p = cellPoint(cell);
        if(station==='retire'&&!this.endless)continue;
        const texture = station === 'ammo' ? 'ammo' : station === 'medkit' ? 'medkit' : station === 'armor' ? 'armor' : undefined;
        if (texture) s.add.image(p.x, p.y, texture).setDisplaySize(27, 26).setDepth(5);
        s.add.text(p.x, p.y - 27, this.stationLabel(station), {fontFamily:'monospace',fontSize:13,color:'#ffe1ef',stroke:'#140d18',strokeThickness:3})
          .setOrigin(.5).setDepth(14);
      }
    } else {
      if(this.boss===3)this.power=new PowerCut(s);
      s.banner.setText(this.endless?this.encounter.map(id=>RUSH_BOSSES[id].name.toUpperCase()).join(' + '):RUSH_BOSSES[this.boss].arena.toUpperCase());
      this.music('intro');
      if (this.map.layout) {
        for (const [i, cell] of this.map.layout.supplies.slice(0,this.endless?Math.max(1,4-Math.floor(this.cycle/3)):undefined).entries()) {
          const p = cellPoint(cell);
          s.addDrop(p.x, p.y, i === 0 ? 'ammo' : i === 1 ? 'med' : 'armor', 0);
        }
        for (const [i,cell] of (this.map.layout.barrels??[]).entries()) {
          const p = cellPoint(cell), id = 'rush-barrel-'+i;
          const barrel = {id, ...p, chunk:'rush', variant:i, destroyed:false};
          s.chaos.barrels.ledger.set(id,barrel);
          s.chaos.barrels.show(barrel);
        }
        const p = cellPoint(this.map.layout.boss);
        s.spawn(4, this.boss, [p.x,p.y]);
        if(this.encounter.length===2){const q=partnerSpawn(this.map.grid,this.map.layout.boss,this.map.start,this.map.layout.barrels)!;s.spawn(4,this.encounter[1],[q.x,q.y]);}
        if(this.endless)s.time.delayedCall(850,()=>this.begin());
        else s.bossDialogue.start(() => this.begin());
      } else s.startRushWesker(() => this.begin());
    }
    s.combatHud.update();
  }

  interactionHint() {
    const target = this.interactionTarget();
    if (!target) return this.power?.hint();
    if (target.kind === 'exit') return this.safe||this.endless&&this.endless.cleared%3!==0 ? 'SIGUIENTE JEFE' : 'IR A SALA SEGURA';
    if (target.kind === 'talk') return 'HABLAR CON ' + characterById(target.id).name;
    return this.stationLabel(target.id);
  }

  private interactionTarget() {
    if (!this.peaceful || (!this.map.layout&&!this.endless)) return;
    const s = this.s, reward = this.pendingWeapon?.sprite;
    if (reward?.active && this.distance(reward) < 85 && s.lineClear(s.player.x,s.player.y,reward.x,reward.y)) return;
    if (this.distance(this.map.layout?cellPoint(this.map.layout.exit):STATION_EXIT) < 47) return {kind:'exit'} as const;
    if (!this.safe) return;
    const station = Object.entries(SAFE_POINTS).find(([id,cell]) => (id!=='retire'||this.endless)&&this.distance(cellPoint(cell)) < 47);
    if (station) return {kind:'station',id:station[0]} as const;
    const nearby = [...this.actors.keys()].map(id => ({id,point:cellPoint(SAFE_ACTOR_POINTS[id])}))
      .filter(({point}) => this.distance(point) < B.talkRange && s.lineClear(s.player.x,s.player.y,point.x,point.y))
      .sort((a,b) => this.distance(a.point)-this.distance(b.point))[0];
    if (nearby) return {kind:'talk',id:nearby.id} as const;
  }

  private begin() {
    this.phase = 'fight';
    this.started = this.s.clock;
    this.s.time.delayedCall(2300,()=>this.s.banner.setText(''));
    this.music(RUSH_BOSSES[this.boss].track);
  }
  music(track: string, fade = 0) { MusicManager.get(this.s.game).rush(track, fade); }

  defeated(e?: Foe) {
    if (!this.combat) return;
    if(e)this.killed.add(e.boss);else this.killed.add(5);
    if(!this.practice&&!developerSession.active&&this.killed.size===1)achievements().event({type:'rushBlood'});
    if(this.killed.size<this.encounter.length)return;
    const s = this.s;
    this.phase = 'loot';
    const duration=s.clock-this.started;
    if(this.endless){const run=this.endless;run.cleared++;run.kills+=this.encounter.length;run.doubles+=+(this.encounter.length===2);run.combatMs+=duration;run.clean=this.medkitUsed?0:run.clean+1;run.history=[...run.history,this.encounter].slice(-8);this.until=s.clock+45_000;}
    if(!this.practice&&!developerSession.active)achievements().event({type:'rushVictory',character:s.character.id,rush:{bosses:this.encounter,damage:this.damageTaken,rifleHit:this.rifleHit,cureUsed:this.cureUsed,campaign:!this.endless&&this.boss===5,falls:this.stats.falls,cleared:this.endless?.cleared??0,clean:this.endless?.clean??0}});
    s.temporal.end(false);
    for (const shot of s.shots.splice(0)) {
      if (shot.collider?.active) shot.collider.destroy();
      if (shot.sprite.active) shot.sprite.destroy();
      s.resolveShot(shot);
    }
    s.chaos.clearHazards();
    s.burning.stop();
    if (!this.practice) {
      if(!this.endless)this.stats.times.push(duration);
      if(!developerSession.active)for(const id of this.encounter)unlockRush(id);
      this.credits += B.reward + 35 * this.boss;
    }
    if (this.practice) { this.showPracticeResult(); return; }
    if (!this.endless&&this.boss === RUSH_BOSSES.length - 1) {
      clearRush(); if(!developerSession.active)recordRush(this.stats);
      this.phase = 'leaving';
      s.scene.start('BossRush', {victory:true,continuation:this.makeRest(newEndless())});
      return;
    }
    if (e||this.endless) this.dropRewards(e?.sprite.body!.center??{x:s.player.x,y:s.player.y});
    this.door?.setVisible(true);
    if(this.boss===4)this.door?.setFrame('4-gate-open');
    if(this.boss===5){this.door?.setVisible(false);this.s.add.text(STATION_EXIT.x,STATION_EXIT.y,'↓ SALIDA ABIERTA',{fontFamily:'monospace',fontSize:13,color:'#88ffbc',stroke:'#0d0911',strokeThickness:3}).setOrigin(.5).setDepth(12);}
    else this.door?.setTint(this.boss===4?0xffffff:0x88ffbc);
  }

  private dropRewards(body:{x:number;y:number}) {
    const s=this.s;
    for (const [i, reward] of rushRewards(this.endless?(this.encounter.length===2?'double':'endless'):this.boss<2?'early':'late').entries()) {
      const p = s.lootPoint(body.x + (i - 1) * 48, body.y + 30, point =>
        !s.drops.some(d => d.sprite.x === point.x && d.sprite.y === point.y) &&
        s.navigation.canReach(s.player.body!.center, point));
      s.addDrop(p.x, p.y, reward.kind, reward.id);
    }
  }

  private showPracticeResult() {
    const s = this.s;
    this.practiceWon = true;
    s.paused = true;
    s.player.setVelocity(0);
    s.physics.world.pause();
    s.overlay.add(s.add.rectangle(640,360,1280,720,0x080510,.86));
    const heading = s.add.text(640,232,'PRÁCTICA COMPLETADA',{fontFamily:'monospace',fontSize:40,color:'#ff448e'}).setOrigin(.5);
    s.overlay.add(heading);
    for (const [i,label] of ['REINICIAR ENCUENTRO','VOLVER A PRÁCTICA'].entries()) {
      s.overlay.add(s.add.text(640,345+i*65,label,{fontFamily:'monospace',fontSize:25,color:'#f4ddef'}).setOrigin(.5)
        .setInteractive({useHandCursor:true}).on('pointerdown',()=>this.exit(i===0)));
    }
  }

  private capture(): RushInventory {
    const s = this.s;
    return {
      guns: s.guns.map(({id, ammo, reserve, reserveBonusApplied}) => ({id, ammo, reserve, reserveBonusApplied})),
      active: s.active, health: Math.min(s.run.health, s.run.stats.maxHealth), armor: s.run.armor,
      medkits: s.run.medkits, adrenaline: s.run.adrenaline, charge: s.ultimate.charge,
      counts: [...s.chaos.inventory.counts], selected: s.chaos.inventory.selected,
    };
  }
  private restore(inv: RushInventory) {
    const s = this.s;
    s.guns = inv.guns.map(({id, ammo, reserve, reserveBonusApplied}) => ({id, ammo, reserve, reserveBonusApplied}));
    s.active = inv.active;
    s.run.health = Math.min(inv.health, s.run.stats.maxHealth);
    s.run.armor = Math.min(inv.armor, s.run.stats.maxArmor);
    s.run.medkits = inv.medkits;
    s.run.adrenaline = inv.adrenaline;
    s.ultimate.charge = Math.min(inv.charge, s.ultimate.requiredHits);
    s.chaos.inventory.counts.splice(0, inv.counts.length, ...inv.counts);
    s.chaos.inventory.select(inv.selected);
  }

  private apply(card: RushCard, instant: boolean) {
    const s = this.s;
    switch (card) {
      case 'health': s.run.stats.maxHealth += 15; if (instant) s.run.health += 15; break;
      case 'damage': s.run.stats.damage *= 1.10; break;
      case 'armor': s.run.stats.maxArmor += 20; if (instant) s.run.armor += 20; break;
      case 'charge': if(this.endless)s.run.stats.ultimateHits-=3; if (instant) s.ultimate.charge = Math.min(s.ultimate.requiredHits, s.ultimate.charge + Math.ceil(s.ultimate.requiredHits * .2)); break;
      case 'mobility': s.run.stats.speed *= 1.08; break;
      case 'reload': s.run.stats.reloadReduction=(s.run.stats.reloadReduction??0)+.08; break;
      case 'healing': s.run.stats.medkitHeal+=8; break;
      case 'reserve': s.run.stats.reserveBonus=(s.run.stats.reserveBonus??0)+.12; break;
      case 'dash': s.run.stats.dashReduction+=.07;s.dash.setCooldown(dashCooldown(s.run.stats),s.clock,true);break;
      case 'resist': case 'medkits': break;
    }
  }
  private restState(): RushRest {
    return {...this.rest!, credits: this.credits, inventory: this.capture(), stats: this.stats, dialogueHistory:this.dialogueHistory,relayHistory:this.relayHistory,
      remaining: Math.max(0, this.until - this.s.clock)};
  }
  private makeRest(endless=this.endless):RushRest {
    const s = this.s;
    const inventory = this.capture();
    inventory.health = Math.min(s.run.stats.maxHealth, inventory.health + Math.ceil(s.run.stats.maxHealth * B.recovery));
    const upgrades=[...this.rest?.upgrades??[]],offer=rushOffer(upgrades);
    const encounter=endless?selectEncounter(endless):undefined;
    return {version:1, character:s.character.id, next:encounter?.[0]??this.boss+1, credits:this.credits,endless,encounter,
      inventory, stats:this.stats, dialogueHistory:this.dialogueHistory, upgrades, offer, chose:false, remaining:B.restMs};
  }
  private leaveArena(){
    if(!this.endless||this.endless.cleared%3===0){this.restart({kind:'resume',rest:this.makeRest()});return;}
    const encounter=selectEncounter(this.endless);
    this.restart({kind:'next',rest:{...this.restState(),next:encounter[0],encounter}});
  }
  private finishEndless(reason:EndlessResult['reason']){
    if(!this.endless||this.result)return;
    this.result={...this.endless,character:this.stats.character,reason,date:new Date().toISOString(),bestCycle:reason==='retirada'?Math.max(1,Math.ceil(this.endless.cleared/3)):this.cycle};
    if(!developerSession.active)saveEndless(this.result);
    clearRush();
  }
  private restart(rush: RushEntry,characterId=this.s.character.id) {
    this.phase = 'leaving';
    this.s.player.setVelocity(0);
    this.s.scene.restart({characterId, coop:false, rush});
  }

  private stationLabel(station: string) {
    switch (station) {
      case 'ammo': return `MUNICIÓN · ${B.ammoPrice}`;
      case 'medkit': return `BOTIQUÍN · ${B.medkitPrice}`;
      case 'armor': return `ESCUDO · ${B.armorPrice}`;
      case 'weapon': return `TIRADA · ${B.weaponPrice}`;
      case 'cards': return 'CARTAS DE MEJORA';
      case 'retire': return 'TERMINAR RACHA';
      default: return 'SUSPENDER';
    }
  }
  cancelCards() { this.companionOpen=false;this.cardPanel?.destroy(true); this.cardPanel = undefined; }
  private cards() {
    if (!this.rest || this.rest.chose || this.cardPanel) return;
    if(!this.rest.offer.length){this.rest.chose=true;takeMedkit(this.s.run,this.medkitBonus);for(const g of this.s.guns)if(!isMelee(g.id))this.s.ultimate.addAmmo(g,ammoGrant(g.id,this.s.run.stats,1));this.notice('SUMINISTROS DE DESCANSO');return;}
    const s = this.s;
    s.player.setVelocity(0);
    this.cardPanel = s.add.container(0, 0).setDepth(120).setScrollFactor(0);
    this.cardPanel.add(s.add.rectangle(640,360,1050,510,0x14091d,.97).setStrokeStyle(2,0xf53783));
    this.cardPanel.add(s.add.text(640,152,'ELIGE UNA MEJORA',{fontFamily:'monospace',fontSize:29,color:'#ff8abf'}).setOrigin(.5));
    const option = (y: number, label: string, action: () => void) => {
      const item = s.add.text(640,y,label,{fontFamily:'monospace',fontSize:22,color:'#ffddf1'})
        .setOrigin(.5).setInteractive({useHandCursor:true}).on('pointerdown',action);
      this.cardPanel!.add(item);
    };
    const art:Record<RushCard,[string,string,number]> = {
      health:['Vitalidad','medkit',0x68dfe6],damage:['Potencia','ammo',0x8ba3ff],
      armor:['Blindaje','armor',0x68dfe6],charge:['Definitiva',s.character.specialPortrait,0xf75ec1],
      mobility:['Paso ligero',s.character.normal.walk[0],0x68dfe6],reload:['Recarga','weapon-0',0x8ba3ff],
      resist:['Resistencia','armor',0xf75ec1],medkits:['Primeros auxilios','medkit',0x8ba3ff],
      healing:['Curación eficaz','medkit',0x8ba3ff],reserve:['Reserva','ammo',0x68dfe6],
      dash:['Reflejos',s.character.normal.walk[0],0x8ba3ff],
    };
    const panel=this.cardPanel;
    this.rest.offer.forEach((id,i)=>{
      const x=640+(i-(this.rest!.offer.length-1)/2)*308,[name,key,color]=art[id];
      const rarity=color===0x68dfe6?'COMÚN':color===0x8ba3ff?'RARA':'ÉPICA';
      const effect=RUSH_CARDS.find(c=>c.id===id)!.label;
      const frame=upgradeFrame(s,x,365,274,306,color);
      const icon=s.add.image(x,274,key);
      icon.setScale(Math.min(68/icon.width,68/icon.height));
      const item=s.add.text(x,397,name+'\n'+rarity+'\n'+effect,{fontFamily:'monospace',fontSize:17,
        color:'#f9e6f7',align:'center',fixedWidth:256,wordWrap:{width:240},lineSpacing:11}).setOrigin(.5);
      const choose=()=>{
        if(this.cardPanel!==panel||this.rest!.chose)return;
        this.rest!.chose=true;this.rest!.upgrades.push(id);this.apply(id,true);
        this.cancelCards();s.combatHud.update();
      };
      frame.setName(item.text).setInteractive({useHandCursor:true}).on('pointerdown',choose).on('pointerover',()=>frame.setFillStyle(0x322041)).on('pointerout',()=>frame.setFillStyle(0x17152a));
      panel.add([frame,icon,item]);
      s.tweens.add({targets:[frame,icon,item],alpha:{from:0,to:1},duration:220,delay:i*70});
    });
    option(559,'VOLVER',() => this.cancelCards());
  }
  private purchase(station: string) {
    const s = this.s;
    const price = station === 'ammo' ? B.ammoPrice : station === 'medkit' ? B.medkitPrice : station === 'armor' ? B.armorPrice : B.weaponPrice;
    if (this.credits < price) { this.notice('CRÉDITOS INSUFICIENTES'); return; }
    if (station === 'ammo') {
      const guns = s.guns.filter(g => !isMelee(g.id));
      if (!guns.length) return;
      for (const g of guns) s.ultimate.addAmmo(g, reserveAmount(ammoGrant(g.id, s.run.stats, 2), s.run.stats));
    } else if (station === 'medkit') {
      if (!takeMedkit(s.run,this.medkitBonus)) return;
    } else if (station === 'armor') {
      if (s.run.armor >= s.run.stats.maxArmor) return;
      s.run.armor = s.run.stats.maxArmor;
    } else {
      const weights=rushWeights(this.endless?'endless':this.boss<=1?'early':'late',true);
      if (this.rewardDrop?.sprite.active) { this.notice('RECOGE O CAMBIA EL ARMA ANTES DE OTRA TIRADA'); return; }
      if (!s.roulette.start(() => { this.rewardDrop=s.awardWeapon(s.roulette.winner); }, weights)) return;
    }
    this.credits -= price;
  }
  private distance(point: {x:number;y:number}) {
    return Math.hypot(this.s.player.x - point.x, this.s.player.y - point.y);
  }
  interact() {
    if(this.combat&&this.power?.interact())return true;
    if (this.conversation || this.cardPanel) return true;
    const target = this.interactionTarget();
    if (!target) return false;
    if (target.kind === 'exit') {
      if (this.safe) this.advance();
      else this.leaveArena();
      return true;
    }
    if (target.kind === 'talk') {
      if(this.endless)this.companionMenu(target.id);
      else this.talk(target.id);
    } else if(target.id==='retire') this.confirmRetire();
    else if (target.id === 'cards') this.cards();
    else if (target.id === 'suspend') {
      if(this.endless&&this.entry.kind==='resume'&&this.entry.consumed)this.notice('PODRÁS SUSPENDER EN EL PRÓXIMO DESCANSO');
      else if (this.rewardDrop?.sprite.active) this.notice('RECOGE EL ARMA ANTES DE SUSPENDER');
      else if (suspendRush(this.restState())) { this.phase = 'leaving'; this.s.scene.start('BossRush',{}); }
      else this.notice('NO SE PUDO GUARDAR LA CAMPAÑA');
    } else this.purchase(target.id);
    return true;
  }
  private talk(id:CharacterId){
    const lines=chooseSafeDialogue(this.s.character.id,id,this.dialogueHistory);
    if(lines)this.conversation=new SafeConversation(this.s,this.actors.get(id)!,lines);
  }
  private companionMenu(id:CharacterId){
    if(!this.endless||!this.safe)return;
    const s=this.s;s.player.setVelocity(0);
    this.companionOpen=true;
    this.cardPanel=s.add.container(0,0).setScrollFactor(0).setDepth(120);
    this.cardPanel.add(s.add.rectangle(640,360,600,245,0x14091d,.98).setStrokeStyle(2,0xef4e9c));
    const actions=[
      ['CONVERSAR',()=>this.talk(id)],
      ['CAMBIAR DE PROTAGONISTA',()=>{
        if(this.pendingWeapon){this.notice('RECOGE EL ARMA DE LA RULETA ANTES DEL RELEVO');return;}
        const lines=relayLines(s.character.id,id,this.relayHistory);
        if(lines.length)this.conversation=new SafeConversation(s,this.actors.get(id)!,lines,()=>this.relay(id));
      }],
      ['VOLVER',()=>{}],
    ] as const;
    actions.forEach(([label,action],i)=>this.cardPanel!.add(s.add.text(640,278+i*62,label,
      {fontFamily:'monospace',fontSize:22,color:'#ffe2f1'}).setOrigin(.5)
      .setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.cancelCards();action();})));
  }
  private relay(id:CharacterId){
    if(!this.safe||!this.endless||id===this.s.character.id)return;
    const s=this.s,rest=this.restState(),target=characterById(id).stats();
    const count=(key:RushCard)=>rest.upgrades.filter(card=>card===key).length;
    rest.inventory.health=transferRatio(s.run.health,maxHealth(s.run),target.maxHealth+15*count('health'));
    rest.inventory.charge=Math.floor(transferRatio(rest.inventory.charge,s.ultimate.requiredHits,Math.max(20,target.ultimateHits-3*count('charge'))));
    rest.character=id;
    const relays=[...this.endless.relays??[],{from:s.character.id,to:id,cleared:this.endless.cleared}];
    rest.endless={...this.endless,relays};
    this.restart({kind:'resume',rest,consumed:this.entry.kind==='resume'&&this.entry.consumed},id);
  }
  private confirmRetire(){
    const s=this.s;s.player.setVelocity(0);
    this.cardPanel=s.add.container(0,0).setScrollFactor(0).setDepth(120);
    this.cardPanel.add(s.add.rectangle(640,360,630,240,0x14091d,.98));
    for(const [i,label] of ['CONFIRMAR RETIRADA','CANCELAR'].entries())this.cardPanel.add(s.add.text(640,310+i*82,label,{fontFamily:'monospace',fontSize:24,color:'#fff'}).setOrigin(.5).setInteractive({useHandCursor:true}).on('pointerdown',()=>{
      this.cancelCards();if(i)return;this.finishEndless('retirada');this.phase='leaving';s.scene.start('BossRush',{result:this.result});
    }));
  }
  private advance() {
    if (!RUSH_BOSSES[this.boss].available) {
      this.notice('SIGUIENTE ARENA NO DISPONIBLE · PUEDES SUSPENDER');
      return;
    }
    const s = this.s;
    if (s.roulette.active) return;
    if (this.rewardDrop?.sprite.active) { this.notice('RECOGE EL ARMA DE LA RULETA ANTES DE SALIR'); return; }
    const firearm = s.guns.find(g => !isMelee(g.id));
    if (firearm && !s.guns.some(g => !isMelee(g.id) && g.ammo + g.reserve > 0)) {
      s.ultimate.addAmmo(firearm, WEAPONS[firearm.id].mag * 2);
    } else if (!firearm && s.guns.length < 2) {
      s.guns.push(gun(0));
    }
    if(this.endless&&!this.rest?.offer.length)this.cards();
    this.restart({kind:'next', rest:this.restState()});
  }
  private notice(value:string) {
    this.noticeUntil = this.s.clock + 2400;
    this.status!.setText(value);
  }
  update() {
    this.power?.update(this.combat&&this.s.foes.some(foe=>foe.boss===3));
    if(this.power&&this.combat)this.status?.setText(this.power.status);
    if(this.phase==='loot'){
      this.status!.setText(this.endless?`VICTORIA · SAQUEO ${Math.ceil(Math.max(0,this.until-this.s.clock)/1000)}s · USA LA PUERTA`:'JEFE DERROTADO · RECOGE EL BOTÍN Y USA LA PUERTA');
      if(this.endless&&this.s.clock>=this.until)this.leaveArena();
      return;
    }
    if (!this.safe || this.cardPanel || this.s.clock < this.noticeUntil) return;
    const seconds = Math.ceil(Math.max(0, this.until - this.s.clock) / 1000);
    this.status!.setText(`SALA SEGURA · ${this.credits} CR · ${seconds}s · SIGUE ${RUSH_BOSSES[this.boss].name.toUpperCase()}`);
    if (seconds === 0 && this.rewardDrop?.sprite.active) this.status!.setText('RECOGE EL ARMA DE LA RULETA PARA CONTINUAR');
    else if (seconds === 0 && RUSH_BOSSES[this.boss].available) this.advance();
    else if (seconds === 0) this.status!.setText('SIGUIENTE ARENA NO DISPONIBLE · PUEDES SUSPENDER');
  }
  friendlyArea(source:number,point:{x:number;y:number},radius:number,damage:number){
    if(!this.combat||this.encounter.length!==2||!this.encounter.includes(source))return;
    for(const foe of this.s.foes){
      if(!this.encounter.includes(foe.boss)||foe.boss===source||foe.hp<=1||Math.hypot(foe.sprite.x-point.x,foe.sprite.y-point.y)>=radius||!this.s.lineClear(point.x,point.y,foe.sprite.x,foe.sprite.y))continue;
      const used=this.friendlyDamage.get(foe)??0, applied=Math.min(damage*.25,foe.max*.20-used,foe.hp-1);
      if(applied>0){foe.hp-=applied;this.friendlyDamage.set(foe,used+applied);}
    }
  }
  damaged(amount:number,source?:number){if(!this.combat)return;this.damageTaken+=amount;if(this.endless)this.endless.damage+=amount;else this.stats.damage+=amount;if(source===3&&amount>0)this.rifleHit=true;}
  died() { this.stats.falls++;if(this.endless){this.endless.falls++;this.endless.combatMs+=Math.max(0,this.s.clock-this.started);this.finishEndless('derrota');}if (!this.practice) clearRush(); }
  exit(retry: boolean) {
    if (!retry) this.s.scene.start('BossRush', {practice:this.practice});
    else this.restart(this.entry.kind === 'practice' ? this.entry : {kind:'campaign', character:this.s.character.id});
  }
}
