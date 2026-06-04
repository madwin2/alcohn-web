import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Checkout | Comprar sello de bronce | Alcohn',
  description: 'Finalizá tu compra de sellos de bronce personalizados o estándar.',
  path: '/checkout',
  robots: { index: false, follow: false },
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
