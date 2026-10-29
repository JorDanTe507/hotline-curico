"""Explicit crops from the three supplied nonuniform sheets. No smoking art is used.
Gameplay canvases share feet and pivot; portraits exclude the baked-in captions.
"""
from PIL import Image,ImageDraw
from pathlib import Path
from collections import deque
import json
root=Path(__file__).resolve().parents[1];out=root/'public/assets/characters/nicolas';out.mkdir(parents=True,exist_ok=True)
sources={k:Image.open('D:/Descargas/'+name+'.png').convert('RGBA') for k,name in {'clean':'Hoja de sprites de Nicolás sin fumar','normal':'Hoja de personaje pixel art de Nicolás','wounded':'Hoja de sprites de Nicolás herido'}.items()}
manifest={'sources':{k:list(im.size) for k,im in sources.items()},'sprites':{},'portraits':{}}
def clean(source,box,pose=None):
 a=sources[source].crop(box);p=a.load();q=deque([(x,0) for x in range(a.width)]+[(x,a.height-1) for x in range(a.width)]+[(0,y) for y in range(a.height)]+[(a.width-1,y) for y in range(a.height)]);seen=set()
 while q:
  x,y=q.popleft()
  if not(0<=x<a.width and 0<=y<a.height) or (x,y) in seen:continue
  seen.add((x,y));r,g,b,_=p[x,y]
  neutral=min(r,g,b)>150 and max(r,g,b)-min(r,g,b)<24
  dark=source!='clean' and r<32 and g<32 and b<48
  if pose and pose!='dead':
   cx=a.width*(.61 if pose=='run' else .5);cy=18
   head=((x-cx)/20)**2+((y-cy)/18)**2<=1
   feet=any(((x-(a.width/2+offset))/11)**2+((y-(a.height-8))/9)**2<=1 for offset in [-9,9])
   if head or feet:dark=False
  if neutral or dark:p[x,y]=(0,0,0,0);q.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
 return a
# Coordinates target the character only, excluding neighboring flashes and labels.
normal={'idle':[(337,53,405,181)],'back':[(421,53,491,181)],'walk':[(781,53,855,184),(863,53,937,184)],'run':[(1020,68,1080,165),(1082,68,1142,165)],'pistol':[(399,231,471,347),(519,231,591,347)],'heavy':[(394,395,477,517),(488,395,574,517)],'melee':[(399,553,474,686),(741,553,846,686)],'reload':[(337,53,405,181)],'hurt':[(405,716,474,833),(529,716,605,833),(651,716,731,833)],'dead':[(535,865,659,957),(669,865,824,957),(839,865,1027,957),(1043,865,1277,957)]}
wounded={'idle':[(260,76,312,166)],'back':[(1320,76,1376,166)],'walk':[(576,76,629,166),(632,76,686,166)],'run':[(1007,76,1071,166),(1074,76,1137,166)],'pistol':[(267,222,313,305),(329,222,382,305)],'heavy':[(266,358,319,450),(329,358,383,450)],'melee':[(947,230,1002,306),(1010,230,1068,306)],'reload':[(260,76,312,166)],'hurt':[(943,362,996,449),(1008,362,1064,449),(1070,362,1126,449)],'dead':[(945,498,1025,560),(1034,498,1117,560),(1127,498,1223,560),(1235,498,1378,560)]}
preview=Image.new('RGB',(10*96,3*150),'#171321');draw=ImageDraw.Draw(preview)
for row,(state,groups) in enumerate([('normal',normal),('wounded',wounded)]):
 for col,(pose,boxes) in enumerate(groups.items()):
  for i,box in enumerate(boxes):
   source='clean' if state=='normal' and pose!='run' else state
   if state=='normal' and pose=='hurt':box=(box[0],730,box[2],box[3])
   a=clean(source,box,pose);a=a.crop(a.getbbox()) if a.getbbox() else a;scale=min(64/a.width,(110 if pose!='dead' else 62)/a.height);a=a.resize((max(1,round(a.width*scale)),max(1,round(a.height*scale))),Image.Resampling.NEAREST)
   canvas=Image.new('RGBA',(68,128));canvas.alpha_composite(a,((68-a.width)//2,122-a.height));key=f'{state}-{pose}-{i}';canvas.save(out/f'{key}.png');manifest['sprites'][key]={'source':source,'box':box,'size':[68,128]}
   if i==0 and col<10:preview.paste(canvas,(col*96,row*150),canvas);draw.text((col*96,row*150+130),pose,fill='white')
for key,source,box in [('normal','clean',(398,1000,578,1189)),('wounded-0','wounded',(247,605,397,758)),('wounded-1','wounded',(406,605,554,758)),('wounded-2','wounded',(570,605,718,758)),('wounded-3','wounded',(727,605,874,758)),('wounded-4','wounded',(886,605,1033,758)),('wounded-5','wounded',(1041,605,1182,758)),('special','normal',(1086,527,1270,652))]:
 a=clean(source,box);a.thumbnail((192,192),Image.Resampling.NEAREST);a.save(out/f'portrait-{key}.png');manifest['portraits'][key]={'source':source,'box':box};
 if key in ['normal','wounded-0','special']:
  x=['normal','wounded-0','special'].index(key)*230;preview.paste(a,(x,300),a)
(out/'crops.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8');preview.save(root/'nicolas-assets.png');print('Nicolas: normal/wounded gameplay, portraits and special portrait extracted; captions excluded.')



