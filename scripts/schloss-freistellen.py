"""Zahlenschloss-Originalfotos (weißer Grund) freistellen – ohne Farbkorrektur, ohne Retusche.

Aufruf (rembg-venv):  python -I scripts/schloss-freistellen.py [medienordner]
Quelle:  <medien>/zubehoer/zahlenschloss/<farbe>.(jpg|jpeg|png|webp)
Ziel:    <medien>/freigestellt/zs-<farbe>.png  (RGBA, eng auf das Schloss zugeschnitten)
Danach:  node scripts/medien.mjs zs-
"""
import os
import sys
from pathlib import Path

from PIL import Image, ImageOps

MEDIEN = Path(sys.argv[1] if len(sys.argv) > 1 else "C:/Users/d-bee/OneDrive/Dokumente/Claude/pfalz-loadout-shop/medien")
FARBEN = ["schwarz", "pink", "gruen", "orange", "gelb", "blau"]
os.environ.setdefault("U2NET_HOME", str(Path.home() / ".shopify" / "modelle"))

from rembg import new_session, remove  # noqa: E402  (nach U2NET_HOME)

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
        pad = round(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * 0.03)
        bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(out.width, bbox[2] + pad), min(out.height, bbox[3] + pad))
        out = out.crop(bbox)
    out.save(ziel / f"zs-{farbe}.png")
    print(f"OK {farbe}: {img.size} -> {out.size}")
