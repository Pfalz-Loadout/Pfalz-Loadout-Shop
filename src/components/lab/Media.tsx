'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { MediaSlot } from '@/data/shop';
import { Picture, hasMedia } from '../Picture';
import { useMotion } from '../MotionProvider';

/** Klar beschrifteter Platzhalter mit Drehanweisung */
export function Placeholder({ slot, kind }: { slot: MediaSlot; kind: string }) {
  return (
    <div className="placeholder">
      <span className="placeholder__tag mono">Platzhalter · {kind}</span>
      <p>
        <strong>Drehanweisung:</strong> {slot.brief}
      </p>
      <p className="mono dim-3" style={{ fontSize: '.7rem' }}>
        Datei ablegen unter public/videos/ (WebM + MP4 + Poster) und in src/data/shop.ts eintragen
      </p>
    </div>
  );
}

/** Kurzvideo: stumm, Loop, Autoplay nur im Sichtbereich, kleinere Datei auf Mobil */
export function VideoSlot({ slot }: { slot: MediaSlot }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const { reduced } = useMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !reduced) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    let raf = 0;
    if (slot.timer) {
      const tick = () => {
        setTime(v.currentTime);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [slot.timer, reduced]);

  if (!slot.src) return <Placeholder slot={slot} kind="Kurzvideo" />;
  const base = slot.src.replace(/\.(mp4|webm)$/, '');
  return (
    <>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={slot.poster}
        aria-label={slot.brief}
        style={slot.fit === 'contain' ? { objectFit: 'contain', background: '#121212' } : undefined}
      >
        <source src={`${base}-mobil.webm`} type="video/webm" media="(max-width: 700px)" />
        <source src={`${base}-mobil.mp4`} type="video/mp4" media="(max-width: 700px)" />
        <source src={`${base}.webm`} type="video/webm" />
        <source src={`${base}.mp4`} type="video/mp4" />
      </video>
      {slot.timer && (
        <span className="proof__timer" aria-hidden="true">
          {time.toFixed(2).padStart(5, '0')} s
        </span>
      )}
    </>
  );
}

/** Gewebe-Shader (lazy) mit Kamerafahrt auf Faserebene beim Scrollen */
export function FabricSlot({ color }: { color: string }) {
  const host = useRef<HTMLDivElement>(null);
  const { lowPower, reduced, ready } = useMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ready || !host.current) return;
    let handle: { dispose: () => void; setZoom: (z: number) => void } | undefined;
    let cancelled = false;
    let onScroll: (() => void) | undefined;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        try {
          const { mountFabric } = await import('../three/fabricShader');
          if (cancelled || !host.current) return;
          handle = mountFabric(host.current, { color, lowPower });
          if (!reduced) {
            onScroll = () => {
              const r = host.current!.getBoundingClientRect();
              const p = 1 - Math.min(1, Math.max(0, (r.top + r.height / 2) / window.innerHeight));
              handle?.setZoom(Math.min(1, p * 1.4));
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
          }
        } catch {
          setFailed(true);
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(host.current);
    return () => {
      cancelled = true;
      io.disconnect();
      if (onScroll) window.removeEventListener('scroll', onScroll);
      handle?.dispose();
    };
  }, [ready, color, lowPower, reduced]);

  return (
    <div ref={host} style={{ position: 'absolute', inset: 0 }} role="img" aria-label="Makroansicht des Oxford-Gewebes, Wassertropfen perlen ab">
      {failed && <div className="placeholder mono">Gewebeansicht nicht verfügbar</div>}
      <span className="proof__rec mono" style={{ pointerEvents: 'none' }}>
        Live · Licht folgt deiner Bewegung
      </span>
    </div>
  );
}

