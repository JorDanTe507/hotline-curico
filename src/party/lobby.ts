export const heroes=['cervela','nicolas','jordan'] as const;
export type Hero=typeof heroes[number];
export type Slot=0|1;
export interface Lobby {
 mode:'continuous'|'traditional';
 heroes:[Hero|null,Hero|null];
 ready:[boolean,boolean];
 match:number;
 playing:boolean;
}
export const newLobby=():Lobby=>({mode:'continuous',heroes:[null,null],ready:[false,false],match:0,playing:false});
export function canStart(s:Lobby,connected:boolean){
 return connected&&!s.playing&&s.mode==='continuous'&&s.ready.every(Boolean)&&
  s.heroes.every(h=>h!==null&&heroes.includes(h))&&s.heroes[0]!==s.heroes[1];
}
export function choose(s:Lobby,slot:Slot,action:string,value:unknown){
 if(s.playing)return;
 if(action==='mode'&&slot===0&&(value==='traditional'||value==='continuous')&&value!==s.mode){
  s.mode=value;s.ready=[false,false];
 }
 if(action==='hero'&&heroes.includes(value as Hero)&&s.heroes[1-slot]!==value&&s.heroes[slot]!==value){
  s.heroes[slot]=value as Hero;s.ready[slot]=false;
 }
 if(action==='ready'&&s.heroes[slot]&&typeof value==='boolean')s.ready[slot]=value;
}
