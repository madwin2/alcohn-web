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
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_NAME,
  buildGlobalSchemaGraph,
  SITE_URL,
} from '@/lib/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_DEFAULT_TITLE,
  description: SITE_DEFAULT_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
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
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildGlobalSchemaGraph()) }}
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

