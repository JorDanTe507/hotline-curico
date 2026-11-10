export const RUSH_ACHIEVEMENTS = [
  ['br_first_blood','Bienvenido al infierno','Derrota al primer jefe en Boss Rush.','Bronce',1],
  ['br_campaign_clear','Seis pies bajo tierra','Completa los seis encuentros de la campaña Boss Rush.','Plata',1],
  ['br_campaign_no_falls','Contra todo pronóstico','Completa la campaña Boss Rush sin caídas.','Oro',1],
  ['br_endless_5','Esto recién comienza','Supera 5 combates infinitos en una racha.','Bronce',5],
  ['br_endless_10','No me van a parar','Supera 10 combates infinitos en una racha.','Plata',10],
  ['br_endless_25','La pesadilla continúa','Supera 25 combates infinitos en una racha.','Oro',25],
  ['br_endless_50','Leyenda de Curicó','Supera 50 combates infinitos en una racha.','Oro',50],
  ['br_endless_100','La muerte pidió vacaciones','Supera 100 combates infinitos en una racha.','Platino',100],
  ['br_no_damage','Ni un rasguño','Vence un encuentro sin recibir daño.','Oro',1],
  ['br_double_clear','Dos contra uno','Supera un encuentro doble sin caídas.','Plata',1],
  ['br_sniper_dodge','Fallaste, francotirador','Derrota a El Verdugo sin impactos de su rifle.','Plata',1],
  ['br_wesker_no_cure','No necesito tu cura','Derrota a Wesker sin usar curas Uroboros.','Oro',1],
  ['br_three_clean','Tres rondas, cero errores','Gana tres combates infinitos seguidos sin caídas ni botiquines.','Oro',3],
  ['br_all_characters','Los tres de Curicó','Completa la campaña con Cervela, Nicolás y Jordan.','Oro',3],
  ['br_master','Dueños del infierno','Desbloquea los otros 14 logros Boss Rush.','Platino',14],
] as const;
export const rushIcon=(index:number)=>'rush-achievement-'+index;
