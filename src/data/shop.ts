/**
 * PFALZ LOADOUT – zentrale Shopdaten
 * ------------------------------------------------------------------
 * ALLES, was sich im Shop ändern kann, steht hier: Produkte, Varianten,
 * Preise, Specs, Materialangaben, Versand, Bundle-Rabatt, Medien.
 * Die Seite UND die Bestell-API lesen diese Datei – Preise werden
 * serverseitig immer neu berechnet (Client-Preise werden ignoriert).
 *
 * Preise in CENT (3790 = 37,90 €).
 * Markierung „TODO-PREIS“ = Platzhalter, bis echte Preise feststehen.
 */

export type StockState = 'lager' | 'wenige' | 'ausverkauft';

export type ColorKey = 'schwarz' | 'oliv' | 'coyote' | 'camo' | 'acu' | 'rot' | 'grau-camo' | 'gruen-camo';

export const COLORS: Record<ColorKey, { label: string; swatch: string }> = {
  schwarz: { label: 'Schwarz', swatch: '#1b1b1b' },
  oliv: { label: 'Oliv', swatch: '#4a5236' },
  coyote: { label: 'Coyote', swatch: '#a8885e' },
  camo: { label: 'Camo', swatch: 'linear-gradient(135deg,#6b6a4a 0 30%,#3e4430 30% 55%,#9a8a63 55% 80%,#2f3326 80%)' },
  acu: { label: 'ACU', swatch: 'linear-gradient(135deg,#9a9c8f 0 30%,#6f7468 30% 55%,#c2c0b0 55% 80%,#5a5e55 80%)' },
  rot: { label: 'Rot', swatch: '#8f1d1d' },
  'grau-camo': { label: 'Grau-Camo', swatch: 'linear-gradient(135deg,#8c8a80 0 30%,#5c5b55 30% 55%,#b4b0a2 55% 80%,#45443f 80%)' },
  'gruen-camo': { label: 'Grün-Camo', swatch: 'linear-gradient(135deg,#7b7550 0 30%,#4d5236 30% 55%,#b09a6c 55% 80%,#3a3a2a 80%)' },
};

export type Variant = {
  /** eindeutige SKU, landet in Bestellung + PayPal */
  sku: string;
  color: ColorKey;
  /** Zusatzoption, z. B. „mit Zahlenschloss“ */
  option?: string;
  priceCents: number;
  stock: StockState;
};

export type Spec = { label: string; value: string };

/** Ein „Beweis-Moment“ im Materiallabor – nur Herstellerangaben, keine erfundenen Messwerte */
export type ProofMoment = {
  id: string;
  title: string;
  property: string; // Eigenschaft
  material: string; // Material / Bauteil
  source: string; // Herkunft der Angabe
  text: string;
  /** Medienplatzhalter mit Drehanweisung (wird angezeigt, bis Datei existiert) */
  media: MediaSlot;
};

export type MediaSlot = {
  kind: 'video' | 'image' | 'shader-fabric' | 'svg-molle' | 'svg-qd' | 'scale-length' | 'compare';
  /** Pfad relativ zu /public – leer lassen, solange es die Datei nicht gibt */
  src?: string;
  poster?: string;
  /** Für compare: zweites Bild */
  srcB?: string;
  labelA?: string;
  labelB?: string;
  /** Drehanweisung für den Platzhalter */
  brief: string;
  /** Timer-Overlay (z. B. IFAK-Zugriff) – zeigt die echte Videozeit, keine Behauptung */
  timer?: boolean;
  /** 'contain' = ganzes Motiv zeigen (Hochformat-Video im Querformat-Rahmen) */
  fit?: 'cover' | 'contain';
};

/** Hotspot je Bühnenfoto: Position in Prozent (x, y) pro Medien-Key */
export type Hotspot = { label: string; text: string; at: Record<string, [number, number]> };

