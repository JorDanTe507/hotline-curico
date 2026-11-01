"""Original seamless synthetic rain for Hotline Curicó; CC0-1.0. No recordings.
Run from the repository root. Standard-library only; deterministic seed.
"""
import math, random, struct, wave
from pathlib import Path
rate=22050
count=rate*6
rng=random.Random(173507)
noise=[rng.uniform(-1,1) for _ in range(count)]
# Circular FIR filters: stationary noise has no envelope reset at the loop seam.
samples=[]
for i in range(count):
    low=sum(noise[(i-j)%count] for j in range(7))/7
    high=(noise[i]+noise[(i-1)%count])/2-low
    breeze=.86+.09*math.sin(2*math.pi*i/count)+.05*math.sin(6*math.pi*i/count)
    samples.append((.33*low+.23*high)*breeze)
# Soft, tiny circular splash transients, never a sharp periodic metronome.
for _ in range(460):
    at=rng.randrange(count);length=rng.randrange(45,200);gain=rng.uniform(.015,.055)
    for j in range(length):
        samples[(at+j)%count]+=rng.uniform(-1,1)*gain*math.sin(math.pi*j/length)**2
mean=sum(samples)/count
samples=[v-mean for v in samples]
# Match the short seam to the opening without muting the whole bed.
span=220
for i in range(span):
    t=(i+1)/span
    samples[count-span+i]=(1-t)*samples[count-span+i]+t*samples[i]
scale=.58/max(abs(v) for v in samples)
path=Path('public/assets/audio/rain-ambient.wav')
with wave.open(str(path),'wb') as output:
    output.setnchannels(1);output.setsampwidth(2);output.setframerate(rate)
    output.writeframes(b''.join(struct.pack('<h',round(v*scale*32767)) for v in samples))
print(path, path.stat().st_size, 'bytes; 6s, mono, 22050Hz, PCM16')
