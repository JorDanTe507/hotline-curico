"""Extract the supplied Boss Rush plates into a nearest-neighbor Phaser atlas."""
import argparse
import json
from collections import deque
from pathlib import Path
from PIL import Image, ImageEnhance

parser = argparse.ArgumentParser()
parser.add_argument("source", type=Path)
source = parser.parse_args().source
out = Path(__file__).resolve().parents[1] / "public/assets/v210"

# Coordinates are measured on the 1536-wide presentation images.
boards = [
    ("Tileset de la Sala de Tortura", (18,128,85,192), (398,131,658,213), {
        "cover": (921,138,1108,260), "detail": (563,760,675,967), "gate": (843,346,894,415),
        "desk": (231,457,351,565), "cage": (852,447,971,582), "lamp": (1084,626,1150,670),
        "sign": (1371,898,1490,945), "chains": (848,620,910,703),
    }),
    ("El Comandante_ Campamento Militar Pixel Art", (18,128,85,192), (392,143,625,214), {
        "cover": (1093,121,1236,181), "detail": (463,479,569,640), "gate": (743,365,864,462),
        "parapet": (895,127,1082,205), "tent": (12,503,261,640), "crate": (1004,282,1126,371),
        "sign": (1219,825,1328,870), "lamp": (693,229,758,325),
    }),
    ("El demoledor_ paquete de sprites industriales", (18,128,85,192), (390,128,864,211), {
        "cover": (455,574,575,632), "detail": (19,674,179,784), "gate": (549,369,654,466),
        "container": (14,502,205,630), "scaffold": (896,338,995,438), "debris": (785,664,952,782),
        "sign": (1380,819,1522,882), "lamp": (481,824,553,923),
    }),
    ("Hoja de sprites cyberpunk de El Verdugo", (18,128,85,192), (400,128,891,216), {
        "cover": (232,694,391,785), "detail": (19,505,191,636), "gate": (783,364,884,472),
        "console": (915,371,1110,471), "panel": (1326,355,1385,470), "cable": (1195,674,1308,723),
        "sign": (1200,826,1302,918), "lamp": (207,837,353,874),
        "generator-off": (920,122,1109,271), "generator-on": (1124,122,1308,271),
    }),
    ("Paquete de sprites del matadero industrial", (19,128,85,192), (391,128,852,214), {
        "cover": (884,128,1059,229), "detail": (913,504,1065,628), "gate": (492,367,625,464),
        "hooks": (1269,122,1524,349), "rack": (14,667,125,801), "cooler": (11,499,248,635),
        "crates": (670,553,735,626), "sign": (616,839,714,922), "lamp": (185,851,311,888),
    }),
    ("Paquete de sprites Wesker_ Comisaría Umbrella", (16,128,83,192), (388,128,864,224), {
        "counter": (899,130,1189,320), "desk": (13,512,184,640), "filing": (192,512,244,638),
        "shelf": (457,503,591,638), "bars": (1132,513,1265,637), "statue": (12,812,99,1000),
        "door": (703,363,789,472), "window": (923,362,986,472), "sign": (822,808,939,864),
        "lamp": (498,828,607,859), "lab": (624,507,689,640),
    }),
    ("Sala Segura Neón_ Boss Rush", (18,126,82,187), (389,120,859,203), {
        "window": (897,122,1115,268), "bar": (298,493,576,654), "desk": (15,496,272,657),
        "sofa": (1172,317,1343,394), "table": (1072,387,1227,462), "gate": (782,345,854,459),
        "wheel": (983,498,1129,658), "upgrade": (673,499,878,652), "crate": (1180,592,1310,651),
        "plant": (132,695,198,824), "sign": (1062,868,1165,943), "lamp": (235,886,352,925),
    }),
]
corners = [(394,349,438,409),(20,372,94,460),(15,373,86,460),(14,374,91,467),
           (17,369,93,459),(14,369,91,468),(15,363,89,451)]

prefixes = ["0", "1", "2", "3", "4", "station", "safe"]

# Plain wall sections without lettering, panels, lamps or signage.
plain_walls = [(463,131,525,213),(510,143,565,214),(647,128,699,211),
               (704,128,750,216),(806,229,854,324),(391,128,420,224),
               (453,122,531,201)]
extra_floors = {
    "station": {"store": (17,265,78,324), "cell": (158,266,217,324)},
    "safe": {"wood": (155,129,210,185), "wood-worn": (222,129,281,185)},
}
extra_props = {
    "0": {"blood": (21,755,136,823), "blood-small": (288,771,351,835),
          "papers": (145,929,235,992), "medical": (19,564,85,697)},
    "2": {"blood": (224,265,286,328)},
    "4": {"blood": (680,669,760,744), "blood-small": (850,665,941,740)},
}

