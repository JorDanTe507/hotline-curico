from pathlib import Path
from PIL import Image,ImageDraw
from collections import deque
import json
root=Path(__file__).resolve().parents[1];out=root/'public/assets/weapons/second';out.mkdir(parents=True,exist_ok=True)
im=Image.open(r'D:/Descargas/Atlas neón de armas pixel art (1).png').convert('RGBA');assert im.size==(1536,1024)
boxes={8:(22,71,168,151),9:(22,193,173,266),10:(20,306,190,376),11:(23,650,184,728),12:(22,770,185,847),13:(988,906,1038,956),14:(1070,908,1118,955),15:(1143,909,1198,958)}
manifest={'source':'Atlas neón de armas pixel art (1).png','sourceSize':[1536,1024],'crops':{},'method':'Explicit crop, edge-connected pink/dark removal, proportional nearest-neighbor scaling, 32x32 transparent padding. Original IDs and stats retained.'}
preview=Image.new('RGB',(8*96,128),'#15121f');pd=ImageDraw.Draw(preview)
for i,(id,box) in enumerate(boxes.items()):
 a=im.crop(box);p=a.load();q=deque([(x,0) for x in range(a.width)]+[(x,a.height-1) for x in range(a.width)]+[(0,y) for y in range(a.height)]+[(a.width-1,y) for y in range(a.height)]);seen=set()
 while q:
  x,y=q.popleft()
  if not(0<=x<a.width and 0<=y<a.height) or (x,y) in seen:continue
  seen.add((x,y));r,g,b,_=p[x,y]
  if (r>160 and g<70 and b>60) or (r<24 and g<24 and b<32):p[x,y]=(0,0,0,0);q.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
 if a.getbbox():a=a.crop(a.getbbox())
 a.thumbnail((32,26),Image.Resampling.NEAREST);base=Image.new('RGBA',(32,32));base.alpha_composite(a,((32-a.width)//2,(32-a.height)//2));base.save(out.parent/f'weapon-{id}.png')
 for role in ['pickup','hud']:base.save(out/f'{id}-{role}.png')
 # Separate use frames retain the weapon silhouette; muzzle/swing is composed by the engine.
 for f in range(2):
  frame=base.copy()
  if id<13:
   d=ImageDraw.Draw(frame);d.line((28,14+f,31,14+f),fill='#ffbd61')
  frame.save(out/f'{id}-fire-{f}.png')
 manifest['crops'][id]={'box':box,'outputSize':[32,32]};pim=base.resize((80,80),Image.Resampling.NEAREST);preview.paste(pim,(i*96,4),pim);pd.text((i*96+20,92),str(id),fill='white')
for f in range(2):
 fire=Image.new('RGBA',(32,32));d=ImageDraw.Draw(fire);d.polygon([(0,14),(9,9+f),(8,3),(18,10),(28,4+f),(23,12),(31,16),(23,21),(27,29-f),(15,23),(5,28),(8,19),(0,18)],fill='#ff5c14');d.polygon([(0,15),(16,10+f),(29,16),(16,23-f),(6,18)],fill='#ffd245');d.polygon([(1,15),(15,13),(23,16),(13,20)],fill='#fff5bf');fire.save(out/f'flame-{f}.png')
grenade=Image.new('RGBA',(16,16));d=ImageDraw.Draw(grenade);d.rounded_rectangle((3,3,12,13),radius=3,fill='#55715d',outline='#e7ba67',width=1);d.rectangle((6,0,9,3),fill='#e5ddd1');grenade.save(out/'grenade.png')
(out/'crops.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8');preview.save(root/'arsenal-assets.png')
print('8 new weapons, individual 32x32 equipped/pickup/HUD/use frames; flame/grenade FX')
