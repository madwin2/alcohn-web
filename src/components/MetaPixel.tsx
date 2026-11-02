'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackMetaPageView } from '@/lib/analytics/metaPixel';

/**
 * Único origen del PageView de Meta: uno por ruta. El head solo inicializa el
 * pixel. `alcohn:navigation` queda para PageViews virtuales explícitos (por
 * ejemplo, el paso de pago del diseñador); cambios de query no cuentan.
 */
export default function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    trackMetaPageView();
  }, [pathname]);

  useEffect(() => {
    const fire = () => trackMetaPageView();
    window.addEventListener('alcohn:navigation', fire);
    return () => window.removeEventListener('alcohn:navigation', fire);
  }, []);

  return null;
}