def transparent_edges(tile, limit):
    """Mask only the low-colour plate attached to the outside of this crop."""
    w, h = tile.size
    pixels = tile.load()
    queue = deque([(x, y) for x in range(w) for y in (0, h-1)])
    queue.extend((x, y) for x in (0, w-1) for y in range(h))
    outside = set()
    def neighbors(x, y):
        return [(nx, ny) for nx, ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)) if 0<=nx<w and 0<=ny<h]
    while queue:
        x, y = queue.popleft()
        if (x,y) in outside or any(c>cap for c,cap in zip(pixels[x,y],limit)):
            continue
        outside.add((x,y))
        queue.extend(neighbors(x,y))
    for x, y in outside:
        if all(p in outside for p in neighbors(x,y)):
            pixels[x,y] = (*pixels[x,y][:3], 0)
    return tile

frames = {}
atlas = Image.new("RGBA", (2048, 2048))
x = y = row_height = 0
def put(name, tile):
    global x, y, row_height
    if x + tile.width > atlas.width:
        x, y, row_height = 0, y + row_height + 2, 0
    assert y + tile.height <= atlas.height
    frames[name] = {"frame":{"x":x,"y":y,"w":tile.width,"h":tile.height}}
    atlas.paste(tile,(x,y))
    x += tile.width + 2
    row_height = max(row_height,tile.height)

for index,(name,floor,wall,objects) in enumerate(boards):
    image = Image.open(source / (name + ".png")).convert("RGBA")
    print(name, image.size)
    sx, sy = image.width/1536, image.height/1024
    def crop(box):
        return image.crop(tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate(box)))
    prefix = prefixes[index]
    left,top,right,bottom = floor
    offsets = [[(0,0),(70,0),(140,0),(70,68),(140,68)],[(0,0),(70,0),(140,0),(0,69),(70,69)],
               [(0,0),(70,0),(140,0),(0,69),(70,69)],[(0,0),(70,0),(140,0),(0,69),(140,69)],
               [(0,0),(70,0),(140,0),(209,68),(70,68)],[(0,0),(72,0),(142,0),(0,69),(142,69)],
               [(0,0),(0,65),(0,129),(270,0),(204,65)]][index]
    for i,(dx,dy) in enumerate(offsets):
        tile=crop((left+dx+2,top+dy+2,right+dx-2,bottom+dy-2))
        put(f"{prefix}-floor-{i}",tile.resize((32,32),Image.Resampling.NEAREST))
    l,t,r,b=wall
    for i in range(4):
        tile=crop((l+(r-l)*i/4,t,l+(r-l)*(i+1)/4,b))
        put(f"{prefix}-wall-{i}",tile.resize((32,32),Image.Resampling.NEAREST))
    tile=crop(plain_walls[index]).resize((32,32),Image.Resampling.NEAREST)
    put(f"{prefix}-wall-plain",tile)
    for key,box in extra_floors.get(prefix,{}).items():
        put(f"{prefix}-floor-{key}",crop(box).resize((32,32),Image.Resampling.NEAREST))
    corner=transparent_edges(crop(corners[index]),(24,13,26))
    put(prefix+'-corner',corner.resize((32,32),Image.Resampling.NEAREST))
    for key,box in {**objects,**extra_props.get(prefix,{})}.items():
        tile=transparent_edges(crop(box),(24,13,26))
        if prefix=="2" and key=="blood":
            alpha=Image.new("L",tile.size)
            alpha.putdata([min(a,max(0,(r-max(g,b)-12)*5)) for r,g,b,a in tile.getdata()])
            tile.putalpha(alpha)
        put(f"{prefix}-{key}",tile)
        if prefix=="safe" and key=="bar":
            front=tile.copy()
            # Keep the countertop and stools as a foreground layer over Jordan.
            front.paste((0,0,0,0),(0,0,front.width,63))
            put("safe-bar-front",front)
        if prefix=="3" and key in {"lamp","panel","console"}:
            dark=ImageEnhance.Color(tile).enhance(.22)
            dark=ImageEnhance.Brightness(dark).enhance(.45)
            put(f"3-{key}-dark",dark)

# Keep the existing opened art and frame dimensions, with its plate background removed.
legacy=json.loads((out/"rooms.json").read_text(encoding="utf-8"))["frames"]["4-gate-open"]["frame"]
x0,y0,w,h=(legacy[key] for key in ("x","y","w","h"))
with Image.open(out/"rooms.png") as image:
    put("4-gate-open",transparent_edges(image.convert("RGBA").crop((x0,y0,x0+w,y0+h)),(26,14,27)))

atlas.crop((0,0,atlas.width,y+row_height)).save(out/"rooms-polish.png", optimize=True)
(out/"rooms-polish.json").write_text(json.dumps({"frames":frames}),encoding="utf-8")
