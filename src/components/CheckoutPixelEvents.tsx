'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { trackMetaInitiateCheckout, trackMetaPageView } from '@/lib/analytics/metaPixel';

export default function CheckoutPixelEvents() {
  const { items, isHydrated, getSubtotal } = useCart();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || trackedRef.current || items.length === 0) return;

    trackedRef.current = true;
    trackMetaPageView();
    trackMetaInitiateCheckout({
      value: getSubtotal(),
      contentIds: items.map((item) => item.id),
      numItems: items.reduce((sum, item) => sum + item.qty, 0),
    });
  }, [isHydrated, items, getSubtotal]);

  return null;
}
