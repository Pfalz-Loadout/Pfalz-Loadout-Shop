'use client';

import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion } from '../MotionProvider';

const TEXT = 'Wir behaupten keine Qualität. Wir zeigen sie. Naht für Naht, Faden für Faden – bis zum Moment, in dem es zählt.';
const SIGNAL_WORDS = new Set(['zeigen', 'sie.', 'zählt.']);

export function Manifest() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { ready, reduced } = useMotion();

  useEffect(() => {
    if (!ready || !ref.current) return;
    const words = [...ref.current.querySelectorAll<HTMLElement>('.w')];
    if (reduced) {
      words.forEach((w) => w.classList.add('is-on'));
      return;
    }
    // Wort für Wort einblenden, synchron zum Scroll
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 80%',
      end: 'bottom 45%',
      scrub: true,
      onUpdate: (s) => {
        const n = Math.round(s.progress * words.length);
        words.forEach((w, i) => w.classList.toggle('is-on', i < n));
      },
    });
    return () => st.kill();
  }, [ready, reduced]);

  return (
    <section className="manifest scan" aria-labelledby="manifest-h">
      <div className="scan__beam" data-hud="SEKTOR 01 // HALTUNG" />
      <div className="wrap">
        <div className="sec-head mono">
          <span className="sec-head__label" id="manifest-h">
            Manifest
          </span>
          <span className="dim-3">Ref. PL-00 / Qualität</span>
        </div>
        <p ref={ref} className="manifest__text">
          {TEXT.split(' ').map((w, i) => (
            <span key={i}>
              <span className={`w${SIGNAL_WORDS.has(w) ? ' w--sig' : ''}`}>{w}</span>{' '}
            </span>
          ))}
        </p>
        <p className="manifest__sub">
          Kleines Sortiment, klare Aufgabe: vier Teile, die am Stand, im Gelände und im Fahrzeug funktionieren müssen.
          Jedes mit Produktcode, jedes mit offenen Materialangaben – damit du weißt, was du trägst.
        </p>
      </div>
    </section>
  );
}
