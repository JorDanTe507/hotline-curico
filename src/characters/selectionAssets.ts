import type Phaser from 'phaser';
import {CHARACTERS} from './catalog';
export function loadSelectionDossier(s:Phaser.Scene){
 for(const c of CHARACTERS){
  for(const suffix of ['', '-thumb',...Array.from({length:6},(_,i)=>'-entry-'+i)])
   s.load.image('dossier-'+c.id+suffix,'assets/selection-dossier/'+c.id+suffix+'.png');
 }
}
/** Wait before painting canvas text, so browser and canvas use the same bundled typeface. */
export async function loadSelectionFont(){
 try{const face=new FontFace('Press Start 2P',`url(${import.meta.env.BASE_URL}assets/fonts/PressStart2P-Regular.ttf)`);(document.fonts as FontFaceSet&{add(face:FontFace):void}).add(await face.load())}
 catch{ /* System monospace remains a readable offline fallback. */ }
}
