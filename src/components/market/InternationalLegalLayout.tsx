import Link from 'next/link';
import { getMarketConfig } from '@/lib/markets/config';
import { marketPath } from '@/lib/markets/paths';
import type { InternationalMarketCode } from '@/lib/markets/types';
import type { LegalSection } from '@/lib/markets/legal';

type InternationalLegalLayoutProps = {
  market: InternationalMarketCode;
  title: string;
  intro: string;
  sections: LegalSection[];
};

export default function InternationalLegalLayout({
  market,
  title,
  intro,
  sections,
}: InternationalLegalLayoutProps) {
  const country = getMarketConfig(market).countryName;

  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <p className="craft-label mb-3">Información legal · {country}</p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          {title}
        </h1>
        <p className="mb-10 text-base leading-relaxed text-gray-700 md:text-lg">{intro}</p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-xl font-semibold tracking-tight text-gray-900">
                {section.title}
              </h2>
              <div className="space-y-3 text-base leading-relaxed text-gray-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-neutral-200 pt-8 text-sm text-gray-600">
          <Link
            href={marketPath(market, '/')}
            className="font-medium text-gray-900 underline-offset-2 hover:underline"
          >
            Volver al inicio
          </Link>
          {' · '}
          <Link
            href={marketPath(market, '/politica-envios')}
            className="font-medium text-gray-900 underline-offset-2 hover:underline"
          >
            Envíos
          </Link>
          {' · '}
          <Link href={marketPath(market, '/contacto')} className="font-medium text-gray-900 underline-offset-2 hover:underline">
            Contacto
          </Link>
        </p>
      </div>
    </div>
  );
}
