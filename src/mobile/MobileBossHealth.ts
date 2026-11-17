import {bossHealthRows,bossHealthTrail,type BossHealthSource} from '../ui/BossHealthState';
import {bossName} from '../bosses/expansion';
import {menuMotion} from '../ui/MenuSkin';
const states=new WeakMap<HTMLElement,{last:number;rows:{source?:BossHealthSource;root:HTMLElement;label:HTMLElement;fill:HTMLElement;tail:HTMLElement;trail:number;hp:number;flash:number}[]}>();
export function mobileBossHealth(host:HTMLElement,foes:readonly BossHealthSource[],now:number){
 let state=states.get(host);if(!state){state={last:now,rows:[]};states.set(host,state)}const data=bossHealthRows(foes),delta=Math.min(80,Math.max(0,now-state.last));state.last=now;host.hidden=!data.length;
 while(state.rows.length<data.length){const root=document.createElement('div'),label=document.createElement('strong'),track=document.createElement('div'),fill=document.createElement('i'),tail=document.createElement('i');root.className='boss-health-row';track.className='boss-health-track';fill.className='boss-health-fill';tail.className='boss-health-tail';track.append(tail,fill);root.append(label,track);host.append(root);state.rows.push({root,label,fill,tail,trail:1,hp:0,flash:0})}
 state.rows.forEach((r,i)=>{const b=data[i];r.root.hidden=!b;if(!b)return;if(r.source!==b.source){r.source=b.source;r.trail=b.ratio;r.hp=b.health;r.flash=0}if(r.hp-b.health>=b.max*.04)r.flash=now+140;r.hp=b.health;r.trail=bossHealthTrail(r.trail,b.ratio,delta,menuMotion());r.label.textContent=`${bossName(b.id)} · ${Math.ceil(b.health)} / ${Math.ceil(b.max)} HP`;r.fill.style.width=b.ratio*100+'%';r.tail.style.width=r.trail*100+'%';r.root.classList.toggle('hit',menuMotion()&&now<r.flash)});
}
