/**
 * Medien-Pipeline: wählt Fotos aus dem OneDrive-Medienordner, schneidet zu,
 * erzeugt AVIF + WebP in mehreren Breiten nach /public/media und schreibt
 * src/data/media.generated.json (Maße für <picture> ohne Layout-Sprünge).
 *
 *   npm run medien
 *
 * Neue Fotos: Eintrag unten in MANIFEST ergänzen (key = Name auf der Seite).
 * MEDIEN_QUELLE überschreibt den Quellordner.
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';

const SRC =
  process.env.MEDIEN_QUELLE ??
  'C:/Users/d-bee/OneDrive/Dokumente/Claude/pfalz-loadout-shop/medien';
const OUT = path.resolve('public/media');
const JSON_OUT = path.resolve('src/data/media.generated.json');

const P = 'produkte';
const RB = `${P}/PL-RB01-range-bag`;
const DP = `${P}/PL-DP02-rucksack`;
const MED = `${P}/PL-MED03-ifak`;
const SL = 'weitere-produkte/gewehrgurt';

/** Größenprofile */
const STAGE = [480, 960, 1440];
const SCENE = [768, 1280, 1920];
const CUT = [360, 720];
const DETAIL = [480, 960];

/** gemini: Gemini-Sternchen unten rechts wegschneiden */
const MANIFEST = [
  // ---------- Range Bag (Freisteller, weißer Grund) ----------
  { key: 'rb-coyote-gerade', src: `${RB}/freisteller/coyote/20251103_194403*.jpg`, sizes: STAGE },
  { key: 'rb-coyote-front', src: `${RB}/freisteller/coyote/Produktversch*bd91*.jpg`, sizes: STAGE },
  { key: 'rb-coyote-offen', src: `${RB}/freisteller/coyote/20251103_194047*.jpg`, sizes: STAGE },
  { key: 'rb-coyote-zipper', src: `${RB}/freisteller/coyote/20251103_194320*.jpg`, sizes: DETAIL },
  { key: 'rb-coyote-griff', src: `${RB}/freisteller/coyote/1.jpg`, sizes: DETAIL },
  { key: 'rb-oliv-front', src: `${RB}/freisteller/oliv/Produktversch*41e4*.jpg`, sizes: STAGE },
  { key: 'rb-oliv-quer', src: `${RB}/freisteller/oliv/20251103_201003*.jpg`, sizes: STAGE },
  { key: 'rb-schwarz-front', src: `${RB}/freisteller/schwarz/Produktversch*ffbd*.jpg`, sizes: STAGE },
  { key: 'rb-schwarz-quer', src: `${RB}/freisteller/schwarz/20251103_192702*.jpg`, sizes: STAGE },
  { key: 'rb-schwarz-offen', src: `${RB}/freisteller/schwarz/20251103_192137*.jpg`, sizes: STAGE },
  { key: 'rb-schwarz-dring', src: `${RB}/freisteller/schwarz/hfgh.jpg`, sizes: DETAIL },
  { key: 'rb-schwarz-molle', src: `${RB}/freisteller/schwarz/kwtr.jpg`, sizes: DETAIL },
  { key: 'rb-schwarz-gurt', src: `${RB}/freisteller/schwarz/81481.jpg`, sizes: DETAIL },
  { key: 'rb-camo-front', src: `${RB}/freisteller/camo/20260201_132439*.jpg`, sizes: STAGE },
  { key: 'rb-camo-offen', src: `${RB}/freisteller/camo/20260201_132525*.jpg`, sizes: STAGE },
  { key: 'rb-coyote-seite', src: `${RB}/freisteller/coyote/coyote-seite-2faecher.jpg`, sizes: STAGE },
  { key: 'rb-coyote-fronttasche', src: `${RB}/freisteller/coyote/coyote-fronttasche-offen.jpg`, sizes: STAGE },
  // Detail-Nahaufnahmen Coyote (Herstellerfotos, aus Bildstreifen geschnitten; Wasserbild ohne Schriftzug)
  ...['zipper', 'molle-klett', 'molle', 'dring-karabiner', 'klett-patch', 'griffe', 'wasser-perlt-ab'].map((n) => ({
    key: `rb-detail-${n}`,
    src: `${RB}/details/coyote-${n}.jpg`,
    sizes: [480, 750],
    q: 90,
  })),
  { key: 'rb-dark-1', src: `${RB}/szenen-ki/schwarz/Gemini_Generated_Image_85aylf*.png`, sizes: STAGE, gemini: true },
  { key: 'rb-wald', src: `${RB}/szenen-ki/gemischt/Gemini_Generated_Image_d7z5*.png`, sizes: SCENE, gemini: true },

  // ---------- Assault Pack 37 (eigene Fotos) ----------
  { key: 'dp-oliv-front', src: `${DP}/freisteller/oliv/01-front.png`, sizes: STAGE },
  { key: 'dp-oliv-seite', src: `${DP}/freisteller/oliv/02-seite.png`, sizes: STAGE },
  { key: 'dp-oliv-ruecken', src: `${DP}/freisteller/oliv/03-ruecken.png`, sizes: STAGE },
  { key: 'dp-schwarz-front', src: `${DP}/freisteller/schwarz/01-front.png`, sizes: STAGE },
  { key: 'dp-coyote-front', src: `${DP}/freisteller/coyote/01-front.jpg`, sizes: STAGE },

  // ---------- IFAK (Freisteller) ----------
  { key: 'med-coyote-front', src: `${MED}/freisteller/coyote/IFAK_TAN_001 (1).jpg`, sizes: STAGE },
  { key: 'med-coyote-offen', src: `${MED}/freisteller/coyote/IFAK_TAN_003.jpg`, sizes: STAGE },
  { key: 'med-coyote-seite', src: `${MED}/freisteller/coyote/IFAK_TAN_002.jpg`, sizes: STAGE },
  { key: 'med-oliv-rueck', src: `${MED}/freisteller/oliv/IFAK_ODG_007.jpg`, sizes: STAGE },
  { key: 'med-schwarz-rueck', src: `${MED}/freisteller/schwarz/IFAK-SW-_005.jpg`, sizes: STAGE },
  { key: 'med-camo-rueck', src: `${MED}/freisteller/camo/IFAK_CAMU_005.jpg`, sizes: STAGE },
  // Herstellerfotos (08.11.2026): Rot Rückseite + leer offen, ACU gerade, Schwarz leer offen + abgelöst von Trägerplatte, Coyote-Detail
  { key: 'med-rot-rueck', src: `${MED}/freisteller/rot/IFAK_RED_rueck.jpg`, sizes: STAGE },
  { key: 'med-rot-offen', src: `${MED}/freisteller/rot/IFAK_RED_offen-leer.jpg`, sizes: STAGE },
  { key: 'med-acu-front', src: `${MED}/freisteller/acu/IFAK_ACU_front-gerade.jpg`, sizes: STAGE },
  { key: 'med-schwarz-leer', src: `${MED}/freisteller/schwarz/IFAK_SW_offen-leer.jpg`, sizes: STAGE },
  { key: 'med-schwarz-platte', src: `${MED}/freisteller/schwarz/IFAK_SW_traegerplatte.jpg`, sizes: STAGE },
  { key: 'med-coyote-zipper', src: `${MED}/freisteller/coyote/IFAK_TAN_detail-zipper.jpg`, sizes: DETAIL },
  { key: 'med-oliv-front', src: `${MED}/freisteller/oliv/IFAK_ODG_001 (2).jpg`, sizes: STAGE },
  { key: 'med-oliv-offen', src: `${MED}/freisteller/oliv/IFAK_ODG_004.jpg`, sizes: STAGE },
  { key: 'med-schwarz-front', src: `${MED}/freisteller/schwarz/IFAK_SW_001 (2).jpg`, sizes: STAGE },
  { key: 'med-schwarz-offen', src: `${MED}/freisteller/schwarz/IFAK_SW_003.jpg`, sizes: STAGE },
  { key: 'med-rot-stage', src: `${MED}/freisteller/rot/IFAK_RED_001 (2).jpg`, sizes: STAGE },
  { key: 'med-camo-stage', src: `${MED}/freisteller/camo/IFAK_CAM_001.jpg`, sizes: STAGE },
  { key: 'med-acu-stage', src: `${MED}/freisteller/acu/IFAK_ACU_001.jpg`, sizes: STAGE },
  { key: 'med-fahrzeug', src: `${MED}/szenen-ki/gemischt/IFAK_SW_Produktvorschau.jpg`, sizes: SCENE },
  { key: 'med-feld', src: `${MED}/szenen-ki/gemischt/IFAK_Produktfoto (1).jpg`, sizes: SCENE },
  { key: 'med-wald', src: `${MED}/szenen-ki/gemischt/IFAK_Produktvorschau.jpg`, sizes: SCENE },

  // ---------- Sling ----------
  { key: 'sl-schwarz-front', src: `${SL}/20251112_182804.jpg`, sizes: STAGE },
  { key: 'sl-schwarz-stand', src: `${SL}/20251112_182827.jpg`, sizes: STAGE },
  { key: 'sl-schwarz-liegend', src: `${SL}/20251112_182624.jpg`, sizes: STAGE },
  { key: 'sl-oliv-stand', src: `${SL}/20251112_182734.jpg`, sizes: STAGE },
  { key: 'sl-oliv-liegend', src: `${SL}/20251112_182721.jpg`, sizes: STAGE },
  { key: 'sl-oliv-front', src: `${SL}/20251112_182734.jpg`, sizes: STAGE },
  { key: 'sl-duo', src: `${SL}/20251112_182710.jpg`, sizes: STAGE },
  { key: 'sl-qd-teile', src: `${SL}/20251112_183038.jpg`, sizes: DETAIL },
  { key: 'sl-schnalle', src: `${SL}/20251112_182741.jpg`, sizes: DETAIL },
  { key: 'sl-qd-oliv', src: `${SL}/20251112_182934.jpg`, sizes: STAGE },
  { key: 'sl-schaft-oliv', src: `${SL}/20251112_183536.jpg`, sizes: STAGE },
  // Beispielbilder am Gewehr (Original-Fotos, nicht freigestellt)
  { key: 'sl-mlok', src: `${SL}/20251112_183241.jpg`, sizes: STAGE },
  { key: 'sl-schaft-schwarz', src: `${SL}/20251112_183429.jpg`, sizes: STAGE },

  // ---------- Einsatz / Marke ----------
  { key: 'einsatz-stand', src: 'einsatz/schiessstand-range-bag-ki.png', sizes: SCENE, gemini: true },
  { key: 'einsatz-pfalz', src: 'einsatz/pfalz-weinberg-abendlicht.jpg', sizes: SCENE },
  // Zielfernrohr (Intro + Header-Logo): quadratischer Ausschnitt um den Tafelberg am Horizont, 6000×4000-Original
  { key: 'pfalz-scope', src: 'einsatz/pfalz-sandstein-weitblick.jpg', extract: { left: 2550, top: 0, width: 2800, height: 2800 }, sizes: [400, 1200, 2800], q: 84 },
  // Hero-Wortmarke: dasselbe Foto in voller Breite
  { key: 'pfalz-weit', src: 'einsatz/pfalz-sandstein-weitblick.jpg', sizes: [1280, 1920, 2560], q: 82 },
  { key: 'hero-oliv-start', src: 'videos/oliv-start-geschlossen-dunkel.jpg', sizes: STAGE },
  // Beweis Arbeitsmatte: grüne KWT aufgeklappt mit (Softair-)Pistole, echtes Studiofoto auf dunklem Grund
  { key: 'rb-oliv-matte', src: 'videos/oliv-ende-offen-dunkel.jpg', sizes: STAGE },
  { key: 'logo-badge', src: 'logo/logo-badge.webp', sizes: [160, 320] },
  // Header-Logo: Rahmen (Schrift, Ringe, Fadenkreuz) mit transparentem Zielfernrohr – erzeugt von scripts/logo-rahmen.py
  { key: 'logo-rahmen', src: 'logo/logo-rahmen.png', sizes: [200, 400, 652], hq: true, alpha: true },

  // ---------- Zubehör: Zahlenschloss (freigestellt, Alpha; je Farbe eine Datei zubehoer/zahlenschloss/<farbe>.png) ----------
  // Original-Produktfotos (weißer Grund) → vorher: python -I scripts/schloss-freistellen.py (legt freigestellt/zs-<farbe>.png an)
  ...['schwarz', 'pink', 'gruen', 'orange', 'gelb', 'blau'].map((f) => ({ key: `zs-${f}`, src: `zubehoer/zahlenschloss/${f}.*`, sizes: [160, 320, 480], hq: true, alpha: true })),
  // IFAK-Patch (immer dabei): freigestellt per scripts/patch-freistellen.py, Leucht-Ebene nur fürs rote Kreuz
  { key: 'zb-patch', src: 'zubehoer/patch/patch-rotes-kreuz.jpg', sizes: [120, 240, 360], hq: true, alpha: true },
  { key: 'zb-qd', src: 'zubehoer/qd-oese/qd-oese.jpg', sizes: [120, 240, 360], hq: true, alpha: true },
  { key: 'zb-patch-glow', src: 'zubehoer/patch/patch-rotes-kreuz.jpg', sizes: [120, 240, 360], hq: true, alpha: true },
  // Leucht-Ebene (nur farbiges Gehäuse), gleiche Leinwand wie das Schloss
  ...['pink', 'gruen', 'orange', 'gelb', 'blau'].map((f) => ({ key: `zs-${f}-glow`, src: `zubehoer/zahlenschloss/${f}.*`, sizes: [160, 320, 480], hq: true, alpha: true })),
];

