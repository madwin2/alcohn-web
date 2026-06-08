'use client';

import type { PurchaseSnapshot } from './purchaseSnapshot';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';

function pageContext(): { page_path: string; page_location: string } {
  return {
    page_path: `${window.location.pathname}${window.location.search}`,
    page_location: window.location.href,
  };
}

function isFbqReady(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

/** Envío directo a Meta (respaldo si fbevents.js está bloqueado). */
function sendPixelBeacon(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  if (!META_PIXEL_ID || typeof window === 'undefined') return;

  const search = new URLSearchParams({
    id: META_PIXEL_ID,
    ev: eventName,
    dl: window.location.href,
    rl: document.referrer || '',
    noscript: '1',
  });

  if (typeof params.value === 'number') {
    search.set('cd[value]', String(params.value));
    search.set('cd[currency]', String(params.currency ?? 'ARS'));
  }

  const img = new Image(1, 1);
  img.src = `https://www.facebook.com/tr?${search.toString()}`;
}

function trackNow(eventName: string, params: Record<string, unknown> = {}): void {
  if (!META_PIXEL_ID) return;

  sendPixelBeacon(eventName, params);

  if (!isFbqReady()) return;
  window.fbq!('track', eventName, {
    ...pageContext(),
    ...params,
  });
}

function runWhenReady(callback: () => void, attemptsLeft = 15): void {
  callback();
  if (isFbqReady() || attemptsLeft <= 0) return;
  window.setTimeout(() => runWhenReady(callback, attemptsLeft - 1), 300);
}

export function trackMetaPageView(): void {
  runWhenReady(() => trackNow('PageView'));
}

export function trackMetaEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  runWhenReady(() => trackNow(eventName, params));
}

export function trackMetaInitiateCheckout(params: {
  value: number;
  contentIds: string[];
  numItems: number;
}): void {
  trackMetaEvent('InitiateCheckout', {
    value: params.value,
    currency: 'ARS',
    content_ids: params.contentIds,
    num_items: params.numItems,
    content_type: 'product',
  });
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
  if (isFbqReady()) window.fbq!('consent', 'grant');
  trackMetaPageView();
}

/** @deprecated Ya no usamos consent API de Meta. */
export function revokeMetaPixelConsent(): void {}

/** @deprecated Ya no bloqueamos eventos por cookie de marketing. */
export function hasMarketingConsent(): boolean {
  return true;
}
