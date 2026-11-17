import type Phaser from 'phaser';
export const MODE_CARDS=[
 {id:'traditional',title:'MODO TRADICIONAL',description:'Sobrevive a las oleadas en las calles de Curicó. Consigue dinero, mejoras y llega lo más lejos posible.',tags:'SUPERVIVENCIA · PROGRESIÓN · RECOMPENSAS'},
 {id:'boss-rush',title:'BOSS RUSH',description:'Enfréntate a los jefes del juego en combates consecutivos. Campaña, práctica y continuación de tus rachas.',tags:'JEFES · RÉCORDS · RECOMPENSAS'},
 {id:'story',title:'HISTORIA',description:'La historia de Cervela, Nicolás y Jordan en una futura campaña narrativa ambientada en Curicó.',tags:'PRÓXIMAMENTE'},
] as const;
export const MENU_ITEMS=[
 {id:'modes',label:'MODOS DE JUEGO'}, {id:'upgrades',label:'MEJORAS'}, {id:'achievements',label:'LOGROS'},
 {id:'options',label:'OPCIONES'}, {id:'daily',label:'DESAFÍOS DIARIOS'},
 {id:'notes',label:'NOTAS DE ACTUALIZACIÓN'}, {id:'restricted',label:'ACCESO RESTRINGIDO'}, {id:'exit',label:'SALIR'},
] as const;
export type MenuAction=typeof MENU_ITEMS[number]['id'];
export function loadMenuArt(s:Phaser.Scene){s.load.image('menu-city-art','assets/menus/curico-night.png');s.load.image('mode-city-art','assets/menus/traditional.png')}
export const bossPortraits=[['torturado-portrait',undefined],...Array.from({length:4},(_,i)=>[`boss-${i+1}-portrait`,undefined]),['uroboros','human-portrait']] as [string,string|undefined][];

export const TRADITIONAL_CHOICES=[
 {id:'solo',label:'UN JUGADOR',description:'Sobrevive a las oleadas de Curicó por tu cuenta',coop:false},
 {id:'coop',label:'MULTIJUGADOR LOCAL',description:'Dos jugadores, una ciudad y ninguna garantía de supervivencia',coop:true},
] as const;