export type Product = {
  code: string; // Produktcode = Markenzeichen
  slug: string;
  name: string;
  category: string;
  serial: string; // Seriennummer-Optik
  claim: string;
  description: string;
  variants: Variant[];
  specs: Spec[];
  /** Hotspots auf den Bühnenfotos (Position je Foto) */
  hotspots: Hotspot[];
  lab: ProofMoment[];
  /** Bühne: Studiofotos je Farbe (Basisname in /public/media/…) */
  stage: Partial<Record<ColorKey, string[]>>;
  /** Freisteller (weißer Grund) für Loadout-Builder je Farbe */
  cutout: Partial<Record<ColorKey, string>>;
  /** 3D-Modell (GLB) – austauschbarer Platzhalter, bis dahin prozeduraler Ersatzkörper */
  model3d?: string;
  /** Hinweistext unter dem Kaufbutton */
  note?: string;
  /** Drei kurze Nutzen-Sätze (Mobil-Karte, Kaufargument) */
  bullets: [string, string, string];
  /** Wofür – kurze Einsatzzeile */
  use: string;
};

/* ------------------------------------------------------------------ */
/*  Shop-Einstellungen                                                 */
/* ------------------------------------------------------------------ */

export const SHOP = {
  brand: 'PFALZ LOADOUT',
  claim: 'Gebaut für den Moment, in dem es zählt.',
  coords: { lat: '49.3° N', lon: '7.8° E', label: 'Pfälzerwald' },
  origin: { lat: '49.63° N', lon: '8.36° E', label: 'Worms' },
  currency: 'EUR',
  /** Versand: Pauschale + Gratisgrenze – TODO-PREIS: Werte von dir */
  shipping: {
    flatCents: 490,
    freeFromCents: 7500,
    country: 'DE',
    handlingDays: '1–2 Werktage',
    carrier: 'DHL / Hermes',
  },
  /** Mengenrabatt: −10 % auf ein Produkt, sobald mind. 3 Stück davon im Warenkorb liegen (Farben gemischt zählen) */
  volume: { percent: 10, minQty: 3, codes: ['PL-RB01', 'PL-MED03'] as string[], label: '−10 % ab 3 IFAK oder 3 Range Bags' },
  /** Kleinunternehmerregelung */
  vatNote: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.',
  /** Zahlungsarten – Klarna ist vorbereitet, aber aus, bis ein Klarna-Händlerkonto steht */
  payments: [
    { id: 'paypal', label: 'PayPal', hint: 'Auch „Später bezahlen“ und Lastschrift über PayPal', enabled: true },
    { id: 'ueberweisung', label: 'Überweisung (Vorkasse)', hint: 'Versand nach Zahlungseingang', enabled: true },
    { id: 'klarna', label: 'Klarna', hint: 'Folgt in Kürze', enabled: false },
  ] as const,
  contact: {
    company: 'Pfalz Loadout',
    owner: 'Jasmin Beer',
    street: 'Wormser Landstr. 117',
    zip: '67551',
    city: 'Worms',
    country: 'Deutschland',
    phone: '+49 160 5086983',
    email: 'kontakt@pfalz-loadout.de',
    vatId: 'DE 444410908',
    epr: 'DE4547228151445',
  },
  ebay: { url: 'https://www.ebay.de/usr/pfalz-loadout', rating: '100 % positiv', count: 56, asOf: 'Nov. 2026' },
} as const;

/* ------------------------------------------------------------------ */
/*  Produkte                                                           */
/* ------------------------------------------------------------------ */

const OXFORD_600D_PVC = '600D Oxford-Polyester, PVC-beschichtet';

