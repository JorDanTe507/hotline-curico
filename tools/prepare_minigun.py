"""Normalize generated minigun art to individual transparent 32x32 game frames.
Reference: user weapon atlas; generated source preserved locally. No sheet loaded by Phaser.
"""
from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parents[1];out=root/'public/assets/weapons/minigun';out.mkdir(exist_ok=True)
# source.png is the generated transparent master, included with the project.
im=Image.open(out/'source.png').convert('RGBA');box=im.getbbox();im=im.crop(box);im.thumbnail((32,24),Image.Resampling.NEAREST)
base=Image.new('RGBA',(32,32));base.alpha_composite(im,((32-im.width)//2,(32-im.height)//2));base.save(out.parent/'weapon-7.png')
for name in ('pickup','hud'):base.save(out/(name+'.png'))
for state in ('spin','fire'):
 for i in range(2):
  frame=base.copy();d=ImageDraw.Draw(frame)
  for y in range(11+i,21,4):d.line((18,y,29,y),fill=(89,217,233,255) if state=='spin' else (245,191,91,255))
  frame.save(out/f'{state}-{i}.png')
flash=Image.new('RGBA',(32,32));d=ImageDraw.Draw(flash);d.polygon([(0,14),(9,11),(5,4),(17,10),(27,6),(23,14),(32,16),(22,19),(26,27),(14,22),(6,27),(9,19),(0,18)],fill='#ff8730');d.polygon([(2,16),(17,12),(27,16),(17,20)],fill='#fff5a4');flash.save(out/'flash.png')
case=Image.new('RGBA',(8,4));d=ImageDraw.Draw(case);d.rectangle((0,1,6,3),fill='#b87532');d.line((0,1,5,1),fill='#ffe797');case.save(out/'casing.png')
(out/'provenance.json').write_text(json.dumps({'reference':'Atlas neón de armas pixel art.png (user supplied)','method':'Built-in imagegen, single transparent minigun; normalized to 32x32 with Pillow nearest-neighbor. Barrel highlights are separate animation frames.','prompt':'Use case: stylized-concept. Asset type: single game weapon sprite for Hotline Curicó. Input image is STYLE REFERENCE ONLY. Create ONE isolated side-view six-barrel rotary MINIGUN pointing right, dark gunmetal with steel highlights, small cyan reflections and magenta rim pixels, rear grip and ammunition drum. Crisp authentic low-resolution pixel art, readable silhouette when reduced to 32x32, centered with generous transparent margin. Match the reference's weapon style but unmistakably a heavy multi-barrel minigun, not an Uzi. True transparent background. No text, no cards, no borders, no characters, no muzzle flash, no floor, no checkerboard. One weapon only.','sourceSize':Image.open(out/'source.png').size,'frames':['pickup','hud','spin-0','spin-1','fire-0','fire-1','flash','casing']},ensure_ascii=False,indent=2),encoding='utf-8')
print('minigun frames created; source alpha range:',Image.open(out/'source.png').getchannel('A').getextrema())
