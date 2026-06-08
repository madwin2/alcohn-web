'use client';

import type { PurchaseSnapshot } from './purchaseSnapshot';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function getMetaPixelId(): string | null {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return id || null;
}

function canUseFbq(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

export function trackMetaPageView(): void {
  if (!canUseFbq()) return;
  window.fbq!('track', 'PageView');
}

export function trackMetaEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  if (!canUseFbq()) return;
  window.fbq!('track', eventName, params);
}

export function trackMetaAddToCart(item: {
  id: string;
  title: string;
  price: number;
  qty?: number;
}): void {
  const qty = item.qty ?? 1;
  trackMetaEvent('AddToCart', {
    content_ids: [item.id],
    content_name: item.title,
    content_type: 'product',
    value: item.price * qty,
    currency: 'ARS',
  });
}

export function trackMetaPurchase(snapshot: PurchaseSnapshot): void {
  trackMetaEvent('Purchase', {
    value: snapshot.value,
    currency: 'ARS',
    content_ids: snapshot.items.map((item) => item.id),
    content_type: 'product',
    num_items: snapshot.items.reduce((sum, item) => sum + item.qty, 0),
    order_id: snapshot.orderId,
    contents: snapshot.items.map((item) => ({
      id: item.id,
      quantity: item.qty,
      item_price: item.price,
    })),
  });
}

/** @deprecated Mantener compatibilidad con imports existentes. */
export function initMetaPixel(): void {
  trackMetaPageView();
}

/** @deprecated El pixel ya se inicializa en el head. */
export function grantMetaPixelConsent(): void {
  trackMetaPageView();
}

/** @deprecated Ya no usamos consent API de Meta. */
export function revokeMetaPixelConsent(): void {}

/** @deprecated Ya no bloqueamos eventos por cookie de marketing. */
export function hasMarketingConsent(): boolean {
  return true;
}
