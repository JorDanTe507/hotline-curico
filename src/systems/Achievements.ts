import {developerSession} from './DeveloperSession';
export type AchievementRarity='common'|'uncommon'|'rare'|'epic'|'legendary';
export interface AchievementDefinition {id:string;name:string;description:string;rarity:AchievementRarity;icon:number;target:number;secret:boolean;available:boolean;condition:string;counted?:boolean}
const entries:[string,string,string,AchievementRarity,number,number?,boolean?,boolean?][]=[
 ['cervela','Un último cigarrito','Juega una partida con Cervela.','common',1],['nicolas','Tengo que hacer los jefes','Juega una partida con Nicolás.','common',2],['round','Bienvenido a Curicó','Completa una ronda.','common',9],['kill','El primer cadáver','Elimina un enemigo.','common',0],['pickup','Esto es mío','Recoge un arma.','common',4],['switch','Cambio de planes','Cambia de arma.','common',4],['execute','No era tan difícil','Realiza una ejecución.','common',5],['medkit','Un pequeño respiro','Utiliza un botiquín.','common',3],['level','Aprendiendo a sobrevivir','Sube de nivel.','common',9],['reroll','No me convencen','Cambia las cartas de mejora.','common',8],
 ['throw','¡Quítate de encima!','Elimina a un enemigo lanzándole un arma.','uncommon',5],['shotguns','A quemarropa','Elimina diez enemigos con escopetas en una partida.','uncommon',4,10],['clean-round','Sin despeinarme','Completa una ronda sin recibir daño.','uncommon',6],['purchase','Comprador compulsivo','Compra una mejora permanente.','uncommon',10],['calada','Última Calada','Activa la definitiva de Cervela.','uncommon',1],['tryhard','Modo Tryhard','Activa la definitiva de Nicolás.','uncommon',2],['aceite','Una ayudita, tío','Cúrate con Tío Aceite.','uncommon',3],['hundred','No es personal','Elimina cien enemigos acumulados.','uncommon',0,100],
 ['torturado','Cinco rondas de infierno','Derrota a El Torturado.','rare',0],['boss-no-med','¿Eso era todo?','Derrota a El Torturado sin usar botiquines en el combate.','rare',3],['dash','Bailando entre balas','Esquiva cincuenta ataques mediante dash en una partida.','rare',6,50],['arsenal','Arsenal ambulante','Utiliza diez armas diferentes en una partida.','rare',4,10],['survival','Sangre fría','Completa supervivencia sin usar la definitiva.','rare',8],['accuracy','Ni una bala desperdiciada','Elimina quince enemigos consecutivos sin fallar un disparo.','rare',8,15],['level15','Adicto a las mejoras','Alcanza el nivel quince en una partida.','rare',9,15],['reroll5','Una segunda opinión','Acumula cinco cambios de cartas con un personaje.','rare',8,5],
 ['round15','Curicó no tiene piedad','Alcanza la ronda quince.','epic',0,15],['commander','El Comandante ha caído','Derrota al jefe de ronda diez.','epic',9,1,false,false],['demolisher','Demolición controlada','Derrota al jefe de ronda quince.','epic',7,1,false,false],['no-armor','Sin chaleco, sin miedo','Completa cinco rondas seguidas sin recoger armadura.','epic',6,5],['calada30','Un hombre, dos armas','Elimina treinta enemigos durante una sola Última Calada.','epic',1,30],['tryhard15','No tengo tiempo','Elimina quince enemigos durante un solo Modo Tryhard.','epic',2,15],['clean-boss','Ni una gota de sangre','Derrota a un jefe sin recibir daño.','epic',0],['maxed','Coleccionista de pesadillas','Maximiza todas las mejoras permanentes de un personaje.','epic',10],
 ['round25','El último superviviente','Alcanza la ronda veinticinco en una partida.','legendary',9,25],['five-bosses','Rey de Curicó','Derrota a los cinco primeros jefes distintos en una partida.','legendary',9,5,false,false],['one-hp','Un hilo de vida','Completa una ronda terminando con exactamente 1 HP.','legendary',3,1,true],['melee-boss','A mano limpia','Derrota a El Torturado usando exclusivamente cuerpo a cuerpo.','legendary',5,1,true],['no-cards','Sin ventajas','Alcanza la ronda diez sin adquirir mejoras temporales.','legendary',11,10,true,false],['all','Hotline Curicó','Desbloquea todos los demás logros activos.','legendary',9],
 ['requiem-round','Salud para los vivos, Requiem para los muertos','Completa una ronda de combate utilizando exclusivamente la Requiem.','legendary',12]
];

