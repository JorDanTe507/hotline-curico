import type {Upgrade} from '../systems/UpgradeCatalog';
const rows:[string,string,string,Upgrade['rarity'],number][]=[
 ['pulse','Pulso temporal','+0,25 s entre ejecuciones. Máximo 3,5 s.','common',4],
 ['breath','Segundo aliento','+2 puntos de curación por ejecución: 10% / 12% máximo.','rare',2],
 ['borrowed','Tiempo prestado','+1 s a Juicio Final. Dos niveles; máximo total 16 s.','rare',2],
 ['inevitable','Golpe inevitable','Golpe temporal al jefe: 25% de su vida máxima, una vez por activación.','epic',1],
 ['last','El último instante','Al terminar Juicio Final: protección temporal del 15% de vida máxima durante 5 s.','epic',1],
 ['eternal','Diez segundos eternos','+2 s a Juicio Final; máximo total 16 s.','legendary',1],
 ['paradox','Paradoja','Cinco ejecuciones: recupera 3 s una vez. No supera el máximo ni diez acciones.','legendary',1]
];
export const JORDAN_UPGRADES:Upgrade[]=rows.map(([key,name,description,rarity,maxLevel],i)=>({id:'jordan-'+key,name,description,rarity,maxLevel,characters:['jordan'],icon:'jordan-perk-'+i,currentLevel:c=>c.run.upgrades['jordan-'+key]??0,available:c=>c.abilityModule==='judgment'&&(c.run.upgrades['jordan-'+key]??0)<maxLevel,apply:()=>{}}));
