'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

type Motion = {
  /** prefers-reduced-motion */
  reduced: boolean;
  /** schwaches Gerät / Datensparmodus → 3D & Video vereinfachen */
  lowPower: boolean;
  /** Desktop-Layout mit gepinnten Bühnen */
  desktop: boolean;
  ready: boolean;
};

const MotionCtx = createContext<Motion>({ reduced: false, lowPower: false, desktop: true, ready: false });
export const useMotion = () => useContext(MotionCtx);

let lenisRef: Lenis | null = null;
/** Für Anker-Links: sanft scrollen, wenn Lenis aktiv ist */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisRef) lenisRef.scrollTo(el, { offset: -64 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
export function stopScroll(stop: boolean) {
  if (!lenisRef) return;
  if (stop) lenisRef.stop();
  else lenisRef.start();
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [m, setM] = useState<Motion>({ reduced: false, lowPower: false, desktop: true, ready: false });

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const weakCpu = (nav.hardwareConcurrency ?? 8) <= 4;
    const weakMem = (nav.deviceMemory ?? 8) <= 4;
    const saveData = !!nav.connection?.saveData;
    const lowPower = reduced || saveData || (weakCpu && weakMem);
    const desktop = window.matchMedia('(min-width: 961px)').matches;
    setM({ reduced, lowPower, desktop, ready: true });

    // Smooth Scroll nur ohne reduced-motion und mit Feinzeiger (Touch scrollt nativ)
    let lenis: Lenis | null = null;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!reduced && fine) {
      lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
      lenisRef = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      const raf = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      (lenis as Lenis & { _raf?: (t: number) => void })._raf = raf;
    }

    // Scan-Effekt: jede .scan-Sektion einmal „abtasten“, wenn sie sichtbar wird
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-scanned');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.18 },
    );
    document.querySelectorAll('.scan').forEach((el) => io.observe(el));

    const onResize = () => setM((s) => ({ ...s, desktop: window.matchMedia('(min-width: 961px)').matches }));
    window.addEventListener('resize', onResize);

    return () => {
      io.disconnect();
      window.removeEventListener('resize', onResize);
      if (lenis) {
        const raf = (lenis as Lenis & { _raf?: (t: number) => void })._raf;
        if (raf) gsap.ticker.remove(raf);
        lenis.destroy();
        lenisRef = null;
      }
    };
  }, []);

  return <MotionCtx.Provider value={m}>{children}</MotionCtx.Provider>;
}

/** Pull-Tab-Mikrointeraktion: kurz am orangen Zugband ziehen */
export function pull(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove('is-pulled');
  void el.offsetWidth; // Reflow → Animation neu starten
  el.classList.add('is-pulled');
}
