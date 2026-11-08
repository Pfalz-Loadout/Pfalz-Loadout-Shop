"""Produktfotos freistellen, Farbstich korrigieren, einheitlich ausrichten (ohne Schatten).

Aufruf: python -I freistellen.py <liste.json> <zielordner>
liste.json: [{"key": "...", "src": "C:/.../foto.jpg"}, ...]
Ausgabe: <ziel>/<key>.png (RGBA, 1200x1600, Produkt mittig, Standfläche bei 86 %)
         <ziel>/transform.json (Abbildung Original-% -> Ausgabe-% für Hotspots)
"""
import json
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter, ImageOps
from scipy import ndimage

MODELL = Path.home() / ".shopify" / "modelle" / "isnet-general-use.onnx"
W, H = 1200, 1600          # Ausgabe 3:4
FLOOR = 0.86               # Standfläche (Unterkante Produkt) in % der Höhe
MAX_W, MAX_H = 0.80, 0.70  # maximale Produktgröße


def maske(sess, img):
    x = img.convert("RGB").resize((1024, 1024), Image.LANCZOS)
    a = (np.asarray(x, dtype=np.float32) / 255.0 - 0.5).transpose(2, 0, 1)[None]
    pred = sess.run(None, {sess.get_inputs()[0].name: a})[0][0, 0]
    pred = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
    m = np.asarray(Image.fromarray((pred * 255).astype(np.uint8)).resize(img.size, Image.LANCZOS), np.float32) / 255.0
    lab, n = ndimage.label(m > 0.5)
    if n > 1:
        groessen = ndimage.sum(np.ones_like(m), lab, range(1, n + 1))
        # alle größeren Teile behalten (z. B. Montageset neben dem Riemen), Krümel weg
        behalten = np.isin(lab, [i + 1 for i, g in enumerate(groessen) if g > 0.02 * groessen.max()])
        m = m * ndimage.binary_dilation(behalten, iterations=4)
    # Kante leicht straffen (kein Grauschleier)
    m = np.clip((m - 0.08) / 0.84, 0, 1)
    return m


def weissabgleich(rgb, m):
    """Hintergrund (sicher außerhalb des Motivs) soll neutral grau sein → Kanal-Gains."""
    bg = m < 0.02
    if bg.sum() < 1000:
        return rgb
    med = np.median(rgb[bg], axis=0)
    gain = med.mean() / np.maximum(med, 1)
    gain = np.clip(gain, 0.85, 1.15)
    return np.clip(rgb * gain, 0, 255)


def main(liste, ziel):
    ziel = Path(ziel)
    ziel.mkdir(parents=True, exist_ok=True)
    sess = ort.InferenceSession(str(MODELL), providers=["CPUExecutionProvider"])
    transforms = {}
    for item in json.loads(Path(liste).read_text(encoding="utf-8")):
        img = ImageOps.exif_transpose(Image.open(item["src"])).convert("RGB")
        img.thumbnail((2000, 2000), Image.LANCZOS)
        iw, ih = img.size
        m = maske(sess, img)
        rgb = weissabgleich(np.asarray(img, np.float32), m)

        ys, xs = np.nonzero(m > 0.5)
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        bw, bh = x1 - x0 + 1, y1 - y0 + 1
        s = min(MAX_W * W / bw, MAX_H * H / bh)
        # Ausschnitt skalieren und platzieren
        crop_rgb = Image.fromarray(rgb.astype(np.uint8)).crop((x0, y0, x1 + 1, y1 + 1))
        crop_m = Image.fromarray((m * 255).astype(np.uint8)).crop((x0, y0, x1 + 1, y1 + 1))
        nw, nh = max(1, round(bw * s)), max(1, round(bh * s))
        crop_rgb = crop_rgb.resize((nw, nh), Image.LANCZOS)
        crop_m = crop_m.resize((nw, nh), Image.LANCZOS)
        px = (W - nw) // 2
        py = round(FLOOR * H) - nh

        prod = np.zeros((H, W), np.float32)
        prod[py:py + nh, px:px + nw] = np.asarray(crop_m, np.float32) / 255.0
        color = np.zeros((H, W, 3), np.float32)
        color[py:py + nh, px:px + nw] = np.asarray(crop_rgb, np.float32)

        # Kein Schatten (Wunsch: künstliche Schatten wirken nicht echt) – nur freigestelltes Produkt
        out = np.dstack([np.clip(color, 0, 255), prod * 255]).astype(np.uint8)
        Image.fromarray(out, "RGBA").save(ziel / f"{item['key']}.png", optimize=True)

        # Abbildung für Hotspots: Original-Pixel → Ausgabe-Pixel
        transforms[item["key"]] = {"iw": iw, "ih": ih, "x0": int(x0), "y0": int(y0), "s": s, "px": px, "py": py, "W": W, "H": H}
        print(f"{item['key']}: {iw}x{ih} -> {W}x{H}, Gains-Hintergrund ok", flush=True)

    (ziel / "transform.json").write_text(json.dumps(transforms, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
