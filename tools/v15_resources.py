from pathlib import Path
import wave,math,struct,hashlib,json
root=Path(__file__).resolve().parents[1]
n=22050;out=[]
for i in range(int(n*.65)):
 t=i/n;v=sum(math.sin(2*math.pi*f*t)*max(0,1-(t-k*.13)/.25) if k*.13<=t<k*.13+.25 else 0 for k,f in enumerate([659.25,830.61,987.77,1318.51]));out.append(struct.pack('<h',int(max(-1,min(1,v*.24))*32767)))
with wave.open(str(root/'public/assets/audio/achievement.wav'),'wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(n);w.writeframes(b''.join(out))
proof=[]
for name,original in [('achievements.png','Atlas de sprites de logros neon.png'),('city.png','Guía pixel art neon de Curicó.png')]:
 p=root/'public/assets/v15'/name;ref=Path('D:/Descargas')/original
 proof.append(dict(file=name,original=str(ref),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),matchesOriginal=p.read_bytes()==ref.read_bytes(),preparation='Individual 64px icons/props and 128px facade textures cropped at boot by src/maps/urbanAssets.ts; never render complete sheets'))
(root/'public/assets/v15/provenance.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf8')
