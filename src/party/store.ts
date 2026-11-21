import type {User} from 'firebase/auth';
import {Timestamp,deleteField,doc,getDocFromServer,runTransaction,serverTimestamp,updateDoc,writeBatch,type Firestore} from 'firebase/firestore';
export interface Profile {name:string;avatar:string}
export interface Room {
 host:string;guest:string|null;hostProfile:Profile;guestProfile?:Profile;closed:boolean;closedBy?:string;
 hostSeen:Timestamp;guestSeen?:Timestamp;expiresAt:Timestamp;round:number;offer?:string;joinKey?:string;answer?:string;
}
export const normalizeCode=(text:string)=>text.replace(/[\s-]/g,'').toUpperCase();
export const roomRef=(db:Firestore,code:string)=>doc(db,'parties',code);
const lease=()=>Timestamp.fromMillis(Date.now()+180000);
function profile(user:User){return {name:(user.displayName||'Jugador').slice(0,128),avatar:(user.photoURL||'').slice(0,2048)}}
export async function createParty(db:Firestore,user:User){
 const code=Array.from(crypto.getRandomValues(new Uint8Array(12)),v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
 const batch=writeBatch(db);
 batch.set(doc(db,'partyCodes',code),{reserved:true});
 batch.set(roomRef(db,code),{host:user.uid,hostProfile:profile(user),guest:null,closed:false,round:0,hostSeen:serverTimestamp(),expiresAt:lease()});
 await batch.commit();return code;
}
export async function joinParty(db:Firestore,user:User,text:string){
 const code=normalizeCode(text);
 if(!/^[A-F0-9]{24}$/.test(code))throw Error('Código de sala inválido.');
 const ref=roomRef(db,code);
 // A blind conditional write can claim the vacant seat without revealing its occupants.
 try{await updateDoc(ref,{guest:user.uid,guestProfile:profile(user),guestSeen:serverTimestamp()})}
 catch{
  const snap=await getDocFromServer(ref).catch(()=>undefined),r=snap?.data() as Room|undefined;
  if(!r||r.guest!==user.uid||r.closed||r.expiresAt.toMillis()<=Date.now())throw Error('Código inválido, sala llena, cerrada o caducada.');
 }
 return code;
}
export async function closeParty(db:Firestore,code:string,uid:string){
 await updateDoc(roomRef(db,code),{closed:true,closedBy:uid,offer:deleteField(),answer:deleteField(),joinKey:deleteField()});
}
export async function heartbeat(db:Firestore,code:string,host:boolean){
 await updateDoc(roomRef(db,code),host?{hostSeen:serverTimestamp(),expiresAt:lease()}:{guestSeen:serverTimestamp()});
}
export async function publishOffer(db:Firestore,code:string,previous:number,offer:RTCSessionDescriptionInit,key:string){
 const ref=roomRef(db,code);
 await runTransaction(db,async tx=>{
  const r=(await tx.get(ref)).data() as Room;
  if(r.closed||r.round!==previous)throw Error('Oferta sustituida.');
  tx.update(ref,{round:previous+1,offer:JSON.stringify(offer),joinKey:key,answer:deleteField()});
 });
}
export async function publishAnswer(db:Firestore,code:string,round:number,answer:RTCSessionDescriptionInit){
 const ref=roomRef(db,code);
 await runTransaction(db,async tx=>{
  const r=(await tx.get(ref)).data() as Room;
  if(r.closed||r.round!==round||r.answer)throw Error('Oferta caducada.');
  tx.update(ref,{answer:JSON.stringify(answer)});
 });
}