/** MOLLE/PALS: Riemen flicht sich abwechselnd durch Plattform und Pouch */
export function MolleSlot() {
  const ref = useRef<SVGSVGElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    if (!ref.current) return;
    const strap = ref.current.querySelector<SVGPathElement>('.m-strap');
    if (!strap) return;
    const len = strap.getTotalLength();
    gsap.set(strap, { strokeDasharray: len, strokeDashoffset: reduced ? 0 : len });
    if (reduced) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true });
    tl.to(strap, { strokeDashoffset: 0, duration: 3.2, ease: 'power1.inOut' })
      .to('.m-pouch', { y: 0, duration: 0.5, ease: 'back.out(2)' }, 2.6)
      .to('.m-snap', { opacity: 1, duration: 0.2 }, 3.1)
      .to({}, { duration: 1.4 })
      .to('.m-snap', { opacity: 0, duration: 0.2 })
      .to('.m-pouch', { y: -14, duration: 0.3 })
      .set(strap, { strokeDashoffset: len });
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()));
    io.observe(ref.current);
    return () => {
      io.disconnect();
      tl.kill();
    };
  }, [reduced]);

  // Raster: 4 Reihen PALS-Gurtband, Riemen geht unter (gestrichelt) / über (voll)
  const rows = [70, 120, 170, 220];
  return (
    <svg ref={ref} viewBox="0 0 560 300" role="img" aria-label="Animation: Der Befestigungsriemen wird abwechselnd durch das Gurtband der Plattform und die Schlaufen der Tasche geflochten.">
      <rect width="560" height="300" fill="#1a1a19" />
      {/* Plattform (Rucksack) */}
      <rect x="40" y="40" width="300" height="220" fill="#3b4a3f" />
      {rows.map((y) => (
        <g key={y}>
          <rect x="40" y={y - 9} width="300" height="18" fill="#52665a" />
          {[...Array(13)].map((_, i) => (
            <rect key={i} x={40 + i * 25} y={y - 9} width="2" height="18" fill="#141414" opacity="0.7" />
          ))}
        </g>
      ))}
      {/* Pouch-Rückseite */}
      <g className="m-pouch" transform="translate(0,-14)">
        <rect x="110" y="56" width="120" height="180" fill="#b8a07e" opacity="0.92" />
        {[95, 145, 195].map((y) => (
          <rect key={y} x="110" y={y - 8} width="120" height="16" fill="#8e7a5c" />
        ))}
      </g>
      {/* Riemen */}
      <path
        className="m-strap"
        d="M150 30 L150 61 L150 79 L150 95 L150 111 L150 129 L150 145 L150 161 L150 179 L150 195 L150 211 L150 229 L150 252"
        fill="none"
        stroke="#ff5f1f"
        strokeWidth="10"
        strokeLinecap="square"
      />
      {/* Überdeckungen: Riemen läuft abwechselnd UNTER Plattform- und Pouch-Gurtband */}
      <g className="m-pouch" transform="translate(0,-14)">
        {[95, 195].map((y) => (
          <rect key={y} x="138" y={y - 8} width="24" height="16" fill="#8e7a5c" />
        ))}
      </g>
      {[70, 170].map((y) => (
        <rect key={y} x="138" y={y - 9} width="24" height="18" fill="#52665a" />
      ))}
      <text className="m-snap" x="250" y="276" fill="#edebe6" opacity="0" fontFamily="monospace" fontSize="13">
        ✓ SITZT FEST – SCHLACKERT NICHT
      </text>
      <g fontFamily="monospace" fontSize="12" fill="#c9c6be">
        <text x="360" y="72">1 · Riemen durch Plattform</text>
        <text x="360" y="100">2 · zurück durch Pouch</text>
        <text x="360" y="128">3 · wieder Plattform</text>
        <text x="360" y="156">4 · im Wechsel bis unten</text>
        <text x="360" y="184">5 · Ende sichern</text>
        <text x="360" y="212">6 · Rütteltest</text>
      </g>
    </svg>
  );
}

