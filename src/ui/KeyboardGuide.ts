import type Phaser from 'phaser';
import {archivePanel} from './MenuSkin';
/** A presentation of the existing bindings, not a second input map. */
export const KEYBOARD_GROUPS=[
 ['MOVIMIENTO',[['WASD','Movimiento'],['ESPACIO','Dash · WASD / última dirección']]],
 ['COMBATE',[['RATÓN','Apuntar'],['CLIC IZQ.','Disparar'],['R','Recargar'],['Q','Cambiar arma'],['E','Recoger / sustituir arma activa']]],
 ['HABILIDADES',[['X','Habilidad del protagonista'],['V','Ejecutar enemigo aturdido']]],
 ['CONSUMIBLES',[['F','Botiquín (+40)'],['H','Adrenalina']]],
 ['ARROJADIZOS',[['B / DER.','Mantener / soltar arrojadizo'],['C','Cambiar arrojadizo'],['E','Recuperar cuchillo'],['G','Lanzar arma']]],
 ['SISTEMA',[['ESC','Pausa']]],
] as const;
export function keyboardGuide(s:Phaser.Scene){for(const [i,[name,rows]]of KEYBOARD_GROUPS.entries()){const x=42+i%2*371,y=157+Math.floor(i/2)*166;archivePanel(s,x,y,353,154);s.add.text(x+14,y+12,name,{fontFamily:'"Press Start 2P",monospace',fontSize:11,color:'#ff75b3'});rows.forEach(([key,action],j)=>{const yy=y+40+j*22;s.add.rectangle(x+53,yy+8,85,20,0x34263f).setStrokeStyle(1,0x796078);s.add.text(x+53,yy+8,key,{fontFamily:'monospace',fontSize:12,color:'#a0f3f0'}).setOrigin(.5);s.add.text(x+104,yy,action,{fontFamily:'monospace',fontSize:12,color:'#e2d3e9',wordWrap:{width:240}})})}}
