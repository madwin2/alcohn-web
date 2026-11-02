'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/client';

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedInitialPageView = useRef(false);

  useEffect(() => {
    // Se mide aunque no haya elección o haya rechazo; `trackEvent` decide si va anónimo.
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
