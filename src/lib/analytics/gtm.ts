'use client';

type DataLayerEntry = Record<string, unknown> | IArguments | unknown[];

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
    gtag?: GtagFunction;
  }
}

type GtagFunction = {
  (...args: unknown[]): void;
  q?: IArguments[];
};

let gtmLoaded = false;

function ensureGtag(): GtagFunction {
  window.dataLayer = window.dataLayer || [];

  if (typeof window.gtag === 'function') {
    return window.gtag;
  }

  const gtag = ((...args: unknown[]) => {
    window.dataLayer!.push(args as unknown as DataLayerEntry);
  }) as GtagFunction;

  gtag.q = [];
  window.gtag = gtag;
  return gtag;
}

export function getGtmId(): string | null {
  const id = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  return id || null;
}

export function updateGtmConsent(analytics: boolean, marketing = false): void {
  if (typeof window === 'undefined') return;

  ensureGtag()('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
  });
}

export function loadGtmContainer(analyticsGranted = true): void {
  if (typeof window === 'undefined') return;

  const gtmId = getGtmId();
  if (!gtmId || gtmLoaded) return;

  gtmLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  script.onload = () => {
    if (analyticsGranted) {
      updateGtmConsent(true, false);
    }
  };
  document.head.appendChild(script);
}

export function pushGtmEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
  });
}
