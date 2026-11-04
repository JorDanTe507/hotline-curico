"""Targeted alpha repair for four weapons whose original presentation background is pink.
Copies original RGB only. Does not touch Requiem, minigun, melee or dark-background crops.
"""
from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parents[1]
source=Path('D:/Descargas/Atlas neón de armas pixel art (1).png')
im=Image.open(source).convert('RGBA')
boxes={8:(22,71,168,151),10:(20,306,190,376),11:(23,650,184,728),12:(22,770,185,847)}
report={}
for ident,box in boxes.items():
 a=im.crop(box);w,h=a.size;p=a.load();seen=set()
 pink=lambda x,y: p[x,y][0]>160 and p[x,y][1]<70 and p[x,y][2]>60
 # Presentation pink components: discard exterior background and large enclosed holes.
 # Tiny enclosed colored highlights are retained; dark object pixels are never keyed.
 for y in range(h):
  for x in range(w):
   if (x,y) in seen or not pink(x,y):continue
   region=[(x,y)];seen.add((x,y));edge=False
   for xx,yy in region:
    edge|=xx in (0,w-1) or yy in (0,h-1)
    for nx,ny in [(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)]:
     if 0<=nx<w and 0<=ny<h and (nx,ny) not in seen and pink(nx,ny):seen.add((nx,ny));region.append((nx,ny))
   if edge or len(region)>12:
    for xx,yy in region:p[xx,yy]=(*p[xx,yy][:3],0)
 # Remove detached presentation rule lines, never the connected weapon silhouette.
 visited=set();components=[]
 for y in range(h):
  for x in range(w):
   if not p[x,y][3] or (x,y) in visited:continue
   region=[(x,y)];visited.add((x,y))
   for xx,yy in region:
    for nx,ny in [(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)]:
     if 0<=nx<w and 0<=ny<h and (nx,ny) not in visited and p[nx,ny][3]:visited.add((nx,ny));region.append((nx,ny))
   components.append(region)
 for region in components:
  xs=[q[0] for q in region];ys=[q[1] for q in region]
  if max(xs)-min(xs)>w*.8 and max(ys)-min(ys)<6 and (min(ys)==0 or max(ys)==h-1):
   for xx,yy in region:p[xx,yy]=(*p[xx,yy][:3],0)
 if a.getbbox():a=a.crop(a.getbbox())
 a.thumbnail((32,26),Image.Resampling.NEAREST)
 base=Image.new('RGBA',(32,32));base.alpha_composite(a,((32-a.width)//2,(32-a.height)//2))
 old=Image.open(root/f'public/assets/weapons/weapon-{ident}.png').convert('RGBA')
 report[ident]={'crop':box,'beforeOpaque':sum(px[3]>0 for px in old.getdata()),'afterOpaque':sum(px[3]>0 for px in base.getdata())}
 base.save(root/f'public/assets/weapons/weapon-{ident}.png')
 for role in ['pickup','hud']:base.save(root/f'public/assets/weapons/second/{ident}-{role}.png')
 for f in range(2):
  frame=base.copy();ImageDraw.Draw(frame).line((28,14+f,31,14+f),fill='#ffbd61');frame.save(root/f'public/assets/weapons/second/{ident}-fire-{f}.png')
(root/'.publication-lock/alpha181.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
