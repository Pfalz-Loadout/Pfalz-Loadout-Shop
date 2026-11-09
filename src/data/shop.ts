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

/** Farbnummer im Produktcode: 01 ist immer Schwarz, 02 immer Oliv usw. */
export const COLOR_NO: Record<ColorKey, string> = {'schwarz':'01', 'oliv':'02', 'coyote':'03', 'camo':'04', 'rot':'05', 'acu':'06', 'grau-camo':'07', 'gruen-camo':'08'};

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
  /** Zusatzbilder, die bei einer gewählten Ausführung hinten angehängt werden (z. B. QD-Teile) */
  optionStage?: Record<string, string[]>;
  /** Geteilte Vorschau: bei dieser Ausführung erscheint rechts ein zweites Bild (z. B. QD-Montage am Gewehr) */
  optionSplit?: Record<string, { k: string; label: string }>;
  /** Zubehör, das immer dabei ist: Abzeichen oben rechts im Vorschaubild (wie das Zahlenschloss, aber ohne Auswahl) */
  badge?: { k: string; glow?: string; label: string };
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
  volume: { percent: 10, minQty: 3, codes: ['PL_KWT', 'PL_IFAK'] as string[], label: '−10 % ab 3 IFAK oder 3 Range Bags' },
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
    code: 'PL_KWT',
    bullets: ['Waffe, 6 Magazine, Munition – ein Griff','Aufklappen = Arbeitsmatte am Stand','Abschließbar – Transport nach § 12 WaffG'],
    use: 'Schießstand · Training · Transport',
    slug: 'range-bag',
    name: 'Range Bag',
    category: 'Kurzwaffentasche / Schießstand',
    serial: 'SN KWT-0425',
    claim: 'Alles für die Bahn. In einer Hand.',
    description:
      'Die Schießstandtasche für Kurzwaffe, Magazine, Gehörschutz und Munition. Zwei gepolsterte Hauptfächer, Munitionsfach und Schlaufen für bis zu 6 Magazine. Ausgeklappt wird das Innenfutter zur sauberen Arbeitsmatte – zum Reinigen und Warten direkt am Stand. Optional mit Zahlenschloss (+ 2 €), Farbe nach Verfügbarkeit.',
    variants: [
      // Preis = Wunsch-Erlös + PayPal-Gebühr (2,49 % + 0,35 €), auf ,90 gerundet
      { sku: 'PL_KWT_01', color: 'schwarz', priceCents: 3090, stock: 'lager' },
      { sku: 'PL_KWT_01-ZS', color: 'schwarz', option: 'mit Zahlenschloss', priceCents: 3290, stock: 'lager' },
      { sku: 'PL_KWT_02', color: 'oliv', priceCents: 3090, stock: 'lager' },
      { sku: 'PL_KWT_02-ZS', color: 'oliv', option: 'mit Zahlenschloss', priceCents: 3290, stock: 'lager' },
      { sku: 'PL_KWT_03', color: 'coyote', priceCents: 3090, stock: 'lager' },
      { sku: 'PL_KWT_03-ZS', color: 'coyote', option: 'mit Zahlenschloss', priceCents: 3290, stock: 'lager' },
      { sku: 'PL_KWT_04', color: 'camo', priceCents: 3090, stock: 'ausverkauft' },
    ],
    specs: [
      { label: 'Maße', value: '33 × 24 cm' },
      { label: 'Material', value: OXFORD_600D_PVC },
      { label: 'Reißverschluss', value: 'SBS, wasserabweisend, abschließbar' },
      { label: 'Option Zahlenschloss', value: '+2 €: Zahlenschloss für die Reißverschluss-Ösen, Farbe nach Verfügbarkeit' },
      { label: 'Transport', value: 'Abgeschlossen = verschlossenes Behältnis, „nicht zugriffsbereit“ (§ 12 Abs. 3 Nr. 2 WaffG)' },
      { label: 'Magazinplätze', value: 'bis zu 6 (elastische Schlaufen)' },
      { label: 'Fächer', value: '2 gepolsterte Hauptfächer für 2 Kurzwaffen (erprobt bis 6 Zoll Lauf), Munitionsfach, Fronttasche' },
      { label: 'Außen', value: 'MOLLE-Gurtband, Klettfläche für Patches' },
      { label: 'Tragen', value: 'Tragegriffe + abnehmbarer Schultergurt mit Karabinern' },
    ],
    hotspots: [
      { label: 'MOLLE', text: 'Gurtbandraster für Pouches – z. B. das IFAK PL_IFAK.', at: { 'rb-oliv-quer': [45, 56], 'rb-coyote-gerade': [42, 60], 'rb-coyote-front': [55, 55], 'rb-oliv-front': [54, 58], 'rb-schwarz-quer': [45, 58], 'rb-schwarz-front': [54, 57], 'rb-camo-front': [55, 60] } },
      { label: 'Griff', text: 'Doppelter Tragegriff, mit Klett zusammengefasst.', at: { 'rb-oliv-quer': [47, 23], 'rb-coyote-gerade': [47, 22], 'rb-coyote-front': [47, 26], 'rb-oliv-front': [45, 28], 'rb-schwarz-quer': [45, 29], 'rb-schwarz-front': [44, 26], 'rb-camo-front': [48, 30] } },
      { label: 'SBS-Zipper', text: 'Wasserabweisender Reißverschluss, abschließbar – für den Transport nach § 12 WaffG.', at: { 'rb-oliv-quer': [87, 56], 'rb-coyote-gerade': [87, 56], 'rb-coyote-front': [13, 52], 'rb-oliv-front': [12, 56], 'rb-schwarz-quer': [87, 54], 'rb-schwarz-front': [12, 52], 'rb-camo-front': [18, 52] } },
      { label: 'Klett', text: 'Flauschfläche für Namens- und Kennungspatches.', at: { 'rb-coyote-front': [58, 43], 'rb-oliv-front': [54, 45], 'rb-schwarz-front': [56, 43], 'rb-camo-front': [59, 38] } },
      // Seite + Fronttasche (Coyote)
      { label: '2 Hauptfächer', text: 'Zwei getrennte Hauptfächer mit eigenem Reißverschluss – zum Beispiel eines für die Waffe, eines für Gehörschutz und Munition.', at: { 'rb-coyote-seite': [50, 57] } },
      { label: 'Fronttasche', text: 'Organizer mit Stift- und Werkzeugschlaufen: Kleinteile, Werkzeug, Notizen griffbereit vorn.', at: { 'rb-coyote-fronttasche': [50, 58] } },
      // aufgeklappte Ansichten
      { label: 'Magazine', text: 'Sechs elastische Schlaufen: Magazine stehen sortiert und griffbereit.', at: { 'rb-schwarz-offen': [56, 41], 'rb-coyote-offen': [62, 43], 'rb-camo-offen': [62, 44] } },
      { label: '2 Waffenfächer', text: 'Zwei gepolsterte Fächer für zwei Kurzwaffen – erprobt mit Lauflänge bis 6 Zoll.', at: { 'rb-schwarz-offen': [22, 68], 'rb-coyote-offen': [40, 72], 'rb-camo-offen': [40, 71] } },
      { label: 'Arbeitsmatte', text: 'Weiche Fläche: aufgeklappt deine Unterlage zum Zerlegen und Reinigen am Stand.', at: { 'rb-schwarz-offen': [45, 60], 'rb-coyote-offen': [55, 60], 'rb-camo-offen': [55, 62] } },
    ],
    lab: [
      {
        id: 'rb-gewebe',
        title: 'Gewebe',
        property: 'Wasserabweisend & abriebfest',
        material: OXFORD_600D_PVC,
        source: 'Herstellerangabe + Herstellerfoto',
        text: 'Wasser perlt auf dem PVC-beschichteten Gewebe ab, statt einzuziehen – Regen am Stand oder nasser Boden machen der Tasche nichts. 600 Denier: Jeder Faden wiegt 600 g auf 9.000 m, das dichte Oxford-Gewebe hält Kanten, Kisten und Betonböden aus. Wasserabweisend heißt nicht wasserdicht: untertauchen sollte man sie nicht.',
        media: { kind: 'image', src: 'rb-detail-wasser-perlt-ab', brief: 'Wassertropfen perlen auf dem Gewebe ab' },
      },
      {
        id: 'rb-matte',
        title: 'Arbeitsmatte',
        property: 'Ausgeklappt = Ablagefläche',
        material: 'Innenfutter, gepolstert',
        source: 'Produktbeschreibung',
        text: 'Aufklappen, flach legen, arbeiten. Die weiche Fläche dient als saubere Unterlage zum Zerlegen und Reinigen – die Waffe liegt geschützt, Magazine stehen daneben griffbereit. Abgebildete Softair-Pistole, Magazine und Schloss sind nicht im Lieferumfang.',
        media: {
          kind: 'image',
          src: 'rb-oliv-matte',
          fit: 'contain',
          brief: 'Grüne Range Bag aufgeklappt, Pistole auf der Arbeitsfläche',
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
        property: 'Abschließbar – Transport nach § 12 WaffG',
        material: 'SBS-Reißverschluss, Schieber mit Ösen, Paracord-Zuglaschen',
        source: 'Herstellerangabe + Herstellerfoto',
        text: 'Die Schieber treffen sich an einer Öse – dort greift das Zahlenschloss (Variante „mit Zahlenschloss“). Abgeschlossen ist die Tasche ein verschlossenes Behältnis: So transportierst du deine Waffe ungeladen und „nicht zugriffsbereit“, wie es § 12 Abs. 3 Nr. 2 WaffG für den Weg zum Stand verlangt.',
        media: { kind: 'image', src: 'rb-detail-zipper', brief: 'Doppelschieber mit Paracord-Zuglaschen' },
      },
    ],
    // Reihenfolge immer gleich: 1. Front (Klettfeld für Patch), 2. MOLLE-Seite, 3. offen
    stage: { schwarz: ['rb-schwarz-front', 'rb-schwarz-quer', 'rb-schwarz-offen'], oliv: ['rb-oliv-front', 'rb-oliv-quer'], coyote: ['rb-coyote-front', 'rb-coyote-gerade', 'rb-coyote-seite', 'rb-coyote-fronttasche', 'rb-coyote-offen'], camo: ['rb-camo-front', 'rb-camo-offen'] },
    cutout: { schwarz: 'rb-schwarz-front', oliv: 'rb-oliv-front', coyote: 'rb-coyote-front', camo: 'rb-camo-front' },
    model3d: '/models/pl-rb01.glb',
    note: 'Farbe des Zahlenschlosses nach Verfügbarkeit. Abgebildete Patches, Waffen und Zubehör sind nicht im Lieferumfang. Für den Transport von Waffen gelten die Vorschriften des WaffG – bitte prüfe sie für deinen Fall selbst.',
  },
  {
    code: 'PL_AP',
    bullets: ['37 Liter bei nur 1,7 kg', 'Laptopfach 15" + Trinkblasenfach', 'MOLLE rundum, 1050D Nylon'],
    use: 'Gelände · Pendeln · Mehrtagestour',
    slug: 'rucksack',
    name: 'Assault Pack 37',
    category: 'Rucksack / 37 Liter',
    serial: 'SN AP-0425',
    claim: 'Gepackt für alles, was der Tag bringt.',
    description:
      'Mittelgroßer Taktik-Rucksack für den Alltag und das Gelände: 37 Liter Volumen bei nur 1,7 kg. Gepolstertes Laptopfach bis 15 Zoll, verstecktes Fach mit Klett-Innenseite, fleecegefütterte Brillentasche, Trinkblasenfach und rundum MOLLE-Schlaufen. Aus robustem, wasserabweisendem 1050D Nylon.',
    variants: [
      { sku: 'PL_AP_01', color: 'schwarz', priceCents: 3090, stock: 'lager' },
      { sku: 'PL_AP_02', color: 'oliv', priceCents: 3090, stock: 'lager' },
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
      { label: 'MOLLE', text: 'PALS-Reihen auf Front und Seiten – Pouches flechten statt nur durchziehen.', at: { 'dp-oliv-front': [64, 71], 'dp-schwarz-front': [48, 71] } },
      { label: 'Griff', text: 'Verstärkte Tragschlaufe oben.', at: { 'dp-oliv-front': [47, 19], 'dp-schwarz-front': [44, 18] } },
      { label: 'Kompression', text: 'Seitliche Kompressionsriemen halten die Ladung ruhig.', at: { 'dp-oliv-front': [20, 62], 'dp-schwarz-front': [20, 52] } },
      { label: 'Klett', text: 'Flauschflächen für Patches und Kennungen.', at: { 'dp-oliv-front': [56, 54] } },
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
    code: 'PL_IFAK',
    bullets: ['Ein Zug – und die Pouch ist ab','Aufklappen, alles liegt offen','Passt an Rucksack, Gürtel oder Bein'],
    use: 'Notfall · Gelände · Fahrzeug',
    slug: 'ifak',
    name: 'IFAK Pouch',
    category: 'Erste Hilfe / Schnellzugriff',
    serial: 'SN IFAK-0425',
    claim: 'Aufreißen. Aufklappen. Handeln.',
    description:
      'Erste-Hilfe-Pouch für dein Individual First Aid Kit. Die Tasche sitzt per Klett auf einer MOLLE-Trägerplatte und lässt sich im Notfall mit einem Zug abreißen. Der Rundum-Reißverschluss öffnet über die ganze Höhe, innen halten Gummischlaufen und ein Netzfach alles an seinem Platz. Inklusive PVC-Patch.',
    variants: [
      { sku: 'PL_IFAK_01', color: 'schwarz', priceCents: 1090, stock: 'lager' },
      { sku: 'PL_IFAK_02', color: 'oliv', priceCents: 1090, stock: 'lager' },
      { sku: 'PL_IFAK_03', color: 'coyote', priceCents: 1090, stock: 'lager' },
      { sku: 'PL_IFAK_05', color: 'rot', priceCents: 1090, stock: 'lager' },
      { sku: 'PL_IFAK_04', color: 'camo', priceCents: 1090, stock: 'lager' },
      { sku: 'PL_IFAK_06', color: 'acu', priceCents: 1090, stock: 'lager' },
    ],
    specs: [
      { label: 'Maße', value: '21 × 15 × 11 cm' },
      { label: 'Material', value: 'Oxford-Nylon' },
      { label: 'Befestigung', value: 'MOLLE-Trägerplatte, Klett-Abreißfunktion' },
      { label: 'Tragen', value: 'MOLLE, Gürtel oder Bein (Riemen + Schnalle)' },
      { label: 'Innen', value: 'Deckel: Fächer + Gummibänder · Boden: Taschen + Gummischlaufen · Klappe: Netzfach mit Reißverschluss' },
      { label: 'Reißverschluss', value: 'Rundum, 2 Schieber mit Paracord-Zuglaschen' },
      { label: 'Lieferumfang', value: 'Pouch + Trägerplatte + PVC-Patch, ohne Inhalt' },
    ],
    hotspots: [
      { label: 'Patch', text: 'Klettfläche + PVC-Patch: im Ernstfall sofort erkennbar.', at: { 'med-coyote-front': [74, 49], 'med-oliv-front': [74, 49], 'med-schwarz-front': [70, 49], 'med-rot-stage': [72, 51] } },
      { label: 'Trägerplatte', text: 'Hinten: MOLLE-Streifen für Rucksack, Gürtel oder Weste – abwechselnd durch die Schlaufen fädeln und unten fixieren. Die Pouch hält per Klett darauf.', at: { 'med-coyote-seite': [36, 55], 'med-oliv-rueck': [40, 55], 'med-schwarz-rueck': [31, 50], 'med-camo-rueck': [46, 55], 'med-rot-rueck': [50, 45], 'med-schwarz-platte': [62, 60] } },
      { label: 'Abreißen', text: 'Ein Zug, und die Pouch ist von der Platte gelöst: Sie kommt mit zum Verletzten, die Platte bleibt am Rucksack.', at: { 'med-schwarz-platte': [30, 46] } },
      { label: 'Riemen', text: 'Riemen mit Steckschnalle: die Pouch auch am Bein oder Gürtel tragen.', at: { 'med-rot-rueck': [14, 70], 'med-schwarz-platte': [86, 72] } },
      { label: 'Zuglasche', text: 'Griff zum Abreißen von der Trägerplatte.', at: { 'med-coyote-front': [47, 22], 'med-oliv-front': [46, 22], 'med-schwarz-front': [42, 22], 'med-rot-stage': [43, 23] } },
      { label: 'Schnalle', text: 'Steckschnalle hält die Pouch geschlossen, bis du ziehst.', at: { 'med-coyote-front': [53, 37], 'med-oliv-front': [56, 37], 'med-schwarz-front': [50, 37], 'med-rot-stage': [54, 37] } },
      { label: 'Zipper', text: 'Rundum-Reißverschluss mit zwei Schiebern und Paracord-Zuglaschen – öffnet über die ganze Höhe, auch mit Handschuhen.', at: { 'med-coyote-front': [28, 69], 'med-oliv-front': [23, 72], 'med-schwarz-front': [26, 67] } },
      // aufgeklappte Ansicht (Beispielbefüllung auf den Fotos)
      { label: 'Deckel', text: 'Fächer und mehrere Gummibänder halten Verbände, Feuerstarter oder Lampe an ihrem Platz.', at: { 'med-coyote-offen': [58, 40], 'med-oliv-offen': [62, 40], 'med-schwarz-offen': [55, 40], 'med-schwarz-leer': [45, 38], 'med-rot-offen': [62, 33] } },
      { label: 'Gummischlaufen', text: 'Taschen und kräftige Gummischlaufen im Boden: Kompressen, Verbände und Tücher sitzen fest.', at: { 'med-coyote-offen': [57, 57], 'med-oliv-offen': [55, 58], 'med-schwarz-offen': [48, 60], 'med-schwarz-leer': [56, 56], 'med-rot-offen': [55, 56] } },
      { label: 'Netzfach', text: 'Netzfach mit Reißverschluss in der Klappe für Kleinteile: Handschuhe, Schere, Pinzette, Sicherheitsnadeln. Inhalt nicht im Lieferumfang.', at: { 'med-coyote-offen': [40, 73], 'med-oliv-offen': [42, 75], 'med-schwarz-offen': [55, 74], 'med-schwarz-leer': [50, 73], 'med-rot-offen': [42, 70] } },
    ],
    lab: [
      {
        id: 'med-zugriff',
        title: 'Schnellzugriff',
        property: 'Abreißen mit einer Hand',
        material: 'Großflächige Klettverbindung zur Trägerplatte',
        source: 'Produktbeschreibung',
        text: 'Die Trägerplatte bleibt am Rucksack, Gürtel oder Bein. Die Pouch hält per Klett darauf, bis du sie brauchst – dann Zuglasche greifen, abreißen, aufklappen. Du nimmst nur das Kit mit zum Verletzten.',
        media: {
          kind: 'image',
          src: 'med-schwarz-platte',
          brief: 'Pouch und Trägerplatte getrennt (Herstellerfoto)',
        },
      },
      {
        id: 'med-zipper',
        title: 'Reißverschluss',
        property: 'Greifbar – auch mit Handschuhen',
        material: 'Rundum-Reißverschluss, 2 Schieber, Paracord-Zuglaschen mit Griffstück',
        source: 'Herstellerfoto',
        text: 'Die Zuglaschen aus Paracord mit geriffeltem Griffstück findest du auch blind und mit Handschuhen. Zwei Schieber: Die Pouch lässt sich von beiden Seiten öffnen. Dichtes Oxford-Gewebe, Klettfläche für Patches.',
        media: {
          kind: 'image',
          src: 'med-coyote-zipper',
          brief: 'Detail: Gewebe, Reißverschluss, Paracord-Zuglaschen',
        },
      },
      {
        id: 'med-innen',
        title: 'Innenleben',
        property: 'Ordnung unter Stress',
        material: 'Gummischlaufen, Netzfach',
        source: 'Produktbeschreibung',
        text: 'Aufgeklappt liegt alles offen vor dir – keine Wühlerei, wenn es schnell gehen muss. Im Deckel Fächer und Gummibänder, im Boden Taschen und Gummischlaufen, in der Klappe ein Netzfach mit Reißverschluss für Kleinteile. Inhalt nicht im Lieferumfang.',
        media: {
          kind: 'video',
          brief: 'Top-down, 5 Sek. Loop: aufgeklappte Pouch, Hände entnehmen Verband und Schere. Weiches Licht von oben, neutraler Untergrund.',
        },
      },
    ],
    // Front, Rückseite, aufgeklappt; Schwarz zusätzlich abgelöst von der Trägerplatte (leer = so wird geliefert)
    stage: { coyote: ['med-coyote-front', 'med-coyote-seite', 'med-coyote-offen'], oliv: ['med-oliv-front', 'med-oliv-rueck', 'med-oliv-offen'], schwarz: ['med-schwarz-front', 'med-schwarz-rueck', 'med-schwarz-leer', 'med-schwarz-platte'], rot: ['med-rot-stage', 'med-rot-rueck', 'med-rot-offen'], camo: ['med-camo-stage', 'med-camo-rueck'], acu: ['med-acu-stage', 'med-acu-front'] },
    cutout: { coyote: 'med-coyote-front', oliv: 'med-oliv-front', schwarz: 'med-schwarz-front', rot: 'med-rot-stage', camo: 'med-camo-stage', acu: 'med-acu-stage' },
    model3d: '/models/pl-med03.glb',
    note: 'Lieferung ohne medizinischen Inhalt.',
    badge: { k: 'zb-patch', glow: 'zb-patch-glow', label: 'PVC-Patch inklusive' },
  },
  {
    code: 'PL_GR',
    bullets: ['Ein- oder Zweipunkt in Sekunden','Stufenlos 90–140 cm, ein Zug','QD: einrasten, mit einer Hand lösen'],
    use: 'Schießstand · Jagd · Training',
    slug: 'gewehrgurt',
    name: 'Sling',
    category: 'Gewehrriemen / Ein- & Zweipunkt',
    serial: 'SN GR-0425',
    claim: 'Hält, wenn die Hände frei sein müssen.',
    description:
      'Gewehrriemen mit QD-Anschluss, in Sekunden zwischen Ein- und Zweipunkt umgebaut. Nylon-Gurtband 3,2 cm, Länge stufenlos von 90 bis 140 cm – zum Tragen lang, im Anschlag kurz.',
    variants: [
      // Riemen in Schwarz oder Oliv, optional mit QD-Öse (Montageset) für +2 €
      { sku: 'PL_GR_01', color: 'schwarz', option: 'Riemen', priceCents: 1090, stock: 'lager' },
      { sku: 'PL_GR_01-QD', color: 'schwarz', option: '+ QD-Öse', priceCents: 1290, stock: 'lager' },
      { sku: 'PL_GR_02', color: 'oliv', option: 'Riemen', priceCents: 1090, stock: 'lager' },
      { sku: 'PL_GR_02-QD', color: 'oliv', option: '+ QD-Öse', priceCents: 1290, stock: 'lager' },
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
      { label: 'Schnalle', text: 'Schiebeschnalle: Länge stufenlos von 90 bis 140 cm.', at: { 'sl-schwarz-front': [53, 43], 'sl-oliv-front': [56, 45], 'sl-schwarz-stand': [50, 45], 'sl-oliv-stand': [48, 41] } },
      { label: 'Umbau-Clip', text: 'Schnell zwischen Ein- und Zweipunkt wechseln.', at: { 'sl-qd-oliv': [58, 44] } },
      { label: 'QD-Swivel', text: 'Drückknopf-Swivel: einrasten, drehen, mit einer Hand lösen.', at: { 'sl-schwarz-front': [23, 23], 'sl-oliv-front': [55, 89], 'sl-qd-oliv': [84, 65], 'sl-qd-teile': [21, 75], 'sl-oliv-stand': [50, 76] } },
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
    // je Farbe 3 Bilder (stehend, liegend, am Schaft); bei „+ QD-Öse“ teilt sich die Vorschau: rechts die QD-Montage an der M-LOK-Schiene
    stage: { schwarz: ['sl-schwarz-stand', 'sl-schwarz-liegend', 'sl-schaft-schwarz'], oliv: ['sl-oliv-stand', 'sl-oliv-liegend', 'sl-schaft-oliv'] },
    optionSplit: { '+ QD-Öse': { k: 'sl-mlok', label: 'QD-Öse an M-LOK' } },
    cutout: { schwarz: 'sl-schwarz-stand', oliv: 'sl-oliv-stand' },
    note: 'Beispielbilder am Gewehr: abgebildete Waffe und Montageschiene sind nicht im Lieferumfang.',
  },
];

/* ------------------------------------------------------------------ */
/*  Hilfsfunktionen (Client + Server)                                  */
/* ------------------------------------------------------------------ */

export const productByCode = (code: string) => PRODUCTS.find((p) => p.code === code);

/** Code inkl. Farbe, z. B. PL_KWT_01 = Kurzwaffentasche Schwarz */
export const colorCode = (p: Product, color: ColorKey) => `${p.code}_${COLOR_NO[color]}`;

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

/** Farbname mit Nummer vorn, z. B. 01_Schwarz */
export const colorName = (c: ColorKey) => `${COLOR_NO[c]}_${COLORS[c].label}`;

export const variantLabel = (v: Variant) => [colorName(v.color), v.option].filter(Boolean).join(' · ');

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