/** Vergleichsslider A/B (tastaturbedienbar über verstecktes range-input) */
export function CompareSlot({ slot }: { slot: MediaSlot }) {
  const [pos, setPos] = useState(50);
  if (!slot.src || !slot.srcB || !hasMedia(slot.src) || !hasMedia(slot.srcB)) return <Placeholder slot={slot} kind="Vergleich" />;
  return (
    <div className="compare" style={{ ['--pos' as string]: `${pos}%` }}>
      <Picture k={slot.src} alt={slot.labelA ?? 'Ansicht A'} sizes="(max-width: 860px) 92vw, 55vw" />
      <Picture k={slot.srcB} alt={slot.labelB ?? 'Ansicht B'} className="compare__b" sizes="(max-width: 860px) 92vw, 55vw" />
      <span className="compare__handle" aria-hidden="true" />
      <span className="compare__label compare__label--a mono">{slot.labelA}</span>
      <span className="compare__label compare__label--b mono">{slot.labelB}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Vergleich: ${slot.labelA} oder ${slot.labelB}`}
      />
    </div>
  );
}

/** Baut eine GSAP-Timeline und spielt sie nur, solange das SVG sichtbar ist */
function usePlayWhenVisible(build: (root: SVGSVGElement) => gsap.core.Timeline) {
  const ref = useRef<SVGSVGElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const tl = build(root);
    if (reduced) {
      tl.progress(0.5).pause(); // Standbild statt Animation
      return () => {
        tl.kill();
      };
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()));
    io.observe(root);
    return () => {
      io.disconnect();
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  return ref;
}

/**
 * QD-Verbindung als animierte Schnittzeichnung:
 * Knopf drücken → Bolzen fährt in die Montageplatte → loslassen →
 * Sperrkugeln rasten ein → „KLICK“ → Bügel dreht → lösen.
 */
export function QdSlot() {
  const ref = usePlayWhenVisible((root) => {
    const q = gsap.utils.selector(root);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true, defaults: { ease: 'power2.inOut' } });
    tl.set(q('.qd-swivel'), { x: 150 })
      .set(q('.qd-ball-t, .qd-ball-b'), { y: 0 })
      .set(q('.qd-klick, .qd-ring'), { opacity: 0 })
      .set(q('.qd-step'), { opacity: 0.3 })
      .to(q('.qd-step-1'), { opacity: 1, duration: 0.2 })
      .to(q('.qd-button'), { x: -10, duration: 0.25 }, '+=0.2')
      .to(q('.qd-step-2'), { opacity: 1, duration: 0.2 })
      .to(q('.qd-swivel'), { x: 0, duration: 0.9, ease: 'power3.in' })
      .to(q('.qd-button'), { x: 0, duration: 0.12, ease: 'back.out(3)' })
      .to(q('.qd-ball-t'), { y: -7, duration: 0.12, ease: 'back.out(3)' }, '<')
      .to(q('.qd-ball-b'), { y: 7, duration: 0.12, ease: 'back.out(3)' }, '<')
      .to(q('.qd-step-3'), { opacity: 1, duration: 0.2 }, '<')
      .to(q('.qd-klick'), { opacity: 1, duration: 0.05 }, '<')
      .fromTo(
        q('.qd-ring'),
        { opacity: 0.9, scale: 0.4, transformOrigin: '50% 50%' },
        { opacity: 0, scale: 1.6, duration: 0.6, ease: 'power2.out' },
        '<',
      )
      .to(q('.qd-loop'), { rotate: 22, svgOrigin: '306 150', duration: 0.7, yoyo: true, repeat: 1 }, '+=0.3')
      .to(q('.qd-klick'), { opacity: 0, duration: 0.3 }, '+=0.6')
      .to(q('.qd-button'), { x: -10, duration: 0.2 })
      .to(q('.qd-ball-t, .qd-ball-b'), { y: 0, duration: 0.1 }, '<')
      .to(q('.qd-swivel'), { x: 150, duration: 0.6, ease: 'power3.out' })
      .to(q('.qd-button'), { x: 0, duration: 0.15 });
    return tl;
  });

  const ink = '#c9c6be';
  return (
    <svg
      ref={ref}
      viewBox="0 0 560 330"
      role="img"
      aria-label="Schnittzeichnung: Der QD-Swivel wird mit gedrücktem Knopf in die Montageplatte gesetzt, beim Loslassen rasten die Sperrkugeln ein."
    >
      <rect width="560" height="330" fill="#161615" />
      <g stroke="#ffffff" strokeOpacity="0.05">
        {Array.from({ length: 14 }, (_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="330" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="560" y2={i * 40} />
        ))}
      </g>

      {/* Montageplatte im Schnitt */}
      <rect x="60" y="95" width="150" height="110" fill="#2a2a28" stroke={ink} strokeWidth="1.2" />
      <path d="M60 95 L84 75 L234 75 L210 95 Z" fill="#33332f" stroke={ink} strokeWidth="1.2" />
      <path d="M210 95 L234 75 L234 185 L210 205 Z" fill="#232321" stroke={ink} strokeWidth="1.2" />
      <g stroke={ink} strokeOpacity="0.22">
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={66 + i * 10} y1="200" x2={96 + i * 10} y2="100" />
        ))}
      </g>
      <rect x="150" y="128" width="60" height="44" fill="#121211" stroke={ink} strokeWidth="1" />
      <rect x="164" y="121" width="16" height="7" fill="#121211" stroke={ink} strokeWidth="0.8" />
      <rect x="164" y="172" width="16" height="7" fill="#121211" stroke={ink} strokeWidth="0.8" />
      <text x="62" y="228" fill={ink} fontFamily="monospace" fontSize="11">
        MONTAGEPLATTE
      </text>

      {/* Swivel */}
      <g className="qd-swivel">
        <rect x="150" y="132" width="110" height="36" rx="3" fill="#3a3a37" stroke={ink} strokeWidth="1.2" />
        <circle className="qd-ball-t" cx="172" cy="134" r="6" fill="#8a8a86" stroke={ink} />
        <circle className="qd-ball-b" cx="172" cy="166" r="6" fill="#8a8a86" stroke={ink} />
        <rect x="260" y="118" width="46" height="64" rx="6" fill="#2f2f2c" stroke={ink} strokeWidth="1.2" />
        <rect className="qd-button" x="306" y="134" width="16" height="32" rx="4" fill="#ff5f1f" />
        <g className="qd-loop">
          <path
            d="M306 108 C 420 70, 470 150, 420 230 C 380 270, 300 230, 306 192"
            fill="none"
            stroke={ink}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path d="M440 120 L520 84 M452 152 L532 136 M450 192 L535 210" stroke="#5a6650" strokeWidth="14" />
        </g>
      </g>

      <circle className="qd-ring" cx="180" cy="150" r="40" fill="none" stroke="#ff5f1f" strokeWidth="2" />
      <g className="qd-klick" fontFamily="monospace" fontWeight="700">
        <rect x="120" y="36" width="126" height="26" fill="#ff5f1f" />
        <text x="131" y="54" fill="#140a04" fontSize="14">
          KLICK · SITZT
        </text>
      </g>

      <g fontFamily="monospace" fontSize="12" fill="#edebe6">
        <text className="qd-step qd-step-1" x="24" y="290">
          1 · KNOPF DRÜCKEN
        </text>
        <text className="qd-step qd-step-2" x="196" y="290">
          2 · EINSETZEN
        </text>
        <text className="qd-step qd-step-3" x="330" y="290">
          3 · LOSLASSEN – RASTET EIN
        </text>
      </g>
      <text x="24" y="314" fill="#9a978f" fontFamily="monospace" fontSize="10">
        SCHEMA · NICHT MASSSTÄBLICH · PL-SL04
      </text>
    </svg>
  );
}

/** Längenverstellung als animierte Messskala 90–140 cm mit hochzählendem Wert */
const PX_PER_CM = 3.2;
const X0 = 40;
export function LengthSlot() {
  const valRef = useRef<SVGTextElement>(null);
  const ref = usePlayWhenVisible((root) => {
    const q = gsap.utils.selector(root);
    const state = { cm: 90 };
    const render = () => {
      const w = state.cm * PX_PER_CM;
      q('.len-strap').forEach((el) => el.setAttribute('width', String(w)));
      q('.len-end').forEach((el) => el.setAttribute('transform', `translate(${w},0)`));
      if (valRef.current) valRef.current.textContent = `${String(Math.round(state.cm)).padStart(3, '0')} cm`;
    };
    const tl = gsap.timeline({ repeat: -1, paused: true, onUpdate: render });
    tl.to(state, { cm: 140, duration: 2.2, ease: 'power2.inOut' }, 0.6)
      .to({}, { duration: 0.8 })
      .to(state, { cm: 90, duration: 2.2, ease: 'power2.inOut' })
      .to({}, { duration: 0.4 });
    render();
    return tl;
  });

  const at = (cm: number) => X0 + cm * PX_PER_CM;
  return (
    <svg ref={ref} viewBox="0 0 560 330" role="img" aria-label="Messskala: Die Riemenlänge ist stufenlos von 90 bis 140 Zentimeter verstellbar.">
      <rect width="560" height="330" fill="#161615" />
      {/* Verstellbereich */}
      <rect x={at(90)} y="150" width={50 * PX_PER_CM} height="62" fill="#ff5f1f" opacity="0.08" />
      {[90, 140].map((cm) => (
        <g key={cm}>
          <line x1={at(cm)} y1="150" x2={at(cm)} y2="212" stroke="#ff5f1f" strokeDasharray="3 3" />
          <text x={at(cm)} y="142" fill="#ff5f1f" fontFamily="monospace" fontSize="10" textAnchor="middle">
            {cm}
          </text>
        </g>
      ))}
      {/* Gurtband (3,2 cm) */}
      <rect className="len-strap" x={X0} y="170" width={90 * PX_PER_CM} height="24" fill="#4a5236" />
      <rect className="len-strap" x={X0} y="181" width={90 * PX_PER_CM} height="2" fill="#000" opacity="0.25" />
      <g className="len-end" transform={`translate(${90 * PX_PER_CM},0)`}>
        <rect x={X0 - 8} y="164" width="16" height="36" rx="2" fill="none" stroke="#c9c6be" strokeWidth="3" />
        <line x1={X0} y1="158" x2={X0} y2="212" stroke="#ff5f1f" strokeWidth="1.5" />
      </g>
      {/* Skala */}
      <line x1={X0} y1="212" x2={at(150)} y2="212" stroke="#c9c6be" />
      {Array.from({ length: 31 }, (_, i) => i * 5).map((cm) => (
        <g key={cm}>
          <line x1={at(cm)} y1="212" x2={at(cm)} y2={cm % 10 === 0 ? 230 : 222} stroke="#c9c6be" strokeWidth={cm % 10 === 0 ? 1.2 : 0.7} />
          {cm % 20 === 0 && (
            <text x={at(cm)} y="246" fill="#9a978f" fontFamily="monospace" fontSize="10" textAnchor="middle">
              {cm}
            </text>
          )}
        </g>
      ))}
      <text x={X0} y="92" fill="#9a978f" fontFamily="monospace" fontSize="11">
        LÄNGE · STUFENLOS
      </text>
      <text ref={valRef} x={X0} y="128" fill="#edebe6" fontFamily="monospace" fontSize="34" fontWeight="700">
        090 cm
      </text>
      <text x="520" y="128" fill="#9a978f" fontFamily="monospace" fontSize="11" textAnchor="end">
        GURTBAND 3,2 CM · NYLON
      </text>
      <text x={X0} y="300" fill="#9a978f" fontFamily="monospace" fontSize="10">
        SCHEMA · PL-SL04
      </text>
    </svg>
  );
}
