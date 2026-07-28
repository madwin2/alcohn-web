import type { Metadata } from 'next';
import ComoUsarSellosPageContent from '@/components/pages/ComoUsarSellosPageContent';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Cómo usar sellos de bronce en cuero, madera y alimentos | Alcohn',
  description:
    'Guía práctica: temperatura, presión y técnica para marcar cuero, madera, pan, packaging, hielo y más con sellos de bronce.',
  path: '/como-usar-sellos',
});

export default function ComoUsarSellosPage() {
  return <ComoUsarSellosPageContent market="ar" />;
}
