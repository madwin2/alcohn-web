import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Alcohn',
    short_name: 'Alcohn',
    description:
      'Sellos de bronce personalizados para cuero, madera, alimentos y packaging.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f0e8',
    theme_color: '#1b1a18',
    lang: 'es-AR',
    icons: [
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        type: 'image/png',
        sizes: '180x180',
      },
    ],
  };
}
