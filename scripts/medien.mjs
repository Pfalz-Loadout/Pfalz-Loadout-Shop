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
  // ---------- Range Bag ----------
  { key: 'rb-coyote-front', src: `${RB}/studio/coyote/20251103_194403.jpg`, sizes: STAGE },
  { key: 'rb-coyote-offen', src: `${RB}/studio/coyote/20251103_194047.jpg`, sizes: STAGE },
  { key: 'rb-coyote-zipper', src: `${RB}/studio/coyote/20251103_194320.jpg`, sizes: DETAIL },
  { key: 'rb-coyote-dring', src: `${RB}/studio/coyote/20251103_194348.jpg`, sizes: DETAIL },
  { key: 'rb-coyote-klett', src: `${RB}/studio/coyote/20251103_193207.jpg`, sizes: DETAIL },
  { key: 'rb-coyote-gurt', src: `${RB}/studio/coyote/20251103_193858.jpg`, sizes: DETAIL },
  { key: 'rb-oliv-front', src: `${RB}/studio/oliv/20251103_200912.jpg`, sizes: STAGE },
  { key: 'rb-oliv-quer', src: `${RB}/studio/oliv/20251103_201003.jpg`, sizes: STAGE },
  { key: 'rb-schwarz-front', src: `${RB}/studio/schwarz/20251103_195559.jpg`, sizes: STAGE },
  { key: 'rb-schwarz-offen', src: `${RB}/studio/schwarz/20251103_192137.jpg`, sizes: STAGE },
  { key: 'rb-cut-coyote', src: `${RB}/freisteller/coyote/Produktversch*bd91*.jpg`, sizes: CUT },
  { key: 'rb-cut-oliv', src: `${RB}/freisteller/oliv/Produktversch*41e4*.jpg`, sizes: CUT },
  { key: 'rb-cut-schwarz', src: `${RB}/freisteller/schwarz/Produktversch*ffbd*.jpg`, sizes: CUT },
  { key: 'rb-cut-camo', src: `${RB}/freisteller/camo/20260201_132439*.jpg`, sizes: CUT },
  { key: 'rb-dark-1', src: `${RB}/szenen-ki/schwarz/Gemini_Generated_Image_85aylf*.png`, sizes: STAGE, gemini: true },
  { key: 'rb-dark-2', src: `${RB}/szenen-ki/schwarz/Gemini_Generated_Image_ksved3*.png`, sizes: STAGE, gemini: true },
  { key: 'rb-dark-coyote', src: `${RB}/szenen-ki/coyote/Gemini_Generated_Image_59jfo5*.png`, sizes: STAGE, gemini: true },
  { key: 'rb-wald', src: `${RB}/szenen-ki/gemischt/Gemini_Generated_Image_d7z5*.png`, sizes: SCENE, gemini: true },

  // ---------- Rucksack 25 l ----------
  { key: 'dp-schwarz-front', src: `${DP}/studio/schwarz/20260131_085502.jpg`, sizes: STAGE },
  { key: 'dp-schwarz-quer', src: `${DP}/studio/schwarz/20260131_085606.jpg`, sizes: STAGE },
  { key: 'dp-schwarz-offen', src: `${DP}/studio/schwarz/20260131_085626.jpg`, sizes: DETAIL },
  { key: 'dp-schwarz-ruecken', src: `${DP}/studio/schwarz/20260131_085515.jpg`, sizes: DETAIL },
  { key: 'dp-graucamo-front', src: `${DP}/studio/grau-camo/20260131_091012.jpg`, sizes: STAGE },
  { key: 'dp-graucamo-quer', src: `${DP}/studio/grau-camo/20260131_091111.jpg`, sizes: STAGE },
  { key: 'dp-gruencamo-front', src: `${DP}/studio/gruen-camo/20260131_091753.jpg`, sizes: STAGE },
  { key: 'dp-gruencamo-quer', src: `${DP}/studio/gruen-camo/20260131_092004.jpg`, sizes: STAGE },
  { key: 'dp-cut-schwarz', src: `${DP}/freisteller/schwarz/Rucksack Schwarz.png`, sizes: CUT },
  { key: 'dp-cut-graucamo', src: `${DP}/freisteller/grau-camo/Rucksack Grau.png`, sizes: CUT },
  { key: 'dp-cut-gruencamo', src: `${DP}/studio/gruen-camo/20260131_091753.jpg`, sizes: CUT },
  { key: 'dp-traeger', src: `${DP}/freisteller/schwarz/Rucksack Schwarz 2.png`, sizes: STAGE, gemini: true },

  // ---------- IFAK ----------
  { key: 'med-coyote-front', src: `${MED}/studio/coyote/20251120_114252.jpg`, sizes: STAGE },
  { key: 'med-coyote-offen', src: `${MED}/studio/coyote/20251120_114445.jpg`, sizes: STAGE },
  { key: 'med-coyote-platte', src: `${MED}/studio/coyote/20251120_114224.jpg`, sizes: DETAIL },
  { key: 'med-oliv-front', src: `${MED}/studio/oliv/20251120_113857.jpg`, sizes: STAGE },
  { key: 'med-oliv-offen', src: `${MED}/studio/oliv/20251120_114835.jpg`, sizes: STAGE },
  { key: 'med-schwarz-front', src: `${MED}/studio/schwarz/20251120_113136.jpg`, sizes: STAGE },
  { key: 'med-schwarz-offen', src: `${MED}/studio/schwarz/20251120_112926.jpg`, sizes: STAGE },
  { key: 'med-schwarz-platte', src: `${MED}/studio/schwarz/20251120_113219.jpg`, sizes: DETAIL },
  { key: 'med-cut-schwarz', src: `${MED}/freisteller/schwarz/IFAK_SW_001 (2).jpg`, sizes: CUT },
  { key: 'med-cut-oliv', src: `${MED}/freisteller/oliv/IFAK_ODG_001 (2).jpg`, sizes: CUT },
  { key: 'med-cut-coyote', src: `${MED}/freisteller/coyote/IFAK_TAN_001 (1).jpg`, sizes: CUT },
  { key: 'med-cut-rot', src: `${MED}/freisteller/rot/IFAK_RED_001 (2).jpg`, sizes: CUT },
  { key: 'med-cut-camo', src: `${MED}/freisteller/camo/IFAK_CAM_001.jpg`, sizes: CUT },
  { key: 'med-cut-acu', src: `${MED}/freisteller/acu/IFAK_ACU_001.jpg`, sizes: CUT },
  { key: 'med-rot-stage', src: `${MED}/freisteller/rot/IFAK_RED_001 (2).jpg`, sizes: STAGE },
  { key: 'med-camo-stage', src: `${MED}/freisteller/camo/IFAK_CAM_001.jpg`, sizes: STAGE },
  { key: 'med-acu-stage', src: `${MED}/freisteller/acu/IFAK_ACU_001.jpg`, sizes: STAGE },
  { key: 'med-fahrzeug', src: `${MED}/szenen-ki/gemischt/IFAK_SW_Produktvorschau.jpg`, sizes: SCENE },
  { key: 'med-feld', src: `${MED}/szenen-ki/gemischt/IFAK_Produktfoto (1).jpg`, sizes: SCENE },
  { key: 'med-wald', src: `${MED}/szenen-ki/gemischt/IFAK_Produktvorschau.jpg`, sizes: SCENE },

  // ---------- Sling ----------
  { key: 'sl-schwarz-front', src: `${SL}/20251112_182804.jpg`, sizes: STAGE },
  { key: 'sl-oliv-front', src: `${SL}/20251112_182734.jpg`, sizes: STAGE },
  { key: 'sl-duo', src: `${SL}/20251112_182710.jpg`, sizes: STAGE },
  { key: 'sl-qd-teile', src: `${SL}/20251112_183038.jpg`, sizes: DETAIL },
  { key: 'sl-schnalle', src: `${SL}/20251112_182741.jpg`, sizes: DETAIL },
  { key: 'sl-qd-oliv', src: `${SL}/20251112_182934.jpg`, sizes: STAGE },
  { key: 'sl-schaft-oliv', src: `${SL}/20251112_183536.jpg`, sizes: STAGE },

  // ---------- Einsatz / Marke ----------
  { key: 'einsatz-stand', src: 'einsatz/schiessstand-range-bag-ki.png', sizes: SCENE, gemini: true },
  { key: 'einsatz-pfalz', src: 'einsatz/pfalz-weinberg-abendlicht.jpg', sizes: SCENE },
  { key: 'hero-oliv-start', src: 'videos/oliv-start-geschlossen-dunkel.jpg', sizes: STAGE },
  { key: 'logo-badge', src: 'logo/logo-badge.webp', sizes: [160, 320] },
];

