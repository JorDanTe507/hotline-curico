"""Original, deterministic synthesized placeholder effects. No third party audio.
PCM WAV, mono, 22050 Hz; generated locally using Python standard library.
"""
import math, random, struct, wave
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'public/assets/audio';out.mkdir(exist_ok=True)
SR=22050
profiles=[('pistol',.16,160,.65),('revolver',.28,95,.82),('smg',.095,240,.48),('shotgun',.36,65,.9),('assault',.20,190,.7),('sniper',.58,105,.8),('rpg',.48,60,.6),('explosion',.7,42,.9),('reload',.24,700,.18),('pickup',.16,740,.12),('hurt',.17,135,.25),('kill',.22,90,.24),('voice',.048,260,.08),('dash',.16,340,.22),('throw',.13,440,.18),('execute',.22,70,.35),('critical',.22,880,.13),('ultimate',.55,180,.3),('minigun',.075,155,.4),('motor',.5,120,.2),('reward',.55,660,.22),('uzi',.07,280,.35),('magnum',.38,75,.85),('sawedoff',.42,52,.9),('m79',.4,65,.5),('flame',.17,150,.35),('bat',.18,110,.3),('crowbar',.22,620,.27),('axe',.33,85,.4),('tryhard',.48,480,.22)]
for index,(name,duration,freq,volume) in enumerate(profiles):
 rng=random.Random(420+index);n=int(duration*SR);samples=[];filtered=0
 for i in range(n):
  t=i/SR;env=(1-i/n)**3*min(1,t/.002);noise=rng.uniform(-1,1);filtered=filtered*.7+noise*.3
  pitch=freq*(1-.55*i/n);tone=math.sin(2*math.pi*pitch*t)
  if name=='motor':value=(math.sin(2*math.pi*120*t)+.3*math.sin(2*math.pi*240*t))*(.65+.35*math.sin(2*math.pi*20*t))
  elif name=='reward':value=math.sin(2*math.pi*([660,880,1100,1320][min(3,int(t/.11))])*t)*math.sin(math.pi*i/n)
  elif name=='voice':value=(tone+.25*math.sin(2*math.pi*freq*2*t))*env
  elif name=='pickup':value=math.sin(2*math.pi*(freq+(400 if t>.07 else 0))*t)*env
  elif name=='reload':value=noise*max(0,1-(t%.085)/.025)*env
  elif name in ('ultimate','tryhard'):value=(math.sin(2*math.pi*(freq+600*t)*t)+filtered)*math.sin(math.pi*i/n)
  elif name=='critical':value=math.sin(2*math.pi*freq*t)*env
  elif name=='flame':value=filtered*2*math.sin(math.pi*i/n)
  elif name in ('bat','crowbar','axe'):value=(filtered*2+tone*.4)*env
  elif name=='throw':value=filtered*2*math.sin(math.pi*i/n)
  elif name=='dash':value=filtered*2*math.sin(math.pi*i/n)
  elif name=='rpg':value=(filtered*2+tone*.2)*math.sin(math.pi*i/n)
  else:value=(noise*.52+filtered*.8+tone*.45)*env
  if name=='sniper' and i>int(.09*SR):value+=samples[i-int(.09*SR)]*.25/32767/volume
  sample=int(max(-1,min(1,value*volume))*32767);samples.append(sample)
 with wave.open(str(out/(name+'.wav')),'wb') as w:w.setparams((1,2,SR,0,'NONE','not compressed'));w.writeframes(struct.pack('<'+'h'*len(samples),*samples))
(out/'LICENSE.txt').write_text('Original procedurally synthesized sound effects created for Hotline Curico. CC0 1.0 Universal: free to use, modify and distribute, including commercially. No third-party recordings. Source: tools/generate_audio.py.\n')

