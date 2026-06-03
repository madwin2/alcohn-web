import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import ConditionalFooter from '@/components/ConditionalFooter';
import ConditionalWhatsapp from '@/components/ConditionalWhatsapp';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import { CartProvider } from '@/contexts/CartContext';
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  organizationJsonLd,
  SITE_URL,
} from '@/lib/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Alcohn - Sellos de bronce personalizados | Hecho en Argentina con CNC',
  description: 'Sellos de bronce de alta precisión fabricados en CNC. Más que una herramienta, una forma de contar tu historia. Para cuero, madera, alimentos. Hecho en Mar del Plata, Argentina.',
  keywords: 'sello de bronce, sello de bronce personalizado, sello para cuero, sello para madera, sello para marroquinería, sello con logo, sello para alimentos, hecho en Argentina, precisión CNC, profesionalización del oficio',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName: SITE_NAME,
    title: 'Alcohn - Sellos de bronce personalizados | Hecho en Argentina con CNC',
    description: 'Sellos de bronce de alta precisión fabricados en CNC. Más que una herramienta, una forma de contar tu historia. Para cuero, madera, alimentos. Hecho en Mar del Plata, Argentina.',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Sellos de bronce Alcohn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alcohn - Sellos de bronce personalizados | Hecho en Argentina con CNC',
    description: 'Sellos de bronce de alta precisión fabricados en CNC. Más que una herramienta, una forma de contar tu historia.',
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider />
          </Suspense>
          <Header />
          <main className="w-full max-w-full">{children}</main>
          <ConditionalFooter />
          <ConditionalWhatsapp />
          <CookieConsentBanner />
        </CartProvider>
      </body>
    </html>
  );
}

