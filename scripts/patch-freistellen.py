"""PVC-Patch (rotes Kreuz, Originalfoto auf weißem Grund) freistellen + Leucht-Ebene nur fürs rote Kreuz.

Aufruf (rembg-venv):  python -I scripts/patch-freistellen.py [medienordner]
Quelle: <medien>/zubehoer/patch/patch-rotes-kreuz.jpg
Ziel:   <medien>/freigestellt/zb-patch.png, zb-patch-glow.png (gleiche Leinwand, transparenter Rand)
Danach: node scripts/medien.mjs zb-
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

MEDIEN = Path(sys.argv[1] if len(sys.argv) > 1 else "C:/Users/d-bee/OneDrive/Dokumente/Claude/pfalz-loadout-shop/medien")
SRC = MEDIEN / "zubehoer/patch/patch-rotes-kreuz.jpg"
ziel = MEDIEN / "freigestellt"

a = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
lum = a.mean(2)
# Patch = alles, was nicht (fast) weiß ist; größte Fläche, Löcher füllen, Kante glätten
patch = lum < 232
lab, n = ndimage.label(patch)
gr = ndimage.sum(patch, lab, range(1, n + 1))
patch = lab == (int(np.argmax(gr)) + 1)
patch = ndimage.binary_fill_holes(ndimage.binary_closing(patch, iterations=2))
patch = ndimage.binary_opening(patch, iterations=2)
S = 4
big = Image.fromarray((patch * 255).astype(np.uint8)).resize((patch.shape[1] * S, patch.shape[0] * S), Image.BICUBIC)
big = big.filter(ImageFilter.GaussianBlur(S * 0.8)).point(lambda v: 255 if v > 127 else 0)
maske = big.resize((patch.shape[1], patch.shape[0]), Image.LANCZOS)
cut = Image.fromarray(a.astype(np.uint8)).convert("RGBA")
cut.putalpha(maske)
bb = maske.point(lambda v: 255 if v > 30 else 0).getbbox()
pad = round(max(bb[2] - bb[0], bb[3] - bb[1]) * 0.12)
cut = cut.crop(bb)
leinwand = Image.new("RGBA", (cut.width + 2 * pad, cut.height + 2 * pad), (0, 0, 0, 0))
leinwand.paste(cut, (pad, pad))
leinwand.save(ziel / "zb-patch.png")

# Leucht-Ebene: nur das rote Kreuz, aufgehellt + weicher roter Schein
c = np.asarray(leinwand).astype(np.float32)
rgb, al = c[..., :3], c[..., 3]
kreuz = (rgb[..., 0] > 110) & (rgb[..., 0] > rgb[..., 1] * 1.6) & (rgb[..., 0] > rgb[..., 2] * 1.6) & (al > 200)
kreuz = ndimage.binary_fill_holes(ndimage.binary_opening(kreuz, iterations=1))
km = Image.fromarray((kreuz * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
schein = km.filter(ImageFilter.GaussianBlur(leinwand.width * 0.05))
k_a = np.asarray(km).astype(np.float32) / 255
s_a = np.asarray(schein).astype(np.float32) / 255 * 0.85
hell = np.clip(rgb * 1.2 + 30, 0, 255)
farbe = np.array([255, 70, 45], np.float32)
out_a = 1 - (1 - s_a) * (1 - k_a)
out_rgb = (farbe * s_a[..., None] * (1 - k_a[..., None]) + hell * k_a[..., None]) / np.maximum(out_a[..., None], 1e-4)
Image.fromarray(np.dstack([np.clip(out_rgb, 0, 255), out_a * 255]).astype(np.uint8), "RGBA").save(ziel / "zb-patch-glow.png")
print("Patch", leinwand.size, "Kreuzpixel", int(kreuz.sum()))
