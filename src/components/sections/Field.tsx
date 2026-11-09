'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Picture } from '../Picture';
import { useMotion } from '../MotionProvider';

const PANELS = [
  {
    key: 'einsatz-stand',
    num: '01',
    title: 'Schießstand',
    text: 'Aufklappen, und die Matte liegt. Magazine in den Schlaufen, Gehörschutz vorn in der Fronttasche – jedes Teil hat seinen Platz.',
    kit: ['PL_KWT', 'PL_IFAK'],
    coords: '49.63° N / 8.36° E',
    ai: true,
  },
  {
    key: 'rb-wald',
    num: '02',
    title: 'Gelände',
    text: 'Waldweg, Hang, Hochsitz. Gurt über die Schulter, Hände frei. Am MOLLE-Raster hängt, was du schnell greifen willst.',
    kit: ['PL_KWT', 'PL_GR'],
    coords: '49.32° N / 7.80° E',
    ai: true,
  },
  {
    key: 'med-wald',
    num: '03',
    title: 'Einsatz',
    text: 'Wenn es ernst wird, zählt jeder Griff. Ein Zug löst das IFAK von der Platte, aufklappen, alles liegt offen. Inhalt und Ausbildung bringst du selbst mit.',
    kit: ['PL_IFAK', 'PL_AP'],
    coords: '49.45° N / 7.95° E',
    ai: true,
  },
  {
    key: 'einsatz-pfalz',
    num: '04',
    title: 'Heimat',
    text: 'Weinberge, Haardtrand, Pfälzerwald. Aus Worms: geprüft, gepackt, verschickt – in 1–2 Werktagen.',
    kit: ['PL_AP', 'PL_IFAK'],
    coords: '49.30° N / 7.80° E',
    ai: false,
  },
];

export function Field() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { ready, reduced, desktop } = useMotion();

  useEffect(() => {
    if (!ready || reduced || !desktop || !track.current || !wrap.current) return;
    const ctx = gsap.context(() => {
      const dist = () => track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      // Parallax: Bild bewegt sich langsamer als das Panel
      gsap.utils.toArray<HTMLElement>('.panel picture').forEach((pic) => {
        gsap.fromTo(
          pic,
          { xPercent: -8, scale: 1.12 },
          {
            xPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: wrap.current, start: 'top top', end: 'bottom bottom', scrub: true },
          },
        );
      });
    }, wrap);
    return () => ctx.revert();
  }, [ready, reduced, desktop]);

  return (
    <section className="field scan" id="einsatz" aria-labelledby="field-h">
      <div className="scan__beam" data-hud="SEKTOR 04 // EINSATZ" />
      <div className="wrap field__intro">
        <div className="sec-head mono">
          <span className="sec-head__label" id="field-h">
            Einsatzszenarien
          </span>
          <span className="dim-3">{desktop ? 'Scrollen → seitwärts' : 'Wischen →'}</span>
        </div>
      </div>
      <div ref={wrap} className="field__track-wrap" style={{ ['--panels' as string]: PANELS.length }}>
        <div className="field__sticky">
          <div ref={track} className="field__track">
            {PANELS.map((p) => (
              <div className="panel" key={p.num} role="group" aria-label={`${p.num} ${p.title}`}>
                <Picture k={p.key} alt="" sizes="100vw" />
                <span className="panel__coords mono">{p.coords}</span>
                {p.ai && <span className="panel__ai mono">Symbolbild (KI)</span>}
                <div className="panel__body">
                  <span className="panel__num mono">
                    {p.num} / {String(PANELS.length).padStart(2, '0')}
                  </span>
                  <h3 className="display panel__title">{p.title}</h3>
                  <p className="panel__text">{p.text}</p>
                  <div className="panel__kit">
                    {p.kit.map((k) => (
                      <span key={k} className="chip mono">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
