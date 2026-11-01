import type Phaser from 'phaser';
import {DIRECTIONAL_MANIFEST} from './directionalManifest';
export type Facing='down'|'left'|'right'|'up';
export type VisualPose='idle'|'walk'|'run'|'melee'|'hurt'|'dead';
export const ACTOR_SCALE=.66;
export function facing(angle:number):Facing{if(Math.abs(Math.cos(angle))>Math.abs(Math.sin(angle)))return Math.cos(angle)<0?'left':'right';return Math.sin(angle)<0?'up':'down'}
export function directionalFrames(id:'cervela'|'nicolas',pose:VisualPose,dir:Facing):readonly number[]{return DIRECTIONAL_MANIFEST[id].poses[pose][dir]}
export function loadDirectional(s:Phaser.Scene){for(const id of ['cervela','nicolas'])s.load.spritesheet(`actor-${id}`,`assets/v163/${id}-atlas.png`,{frameWidth:96,frameHeight:112})}
export function animateDirectional(s:Phaser.Scene){for(const id of ['cervela','nicolas'] as const)for(const dir of ['down','left','right','up'] as const){const frames=directionalFrames(id,'dead',dir);if(frames.length&&!s.anims.exists(`actor-${id}-death-${dir}`))s.anims.create({key:`actor-${id}-death-${dir}`,frames:frames.map(frame=>({key:`actor-${id}`,frame})),frameRate:9,repeat:0})}}
