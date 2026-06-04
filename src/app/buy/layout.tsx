import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Diseñar sello personalizado | Alcohn',
  description:
    'Subí tu logo, elegí material y medida. Cotizá y fabricá tu sello de bronce CNC en minutos.',
  path: '/buy',
  robots: { index: false, follow: false },
});

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
