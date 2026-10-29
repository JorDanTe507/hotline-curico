from PIL import Image
from pathlib import Path
import json
root=Path('public/assets')
a=Image.open(r'D:\Descargas\Hoja de sprites retro de Cervela.png').convert('RGBA')
b=Image.open(r'D:\Descargas\Hoja de sprites pixel art del personaje neón.png').convert('RGBA')
# Explicit nonuniform rectangles, inspected against the supplied sheets.
rects={'idle':(333,50,401,175),'back':(410,50,479,175),'side':(494,49,561,175),'walk1':(826,49,900,177),'walk2':(911,49,985,177),'shoot':(424,234,509,354),'reload':(341,408,416,540),'hurt':(342,596,418,732),'dead':(1233,625,1368,719)}
for name,box in rects.items():
 im=a.crop(box)
 # The checkerboard is baked into the PNG. Remove neutral light pixels.
 pixels=im.load()
 for y in range(im.height):
  for x in range(im.width):
   r,g,bl,al=pixels[x,y]
   if min(r,g,bl)>155 and max(r,g,bl)-min(r,g,bl)<22:pixels[x,y]=(0,0,0,0)
 im.save(root/'characters'/f'cervela-{name}.png')
a.crop((846,797,1005,986)).save(root/'portraits'/'cervela.png')
im=b.crop((351,40,412,162)); p=im.load()
for y in range(im.height):
 for x in range(im.width):
  r,g,bl,al=p[x,y]
  if min(r,g,bl)>155 and max(r,g,bl)-min(r,g,bl)<22:p[x,y]=(0,0,0,0)
im.save(root/'enemies'/'maton.png')
(root/'characters'/'recortes.json').write_text(json.dumps({'sourceSize':[1536,1024],'rectangles':rects,'note':'Checkerboard removal may remove light shirt highlights; provisional extracted assets.'},indent=2))
