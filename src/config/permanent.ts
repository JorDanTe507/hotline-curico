export const ECONOMY={key:'hotline-permanent-v1',version:1,baseCost:200,costStep:150,normalKill:5,bossKill:200,extermination:50,survival:75,milestone:100} as const;
export const PERMANENT={
 cervela:[['vitality','VITALIDAD','+10 HP máximos',10],['damage','BALAS REFORZADAS','+3% daño de fuego',8],['regeneration','PULMONES DE ACERO','+1 HP/s durante Calada',5],['damageReduction','SANGRE FRÍA','+2 puntos de resistencia en Calada',5],['dash','REFLEJOS','−3% enfriamiento normal del dash',6],['ultimateDuration','CALADA PROLONGADA','+0,5 s de Última Calada',4],['rerolls','SEGUNDA ELECCIÓN','+1 cambio de cartas por nivel',4]],
 nicolas:[['vitality','VITALIDAD','+10 HP máximos',10],['damage','FURIA','+4% daño de fuego',8],['overload','SOBRECARGA','+0,25 al multiplicador de HP',4],['adrenaline','ADRENALINA','+3 puntos de velocidad en Tryhard',5],['dash','REFLEJOS','−3% enfriamiento normal del dash',6],['ultimateDuration','TRYHARD PROLONGADO','+0,5 s iniciales (total máx. 14 s)',4],['rerolls','SEGUNDA ELECCIÓN','+1 cambio de cartas por nivel',4]],
 jordan:[['vitality','VITALIDAD','+10 HP máximos',10],['damage','PULSO FIRME','+3% daño de fuego',8],['executionHeal','SEGUNDO ALIENTO','+0,5% curación por ejecución (máx. 12%)',5],['chainTime','PULSO TEMPORAL','+0,1 s entre ejecuciones (máx. 3,5 s)',5],['dash','REFLEJOS','−3% enfriamiento normal del dash',6],['ultimateDuration','JUICIO PROLONGADO','+0,5 s de Juicio Final (máx. 16 s)',4],['rerolls','SEGUNDA ELECCIÓN','+1 cambio de cartas por nivel',4]]
} as const;
export type PermanentCharacter=keyof typeof PERMANENT;
export const upgradeCost=(level:number)=>ECONOMY.baseCost+level*ECONOMY.costStep;

/** Existing Jordan art reused by both shop layouts; no new assets. */
export const jordanPermanentIcons=['jordan-achievement-3','jordan-achievement-2','jordan-perk-1','jordan-perk-0','jordan-perk-0','jordan-perk-2'] as const;
