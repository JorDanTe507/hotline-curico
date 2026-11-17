import {CriminalAccess} from './Presentation';
import {RushTerminalView} from './TerminalView';
import {MODE_CARDS,bossPortraits} from '../ui/MenuPresentation';
import {AudioSystem} from '../systems/AudioSystem';
import Phaser from 'phaser';
import {button, text} from '../scenes/Menu';
import {MusicManager} from '../systems/MusicManager';
import {characterById} from '../characters/catalog';
import {WEAPONS} from '../weapons/arsenal';
import {loadRushMusic} from './assets';
import {endlessRecords,type EndlessResult} from './endless';
import type {RushRest} from './state';
import {RUSH_BOSSES} from './config';
import {rushResults, rushScore, consumeRush, suspendedRush, unlockedRush} from './state';

export class GameModes extends Phaser.Scene {
 readonly mobileTitle='MODOS DE JUEGO';modeNotice='';private focused=-1;private cards:{box:Phaser.GameObjects.Rectangle;title:Phaser.GameObjects.Text}[]=[];
 constructor(){super('GameModes')}
 create(){
  this.modeNotice='';this.focused=-1;this.cards=[];MusicManager.get(this.game).menu();this.cameras.main.setBackgroundColor('#100918');
  this.add.text(56,48,this.mobileTitle,{fontFamily:'"Press Start 2P",monospace',fontSize:27,color:'#ff428e'});
  MODE_CARDS.forEach((mode,i)=>{const x=244+i*396,box=this.add.rectangle(x,360,368,490,0x1b1024).setStrokeStyle(1,0x69304f);const left=x-166;
   if(i===1)bossPortraits.forEach(([key,frame],j)=>{const image=this.add.image(left+54+(j%3)*111,180+Math.floor(j/3)*100,key,frame);image.setScale(Math.min(104/image.width,94/image.height))});
   else{const image=this.add.image(x,225,'mode-city-art');image.setScale(Math.min(330/image.width,200/image.height));if(i===2)image.setTint(0x4b3b52).setAlpha(.45)}
   const title=this.add.text(left,348,mode.title,{fontFamily:'"Press Start 2P",monospace',fontSize:i===0?15:19,color:i===2?'#9c8199':'#fff0fa'});
   text(this,left,400,mode.description,21,i===2?'#9b8297':'#dec9da').setWordWrapWidth(330);
   text(this,left,555,mode.tags,13,i===2?'#c3a2b9':'#81e4e7').setWordWrapWidth(330);
   const target=this.add.text(left,118,'',{fixedWidth:332,fixedHeight:476}).setInteractive({useHandCursor:true});
   target.on('pointerover',()=>this.focusMode(i)).on('menu-focus',()=>this.focusMode(i)).on('pointerdown',()=>this.chooseMode(mode.id));
   this.cards.push({box,title});if(i===2)text(this,x,260,'🔒',38,'#9b7c94').setOrigin(.5);
  });
  button(this,655,'← VOLVER',()=>this.scene.start('Menu')).setX(60).setFontSize(20);text(this,490,666,'FLECHAS / CRUCETA · ENTER / × · ESC / ○',16,'#bca0b4');this.focusMode(0);
 }
 focusMode(index:number){if(this.focused===index)return;this.focused=index;this.cards.forEach((c,i)=>{c.box.setStrokeStyle(i===index?3:1,i===index?0xff419c:0x69304f).setFillStyle(i===index?0x31142c:0x1b1024);c.title.setColor(i===2?'#a98ba4':i===index?'#ff80bb':'#fff0fa')});AudioSystem.play(this,'pickup',.3)}
 chooseMode(id:string){if(id==='story'){this.modeNotice='HISTORIA · PRÓXIMAMENTE';this.focusMode(2);return}AudioSystem.play(this,'reward',.4);if(id==='traditional')this.scene.start('TraditionalModes');else if(id==='boss-rush')this.scene.start('BossRush',{})}
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
  practiceFocus=0;private leaving=false;private terminal?:RushTerminalView;private access=new CriminalAccess();
  preferredMenuAction='';private actionFocus=new Map<string,string>();private activeAction='';private actionFrames:Phaser.GameObjects.Rectangle[]=[];
  constructor() { super('BossRush'); }
  init(data: {practice?: boolean; victory?: boolean; continuation?:RushRest; result?:EndlessResult; endlessRecords?:boolean;terminalReady?:boolean;focusBoss?:number} = {}) {
    this.page = data.practice ? 'practice' : data.victory ? 'results' : data.result||data.endlessRecords?'endless':'main';
    this.victory = data.victory === true;
    this.continuation=data.continuation;this.result=data.result;this.recordFilter='general';this.recordPage=0;
    this.leaving=false;this.terminal?.destroy();this.terminal=undefined;this.access=new CriminalAccess();if(data.terminalReady)this.access.skip();else this.actionFocus.clear();this.practiceFocus=Math.max(0,Math.min(5,data.focusBoss??0));
    this.selected = 0;
    this.weaponPage = 0;
  }
  preload() { loadRushMusic(this); }
  create() { MusicManager.get(this.game).rush('menu');this.events.once('shutdown',()=>{this.terminal?.destroy();this.terminal=undefined});this.render();this.cameras.main.fadeIn(140); }
  update(){this.terminal?.update()}
  get focusedAction(){return this.activeAction||this.preferredMenuAction||(this.page==='main'?'CAMPAÑA':'')}
  accessState(){return this.access.view(performance.now())}
  skipAccess(){this.access.skip();this.terminal?.update()}
  stepPractice(delta:number){this.focusPractice((this.practiceFocus+delta+RUSH_BOSSES.length)%RUSH_BOSSES.length)}
  private go(page: BossRushMenu['page']) { this.page = page; this.render(); }
  back() { this.page === 'main' ? this.scene.start('GameModes') : this.go(this.page === 'weapons' ? 'practice' : 'main'); }
  private render() {
    this.tweens.killAll();this.terminal?.destroy();this.terminal=undefined;this.activeAction='';this.actionFrames=[];this.preferredMenuAction=this.actionFocus.get(this.page)??'';this.children.removeAll(true);
    this.rankView=undefined;
    this.cameras.main.setBackgroundColor('#080510');
    if(this.page==='main'){
      const art=this.add.image(426,348,'rush-menu-art');art.setScale(Math.min(810/art.width,620/art.height));
      this.add.rectangle(1060,354,384,654,0x100919,.97).setStrokeStyle(1,0x88345d);
      this.add.text(892,62,'BOSS RUSH',{fontFamily:'"Press Start 2P",monospace',fontSize:24,color:'#ff4c9c'});
      text(this,892,114,'OPERACIONES DE ALTO RIESGO',16,'#a8dfe6');
    }
    const action=(y:number,label:string,callback?:()=>void)=>this.menuAction(this.page==='main'?890:64,y,label,callback,this.page==='main'?340:740);
    if (this.page === 'main') {
      this.mobileTitle = 'BOSS RUSH';
      const saved = suspendedRush();
      action(192, 'CAMPAÑA', () => this.launchSelection({rush: {kind: 'campaign'}, coop: false}));
      action(254, 'PRÁCTICA DE JEFES', () => this.go('practice'));
      action(316, saved?.endless?'CONTINUAR RACHA':'CONTINUAR CAMPAÑA', saved ? () => {if(this.leaving)return;const rest=consumeRush();if(rest){this.leaving=true;this.scene.start('Game',{rush:{kind:'resume',rest,consumed:true},coop:false,characterId:rest.character});}} : undefined);
      action(378, 'REGISTROS Y CLASIFICACIÓN', () => this.go('results'));
      action(440, 'RÉCORDS DEL INFINITO', () => this.go('endless'));
      if (!saved) text(this, 894, 505, 'SIN CAMPAÑA SUSPENDIDA', 13, '#c9b8d0');
      else text(this, 894, 505, 'OTRA CAMPAÑA REEMPLAZA LA SUSPENDIDA', 14, '#c9b8d0').setWordWrapWidth(330);
    } else if (this.page === 'practice') {
      this.mobileTitle = 'PRÁCTICA DE JEFES';
      text(this, 65, 72, this.mobileTitle, 38, '#ff428e');
      this.access.enter(performance.now());
      for(const [i,boss]of RUSH_BOSSES.entries())this.add.text(80+i*190,350,boss.name.toUpperCase(),{fontSize:16}).setAlpha(0).setInteractive().on('menu-focus',()=>this.focusPractice(i)).on('pointerdown',()=>this.choosePractice(i));
      this.terminal=new RushTerminalView(this);
    } else if (this.page === 'weapons') {
      this.mobileTitle = 'ARSENAL DE PRÁCTICA';
      this.heading(this.mobileTitle);text(this,65,120,'EXPEDIENTE '+String(this.selected+1).padStart(2,'0')+' · '+RUSH_BOSSES[this.selected].name,20,'#a6e7e9');
      for (const [i, weapon] of WEAPONS.slice(this.weaponPage * 7, this.weaponPage * 7 + 7).entries()) {
        action(185 + 51 * i, weapon.name, () => this.launchSelection({
          rush: {kind: 'practice', boss: this.selected, weapon: this.weaponPage * 7 + i}, coop: false,
        }));
      }
      this.add.rectangle(1030,367,344,460,0x1e1027).setStrokeStyle(1,0x843362);const [portrait,frame]=bossPortraits[this.selected],face=this.add.image(1030,293,portrait,frame);face.setScale(Math.min(225/face.width,240/face.height));text(this,880,445,RUSH_BOSSES[this.selected].name.toUpperCase(),24,'#ff81bc').setWordWrapWidth(300);text(this,880,495,RUSH_BOSSES[this.selected].arena,20,'#9edfe3').setWordWrapWidth(300);
      if (WEAPONS.length > 7) action(582, 'SIGUIENTE PÁGINA', () => {
        this.weaponPage = (this.weaponPage + 1) % Math.ceil(WEAPONS.length / 7); this.render();
      });
    } else if(this.page==='endless') {
      this.mobileTitle='RÉCORDS DEL INFINITO';
      this.heading(this.mobileTitle);
      if(this.result){const r=this.result;text(this,65,115,`${r.reason.toUpperCase()} · ${r.cleared} COMBATES · ${r.kills} JEFES · ${r.doubles} DOBLES · CICLO ${r.bestCycle}\n${Math.round(r.damage)} DAÑO · ${r.falls} CAÍDAS · ${Math.round(r.combatMs/1000)}s EN COMBATE · ${Math.round(r.totalMs/1000)}s TOTALES`,17);}
      for(const [i,id] of ['general','cervela','nicolas','jordan'].entries())this.menuAction(65+290*i,178,(id===this.recordFilter?'▶ ':'')+id.toUpperCase(),()=>{this.recordFilter=id;this.recordPage=0;this.render()},268);
      const rows=endlessRecords().filter(r=>this.recordFilter==='general'||!r.relays?.length&&r.character===this.recordFilter);
      this.rankings(['PROTAGONISTA','COMBATES','CICLO','DAÑO','CAÍDAS','TIEMPO','RESULTADO','FECHA'],
        rows.map(r=>({portrait:r.relays?.length?undefined:r.character,cells:[
          r.relays?.length?`RELEVOS ×${r.relays.length}`:characterById(r.character).name,String(r.cleared),String(r.bestCycle),
          String(Math.round(r.damage)),String(r.falls),Math.round(r.combatMs/1000)+' s',r.reason.toUpperCase(),r.date.slice(0,10),
        ]})));
    } else {
      this.mobileTitle = this.victory ? 'BOSS RUSH COMPLETADO' : 'REGISTROS Y CLASIFICACIÓN';
      const results = rushResults();
      this.heading(this.mobileTitle);
      text(this, 65, 122, `CAMPAÑAS COMPLETADAS: ${results.completed} · MENOR PUNTUACIÓN ES MEJOR`, 20);
      this.rankings(['PROTAGONISTA','PUNTOS','TIEMPO','DAÑO','CAÍDAS','FECHA'],
        results.best.map(row=>({portrait:row.character,cells:[characterById(row.character).name,String(rushScore(row)),
          Math.round(row.times.reduce((a,b)=>a+b,0)/1000)+' s',String(Math.round(row.damage)),String(row.falls),row.date?.slice(0,10)??'—']})));
    }
    if(this.page==='results'&&this.continuation)action(602,'CONTINUAR AL INFINITO',()=>{
      if(!this.continuation||this.leaving)return;const rest=this.continuation;this.continuation=undefined;this.leaving=true;this.scene.start('Game',{characterId:rest.character,coop:false,rush:{kind:'resume',rest}});
    });
    if(this.page!=='practice')this.menuAction(this.page==='main'?890:64,660,'← VOLVER',()=>this.back(),340);
    if(this.page==='main')text(this,894,612,'FLECHAS / CRUCETA · ENTER / ×',12,'#b298ad');
  }
  focusPractice(id:number){if(id<0||id>=RUSH_BOSSES.length)return;if(this.practiceFocus!==id)AudioSystem.play(this,'pickup',.3);this.practiceFocus=id;this.terminal?.update()}
  choosePractice(id:number){
    if(this.page!=='practice')return;if(!this.accessState().ready){this.skipAccess();return}
    if(!RUSH_BOSSES[id]?.available||id>=unlockedRush())return;
    this.selected=id;this.weaponPage=0;this.go('weapons');
  }
  private launchSelection(data:{rush:{kind:'campaign'}|{kind:'practice';boss:number;weapon:number};coop:false}){if(this.leaving)return;this.leaving=true;this.scene.start('CharacterSelect',data)}
  private heading(label:string){this.add.text(64,54,label,{fontFamily:'"Press Start 2P",monospace',fontSize:22,color:'#ff59a3'});text(this,64,92,'ARCHIVO DE OPERACIONES · REGISTROS LOCALES',13,'#927c98')}
  private menuAction(x:number,y:number,label:string,callback:(()=>void)|undefined,width:number){
    const box=this.add.rectangle(x+width/2,y+20,width,40,0x211025,.97).setStrokeStyle(1,callback?0x8d3463:0x49334e);
    const item=this.add.text(x,y,label,{fontFamily:'"Press Start 2P",monospace',fontSize:label.length>27?10:12,color:callback?'#f7dfef':'#796e80',padding:{left:12,top:14},fixedWidth:width,fixedHeight:40});
    if(callback)this.actionFrames.push(box);
    if(callback)item.setInteractive({useHandCursor:true}).on('pointerover',()=>focus()).on('menu-focus',()=>focus()).on('pointerdown',()=>{this.actionFocus.set(this.page,label);box.setFillStyle(0x622044);this.cameras.main.flash(70,130,20,80,false);AudioSystem.play(this,'reward',.35);callback()});
    const focus=()=>{if(this.activeAction===label)return;this.activeAction=label;this.actionFrames.forEach(b=>{this.tweens.killTweensOf(b);b.setStrokeStyle(1,0x8d3463).setAlpha(1)});this.actionFocus.set(this.page,label);box.setStrokeStyle(3,0xff58a5);this.tweens.add({targets:box,alpha:{from:.7,to:1},duration:100});AudioSystem.play(this,'pickup',.25)};return item;
  }
  private rankings(headers:string[],rows:{portrait?:EndlessResult['character'];cells:string[]}[]){
    const pageSize=3,count=Math.max(1,Math.ceil(rows.length/pageSize));this.recordPage=Math.min(this.recordPage,count-1);
    const slice=rows.slice(this.recordPage*pageSize,(this.recordPage+1)*pageSize);this.rankView={headers,rows:slice.map((r,i)=>({...r,position:this.recordPage*pageSize+i+1}))};
    if(!rows.length){this.add.rectangle(640,389,1120,310,0x1c1025,.97).setStrokeStyle(2,0x843863);this.add.text(640,335,'SIN REGISTROS DISPONIBLES',{fontFamily:'"Press Start 2P",monospace',fontSize:20,color:'#ff8ec2'}).setOrigin(.5);text(this,640,400,'Tus marcas aparecerán aquí al registrar una operación.',22,'#b69db6').setOrigin(.5);text(this,640,452,'CAMPAÑA / INFINITO · ARCHIVO PERSONAL',16,'#83dfe3').setOrigin(.5);return}
    slice.forEach((record,i)=>{const x=244+i*396,left=x-165,y=220,position=this.recordPage*pageSize+i+1;this.add.rectangle(x,399,366,358,position===1?0x30172b:0x1b1024,.98).setStrokeStyle(position===1?2:1,position===1?0xf2b966:0x6a3659);
      text(this,left,y+15,position===1?'#1 · MEJOR MARCA':'REGISTRO #'+position,17,position===1?'#f6cd7e':'#a48d9e');
      if(record.portrait){const image=this.add.image(left+22,y+70,characterById(record.portrait).portrait);image.setScale(42/Math.max(image.width,image.height))}
      text(this,left+52,y+58,record.cells[0],23,'#fff0f8').setWordWrapWidth(275);
      record.cells.slice(1).forEach((value,j)=>{const yy=y+115+j*29;text(this,left,yy,headers[j+1],16,'#b38aa9');text(this,left+135,yy,value,20,'#8ce9e9').setWordWrapWidth(190)});
    });
    if(count>1)this.menuAction(844,602,'PÁGINA '+(this.recordPage+1)+'/'+count+' →',()=>{this.recordPage=(this.recordPage+1)%count;this.render()},370);
  }
}
