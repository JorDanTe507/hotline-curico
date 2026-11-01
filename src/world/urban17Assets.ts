import Phaser from 'phaser';
import {URBAN17} from './urban17Manifest';
export function loadUrban17(s:Phaser.Scene){for(const [key,asset] of Object.entries(URBAN17))s.load.image('v17-'+key,'assets/v17/'+asset.file)}

export function createWeatherTiles(s:Phaser.Scene){if(s.textures.exists('weather17-tiles'))return;const c=document.createElement('canvas');c.width=320;c.height=32;const ctx=c.getContext('2d')!;ctx.imageSmoothingEnabled=false;for(const [i,key] of ['weather-wet0','weather-wet1','weather-wet2','weather-sidewalk','warehouse-concrete','alley-floor','copec-pavement','alley-floor','alley-wall','warehouse-steel'].entries())ctx.drawImage(s.textures.get('v17-'+key).getSourceImage() as HTMLImageElement,i*32,0,32,32);s.textures.addCanvas('weather17-tiles',c)}
