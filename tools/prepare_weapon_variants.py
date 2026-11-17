"""Four deterministic derivatives per original project SFX. No third-party audio."""
from pathlib import Path
import wave,struct,math,json,hashlib
root=Path(__file__).resolve().parents[1];out=root/'public/assets/audio/variants';out.mkdir(parents=True,exist_ok=True)
names='pistol revolver smg shotgun assault sniper rpg minigun uzi magnum sawedoff m79 flame bat crowbar axe reload'.split();manifest=[]
for name in names:
 source=root/'public/assets/audio'/f'{name}.wav'
 with wave.open(str(source),'rb') as f:
  rate=f.getframerate();raw=f.readframes(f.getnframes());samples=struct.unpack('<'+'h'*(len(raw)//2),raw)
 for variant in range(4):
  data=[];last=0.;ratio=[.994,1.002,1.008,.998][variant]
  for i in range(int(len(samples)/ratio)):
   pos=i*ratio;j=min(len(samples)-2,int(pos));x=(samples[j]*(1-(pos-j))+samples[j+1]*(pos-j))/32768
   last=last*[.12,.26,.4,.52][variant]+x*(1-[.12,.26,.4,.52][variant]);value=last+[.035,.08,-.04,.12][variant]*(x-last);data.append(value)
  peak=max(abs(v) for v in data) or 1;gain=min(1,.67/peak);pcm=[int(max(-.95,min(.95,v*gain))*32767) for v in data];file=f'{name}-{variant}.wav'
  with wave.open(str(out/file),'wb') as f:f.setparams((1,2,rate,0,'NONE','not compressed'));f.writeframes(struct.pack('<'+'h'*len(pcm),*pcm))
  manifest.append({'file':'assets/audio/variants/'+file,'source':'assets/audio/'+name+'.wav','author':'Hotline Curicó / síntesis original del proyecto','license':'CC0-1.0','sourceUrl':'https://github.com/JorDanTe507/hotline-curico/blob/b7a4e70/tools/generate_audio.py','modifications':'Filtrado tímbrico suave; remuestreo inferior a 1%; pico limitado a 0.67; PCM mono 22050 Hz','sha256':hashlib.sha256((out/file).read_bytes()).hexdigest()})
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(out/'LICENSE.txt').write_text('Original project procedurally synthesized audio, CC0 1.0 Universal. Derived by tools/prepare_weapon_variants.py from tools/generate_audio.py. No third-party recordings. https://creativecommons.org/publicdomain/zero/1.0/\n',encoding='utf-8')
print('Prepared',len(manifest),'local procedural variants; no external recordings')
