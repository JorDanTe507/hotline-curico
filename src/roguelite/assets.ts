import type Phaser from 'phaser';
export function rogueliteAssets(s:Phaser.Scene){for(const name of ['cellular','piercing','fury','ghost','reload','survival','magnet','breath','explosive','lungs','smoke','smoker','titan','party','wall','sentence','time','verdict'])s.load.image('rogue-'+name,'assets/roguelite/'+name+'.png')}
