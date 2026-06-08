'use client';

import { getConsentState } from './cookies';
import type { PurchaseSnapshot } from './purchaseSnapshot';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

let consentGranted = false;

export function getMetaPixelId(): string | null {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return id || null;
}

function canTrack(): boolean {
  if (typeof window === 'undefined') return false;
  if (!getMetaPixelId()) return false;
  const consent = getConsentState();
  return consent?.marketing === true;
}

export function revokeMetaPixelConsent(): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('consent', 'revoke');
  consentGranted = false;
}

export function grantMetaPixelConsent(): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  if (!getMetaPixelId()) return;

  window.fbq('consent', 'grant');
  if (!consentGranted) {
    consentGranted = true;
    window.fbq('track', 'PageView');
  }
}

/** Activa el pixel si el usuario ya aceptó cookies de marketing. */
export function initMetaPixel(): void {
  if (!canTrack()) return;
  grantMetaPixelConsent();
}

export function trackMetaPageView(): void {
  if (!canTrack()) return;
  grantMetaPixelConsent();
  window.fbq?.('track', 'PageView');
}

export function trackMetaEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  if (!canTrack()) return;
  grantMetaPixelConsent();
  window.fbq?.('track', eventName, params);
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
