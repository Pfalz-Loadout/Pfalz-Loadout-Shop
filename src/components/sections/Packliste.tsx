'use client';

import { useState } from 'react';
import { Picture } from '../Picture';

/**
 * IFAK-Packliste nach M.A.R.C.H. – eigene Texte.
 * Anregungen: taktik-training-medizin.de (2021), PPF Germany (2026); fachlich angelehnt an TCCC/Hartford Consensus.
 * Foto zeigt eine Beispielbefüllung – geliefert wird die Pouch ohne Inhalt.
 */

type Zone = 'aussen' | 'deckel' | 'hauptfach' | 'netzfach';

const ZONES: Record<Zone, { label: string; layer: string; at: [number, number] }> = {
  aussen: { label: 'Außen', layer: 'am Gürtel / Rucksack', at: [64, 9] },
  deckel: { label: 'Deckel', layer: 'Schicht 1 · vorne', at: [60, 37] },
  hauptfach: { label: 'Hauptfach', layer: 'Schicht 2 · Mitte', at: [52, 58] },
  netzfach: { label: 'Netzfach', layer: 'Schicht 3 · hinten', at: [36, 78] },
};

type Item = { name: string; note: string; zone: Zone | null };
type Step = { key: string; word: string; de: string; lead: string; items: Item[] };

const MARCH: Step[] = [
  {
    key: 'M',
    word: 'Massive',
    de: 'Starke Blutung',
    lead: 'Zuerst das, was in wenigen Minuten tötet. Deshalb liegt Blutstillung ganz vorne – du siehst sie, sobald die Pouch aufklappt.',
    items: [
      { name: 'Tourniquet', note: 'Nur ein geprüftes Modell (CoTCCC-gelistet). Außen tragen, nicht in der Pouch – mit einer Hand erreichbar.', zone: 'aussen' },
      { name: 'Einmalhandschuhe', note: 'Ganz oben. Sie sind das Erste, was du brauchst.', zone: 'deckel' },
      { name: 'Hämostyptische Gaze', note: 'Zum Ausstopfen tiefer Wunden an Leiste, Achsel oder Hals – dort, wo kein Tourniquet hält.', zone: 'deckel' },
      { name: 'Druckverband', note: 'Ein Emergency Bandage drückt, hält und verschließt in einem Arbeitsgang.', zone: 'deckel' },
    ],
  },
  {
    key: 'A',
    word: 'Airway',
    de: 'Atemwege',
    lead: 'Der Atemweg muss frei bleiben. Meist reicht ein Handgriff – Material nur, wenn du es gelernt hast.',
    items: [
      { name: 'Stabile Seitenlage', note: 'Kostet nichts, wiegt nichts – und ist oft die beste Maßnahme.', zone: null },
      { name: 'Wendl-Tubus mit Gleitgel', note: 'Hält den Atemweg über die Nase offen. Nur mit Ausbildung einsetzen.', zone: 'hauptfach' },
    ],
  },
  {
    key: 'R',
    word: 'Respiration',
    de: 'Atmung',
    lead: 'Eine offene Verletzung am Brustkorb muss schnell luftdicht verschlossen werden.',
    items: [
      { name: 'Zwei Chest Seals, ventiliert', note: 'Zwei, weil es oft eine Ein- und eine Austrittswunde gibt. Flach an die Rückwand des Hauptfachs.', zone: 'hauptfach' },
    ],
  },
  {
    key: 'C',
    word: 'Circulation',
    de: 'Kreislauf',
    lead: 'Was nicht spritzt, wird versorgt, sobald die großen Probleme gelöst sind.',
    items: [
      { name: 'Kompressen + Fixierbinde', note: 'Für alle Wunden, die keinen Druckverband brauchen.', zone: 'hauptfach' },
      { name: 'Permanentmarker', note: 'Uhrzeit des Tourniquets notieren – der Rettungsdienst muss sie kennen.', zone: 'netzfach' },
      { name: 'Trauma-Schere', note: 'Kleidung schnell öffnen. Außen oder ganz oben, nie unten vergraben.', zone: 'aussen' },
    ],
  },
  {
    key: 'H',
    word: 'Hypothermia',
    de: 'Auskühlung',
    lead: 'Wer Blut verliert, kühlt schnell aus – und Kälte verschlechtert die Blutgerinnung. Wärme gehört dazu.',
    items: [
      { name: 'Rettungsdecke', note: 'Klein gefaltet, wiegt fast nichts. Ins Netzfach.', zone: 'netzfach' },
    ],
  },
];

const NOT_IN = [
  'Medikamente – gehören nicht in eine Notfall-Pouch.',
  'Schienen und Großverbände – dafür ist sie zu klein.',
  'Pflaster-Sortiment für Kleinkram – das ist die normale Erste-Hilfe-Tasche.',
  'Übungsmaterial – Trainings-Tourniquets nie mit echten mischen.',
];

const CARE = [
  'Ablaufdaten von Gaze und Chest Seals aufschreiben und prüfen.',
  'Hitze im Auto lässt Kleber und Verpackungen altern.',
  'Nach jedem Einsatz sofort wieder auffüllen.',
  'Jedes Teil hat immer denselben Platz – blind greifen üben.',
];

