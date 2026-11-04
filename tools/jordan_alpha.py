"""Remove the original sheet's exterior white matte, preserving original RGB.

Only bright, nearly neutral pixels connected to transparency can be removed.
Dark pixels and enclosed white shirt/shoe details are never keyed out.
"""
from collections import deque


def clean_exterior_matte(frame):
    result = frame.copy()
    p = result.load()
    w, h = result.size
    seen = set()
    queue = deque((x, y) for y in range(h) for x in range(w) if p[x, y][3] == 0)
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen:
            continue
        seen.add((x, y))
        r, g, b, alpha = p[x, y]
        if alpha and not (min(r, g, b) >= 180 and max(r, g, b) - min(r, g, b) <= 18):
            continue
        if alpha:
            p[x, y] = (r, g, b, 0)
        queue.extend((nx, ny) for nx, ny in ((x-1, y), (x+1, y), (x, y-1), (x, y+1))
                     if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen)
    return result
