import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Carrito | Alcohn',
  description: 'Revisá tu pedido de sellos de bronce antes de finalizar la compra.',
  path: '/carrito',
  robots: { index: false, follow: false },
});

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
