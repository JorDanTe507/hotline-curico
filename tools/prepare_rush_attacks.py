"""Pack the approved RGBA attack sheet with nearest-neighbor scaling."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument("source", type=Path)
source = parser.parse_args().source
out = Path(__file__).resolve().parents[1] / "public/assets/v210"
image = Image.open(source).convert("RGBA")
if image.getchannel("A").getextrema()[0] != 0:
    raise ValueError("Expected the corrected sheet with native transparency")

def extract(box, keep_particles=False, outline=None):
    scaled=tuple(round(v*(image.width/1536 if i%2==0 else image.height/1024)) for i,v in enumerate(box))
    sprite=image.crop(scaled)
    alpha=sprite.getchannel("A")
    if outline:
        clip=Image.new("L",sprite.size)
        ImageDraw.Draw(clip).polygon([(round(x*image.width/1536)-scaled[0],round(y*image.height/1024)-scaled[1])
                                    for x,y in outline],fill=255)
        alpha.paste(0,mask=clip.point(lambda a:255-a))
    if not keep_particles:
        # Remove disconnected bits of labels and presentation rules from a crop.
        alpha=alpha.point(lambda a:a if a>=100 else 0)
        mask=alpha.load()
        seen=set()
        regions=[]
        for y in range(sprite.height):
            for x in range(sprite.width):
                if not mask[x,y] or (x,y) in seen:
                    continue
                region=[(x,y)]
                seen.add((x,y))
                for u,v in region:
                    for a,b in ((u-1,v),(u+1,v),(u,v-1),(u,v+1)):
                        if 0<=a<sprite.width and 0<=b<sprite.height and mask[a,b] and (a,b) not in seen:
                            seen.add((a,b))
                            region.append((a,b))
                regions.append(region)
        for region in sorted(regions,key=len,reverse=True)[1:]:
            for x,y in region:
                mask[x,y]=0
        sprite.putalpha(alpha)
    bbox=alpha.getbbox()
    if not bbox:
        raise ValueError(box)
    return sprite.crop(bbox)

groups = {
  "frag-pose":[(x,51,r,249) for x,r in [(14,133),(145,257),(265,394),(378,515),(515,655),(646,782)]],
  "fire-pose":[(x,327,r,520) for x,r in [(11,140),(141,259),(265,404),(398,558),(518,674),(650,786)]],
  "frag-flight":[(x,132,r,200) for x,r in [(831,889),(891,946),(949,1005),(1009,1070)]],
  "fire-flight":[(x,386,r,483) for x,r in [(827,888),(886,943),(941,1009),(1004,1069)]],
  "smoke-flight":[(x,626,r,707) for x,r in [(158,219),(241,307),(334,405),(419,486)]],
  "smoke-cloud":[(x,606,r,728) for x,r in [(653,749),(759,888),(893,1035),(1037,1188),(1190,1342),(1341,1533)]],
  "machete":[(81,850,331,933)],
  "machete-flight":[(x,850,r,934) for x,r in [(1216,1293),(1289,1381),(1377,1465),(1451,1530)]],
  "machete-pose":[(x,801,r,997) for x,r in [(424,540),(548,667),(666,799),(798,936),(925,1053),(1047,1171)]],
}
# The extended arms and feet overlap the next pose's rectangular crop.
outlines = {
    ("fire-pose",3): [(398,327),(558,327),(558,388),(538,410),(520,430),(519,520),(398,520)],
    ("fire-pose",4): [(571,327),(674,327),(674,443),(656,457),(650,520),(518,520),(518,469),(535,431),(550,404),(571,388)],
    ("fire-pose",5): [(674,327),(786,327),(786,520),(650,520),(653,474),(672,449)],
}
atlas=Image.new("RGBA",(1024,768))
frames={}
x=y=row=0
for kind,boxes in groups.items():
    for i,box in enumerate(boxes):
        img=extract(box,kind=="smoke-cloud",outlines.get((kind,i)))
        max_w,max_h=(96,100) if kind.endswith("pose") else (92,54) if kind=="smoke-cloud" else (48,32)
        img.thumbnail((max_w,max_h),Image.Resampling.NEAREST)
        if kind.endswith("pose") or kind in {"frag-flight","fire-flight"}:
            size,base=(112,108) if kind.endswith("pose") else (48,(48+img.height)//2)
            frame=Image.new("RGBA",(size,size))
            frame.paste(img,((size-img.width)//2,base-img.height))
            img=frame
        if x+img.width>atlas.width:
            x,y,row=0,y+row+2,0
        frames[f"{kind}-{i}"]={"frame":{"x":x,"y":y,"w":img.width,"h":img.height}}
        atlas.paste(img,(x,y))
        x+=img.width+2
        row=max(row,img.height)
atlas.crop((0,0,1024,y+row)).save(out/"attacks-polish.png",optimize=True)
(out/"attacks-polish.json").write_text(json.dumps({"frames":frames}),encoding="utf-8")
