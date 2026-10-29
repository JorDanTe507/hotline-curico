"""Validate prepared environment assets without changing any image files. Requires Pillow."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]/'public/assets/maps'
manifest=json.loads((root/'crops.json').read_text(encoding='utf-8'))
for tile in manifest['tiles']:
 im=Image.open(root/f"floor-{tile['name']}.png");assert im.size==(32,32)
 assert im.crop((0,0,1,32)).tobytes()==im.crop((31,0,32,32)).tobytes(),tile['name']
 assert im.crop((0,0,32,1)).tobytes()==im.crop((0,31,32,32)).tobytes(),tile['name']
for name in ['bed','car','plant','sofa','blood-0','reflection']:
 im=Image.open(root/f'{name}.png');assert im.getchannel('A').getextrema()==(0,255),name
atlas=json.loads((root/'environment.json').read_text(encoding='utf-8'))
assert len(atlas['frames'])==33
for name,frame in atlas['frames'].items():
 rect=frame['frame'];assert rect['x']>=0 and rect['y']>=0 and rect['x']+rect['w']<=512 and rect['y']+rect['h']<=512
print('PASS: 15 seamless 32x32 tiles, transparent props/decals, 33 valid atlas frames.')
