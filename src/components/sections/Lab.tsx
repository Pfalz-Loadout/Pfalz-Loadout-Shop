'use client';

import { useState } from 'react';
import { PRODUCTS, type ProofMoment } from '@/data/shop';
import { CompareSlot, FabricSlot, LengthSlot, MolleSlot, Placeholder, QdSlot, VideoSlot } from '../lab/Media';
import { Picture, hasMedia } from '../Picture';

function ProofMedia({ m }: { m: ProofMoment }) {
  const s = m.media;
  switch (s.kind) {
    case 'shader-fabric':
      return <FabricSlot color="#5a6650" />;
    case 'svg-molle':
      return <MolleSlot />;
    case 'svg-qd':
      return <QdSlot />;
    case 'scale-length':
      return <LengthSlot />;
    case 'compare':
      return <CompareSlot slot={s} />;
    case 'image':
      return s.src && hasMedia(s.src) ? (
        <Picture k={s.src} alt={m.title} sizes="(max-width: 860px) 92vw, 55vw" className={s.fit === 'contain' ? 'is-contain' : undefined} />
      ) : (
        <Placeholder slot={s} kind="Foto" />
      );
    case 'video':
      return <VideoSlot slot={s} />;
  }
}

export function Lab() {
  const [active, setActive] = useState(PRODUCTS[0].code);
  const product = PRODUCTS.find((p) => p.code === active)!;

  return (
    <section className="lab scan" id="labor" aria-labelledby="lab-h">
      <div className="scan__beam" data-hud="SEKTOR 03 // MATERIALLABOR" />
      <div className="wrap">
        <div className="sec-head mono">
          <span className="sec-head__label" id="lab-h">
            Materiallabor
          </span>
          <span className="dim-3">Angaben laut Hersteller / Produktbeschreibung</span>
        </div>
        <h2 className="display h2" style={{ marginBottom: 28 }}>
          Nicht behaupten.
          <br />
          <span className="dim">Zeigen.</span>
        </h2>

        <div className="lab__tabs" role="tablist" aria-label="Produkt wählen">
          {PRODUCTS.map((p) => (
            <button
              key={p.code}
              role="tab"
              type="button"
              id={`tab-${p.code}`}
              aria-selected={active === p.code}
              aria-controls="lab-panel"
              className="lab__tab mono"
              onClick={() => setActive(p.code)}
            >
              {p.code} · {p.name}
            </button>
          ))}
        </div>

        <div className="proofs" id="lab-panel" role="tabpanel" aria-labelledby={`tab-${active}`}>
          {product.lab.map((m, i) => (
            <div className="proof" key={m.id}>
              <div className="proof__media hud">
                <ProofMedia m={m} />
                {m.media.kind === 'video' && !m.media.src ? null : m.media.kind !== 'shader-fabric' ? (
                  <span className="proof__rec mono">
                    {product.code}-{String(i + 1).padStart(2, '0')}
                  </span>
                ) : null}
              </div>
              <div>
                <div className="mono dim-3">
                  Beweis {String(i + 1).padStart(2, '0')} / {String(product.lab.length).padStart(2, '0')}
                </div>
                <h3 className="display proof__title">{m.title}</h3>
                <p className="proof__prop wide">{m.property}</p>
                <dl className="specs proof__rows">
                  <div className="specs__row">
                    <dt>Material</dt>
                    <dd>{m.material}</dd>
                  </div>
                  <div className="specs__row">
                    <dt>Quelle</dt>
                    <dd>{m.source}</dd>
                  </div>
                </dl>
                <p className="proof__text">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
