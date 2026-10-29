export interface EnemyDefinition {name:string;hp:number;damage:number;speed:number;ranged:boolean;color:number;design:number;weapon?:number;pickup:boolean;range:number;cadence:number;detection:number;aggression:number;weight:number;round:number;behavior:'normal'|'dog'|'flame'|'medic'|'sniper'|'shield'|'athlete'|'tank'}
const enemy=(name:string,hp:number,damage:number,speed:number,design:number,weapon:number|undefined,pickup:boolean,round=1,behavior:EnemyDefinition['behavior']='normal',range=650,cadence=1100,weight=10):EnemyDefinition=>({name,hp,damage,speed,design,weapon,pickup,round,behavior,range:weapon===undefined?65:range,cadence,detection:behavior==='sniper'?1100:850,aggression:behavior==='athlete'?1.2:1,weight,ranged:weapon!==undefined,color:0xffffff});
export const ENEMIES=[
 enemy('Matón básico',35,8,105,0,undefined,true),enemy('Matón con pistola',55,12,85,4,0,true,2),enemy('Matón con subfusil',100,15,90,2,2,true,3),enemy('Matón blindado',160,20,65,7,0,false,5,'shield'),enemy('Matón de élite',220,25,120,14,4,true,8),
 enemy('Matón con escopeta',80,14,80,1,3,true,3,'normal',420,1400),enemy('Matón con rifle',110,16,82,3,4,true,5),enemy('Matón con cuchillo',45,14,140,5,undefined,false,3),enemy('Matón con bate',70,19,100,6,13,false,4,'normal',82,1250),enemy('Matón corpulento',210,26,62,8,undefined,true,6,'tank'),enemy('Matón con lentes',90,15,115,9,9,true,4,'normal',600,1000),enemy('Matón atlético',60,11,165,10,0,true,4,'athlete'),
 enemy('Encuentro: Incendiario',320,6,70,11,12,false,6,'flame',175,150,0),enemy('Francotirador',70,35,65,12,5,false,7,'sniper',950,2000,4),enemy('Médico enemigo',65,8,85,13,0,true,6,'medic',550,1400,4),enemy('Perro de ataque',38,15,145,15,undefined,false,4,'dog',70,2400,6)
];
export const waveCount=(round:number)=>4+Math.floor(round*1.7);
export function enemyTier(round:number,random:number){const pool=ENEMIES.map((e,i)=>({e,i})).filter(({e})=>e.round<=round&&e.weight>0);let ticket=Math.max(0,Math.min(.999999999,random))*pool.reduce((n,{e})=>n+e.weight,0);for(const {e,i} of pool){ticket-=e.weight;if(ticket<0)return i}return 0}
export const enemyAnimation=(tier:number,state:string)=>`enemy-${ENEMIES[tier].design}-${state}`;

export const SPECIAL_ENCOUNTER={minRound:6,chance:.08,maxAlive:1};
