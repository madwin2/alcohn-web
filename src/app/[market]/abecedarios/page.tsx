import type { Metadata } from 'next';
import ActionButton from '@/components/ActionButton';
import AbecedarioConfigurator from '@/components/abecedarios/AbecedarioConfigurator';
import AbecedarioSpecificationsCard from '@/components/abecedarios/AbecedarioSpecificationsCard';
import VideoShowcasePanel from '@/components/abecedarios/VideoShowcasePanel';
import ImportDutiesNotice from '@/components/market/ImportDutiesNotice';
import PageIntro from '@/components/PageIntro';
import PriceFrom from '@/components/PriceFrom';
import PurchaseInclusions from '@/components/PurchaseInclusions';
import SalesCtaBand from '@/components/SalesCtaBand';
import SpecChips from '@/components/SpecChips';
import SpecStrip from '@/components/SpecStrip';
import Image from 'next/image';
import { getMarketConfig } from '@/lib/markets/config';
import { marketPath } from '@/lib/markets/paths';
import { requireInternationalMarket } from '@/lib/markets/params';
import { marketSeoDescription, marketSeoTitle } from '@/lib/markets/seo';
import type { InternationalMarketCode } from '@/lib/markets/types';
import { getAbecedarioMinPrice } from '@/lib/pricing';
import { buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

type PageParams = {
  params: { market: string };
};

const ABECEDARIOS_TITLE = 'Abecedarios de bronce personalizados | Letras y números CNC | Alcohn';
const ABECEDARIOS_DESCRIPTION =
  'Letras y números de bronce individuales para marcar textos en cuero y madera. Fabricación CNC en Argentina.';

export function generateMetadata({ params }: PageParams): Metadata {
  const market = requireInternationalMarket(params.market);

  return createPageMetadata({
    title: marketSeoTitle(ABECEDARIOS_TITLE, market),
    description: marketSeoDescription(ABECEDARIOS_DESCRIPTION, market),
    path: '/abecedarios',
    market,
  });
}

export default function InternationalAbecedariosPage({ params }: PageParams) {
  const market = requireInternationalMarket(params.market) as InternationalMarketCode;
  const country = getMarketConfig(market).countryName;
  const priceFrom = getAbecedarioMinPrice();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Inicio', path: marketPath(market, '/') },
    { name: 'Abecedarios', path: marketPath(market, '/abecedarios') },
  ]);

  return (
    <div className="atelier-page min-h-screen py-6 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <PageIntro
          label={`Letras y números · ${country}`}
          title="Abecedario de bronce para marcar textos variables"
          description="Herramienta modular para talleres que necesitan nombres, fechas, códigos o iniciales. Fabricado en Argentina y enviado por DHL."
          titleOnlyOnMobile
          primaryCta={{
            label: 'Configurar abecedario',
            href: '#configurador',
          }}
        />

        <div className="mb-8">
          <ImportDutiesNotice market={market} />
        </div>

        <SpecStrip className="hidden md:block" />

        <section className="mb-10 md:mb-16">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            <div className="order-2 flex flex-col gap-4 lg:order-1">
              <SpecChips
                specs={[
                  { label: 'Colección', value: 'Abecedarios' },
                  { label: 'Material', value: 'Bronce' },
                  { label: 'Proceso', value: 'CNC' },
                ]}
              />

              <div className="hidden space-y-3 text-sm leading-relaxed text-neutral-700 md:block">
                <p>
                  El Abecedario es un{' '}
                  <strong className="font-semibold text-neutral-950">
                    sistema de letras intercambiables
                  </strong>{' '}
                  diseñado para marcar textos personalizados con calor o presión.
                </p>
              </div>

              <AbecedarioSpecificationsCard />

              <div className="material-frame relative aspect-[5/3] min-h-0 overflow-hidden lg:aspect-auto lg:min-h-[220px] lg:flex-1">
                <Image
                  src="/images/abecedario/abecedario.webp"
                  alt="Abecedario de bronce completo con letras y números"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

            <div className="order-1 flex flex-col gap-4 lg:order-2">
              <VideoShowcasePanel
                posterSrc="/images/abecedario/abecedario.webp"
                posterAlt="Abecedario de bronce en uso"
                className="aspect-video w-full lg:aspect-[3/4] lg:max-h-[540px]"
              />

              <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-[var(--alcohn-line)] pt-4">
                <PriceFrom amount={priceFrom} size="lg" />
                <ActionButton href="#configurador" variant="primary">
                  Elegir mi abecedario
                </ActionButton>
              </div>
            </div>
          </div>
        </section>

        <AbecedarioConfigurator />

        <div className="mb-10 md:mb-20">
          <PurchaseInclusions variant="abecedario" title="Qué incluye tu compra" />
        </div>

        <SalesCtaBand
          title="Comprá un sistema de letras con envío DHL"
          copy="Configurá tu abecedario, agregalo al carrito y completá el checkout internacional."
          primaryLabel="Ir al configurador"
          primaryHref="#configurador"
          secondaryLabel="Ver catálogo"
          secondaryHref={marketPath(market, '/productos')}
          dark
        />
      </div>
    </div>
  );
}
