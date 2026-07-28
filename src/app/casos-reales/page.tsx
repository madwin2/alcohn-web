import type { Metadata } from 'next';
import CasosRealesPageContent from '@/components/pages/CasosRealesPageContent';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title:
    'Casos reales: marcas que usan sellos Alcohn (Brooksfield, Tucci, Mistral, Lee) | Alcohn',
  description:
    'Galería de sellos terminados y trabajos reales. Marcas, talleres y emprendedores que marcan con bronce CNC Alcohn.',
  path: '/casos-reales',
});

export default function CasosRealesPage() {
  return <CasosRealesPageContent market="ar" />;
}
