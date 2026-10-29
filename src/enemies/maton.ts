import {ENEMIES,enemyAnimation} from './config';
import Phaser from 'phaser';
export const MATON_STATES={idle:5,down:5,up:6,right:5,left:5,attack:5,hurt:5,dead:5};
export function loadMaton(scene:Phaser.Scene){for(const [state,count] of Object.entries(MATON_STATES))for(let i=0;i<count;i++)scene.load.image(`maton-${state}-${i}`,`assets/enemies/maton/${state}-${i}.png`)}
export function createMatonAnimations(scene:Phaser.Scene){for(const [state,count] of Object.entries(MATON_STATES)){const key=`maton-${state}`;if(!scene.anims.exists(key))scene.anims.create({key,frames:Array.from({length:count},(_,i)=>({key:`maton-${state}-${i}`})),frameRate:state==='idle'?5:state==='dead'?8:10,repeat:['attack','hurt','dead'].includes(state)?0:-1})}}
export function animateMaton(sprite:Phaser.Physics.Arcade.Sprite){const current=sprite.anims.currentAnim?.key;if(sprite.anims.isPlaying&&['maton-attack','maton-hurt','maton-dead'].includes(current??''))return;const v=sprite.body!.velocity;const state=v.length()<4?'idle':Math.abs(v.x)>Math.abs(v.y)?v.x>0?'right':'left':v.y>0?'down':'up';sprite.play(`maton-${state}`,true)}

export function animateEnemy(sprite:Phaser.Physics.Arcade.Sprite,tier:number){const anim=sprite.anims.currentAnim?.key;if(sprite.anims.isPlaying&&[enemyAnimation(tier,"attack"),enemyAnimation(tier,"hurt")].includes(anim??""))return;const v=sprite.body!.velocity;sprite.setFlipX(v.x<0).play(enemyAnimation(tier,v.length()<4?"idle":"walk"),true)}
