'use client';

import { useEffect } from 'react';
import { useCart } from '@/components/cart/CartProvider';

/** Nach erfolgreicher Bestellung Warenkorb leeren (PayPal-Rücksprung) */
export function ClearCart() {
  const { clear, lines } = useCart();
  useEffect(() => {
    if (lines.length) clear();
  }, [lines.length, clear]);
  return null;
}