export const PRODUCTS: Product[] = [
  {
    code: 'PL-RB01',
    bullets: ['Waffe, 6 Magazine, Munition – ein Griff','Aufklappen = Arbeitsmatte am Stand','Abschließbar mit Zahlenschloss'],
    use: 'Schießstand · Training · Transport',
    slug: 'range-bag',
    name: 'Range Bag',
    category: 'Kurzwaffentasche / Schießstand',
    serial: 'SN 01-0425-RB',
    claim: 'Alles für die Bahn. In einer Hand.',
    description:
      'Die Schießstandtasche für Kurzwaffe, Magazine, Gehörschutz und Munition. Zwei gepolsterte Hauptfächer, Munitionsfach und Schlaufen für bis zu 6 Magazine. Ausgeklappt wird das Innenfutter zur sauberen Arbeitsmatte – zum Reinigen und Warten direkt am Stand.',
    variants: [
      // Preis = Wunsch-Erlös + PayPal-Gebühr (2,49 % + 0,35 €), auf ,90 gerundet
      { sku: 'PL-RB01-SW', color: 'schwarz', priceCents: 3090, stock: 'lager' },
      { sku: 'PL-RB01-SW-LOCK', color: 'schwarz', option: 'mit Zahlenschloss', priceCents: 3290, stock: 'lager' },
      { sku: 'PL-RB01-OD', color: 'oliv', priceCents: 3090, stock: 'lager' },
      { sku: 'PL-RB01-OD-LOCK', color: 'oliv', option: 'mit Zahlenschloss', priceCents: 3290, stock: 'lager' },
      { sku: 'PL-RB01-CY', color: 'coyote', priceCents: 3090, stock: 'lager' },
      { sku: 'PL-RB01-CY-LOCK', color: 'coyote', option: 'mit Zahlenschloss', priceCents: 3290, stock: 'lager' },
      { sku: 'PL-RB01-CA', color: 'camo', priceCents: 3090, stock: 'ausverkauft' },
    ],
    specs: [
      { label: 'Maße', value: '33 × 24 cm' },
      { label: 'Material', value: OXFORD_600D_PVC },
      { label: 'Reißverschluss', value: 'SBS, wasserabweisend, abschließbar' },
      { label: 'Magazinplätze', value: 'bis zu 6 (elastische Schlaufen)' },
      { label: 'Fächer', value: '2 gepolsterte Hauptfächer, Munitionsfach, Fronttasche' },
      { label: 'Außen', value: 'MOLLE-Gurtband, Klettfläche für Patches' },
      { label: 'Tragen', value: 'Tragegriffe + abnehmbarer Schultergurt mit Karabinern' },
    ],
    hotspots: [
      { label: 'MOLLE', text: 'Gurtbandraster für Pouches – z. B. das IFAK PL-MED03.', at: { 'rb-coyote-front': [52, 66], 'rb-oliv-front': [54, 68], 'rb-schwarz-quer': [44, 66], 'rb-camo-front': [53, 68] } },
      { label: 'Griff', text: 'Doppelter Tragegriff, mit Klett zusammengefasst.', at: { 'rb-coyote-front': [45, 39], 'rb-oliv-front': [45, 38], 'rb-schwarz-quer': [44, 38], 'rb-camo-front': [46, 37] } },
      { label: 'SBS-Zipper', text: 'Wasserabweisender Reißverschluss, abschließbar.', at: { 'rb-coyote-front': [14, 63], 'rb-oliv-front': [12, 66], 'rb-schwarz-quer': [84, 62], 'rb-camo-front': [15, 60] } },
      { label: 'Klett', text: 'Flauschfläche für Namens- und Kennungspatches.', at: { 'rb-coyote-front': [55, 55], 'rb-oliv-front': [54, 55], 'rb-camo-front': [57, 46] } },
    ],
    lab: [
      {
        id: 'rb-gewebe',
        title: 'Gewebe',
        property: 'Abriebfest & formstabil',
        material: OXFORD_600D_PVC,
        source: 'Herstellerangabe',
        text: '600 Denier: Jeder Faden wiegt 600 g auf 9.000 m. Das dichte Oxford-Gewebe hält Kanten, Kisten und Betonböden am Stand aus.',
        media: { kind: 'shader-fabric', brief: 'Interaktive Gewebe-Struktur (läuft im Browser)' },
      },
      {
        id: 'rb-matte',
        title: 'Arbeitsmatte',
        property: 'Ausgeklappt = Ablagefläche',
        material: 'Innenfutter, gepolstert',
        source: 'Produktbeschreibung',
        text: 'Aufklappen, flach legen, arbeiten. Das Innenfutter dient als saubere Unterlage zum Zerlegen und Reinigen.',
        media: {
          kind: 'compare',
          src: 'rb-coyote-front',
          srcB: 'rb-coyote-offen',
          labelA: 'Transport',
          labelB: 'Arbeitsmatte',
          brief: 'Zwei Fotos, gleiche Perspektive von oben: Tasche geschlossen / komplett aufgeklappt',
        },
      },
      {
        id: 'rb-innen',
        title: 'Innenleben',
        property: 'Alles an seinem Platz',
        material: 'Gepolstertes Futter, 6 elastische Magazinschlaufen',
        source: 'Produktbeschreibung',
        text: 'Aufklappen und alles liegt offen: Magazine in den Schlaufen, Kurzwaffe auf dem gepolsterten Futter, Schloss griffbereit. Abgebildete Softair-Pistole, Magazine und Schloss sind nicht im Lieferumfang.',
        media: {
          kind: 'video',
          src: '/videos/pl-rb01-innenleben.mp4',
          poster: '/videos/pl-rb01-innenleben-poster.jpg',
          fit: 'contain',
          brief: 'KI-animiert aus echten Studiofotos der Range Bag (geschlossen → geöffnet)',
        },
      },
      {
        id: 'rb-zipper',
        title: 'Reißverschluss',
        property: 'Wasserabweisend & abschließbar',
        material: 'SBS-Reißverschluss, Schieber mit Ösen',
        source: 'Herstellerangabe',
        text: 'Die Schieber treffen sich an einer Öse – dort greift das Zahlenschloss (Variante „mit Zahlenschloss“).',
        media: {
          kind: 'video',
          brief: 'Makro, 6 Sek. Loop: Hand mit Schießhandschuh öffnet den Reißverschluss einhändig. Seitenlicht von links, dunkler Hintergrund, Kamera fix auf Schieberhöhe.',
        },
      },
    ],
    stage: { coyote: ['rb-coyote-front', 'rb-coyote-offen'], oliv: ['rb-oliv-front', 'rb-oliv-quer'], schwarz: ['rb-schwarz-quer', 'rb-schwarz-offen'], camo: ['rb-camo-front', 'rb-camo-offen'] },
    cutout: { coyote: 'rb-coyote-front', oliv: 'rb-oliv-front', schwarz: 'rb-schwarz-quer', camo: 'rb-camo-front' },
    model3d: '/models/pl-rb01.glb',
    note: 'Abgebildete Patches, Waffen und Zubehör sind nicht im Lieferumfang. Für den Transport von Waffen gelten die Vorschriften des WaffG – bitte prüfe sie für deinen Fall selbst.',
  },
  {
    code: 'PL-DP02',
    bullets: ['37 Liter bei nur 1,7 kg', 'Laptopfach 15" + Trinkblasenfach', 'MOLLE rundum, 1050D Nylon'],
    use: 'Gelände · Pendeln · Mehrtagestour',
    slug: 'rucksack',
    name: 'Assault Pack 37',
    category: 'Rucksack / 37 Liter',
    serial: 'SN 02-0425-DP',
    claim: 'Gepackt für alles, was der Tag bringt.',
    description:
      'Mittelgroßer Taktik-Rucksack für den Alltag und das Gelände: 37 Liter Volumen bei nur 1,7 kg. Gepolstertes Laptopfach bis 15 Zoll, verstecktes Fach mit Klett-Innenseite, fleecegefütterte Brillentasche, Trinkblasenfach und rundum MOLLE-Schlaufen. Aus robustem, wasserabweisendem 1050D Nylon.',
    variants: [
      { sku: 'PL-DP02-SW', color: 'schwarz', priceCents: 3090, stock: 'lager' },
      { sku: 'PL-DP02-OD', color: 'oliv', priceCents: 3090, stock: 'lager' },
    ],
    specs: [
      { label: 'Volumen', value: '37 l' },
      { label: 'Gewicht', value: '1,7 kg' },
      { label: 'Material', value: '1050D Nylon, wasserabweisend' },
      { label: 'Maße', value: 'Hauptfach 50,8 × 31,8 × 20,3 cm' },
      { label: 'Fronttasche', value: '31,8 × 27,9 × 5 cm, mit Organizer' },
      { label: 'Laptop', value: 'gepolstertes Fach bis 15 Zoll' },
      { label: 'Trinkblase', value: 'Fach 43 × 32 cm am Rücken' },
      { label: 'Extras', value: 'verstecktes Fach mit Klett, Fleece-Brillentasche' },
      { label: 'System', value: 'MOLLE / PALS rundum' },
    ],
    hotspots: [
      { label: 'MOLLE', text: 'PALS-Reihen auf Front und Seiten – Pouches flechten statt nur durchziehen.', at: { 'dp-oliv-front': [66, 73], 'dp-schwarz-front': [47, 71] } },
      { label: 'Griff', text: 'Verstärkte Tragschlaufe oben.', at: { 'dp-oliv-front': [49, 20], 'dp-schwarz-front': [43, 18] } },
      { label: 'Kompression', text: 'Seitliche Kompressionsriemen halten die Ladung ruhig.', at: { 'dp-oliv-front': [21, 63], 'dp-schwarz-front': [19, 52] } },
      { label: 'Klett', text: 'Flauschflächen für Patches und Kennungen.', at: { 'dp-oliv-front': [58, 55] } },
    ],
    lab: [
      {
        id: 'dp-molle',
        title: 'MOLLE / PALS',
        property: 'Modular erweiterbar',
        material: 'Gurtband-Raster (PALS)',
        source: 'Konstruktionsprinzip',
        text: 'Richtig montiert wird der Riemen abwechselnd durch Rucksack und Pouch geflochten – Plattform, Tasche, Plattform, Tasche. So sitzt die Tasche fest und schlackert nicht.',
        media: { kind: 'svg-molle', brief: 'Animierte Erklärung (läuft im Browser)' },
      },
      {
        id: 'dp-wasser',
        title: 'Beschichtung',
        property: 'Wasserabweisend',
        material: '1050D Nylon, beschichtet',
        source: 'Herstellerangabe',
        text: 'Regen perlt ab, statt einzuziehen. Wasserabweisend heißt nicht wasserdicht – für Dauerregen gehört Wichtiges in einen Packsack.',
        media: {
          kind: 'video',
          brief: 'Zeitlupe, 5 Sek. Loop: feiner Wasserstrahl aus Sprühflasche auf die Rucksackfront, Tropfen perlen ab. Gegenlicht von hinten oben, damit die Tropfen leuchten.',
        },
      },
    ],
    stage: { oliv: ['dp-oliv-front'], schwarz: ['dp-schwarz-front'] },
    cutout: { oliv: 'dp-oliv-front', schwarz: 'dp-schwarz-front' },
    model3d: '/models/pl-dp02.glb',
  },
  {
    code: 'PL-MED03',
    bullets: ['Ein Zug – und die Pouch ist ab','Aufklappen, alles liegt offen','Passt an Rucksack, Gürtel oder Bein'],
    use: 'Notfall · Gelände · Fahrzeug',
    slug: 'ifak',
    name: 'IFAK Pouch',
    category: 'Erste Hilfe / Schnellzugriff',
    serial: 'SN 03-0425-MED',
    claim: 'Aufreißen. Aufklappen. Handeln.',
    description:
      'Erste-Hilfe-Pouch für dein Individual First Aid Kit. Die Tasche sitzt per Klett auf einer MOLLE-Trägerplatte und lässt sich im Notfall mit einem Zug abreißen. Der Rundum-Reißverschluss öffnet über die ganze Höhe, innen halten Gummischlaufen und ein Netzfach alles an seinem Platz. Inklusive PVC-Patch.',
    variants: [
      { sku: 'PL-MED03-SW', color: 'schwarz', priceCents: 1090, stock: 'lager' },
      { sku: 'PL-MED03-OD', color: 'oliv', priceCents: 1090, stock: 'lager' },
      { sku: 'PL-MED03-CY', color: 'coyote', priceCents: 1090, stock: 'lager' },
      { sku: 'PL-MED03-RT', color: 'rot', priceCents: 1090, stock: 'lager' },
      { sku: 'PL-MED03-CA', color: 'camo', priceCents: 1090, stock: 'lager' },
      { sku: 'PL-MED03-ACU', color: 'acu', priceCents: 1090, stock: 'lager' },
    ],
    specs: [
      { label: 'Maße', value: '21 × 15 × 11 cm' },
      { label: 'Material', value: 'Oxford-Nylon' },
      { label: 'Befestigung', value: 'MOLLE-Trägerplatte, Klett-Abreißfunktion' },
      { label: 'Tragen', value: 'MOLLE, Gürtel oder Bein (Riemen + Schnalle)' },
      { label: 'Innen', value: 'Gummischlaufen, Netzfach mit Reißverschluss' },
      { label: 'Lieferumfang', value: 'Pouch + Trägerplatte + PVC-Patch, ohne Inhalt' },
    ],
    hotspots: [
      { label: 'Patch', text: 'Klettfläche + PVC-Patch: im Ernstfall sofort erkennbar.', at: { 'med-coyote-front': [76, 41], 'med-oliv-front': [78, 41], 'med-schwarz-front': [74, 41], 'med-rot-stage': [77, 42] } },
      { label: 'Zuglasche', text: 'Griff zum Abreißen von der Trägerplatte.', at: { 'med-coyote-front': [45, 19], 'med-oliv-front': [46, 19], 'med-schwarz-front': [41, 19], 'med-rot-stage': [42, 19] } },
      { label: 'Schnalle', text: 'Steckschnalle hält die Pouch geschlossen, bis du ziehst.', at: { 'med-coyote-front': [60, 36], 'med-oliv-front': [65, 36], 'med-schwarz-front': [58, 36], 'med-rot-stage': [63, 36] } },
      { label: 'Zipper', text: 'Rundum-Reißverschluss, öffnet über die ganze Höhe.', at: { 'med-coyote-front': [24, 73], 'med-oliv-front': [20, 76], 'med-schwarz-front': [23, 71] } },
    ],
    lab: [
      {
        id: 'med-zugriff',
        title: 'Schnellzugriff',
        property: 'Abreißen mit einer Hand',
        material: 'Großflächige Klettverbindung zur Trägerplatte',
        source: 'Produktbeschreibung',
        text: 'Die Pouch bleibt am Rucksack, bis du sie brauchst. Dann: Zuglasche greifen, abreißen, aufklappen.',
        media: {
          kind: 'video',
          timer: true,
          brief: 'Echtzeit, ungeschnitten, 4–6 Sek.: IFAK am Rucksack, Hand greift Zuglasche, reißt ab, klappt auf. Der Timer im Overlay zeigt die echte Videolaufzeit. Kamera seitlich, Tageslicht, draußen.',
        },
      },
      {
        id: 'med-innen',
        title: 'Innenleben',
        property: 'Ordnung unter Stress',
        material: 'Gummischlaufen, Netzfach',
        source: 'Produktbeschreibung',
        text: 'Aufgeklappt liegt alles offen vor dir – keine Wühlerei, wenn es schnell gehen muss. Inhalt nicht im Lieferumfang.',
        media: {
          kind: 'video',
          brief: 'Top-down, 5 Sek. Loop: aufgeklappte Pouch, Hände entnehmen Verband und Schere. Weiches Licht von oben, neutraler Untergrund.',
        },
      },
    ],
    stage: { coyote: ['med-coyote-front', 'med-coyote-offen'], oliv: ['med-oliv-front', 'med-oliv-offen'], schwarz: ['med-schwarz-front', 'med-schwarz-offen'], rot: ['med-rot-stage'], camo: ['med-camo-stage'], acu: ['med-acu-stage'] },
    cutout: { coyote: 'med-coyote-front', oliv: 'med-oliv-front', schwarz: 'med-schwarz-front', rot: 'med-rot-stage', camo: 'med-camo-stage', acu: 'med-acu-stage' },
    model3d: '/models/pl-med03.glb',
    note: 'Lieferung ohne medizinischen Inhalt.',
  },
  {
    code: 'PL-SL04',
    bullets: ['Ein- oder Zweipunkt in Sekunden','Stufenlos 90–140 cm, ein Zug','QD: einrasten, mit einer Hand lösen'],
    use: 'Schießstand · Jagd · Training',
    slug: 'gewehrgurt',
    name: 'Sling',
    category: 'Gewehrriemen / Ein- & Zweipunkt',
    serial: 'SN 04-0425-SL',
    claim: 'Hält, wenn die Hände frei sein müssen.',
    description:
      'Gewehrriemen mit QD-Anschluss, in Sekunden zwischen Ein- und Zweipunkt umgebaut. Nylon-Gurtband 3,2 cm, Länge stufenlos von 90 bis 140 cm – zum Tragen lang, im Anschlag kurz.',
    variants: [
      // Riemen in Schwarz oder Oliv, optional mit QD-Öse (Montageset) für +2 €
      { sku: 'PL-SL04-SW', color: 'schwarz', option: 'Riemen', priceCents: 1090, stock: 'lager' },
      { sku: 'PL-SL04-SW-QD', color: 'schwarz', option: '+ QD-Öse', priceCents: 1290, stock: 'lager' },
      { sku: 'PL-SL04-OD', color: 'oliv', option: 'Riemen', priceCents: 1090, stock: 'lager' },
      { sku: 'PL-SL04-OD-QD', color: 'oliv', option: '+ QD-Öse', priceCents: 1290, stock: 'lager' },
    ],
    specs: [
      { label: 'Typ', value: 'Ein- / Zweipunkt, schnell umbaubar' },
      { label: 'Anschluss', value: 'QD (Quick Detach)' },
      { label: 'Gurtband', value: 'Nylon, 3,2 cm breit' },
      { label: 'Länge', value: 'stufenlos 90–140 cm' },
      { label: 'Farben', value: 'Schwarz, Oliv' },
      { label: 'Option + QD-Öse', value: '+2 €: QD-Swivel, Montageplatte, Schrauben, Nutensteine, Inbus' },
    ],
    hotspots: [
      { label: 'Schnalle', text: 'Schiebeschnalle: Länge stufenlos von 90 bis 140 cm.', at: { 'sl-schwarz-front': [53, 43], 'sl-oliv-front': [56, 45] } },
      { label: 'Umbau-Clip', text: 'Schnell zwischen Ein- und Zweipunkt wechseln.', at: { 'sl-qd-oliv': [58, 44] } },
      { label: 'QD-Swivel', text: 'Drückknopf-Swivel: einrasten, drehen, mit einer Hand lösen.', at: { 'sl-schwarz-front': [23, 23], 'sl-oliv-front': [55, 89], 'sl-qd-oliv': [84, 65], 'sl-qd-teile': [21, 75] } },
      { label: 'QD-Öse', text: 'Optional (+2 €): Montageplatte, Schrauben, Nutensteine und Inbus.', at: { 'sl-qd-oliv': [28, 70], 'sl-qd-teile': [21, 57] } },
      { label: 'Gurtband', text: 'Nylon, 3,2 cm breit.', at: { 'sl-qd-oliv': [34, 39] } },
    ],
    lab: [
      {
        id: 'sl-umbau',
        title: 'Umbau',
        property: 'Ein- auf Zweipunkt in Sekunden',
        material: 'QD-Swivel, Umbau-Clip',
        source: 'Produktbeschreibung',
        text: 'Einpunkt für schnelle Wechsel der Schulter, Zweipunkt zum entspannten Tragen. Der Timer läuft im Video in Echtzeit mit – ungeschnitten.',
        media: {
          kind: 'video',
          timer: true,
          brief: 'Echtzeit, ungeschnitten, 5–8 Sek.: Riemen hängt als Einpunkt, Hände klipsen das zweite Ende ein → Zweipunkt. Kamera fix auf Brusthöhe, Tageslicht, dunkles Oberteil, ruhiger Hintergrund. Timer im Overlay = echte Videolaufzeit.',
        },
      },
      {
        id: 'sl-qd',
        title: 'QD-Verbindung',
        property: 'Drücken, einsetzen, einrasten',
        material: 'QD-Swivel mit Drückknopf und Sperrkugeln, Montageplatte',
        source: 'Funktionsprinzip QD',
        text: 'Knopf drücken, Swivel in die Montageplatte setzen, loslassen – die Sperrkugeln greifen und halten. Zum Lösen wieder drücken, mit einer Hand. Die QD-Öse gibt es als Option für +2 €.',
        media: { kind: 'svg-qd', brief: 'Animierte Schnittzeichnung (läuft im Browser)' },
      },
      {
        id: 'sl-laenge',
        title: 'Länge',
        property: 'Stufenlos 90–140 cm',
        material: 'Schiebeschnalle, Nylon-Gurtband 3,2 cm',
        source: 'Produktbeschreibung',
        text: 'Zum Tragen lang, im Anschlag kurz – ein Zug an der Lasche reicht, ohne Rasten und ohne Werkzeug.',
        media: { kind: 'scale-length', brief: 'Animierte Messskala (läuft im Browser)' },
      },
    ],
    stage: { schwarz: ['sl-schwarz-front', 'sl-qd-teile'], oliv: ['sl-qd-oliv', 'sl-qd-teile'] },
    cutout: { schwarz: 'sl-schwarz-front', oliv: 'sl-qd-oliv' },
  },
];

