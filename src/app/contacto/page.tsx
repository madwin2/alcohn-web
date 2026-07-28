import type { Metadata } from 'next';
import ContactoPageContent from '@/components/pages/ContactoPageContent';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Contacto | Sellos de bronce personalizados Alcohn Argentina',
  description:
    'Escribinos por WhatsApp o formulario. Mar del Plata, envío a todo Argentina. Resolvemos dudas sobre tu sello de bronce CNC.',
  path: '/contacto',
});

export default function ContactoPage() {
  return <ContactoPageContent market="ar" />;
}
