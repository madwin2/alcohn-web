import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsappButton from '@/components/WhatsappButton';
import { CartProvider } from '@/contexts/CartContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Alcohn - Sellos de bronce personalizados | Hecho en Argentina con CNC',
  description: 'Sellos de bronce de alta precisión fabricados en CNC. Más que una herramienta, una forma de contar tu historia. Para cuero, madera, alimentos. Hecho en Mar del Plata, Argentina.',
  keywords: 'sello de bronce, sello de bronce personalizado, sello para cuero, sello para madera, sello para marroquinería, sello con logo, sello para alimentos, hecho en Argentina, precisión CNC, profesionalización del oficio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <CartProvider>
          <Header />
          <main className="overflow-x-hidden w-full max-w-full">{children}</main>
          <Footer />
          <WhatsappButton className="fixed bottom-4 right-4 z-50 h-11 w-11 px-0 md:w-auto md:px-5">
            <span className="md:hidden">WA</span>
            <span className="hidden md:inline">WhatsApp</span>
          </WhatsappButton>
        </CartProvider>
      </body>
    </html>
  );
}

