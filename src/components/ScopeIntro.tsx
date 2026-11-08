'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { SCOPE_FOCUS, SCOPE_IMG_STYLE, photoSrc } from './Logo';

/**
 * Intro (einmal pro Besuch):
 * 1) Ladephase: drei rote Punkte leuchten nacheinander, bis das große Foto geladen ist – dann sofort Intro
 *    (sonst ruckelt der Zoom). Lädt es nicht innerhalb von 7 s, entfällt das Intro.
 * 2) Blick durchs Zielfernrohr → Zoom auf den Berg → Zoom zurück, das Fernrohr fliegt in den Header
 *    und wird zum Logo (die Landschaft bleibt im Scope).
 * Klick, Taste oder Scrollen überspringt. Nur transform/opacity animiert. Bei „Bewegung reduzieren“ entfällt das Intro.
 */
const KEY = 'pl-intro-gesehen';
const MAX_LADEZEIT = 7000;
const MIN_LADEANZEIGE = 0; // sofort weiter, sobald das Foto da ist

/** Entscheidung nur einmal pro Seitenaufruf treffen (robust gegen doppelte Effekte im Entwicklungsmodus) */
let entscheidung: boolean | null = null;
function introZeigen() {
  if (entscheidung !== null) return entscheidung;
  let seen = false;
  try {
    seen = sessionStorage.getItem(KEY) === '1';
    sessionStorage.setItem(KEY, '1');
  } catch {}
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  entscheidung = !seen && !reduced;
  return entscheidung;
}

type Phase = 'aus' | 'laden' | 'intro';

export function ScopeIntro() {
  const [phase, setPhase] = useState<Phase>('aus');
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const reticle = useRef<SVGSVGElement>(null);
  const loader = useRef<HTMLDivElement>(null);

  const beenden = () => {
    document.documentElement.classList.remove('intro-vorab', 'intro-laeuft');
    setPhase('aus');
  };

  // Start: Overlay + Ladephase
  useEffect(() => {
    if (!introZeigen()) {
      document.documentElement.classList.remove('intro-vorab', 'intro-laeuft');
      return;
    }
    document.documentElement.classList.add('intro-laeuft');
    setPhase('laden');
  }, []);

  // Ladephase: Foto vollständig laden + dekodieren, mindestens kurz die Ladeanzeige zeigen
  useEffect(() => {
    if (phase !== 'laden') return;
    document.documentElement.classList.remove('intro-vorab'); // eigenes Overlay ist jetzt da
    let fertig = false;
    const img = new Image();
    img.decoding = 'async';
    img.src = photoSrc('large');
    // geladen = Datei da; danach kurz aufs Dekodieren warten (max. 0,6 s – in Hintergrund-Tabs kommt die Bestätigung nie)
    const geladen = new Promise<void>((res, rej) => {
      const nachLaden = () => {
        const t = setTimeout(res, 250);
        const fertigDekodiert = () => {
          clearTimeout(t);
          res();
        };
        if (img.decode) img.decode().then(fertigDekodiert, fertigDekodiert);
        else fertigDekodiert();
      };
      img.onerror = () => rej(new Error('Foto nicht geladen'));
      if (img.complete && img.naturalWidth) nachLaden();
      else img.onload = nachLaden;
    });
    const minZeit = new Promise((r) => setTimeout(r, MIN_LADEANZEIGE));
    const notaus = setTimeout(() => !fertig && beenden(), MAX_LADEZEIT);
    Promise.all([geladen, minZeit])
      .then(() => {
        if (fertig) return;
        fertig = true;
        clearTimeout(notaus);
        setPhase('intro'); // Ladeanzeige sofort weg, Intro startet
      })
      .catch(() => {
        fertig = true;
        clearTimeout(notaus);
        beenden();
      });
    const skip = () => {
      fertig = true;
      clearTimeout(notaus);
      beenden();
    };
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      fertig = true;
      clearTimeout(notaus);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Intro-Zeitleiste
  useEffect(() => {
    if (phase !== 'intro' || !root.current || !scope.current || !photo.current || !reticle.current) return;
    const html = document.documentElement;
    html.classList.add('intro-laeuft');
    const target = document.querySelector<HTMLElement>('.hdr .logo__scope');
    // Zielposition vorab messen (Header ist fix) → Flug ist Teil der Zeitleiste
    const a = scope.current.getBoundingClientRect();
    const b = target?.getBoundingClientRect();
    const fly = b
      ? {
          x: b.left + b.width / 2 - (a.left + a.width / 2),
          y: b.top + b.height / 2 - (a.top + a.height / 2),
          scale: b.width / a.width,
        }
      : { x: 0, y: -a.top - a.height, scale: 0.1 };

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        html.classList.remove('intro-laeuft');
        setPhase('aus');
      },
    });

    // 1) Zielfernrohr erscheint
    tl.fromTo(scope.current, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0);
    // 2) Zoom durch das Fernrohr auf den Berg
    tl.fromTo(photo.current, { scale: 1 }, { scale: 3.4, duration: 1.8 }, 0.35);
    // 3) Zoom zurück …
    tl.to(photo.current, { scale: 1, duration: 1.1 }, 2.25);
    // … und das Fernrohr fliegt in den Header (wird zum Logo)
    tl.to(scope.current, { ...fly, duration: 1.0, ease: 'power3.inOut' }, 2.45);
    tl.to(root.current, { backgroundColor: 'rgba(11, 11, 10, 0)', duration: 0.9, ease: 'power1.inOut' }, 2.55);
    tl.to(reticle.current, { opacity: 0, duration: 0.35 }, 3.1);
    tl.add(() => html.classList.remove('intro-laeuft'), 3.15); // Logo-Rahmen + Scope im Header blenden ein
    tl.to(scope.current, { opacity: 0, duration: 0.3 }, 3.3);

    // nur Entwicklung: Zeitleiste zum Prüfen abrufbar
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __introTl?: gsap.core.Timeline }).__introTl = tl;
    const skip = () => tl.progress(1);
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('wheel', skip, { once: true, passive: true });
    window.addEventListener('touchmove', skip, { once: true, passive: true });
    return () => {
      tl.kill();
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
      html.classList.remove('intro-laeuft');
    };
  }, [phase]);

  if (phase === 'aus') return null;
  const dots = [-4, -3, -2, -1, 1, 2, 3, 4];
  return (
    <div ref={root} className="intro" aria-hidden="true">
      {phase === 'laden' && (
        <div ref={loader} className="intro__dots">
          <span />
          <span />
          <span />
        </div>
      )}
      {phase === 'intro' && (
        <div ref={scope} className="intro__scope" style={{ opacity: 0 }}>
          <div className="intro__glass">
            <img ref={photo} src={photoSrc('large')} alt="" decoding="sync" style={{ ...SCOPE_IMG_STYLE, transformOrigin: SCOPE_FOCUS }} />
            <span className="intro__vignette" />
          </div>
          <svg ref={reticle} className="intro__reticle" viewBox="-100 -100 200 200">
            <line x1="-100" y1="0" x2="-6" y2="0" />
            <line x1="6" y1="0" x2="100" y2="0" />
            <line x1="0" y1="-100" x2="0" y2="-6" />
            <line x1="0" y1="6" x2="0" y2="100" />
            {dots.map((d) => (
              <g key={d}>
                <circle cx={d * 11} cy="0" r="1.6" />
                <circle cx="0" cy={d * 11} r="1.6" />
              </g>
            ))}
            <circle cx="0" cy="0" r="0.9" className="intro__center" />
          </svg>
          <span className="intro__ring" />
        </div>
      )}
    </div>
  );
}
