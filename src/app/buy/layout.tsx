import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
