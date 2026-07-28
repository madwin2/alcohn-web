import PageIntro from '@/components/PageIntro';
import FaqList from '@/components/FaqList';
import SalesCtaBand from '@/components/SalesCtaBand';
import { faqs } from '@/data/faq';
import {
  marketBreadcrumbJsonLd,
  marketBuyCta,
  marketStandardSecondaryCta,
} from '@/lib/markets/infoPages';
import { marketBuyPath, marketPath } from '@/lib/markets/paths';
import type { MarketCode } from '@/lib/markets/types';
import { buildFaqJsonLd } from '@/lib/seo';

type FaqPageContentProps = {
  market: MarketCode;
};

export default function FaqPageContent({ market }: FaqPageContentProps) {
  const faqJsonLd = buildFaqJsonLd(faqs);
  const breadcrumbJsonLd = marketBreadcrumbJsonLd(market, [
    { name: 'Inicio', path: '/' },
    { name: 'Preguntas frecuentes', path: '/faq' },
  ]);
  const secondaryCta = marketStandardSecondaryCta(market);

  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <PageIntro
          label="FAQ de compra"
          title="Respuestas a preguntas comunes"
          description="Reunimos las dudas que suelen repetirse comunmente. Para que tengas toda la informacion de la manera mas rapida y simple posible."
          mobileDescription="Respuestas rápidas sobre materiales, medidas, tiempos y compra."
          primaryCta={marketBuyCta(market, 'Diseñar mi sello')}
          secondaryCta={secondaryCta}
        />

        <section className="mb-20">
          <FaqList faqs={faqs} />
        </section>

        <SalesCtaBand
          title="Cuando ya entendés el producto, el mejor paso es probar tu logo"
          copy="El diseñador online te guía por uso, medida, muestra y precio. Si algo necesita revisión, queda registrado para que Alcohn pueda seguirlo."
          primaryLabel="Diseñar mi sello"
          primaryHref={marketBuyPath(market)}
          secondaryLabel="Ver proceso"
          secondaryHref={marketPath(market, '/proceso')}
          dark
        />
      </div>
    </div>
  );
}