/* ------------------------------------------------------------------ */
/*  Hilfsfunktionen (Client + Server)                                  */
/* ------------------------------------------------------------------ */

export const productByCode = (code: string) => PRODUCTS.find((p) => p.code === code);

export function findVariant(sku: string): { product: Product; variant: Variant } | undefined {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) return { product, variant };
  }
  return undefined;
}

export const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.priceCents));

export const formatEuro = (cents: number) =>
  (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

export type CartLine = { sku: string; qty: number };

export type Totals = {
  lines: { sku: string; qty: number; name: string; code: string; variantLabel: string; unitCents: number; lineCents: number }[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  /** irgendein Mengenrabatt aktiv */
  bundleActive: boolean;
  /** Produkte (Namen), für die der Rabatt greift */
  discountFor: string[];
  /** Hinweis, wie viele Stück bis zum Rabatt fehlen – oder null */
  volumeHint: string | null;
  missingForFreeShippingCents: number;
};

export const variantLabel = (v: Variant) => [COLORS[v.color].label, v.option].filter(Boolean).join(' · ');

/** Einzige Stelle, an der gerechnet wird – identisch auf Client und Server */
export function computeTotals(cart: CartLine[]): Totals {
  const lines = cart
    .map((l) => {
      const hit = findVariant(l.sku);
      if (!hit || l.qty < 1) return null;
      const qty = Math.min(Math.floor(l.qty), 20);
      return {
        sku: l.sku,
        qty,
        name: hit.product.name,
        code: hit.product.code,
        variantLabel: variantLabel(hit.variant),
        unitCents: hit.variant.priceCents,
        lineCents: hit.variant.priceCents * qty,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotalCents = lines.reduce((s, l) => s + l.lineCents, 0);
  // Mengenrabatt je Produkt (z. B. 3× IFAK in beliebigen Farben)
  const V = SHOP.volume;
  let discountCents = 0;
  const discountFor: string[] = [];
  let volumeHint: string | null = null;
  let bestMissing = Infinity;
  for (const code of V.codes) {
    const own = lines.filter((l) => l.code === code);
    const qty = own.reduce((s, l) => s + l.qty, 0);
    if (!qty) continue;
    const name = own[0].name;
    if (qty >= V.minQty) {
      discountCents += Math.round((own.reduce((s, l) => s + l.lineCents, 0) * V.percent) / 100);
      discountFor.push(name);
    } else if (V.minQty - qty < bestMissing) {
      bestMissing = V.minQty - qty;
      volumeHint = `Noch ${bestMissing}× ${name} → −${V.percent} %`;
    }
  }
  const bundleActive = discountCents > 0;
  const afterDiscount = subtotalCents - discountCents;
  const free = afterDiscount >= SHOP.shipping.freeFromCents;
  const shippingCents = lines.length === 0 || free ? 0 : SHOP.shipping.flatCents;
  return {
    lines,
    subtotalCents,
    discountCents,
    shippingCents,
    totalCents: afterDiscount + shippingCents,
    bundleActive,
    discountFor,
    volumeHint,
    missingForFreeShippingCents: free ? 0 : Math.max(0, SHOP.shipping.freeFromCents - afterDiscount),
  };
}
