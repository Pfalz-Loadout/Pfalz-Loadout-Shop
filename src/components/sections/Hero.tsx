'use client';

import { Fragment, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { PRODUCTS, SHOP } from '@/data/shop';
import { useMotion, scrollToId } from '../MotionProvider';
import { mediaMeta } from '../Picture';

/** Text in Wörter + Buchstaben zerlegen → Stencil-Aufbau Buchstabe für Buchstabe */
function Stencil({ text, delay, step = 0.05 }: { text: string; delay: number; step?: number }) {
  let n = 0;
  return (
    <>
      {text.split(' ').map((word, wi, all) => (
        <Fragment key={wi}>
          <span className="word">
            {[...word].map((ch, i) => (
              <span key={i} className="ch" style={{ animationDelay: `${delay + n++ * step}s` }}>
                {ch}
              </span>
            ))}
          </span>
          {wi < all.length - 1 && ' '}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Hero: Typografie wie das Deckblatt eines Datenblatts.
 * In der Wortmarke: das echte Pfalz-Foto aus dem Zielfernrohr-Intro (PFALZ = Bergkamm, LOADOUT = Weinberge).
 * LCP bleibt Text (Foto nur als Hintergrund der Schrift).
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();

  // Foto in der Schrift: fertige Buchstaben verlieren ihre Animation (sonst blendet Chrome sie bei background-clip: text aus)
  useEffect(() => {
    const h1 = section.current?.querySelector('.hero__title');
    if (!h1) return;
    const done = (e: Event) => (e.target as HTMLElement).classList?.add('is-done');
    h1.addEventListener('animationend', done);
    return () => h1.removeEventListener('animationend', done);
  }, []);

  // Kamerafahrt in der Schrift nur, solange der Hero sichtbar ist (spart Akku)
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-aus', !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Beim Rausscrollen: Wortmarke auseinanderziehen, Rest verblasst (Parallax-Ebenen)
  useEffect(() => {
    if (!ready || reduced || !section.current) return;
    const ctx = gsap.context(() => {
      const st = { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero__mark--a', { xPercent: -6, ease: 'none', scrollTrigger: st });
      gsap.to('.hero__mark--b', { xPercent: 6, ease: 'none', scrollTrigger: st });
      gsap.to('.hero__meta, .hero__foot', { opacity: 0, y: -40, ease: 'none', scrollTrigger: st });
    }, section);
    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section ref={section} className="hero" id="top" aria-labelledby="hero-title">
      <div className="wrap hero__inner">
        <div className="hero__meta mono">
          <ul className="hero__codes" aria-label="Sortiment">
            {PRODUCTS.map((p) => (
              <li key={p.code}>
                <a
                  href={`#${p.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(p.slug);
                  }}
                >
                  {p.code}
                </a>
              </li>
            ))}
          </ul>
          <span className="dim-3">Taktische Ausrüstung · Schießstand · Gelände · Outdoor</span>
        </div>

        <h1 id="hero-title" className="hero__title stencil-in" style={{ ['--hero-foto' as string]: `url("/media/pfalz-weit-1920.webp?v=${mediaMeta('pfalz-weit').v}")` }}>
          <span className="hero__mark hero__mark--a">
            <Stencil text="PFALZ" delay={0.1} />
          </span>
          <span className="hero__mark hero__mark--b">
            <Stencil text="LOADOUT" delay={0.35} />
            <span className="hero__tab" aria-hidden="true" />
          </span>
          <span className="sr-only"> – {SHOP.claim}</span>
        </h1>

        <div className="hero__foot">
          <p className="hero__claim" aria-hidden="true">
            <Stencil text={SHOP.claim} delay={0.9} step={0.012} />
          </p>
          <div className="hero__row">
            <div className="hero__coords mono">
              <span>
                <b>{SHOP.coords.lat}</b> / <b>{SHOP.coords.lon}</b>
              </span>
              <span aria-hidden="true">—</span>
              <span>{SHOP.coords.label}</span>
              <span aria-hidden="true">—</span>
              <span>EST 2025</span>
            </div>
            <div className="hero__cta">
              <a
                className="btn tab"
                href="#ausruestung"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId('ausruestung');
                }}
              >
                Ausrüstung ansehen
              </a>
              <a
                className="btn btn--ghost"
                href="#loadout"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId('loadout');
                }}
              >
                Loadout bauen
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
