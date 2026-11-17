import type {Game} from '../scenes/Game';
import type {Upgrade,UpgradeContext} from '../systems/UpgradeCatalog';
import {evolutionPreview} from './catalog';
import {menuMotion} from '../ui/MenuSkin';
import './evolution.css';
const names={common:'COMÚN',uncommon:'POCO COMÚN',rare:'RARA',epic:'ÉPICA',legendary:'LEGENDARIA'};
export class EvolutionView {
 private root:HTMLDivElement;private cards:HTMLButtonElement[]=[];private detail:HTMLDivElement;private change:HTMLButtonElement;selected=0;
 constructor(private s:Game,options:Upgrade[],context:UpgradeContext,rerolls:number,choose:(index:number)=>void,reroll:()=>void){
  const root=this.root=document.createElement('div');root.className='rogue-evolution'+(menuMotion()?' motion':'');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',`J${s.playerId} ${s.character.name}: subida de nivel`);root.dataset.player=String(s.playerId);
  const header=document.createElement('header'),portrait=document.createElement('img');portrait.src=this.texture(s.character.portrait);portrait.alt=s.character.name;
  const heading=document.createElement('div'),title=document.createElement('h1');title.textContent='¡SUBIDA DE NIVEL!';heading.append(title);const subtitle=document.createElement('p');subtitle.textContent=`J${s.playerId} · ${s.character.name} · NIVEL ${s.run.level} · ${s.run.pendingLevels} ELECCIÓN${s.run.pendingLevels>1?'ES':''} PENDIENTE${s.run.pendingLevels>1?'S':''}`;heading.append(subtitle);header.append(portrait,heading);root.append(header);
  const grid=document.createElement('div');grid.className='rogue-cards';root.append(grid);
  this.detail=document.createElement('div');this.detail.className='rogue-detail';this.detail.setAttribute('aria-live','polite');
  for(const [i,u]of options.entries()){
   const preview=evolutionPreview(u,context),level=u.currentLevel(context),card=document.createElement('button');card.type='button';card.className='rogue-card '+u.rarity;card.dataset.perk=u.id;card.dataset.action='card-'+i;card.dataset.next=String(level+1);card.style.setProperty('--frame',`url("${import.meta.env.BASE_URL}assets/roguelite/frame-${u.rarity}.png")`);
   const rarity=document.createElement('span');rarity.className='rogue-rarity';rarity.textContent=names[u.rarity];const icon=document.createElement('img');icon.className='rogue-icon';icon.src=this.texture(['charge','duration'].includes(u.id)?s.character.specialPortrait:({walk1:s.character.normal.walk[0],back:s.character.normal.back[0],shoot:s.character.normal.pistol[0],hurt:s.character.normal.hurt[0]}as Record<string,string>)[u.icon]??u.icon);icon.alt='';
   const label=document.createElement('h2');label.textContent=u.name;const progression=document.createElement('b');progression.className='rogue-level';progression.textContent=u.repeatable?'RECOMPENSA DE EMERGENCIA':`Nv. ${level} → Nv. ${level+1} / ${u.maxLevel}`;
   const description=document.createElement('p');description.className='rogue-description';description.textContent=u.description;
   const compare=document.createElement('div');compare.className='rogue-compare';const before=document.createElement('span'),after=document.createElement('strong');before.textContent=preview.current;after.textContent='→ '+preview.next;compare.append(before,after);
   const stars=document.createElement('div');stars.className='rogue-stars';stars.textContent=u.repeatable?'SUMINISTRO':Array.from({length:u.maxLevel},(_,j)=>j<level?'★':j===level?'✦':'☆').join(' ');
   const badge=document.createElement('span');badge.className='rogue-max';badge.textContent=!u.repeatable&&level+1===u.maxLevel?'♛ NIVEL MÁXIMO':'EVOLUCIÓN DISPONIBLE';card.append(rarity,icon,label,progression,description,compare,stars,badge);card.onmouseenter=()=>this.focus(i);card.onfocus=()=>this.focus(i);card.onclick=()=>{if(!(s.coop&&s.playerId===2))choose(i)};card.addEventListener('pointerdown',e=>e.stopPropagation());card.dataset.detail=`${u.name} · ${preview.next}${preview.special?' · '+preview.special:''}`;grid.append(card);this.cards.push(card);
  }
  const footer=document.createElement('footer');this.change=document.createElement('button');this.change.textContent=`CAMBIAR CARTAS (${rerolls}/${s.levelUp.maxRerolls})`;this.change.disabled=!rerolls;this.change.onclick=()=>{if(!(s.coop&&s.playerId===2))reroll()};this.change.onmouseenter=()=>this.focus(options.length);const help=document.createElement('span');help.textContent=s.coop&&s.playerId===2?'CRUCETA · × CONFIRMAR':'1–3 ELEGIR · FLECHAS NAVEGAR · ENTER CONFIRMAR';footer.append(this.change,help);root.append(this.detail,footer);document.body.append(root);this.focus(0);
 }
 private texture(key:string){const texture=this.s.textures.get(key);if(texture.key==='__MISSING')return `${import.meta.env.BASE_URL}assets/roguelite/spark.png`;return this.s.textures.getBase64(key)}
 focus(index:number){this.selected=Math.max(0,Math.min(this.cards.length,index));this.cards.forEach((c,i)=>c.classList.toggle('selected',i===this.selected));this.change.classList.toggle('selected',this.selected===this.cards.length);this.detail.textContent=this.cards[this.selected]?.dataset.detail??'Sustituye las tres opciones; conserva niveles y efectos ya obtenidos.'}
 celebrate(max:boolean){if(!menuMotion())return;const text=document.createElement('div');text.className='rogue-toast';text.textContent=max?'♛ ¡NIVEL MÁXIMO ALCANZADO!':'¡PERK EVOLUCIONADA!';document.body.append(text);setTimeout(()=>text.remove(),650)}
 destroy(){this.root.remove()}
}
