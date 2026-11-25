import type Phaser from 'phaser';
import type {Firestore} from 'firebase/firestore';
import type {Game} from '../scenes/Game';
import {createHost,connectGuest,description} from '../network/transport';
import {createPeer} from '../network/ice';
import {canStart,choose,newLobby,type Lobby} from './lobby';
import {publishAnswer,publishOffer,type Room} from './store';

type GameKeys={session:string;key:string;rejoining:boolean};
export class PartyLink{
 lobby=newLobby();
 diagnostic='Sala creada';
 private pc?:RTCPeerConnection;
 private channel?:RTCDataChannel;
 private host?:ReturnType<typeof createHost>;
 private guest?:Awaited<ReturnType<typeof connectGuest>>;
 private keys?:GameKeys;
 private gameChannel?:RTCDataChannel;
 private round=-1;
 private busy=false;
 private stopped=false;
 private deadline=0;
 private retryAt=0;
 private gameOpening=false;
 private nonce='';
 constructor(private game:Phaser.Game,private db:Firestore,private code:string,readonly owner:boolean){}
 get connected(){return this.channel?.readyState==='open'&&this.authenticated}
 private authenticated=false;
 private send(value:object){if(this.channel?.readyState==='open')this.channel.send(JSON.stringify(value))}
 private broadcast(){this.send({type:'lobby',state:this.lobby})}
 select(action:string,value:unknown){
  if(this.owner){choose(this.lobby,0,action,value);this.broadcast()}
  else if(this.connected)this.send({type:'choose',action,value,match:this.lobby.match});
 }
 async start(){
  if(!this.owner||!canStart(this.lobby,this.connected))return;
  if(!this.game.scene.isActive('Menu'))throw Error('Vuelve al menú principal para iniciar.');
  const [characterId,partnerId]=this.lobby.heroes;
  this.lobby.playing=true;this.lobby.match++;this.broadcast();
  const scene=this.game.scene.getScene('Game') as Game;
  try{
   const created=new Promise<void>(resolve=>scene.events.once('create',resolve));
   this.game.scene.stop('Menu');this.game.scene.start('Game',{continuous:true,coop:true,characterId,partnerId});
   await created;
   if(this.stopped)return;
   this.host=createHost(scene,()=>this.pc);
   scene.events.once('shutdown',()=>this.finishMatch());
   await this.openGame();
  }catch(e){this.finishMatch();throw e}
 }
 private async openGame(){
  if(!this.host?.available||!this.connected||this.gameOpening)return;
  this.gameOpening=true;
  try{this.send({type:'keys',keys:this.host.memberCredentials});await this.host.offer()}finally{this.gameOpening=false}
 }
 private async receiveGame(){
  if(!this.keys||!this.gameChannel||!this.pc)return;
  const keys=this.keys,ch=this.gameChannel;this.keys=undefined;this.gameChannel=undefined;
  this.guest?.close();
  this.guest=await connectGuest({type:'offer'},{session:keys.session,key:keys.key},keys.rejoining,this.game,{pc:this.pc,ch});
 }
 private finishMatch(){
  if(!this.lobby.playing)return;
  this.host?.stop();this.host=undefined;this.guest?.close();this.guest=undefined;
  this.lobby.playing=false;this.lobby.ready=[false,false];this.broadcast();
 }
 private drop(message:string){
  const pc=this.pc;this.pc=undefined;this.channel=undefined;this.authenticated=false;
  this.gameChannel=undefined;this.keys=undefined;pc?.close();
  if(!this.lobby.playing)this.lobby.ready=[false,false];
  this.diagnostic=message;this.retryAt=Date.now()+4000;
 }
 private bind(ch:RTCDataChannel){
  this.channel=ch;
  ch.onopen=()=>{if(!this.owner)this.send({type:'hello',nonce:this.nonce})};
  ch.onclose=ch.onerror=()=>{if(ch===this.channel)this.drop('Canal desconectado. Reintentando…')};
  ch.onmessage=e=>{
   if(ch!==this.channel||typeof e.data!=='string'||e.data.length>4096)return;
   try{
    const m=JSON.parse(e.data);
    if(this.owner){
     if(m.type==='hello'&&m.nonce===this.nonce){this.authenticated=true;this.broadcast()}
     else if(this.connected&&m.type==='choose'&&m.match===this.lobby.match){choose(this.lobby,1,m.action,m.value);this.broadcast()}
    }else if(m.type==='lobby'){
     const previous=this.lobby.playing;this.lobby=m.state as Lobby;this.authenticated=true;
     if(previous&&!this.lobby.playing){this.guest?.close();this.guest=undefined}
    }else if(m.type==='keys'&&this.connected){this.keys=m.keys;void this.receiveGame().catch(err=>this.drop(String(err)))}
    if(this.connected)this.diagnostic='Canal de juego conectado';
   }catch{this.drop('Error de protocolo')}
  };
 }
 async sync(r:Room){
  if(this.stopped||this.busy||!r.guest||r.closed)return;
  this.busy=true;
  try{
   if(this.connected){
    if(this.owner&&this.lobby.playing&&this.host){
     const scene=this.game.scene.getScene('Game') as Game;
     if(scene.ended){this.finishMatch();this.game.scene.stop('Game');this.game.scene.start('Menu')}
     else await this.openGame();
    }
    return;
   }
   if(this.pc&&Date.now()>this.deadline){this.drop('Tiempo de espera agotado. Revisa NAT, cortafuegos o TURN.');return}
   if(Date.now()<this.retryAt)return;
   if(this.owner&&this.pc&&r.round===this.round&&r.answer&&!this.pc.remoteDescription){
    await this.pc.setRemoteDescription(JSON.parse(r.answer));return;
   }
   if(!this.owner&&!this.pc&&r.round===0)this.diagnostic='Invitado incorporado · Esperando oferta WebRTC';
   if(this.owner?!!this.pc:r.round<=this.round||!r.offer||!r.joinKey||!!r.answer)return;
   if(!this.owner)this.drop('Negociando WebRTC');
   this.diagnostic='Invitado incorporado · Negociando WebRTC';
   const pc=await createPeer(true);if(this.stopped){pc.close();return}
   this.pc=pc;this.deadline=Date.now()+35000;
   pc.onconnectionstatechange=()=>{if(pc===this.pc&&['failed','closed','disconnected'].includes(pc.connectionState))this.drop('Error de conexión ICE. Reintentando…')};
   if(this.owner){
    this.nonce=crypto.randomUUID();this.bind(pc.createDataChannel('party-v2'));
    const offer=await description(pc,await pc.createOffer());
    if(this.stopped)return;
    await publishOffer(this.db,this.code,r.round,offer,JSON.stringify({nonce:this.nonce}));this.round=r.round+1;
   }else{
    this.round=r.round;this.nonce=JSON.parse(r.joinKey!).nonce;
    pc.ondatachannel=e=>{
     if(e.channel.label==='party-v2')this.bind(e.channel);
     else if(e.channel.label==='continua-v1'){this.gameChannel=e.channel;void this.receiveGame().catch(err=>this.drop(String(err)))}
    };
    await pc.setRemoteDescription(JSON.parse(r.offer!));
    const answer=await description(pc,await pc.createAnswer());
    if(!this.stopped)await publishAnswer(this.db,this.code,r.round,answer);
   }
  }catch(e){this.drop('Error de conexión: '+String(e))}finally{this.busy=false}
 }
 stop(guestLeft=false){
  this.stopped=true;
  if(guestLeft&&this.host)(this.game.scene.getScene('Game') as Game).coop?.remoteLeft();
  this.host?.stop();this.guest?.close();this.drop('Sala cerrada');
 }
}
