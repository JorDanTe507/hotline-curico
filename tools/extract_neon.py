"""Explicit crops for the supplied 1536x1024 presentation sheet (not a uniform atlas).
Only edge-connected near-black background is keyed; interior dark pixels are retained.
Outputs are padded without interpolation, so animation origins remain stable.
"""
from PIL import Image
from pathlib import Path
from collections import deque
import json
root=Path(__file__).resolve().parents[1]/'public/assets'
im=Image.open(r'D:\Descargas\Hoja de sprites neon de Hotline Curicó.png').convert('RGBA')
assert im.size==(1536,1024), 'Reinspect crop coordinates for a different source size'
manifest={'sourceSize':list(im.size),'enemies':{},'weapons':{}}
def clean(box):
 a=im.crop(box);p=a.load();w,h=a.size;seen=set();q=deque([(x,0) for x in range(w)]+[(x,h-1) for x in range(w)]+[(0,y) for y in range(h)]+[(w-1,y) for y in range(h)])
 while q:
  x,y=q.popleft()
  if (x,y) in seen or not (0<=x<w and 0<=y<h):continue
  seen.add((x,y));r,g,b,alpha=p[x,y]
  if r<33 and g<29 and b<39:
   p[x,y]=(0,0,0,0);q.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
 return a
states={'idle':([448,514,579,644,711],48,132,31),'down':([797,861,928,994,1060],48,132,31),'up':([1141,1209,1276,1342,1410,1478],48,132,31),'right':([448,519,586,658,727],178,272,32),'left':([800,872,941,1011,1082],178,272,32),'attack':([1170,1247,1321,1397,1477],178,272,35),'hurt':([796,855,916,975,1034],330,422,28),'dead':([1110,1177,1264,1370,1467],322,423,43)}
for state,(xs,top,bottom,half) in states.items():
 manifest['enemies'][state]=[]
 for i,x in enumerate(xs):
  box=(x-half,top,x+half,bottom);a=clean(box);canvas=Image.new('RGBA',(96,112));canvas.alpha_composite(a,((96-a.width)//2,104-a.height));canvas.save(root/'enemies'/'maton'/f'{state}-{i}.png');manifest['enemies'][state].append(box)
boxes=[(45,543,98,586),(237,543,291,587),(416,537,528,599),(639,540,765,595),(844,534,987,605),(1084,534,1232,597),(1291,533,1409,606)]
for i,box in enumerate(boxes):
 a=clean(box);bbox=a.getbbox()
 if bbox:a=a.crop(bbox)
 a.save(root/'weapons'/f'weapon-{i}.png');manifest['weapons'][str(i)]=box
for name,box in {'medkit':(697,843,766,922),'ammo':(48,842,103,914)}.items():clean(box).save(root/'weapons'/f'{name}.png')
(root/'asset-crops-v2.json').write_text(json.dumps(manifest,indent=2))
# Contact sheet for visual QA.
out=Image.new('RGBA',(672,360),(30,26,40,255))
for j,state in enumerate(states):
 a=Image.open(root/'enemies'/'maton'/f'{state}-0.png');out.alpha_composite(a,((j%7)*96,(j//7)*112))
for i in range(7):
 a=Image.open(root/'weapons'/f'weapon-{i}.png');a.thumbnail((88,60));out.alpha_composite(a,(i*96,260))
out.save('asset-preview.png')
