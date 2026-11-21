import type Phaser from 'phaser';
export function economyAssets(s:Phaser.Scene){for(const key of ['copper','silver','gold','special','pocket','magnet-perk','spark','pulse'])s.load.image('hc-'+key,'assets/economy/'+key+'.png')}
