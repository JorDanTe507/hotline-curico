import type Phaser from 'phaser';
import type {Game} from '../scenes/Game';

function visual(sprite:Phaser.GameObjects.Image|Phaser.GameObjects.Sprite){
 return {x:sprite.x,y:sprite.y,tex:sprite.texture.key,frame:sprite.frame.name,
  w:sprite.displayWidth,h:sprite.displayHeight,flip:sprite.flipX,flipY:sprite.flipY,rot:sprite.rotation,
  ox:sprite.originX,oy:sprite.originY,depth:sprite.depth,alpha:sprite.alpha};
}
export function snapshotReader(game:Game){
 const ids=new WeakMap<object,number>();
 let next=0;
 function id(entity:object){
  let value=ids.get(entity);
  if(value===undefined){value=++next;ids.set(entity,value)}
  return value;
 }
 return ()=>{
  const session=game.coop!,j2=session.actor(2),spectating=session.state(2).dead;
  const focus=spectating?session.actor(1).player:j2.player;
  const visible=(p:{x:number;y:number})=>Math.abs(p.x-focus.x)<800&&Math.abs(p.y-focus.y)<510;
  const left=Math.floor(focus.x/48)-15,top=Math.floor(focus.y/48)-9;
  let tiles='';
  for(let y=top;y<top+19;y++)for(let x=left;x<left+31;x++){
   const cx=Math.floor(x/32),cy=Math.floor(y/32);
   const sector=game.worldStreamer.loaded.get(cx+','+cy);
   let index=-1;
   if(sector){
    const tx=x-cx*32,ty=y-cy*32;
    for(const layer of sector.map.layers){
     if(layer.name.startsWith('wet-'))continue;
     const tile=layer.data[ty]?.[tx];
     if(tile&&tile.index>=0)index=tile.index;
    }
   }
   tiles+=String.fromCharCode(65+index);
  }
  const props=[];
  for(const sector of game.worldStreamer.loaded.values())for(const obj of sector.objects){
   const prop=obj as Phaser.GameObjects.Image;
   if((prop.type==='Image'||prop.type==='Sprite')&&prop.visible&&prop.texture&&prop.frame&&visible(prop))props.push({id:id(prop),...visual(prop)});
  }
  return {
   elapsed:game.continuous!.elapsed,clock:game.clock,paused:game.paused,ended:game.ended,hc:game.economy.wallet!.balance,
   terrain:{left,top,tiles},props,spectating,choices:j2.levelUp.active?j2.levelUp.options.map(o=>o.name):[],choice:session.remoteChoice,
   players:[1,2].map(slot=>{
    const a=session.actor(slot),s=session.state(slot);
    return {slot,...visual(a.player),hp:a.run.health,armor:a.run.armor,
     level:a.run.level,xp:a.run.xp,until:s.until,rescue:s.progress,dead:s.dead,
     ability:a.character.ability.name,charge:a.ultimate.charge,required:a.ultimate.requiredHits,
     ready:a.ultimate.ready,using:a.ultimate.active(game.clock),reload:a.reloadAt>game.clock,
     weapon:a.equipped.visible?visual(a.equipped):null,
     character:a.character.id,medkits:a.run.medkits,active:a.active,
     guns:a.guns.map(g=>({id:g.id,ammo:g.ammo,reserve:g.reserve}))};
   }),
   foes:game.foes.filter(f=>visible(f.sprite)).map(f=>({id:id(f),...visual(f.sprite),hp:f.hp,max:f.max,boss:f.boss,tier:f.tier})),
   shots:game.shots.filter(s=>s.sprite.active&&visible(s.sprite)).map(s=>({id:id(s),...visual(s.sprite)})),
   drops:game.drops.filter(d=>visible(d.sprite)).map(d=>{
    const icon=d.sprite.list[1] as Phaser.GameObjects.Image;
    return {id:id(d),kind:d.kind,item:d.id,...visual(icon),x:d.sprite.x,y:d.sprite.y};
   }),
   coins:Array.from(game.coins?.ledger.coins.values()??[]).filter(visible).map(c=>({id:c.id,x:c.x,y:c.y,value:c.value})),
   magnets:Array.from(game.coins?.pockets??[]).filter(([,p])=>visible(p)).map(([id,p])=>({id,...p}))
  };
 };
}
export type Snapshot=ReturnType<ReturnType<typeof snapshotReader>>;
