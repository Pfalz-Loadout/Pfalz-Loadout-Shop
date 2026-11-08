'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Picture } from '../Picture';
import { useMotion } from '../MotionProvider';

/**
 * „Zerlegt“: PL-RB01 Baugruppe für Baugruppe – echte Detailfotos statt 3D.
 * Desktop: gepinnt, Scroll schaltet Detail für Detail weiter (mit Zoom-Fahrt).
 * Mobil / reduzierte Bewegung: Raster.
 */
const DETAILS = [
  { k: 'rb-coyote-front', label: 'Außenmaterial', text: '600D Oxford-Polyester mit PVC-Beschichtung – dicht gewebt, wasserabweisend.', focus: '50% 55%' },
  { k: 'rb-coyote-offen', label: 'Innenleben', text: 'Zwei gepolsterte Hauptfächer, elastische Schlaufen für bis zu 6 Magazine. Ausgeklappt: Arbeitsmatte.', focus: '50% 50%' },
  { k: 'rb-coyote-zipper', label: 'SBS-Reißverschluss', text: 'Wasserabweisend, große Zuglaschen – auch mit Handschuhen zu greifen. Schieber abschließbar.', focus: '50% 45%' },
  { k: 'rb-coyote-dring', label: 'D-Ringe', text: 'Metall-D-Ringe als Aufnahme für den Schultergurt.', focus: '50% 50%' },
  { k: 'rb-coyote-klett', label: 'MOLLE & Klett', text: 'PALS-Gurtband mit Riegelnähten für Pouches, Flauschfläche für Patches.', focus: '50% 40%' },
  { k: 'rb-coyote-gurt', label: 'Schultergurt', text: 'Abnehmbar, mit drehbaren Karabinerhaken.', focus: '50% 50%' },
];

export function Explode() {
  const section = useRef<HTMLElement>(null);
  const { ready, reduced, desktop } = useMotion();
  const [idx, setIdx] = useState(0);
  const [prog, setProg] = useState(0);
  const pinned = ready && !reduced && desktop;

  useEffect(() => {
    if (!pinned || !section.current) return;
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (s) => {
        setProg(s.progress);
        setIdx(Math.min(DETAILS.length - 1, Math.floor(s.progress * DETAILS.length)));
      },
    });
    return () => st.kill();
  }, [pinned]);

  const local = prog * DETAILS.length - idx; // Fortschritt innerhalb des aktuellen Details

  return (
    <section ref={section} className={`explode scan${pinned ? '' : ' is-static'}`} aria-labelledby="explode-h">
      <div className="scan__beam" data-hud="ANALYSE // PL-RB01 ZERLEGT" />
      {pinned ? (
        <div className="explode__pin">
          <div className="wrap detail">
            <div className="detail__text">
              <div className="sec-head mono" style={{ marginBottom: 20 }}>
                <span className="sec-head__label" id="explode-h">
                  Zerlegt
                </span>
                <span className="dim-3">PL-RB01 · {DETAILS.length} Details</span>
              </div>
              <h2 className="display h2" style={{ fontSize: 'clamp(2.6rem, 5.4vw, 5.2rem)', marginBottom: 28 }}>
                Was drin
                <br />
                steckt.
              </h2>
              <ol className="detail__list">
                {DETAILS.map((d, i) => (
                  <li key={d.k} className={i === idx ? 'is-on' : ''} aria-current={i === idx ? 'step' : undefined}>
                    <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <b>{d.label}</b>
                      <p>{d.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="detail__frame hud">
              {DETAILS.map((d, i) => (
                <Picture
                  key={d.k}
                  k={d.k}
                  alt={`Range Bag Detail: ${d.label}`}
                  sizes="(max-width: 960px) 92vw, 46vw"
                  className="detail__shot"
                  style={{
                    opacity: i === idx ? 1 : 0,
                    transform: `scale(${i === idx ? 1.04 + local * 0.12 : 1.04})`,
                    ['--focus' as string]: d.focus,
                  }}
                />
              ))}
              <span className="detail__scan" style={{ top: `${(local * 100).toFixed(1)}%` }} aria-hidden="true" />
              <span className="stage__code mono">
                PL-RB01 · DETAIL {String(idx + 1).padStart(2, '0')}/{String(DETAILS.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="wrap explode__static">
          <div className="sec-head mono">
            <span className="sec-head__label" id="explode-h">
              Zerlegt
            </span>
            <span className="dim-3">PL-RB01 · {DETAILS.length} Details</span>
          </div>
          <h2 className="display h2" style={{ marginBottom: 28 }}>
            Was drin steckt.
          </h2>
          <ul className="detail__grid">
            {DETAILS.map((d) => (
              <li key={d.k}>
                <Picture k={d.k} alt={`Range Bag Detail: ${d.label}`} sizes="(max-width: 700px) 92vw, 30vw" />
                <b>{d.label}</b>
                <p>{d.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
