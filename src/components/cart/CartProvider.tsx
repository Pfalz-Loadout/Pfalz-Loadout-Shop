'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { computeTotals, findVariant, type CartLine, type Totals } from '@/data/shop';

type State = { lines: CartLine[] };
type Action =
  | { type: 'add'; items: CartLine[] }
  | { type: 'set'; sku: string; qty: number }
  | { type: 'remove'; sku: string }
  | { type: 'clear' }
  | { type: 'hydrate'; lines: CartLine[] };

const KEY = 'pl-cart-v1';

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case 'hydrate':
      return { lines: a.lines.filter((l) => findVariant(l.sku)) };
    case 'add': {
      const lines = [...state.lines];
      for (const it of a.items) {
        const hit = lines.find((l) => l.sku === it.sku);
        if (hit) hit.qty = Math.min(20, hit.qty + it.qty);
        else lines.push({ sku: it.sku, qty: Math.min(20, it.qty) });
      }
      return { lines: lines.map((l) => ({ ...l })) };
    }
    case 'set':
      return {
        lines: state.lines
          .map((l) => (l.sku === a.sku ? { ...l, qty: Math.max(0, Math.min(20, a.qty)) } : l))
          .filter((l) => l.qty > 0),
      };
    case 'remove':
      return { lines: state.lines.filter((l) => l.sku !== a.sku) };
    case 'clear':
      return { lines: [] };
  }
}

type Ctx = {
  lines: CartLine[];
  totals: Totals;
  count: number;
  add: (items: CartLine[], opts?: { open?: boolean }) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (v: boolean) => void;
  /** kurze Rückmeldung für Screenreader */
  announce: string;
};

const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: 'hydrate', lines: JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state.lines));
    } catch {}
  }, [state.lines, hydrated]);

  const add = useCallback((items: CartLine[], opts?: { open?: boolean }) => {
    dispatch({ type: 'add', items });
    const n = items.reduce((s, i) => s + i.qty, 0);
    setAnnounce(`${n} Artikel in den Warenkorb gelegt`);
    if (opts?.open !== false) setCartOpen(true);
  }, []);

  const value = useMemo<Ctx>(() => {
    const totals = computeTotals(state.lines);
    return {
      lines: state.lines,
      totals,
      count: state.lines.reduce((s, l) => s + l.qty, 0),
      add,
      setQty: (sku, qty) => dispatch({ type: 'set', sku, qty }),
      remove: (sku) => dispatch({ type: 'remove', sku }),
      clear: () => dispatch({ type: 'clear' }),
      cartOpen,
      setCartOpen,
      checkoutOpen,
      setCheckoutOpen,
      announce,
    };
  }, [state.lines, add, cartOpen, checkoutOpen, announce]);

  return (
    <CartCtx.Provider value={value}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {announce}
      </div>
    </CartCtx.Provider>
  );
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error('useCart außerhalb von CartProvider');
  return c;
}
