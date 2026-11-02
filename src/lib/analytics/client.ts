'use client';

import {
  getConsentLabel,
  getOrCreateSessionId,
  getOrCreateVisitorId,
  getTrackingMode,
} from './cookies';
import type { ClientTrackingEvent } from './types';
import { pushGtmEvent } from './gtm';

function collectUtmParams(
  url: URL
): Pick<
  ClientTrackingEvent,
  'utmSource' | 'utmMedium' | 'utmCampaign' | 'utmTerm' | 'utmContent'
> {
  return {
    utmSource: url.searchParams.get('utm_source'),
    utmMedium: url.searchParams.get('utm_medium'),
    utmCampaign: url.searchParams.get('utm_campaign'),
    utmTerm: url.searchParams.get('utm_term'),
    utmContent: url.searchParams.get('utm_content'),
  };
}

export async function trackEvent(
  eventName: string,
  options: {
    metadata?: Record<string, unknown>;
    pagePath?: string;
  } = {}
): Promise<void> {
  if (typeof window === 'undefined') return;

  // Se mide siempre. Si la persona rechazó, el evento va sin visitante persistente
  // (solo la sesión de la pestaña) y el servidor no guarda la IP.
  const mode = getTrackingMode();
  const currentUrl = new URL(window.location.href);
  const visitorId = mode === 'full' ? getOrCreateVisitorId() : null;
  let sessionId: string | null = null;
  try {
    sessionId = getOrCreateSessionId();
  } catch {
    // sessionStorage bloqueado: el evento se cuenta igual, sin sesión.
  }

  const payload: ClientTrackingEvent = {
    eventName,
    pagePath: options.pagePath ?? window.location.pathname,
    pageUrl: currentUrl.toString(),
    referrer: document.referrer || null,
    visitorId,
    sessionId,
    ...collectUtmParams(currentUrl),
    metadata: { ...(options.metadata ?? {}), consent: getConsentLabel() },
  };

  pushGtmEvent(eventName, {
    page_path: payload.pagePath,
    page_location: payload.pageUrl,
    page_referrer: payload.referrer,
    ...payload.metadata,
  });

  try {
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // El tracking nunca debe romper la UX.
  }
}
