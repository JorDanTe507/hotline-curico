"""Original procedural Chaos effects, CC0-1.0. No samples/recordings."""
import math,random,wave,struct
from pathlib import Path
names=['grenade-throw','frag','shrapnel','bottle','fire-loop','flashbang','electric','knife-throw','knife-hit','knife-pickup','barrel','throwable-pickup']
rate=22050
for index,name in enumerate(names):
 rng=random.Random(1800+index);duration=2 if name=='fire-loop' else 1.0 if name in ['frag','barrel'] else .32
 values=[]
 for i in range(int(rate*duration)):
  t=i/rate;noise=rng.uniform(-1,1);envelope=1 if name=='fire-loop' else math.exp(-t*(4 if name in ['frag','barrel'] else 15))*(min(1,t*400))
  tone=math.sin(2*math.pi*(70 if name in ['frag','barrel'] else 300+index*80)*t)
  value=(noise*.65+tone*.35)*envelope*(.18 if name=='fire-loop' else .6)
  if name in ['knife-pickup','throwable-pickup']:value=math.sin(2*math.pi*(600+t*1800)*t)*envelope*.45
  values.append(max(-.9,min(.9,value)))
 path=Path('public/assets/audio')/(name+'.wav')
 with wave.open(str(path),'wb') as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(b''.join(struct.pack('<h',round(v*32767)) for v in values))
print('Created',len(names),'original CC0 sound effects')
