"""Alpha regression for original-derived frames; never synthesizes character art."""
from pathlib import Path
from PIL import Image
from jordan_alpha import clean_exterior_matte
import unittest

class AlphaTests(unittest.TestCase):
    def test_exterior_matte_only(self):
        a=Image.new('RGBA',(9,9))
        for y in range(1,8):
            for x in range(1,8):a.putpixel((x,y),(220,220,220,255))
        for y in range(2,7):
            for x in range(2,7):a.putpixel((x,y),(5,5,5,255))
        a.putpixel((4,4),(255,255,255,255))
        b=clean_exterior_matte(a)
        self.assertEqual(b.getpixel((1,1))[3],0)
        self.assertEqual(b.getpixel((2,2)),a.getpixel((2,2)))
        self.assertEqual(b.getpixel((4,4)),a.getpixel((4,4)))

    def test_all_runtime_frames(self):
        import json
        atlas=Image.open('public/assets/v20/jordan-atlas.png').convert('RGBA')
        poses=json.loads(Path('public/assets/v20/jordan-frames.json').read_text())['poses']
        indices={i for directions in poses.values() for frames in directions.values() for i in frames}
        self.assertEqual(indices,set(range(181)))
        for i in indices:
            frame=atlas.crop((i%16*96,i//16*112,i%16*96+96,i//16*112+112))
            self.assertTrue(frame.getbbox(),i)
            self.assertEqual(set(frame.getchannel('A').get_flattened_data()),{0,255})
            self.assertEqual(frame.tobytes(),clean_exterior_matte(frame).tobytes())
        before=Path('.publication-lock/jordan-atlas-before202.png')
        if before.exists():
            old=Image.open(before).convert('RGBA')
            for a,b in zip(old.get_flattened_data(),atlas.get_flattened_data()):
                if a!=b:
                    self.assertEqual((a[3],b[3]),(255,0))
                    self.assertGreaterEqual(min(a[:3]),180)

if __name__=='__main__':unittest.main()
