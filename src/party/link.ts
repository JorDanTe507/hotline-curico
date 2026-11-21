import type Phaser from 'phaser';
import type {Firestore} from 'firebase/firestore';
import type {Game} from '../scenes/Game';
import {createHost,connectGuest} from '../network/transport';
import {closeParty,publishAnswer,publishOffer,type Room} from './store';

/** One complete SDP pair per generation, including gathered ICE candidates. */
export class PartyLink{
 private host?:ReturnType<typeof createHost>;
 private guest?:Awaited<ReturnType<typeof connectGuest>>;
 private pending?:Awaited<ReturnType<ReturnType<typeof createHost>['offer']>>;
 private round=-1;
 private busy=false;
 private stopped=false;
 constructor(private game:Phaser.Game,private db:Firestore,private code:string,readonly owner:boolean){}
 get connected(){return this.owner?!!this.host?.connected:!!this.guest?.welcome&&!this.guest.closed}
 async sync(r:Room){
  if(this.stopped||this.busy||!r.guest||r.closed)return;
  this.busy=true;
  try{
   if(this.owner){
    if(!this.host){
     if(!this.game.scene.isActive('Menu'))throw Error('Vuelve al menú para iniciar la party.');
     if(r.round>0)throw Error('El anfitrión anterior terminó. Cierra esta sala y crea otra.');
     this.game.scene.stop('Menu');this.game.scene.start('Game',{continuous:true,coop:true});
     const scene=this.game.scene.getScene('Game') as Game;
     if(!scene.coop?.views)await new Promise<void>(resolve=>scene.events.once('create',resolve));
     if(this.stopped)return;
     this.host=createHost(scene);
     scene.events.once('shutdown',()=>{
      if(!this.stopped)void closeParty(this.db,this.code,r.host).catch(()=>{/* Offline rooms expire with the host lease. */});
     });
    }
    if(this.host.available){
     const pending=await this.host.offer();if(this.stopped)return;
     await publishOffer(this.db,this.code,r.round,pending.offer,JSON.stringify(this.host.memberCredentials));
     this.round=r.round+1;this.pending=pending;
    }else if(this.pending&&r.round===this.round&&r.answer){
     const pending=this.pending;this.pending=undefined;
     await pending.answer(JSON.parse(r.answer));
    }
   }else if(r.round>this.round&&r.offer&&r.joinKey&&!r.answer){
    this.round=r.round;this.guest?.close();
    const credentials=JSON.parse(r.joinKey);
    const guest=await connectGuest(JSON.parse(r.offer),{session:credentials.session,key:credentials.key},credentials.rejoining,this.game);
    if(this.stopped){guest.close();return}
    this.guest=guest;
    try{await publishAnswer(this.db,this.code,r.round,guest.answer)}catch(e){guest.close();throw e}
   }
  }finally{this.busy=false}
 }
 stop(guestLeft=false){
  this.stopped=true;
  if(guestLeft&&this.host)(this.game.scene.getScene('Game') as Game).coop?.remoteLeft();
  this.host?.stop();this.guest?.close();
 }
}
