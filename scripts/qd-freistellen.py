"""QD-Öse (Originalfoto auf weißem Grund) freistellen, keine Retusche.
Aufruf (rembg-venv):  python -I scripts/qd-freistellen.py [medienordner]
Quelle: <medien>/zubehoer/qd-oese/qd-oese.jpg  ->  <medien>/freigestellt/zb-qd.png
Danach: node scripts/medien.mjs zb-qd
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

MEDIEN = Path(sys.argv[1] if len(sys.argv) > 1 else "C:/Users/d-bee/OneDrive/Dokumente/Claude/pfalz-loadout-shop/medien")
a = np.asarray(Image.open(MEDIEN / "zubehoer/qd-oese/qd-oese.jpg").convert("RGB")).astype(np.float32)
lum = a.min(2)
weiss = lum > 236  # Hintergrund inkl. Ring-Innenraum
lab, n = ndimage.label(weiss)
gr = ndimage.sum(weiss, lab, range(1, n + 1))
bg = np.isin(lab, [i + 1 for i, g in enumerate(gr) if g > 400])
obj = ndimage.binary_opening(~bg, iterations=1)
S = 4
big = Image.fromarray((obj * 255).astype(np.uint8)).resize((obj.shape[1] * S, obj.shape[0] * S), Image.BICUBIC)
big = big.filter(ImageFilter.GaussianBlur(S * 0.7)).point(lambda v: 255 if v > 127 else 0)
m = big.resize((obj.shape[1], obj.shape[0]), Image.LANCZOS)
cut = Image.fromarray(a.astype(np.uint8)).convert("RGBA")
cut.putalpha(m)
bb = m.point(lambda v: 255 if v > 30 else 0).getbbox()
pad = round(max(bb[2] - bb[0], bb[3] - bb[1]) * 0.06)
cut = cut.crop(bb)
c = Image.new("RGBA", (cut.width + 2 * pad, cut.height + 2 * pad), (0, 0, 0, 0))
c.paste(cut, (pad, pad))
c.save(MEDIEN / "freigestellt/zb-qd.png")
print(c.size)
