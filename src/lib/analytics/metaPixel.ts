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

/**
 * Envío directo a Meta, solo como respaldo cuando `fbq` nunca cargó (bloqueadores).
 * Nunca se manda junto con `fbq`: Meta los contaría como dos eventos.
 */
function sendPixelBeacon(
  eventName: string,
  params: Record<string, unknown> = {},
  eventId?: string
): void {
  if (!META_PIXEL_ID || typeof window === 'undefined') return;

  const search = new URLSearchParams({
    id: META_PIXEL_ID,
    ev: eventName,
    dl: window.location.href,
    rl: document.referrer || '',
    noscript: '1',
  });

  if (eventId) search.set('eid', eventId);
  if (typeof params.value === 'number') {
    search.set('cd[value]', String(params.value));
    search.set('cd[currency]', String(params.currency ?? 'ARS'));
  }

  const img = new Image(1, 1);
  img.src = `https://www.facebook.com/tr?${search.toString()}`;
}

type FbqMethod = 'track' | 'trackCustom';

/**
 * Manda el evento una sola vez: por `fbq` si está (o aparece en ~4,5 s),
 * si no, por el beacon. `eventId` permite a Meta deduplicar contra la API de
 * Conversiones (el servidor usa el id de la orden).
 */
function sendOnce(
  method: FbqMethod,
  eventName: string,
  params: Record<string, unknown>,
  eventId?: string,
  attemptsLeft = 15
): void {
  if (!META_PIXEL_ID || typeof window === 'undefined') return;

  if (isFbqReady()) {
    const payload = { ...pageContext(), ...params };
    if (eventId) window.fbq!(method, eventName, payload, { eventID: eventId });
    else window.fbq!(method, eventName, payload);
    return;
  }
  if (attemptsLeft <= 0) {
    sendPixelBeacon(eventName, params, eventId);
    return;
  }
  window.setTimeout(() => sendOnce(method, eventName, params, eventId, attemptsLeft - 1), 300);
}

export function trackMetaPageView(): void {
  sendOnce('track', 'PageView', {});
}

export function trackMetaEvent(
  eventName: string,
  params: Record<string, unknown> = {},
  eventId?: string
): void {
  sendOnce('track', eventName, params, eventId);
}

export function trackMetaCustomEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  sendOnce('trackCustom', eventName, params);
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

/**
 * Purchase del navegador. `eventID` = id de la orden, igual que el Purchase que manda
 * Alcohn AI por la API de Conversiones (edge `meta-conversion`), así Meta cuenta una sola compra.
 */
export function trackMetaPurchase(snapshot: PurchaseSnapshot): void {
  trackMetaEvent(
    'Purchase',
    {
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
    },
    snapshot.orderId
  );
}

/** Purchase Meta solo para checkout Perú (`/pe/checkout/success`). No altera Argentina. */
export function trackMetaPurchasePeru(params: {
  value: number;
  transactionId: string;
}): void {
  if (!META_PIXEL_ID) return;

  const payload = {
    value: params.value,
    currency: 'PEN',
    market: 'pe',
    transaction_id: params.transactionId,
  };
  sendOnce('track', 'Purchase', payload, `pe_${params.transactionId}`);
}

/** @deprecated Mantener compatibilidad con imports existentes. */
export function initMetaPixel(): void {
  trackMetaPageView();
}

/**
 * @deprecated El pixel ya se inicializa en el head. No manda PageView: el de la
 * página ya salió desde `MetaPixel` y repetirlo lo contaría dos veces.
 */
export function grantMetaPixelConsent(): void {
  if (isFbqReady()) window.fbq!('consent', 'grant');
}

/** @deprecated Ya no usamos consent API de Meta. */
export function revokeMetaPixelConsent(): void {}

/** @deprecated Ya no bloqueamos eventos por cookie de marketing. */
export function hasMarketingConsent(): boolean {
  return true;
}