/**
 * Bühnenfotos, die freigestellt werden (Hintergrund weg, Farbstich korrigiert, weicher Schatten).
 * Ablauf: 1) node scripts/medien.mjs --freisteller-liste > liste.json
 *         2) python -I scripts/freistellen.py liste.json <MEDIEN>/freigestellt
 *         3) node scripts/medien.mjs  → nutzt automatisch freigestellt/<key>.png
 */
// Nur Gewehrriemen: davon gibt es keine Freisteller-Originale (nur graue Studiofotos).
// Range Bag, IFAK, Rucksack nutzen die ORIGINAL-Freisteller der Person unverändert.
const CUT_KEYS = new Set([
  'sl-schwarz-front', 'sl-qd-oliv', 'sl-qd-teile',
  'sl-schwarz-stand', 'sl-schwarz-liegend', 'sl-oliv-stand', 'sl-oliv-liegend',
  'zs-schwarz', 'zs-pink', 'zs-gruen', 'zs-orange', 'zs-gelb', 'zs-blau',
  'zs-pink-glow', 'zs-gruen-glow', 'zs-orange-glow', 'zs-gelb-glow', 'zs-blau-glow',
  'zb-patch', 'zb-patch-glow', 'zb-qd',
]);
const CUT_DIR = path.join(SRC, 'freigestellt');

