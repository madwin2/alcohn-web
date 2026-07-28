import type { Metadata } from 'next';
import ProcesoPageContent from '@/components/pages/ProcesoPageContent';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Cómo comprar tu sello de bronce | Proceso en 72hs | Alcohn',
  description:
    'Pasos para comprar un sello personalizado: subí tu logo, elegí medida y material, revisá muestra y recibí tu sello de bronce CNC.',
  path: '/proceso',
});

export default function ProcesoPage() {
  return <ProcesoPageContent market="ar" />;
}