entries.push(
 ['knife-boss','Golpe de gracia','Da el golpe final a un jefe con un cuchillo arrojadizo.','epic',20],
 ['throwable-boss','Arsenal ambulante','Derrota a un jefe causando todo el daño únicamente con arrojadizos.','legendary',21],
 ['copec-memory','Qué recuerdos…','Visita la Copec con Cervela.','common',22,1,true],
 ['coop','Compañeros de Curicó','Inicia una partida cooperativa local. No cuenta para el 100%.','common',23],
 ['radio-interrupt','Interrupción','Elimina al radioperador durante su llamada.','rare',24],
 ['radio-kill','Comunicación rota','Elimina un radioperador.','common',25],
 ['radio-use','Suministro en camino','Utiliza una radio de suministros.','uncommon',26],
 ['barrel-chain','Explosión de cadena','Detona dos barriles en una misma cadena.','rare',27],
 ['molotov-multi','Todo arde','Elimina tres enemigos con el fuego de un Molotov.','epic',28],
 ['flash-five','Ceguera masiva','Aturde a cinco enemigos con una cegadora.','rare',29],
 ['electric-five','Choque total','Afecta a cinco enemigos con una eléctrica.','rare',30],
 ['frag-kills','Fragmentos de Curicó','Elimina 25 enemigos con fragmentación.','rare',27,25],
 ['knife-kills','Acero silencioso','Elimina 25 enemigos con cuchillos arrojadizos.','rare',20,25],
 ['barrels','Daño colateral','Detona 20 barriles.','uncommon',27,20],
 ['daily','Al día','Completa un desafío diario.','common',33]
);
entries.push(['jordan-time','El tiempo es oro','Activa Juicio Final.','common',34],['jordan-known','Un viejo conocido','Completa una partida cooperativa local con Jordan y Cervela tras superar al menos la primera ronda.','common',23,1,true],['jordan-five','Uno menos...','Ejecuta cinco enemigos durante un Juicio Final.','uncommon',36,5],['jordan-heal','Segunda oportunidad','Recupera el 50% de tu vida máxima en un Juicio Final.','rare',37],['jordan-ten','A contrarreloj','Ejecuta diez enemigos durante un Juicio Final.','rare',38,10],['jordan-boss','Ni lo vio venir','Derrota a un jefe con el golpe temporal.','epic',39],['jordan-clean','Cuando el tiempo se detuvo','Diez ejecuciones en un Juicio Final sin recibir daño en esa ronda.','legendary',40,10],['jordan-rush','Doce segundos de eternidad','Dos jefes distintos durante un Juicio Final en Boss Rush. No disponible aún.','legendary',41,2,true,false]);
entries.find(e=>e[0]==='arsenal')![1]='Arsenal variado';
for(const id of ['five-bosses','commander','demolisher'])entries.find(e=>e[0]===id)![7]=true;

