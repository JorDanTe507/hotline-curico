import {FORTUNE,CRATE_REWARDS,SAFE_RARITIES} from '../config/fortune';
import {WEAPONS} from '../weapons/arsenal';
import {hash,type Chunk,WorldModel} from './WorldModel';
export type FortuneKind='crate'|'safe'|'mystery';
export interface FortuneObject {id:string;chunk:string;kind:FortuneKind;x:number;y:number;hp:number;progress:number;opened:boolean;rewarded:boolean}
export function crateReward(random=Math.random){let ticket=random()*100;for(const r of CRATE_REWARDS){ticket-=r.weight;if(ticket<0)return r.kind}return 'none'}
export function safeWeapon(random=Math.random){
 const rarities=SAFE_RARITIES.filter(r=>WEAPONS.some(w=>w.rarity===r.rarity));const total=rarities.reduce((n,r)=>n+r.weight,0);
 let ticket=random()*total;let rarity=rarities.at(-1)?.rarity;
 for(const r of rarities){ticket-=r.weight;if(ticket<0){rarity=r.rarity;break}}
 const pool=WEAPONS.map((w,id)=>({w,id})).filter(({w})=>w.rarity===rarity);
 if(!pool.length)throw new Error('No hay categorías válidas para la caja fuerte');
 return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))].id;
}
/** Stable candidates on clear 3x3 floor rings; never replace a structural collision tile. */
export function fortuneCandidates(world:WorldModel,chunk:Chunk):FortuneObject[]{
 const result:FortuneObject[]=[],cx=chunk.cx,cy=chunk.cy,inside=(x:number,y:number)=>chunk.buildings.some(b=>x>b.x&&x<b.x+b.w-1&&y>b.y&&y<b.y+b.h-1);
 const clear=(x:number,y:number,kind:FortuneKind)=>{
  if(world.inApartment(cx*32+x,cy*32+y))return false;
  if(chunk.cells[y]?.[x]!==0)return false;
  if(kind==='crate')for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(chunk.cells[y+dy]?.[x+dx]!==0)return false;
  if(kind==='mystery'&&(chunk.cells[y]?.[x-1]!==0||chunk.cells[y]?.[x+1]!==0))return false;
  if(chunk.props.some(p=>{const margin=p.frame==='aceite-0'?3:kind==='crate'?2:0;return x>=p.x-margin&&x<p.x+p.w+margin&&y>=p.y-margin&&y<p.y+p.h+margin}))return false;
  if(chunk.buildings.some(b=>(b.doors??[]).some(d=>Math.hypot(x-d.x,y-d.y)<3)))return false;
  return !result.some(p=>Math.hypot(p.x/48-cx*32-x-.5,p.y/48-cy*32-y-.5)<4);
 };
 for(const kind of ['crate','safe','mystery'] as const){const chance=kind==='crate'?FORTUNE.crateChance:kind==='safe'?FORTUNE.safeChance:FORTUNE.mysteryChance;
  for(let slot=0;slot<(kind==='crate'?FORTUNE.maxCratesPerChunk:1);slot++){
   const salt=kind==='crate'?601:kind==='safe'?701:801;if(hash(world.seed+salt+slot,cx,cy)/4294967296>=chance)continue;
   for(let i=0;i<120;i++){const n=hash(world.seed+salt+slot*151+i,cx,cy),x=2+n%28,y=2+Math.floor(n/29)%28;
    if(!clear(x,y,kind)||(kind==='safe'&&!inside(x,y))||(kind==='crate'&&inside(x,y)))continue;
    result.push({id:`${chunk.key}:${kind}:${slot}`,chunk:chunk.key,kind,x:(cx*32+x+.5)*48,y:(cy*32+y+.5)*48,hp:FORTUNE.crateHP,progress:0,opened:false,rewarded:false});break;
   }
  }
 }
 return result;
}
export class FortuneLedger {
 readonly objects=new Map<string,FortuneObject>();private generated=new Set<string>();
 load(world:WorldModel,chunk:Chunk){if(!this.generated.has(chunk.key)){this.generated.add(chunk.key);for(const item of fortuneCandidates(world,chunk))this.objects.set(item.id,item)}return [...this.objects.values()].filter(p=>p.chunk===chunk.key)}
 damage(item:FortuneObject,amount:number){if(item.opened||item.kind!=='crate'||amount<=0)return false;item.hp=Math.max(0,item.hp-amount);if(item.hp>0)return false;item.opened=true;return true}
 advance(item:FortuneObject,delta:number,holding:boolean,near:boolean){if(item.kind!=='safe'||item.opened||!holding||!near)return false;item.progress=Math.min(FORTUNE.safeTime,item.progress+Math.max(0,delta));if(item.progress<FORTUNE.safeTime)return false;item.opened=true;return true}
 claim(item:FortuneObject){if(!item.opened||item.rewarded)return false;item.rewarded=true;return true}
 clear(){this.objects.clear();this.generated.clear()}
}
