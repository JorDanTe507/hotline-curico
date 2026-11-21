"""Prepare 8 alpha sprites from the generated 4x2 reference-guided economy atlas."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
im=Image.open(root/'docs/economy/atlas-source.png').convert('RGBA');w,h=im.size
target=root/'public/assets/economy';target.mkdir(parents=True,exist_ok=True)
for i,name in enumerate(['copper','silver','gold','special','pocket','magnet-perk','spark','pulse']):
    sprite=im.crop((round(i%4*w/4),round(i//4*h/2),round((i%4+1)*w/4),round((i//4+1)*h/2)))
    bounds=sprite.getchannel('A').point(lambda n:255 if n>=96 else 0).getbbox()
    assert bounds
    sprite=sprite.crop(bounds);sprite.thumbnail((88,88),Image.Resampling.NEAREST)
    out=Image.new('RGBA',(96,96));out.paste(sprite,((96-sprite.width)//2,(96-sprite.height)//2))
    assert out.getchannel('A').getextrema()[0]==0
    out.save(target/(name+'.png'))
print('8 transparent RGBA economy sprites prepared')
