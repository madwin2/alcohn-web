'use client';

import { useEffect } from 'react';
import { getConsentState } from '@/lib/analytics/cookies';
import { getGtmId, loadGtmContainer, updateGtmConsent } from '@/lib/analytics/gtm';
import { grantMetaPixelConsent } from '@/lib/analytics/metaPixel';

export default function GoogleTagManager() {
  useEffect(() => {
    const gtmId = getGtmId();
    if (!gtmId) return;

    // Opt-out: sin elección se mide completo. Si rechazó, GTM igual se carga con el
    // consentimiento en "denied" (modo avanzado: Google solo recibe señales sin cookies).
    const consent = getConsentState();
    const analytics = consent ? consent.analytics : true;
    const marketing = consent ? consent.marketing : true;

    updateGtmConsent(analytics, marketing);
    loadGtmContainer(analytics, marketing);
    if (marketing) {
      grantMetaPixelConsent();
    }
  }, []);

  return null;
}
