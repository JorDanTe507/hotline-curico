// Relay credentials come from the project's authenticated, credential broker.
export async function createPeer(publicLobby=false){
 const servers:RTCIceServer[]=[];
 const stun=import.meta.env.VITE_WEBRTC_STUN_URL||(publicLobby?'stun:stun.l.google.com:19302':'');
 if(/^stuns?:/.test(stun))servers.push({urls:stun});
 const endpoint=import.meta.env.VITE_WEBRTC_TURN_ENDPOINT;
 if(endpoint){
  const url=new URL(endpoint,location.origin);
  if(url.protocol!=='https:')throw Error('El servicio TURN requiere HTTPS.');
  const {getAuth}=await import('firebase/auth');
  const user=getAuth().currentUser;
  if(!user)throw Error('Inicia sesión para solicitar acceso TURN.');
  const response=await fetch(url,{headers:{Authorization:'Bearer '+await user.getIdToken()},redirect:'error',cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('El servicio TURN rechazó la solicitud.');
  const data=await response.json();
  if(!Array.isArray(data.urls)||!data.urls.length||!data.urls.every((u:unknown)=>typeof u==='string'&&/^turns?:/.test(u))||
   typeof data.username!=='string'||typeof data.credential!=='string'||!Number.isFinite(data.expiresAt)||
   data.expiresAt<=Date.now()||data.expiresAt>Date.now()+3600000)throw Error('Credenciales TURN temporales inválidas.');
  servers.push({urls:data.urls,username:data.username,credential:data.credential});
 }
 return new RTCPeerConnection({iceServers:servers});
}
