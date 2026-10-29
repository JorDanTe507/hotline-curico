from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
from collections import deque
import json,hashlib,argparse
root=Path(__file__).resolve().parents[1];out=root/'public/assets/world';out.mkdir(parents=True,exist_ok=True)
parser=argparse.ArgumentParser();parser.add_argument('--source',default=r'D:/Descargas/Mapa Neón de Calles e Industria.png');source=Path(parser.parse_args().source);im=Image.open(source).convert('RGBA');assert im.size==(1536,1024)
tile_specs=[('asphalt',(12,798,36,822)),('sidewalk',(12,838,36,862)),('cracks',(12,835,43,866)),('industrial',(785,796,816,827)),('hazard',(828,835,858,865)),('wet',(173,939,205,971))]
strip=Image.new('RGBA',(32*len(tile_specs),32));metadata_tiles=[]
for i,(name,box) in enumerate(tile_specs):
 a=im.crop(box).resize((16,16),Image.Resampling.NEAREST);t=Image.new('RGBA',(32,32));t.paste(a,(0,0));t.paste(ImageOps.mirror(a),(16,0));t.paste(ImageOps.flip(a),(0,16));t.paste(ImageOps.flip(ImageOps.mirror(a)),(16,16));strip.paste(t,(i*32,0));t.save(out/f'tile-{name}.png');metadata_tiles.append({'name':name,'crop':box})
strip.save(out/'tiles.png')
spec={
'container':((983,834,1055,881),(64,128),True),
'container-blue':((983,796,1055,831),(64,128),True),
'forklift':((1180,797,1215,862),(64,64),False),
'barrel':((1242,800,1274,834),(32,32),False),
'tank':((1235,864,1276,923),(64,96),False),
'bench':((1238,972,1280,996),(64,32),False),
'tree':((460,553,506,627),(64,64),False),
'fountain':((552,646,589,686),(64,64),False),
'truck':((1390,797,1524,861),(64,128),True),
}
images={};metadata={'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source':'Mapa Neón de Calles e Industria.png','sourceSize':[1536,1024],'tiles':metadata_tiles,'rectangles':{}}
for name,(box,size,rotate) in spec.items():
 a=im.crop(box);p=a.load();q=deque([(x,0) for x in range(a.width)]+[(x,a.height-1) for x in range(a.width)]+[(0,y) for y in range(a.height)]+[(a.width-1,y) for y in range(a.height)]);seen=set()
 while q:
  x,y=q.popleft()
  if not(0<=x<a.width and 0<=y<a.height) or (x,y) in seen:continue
  seen.add((x,y));r,g,b,_=p[x,y]
  if r<25 and g<27 and b<36:p[x,y]=(0,0,0,0);q.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
 if name=='tree':
  for yy in range(a.height):
   for xx in range(a.width):
    r,g,b,alpha=a.getpixel((xx,yy))
    if not(g>r*1.1 and g>b*.9 and g>30):a.putpixel((xx,yy),(0,0,0,0))
 if a.getbbox():a=a.crop(a.getbbox())
 if rotate:a=a.transpose(Image.Transpose.ROTATE_90)
 a.thumbnail(size,Image.Resampling.NEAREST);canvas=Image.new('RGBA',size);canvas.alpha_composite(a,((size[0]-a.width)//2,(size[1]-a.height)//2));images[name]=canvas;canvas.save(out/f'{name}.png');metadata['rectangles'][name]={'crop':box,'size':size,'rotate90':rotate}
atlas=Image.new('RGBA',(512,512));frames={};x=y=row=0
for name,a in images.items():
 if x+a.width>512:x=0;y+=row+2;row=0
 atlas.alpha_composite(a,(x,y));frames[name]={'frame':{'x':x,'y':y,'w':a.width,'h':a.height},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':a.width,'h':a.height},'sourceSize':{'w':a.width,'h':a.height}};x+=a.width+2;row=max(row,a.height)
atlas.save(out/'city.png');(out/'city.json').write_text(json.dumps({'frames':frames,'meta':{'size':{'w':512,'h':512},'scale':'1'}}));(out/'crops.json').write_text(json.dumps(metadata,indent=2))
preview=Image.new('RGB',(9*100,150),'#171522');d=ImageDraw.Draw(preview)
for i,(name,a) in enumerate(images.items()):
 b=a.copy();b.thumbnail((90,115));preview.paste(b,(i*100,0),b);d.text((i*100,125),name,fill='white')
preview.save(root/'world-assets-preview.png')
print('9 individual city props; explicit crops and transparent normalized atlas')
