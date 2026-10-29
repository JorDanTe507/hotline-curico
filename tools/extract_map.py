"""Explicit, non-uniform extraction of the user map reference; never slice the presentation grid.
Floor samples are mirrored into seamless 32px tiles. Props retain aspect and transparent padding.
"""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
from collections import deque
import json,hashlib,argparse
root=Path(__file__).resolve().parents[1];out=root/'public/assets/maps';out.mkdir(parents=True,exist_ok=True)
parser=argparse.ArgumentParser();parser.add_argument('--source',default=r'D:/Descargas/Atlas de texturas neón para Hotline Curicó (1).png');source=Path(parser.parse_args().source);im=Image.open(source).convert('RGBA');assert im.size==(1536,1024)
manifest={'source':source.name,'sourceSize':list(im.size),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'baseSize':32,'tiles':[],'objects':{},'method':'Explicit rectangles inside category panels, no captions or magenta presentation borders. Seamless floors mirror 16px samples. Proportional nearest-neighbor objects with edge-connected dark-background removal; transparent padding. Normalized files are packed for rendering.'}
# Samples stay strictly inside the material swatches.
samples=[('slate',(12,84,58,130)),('lilac',(124,83,170,130)),('checker',(178,82,228,132)),('wood',(235,83,281,130)),('ceramic',(180,143,226,190)),('blue',(124,203,170,250)),('red',(236,143,282,190)),('asphalt',(446,84,498,136)),('concrete',(358,200,398,248)),('industrial',(455,322,499,369)),('brick',(1232,91,1308,151)),('wall',(806,90,838,145)),('steel',(1027,90,1066,144)),('grate',(1400,90,1430,145)),('worn',(1134,182,1167,237))]
tiles=[]
for name,box in samples:
 a=im.crop(box);n=min(a.size);a=a.crop(((a.width-n)//2,(a.height-n)//2,(a.width+n)//2,(a.height+n)//2)).resize((16,16),Image.Resampling.NEAREST)
 tile=Image.new('RGBA',(32,32));tile.paste(a,(0,0));tile.paste(ImageOps.mirror(a),(16,0));tile.paste(ImageOps.flip(a),(0,16));tile.paste(ImageOps.flip(ImageOps.mirror(a)),(16,16));tile.save(out/f'floor-{name}.png');tiles.append(tile);manifest['tiles'].append({'name':name,'crop':box,'index':len(tiles)-1})
strip=Image.new('RGBA',(32*len(tiles),32))
for i,t in enumerate(tiles):strip.paste(t,(i*32,0))
strip.save(out/'tiles.png')
# x/y boxes are tailored to individual objects; output size is a padded proportional canvas.
objects={
 'sofa':((305,418,414,484),(64,32),'edge'),
 'desk':((386,550,482,587),(64,32),'edge'),
 'table':((307,488,379,543),(32,32),'edge'),
 'vending':((557,419,632,480),(32,32),'edge'),
 'bed':((638,420,683,511),(32,64),'edge'),
 'bed-blue':((488,519,552,590),(32,64),'edge'),
 'wardrobe':((680,510,728,586),(32,32),'edge'),
 'nightstand':((619,585,661,641),(32,32),'edge'),
 'washer':((490,465,523,518),(32,32),'edge'),
 'dryer':((526,464,555,518),(32,32),'edge'),
 'counter':((423,467,486,520),(64,32),'edge'),
 'shelves':((633,588,668,641),(32,32),'edge'),
 'crate':((780,420,825,464),(32,32),'edge'),
 'barrel':((786,580,821,638),(32,32),'edge'),
 'container':((876,422,992,496),(64,32),'edge'),
 'machine':((1146,415,1214,484),(32,32),'edge'),
 'pipes':((904,500,949,552),(32,32),'edge'),
 'car':((1371,417,1434,518),(32,64),'edge'),
 'plant':((18,684,61,762),(32,32),'edge'),
 'trash':((258,811,288,855),(32,32),'edge'),
 'door':((69,419,113,485),(32,32),'edge'),
 'exit':((1241,761,1311,801),(64,32),'edge'),
 'hotel':((1254,691,1366,740),(64,32),'edge'),
 'parking':((1415,765,1451,798),(32,32),'edge'),
 'graffiti':((254,754,318,803),(64,32),'color'),
 'blood-0':((827,840,915,898),(64,64),'red'),
 'blood-1':((921,845,970,899),(64,64),'red'),
 'blood-2':((827,903,880,956),(64,64),'red'),
 'impact':((1068,960,1110,1000),(32,32),'light'),
 'reflection':((1291,902,1332,950),(32,64),'color'),
 'lamp':((852,689,875,699),(32,8),'edge'),
 'rug':((236,320,282,373),(64,64),'opaque'),
}
frames={};images={}
def clean(a,mode):
 p=a.load();w,h=a.size
 if mode=='edge':
  q=deque([(x,0) for x in range(w)]+[(x,h-1) for x in range(w)]+[(0,y) for y in range(h)] + [(w-1,y) for y in range(h)]);seen=set()
  while q:
   x,y=q.popleft()
   if not(0<=x<w and 0<=y<h) or (x,y) in seen:continue
   seen.add((x,y));r,g,b,_=p[x,y]
   if r<20 and g<22 and b<32:
    p[x,y]=(0,0,0,0);q.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
 elif mode!='opaque':
  for y in range(h):
   for x in range(w):
    r,g,b,_=p[x,y];keep=(r>45 and r>g*1.65 and r>b*1.3) if mode=='red' else (max(r,g,b)>80 and max(r,g,b)-min(r,g,b)>30) if mode=='color' else max(r,g,b)>65
    if not keep:p[x,y]=(0,0,0,0)
 return a
for name,(box,size,mode) in objects.items():
 a=clean(im.crop(box),mode);bbox=a.getbbox()
 if bbox:a=a.crop(bbox)
 a.thumbnail(size,Image.Resampling.NEAREST);canvas=Image.new('RGBA',size);canvas.alpha_composite(a,((size[0]-a.width)//2,(size[1]-a.height)//2));canvas.save(out/f'{name}.png');images[name]=canvas;manifest['objects'][name]={'crop':box,'outputSize':size,'cleanup':mode}
# Reusable soft light generated as an engine-style radial mask, colored per lamp in Phaser.
light=Image.new('RGBA',(64,64));p=light.load()
for y in range(64):
 for x in range(64):
  d=((x-31.5)**2+(y-31.5)**2)**.5/32;p[x,y]=(255,255,255,int(max(0,1-d)**2*255))
images['light']=light;light.save(out/'light.png');manifest['objects']['light']={'recreated':'Neutral radial lighting mask, tinted by Phaser; no replacement artwork.'}
atlas=Image.new('RGBA',(512,512));x=y=row=0
for name,a in images.items():
 if x+a.width+2>512:x=0;y+=row+2;row=0
 assert y+a.height<=512
 atlas.alpha_composite(a,(x,y));frames[name]={'frame':{'x':x,'y':y,'w':a.width,'h':a.height},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':a.width,'h':a.height},'sourceSize':{'w':a.width,'h':a.height}};x+=a.width+2;row=max(row,a.height)
atlas.save(out/'environment.png');(out/'environment.json').write_text(json.dumps({'frames':frames,'meta':{'image':'environment.png','size':{'w':512,'h':512},'scale':'1'}}),encoding='utf-8');(out/'crops.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
# Contact sheet for visual extraction QA, not loaded by the game.
preview=Image.new('RGB',(768,((len(images)+7)//8)*112),'#171522');d=ImageDraw.Draw(preview)
for i,(name,a) in enumerate(images.items()):
 b=a.copy();b.thumbnail((82,82),Image.Resampling.NEAREST);px=(i%8)*96;py=(i//8)*112;preview.paste(b,(px+(96-b.width)//2,py),b);d.text((px+2,py+88),name,fill='white')
preview.save(root/'map-assets-v08.png');print(f'{len(tiles)} seamless tiles, {len(images)} individual objects; packed atlas 512x512')
