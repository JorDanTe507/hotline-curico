import Phaser from 'phaser';
import {button, text} from '../scenes/Menu';
import {MusicManager} from '../systems/MusicManager';
import {characterById} from '../characters/catalog';
import {bossTexture,BOSS_DEFINITIONS} from '../bosses/expansion';
import {WEAPONS} from '../weapons/arsenal';
import {loadRushMusic} from './assets';
import {endlessRecords,type EndlessResult} from './endless';
import type {RushRest} from './state';
import {RUSH_BOSSES} from './config';
import {rushResults, rushScore, consumeRush, suspendedRush, unlockedRush} from './state';

export class GameModes extends Phaser.Scene {
  readonly mobileTitle = 'MODOS DE JUEGO';
  constructor() { super('GameModes'); }
  create() {
    this.cameras.main.setBackgroundColor('#100918');
    text(this, 100, 65, this.mobileTitle, 46, '#ff428e');
    button(this, 225, 'BOSS RUSH', () => this.scene.start('BossRush',{}));
    text(this, 100, 320, 'HISTORIA · PRÓXIMAMENTE', 26, '#a096ab');
    button(this, 610, '← VOLVER', () => this.scene.start('Menu'));
  }
}

export class BossRushMenu extends Phaser.Scene {
  page: 'main' | 'practice' | 'weapons' | 'results' | 'endless' = 'main';
  selected = 0;
  weaponPage = 0;
  mobileTitle = 'BOSS RUSH';
  private victory = false;
  private continuation?:RushRest;
  private result?:EndlessResult;
  recordFilter='general';
  recordPage=0;
  rankView?:{headers:string[];rows:{position:number;portrait?:EndlessResult['character'];cells:string[]}[]};
  practiceFocus=-1;
  private practiceCards:Phaser.GameObjects.Image[]=[];
  private practiceLabels:Phaser.GameObjects.Text[]=[];
  private practiceTargets:Phaser.GameObjects.Text[]=[];
  constructor() { super('BossRush'); }
  init(data: {practice?: boolean; victory?: boolean; continuation?:RushRest; result?:EndlessResult; endlessRecords?:boolean} = {}) {
    this.page = data.practice ? 'practice' : data.victory ? 'results' : data.result||data.endlessRecords?'endless':'main';
    this.victory = data.victory === true;
    this.continuation=data.continuation;this.result=data.result;this.recordFilter='general';this.recordPage=0;
    this.selected = 0;
    this.weaponPage = 0;
  }
  preload() { loadRushMusic(this); }
  create() { MusicManager.get(this.game).rush('menu'); this.render(); }
  private go(page: BossRushMenu['page']) { this.page = page; this.render(); }
  back() { this.page === 'main' ? this.scene.start('GameModes') : this.go(this.page === 'weapons' ? 'practice' : 'main'); }
  private render() {
    this.children.removeAll(true);
    this.rankView=undefined;this.practiceFocus=-1;this.practiceCards=[];this.practiceLabels=[];this.practiceTargets=[];
    this.cameras.main.setBackgroundColor('#080510');
    const art = this.add.image(640, 360, 'rush-menu-art');
    art.setScale(Math.min(1280 / art.width, 720 / art.height));
    art.setAlpha(this.page === 'main' ? .85 : .25);
    this.add.rectangle(36, 260, 495, 422, 0x080510, .88).setOrigin(0);
    const action = (y: number, label: string, callback?: () => void) =>
      callback ? button(this, y, label, callback).setX(64).setFontSize(21) : text(this, 64, y, label, 21, '#a395ac');
    if (this.page === 'main') {
      this.mobileTitle = 'BOSS RUSH';
      const saved = suspendedRush();
      action(290, 'CAMPAÑA', () => this.scene.start('CharacterSelect', {rush: {kind: 'campaign'}, coop: false}));
      action(355, 'PRÁCTICA DE JEFES', () => this.go('practice'));
      action(420, saved?.endless?'CONTINUAR RACHA':'CONTINUAR CAMPAÑA', saved ? () => {const rest=consumeRush();if(rest)this.scene.start('Game',{rush:{kind:'resume',rest,consumed:true},coop:false,characterId:rest.character});} : undefined);
      action(485, 'REGISTROS Y CLASIFICACIÓN', () => this.go('results'));
      action(544, 'RÉCORDS DEL INFINITO', () => this.go('endless'));
      if (!saved) text(this, 64, 448, 'SIN CAMPAÑA SUSPENDIDA', 13, '#c9b8d0');
      else text(this, 64, 327, 'INICIAR OTRA CAMPAÑA REEMPLAZA LA SUSPENDIDA', 12, '#c9b8d0');
    } else if (this.page === 'practice') {
      this.mobileTitle = 'PRÁCTICA DE JEFES';
      text(this, 65, 72, this.mobileTitle, 38, '#ff428e');
      for (const [i,boss] of RUSH_BOSSES.entries()){
        const x=140+i*200,y=358,enabled=boss.available&&i<unlockedRush();
        this.add.rectangle(x,y,182,360,0x17101d,.97).setStrokeStyle(2,enabled?0xf34691:0x59415e);
        const image=i===5?this.add.image(x,y-36,'uroboros','human-idle-down-0'):this.add.image(x,y-36,bossTexture(i));
        image.setScale(Math.min(i===5?1.55:1.48,215/image.height)).setTintFill(0x06050a);
        this.practiceCards[i]=image;
        this.practiceLabels[i]=text(this,x,449,enabled?boss.name.toUpperCase():'BLOQUEADO',14).setOrigin(.5);
        if(!enabled){
          const chain=this.add.graphics().lineStyle(3,0x826686,1);
          for(const sign of [-1,1])for(let link=-5;link<=5;link++){
            chain.strokeEllipse(x+link*12,y+sign*link*14,15,9);
          }
          text(this,x,y,'🔒',31).setOrigin(.5);
          text(this,x,475,'VENCE AL JEFE',12,'#c2adca').setOrigin(.5);
          continue;
        }
        const target=text(this,x,500,boss.name.toUpperCase(),13,'#9debf1').setOrigin(.5)
          .setInteractive({useHandCursor:true}).on('pointerover',()=>this.focusPractice(i))
          .on('pointerout',()=>this.focusPractice(-1)).on('menu-focus',()=>this.focusPractice(i))
          .on('pointerdown',()=>this.choosePractice(i));
        target.setPadding(10,126,10,9);
        this.practiceTargets[i]=target;
      }
    } else if (this.page === 'weapons') {
      this.mobileTitle = 'ARSENAL DE PRÁCTICA';
      text(this, 65, 72, this.mobileTitle, 38, '#ff428e');
      for (const [i, weapon] of WEAPONS.slice(this.weaponPage * 7, this.weaponPage * 7 + 7).entries()) {
        action(270 + 42 * i, weapon.name, () => this.scene.start('CharacterSelect', {
          rush: {kind: 'practice', boss: this.selected, weapon: this.weaponPage * 7 + i}, coop: false,
        }));
      }
      if (WEAPONS.length > 7) action(582, 'SIGUIENTE PÁGINA', () => {
        this.weaponPage = (this.weaponPage + 1) % Math.ceil(WEAPONS.length / 7); this.render();
      });
    } else if(this.page==='endless') {
      this.mobileTitle='RÉCORDS DEL INFINITO';
      text(this,65,62,this.mobileTitle,38,'#ff428e');
      if(this.result){const r=this.result;text(this,65,115,`${r.reason.toUpperCase()} · ${r.cleared} COMBATES · ${r.kills} JEFES · ${r.doubles} DOBLES · CICLO ${r.bestCycle}\n${Math.round(r.damage)} DAÑO · ${r.falls} CAÍDAS · ${Math.round(r.combatMs/1000)}s EN COMBATE · ${Math.round(r.totalMs/1000)}s TOTALES`,17);}
      for(const [i,id] of ['general','cervela','nicolas','jordan'].entries())button(this,178,(id===this.recordFilter?'▶ ':'')+id.toUpperCase(),()=>{this.recordFilter=id;this.recordPage=0;this.render()}).setX(65+230*i).setFontSize(19);
      const rows=endlessRecords().filter(r=>this.recordFilter==='general'||!r.relays?.length&&r.character===this.recordFilter);
      this.rankings(['PROTAGONISTA','COMBATES','CICLO','DAÑO','CAÍDAS','TIEMPO','RESULTADO','FECHA'],
        rows.map(r=>({portrait:r.relays?.length?undefined:r.character,cells:[
          r.relays?.length?`RELEVOS ×${r.relays.length}`:characterById(r.character).name,String(r.cleared),String(r.bestCycle),
          String(Math.round(r.damage)),String(r.falls),Math.round(r.combatMs/1000)+' s',r.reason.toUpperCase(),r.date.slice(0,10),
        ]})));
    } else {
      this.mobileTitle = this.victory ? 'BOSS RUSH COMPLETADO' : 'REGISTROS Y CLASIFICACIÓN';
      const results = rushResults();
      text(this, 65, 62, this.mobileTitle, 38, '#ff428e');
      text(this, 65, 125, `CAMPAÑAS COMPLETADAS: ${results.completed} · MENOR PUNTUACIÓN ES MEJOR`, 20);
      this.rankings(['PROTAGONISTA','PUNTOS','TIEMPO','DAÑO','CAÍDAS','FECHA'],
        results.best.map(row=>({portrait:row.character,cells:[characterById(row.character).name,String(rushScore(row)),
          Math.round(row.times.reduce((a,b)=>a+b,0)/1000)+' s',String(Math.round(row.damage)),String(row.falls),row.date?.slice(0,10)??'—']})));
    }
    if(this.page==='results'&&this.continuation)action(560,'CONTINUAR AL INFINITO',()=>{
      const rest=this.continuation!;this.continuation=undefined;this.scene.start('Game',{characterId:rest.character,coop:false,rush:{kind:'resume',rest}});
    });
    action(630, '← VOLVER', () => this.back());
  }
  focusPractice(id:number){
    this.practiceFocus=id;
    this.practiceCards.forEach((image,i)=>{if(this.practiceTargets[i]){
      if(i===id)image.clearTint();else image.setTintFill(0x06050a);
      this.practiceLabels[i].setText(i===id?(BOSS_DEFINITIONS[i]?.weaponName??'PROYECTO UROBOROS'):'REVELAR');
    }});
  }
  choosePractice(id:number){
    if(!RUSH_BOSSES[id]?.available||id>=unlockedRush())return;
    this.selected=id;this.weaponPage=0;this.go('weapons');
  }
  private rankings(headers:string[],rows:{portrait?:EndlessResult['character'];cells:string[]}[]){
    const width=headers.length===8?[125,365,487,578,680,795,918,1060]:[125,365,515,670,795,940];
    const pageSize=6;
    const count=Math.max(1,Math.ceil(rows.length/pageSize));
    this.recordPage=Math.min(this.recordPage,count-1);
    this.add.rectangle(640,372,1180,345,0x0d091a,.94).setStrokeStyle(1,0xb93279);
    headers.forEach((label,i)=>text(this,width[i],212,label,13,'#8ae9ef'));
    const slice=rows.slice(this.recordPage*pageSize,(this.recordPage+1)*pageSize);
    this.rankView={headers,rows:slice.map((record,i)=>({...record,position:this.recordPage*pageSize+i+1}))};
    slice.forEach((record,i)=>{
      const index=this.recordPage*pageSize+i,y=246+i*42;
      const row=this.add.rectangle(640,y+12,1156,38,index===0?0x362035:0x191225,.98).setStrokeStyle(1,index===0?0xf8ca68:0x513050);
      row.setInteractive().on('pointerover',()=>row.setStrokeStyle(2,0x7ee9ef)).on('pointerout',()=>row.setStrokeStyle(1,index===0?0xf8ca68:0x513050));
      text(this,68,y,String(index+1).padStart(2,'0'),15,index===0?'#f8ca68':'#b2a6be');
      if(record.portrait){const image=this.add.image(108,y+12,characterById(record.portrait).portrait);image.setScale(27/Math.max(image.width,image.height));}
      record.cells.forEach((cell,j)=>text(this,width[j],y,cell,15));
    });
    if(!rows.length)text(this,78,258,'SIN REGISTROS OFICIALES',17);
    if(count>1)button(this,578,'PÁGINA '+(this.recordPage+1)+'/'+count+' →',()=>{this.recordPage=(this.recordPage+1)%count;this.render()}).setX(857).setFontSize(17);
  }
}
