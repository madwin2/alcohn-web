import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, SITE_NAME, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Sellos estándar - Alcohn',
  description:
    'Diseños estándar listos para personalizar. Elegí motivo, medida y completá checkout online.',
  alternates: {
    canonical: '/sellos/estandar',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/sellos/estandar',
    siteName: SITE_NAME,
    title: 'Sellos estándar - Alcohn',
    description:
      'Diseños estándar listos para personalizar. Elegí motivo, medida y completá checkout online.',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sellos estándar - Alcohn',
    description:
      'Diseños estándar listos para personalizar. Elegí motivo, medida y completá checkout online.',
    images: [DEFAULT_OG_IMAGE],
  },
};

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
