from pathlib import Path
from PIL import Image
from collections import deque
import json,shutil
from jordan_alpha import clean_exterior_matte
out=Path('public/assets/v20');im=Image.open('D:/Descargas/Hoja de sprites pixel art de Jordan.png').convert('RGBA')
def flood(a,white=True):
 a=a.copy();w,h=a.size;p=a.load();q=deque([(x,0) for x in range(w)]+[(x,h-1) for x in range(w)]+[(0,y) for y in range(h)]+[(w-1,y) for y in range(h)]);seen=set()
 while q:
  x,y=q.popleft()
  if not(0<=x<w and 0<=y<h) or (x,y) in seen:continue
  seen.add((x,y));r,g,b,v=p[x,y]
  if (min(r,g,b)>228 if white else max(r,g,b)<14):p[x,y]=(r,g,b,0);q.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
 return a
rows={'idle':(56,152,4),'walk':(163,246,6),'run':(259,341,6),'pistol':(351,423,5),'melee':(437,508,5),'hurt':(522,590,4),'agony':(603,661,5),'revive':(674,745,5),'dead':(757,834,6)}
columns=[(300,590),(597,889),(897,1195),(1207,1526)];frames=[];poses={}
for pose,(top,bottom,n) in rows.items():
 poses[pose]={}
 for direction,(left,right) in zip(['down','left','right','up'],columns):
  indices=[]
  panel=flood(im.crop((left,top,right,bottom)));px=panel.load();seen=set();objects=[]
  for yy in range(panel.height):
   for xx in range(panel.width):
    if (xx,yy) in seen or px[xx,yy][3]==0:continue
    q=[(xx,yy)];seen.add((xx,yy));points=[]
    while q:
     x,y=q.pop();points.append((x,y))
     for dx,dy in [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(1,-1),(-1,1),(1,1)]:
      nx,ny=x+dx,y+dy
      if 0<=nx<panel.width and 0<=ny<panel.height and (nx,ny) not in seen and px[nx,ny][3]>0:seen.add((nx,ny));q.append((nx,ny))
    if len(points)<80:continue
    x0=min(x for x,y in points);x1=max(x for x,y in points)+1;y0=min(y for x,y in points);y1=max(y for x,y in points)+1
    if x1-x0>panel.width*.9 or x1-x0<5:continue
    a=Image.new('RGBA',(x1-x0,y1-y0));ap=a.load()
    for x,y in points:ap[x-x0,y-y0]=px[x,y]
    objects.append((x0,a))
  for _,a in sorted(objects,key=lambda o:o[0]):
   a.thumbnail((94,100),Image.Resampling.NEAREST);frame=Image.new('RGBA',(96,112));frame.alpha_composite(a,((96-a.width)//2,104-a.height));indices.append(len(frames));frames.append(clean_exterior_matte(frame))
  if pose in ['dead','agony'] and direction=='right':indices.reverse()
  poses[pose][direction]=indices
atlas=Image.new('RGBA',(96*16,112*((len(frames)+15)//16)))
for i,a in enumerate(frames):atlas.alpha_composite(a,(i%16*96,i//16*112))
atlas.save(out/'jordan-atlas.png');(out/'jordan-frames.json').write_text(json.dumps({'poses':poses},indent=2))
for name,box in [('portrait',(20,315,102,403)),('wounded',(20,426,103,512)),('critical',(20,535,102,623)),('special',(1000,901,1067,978))]:
 a=im.crop(box);a.save(out/(name+'.png'))
selection=flood(Image.open('D:/Descargas/Jordan ensangrentado bajo luces neón.png').convert('RGBA'),False);selection.save(out/'selection.png')
for source,target in [('Jordan y el tiempo detenido.png','ultimate.png'),('Pantalla de derrota en neón.png','death.png'),('Caídos bajo las luces de Curicó.png','death-cervela-jordan.png'),('Han Caído_ Nicolás y Jordan.png','death-nicolas-jordan.png')]:shutil.copyfile('D:/Descargas/'+source,out/target)
icons=Image.open('D:/Descargas/Logros y mejoras de Jordan.png').convert('RGBA')
for group,rects in [('achievement',[(42,179,226,350),(249,180,438,350),(460,180,648,350),(665,179,853,350),(43,500,227,665),(248,500,438,665),(460,500,648,665),(670,500,857,665)]),('perk',[(940,179,1131,334),(1148,179,1338,334),(1356,179,1545,334),(1552,179,1742,334),(953,499,1145,655),(1230,499,1417,655),(1450,499,1641,655)])]:
 for i,box in enumerate(rects):
  a=icons.crop(box);a.thumbnail((64,64),Image.Resampling.NEAREST);canvas=Image.new('RGBA',(64,64));canvas.alpha_composite(a,((64-a.width)//2,(64-a.height)//2));canvas.save(out/f'{group}-{i}.png')
print(len(frames),'frames extracted; sizes',im.size,icons.size)

face=Image.open('D:/Descargas/Diálogo pixelado de Jordan.png').convert('RGBA').crop((42,30,490,640));face.save(out/'portrait.png')