export const ACHIEVEMENTS:AchievementDefinition[]=entries.map(([id,name,description,rarity,icon,target=1,secret=false,available=true])=>({id,name,description,rarity,icon,target,secret,available,condition:description,counted:id!=='coop'&&id!=='jordan-known'}));
ACHIEVEMENTS.find(a=>a.id==='requiem-round')!.condition='Completa una ronda de combate entera empezando con Requiem equipada y atacando exclusivamente con ella.';
ACHIEVEMENTS.find(a=>a.id==='all')!.target=ACHIEVEMENTS.filter(a=>a.available&&a.counted!==false&&a.id!=='all').length;
export const ACHIEVEMENT_KEY='hotline-achievements-v1';
export type AchievementEvent={type:string;token?:object;hit?:boolean;character?:string;value?:number;weapon?:number;method?:string;roundType?:string;health?:number;ultimate?:boolean;maxed?:boolean;boss?:boolean;bossIndex?:number;round?:number};
interface Save {version:1;unlocked:Record<string,string>;progress:Record<string,number>;kills:number;rerolls:Record<string,number>}
interface StorageLike {getItem(key:string):string|null;setItem(key:string,value:string):void}
const integer=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(v))):0;
export function migrateAchievements(raw:unknown):Save {const data=raw as Partial<Save>|null,result:Save={version:1,unlocked:{},progress:{},kills:integer(data?.kills),rerolls:{cervela:integer(data?.rerolls?.cervela),nicolas:integer(data?.rerolls?.nicolas),jordan:integer(data?.rerolls?.jordan)}};for(const a of ACHIEVEMENTS){const date=data?.unlocked?.[a.id];if(typeof date==='string'&&Number.isFinite(Date.parse(date)))result.unlocked[a.id]=date;result.progress[a.id]=Math.min(a.target,integer(data?.progress?.[a.id]))}return result}
/** Event-driven service, independent of Phaser and the currency snapshot. */
export class AchievementService {
 private bossTypes=new Set<number>();private ultimates=new Map<string,number>();data:Save;persisted=true;readonly notifications:AchievementDefinition[]=[];private run?:{character:string;shotguns:number;dash:number;weapons:Set<number>;shots:{token:object;hit:boolean;resolved:boolean;kills:number}[];accuracy:number;noArmor:number;armor:boolean;roundDamage:boolean;roundUltimate:boolean;bossDamage:boolean;bossMed:boolean;bossMelee:boolean;ultimateKills:number;ultimateActive:boolean};
 constructor(private storage?:StorageLike,private disabled=()=>developerSession.active,private now=()=>new Date().toISOString()){let raw:unknown;try{raw=JSON.parse(storage?.getItem(ACHIEVEMENT_KEY)??'null')}catch{}this.data=migrateAchievements(raw)}
 private unlock(id:string){const a=ACHIEVEMENTS.find(a=>a.id===id);if(!a?.available||this.data.unlocked[id])return;this.data.unlocked[id]=this.now();this.data.progress[id]=a.target;this.notifications.push(a)}
 private progress(id:string,n:number){const a=ACHIEVEMENTS.find(a=>a.id===id)!;this.data.progress[id]=Math.max(this.data.progress[id]??0,Math.min(a.target,n));if(n>=a.target)this.unlock(id)}
 event(e:AchievementEvent){if(this.disabled())return false;const before=JSON.stringify(this.data),r=this.run;let changed=true;
  switch(e.type){
   case 'start':this.bossTypes.clear();this.ultimates.clear();this.run={character:e.character??'cervela',shotguns:0,dash:0,weapons:new Set(),shots:[],accuracy:0,noArmor:0,armor:false,roundDamage:false,roundUltimate:false,bossDamage:false,bossMed:false,bossMelee:true,ultimateKills:0,ultimateActive:false};if(e.character!=='jordan')this.unlock(e.character==='nicolas'?'nicolas':'cervela');break;
   case 'roundStart':if(r){r.roundDamage=false;r.roundUltimate=false;r.armor=false;r.bossDamage=false;r.bossMed=false;r.bossMelee=true;this.progress('round15',e.value??0);this.progress('round25',e.value??0)}break;
   case 'damage':if(r){r.roundDamage=true;r.bossDamage=true}changed=false;break;
   case 'bossHit':if(r&&e.method!=='melee')r.bossMelee=false;changed=false;break;
   case 'shotStart':if(r&&e.token)r.shots.push({token:e.token,hit:false,resolved:false,kills:0});changed=false;break;
   case 'shotEnd':if(r){const shot=r.shots.find(s=>s.token===e.token);if(shot){shot.resolved=true;shot.hit=e.hit===true}while(r.shots[0]?.resolved){const first=r.shots.shift()!;r.accuracy=first.hit?r.accuracy+first.kills:0;this.progress('accuracy',r.accuracy)}}break;
   case 'miss':if(r)r.accuracy=0;changed=false;break;
   case 'kill':if(r){this.unlock('kill');this.progress('hundred',++this.data.kills);if(e.method==='throw')this.unlock('throw');if([3,10].includes(e.weapon??-1))this.progress('shotguns',++r.shotguns);if(e.method==='shot'){if(e.token){const shot=r.shots.find(s=>s.token===e.token);if(shot)shot.kills++}else this.progress('accuracy',++r.accuracy)}else{r.accuracy=0;for(const shot of r.shots)shot.kills=0}if(e.ultimate&&r.ultimateActive&&e.character!=='jordan'){const character=e.character??r.character,n=(this.ultimates.get(character)??0)+1;this.ultimates.set(character,n);this.progress(character==='cervela'?'calada30':'tryhard15',n)}if(e.boss){if((e.bossIndex??0)===0){this.unlock('torturado');if(!r.bossMed)this.unlock('boss-no-med');if(r.bossMelee)this.unlock('melee-boss')}if(!r.bossDamage)this.unlock('clean-boss')}}break;
   case 'weapon':if(r&&e.weapon!==undefined){r.weapons.add(e.weapon);this.progress('arsenal',r.weapons.size)}break;
   case 'dash':if(r)this.progress('dash',++r.dash);break;
   case 'pickup':this.unlock('pickup');break;case 'switch':this.unlock('switch');break;case 'execute':this.unlock('execute');break;
   case 'armor':if(r){r.armor=true;r.noArmor=0}changed=false;break;
   case 'heal':if(e.method==='medkit'){this.unlock('medkit');if(r)r.bossMed=true}else if(e.method==='aceite')this.unlock('aceite');break;
   case 'level':this.unlock('level');this.progress('level15',e.value??0);break;
   case 'reroll':this.unlock('reroll');{const id=e.character??r?.character??'cervela';this.data.rerolls[id]=integer(this.data.rerolls[id])+1;this.progress('reroll5',this.data.rerolls[id])}break;
   case 'purchase':this.unlock('purchase');if(e.maxed)this.unlock('maxed');break;
   case 'ultimate':if(r){r.roundUltimate=true;r.ultimateKills=0;r.ultimateActive=true;this.ultimates.set(e.character??r.character,0);if((e.character??r.character)!=='jordan')this.unlock((e.character??r.character)==='cervela'?'calada':'tryhard')}break;
   case 'requiemRoundComplete':if(r)this.unlock('requiem-round');break;
   case 'roundComplete':if(r){this.unlock('round');if(!r.roundDamage)this.unlock('clean-round');if(e.roundType==='SUPERVIVENCIA'&&!r.roundUltimate)this.unlock('survival');r.noArmor=r.armor?0:r.noArmor+1;this.progress('no-armor',r.noArmor);if(e.health===1)this.unlock('one-hp')}break;
   default:{if(!e.type.startsWith('v19:'))return false;const type=e.type.slice(4);if(type==='jordan-activate')this.unlock('jordan-time');if(type==='jordan-known'&&e.character==='jordan'&&(e.value??0)>=1&&e.method==='cervela')this.unlock('jordan-known');if(type==='jordan-heal')this.unlock('jordan-heal');if(type==='jordan-boss')this.unlock('jordan-boss');if(type==='jordan-chain'){this.progress('jordan-five',e.value??0);this.progress('jordan-ten',e.value??0);}if(type==='jordan-clean-round')this.progress('jordan-clean',e.value??0);if(type==='jordan-rush')this.progress('jordan-rush',e.value??0);const map:Record<string,string>={'knife-boss':'knife-boss','throwable-boss':'throwable-boss',coop:'coop','radio-interrupt':'radio-interrupt','radio-kill':'radio-kill','radio-use':'radio-use','barrel-chain':'barrel-chain','molotov-multi':'molotov-multi','flash-five':'flash-five','electric-five':'electric-five',daily:'daily',barrel:'barrels','frag-kill':'frag-kills','knife-kill':'knife-kills'};if(type==='copec'&&e.character==='cervela')this.unlock('copec-memory');if(type==='boss'){this.bossTypes.add(e.value??0);this.progress('five-bosses',this.bossTypes.size);if(e.value===1)this.unlock('commander');if(e.value===2)this.unlock('demolisher')}if(map[type])this.progress(map[type],(this.data.progress[map[type]]??0)+(e.value??1));break}

  }
  const others=ACHIEVEMENTS.filter(a=>a.available&&a.counted!==false&&a.id!=='all');this.data.progress.all=others.filter(a=>this.data.unlocked[a.id]).length;if(others.every(a=>this.data.unlocked[a.id]))this.unlock('all');
  if(changed&&before!==JSON.stringify(this.data))try{if(this.storage)this.storage.setItem(ACHIEVEMENT_KEY,JSON.stringify(this.data));this.persisted=!!this.storage}catch{this.persisted=false}return true;
 }
 get available(){return ACHIEVEMENTS.filter(a=>a.available)}
 get completionDefinitions(){return this.available.filter(a=>a.counted!==false)}
 get completionObtained(){return this.completionDefinitions.filter(a=>this.data.unlocked[a.id]).length}
 get obtained(){return this.available.filter(a=>this.data.unlocked[a.id]).length}
}
let shared:AchievementService|undefined;
export function achievements(){if(!shared){let storage:StorageLike|undefined;try{storage=globalThis.localStorage}catch{}shared=new AchievementService(storage)}return shared}
