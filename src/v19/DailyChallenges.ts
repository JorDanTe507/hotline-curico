import Phaser from 'phaser';
import {dailies} from './Progress19';
import {permanentProgress} from '../systems/PermanentProgress';
import {developerSession} from '../systems/DeveloperSession';
import {archiveBackdrop,archivePanel,archiveHeading,archiveMeter,archiveButton} from '../ui/MenuSkin';
export class DailyChallenges extends Phaser.Scene {
 private panel?:Phaser.GameObjects.Container;private stamp='';private page=0;
 constructor(){super('DailyChallenges')}
 create(){this.page=0;this.stamp='';archiveBackdrop(this)}
 get rows(){return dailies().entries.filter(e=>e.day===dailies().day||!e.claimed)}
 get totalPages(){return Math.max(1,Math.ceil(this.rows.length/6))}
 get pageEntries(){return this.rows.slice(this.page*6,this.page*6+6)}
 changePage(delta:number){this.page=Phaser.Math.Clamp(this.page+delta,0,this.totalPages-1);this.stamp=''}
 claim(index:number){if(developerSession.active)return false;const ok=dailies().claim(this.rows[index],permanentProgress());this.stamp='';return ok}
 update(){const store=dailies();store.refresh();this.page=Math.min(this.page,this.totalPages-1);const seconds=Math.ceil(store.remaining/1000),stamp=seconds+':'+this.page+':'+JSON.stringify(store.entries);if(stamp===this.stamp)return;this.stamp=stamp;this.panel?.destroy(true);
  const parts:Phaser.GameObjects.GameObject[]=[],add=<T extends Phaser.GameObjects.GameObject>(p:T)=>{parts.push(p);return p},label=(x:number,y:number,value:string,size=19)=>add(this.add.text(x,y,value,{fontFamily:'monospace',fontSize:size,color:'#fce6f2'}));
  this.cameras.main.setBackgroundColor('#090713');archiveHeading(label(55,30,'DESAFÍOS DIARIOS',36));label(55,80,'CONTRATOS DE CURICÓ / ENCARGOS URBANOS',15).setColor('#bda9cb');
  add(archivePanel(this,825,25,400,80));label(845,38,'RENOVACIÓN UTC',13).setColor('#85eeeb');label(845,60,`${Math.floor(seconds/3600).toString().padStart(2,'0')}:${Math.floor(seconds%3600/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`,25);
  const compact=this.pageEntries.length>3;
  this.pageEntries.forEach((row,i)=>{const d=store.definition(row),x=55+i%3*397,y=compact?135+Math.floor(i/3)*240:155,h=compact?223:405,complete=row.progress>=d.target;
   add(archivePanel(this,x,y,376,h,row.claimed?0x638a77:complete?0x80ede9:0x9c366f));label(x+17,y+14,'CONTRATO '+String(this.page*6+i+1).padStart(2,'0')+' / '+row.day,12).setColor('#bda9cb');
   add(this.add.image(x+52,y+(compact?66:95),'v19-'+d.icon).setDisplaySize(compact?54:80,compact?54:80));label(x+(compact?92:112),y+(compact?42:64),d.name,19).setWordWrapWidth(compact?266:245);
   label(x+17,y+(compact?94:170),d.description,compact?14:16).setWordWrapWidth(340);label(x+17,y+h-91,`${Math.min(row.progress,d.target)}/${d.target} · ${d.reward} HC`,18).setColor('#ffe098');add(archiveMeter(this,x+17,y+h-61,342,row.progress/d.target,row.claimed?0x7aba8e:0xff398f));
   const button=archiveButton(label(x+17,y+h-44,row.claimed?'RECLAMADO':complete?'COMPLETADO · RECLAMAR':'EN PROGRESO',17));if(!row.claimed&&complete&&!developerSession.active)button.setInteractive({useHandCursor:true}).on('pointerdown',()=>this.claim(this.rows.indexOf(row)))
  });
  archiveButton(label(500,650,'↑ ANTERIOR',18)).setInteractive().on('pointerdown',()=>this.changePage(-1));archiveButton(label(760,650,'↓ SIGUIENTE',18)).setInteractive().on('pointerdown',()=>this.changePage(1));label(1020,660,`${this.page+1}/${this.totalPages}`,18);archiveButton(label(55,650,'← VOLVER',20)).setInteractive().on('pointerdown',()=>this.scene.start('Menu'));if(developerSession.active)label(55,694,'PRUEBAS: RECOMPENSAS DESACTIVADAS',12);this.panel=this.add.container(0,0,parts)
 }
}
