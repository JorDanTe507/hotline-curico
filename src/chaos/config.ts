export const THROWABLES=[
 {name:'GRANADA DE FRAGMENTACIÓN',capacity:3,range:480,speed:620,radius:145,damage:100,color:0xc2e86b},
 {name:'CÓCTEL MOLOTOV',capacity:2,range:380,speed:680,radius:95,damage:0,color:0xff8f31},
 {name:'GRANADA CEGADORA',capacity:2,range:420,speed:620,radius:180,damage:0,color:0xffdb68},
 {name:'GRANADA ELÉCTRICA',capacity:2,range:400,speed:620,radius:155,damage:12,color:0x63dcff},
 {name:'CUCHILLO ARROJADIZO',capacity:4,range:650,speed:1350,radius:0,damage:40,color:0xe3d5ec}
] as const;
export const CHAOS={fireDuration:6000,rainFireFactor:.55,fireRadius:95,burnDuration:1500,burnDamage:2,bossBurnDamage:1,flashDuration:3200,electricInterrupt:220,electricDuration:2600,electricSpeed:.55,bossSpeed:.85,bossControl:600,bossRecovery:4000,fragFragments:4,fragmentRange:145,fragmentDamage:18,fragmentRadius:48,playerDamage:.35,castNormalCap:120,castBossCap:65,castPlayerCap:42,barrelChance:.22,barrelDamage:110,barrelRadius:170,barrelChainBossCap:110,maxProjectiles:48,maxFire:8,maxEffects:64,throwCooldown:220,crateChance:.12,safeChance:.18,specialChance:.14,sceneChance:.14} as const;
export const throwableValid=(id:number)=>Number.isInteger(id)&&id>=0&&id<THROWABLES.length;
