'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackMetaPageView } from '@/lib/analytics/metaPixel';

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipNextPageView = useRef(true);

  useEffect(() => {
    if (skipNextPageView.current) {
      skipNextPageView.current = false;
      return;
    }
    trackMetaPageView();
  }, [pathname, searchParams]);

  return null;
}
