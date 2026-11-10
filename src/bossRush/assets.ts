import type Phaser from 'phaser';
import {RUSH_TRACKS} from './config';

export function loadRushArt(scene: Phaser.Scene) {
  for(let i=0;i<15;i++)scene.load.image('rush-achievement-'+i,'assets/v210/achievements/'+i+'.png');
  scene.load.image('rush-main-art', 'assets/v210/main.png');
  scene.load.image('rush-menu-art', 'assets/v210/boss-rush.png');
  scene.load.atlas('rush-safe-actors', 'assets/v210/safe-actors.png', 'assets/v210/safe-actors.json');
  scene.load.atlas('rush-attack-polish','assets/v210/attacks-polish.png','assets/v210/attacks-polish.json');
  scene.load.atlas('rush-room-polish','assets/v210/rooms-polish.png','assets/v210/rooms-polish.json');
  scene.load.atlas('rush-rooms', 'assets/v210/rooms.png', 'assets/v210/rooms.json');
}

export function loadRushMusic(scene: Phaser.Scene) {
  for (const track of RUSH_TRACKS) {
    if (!scene.cache.audio.exists('music-rush-' + track)) {
      scene.load.audio('music-rush-' + track, 'assets/v210/' + track + '.mp3');
    }
  }
}
