from PIL import Image
from pathlib import Path
import json
p=Path(__file__).resolve().parents[1]/'public/assets/portraits/wounded'
im=Image.open(r'D:\Descargas\Hoja de personaje pixel art neón.png').convert('RGBA')
assert im.size==(1536,1024),im.size
# Portrait-only explicit crops. Excludes the captions and HUD examples in the source.
boxes=[(16,564,169,704),(190,564,352,704),(373,564,533,704)]
for i,box in enumerate(boxes):im.crop(box).save(p/f'portrait-{i}.png')
(p/'crops.json').write_text(json.dumps({'sourceSize':list(im.size),'rectangles':boxes,'note':'Nonuniform portrait crops; dark original background retained. Display using contain scale.'},indent=2))
