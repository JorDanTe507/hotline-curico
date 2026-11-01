import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DIRECTIONAL_MANIFEST} from '../src/characters/directionalManifest';
import {facing} from '../src/characters/directional';
test('atlas direccionales: poses utilizables, índices válidos y respaldo explícito de muerte',()=>{for(const id of ['cervela','nicolas'] as const){const m=DIRECTIONAL_MANIFEST[id],png=readFileSync(`public/assets/v163/${id}-atlas.png`);assert.equal(png.readUInt32BE(16),1536);assert.equal(png[25],6,'RGBA');const capacity=png.readUInt32BE(20)/112*16;for(const pose of ['idle','walk','run','melee','hurt'] as const)for(const dir of ['up','down','left','right'] as const){const frames=m.poses[pose][dir];assert.ok(frames.length>=3,`${id}/${pose}/${dir}`);for(const frame of frames)assert.ok(frame>=0&&frame<capacity)}assert.equal(m.poses.dead.down.length,0)}assert.equal(DIRECTIONAL_MANIFEST.cervela.poses.dead.left.length,0);assert.equal(DIRECTIONAL_MANIFEST.nicolas.poses.dead.right.length,0)});
test('orientaciones independientes sin invertir perfiles',()=>{assert.equal(facing(0),'right');assert.equal(facing(Math.PI),'left');assert.equal(facing(Math.PI/2),'down');assert.equal(facing(-Math.PI/2),'up')});
