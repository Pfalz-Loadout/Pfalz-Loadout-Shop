"""Eigenes Wasserzeichen (Logo unten rechts) aus den Rucksack-Fotos entfernen.
Aufruf (rembg-venv):  python -I scripts/wasserzeichen-weg.py <bild> [<bild> ...]   (alle Bilder zusammen angeben)
Original wird als <name>.orig.<ext> daneben gesichert (und immer als Quelle genutzt). Danach: node scripts/medien.mjs dp-
Das Logo sitzt in allen Bildern an derselben Stelle: Maske = Vereinigung der Erkennungen aller Bilder (nicht-weiße Teile
in der Ecke unten rechts), Rucksack (Olivton / Schwarz) bleibt unangetastet; Fläche wird aus dem sauberen Boden interpoliert.
"""
import sys, shutil
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.interpolate import griddata

pfade = [Path(a) for a in sys.argv[1:]]
daten = []
G = None
for p in pfade:
    orig = p.with_name(p.stem + ".orig" + p.suffix)
    if not orig.exists():
        shutil.copy2(p, orig)
    a = np.asarray(Image.open(orig).convert("RGB")).astype(np.float32)
    H, W, _ = a.shape
    lum = a.mean(2)
    dk = lum < 165
    lab, n = ndimage.label(dk, structure=np.ones((3, 3)))
    gr = ndimage.sum(dk, lab, range(1, n + 1))
    bag = np.isin(lab, [i + 1 for i, g in enumerate(gr) if g > 30000])
    bag_near = ndimage.binary_dilation(bag, iterations=5)
    box = np.zeros((H, W), bool)
    box[int(H * 0.795):int(H * 0.945), int(W * 0.665):int(W * 0.965)] = True
    cand = ((lum < 232) | ((a[..., 2] - a[..., 0]) > 3)) & box & ~bag_near
    cand = ndimage.binary_closing(cand, iterations=2)
    lab2, n2 = ndimage.label(cand, structure=np.ones((3, 3)))
    keep = np.zeros_like(cand)
    for i in range(1, n2 + 1):
        m = lab2 == i
        if not (ndimage.binary_dilation(m, iterations=3) & bag).any() and m.sum() > 12:
            keep |= m
    wm = ndimage.binary_dilation(keep, iterations=10)
    wm &= ndimage.binary_dilation(box, iterations=8)
    G = wm if G is None else (G | wm)
    daten.append((p, a, lum, bag))

for p, a, lum, bag in daten:
    # Rucksack-Pixel (olivfarben oder sehr dunkel) nie überschreiben
    olive = ((a[..., 0] - a[..., 2]) > 16) & (lum < 200)
    schwarz = lum < 70
    schutz = ndimage.binary_dilation(bag & (olive | schwarz), iterations=1)
    wm = G & ~schutz
    ring = ndimage.binary_dilation(wm, iterations=20) & ~ndimage.binary_dilation(wm, iterations=8) & ~schutz & (lum > 200)
    ys, xs = np.nonzero(ring)
    ty, tx = np.nonzero(wm)
    out = a.copy()
    for c in range(3):
        lin = griddata((ys, xs), a[ys, xs, c], (ty, tx), method="linear")
        nn = griddata((ys, xs), a[ys, xs, c], (ty, tx), method="nearest")
        out[ty, tx, c] = np.where(np.isnan(lin), nn, lin)
    soft = ndimage.gaussian_filter(wm.astype(np.float32), 4.0)[..., None]
    res = a * (1 - soft) + ndimage.gaussian_filter(out, (1.5, 1.5, 0)) * soft
    Image.fromarray(np.clip(res, 0, 255).astype(np.uint8)).save(p)
    print(p.parent.name, p.name, int(wm.sum()), "px")
