import {MobileUI} from './mobile/MobileUI';
import {loadUrban,createUrban} from './maps/urbanAssets';
import {achievements} from './systems/Achievements';
import {developerSession} from './systems/DeveloperSession';
import {permanentProgress} from './systems/PermanentProgress';
import {Achievements,AchievementToast} from './scenes/Achievements';
import {Restricted} from './scenes/Restricted';
import {ReleaseNotes} from './scenes/ReleaseNotes';
import {loadExpansion,createExpansion} from './enemies/expansionAssets';
import {createStreetTiles} from './world/Streets';
import {inputHub} from './input/InputHub';
import {Upgrades} from './scenes/Upgrades';
import {CharacterSelect} from './scenes/CharacterSelect';
import {loadCharacters,createCharacterAnimations,createSelectionPortraits} from './characters/assets';
import {loadEnvironment} from './maps/MapVisuals';
import {loadTorturado,animateTorturado} from './bosses/torturadoAssets';
import {MusicManager} from './systems/MusicManager';
import {AudioSystem} from './systems/AudioSystem';
import {loadMaton,createMatonAnimations} from './enemies/maton';
import Phaser from 'phaser';
import {Menu,Controls,Intro} from './scenes/Menu';
import {Game} from './scenes/Game';
class Boot extends Phaser.Scene{constructor(){super('Boot')}preload(){loadUrban(this);loadExpansion(this);this.load.image('street-source','assets/world/streets-v13.png');this.load.image('upgrade-atlas','assets/upgrades/atlas.png');loadCharacters(this);loadEnvironment(this);for(const n of ['idle','back','side','walk1','walk2','shoot','reload','hurt','dead'])this.load.image(n,`assets/characters/cervela-${n}.png`);this.load.image('portrait','assets/portraits/cervela.png');for(let i=0;i<3;i++)this.load.image(`wounded-${i}`,`assets/portraits/wounded/portrait-${i}.png`);loadMaton(this);loadTorturado(this);for(let i=0;i<16;i++)this.load.image(`weapon-${i}`,`assets/weapons/weapon-${i}.png`);for(const n of ['pickup','hud','spin-0','spin-1','fire-0','fire-1','flash','casing'])this.load.image(`minigun-${n}`,`assets/weapons/minigun/${n}.png`);for(let id=8;id<16;id++)for(const role of ['pickup','hud','fire-0','fire-1'])this.load.image(`weapon-${id}-${role}`,`assets/weapons/second/${id}-${role}.png`);for(const n of ['flame-0','flame-1','grenade'])this.load.image(n,`assets/weapons/second/${n}.png`);this.load.image('medkit','assets/weapons/medkit.png');this.load.image('ammo','assets/weapons/ammo.png');this.load.image('armor','assets/items/armor.png');AudioSystem.init();AudioSystem.preload(this);MusicManager.preload(this);this.load.image('menu-background','assets/backgrounds/menu.png')}create(){this.registry.set('achievements',achievements());this.registry.set('developerSession',developerSession);this.registry.set('permanentProgress',permanentProgress);createUrban(this);this.scene.launch('AchievementToast');createExpansion(this);createStreetTiles(this);this.registry.set('inputHub',inputHub(this.game));this.registry.set('mobile',new MobileUI(this.game,inputHub(this.game)));createSelectionPortraits(this);createCharacterAnimations(this);createMatonAnimations(this);animateTorturado(this);this.scene.start('Menu')}}
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1280,height:720,pixelArt:true,backgroundColor:'#080612',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{gamepad:true,activePointers:4},physics:{default:'arcade',arcade:{debug:false}},scene:[Boot,Menu,Upgrades,Controls,Restricted,ReleaseNotes,Achievements,CharacterSelect,Intro,Game,AchievementToast]});

if(import.meta.env.DEV) Object.assign(window,{hotlineGame:game});

