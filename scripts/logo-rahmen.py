"""Logo mit Fadenkreuz → Rahmen-PNG mit transparentem Zielfernrohr-Inneren (dort sitzt das echte Pfalz-Foto).

Aufruf (rembg-venv):  python -I scripts/logo-rahmen.py <medien>/logo/logo-fadenkreuz.webp <medien>/logo/logo-rahmen.png
Außerhalb des Kreises: Original (Schrift, Ringe, Fadenkreuz) als Schwarz mit Alpha.
Im Kreis: Fadenkreuz mit Mil-Dots sauber nachgezeichnet, Buchstaben „out“ aus dem Original mit weißem Rand.
Gibt die Kreisgeometrie (in % der Ausgabe) aus → src/components/Logo.tsx.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

src, ziel = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
H, W = a.shape[:2]
CX, CY = 530.0, 425.0     # Mittelpunkt Zielfernrohr (Originalpixel)
R_IN = 133.0              # innerer Ring beginnt hier
yy, xx = np.mgrid[0:H, 0:W]
r = np.hypot(xx - CX, yy - CY)
lum = a.mean(2)
mx, mn = a.max(2), a.min(2)
sat = (mx - mn) / np.maximum(mx, 1)

# 1) Grundlage: alles als Schwarz mit Alpha aus der Helligkeit
alpha = np.clip((255 - lum) / 255, 0, 1)
rgb = np.zeros_like(a)
# Ringzone: weißer Spalt zwischen den Ringen bleibt weiß und deckend
ring = (r >= R_IN) & (r <= 154)
rgb[ring] = a[ring]
alpha[ring] = 1.0

# 2) Kreisinneres leeren
innen = r < R_IN
alpha[innen] = 0.0

# 3) Buchstaben „out“ (große schwarze Flächen) aus dem Original + weißer Rand
kand = (lum < 150) & (sat < 0.45) & (xx < CX + 4) & (yy > 470) & (yy < 590)
lab, n = ndimage.label(kand)
groesse = ndimage.sum(kand, lab, range(1, n + 1))
text = np.isin(lab, [i + 1 for i, g in enumerate(groesse) if g > 250])
text = ndimage.binary_fill_holes(ndimage.binary_closing(text, iterations=2))
halo = ndimage.binary_dilation(text, iterations=6) & ~text
sel = innen & halo
rgb[sel] = 255
alpha[sel] = 1.0
sel = innen & text
rgb[sel] = 0
alpha[sel] = 1.0

base = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")

# 4) Fadenkreuz im Kreis nachzeichnen (4-fach überabgetastet → glatte Kanten)
S = 4
k = Image.new("L", (W * S, H * S), 0)
d = ImageDraw.Draw(k)
t = 3.5  # halbe Linienstärke (Original 7 px)
d.rectangle([(CX - R_IN) * S, (CY - t) * S, (CX + R_IN) * S, (CY + t) * S], fill=255)
d.rectangle([(CX - t) * S, (CY - R_IN) * S, (CX + t) * S, (CY + R_IN) * S], fill=255)
for off in (17, 31, 45, 59):
    for dx, dy in ((-off, 0), (0, -off), (0, off)):   # links, oben, unten wie im Original
        px, py = CX + dx, CY + dy
        e = 6.0
        d.polygon([((px - e) * S, py * S), (px * S, (py - e) * S), ((px + e) * S, py * S), (px * S, (py + e) * S)], fill=255)
k = k.resize((W, H), Image.LANCZOS)
km = np.asarray(k).astype(np.float32) / 255 * (r < R_IN + 1)
# Kreuz liegt unter der Schrift: dort, wo Schrift/Halo deckend sind, nicht übermalen
deck = (innen & (text | halo))
km[deck] = 0
o = np.asarray(base).astype(np.float32)
o_a = o[..., 3] / 255
neu_a = km + o_a * (1 - km)
o_rgb = (o[..., :3] * (o_a * (1 - km))[..., None]) / np.maximum(neu_a[..., None], 1e-4)
img = Image.fromarray(np.dstack([o_rgb, neu_a * 255]).clip(0, 255).astype(np.uint8), "RGBA")

x0, y0, x1, y1 = 80, 216, 732, 620
img = img.crop((x0, y0, x1, y1))
img.save(ziel)
w, h = img.size
print(f"Ausgabe {w}x{h}  Kreis: cx={(CX - x0) / w * 100:.3f}%  cy={(CY - y0) / h * 100:.3f}%  r_innen={R_IN / w * 100:.3f}% der Breite")
