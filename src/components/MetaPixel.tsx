'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackMetaPageView } from '@/lib/analytics/metaPixel';

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackMetaPageView();
  }, [pathname, searchParams]);

  return null;
}
