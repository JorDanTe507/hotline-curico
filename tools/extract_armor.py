from pathlib import Path
from PIL import Image
from collections import deque
import json
root=Path(__file__).resolve().parents[1]/'public/assets/items'
im=Image.open(r'D:\Descargas\HUD cyberpunk en pixel art.png').convert('RGBA')
print('Lámina:',im.size)
assert im.size==(1536,1024),im.size
box=(106,390,184,475)
a=im.crop(box);p=a.load();w,h=a.size;q=deque([(x,0) for x in range(w)]+[(x,h-1) for x in range(w)]+[(0,y) for y in range(h)]+[(w-1,y) for y in range(h)]);seen=set()
while q:
 x,y=q.popleft()
 if (x,y) in seen or not(0<=x<w and 0<=y<h):continue
 seen.add((x,y));r,g,b,alpha=p[x,y]
 if r<42 and g<39 and b<48:
  p[x,y]=(0,0,0,0);q.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
bbox=a.getbbox()
if bbox:a=a.crop(bbox)
a.thumbnail((32,32),Image.Resampling.NEAREST)
out=Image.new('RGBA',(32,32));out.alpha_composite(a,((32-a.width)//2,(32-a.height)//2));out.save(root/'armor.png')
(root/'armor-crop.json').write_text(json.dumps({'source':'HUD cyberpunk en pixel art.png','sourceSize':list(im.size),'crop':box,'outputSize':[32,32],'method':'Edge-connected dark background removal, proportional nearest-neighbor resize and transparent padding. Source captions are reference, not game parameters.'},indent=2))