export function Packliste() {
  const [active, setActive] = useState('M');
  const [hover, setHover] = useState<Zone | null>(null);
  const step = MARCH.find((s) => s.key === active)!;
  const zones = new Set(step.items.map((i) => i.zone).filter(Boolean) as Zone[]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = MARCH[(i + d + MARCH.length) % MARCH.length];
    setActive(next.key);
    document.getElementById(`march-${next.key}`)?.focus();
  };

  return (
    <section className="pack" id="packliste" aria-labelledby="pack-h">
      <div className="wrap">
        <div className="sec-head mono">
          <span className="sec-head__label" id="pack-h">
            Packliste
          </span>
          <span className="dim-3">PL_IFAK · nach M.A.R.C.H.</span>
        </div>
        <h2 className="display h2" style={{ marginBottom: 20 }}>
          Was gehört rein?
          <br />
          <span className="dim">Und wohin.</span>
        </h2>
        <p className="pack__intro">
          Ein IFAK ist deine persönliche Notfallausrüstung für schwere Verletzungen – kein Ersatz für den Verbandkasten.
          Gepackt wird in der Reihenfolge, in der du im Ernstfall arbeitest: <strong>M.A.R.C.H.</strong>
        </p>

        <div className="pack__grid">
          <figure className="pack__photo">
            <Picture k="med-coyote-offen" alt="Aufgeklappte IFAK Pouch mit Beispielbefüllung" sizes="(max-width: 860px) 92vw, 44vw" />
            {(Object.keys(ZONES) as Zone[]).map((z) => (
              <span
                key={z}
                aria-hidden="true"
                className={`pack__pin mono${zones.has(z) ? ' is-on' : ''}${hover === z ? ' is-hot' : ''}`}
                style={{ left: `${ZONES[z].at[0]}%`, top: `${ZONES[z].at[1]}%` }}
              >
                <i />
                <b>{ZONES[z].label}</b>
              </span>
            ))}
            <figcaption className="mono dim-3">Beispielbefüllung – nicht im Lieferumfang</figcaption>
          </figure>

          <div className="pack__panel">
            <div className="pack__tabs" role="tablist" aria-label="M.A.R.C.H. – Schritt wählen">
              {MARCH.map((s, i) => (
                <button
                  key={s.key}
                  id={`march-${s.key}`}
                  role="tab"
                  type="button"
                  aria-selected={active === s.key}
                  aria-controls="march-panel"
                  tabIndex={active === s.key ? 0 : -1}
                  className="pack__tab"
                  onClick={() => setActive(s.key)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  <span className="display">{s.key}</span>
                  <span className="mono">{s.de}</span>
                </button>
              ))}
            </div>

            <div id="march-panel" role="tabpanel" aria-labelledby={`march-${active}`} className="pack__step" key={active}>
              <div className="mono dim-3">
                {step.key} = {step.word} · {step.de}
              </div>
              <p className="pack__lead">{step.lead}</p>
              <ul className="pack__items">
                {step.items.map((it) => (
                  <li
                    key={it.name}
                    onMouseEnter={() => setHover(it.zone)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <div className="pack__item-head">
                      <strong>{it.name}</strong>
                      <span className="mono">{it.zone ? `${ZONES[it.zone].label} · ${ZONES[it.zone].layer}` : 'Handgriff'}</span>
                    </div>
                    <p>{it.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="pack__why">
          <div className="pack__stat">
            <span className="display">19 %</span>
            <span className="mono">Leiste · Achsel · Hals</span>
          </div>
          <div className="pack__stat">
            <span className="display dim">13,5 %</span>
            <span className="mono">Arme · Beine</span>
          </div>
          <p>
            <strong>Warum Gaze, nicht nur Tourniquet?</strong> Eine Auswertung von Todesfällen durch Verbluten, die potenziell
            überlebbar gewesen wären, fand rund 13,5 % an Armen und Beinen – dort hilft ein Tourniquet. Rund 19 % lagen im
            Übergang zum Rumpf, wo nur Ausstopfen und Druck helfen. <span className="dim-3">(Eastridge et al., 2012 – Daten aus Militäreinsätzen)</span>
          </p>
        </aside>

        <div className="pack__lists">
          <div>
            <h3 className="mono pack__h3">Gehört nicht rein</h3>
            <ul className="pack__dash">
              {NOT_IN.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mono pack__h3">Pflege</h3>
            <ul className="pack__dash">
              {CARE.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mono pack__h3">Warum zum Abreißen?</h3>
            <p className="pack__rip">
              Die Pouch bleibt am Rucksack, bis du sie brauchst. Ein Zug an der Lasche, und du nimmst das ganze Kit mit zum
              Verletzten – aufgeklappt liegt alles offen vor dir.
            </p>
            <a className="btn btn--ghost pack__cta" href="#ifak">
              Zur IFAK Pouch
            </a>
          </div>
        </div>

        <p className="pack__legal">
          <strong>Lieferung ohne Inhalt.</strong> Diese Liste ist eine Orientierung und keine medizinische Beratung. Was du
          packst, richtet sich nach deiner Ausbildung – Material, das du nicht sicher anwenden kannst, hilft niemandem. Mach
          einen Erste-Hilfe-Kurs, am besten mit Schwerpunkt Blutstillung (z. B. TECC oder TCCC).
          <br />
          <span className="dim-3">
            Orientierung: TCCC-Leitlinien (CoTCCC), Hartford Consensus, ERC-Leitlinien, S3-Leitlinie Polytrauma. Lesetipps:
            taktik-training-medizin.de, PPF Germany.
          </span>
        </p>
      </div>
    </section>
  );
}
