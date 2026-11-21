import type Phaser from 'phaser';
import type {Game} from '../scenes/Game';
import {createHost,connectGuest} from './transport';

/** Manual SDP exchange for testing on a secure origin. No signalling service. */
export function setupRemoteTest(game:Phaser.Game){
 const panel=document.createElement('details');
 Object.assign(panel.style,{position:'fixed',top:'8px',right:'8px',zIndex:'100',padding:'8px',background:'#211221',color:'white',font:'14px monospace',maxWidth:'90vw'});
 panel.open=true;
 panel.addEventListener('keydown',event=>{if(panel.open)event.stopPropagation()});
 panel.addEventListener('keyup',event=>{if(panel.open)event.stopPropagation()});
 const title=document.createElement('summary');title.textContent='Conexión cooperativa';panel.append(title);
 const instructions=document.createElement('p');instructions.textContent='J1 crea la oferta. J2 la pega y crea la respuesta. J1 pega la respuesta y conecta.';panel.append(instructions);
 const input=document.createElement('textarea'),output=document.createElement('textarea');
 input.placeholder='Pegar oferta o respuesta';output.placeholder='Copiar para el compañero';output.readOnly=true;
 for(const box of [input,output]){box.rows=3;box.style.width='100%';panel.append(box)}
 output.onclick=()=>output.select();
 const message=document.createElement('p');
 function button(label:string,act:()=>Promise<void>){
  const b=document.createElement('button');b.textContent=label;
  b.onclick=async()=>{b.disabled=true;try{await act()}catch(error){message.textContent=String(error)}finally{b.disabled=false}};
  panel.append(b);
 }
 let host:ReturnType<typeof createHost>|undefined,pending:Awaited<ReturnType<ReturnType<typeof createHost>['offer']>>|undefined;
 let guest:Awaited<ReturnType<typeof connectGuest>>|undefined;
 button('Crear oferta',async()=>{
  if(!host){
   if(!game.scene.isActive('Menu'))throw Error('Espera al menú principal.');
   game.scene.stop('Menu');game.scene.start('Game',{continuous:true,coop:true});
   const scene=game.scene.getScene('Game') as Game;
   if(!scene.coop?.views)await new Promise<void>(resolve=>scene.events.once('create',resolve));
   host=createHost(scene);
  }
  pending=await host.offer();output.value=JSON.stringify({invitation:host.invitation,offer:pending.offer});
  message.textContent='Envía la oferta a J2.';
 });
 button('Crear respuesta',async()=>{
  const {invitation,offer}=JSON.parse(input.value);
  if(guest&&!guest.closed)throw Error('Ya hay una conexión abierta.');
  const previous=guest?.welcome,again=previous?.session===invitation.session;
  guest=await connectGuest(offer,again?{session:previous!.session,key:previous!.resume}:invitation,again,game);
  output.value=JSON.stringify(guest.answer);message.textContent='Envía la respuesta a J1. Luego cierra este panel para jugar.';
 });
 button('Conectar',async()=>{
  if(!pending)throw Error('Primero crea una oferta.');
  await pending.answer(JSON.parse(input.value));pending=undefined;panel.open=false;
 });
 panel.append(message);document.body.append(panel);
}
