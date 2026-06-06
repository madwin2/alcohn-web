'use client';

import { useEffect } from 'react';
import { getConsentState } from '@/lib/analytics/cookies';
import { getGtmId, loadGtmContainer, updateGtmConsent } from '@/lib/analytics/gtm';

export default function GoogleTagManager() {
  useEffect(() => {
    const gtmId = getGtmId();
    if (!gtmId) return;

    const consent = getConsentState();
    if (!consent?.analytics) return;

    updateGtmConsent(consent.analytics, consent.marketing);
    loadGtmContainer();
  }, []);

  return null;
}