/**
 * Bühnenfotos, die freigestellt werden (Hintergrund weg, Farbstich korrigiert, weicher Schatten).
 * Ablauf: 1) node scripts/medien.mjs --freisteller-liste > liste.json
 *         2) python -I scripts/freistellen.py liste.json <MEDIEN>/freigestellt
 *         3) node scripts/medien.mjs  → nutzt automatisch freigestellt/<key>.png
 */
const CUT_KEYS = new Set([
  'rb-coyote-front', 'rb-coyote-offen', 'rb-oliv-front', 'rb-oliv-quer', 'rb-schwarz-front', 'rb-schwarz-offen', 'rb-cut-camo',
  'dp-schwarz-front', 'dp-schwarz-quer', 'dp-graucamo-front', 'dp-graucamo-quer', 'dp-gruencamo-front', 'dp-gruencamo-quer',
  'med-coyote-front', 'med-coyote-offen', 'med-oliv-front', 'med-oliv-offen', 'med-schwarz-front', 'med-schwarz-offen',
  'med-rot-stage', 'med-camo-stage', 'med-acu-stage',
  'sl-schwarz-front', 'sl-qd-oliv', 'sl-qd-teile',
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
        const base = sharp(buf).resize({ width, withoutEnlargement: true });
        await base.clone().avif({ quality: 52, effort: 4 }).toFile(path.join(OUT, `${item.key}-${width}.avif`));
        await base.clone().webp({ quality: 74 }).toFile(path.join(OUT, `${item.key}-${width}.webp`));
      }
      // Durchschnittsfarbe als Platzhalter-Hintergrund
      const { dominant } = await sharp(buf).stats();
      meta[item.key] = {
        w,
        h,
        widths: uniq,
        v: crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8), // Cache-Buster
        bg: cut ? 'transparent' : `rgb(${dominant.r},${dominant.g},${dominant.b})`,
        cut,
      };
      console.log(`OK ${item.key.padEnd(22)} ${w}x${h} -> ${uniq.join('/')}`);
    } catch (e) {
      console.error(`FEHLT ${item.key}: ${e.message}`);
    }
  }
  await fs.writeFile(JSON_OUT, JSON.stringify(meta, null, 1));
  console.log(`\n${Object.keys(meta).length} Medien -> ${path.relative(process.cwd(), JSON_OUT)}`);
}

run();

