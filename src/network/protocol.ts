export const VERSION = 1;
export interface Move {x:number;y:number}
export const buttons={fire:1,reload:2,switch:4,dash:8,ultimate:16,interact:32} as const;
export type Action=keyof typeof buttons;
export type Controls=Move & {angle:number;buttons:number};
export type ClientMessage =
 | {v:1;type:'join'|'resume';session:string;key:string}
 | {v:1;type:'input';seq:number;x:number;y:number;angle?:number;buttons?:number};

export function decodeClient(raw:unknown):ClientMessage|undefined {
 if(typeof raw!=='string'||raw.length>512)return;
 let m;
 try{m=JSON.parse(raw)}catch{return}
 if(!m||typeof m!=='object'||m.v!==VERSION)return;
 const keys=Object.keys(m).sort().join(',');
 if(m.type==='input'&&(keys==='seq,type,v,x,y'||(keys==='angle,buttons,seq,type,v,x,y'&&Number.isFinite(m.angle)&&Math.abs(m.angle)<=Math.PI&&Number.isInteger(m.buttons)&&m.buttons>=0&&m.buttons<=63))&&Number.isSafeInteger(m.seq)&&m.seq>0&&
    [m.x,m.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=1))return m;
 if((m.type==='join'||m.type==='resume')&&keys==='key,session,type,v'&&
    typeof m.key==='string'&&typeof m.session==='string')return m;
}

export class MovementIntent {
 seq=0;
 private value:Move={x:0,y:0};
 private at=-Infinity;
 private held=0;
 private edges=0;
 private pressedAt=new Map<number,number>();
 angle=0;
 down(action:Action){return performance.now()-this.at<=350&&!!(this.held&buttons[action])}
 take(action:Action){
  const bit=buttons[action],pressed=performance.now()-(this.pressedAt.get(bit)??-Infinity)<=350&&!!(this.edges&bit);
  this.edges&=~bit;return pressed;
 }
 accept(m:Extract<ClientMessage,{type:'input'}>,now:number){
  if(m.seq<=this.seq)return false;
  const length=Math.max(1,Math.hypot(m.x,m.y));
  if(now-this.at>350)this.edges=this.held=0;
  const held=m.buttons??0;
  const rising=held&~this.held;
  for(const bit of Object.values(buttons))if(bit&rising)this.pressedAt.set(bit,now);
  this.edges|=rising;
  this.held=held;this.angle=m.angle??0;
  this.value={x:m.x/length,y:m.y/length};this.at=now;this.seq=m.seq;
  return true;
 }
 read(now:number){return now-this.at<=350?this.value:{x:0,y:0}}
 clear(){this.at=-Infinity;this.edges=this.held=0}
}
