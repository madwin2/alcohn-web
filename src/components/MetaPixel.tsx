'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackMetaPageView } from '@/lib/analytics/metaPixel';

function patchHistoryForSpaTracking(): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & { __alcohnHistoryPatched?: boolean };
  if (w.__alcohnHistoryPatched) return;
  w.__alcohnHistoryPatched = true;

  const notify = () => {
    window.dispatchEvent(new Event('alcohn:navigation'));
  };

  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args) => {
    originalPushState(...args);
    notify();
  };

  history.replaceState = (...args) => {
    originalReplaceState(...args);
    notify();
  };

  window.addEventListener('popstate', notify);
}

export default function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    patchHistoryForSpaTracking();
  }, []);

  useEffect(() => {
    const fire = () => trackMetaPageView();
    fire();
    window.addEventListener('alcohn:navigation', fire);
    return () => window.removeEventListener('alcohn:navigation', fire);
  }, [pathname]);

  return null;
}
