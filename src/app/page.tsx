import type { Metadata } from 'next';
import HomeLanding from '@/components/HomeLanding';
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  createPageMetadata,
} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: SITE_DEFAULT_TITLE,
  description: SITE_DEFAULT_DESCRIPTION,
  path: '/',
});

export default function Home() {
  return <HomeLanding market="ar" />;
}
