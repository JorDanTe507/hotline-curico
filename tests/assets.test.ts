import {readFileSync,existsSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WEAPONS} from '../src/weapons/arsenal';
test('integración visual conserva el equilibrio de las siete armas',()=>{
 assert.deepEqual(WEAPONS.slice(0,7).map(w=>[w.damage,w.mag,w.reserve,w.rate,w.range,w.spread,w.reload,w.pellets,!!w.explosive]),[
 [15,10,80,260,650,.035,1000,1,false],[35,6,36,520,750,.025,1500,1,false],
 [10,30,150,90,560,.12,1300,1,false],[12,6,36,750,420,.30,1800,6,false],
 [22,20,100,160,800,.055,1600,1,false],[85,5,25,1100,1200,.005,2200,1,false],
 [150,1,0,1500,1300,0,2500,1,true]]);
});
test('fotogramas preparados y Nicolás conservado',()=>{
 const m=JSON.parse(readFileSync('public/assets/asset-crops-v2.json','utf8'));
 assert.deepEqual(m.sourceSize,[1536,1024]);
 for(const [state,frames] of Object.entries(m.enemies))for(let i=0;i<(frames as unknown[]).length;i++)assert.ok(existsSync(`public/assets/enemies/maton/${state}-${i}.png`));
 assert.deepEqual(readFileSync('public/assets/enemies/nicolas/nicolas-original.png'),readFileSync('public/assets/enemies/maton.png'));
 for(let i=0;i<7;i++)assert.ok(existsSync(`public/assets/weapons/weapon-${i}.png`));
});
test('efectos locales PCM válidos y disparos diferenciados',()=>{
 const names=['pistol','revolver','smg','shotgun','assault','sniper','rpg','explosion','reload','pickup','hurt','kill','voice','dash','throw','execute','critical','ultimate'];
 const waves=names.map(n=>readFileSync(`public/assets/audio/${n}.wav`));
 for(const wav of waves){assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');assert.equal(wav.readUInt32LE(24),22050);assert.ok(wav.length>1000)}
 assert.equal(new Set(waves.map(w=>w.toString('base64'))).size,names.length);
});

test('El Torturado usa recortes individuales uniformemente acolchados y retratos separados',()=>{
 const manifest=JSON.parse(readFileSync('public/assets/bosses/torturado/crops.json','utf8'));
 assert.deepEqual(manifest.sourceSize,[1536,1024]);
 for(const [state,frames] of Object.entries(manifest.frames))for(let i=0;i<(frames as unknown[]).length;i++){
  const png=readFileSync(`public/assets/bosses/torturado/${state}-${i}.png`);
  assert.equal(png.readUInt32BE(16),144);assert.equal(png.readUInt32BE(20),144);
 }
 assert.ok(existsSync('public/assets/portraits/ultimate-special.png'));assert.ok(existsSync('public/assets/portraits/torturado-portrait.png'));
});
