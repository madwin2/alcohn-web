'use client';

import { useEffect } from 'react';
import { getConsentState } from '@/lib/analytics/cookies';
import { getGtmId, loadGtmContainer, updateGtmConsent } from '@/lib/analytics/gtm';
import { grantMetaPixelConsent } from '@/lib/analytics/metaPixel';

export default function GoogleTagManager() {
  useEffect(() => {
    const gtmId = getGtmId();
    if (!gtmId) return;

    const consent = getConsentState();
    if (!consent?.analytics) return;

    updateGtmConsent(consent.analytics, consent.marketing);
    loadGtmContainer(consent.analytics);
    if (consent.marketing) {
      grantMetaPixelConsent();
    }
  }, []);

  return null;
}
