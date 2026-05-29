'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getConsentState } from '@/lib/analytics/cookies';
import { trackEvent } from '@/lib/analytics/client';

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedInitialPageView = useRef(false);

  useEffect(() => {
    const consent = getConsentState();
    if (!consent?.analytics) return;

    const query = searchParams?.toString();
    const fullPath = query ? `${pathname}?${query}` : pathname;

    if (!hasTrackedInitialPageView.current) {
      hasTrackedInitialPageView.current = true;
      void trackEvent('page_view', {
        pagePath: fullPath,
      });
      return;
    }

    void trackEvent('page_view', {
      pagePath: fullPath,
    });
  }, [pathname, searchParams]);

  return null;
}
