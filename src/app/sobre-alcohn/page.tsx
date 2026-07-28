import type { Metadata } from 'next';
import SobreAlcohnPageContent from '@/components/pages/SobreAlcohnPageContent';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Sobre Alcohn | Sellos de bronce CNC en Mar del Plata, Argentina',
  description:
    'Fabricamos sellos de bronce de alta precisión con CNC propia. +6.000 sellos, marcas nacionales y envío a todo el país.',
  path: '/sobre-alcohn',
});

export default function SobreAlcohnPage() {
  return <SobreAlcohnPageContent market="ar" />;
}
