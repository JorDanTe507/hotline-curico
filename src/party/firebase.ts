import {initializeApp} from 'firebase/app';
import {browserLocalPersistence,browserPopupRedirectResolver,connectAuthEmulator,initializeAuth} from 'firebase/auth';
import {connectFirestoreEmulator,initializeFirestore,memoryLocalCache} from 'firebase/firestore';

function initializeServices(){
 const emulated=import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATORS==='1' &&
  ['localhost','127.0.0.1'].includes(location.hostname);
 const config=emulated?{apiKey:'demo-emulator-only',authDomain:'demo-hotline-curico.firebaseapp.com',projectId:'demo-hotline-curico',appId:'demo-hotline-curico'}:{
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID
 };
 if(Object.values(config).some(value=>!value))throw Error('Cooperativo online pendiente de configuración de Firebase.');
 const app=initializeApp(config);
 const auth=initializeAuth(app,{persistence:browserLocalPersistence,popupRedirectResolver:browserPopupRedirectResolver});
 const db=initializeFirestore(app,{localCache:memoryLocalCache()});
 if(emulated){
  connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});
  connectFirestoreEmulator(db,'127.0.0.1',18473);
 }
 return {auth,db};
}

let services:ReturnType<typeof initializeServices>|undefined;
export function firebaseServices(){return services??=initializeServices()}
