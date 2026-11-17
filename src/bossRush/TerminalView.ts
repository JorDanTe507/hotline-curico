import type Phaser from 'phaser';
import {currentViewport} from '../mobile/Viewport';
import {unlockedRush} from './state';
import {criminalFile} from './Presentation';
import type {BossRushMenu} from './Menus';
import './terminal.css';
import {presentationPreferences} from '../ui/PresentationPreferences';
import {inputHub} from '../input/InputHub';
const urls=new WeakMap<Phaser.Game,Map<string,string>>();
function image(s:Phaser.Scene,key:string,frame?:string){let cache=urls.get(s.game);if(!cache){cache=new Map();urls.set(s.game,cache)}const id=key+'#'+(frame??'');let value=cache.get(id);if(!value){value=s.textures.getBase64(key,frame);cache.set(id,value)}return value}
const node=(tag:string,value='',className='')=>{const n=document.createElement(tag);n.className=className;n.textContent=value;return n};
/** One shared, readable terminal for mouse/touch and the existing scene navigation. No gameplay state. */
export class RushTerminalView {
 readonly root=node('section','','rush-criminal-terminal');
 private screen=node('section','','crt-content');private signature='';private bootText?:HTMLElement;private lastBounds='';
 private lastScroll=performance.now();
 private readKey=(event:KeyboardEvent)=>{if(this.root.hidden||!this.root.isConnected||!this.s.scene.isActive()||!this.s.accessState().ready)return;if(event.key==='PageDown'||event.key==='PageUp'){event.preventDefault();this.scrollInfo(event.key==='PageDown'?100:-100)}};
 private scrollInfo(amount:number){const info=this.screen.querySelector<HTMLElement>('.crt-file section');if(info)info.scrollTop+=amount}
 constructor(private s:BossRushMenu){
  this.root.id='rush-terminal';this.root.setAttribute('aria-label','Terminal de práctica de jefes');
  const office=node('img') as HTMLImageElement;office.src=image(s,'rush-office');office.alt='Escritorio de investigación nocturno';office.className='crt-office';
  const shell=node('div','','crt-case');
  for(const [key,cls]of [['rush-crt-screen','crt-glass'],['rush-crt','crt-bezel']]){const img=node('img') as HTMLImageElement;img.src=image(s,key);img.alt=key==='rush-crt'?'Computador retro con teclado decorativo':'';img.className=cls;shell.append(img)}
  shell.append(this.screen);this.root.append(office,shell);document.body.append(this.root);
  this.root.addEventListener('keydown',e=>{if(['Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault()});window.addEventListener('keydown',this.readKey);this.update();
 }
 private button(parent:HTMLElement,label:string,id:string,fn:()=>void,disabled=false){const b=node('button',label) as HTMLButtonElement;b.type='button';b.dataset.action=id;b.disabled=disabled;b.onclick=()=>fn();parent.append(b);return b}
 update(){
  const mobile=this.s.registry.get('mobile') as {portrait?:boolean;accepted?:boolean}|undefined;
  this.root.hidden=!!this.s.registry.get('mobileUI')&&(!!mobile?.portrait||!mobile?.accepted);
  const v=currentViewport(),bounds=[v.width,v.height,v.left,v.top].join(':');if(bounds!==this.lastBounds){this.lastBounds=bounds;Object.assign(this.root.style,{width:v.width+'px',height:v.height+'px',left:v.left+'px',top:v.top+'px'});this.root.style.setProperty('--terminal-height',v.height+'px');this.root.classList.toggle('crt-zoom',v.width<=900||v.height<=500)}
  const boot=this.s.accessState();const sig=boot.ready?'file:'+this.s.practiceFocus+':'+unlockedRush():'boot';
  if(sig!==this.signature){this.signature=sig;this.render(boot.ready)}
  if(this.bootText)this.bootText.textContent=boot.status+'\n\n'+boot.bullets.padEnd(7,'_');
  const now=performance.now(),elapsed=Math.min(50,now-this.lastScroll);this.lastScroll=now;if(!this.root.hidden&&boot.ready){const pad=inputHub(this.s.game);this.scrollInfo(((pad.down('fire')?1:0)-(pad.down('dash')?1:0))*elapsed*.3)}
 }
 private render(ready:boolean){
  this.screen.replaceChildren();this.bootText=undefined;
  if(!ready){this.screen.className='crt-content crt-boot';this.screen.append(node('h2','CURICÓ // ARCHIVO CRIMINAL'));this.bootText=node('p');this.bootText.setAttribute('aria-live','polite');this.screen.append(this.bootText);const controls=node('nav');this.button(controls,'OMITIR','terminal-skip',()=>this.s.skipAccess());this.button(controls,'VOLVER','practice-back',()=>this.s.back());this.screen.append(controls);return}
  this.screen.className='crt-content'+(!presentationPreferences.animated||matchMedia('(prefers-reduced-motion: reduce)').matches?' crt-reduced':'');const file=criminalFile(this.s.practiceFocus,unlockedRush())!;
  const heading=node('header');heading.append(node('span','CURICÓ // ARCHIVO CRIMINAL'),node('small',file.number));this.screen.append(heading);
  const nav=node('nav','','crt-navigation');this.button(nav,'←','practice-prev',()=>this.s.stepPractice(-1));nav.append(node('strong',(file.index+1)+' / 6'));this.button(nav,'→','practice-next',()=>this.s.stepPractice(1));this.screen.append(nav);
  const body=node('article','','crt-file'),portrait=node('div','','crt-portrait');
  if(file.available){const img=node('img') as HTMLImageElement;img.src=image(this.s,...file.portrait);img.alt=file.name;portrait.append(img)}else portrait.append(node('span','🔒','crt-lock'));
  const info=node('section');info.tabIndex=0;info.setAttribute('aria-label','Información del expediente');info.append(node('h2',file.name),node('strong',file.available?'DESBLOQUEADO':'ACCESO RESTRINGIDO'));
  if(file.available)info.append(node('p','ARENA · '+file.arena),node('p','OPERACIÓN · '+file.operation),node('small','AMENAZA NARRATIVA · '+file.threat),node('p',file.description),node('small',file.weapon));else info.append(node('p',file.arena));body.append(portrait,info);this.screen.append(body);
  if(file.available)this.screen.append(node('small','DATOS ↕ · RUEDA / RE PÁG / L2–R2','crt-scroll-hint'));
  const actions=node('nav','','crt-actions');this.button(actions,file.available?'ELEGIR JEFE':'BLOQUEADO','confirm-practice',()=>this.s.choosePractice(file.index),!file.available);this.button(actions,'VOLVER','practice-back',()=>this.s.back());this.screen.append(actions);
  const tabs=node('nav','','crt-files');tabs.setAttribute('aria-label','Seis expedientes');for(let i=0;i<6;i++){const b=this.button(tabs,String(i+1).padStart(2,'0'),'practice-'+i,()=>this.s.focusPractice(i));b.classList.toggle('selected',i===file.index);b.setAttribute('aria-pressed',String(i===file.index))}this.screen.append(tabs);
 }
 destroy(){window.removeEventListener('keydown',this.readKey);this.root.remove()}
}
