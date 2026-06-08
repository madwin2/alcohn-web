import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import ConditionalFooter from '@/components/ConditionalFooter';
import ConditionalWhatsapp from '@/components/ConditionalWhatsapp';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import GoogleTagManager from '@/components/GoogleTagManager';
import MetaPixel from '@/components/MetaPixel';
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

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim();
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

const META_PIXEL_BASE_SCRIPT = META_PIXEL_ID
  ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');(function(){var i=new Image(1,1);i.src='https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&dl='+encodeURIComponent(location.href)+'&rl='+encodeURIComponent(document.referrer||'')+'&noscript=1';})();`
  : null;

const GTM_CONSENT_DEFAULTS_SCRIPT = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('consent','default',{
  'analytics_storage':'denied',
  'ad_storage':'denied',
  'ad_user_data':'denied',
  'ad_personalization':'denied',
  'wait_for_update':2000
});
`;

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
      <head>
        {GTM_ID ? (
          <script dangerouslySetInnerHTML={{ __html: GTM_CONSENT_DEFAULTS_SCRIPT }} />
        ) : null}
        {META_PIXEL_BASE_SCRIPT ? (
          <>
            <script dangerouslySetInnerHTML={{ __html: META_PIXEL_BASE_SCRIPT }} />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        ) : null}
      </head>
      <body className={inter.className}>
        {GTM_ID ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <GoogleTagManager />
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
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

