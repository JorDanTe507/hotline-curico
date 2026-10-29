export type WeaponKind='firearm'|'grenade'|'flame'|'melee';
export interface Weapon {name:string;damage:number;mag:number;reserve:number;rate:number;range:number;spread:number;reload:number;pellets:number;explosive?:boolean;kind?:WeaponKind;minInterval?:number;width?:number;stunChance?:number;rarity?:'common'|'rare'|'epic'|'legendary'}
export const WEAPONS:Weapon[]=[
{name:'Pistola',damage:15,mag:10,reserve:80,rate:260,range:650,spread:.035,reload:1000,pellets:1},
{name:'Revólver',damage:35,mag:6,reserve:36,rate:520,range:750,spread:.025,reload:1500,pellets:1},
{name:'Subfusil',damage:10,mag:30,reserve:150,rate:90,range:560,spread:.12,reload:1300,pellets:1},
{name:'Escopeta',damage:12,mag:6,reserve:36,rate:750,range:420,spread:.30,reload:1800,pellets:6},
{name:'Rifle de asalto',damage:22,mag:20,reserve:100,rate:160,range:800,spread:.055,reload:1600,pellets:1},
{name:'Rifle de precisión',damage:85,mag:5,reserve:25,rate:1100,range:1200,spread:.005,reload:2200,pellets:1},
{name:'RPG',damage:150,mag:1,reserve:0,rate:1500,range:1300,spread:0,reload:2500,pellets:1,explosive:true},
{name:'MINIGUN «LA BARREDORA»',damage:12,mag:200,reserve:400,rate:50,range:850,spread:.08,reload:4000,pellets:1},
{name:'Mini Uzi',damage:8,mag:30,reserve:150,rate:70,range:500,spread:.17,reload:1400,pellets:1,minInterval:50,width:32,rarity:'common'},
{name:'Revólver Magnum',damage:45,mag:6,reserve:36,rate:650,range:850,spread:.018,reload:1800,pellets:1,minInterval:400,width:30,rarity:'rare'},
{name:'Escopeta recortada',damage:10,mag:2,reserve:24,rate:850,range:280,spread:.43,reload:2100,pellets:7,minInterval:500,width:38,rarity:'rare'},
{name:'Lanzagranadas M79',damage:90,mag:1,reserve:12,rate:1400,range:620,spread:.015,reload:2600,pellets:1,explosive:true,kind:'grenade',minInterval:900,width:42,rarity:'epic'},
{name:'Lanzallamas',damage:6,mag:100,reserve:200,rate:100,range:190,spread:.10,reload:2300,pellets:1,kind:'flame',minInterval:75,width:48,rarity:'epic'},
{name:'Bate de béisbol',damage:25,mag:0,reserve:0,rate:500,range:66,spread:0,reload:0,pellets:0,kind:'melee',minInterval:350,width:38,stunChance:.3,rarity:'common'},
{name:'Palanca',damage:30,mag:0,reserve:0,rate:560,range:78,spread:0,reload:0,pellets:0,kind:'melee',minInterval:380,width:40,rarity:'common'},
{name:'Hacha de bombero',damage:55,mag:0,reserve:0,rate:900,range:64,spread:0,reload:0,pellets:0,kind:'melee',minInterval:600,width:44,rarity:'rare'}];
export const weaponKind=(id:number)=>WEAPONS[id].kind??'firearm';
export const isMelee=(id:number)=>weaponKind(id)==='melee';
export const weaponWidth=(id:number)=>WEAPONS[id].width??[24,26,38,45,44,48,47,52][id]??40;
export const isLegendary=(id:number)=>id===6||id===7;
export interface Gun {reserveBonusApplied?:boolean;id:number;ammo:number;reserve:number;instanceId?:string}
export const gun=(id:number,capacity=WEAPONS[id].mag):Gun=>({id,ammo:capacity,reserve:WEAPONS[id].reserve});
export function reload(g:Gun,capacity=WEAPONS[g.id].mag){if(isMelee(g.id))return 0;const n=Math.max(0,Math.min(capacity-g.ammo,g.reserve));g.ammo+=n;g.reserve-=n;return n}