async function resolveSrc(pattern) {
  if (!pattern.includes('*')) return path.join(SRC, pattern);
  const dir = path.join(SRC, path.dirname(pattern));
  const rx = new RegExp(
    '^' + path.basename(pattern).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$',
    'i',
  );
  const hit = (await fs.readdir(dir)).sort().find((f) => rx.test(f));
  if (!hit) throw new Error(`nicht gefunden: ${pattern}`);
  return path.join(dir, hit);
}

async function run() {
  if (process.argv.includes('--freisteller-liste')) {
    const liste = [];
    for (const item of MANIFEST.filter((m) => CUT_KEYS.has(m.key))) {
      liste.push({ key: item.key, src: (await resolveSrc(item.src)).split(path.sep).join('/') });
    }
    process.stdout.write(JSON.stringify(liste, null, 1));
    return;
  }
  await fs.mkdir(OUT, { recursive: true });
  const meta = {};
  const only = process.argv[2];
  let prev = {};
  try {
    prev = JSON.parse(await fs.readFile(JSON_OUT, 'utf8'));
  } catch {}

  for (const item of MANIFEST) {
    if (only && !item.key.includes(only)) {
      if (prev[item.key]) meta[item.key] = prev[item.key];
      continue;
    }
    try {
      let file = await resolveSrc(item.src);
      let cut = false;
      if (CUT_KEYS.has(item.key)) {
        const p = path.join(CUT_DIR, `${item.key}.png`);
        try {
          await fs.access(p);
          file = p;
          cut = true;
        } catch {}
      }
      let img = sharp(file, { failOn: 'none' }).rotate(); // EXIF-Drehung anwenden
      const m = await img.metadata();
      let w = m.autoOrient?.width ?? m.width;
      let h = m.autoOrient?.height ?? m.height;
      if (item.extract && !cut) {
        // fester Ausschnitt aus dem Original (z. B. Zielfernrohr-Motiv)
        img = img.extract(item.extract);
        w = item.extract.width;
        h = item.extract.height;
      }
      if (item.gemini && !cut) {
        // ~7 % rechts und unten abschneiden (KI-Wasserzeichen)
        const cw = Math.round(w * 0.93);
        const ch = Math.round(h * 0.93);
        img = img.extract({ left: 0, top: 0, width: cw, height: ch });
        w = cw;
        h = ch;
      }
      const buf = await img.toBuffer();
      const widths = item.sizes.filter((s) => s < w).concat(item.sizes.some((s) => s >= w) ? [w] : []);
      const uniq = [...new Set(widths)].sort((a, b) => a - b);
      for (const width of uniq) {
        let base = sharp(buf).resize({ width, withoutEnlargement: true, kernel: 'lanczos3' });
        if (item.hq) base = base.sharpen({ sigma: 0.5, m1: 0.6, m2: 1.2 }); // Schloss: knackig nach dem Verkleinern
        await base.clone().avif({ quality: item.q ? Math.round(item.q * 0.8) : item.hq ? 72 : 52, effort: item.hq || item.q ? 7 : 4 }).toFile(path.join(OUT, `${item.key}-${width}.avif`));
        await base.clone().webp(item.hq ? { quality: 92, alphaQuality: 100, smartSubsample: true } : { quality: item.q ?? 74, smartSubsample: !!item.q }).toFile(path.join(OUT, `${item.key}-${width}.webp`));
      }
      // Freiraum oben rechts (Anteil der Bildhöhe ohne Produkt im rechten 22-%-Streifen) → Platz fürs Zahlenschloss
      const probe = await sharp(buf).resize({ width: 200 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let tr = 1;
      {
        const { data, info } = probe;
        const x0 = Math.floor(info.width * 0.78);
        outer: for (let y = 0; y < info.height; y++) {
          for (let x = x0; x < info.width; x++) {
            const i = (y * info.width + x) * 4;
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            if (data[i + 3] > 32 && lum < 232) {
              tr = y / info.height;
              break outer;
            }
          }
        }
      }
      // Durchschnittsfarbe als Platzhalter-Hintergrund
      const { dominant } = await sharp(buf).stats();
      meta[item.key] = {
        w,
        h,
        widths: uniq,
        v: crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8), // Cache-Buster
        bg: cut || item.alpha ? 'transparent' : `rgb(${dominant.r},${dominant.g},${dominant.b})`,
        cut,
        tr: Math.round(tr * 1000) / 1000,
      };
      console.log(`OK ${item.key.padEnd(22)} ${w}x${h} -> ${uniq.join('/')}`);
    } catch (e) {
      console.error(`FEHLT ${item.key}: ${e.message}`);
      if (prev[item.key]) meta[item.key] = prev[item.key];
    }
  }
  await fs.writeFile(JSON_OUT, JSON.stringify(meta, null, 1));
  console.log(`\n${Object.keys(meta).length} Medien -> ${path.relative(process.cwd(), JSON_OUT)}`);
}

run();

