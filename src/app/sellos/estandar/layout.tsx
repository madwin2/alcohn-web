import type { Metadata } from 'next';
import { buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Sellos estándar de bronce | Comprá online con envío | Alcohn',
  description:
    'Diseños estándar de bronce listos para personalizar. Elegí motivo, medida, agregá al carrito y comprá online con envío nacional.',
  path: '/sellos/estandar',
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Sellos estándar', path: '/sellos/estandar' },
]);

export default function SellosEstandarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
