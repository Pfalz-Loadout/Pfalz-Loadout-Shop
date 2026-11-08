"""Zahlenschloss-Originalfotos (weißer Grund) freistellen – ohne Farbkorrektur, ohne Retusche.

Aufruf (rembg-venv):  python -I scripts/schloss-freistellen.py [medienordner]
Quelle:  <medien>/zubehoer/zahlenschloss/<farbe>.(jpg|jpeg|png|webp)
Ziel:    <medien>/freigestellt/zs-<farbe>.png       (RGBA, mit Rand, damit das Leuchten nicht abgeschnitten wird)
         <medien>/freigestellt/zs-<farbe>-glow.png  (gleiche Leinwand: NUR das farbige Gehäuse, aufgehellt + weicher Schein)
Danach:  node scripts/medien.mjs zs-
"""
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps
from scipy import ndimage

MEDIEN = Path(sys.argv[1] if len(sys.argv) > 1 else "C:/Users/d-bee/OneDrive/Dokumente/Claude/pfalz-loadout-shop/medien")
FARBEN = ["schwarz", "pink", "gruen", "orange", "gelb", "blau"]
os.environ.setdefault("U2NET_HOME", str(Path.home() / ".shopify" / "modelle"))

from rembg import new_session, remove  # noqa: E402  (nach U2NET_HOME)

def leuchtebene(img):
    """Nur das farbige Gehäuse: größte zusammenhängende Fläche kräftiger Farbe (TSA-Logo liegt separat im schwarzen Feld)."""
    a = np.asarray(img).astype(np.float32)
    rgb, alpha = a[..., :3], a[..., 3]
    mx, mn = rgb.max(2), rgb.min(2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    farbig = (sat > 0.32) & (mx > 70) & (alpha > 200)
    lab, n = ndimage.label(farbig)
    if n == 0:
        return None
    groessen = ndimage.sum(farbig, lab, range(1, n + 1))
    if groessen.max() < 0.08 * (alpha > 200).sum():
        return None  # z. B. schwarzes Schloss: kein farbiger Teil
    m = ndimage.binary_fill_holes(lab == (int(np.argmax(groessen)) + 1))
    m = ndimage.binary_opening(m, iterations=1)
    maske = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    hell = np.clip(rgb * 1.18 + 22, 0, 255)  # Gehäuse heller, Farbe bleibt kräftig
    farbe = rgb[m].mean(0)
    w = img.width
    schein = maske.filter(ImageFilter.GaussianBlur(w * 0.045))
    schein_a = np.asarray(schein).astype(np.float32) / 255 * 0.75
    kern_a = np.asarray(maske).astype(np.float32) / 255
    out_a = 1 - (1 - schein_a) * (1 - kern_a)
    out_rgb = (farbe * schein_a[..., None] * (1 - kern_a[..., None]) + hell * kern_a[..., None]) / np.maximum(out_a[..., None], 1e-4)
    res = np.dstack([np.clip(out_rgb, 0, 255), out_a * 255]).astype(np.uint8)
    return Image.fromarray(res, "RGBA")


session = new_session("isnet-general-use")
quelle = MEDIEN / "zubehoer" / "zahlenschloss"
ziel = MEDIEN / "freigestellt"
ziel.mkdir(exist_ok=True)

for farbe in FARBEN:
    treffer = [p for p in quelle.glob(f"{farbe}.*") if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")]
    if not treffer:
        print(f"-- {farbe}: kein Foto")
        continue
    img = ImageOps.exif_transpose(Image.open(treffer[0])).convert("RGB")
    # Alpha-Matting glättet die Kante am Chrom-Bügel
    out = remove(img, session=session, alpha_matting=True, alpha_matting_foreground_threshold=245,
                 alpha_matting_background_threshold=12, alpha_matting_erode_size=6)
    a = out.getchannel("A")
    bbox = a.point(lambda v: 255 if v > 24 else 0).getbbox()
    if bbox:
        pad = round(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * 0.09)
        out = out.crop(bbox)
        # transparenter Rand rundum (Platz fürs Leuchten)
        canvas = Image.new("RGBA", (out.width + 2 * pad, out.height + 2 * pad), (0, 0, 0, 0))
        canvas.paste(out, (pad, pad))
        out = canvas
    out.save(ziel / f"zs-{farbe}.png")
    glow = leuchtebene(out)
    if glow is not None:
        glow.save(ziel / f"zs-{farbe}-glow.png")
    print(f"OK {farbe}: {img.size} -> {out.size}")
