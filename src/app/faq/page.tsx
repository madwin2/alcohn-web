import type { Metadata } from 'next';
import FaqPageContent from '@/components/pages/FaqPageContent';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Preguntas frecuentes sobre sellos de bronce personalizados | Alcohn',
  description:
    'Dudas sobre medidas, materiales, tiempos de fabricación, envíos y compra de sellos de bronce CNC en Argentina.',
  path: '/faq',
});

export default function FaqPage() {
  return <FaqPageContent market="ar" />;
}
