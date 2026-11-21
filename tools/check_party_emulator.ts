import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInWithCredential,GoogleAuthProvider,signOut} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,getDocFromServer,getDocs,collection,updateDoc,terminate,doc,setDoc,writeBatch,Timestamp} from 'firebase/firestore';
import {createParty,joinParty,closeParty,publishOffer,publishAnswer,roomRef} from '../src/party/store';

async function main(){
 const users=[];
 for(const label of ['host','guest','third']){
  const app=initializeApp({apiKey:'demo-key',projectId:'demo-hotline-curico'},randomUUID());
  const auth=getAuth(app),db=getFirestore(app);
  connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',18473);
  const credential=GoogleAuthProvider.credential(JSON.stringify({sub:randomUUID(),email:randomUUID()+'@example.test',name:label}));
  const {user}=await signInWithCredential(auth,credential);users.push({app,auth,db,user,credential});
 }
 const [h,g,t]=users;
 try{
  const code=await createParty(h.db,h.user),ref=roomRef(h.db,code);
  await assert.rejects(joinParty(h.db,h.user,code));
  await assert.rejects(joinParty(t.db,t.user,'bad'));
  await assert.rejects(getDocFromServer(roomRef(t.db,code)));
  await assert.rejects(getDocs(collection(t.db,'parties')));
  assert.equal(await joinParty(g.db,g.user,code),code);
  await assert.rejects(joinParty(t.db,t.user,code));
  await assert.rejects(updateDoc(roomRef(t.db,code),{host:t.user.uid}));
  await assert.rejects(publishOffer(g.db,code,0,{type:'offer',sdp:'test'},'test'));
  await publishOffer(h.db,code,0,{type:'offer',sdp:'test'},'test');
  await publishAnswer(g.db,code,1,{type:'answer',sdp:'test'});
  await assert.rejects(publishAnswer(g.db,code,1,{type:'answer',sdp:'duplicate'}));
  await signOut(g.auth);await assert.rejects(getDocFromServer(roomRef(g.db,code)));
  const again=await signInWithCredential(g.auth,g.credential);
  assert.equal(again.user.uid,g.user.uid);assert.equal(await joinParty(g.db,again.user,code),code);
  await closeParty(g.db,code,g.user.uid);const closed=(await getDocFromServer(ref)).data()!;
  assert(closed.closed&&!closed.offer&&!closed.joinKey&&!closed.answer);
  await assert.rejects(joinParty(t.db,t.user,code));await assert.rejects(updateDoc(ref,{closed:false}));
  const fresh=await createParty(h.db,h.user);
  // Backdate only this emulator fixture via the emulator admin REST interface.
  const url='http://127.0.0.1:18473/v1/projects/demo-hotline-curico/databases/(default)/documents/parties/'+fresh;
  const expired=await fetch(url+'?updateMask.fieldPaths=expiresAt',{method:'PATCH',headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:JSON.stringify({fields:{expiresAt:{timestampValue:new Date(0).toISOString()}}})});
  assert(expired.ok);await assert.rejects(joinParty(t.db,t.user,fresh));
  assert((await fetch(url,{method:'DELETE',headers:{Authorization:'Bearer owner'}})).ok);
  await assert.rejects(setDoc(roomRef(h.db,fresh),{...closed,closed:false}));
  const b=writeBatch(h.db);b.set(doc(h.db,'partyCodes',fresh),{reserved:true});b.set(roomRef(h.db,fresh),{...closed,closed:false,expiresAt:Timestamp.now()});await assert.rejects(b.commit());
  console.log('PASS Firebase Emulator Suite: autenticación, plazas, reglas, señales, expiración, abandono, identidad y códigos retirados');
 }finally{for(const p of users){await terminate(p.db);await deleteApp(p.app)}}
}
main().catch(e=>{console.error(e);process.exitCode=1});
