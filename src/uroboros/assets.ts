import type Phaser from 'phaser';

export const UROBOROS_ATLAS = 'uroboros';
export function loadUroboros(scene: Phaser.Scene) {
  scene.load.atlas(UROBOROS_ATLAS, 'assets/v203/uroboros.png', 'assets/v203/uroboros.json');
}

export function animateUroboros(scene: Phaser.Scene) {
  const keys = scene.textures.get(UROBOROS_ATLAS).getFrameNames();
  scene.anims.create({
    key:'uro-defeat',
    frames:[0,1,2,3].map(i=>({key:UROBOROS_ATLAS,frame:'defeat-'+i})),
    frameRate:9,
  });
  const groups = new Map<string, string[]>();
  for (const frame of keys) {
    if (!/^(human|mutant)-.+-\d+$/.test(frame)) continue;
    const name = frame.slice(0, frame.lastIndexOf('-'));
    const list = groups.get(name) ?? [];
    list.push(frame);
    groups.set(name, list);
  }
  for (const [name, frames] of groups) {
    scene.anims.create({
      key: 'uro-' + name,
      frames: frames.map(frame => ({key: UROBOROS_ATLAS, frame})),
      frameRate: name.includes('-idle-') ? 6 : 12,
      repeat: /-(idle|walk|run|dash)-/.test(name) ? -1 : 0,
    });
  }
}
