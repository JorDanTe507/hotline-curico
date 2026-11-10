import type Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {cellPoint} from './Arenas';
import {roomProp,RUSH_ROOM_ART} from './RoomArt';
import {ATMOSPHERE} from '../atmosphere/AtmosphereStyle';

export const GENERATORS = [[5,6],[24,7],[14,13]] as const;
export const CUT={first:14500,duration:11500,retry:900,success:[.48,.56,.64]} as const;

export class PowerCut {
  private shade:Phaser.GameObjects.Rectangle;
  private machines:Phaser.GameObjects.Image[];
  private emitters:{image:Phaser.GameObjects.Image;frame:string}[];
  private next=CUT.first as number;
  private until=0;
  private retry=0;
  private messageUntil=0;
  private message='';
  constructor(private s:Game){
    this.shade=s.add.rectangle(640,360,1280,720,0x080719,0).setScrollFactor(0).setDepth(34);
    this.machines=GENERATORS.map(cell=>{
      const p=cellPoint(cell);
      return roomProp(s,'3-generator-on',p.x,p.y+16,53,48,5);
    });
    const frames=new Set(['3-console','3-panel','3-lamp']);
    this.emitters=s.children.list.flatMap(object=>{
      const image=object as Phaser.GameObjects.Image;
      const frame=String(image.frame?.name);
      return image.texture?.key===RUSH_ROOM_ART&&frames.has(frame)?[{image,frame}]:[];
    });
  }
  get dark(){return this.until>0&&this.s.clock<this.until;}
  private nearby(){
    return GENERATORS.findIndex(cell=>{
      const p=cellPoint(cell),player=this.s.player;
      return Math.hypot(player.x-p.x,player.y-p.y)<55&&this.s.lineClear(player.x,player.y,p.x,p.y);
    });
  }
  hint(){return this.dark&&this.nearby()>=0?'INTENTAR RESTAURAR LA ELECTRICIDAD':undefined;}
  get status(){return this.s.clock<this.messageUntil?this.message:this.dark?'APAGÓN · BUSCA UN GENERADOR':'';}
  interact(random=Math.random){
    if(!this.dark)return false;
    const index=this.nearby();
    if(index<0)return false;
    if(this.s.clock>=this.retry){
      this.retry=this.s.clock+CUT.retry;
      if(random()<CUT.success[index])this.restore();
      else this.announce('EL GENERADOR NO ARRANCÓ');
    }
    return true;
  }
  update(active:boolean){
    if(!active){if(this.until)this.restore();return;}
    if(this.until&&this.s.clock>=this.until){this.restore();return;}
    if(!this.until&&this.s.clock>=this.next){
      this.until=this.s.clock+CUT.duration;
      this.shade.setFillStyle(0x080719,ATMOSPHERE.blackoutShade);
      this.machines.forEach(m=>m.setFrame('3-generator-off'));
      this.emitters.forEach(({image,frame})=>image.setFrame(frame+'-dark'));
      this.announce('APAGÓN · BUSCA UN GENERADOR');
    }
  }
  private restore(){
    this.until=0;
    this.next=this.s.clock+28000;
    this.shade.setFillStyle(0x080719,0);
    this.machines.forEach(m=>m.setFrame('3-generator-on'));
    this.emitters.forEach(({image,frame})=>image.setFrame(frame));
    this.announce('ELECTRICIDAD RESTAURADA');
  }
  private announce(text:string){this.message=text;this.messageUntil=this.s.clock+1400;}
}
