'use client';

import { getConsentState } from './cookies';
import type { PurchaseSnapshot } from './purchaseSnapshot';

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  push?: FbqFunction;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

let pixelInitialized = false;
let pixelScriptInjected = false;

export function getMetaPixelId(): string | null {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return id || null;
}

function injectMetaPixelScript(): void {
  if (typeof window === 'undefined' || pixelScriptInjected) return;
  pixelScriptInjected = true;

  if (window.fbq) return;

  const n = function (...args: unknown[]) {
    if (n.callMethod) {
      n.callMethod(...args);
    } else {
      n.queue!.push(args);
    }
  } as FbqFunction;

  if (!window._fbq) window._fbq = n;
  window.fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);
}

function canTrack(): boolean {
  if (typeof window === 'undefined') return false;
  if (!getMetaPixelId()) return false;
  const consent = getConsentState();
  return consent?.marketing === true;
}

function ensurePixelReady(): void {
  if (!canTrack()) return;
  injectMetaPixelScript();
  if (pixelInitialized || typeof window.fbq !== 'function') return;

  const pixelId = getMetaPixelId();
  if (!pixelId) return;

  pixelInitialized = true;
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

export function initMetaPixel(): void {
  ensurePixelReady();
}

export function trackMetaPageView(): void {
  if (!canTrack()) return;
  ensurePixelReady();
  window.fbq?.('track', 'PageView');
}

export function trackMetaEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  if (!canTrack()) return;
  ensurePixelReady();
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
