'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getConsentState } from '@/lib/analytics/cookies';
import { initMetaPixel, trackMetaPageView } from '@/lib/analytics/metaPixel';

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipNextPageView = useRef(true);

  useEffect(() => {
    const consent = getConsentState();
    if (!consent?.marketing) return;
    initMetaPixel();
  }, []);

  useEffect(() => {
    const consent = getConsentState();
    if (!consent?.marketing) return;

    if (skipNextPageView.current) {
      skipNextPageView.current = false;
      return;
    }

    trackMetaPageView();
  }, [pathname, searchParams]);

  return null;
}
