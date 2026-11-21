import type Phaser from 'phaser';
import {GoogleAuthProvider,onAuthStateChanged,signInWithPopup,signOut,type User} from 'firebase/auth';
import {onSnapshot} from 'firebase/firestore';
import {firebaseServices} from './firebase';
import {closeParty,createParty,heartbeat,joinParty,roomRef,type Profile,type Room} from './store';
import {PartyLink} from './link';

export function openParties(game:Phaser.Game,trigger:HTMLButtonElement){
 const panel=document.createElement('section');
 panel.className='hc-party';panel.setAttribute('aria-label','Cooperativo online');
 const heading=document.createElement('h2');heading.textContent='Cooperativo online';
 const status=document.createElement('p');status.setAttribute('role','status');
 const account=document.createElement('div'),actions=document.createElement('div'),roster=document.createElement('div');
 const input=document.createElement('input');input.placeholder='Código de invitación';input.setAttribute('aria-label',input.placeholder);
 const codeBox=document.createElement('input');codeBox.readOnly=true;codeBox.setAttribute('aria-label','Código de esta sala');codeBox.onclick=()=>codeBox.select();
 const hide=document.createElement('button');hide.textContent='Ocultar';hide.onclick=()=>{panel.hidden=true};
 panel.append(heading,account,codeBox,roster,input,actions,status,hide);document.body.append(panel);
 for(const event of ['keydown','keyup'])panel.addEventListener(event,e=>e.stopPropagation());
 trigger.onclick=()=>{panel.hidden=!panel.hidden};
 codeBox.hidden=input.hidden=true;
 let services:ReturnType<typeof firebaseServices>;
 try{services=firebaseServices()}catch(e){status.textContent=(e as Error).message;game.events.on('poststep',()=>{trigger.hidden=!game.scene.isActive('Menu');if(trigger.hidden)panel.hidden=true});return}
 const {auth,db}=services;
 let user:User|null=null,code='',room:Room|undefined,link:PartyLink|undefined,unsub=()=>{},busy=false;
 let lastBeat=0,wasConnected=false,online=true;
 const cache=(u:User)=>'hc-party:'+u.uid;
 function clear(voluntary=false){
  unsub();unsub=()=>{};link?.stop(voluntary);link=undefined;code='';room=undefined;wasConnected=false;
  if(user)sessionStorage.removeItem(cache(user));
 }
 function explain(e:unknown){
  const err=e as {code?:string;message?:string};
  status.textContent=err.code==='auth/popup-closed-by-user'||err.code==='auth/cancelled-popup-request'?'Inicio de sesión cancelado.':
   err.code==='auth/popup-blocked'?'Permite la ventana de Google y vuelve a intentarlo.':(err.message||'Error de conexión.');
 }
 function action(label:string,fn:()=>Promise<void>){
  const b=document.createElement('button');b.textContent=label;b.disabled=busy;
  b.onclick=async()=>{if(busy)return;busy=true;status.textContent='Procesando…';render();
   try{await fn();if(status.textContent==='Procesando…')status.textContent=''}catch(e){explain(e)}
   finally{busy=false;render()}
  };actions.append(b);
 }
 function person(container:HTMLElement,p:Profile,label=''){
  const row=document.createElement('div');row.className='hc-member';
  if(p.avatar.startsWith('https://')){const img=document.createElement('img');img.src=p.avatar;img.alt='';img.referrerPolicy='no-referrer';row.append(img)}
  row.append(document.createTextNode(label+p.name));container.append(row);
 }
 function render(){
  actions.replaceChildren();account.replaceChildren();roster.replaceChildren();
  input.hidden=!user||!!code;codeBox.hidden=!code;codeBox.value=code.match(/.{1,4}/g)?.join('-')||'';
  if(!user){action('Iniciar sesión con Google',async()=>{await signInWithPopup(auth,new GoogleAuthProvider())});return}
  person(account,{name:user.displayName||'Jugador',avatar:user.photoURL||''});
  if(!code){
   action('Crear party',async()=>{const id=await createParty(db,user!);watch(id)});
   action('Unirse con código',async()=>{const id=await joinParty(db,user!,input.value);watch(id)});
  }else{
   if(room){
    const presence=(seen?:{toMillis():number})=>seen&&Date.now()-seen.toMillis()<65000?'presente':'sin señal reciente';
    person(roster,room.hostProfile,'J1 · '+presence(room.hostSeen)+' · ');
    if(room.guestProfile)person(roster,room.guestProfile,'J2 · '+presence(room.guestSeen)+' · ');
    else roster.append(document.createTextNode('J2 · Esperando invitado'));
    roster.append(document.createTextNode(!online?'Firestore sin conexión':link?.connected?'WebRTC conectado':room.guest?'Conectando WebRTC…':'Sala abierta'));
   }
   action(room?.host===user.uid?'Cerrar party':'Abandonar sala',async()=>{await closeParty(db,code,user!.uid);clear();status.textContent='Sala cerrada.'});
  }
  action('Cerrar sesión',async()=>{if(code)await closeParty(db,code,user!.uid);clear();await signOut(auth)});
 }
 function watch(id:string){
  unsub();code=id;sessionStorage.setItem(cache(user!),id);lastBeat=0;
  unsub=onSnapshot(roomRef(db,id),{includeMetadataChanges:true},snap=>{
   if(code!==id||snap.metadata.hasPendingWrites)return;
   online=!snap.metadata.fromCache;
   if(!snap.exists()){if(online){clear();render()}return}
   room=snap.data() as Room;
   if(room.closed||room.expiresAt.toMillis()<=Date.now()){
    clear(room.closed&&room.closedBy===room.guest);status.textContent='La sala se cerró o caducó.';render();return;
   }
   link??=new PartyLink(game,db,id,room.host===user?.uid);render();
  },e=>{clear();explain(e);render()});
 }
 status.textContent='Cargando cuenta…';
 onAuthStateChanged(auth,u=>{
  if(user&&user.uid!==u?.uid)clear();
  user=u;status.textContent='';const saved=u&&sessionStorage.getItem(cache(u));if(saved&&!code)watch(saved);render();
 },explain);
 window.setInterval(()=>{
  if(!room||!code||!user||!link)return;
  if(room.expiresAt.toMillis()<=Date.now()){clear();status.textContent='La sala caducó.';render();return}
  if(Date.now()-lastBeat>25000){lastBeat=Date.now();void heartbeat(db,code,link.owner).catch(explain)}
  if(online)void link.sync(room).catch(explain);
  const connected=link.connected;if(connected&&!wasConnected){panel.hidden=true;status.textContent=''}
  wasConnected=connected;if(!panel.hidden)render();
 },1000);
 game.events.on('poststep',()=>{trigger.hidden=!code&&!game.scene.isActive('Menu')});
}
