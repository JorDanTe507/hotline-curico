from pathlib import Path
import hashlib,json
from PIL import Image
root=Path('public/assets/v14')
references={'enemies.png':'Hoja de sprites de enemigos neón (1).png','cars.png':'Hoja de sprites de autos pixelados.png','aceite.png':'Hoja de sprites pixel art de Tío Aceite (1).png','cervela-banner.png':'Hagamos esto una vez más (1).png','nicolas-banner.png':'Gamer neón contra los jefes.png'}
items=[]
for filename,ref in references.items():
 p=root/filename;im=Image.open(p);entry={'file':filename,'reference':ref,'size':list(im.size),'mode':im.mode,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'preparation':'ImageGen transparent isolated sprite atlas; runtime transparent-bound trimming and proportional normalization' if filename in ['enemies.png','cars.png','aceite.png'] else 'Exact original banner, proportional scaling in shared cinematic system'}
 if im.mode=='RGBA':entry['alphaRange']=list(im.getextrema()[3])
 if filename.endswith('-banner.png'):entry['matchesOriginal']=p.read_bytes()==(Path('D:/Descargas')/ref).read_bytes()
 items.append(entry)
(root/'provenance.json').write_text(json.dumps({'version':'1.4','assets':items},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(items,ensure_ascii=False))
