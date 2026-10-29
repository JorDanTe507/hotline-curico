from PIL import Image
from pathlib import Path
from collections import deque
import json
root=Path(__file__).resolve().parents[1]/'public/assets'
im=Image.open(r'D:\Descargas\Panel retro de sprites y jefe neon.png').convert('RGBA')
assert im.size==(1536,1024),im.size
portraits={'ultimate-special':(414,49,529,216),'torturado-portrait':(829,525,951,656)}
for name,box in portraits.items():im.crop(box).save(root/'portraits'/f'{name}.png')
rects={'idle':[(229,507,321,614)],'back':[(340,507,431,614)],'walk':[(438,507,520,614)],'shoot':[(531,507,638,614),(229,650,328,753)],'reload':[(670,507,796,614)],'dash':[(331,650,451,753)],'hurt':[(469,650,582,753)],'angry':[(588,650,678,753),(686,650,796,753)],'dead':[(243,799,369,904),(377,799,506,904),(516,799,650,904),(660,799,800,904)]}
def clean(box):
 a=im.crop(box);w,h=a.size;p=a.load();seen=set();q=deque([(x,0) for x in range(w)]+[(x,h-1) for x in range(w)]+[(0,y) for y in range(h)]+[(w-1,y) for y in range(h)])
 while q:
  x,y=q.popleft()
  if (x,y) in seen or x<0 or x>=w or y<0 or y>=h:continue
  seen.add((x,y));r,g,b,alpha=p[x,y]
  if (r<46 and g<32 and b<48) or (r>g*2 and b>g*1.5 and g<35 and r<100):
   p[x,y]=(0,0,0,0);q.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
 # Restore dark interiors between visible silhouette pixels on each row.
 # Edge-keying alone removes the black coat as well as the nearly black backdrop.
 original=im.crop(box)
 for y in range(h):
  xs=[x for x in range(w) if p[x,y][3]>0]
  if len(xs)>=3:
   for x in range(max(0,min(xs)-1),min(w,max(xs)+2)):
    p[x,y]=original.getpixel((x,y))
 spans={y:[x for x in range(w) if p[x,y][3]>0] for y in range(h)}
 for y in range(h):
  if spans[y]:continue
  before=next((k for k in range(y-1,max(-1,y-7),-1) if spans[k]),None)
  after=next((k for k in range(y+1,min(h,y+7)) if spans[k]),None)
  if before is not None and after is not None and after-before<=6:
   lo=min(min(spans[before]),min(spans[after]));hi=max(max(spans[before]),max(spans[after]))
   for x in range(lo,hi+1):p[x,y]=original.getpixel((x,y))
 return a
for state,boxes in rects.items():
 for i,box in enumerate(boxes):
  a=clean(box);canvas=Image.new('RGBA',(144,144));canvas.alpha_composite(a,((144-a.width)//2,132-a.height));canvas.save(root/'bosses/torturado'/f'{state}-{i}.png')
(root/'bosses/torturado/crops.json').write_text(json.dumps({'sourceSize':list(im.size),'portraits':portraits,'frames':rects,'note':'Explicit nonuniform cuts, edge-connected dark background removal. One-frame movement/reload poses are provisional.'},indent=2))
out=Image.new('RGBA',(720,288),(25,21,32,255))
for i,state in enumerate(rects):out.alpha_composite(Image.open(root/'bosses/torturado'/f'{state}-0.png'),((i%5)*144,(i//5)*144))
out.save('torturado-preview.png')

