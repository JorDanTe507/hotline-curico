import {RemoteWorld} from './RemoteWorld';
import type Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {decodeClient,MovementIntent,VERSION} from './protocol';
import {snapshotReader,type Snapshot} from './snapshot';

type Welcome={v:1;type:'welcome';session:string;slot:2;host:string;participant:string;resume:string;ack:number};
type State={v:1;type:'state';session:string;frame:number;ack:number;world:Snapshot};
type HostMessage=Welcome|State;
type Invitation={session:string;key:string};
const stun=import.meta.env.VITE_WEBRTC_STUN_URL;
const peer=()=>new RTCPeerConnection({iceServers:stun&&/^stuns?:/.test(stun)?[{urls:stun}]:[]});

// Manual signalling transfers a complete SDP, including local ICE candidates.
async function description(pc:RTCPeerConnection,local:RTCSessionDescriptionInit){
 await pc.setLocalDescription(local);
 if(pc.iceGatheringState!=='complete')await new Promise<void>((resolve,reject)=>{
  const timer=setTimeout(()=>done(new Error('ICE incompleto')),10000);
  function done(error?:Error){clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',changed);error?reject(error):resolve()}
  function changed(){if(pc.iceGatheringState==='complete')done()}
  pc.addEventListener('icegatheringstatechange',changed);changed();
 });
 return pc.localDescription!.toJSON();
}

export function createHost(game:Game){
 const coop=game.coop;
 if(!game.continuous||!coop||game.ended)throw Error('Se requiere Continua cooperativa activa');
 const intent=new MovementIntent(),snapshot=snapshotReader(game);
 coop.bindRemote(intent);
 const session=crypto.randomUUID(),key=crypto.randomUUID(),resume=crypto.randomUUID();
 const hostId=crypto.randomUUID(),guestId=crypto.randomUUID();
 let claimed=false,stopped=false,frame=0;
 let current:RTCPeerConnection|undefined,channel:RTCDataChannel|undefined;
 let authenticated=false,lastPacket=0;
 function release(){
  const pc=current;
  current=undefined;channel=undefined;intent.clear();
  if(authenticated)coop!.observeControl('remote-client',false,performance.now());
  authenticated=false;pc?.close();
 }
 function send(message:HostMessage){channel!.send(JSON.stringify(message))}
 const timer=setInterval(()=>{
  if(game.ended){stop();return}
  if(!current)return;
  if(performance.now()-lastPacket>(authenticated?5000:15000)){release();return}
  if(authenticated&&channel?.readyState==='open'&&channel.bufferedAmount<65536){
   try{send({v:VERSION,type:'state',session,frame:++frame,ack:intent.seq,world:snapshot()})}catch{release()}
  }
 },100);
 function stop(){if(stopped)return;stopped=true;clearInterval(timer);release()}
 game.events.once('shutdown',stop);
 return {
  slot:1,participant:hostId,invitation:{session,key},stop,
  get available(){return !current&&!stopped&&!game.ended&&coop.partnerControl?.status==='grace'},
  get connected(){return authenticated},
  get memberCredentials(){return {session,key:claimed?resume:key,rejoining:claimed}},
  async offer(){
   if(stopped||game.ended||current||coop.partnerControl?.status!=='grace')throw Error('Plaza no disponible');
   const pc=current=peer();lastPacket=performance.now();
   const ch=channel=pc.createDataChannel('continua-v1',{ordered:true});
   const lost=()=>{if(current===pc)release()};
   pc.onconnectionstatechange=()=>{if(['failed','disconnected','closed'].includes(pc.connectionState))lost()};
   ch.onclose=ch.onerror=lost;
   ch.onmessage=event=>{
    if(current!==pc)return;
    const m=decodeClient(event.data);
    if(!m){lost();return}
    const now=performance.now();
    if(!authenticated){
     if(m.type==='input'||m.session!==session||m.type!==(claimed?'resume':'join')||m.key!==(claimed?resume:key)){lost();return}
     coop.observeControl('remote-client',true,now);
     if(coop.partnerControl?.status!=='controlled'){lost();return}
     claimed=authenticated=true;lastPacket=now;
     send({v:VERSION,type:'welcome',session,slot:2,host:hostId,participant:guestId,resume,ack:intent.seq});
    }else if(m.type==='input'&&coop.partnerControl?.status==='controlled'){
     if(intent.accept(m,now))lastPacket=now;
    }else if(m.type==='input'&&coop.partnerControl?.status==='permanent-death'){lastPacket=now}
    else lost();
   };
   try{
    const offer=await description(pc,await pc.createOffer());
    return {offer,answer:async(value:RTCSessionDescriptionInit)=>{
     if(current!==pc)throw Error('Oferta caducada');
     try{await pc.setRemoteDescription(value)}catch(error){lost();throw error}
    }};
   }catch(error){lost();throw error}
  }
 };
}

export async function connectGuest(offer:RTCSessionDescriptionInit,credentials:Invitation,rejoining=false,
 game:Phaser.Game|undefined=(window as Window & {hotlineGame?:Phaser.Game}).hotlineGame){
 const pc=peer();
 let channel:RTCDataChannel|undefined,welcome:Welcome|undefined,state:State|undefined,seq=0;
 let move={x:0,y:0,angle:0,buttons:0};
 function sendInput(){
  if(welcome&&channel?.readyState==='open'&&channel.bufferedAmount<8192)
   channel.send(JSON.stringify({v:VERSION,type:'input',seq:++seq,...move}));
 }
 const timer=setInterval(sendInput,100);
 function close(){clearInterval(timer);pc.close()}
 const feed={close,get closed(){return pc.signalingState==='closed'},move:(x:number,y:number)=>{move={...move,x,y};sendInput()},controls:(value:typeof move)=>{move=value;sendInput()},get welcome(){return welcome},get state(){return state}};

 pc.onconnectionstatechange=()=>{if(['failed','disconnected','closed'].includes(pc.connectionState))close()};
 pc.ondatachannel=event=>{
  const ch=channel=event.channel;
  ch.onclose=ch.onerror=close;
  ch.onopen=()=>ch.send(JSON.stringify({v:VERSION,type:rejoining?'resume':'join',...credentials}));
  ch.onmessage=event=>{
   let m:HostMessage;
   try{m=JSON.parse(event.data)}catch{close();return}
   if(!m||m.v!==VERSION||m.session!==credentials.session){close();return}
   if(m.type==='welcome'&&!welcome&&m.slot===2){welcome=m;seq=m.ack;
    if(game){
     if(game.scene.isActive('Game')){close();return}
     if(game.scene.keys.RemoteWorld)game.scene.remove('RemoteWorld');
     game.scene.stop('Menu');game.scene.add('RemoteWorld',new RemoteWorld(feed),true);
    }
   }
   else if(m.type==='state'&&welcome&&m.frame>(state?.frame??0))state=m;
   else close();
  };
 };
 try{
  await pc.setRemoteDescription(offer);
  const answer=await description(pc,await pc.createAnswer());
  return Object.assign(feed,{answer});
 }catch(error){close();throw error}
}
