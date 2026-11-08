import { PRODUCTS } from '@/data/shop';
import { ProductStage } from './ProductStage';
import { Arsenal } from './Arsenal';

export function Products() {
  return (
    <section className="products" id="ausruestung" aria-labelledby="products-h">
      <div className="wrap">
        <div className="sec-head mono">
          <span className="sec-head__label" id="products-h">
            Ausrüstung – 4 Teile
          </span>
          <span className="dim-3">PL-RB01 · PL-DP02 · PL-MED03 · PL-SL04</span>
        </div>
        <h2 className="display h2">
          Vier Teile.
          <br />
          <span className="dim">Keine Kompromisse.</span>
        </h2>
      </div>
      {/* Desktop: gepinnte Bühnen · Mobil: Wisch-Karussell */}
      <div className="products__stages">
        {PRODUCTS.map((p, i) => (
          <ProductStage key={p.code} product={p} index={i} />
        ))}
      </div>
      <div className="products__arsenal">
        <Arsenal />
      </div>
    </section>
  );
}
