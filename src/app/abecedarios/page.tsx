import type { Metadata } from 'next';
import Image from 'next/image';
import ActionButton from '@/components/ActionButton';
import SpecChips from '@/components/SpecChips';
import SpecStrip from '@/components/SpecStrip';
import PageIntro from '@/components/PageIntro';
import SalesCtaBand from '@/components/SalesCtaBand';
import PurchaseInclusions from '@/components/PurchaseInclusions';
import AbecedarioConfigurator from '@/components/abecedarios/AbecedarioConfigurator';
import AbecedarioSpecificationsCard from '@/components/abecedarios/AbecedarioSpecificationsCard';
import VideoShowcasePanel from '@/components/abecedarios/VideoShowcasePanel';
import {
  ABECEDARIO_COMPLETO_PRECIO_DESDE,
  ABECEDARIO_PRECIOS_DESDE,
  formatArs,
} from '@/lib/abecedarioConfigurator';
import { buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Abecedarios de bronce personalizados | Letras y números CNC | Alcohn',
  description:
    'Letras y números de bronce individuales para marcar textos en cuero y madera. Fabricación CNC, envío a todo Argentina.',
  path: '/abecedarios',
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Abecedarios', path: '/abecedarios' },
]);

export default function AbecedariosPage() {
  return (
    <div className="atelier-page min-h-screen py-6 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Letras y números. Textos variables."
          title="Abecedario de bronce para marcar textos variables"
          description="Una herramienta modular para talleres que necesitan nombres, fechas, códigos, iniciales o series. Cada letra funciona como sello independiente y mantiene la precisión CNC de Alcohn."
          titleOnlyOnMobile
          primaryCta={{
            label: 'Comprar abecedario',
            href: '#configurador',
          }}
        />

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
                  El Abecedario es un <strong className="font-semibold text-neutral-950">sistema de letras intercambiables</strong> diseñado para marcar textos personalizados con calor o presión. Incluye caracteres de bronce, junto con un soporte que permite armar palabras, iniciales o frases cortas.
                </p>
                <p>
                  Ideal para personalizar tus productos con una{' '}
                  <strong className="font-semibold text-neutral-950">terminación duradera, prolija y profesional</strong>.
                </p>
              </div>

              <AbecedarioSpecificationsCard />

              {/* Imagen compacta en mobile; en desktop acompaña la columna de texto. */}
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
                posterAlt="Abecedario de bronce en uso: letras armadas sobre soporte"
                className="aspect-video w-full lg:aspect-[3/4] lg:max-h-[540px]"
              />
              {/* videoSrc pendiente: pasar el .mp4 vertical cuando esté disponible para reemplazar la foto de fondo */}

              <div className="border-y border-[var(--alcohn-line)] py-4 text-[13px] leading-relaxed text-neutral-700 md:hidden">
                <p>
                  El Abecedario es un{' '}
                  <strong className="font-semibold text-neutral-950">sistema de letras intercambiables</strong>{' '}
                  diseñado para marcar textos personalizados con calor o presión. Ideal para una{' '}
                  <strong className="font-semibold text-neutral-950">
                    terminación duradera, prolija y profesional
                  </strong>
                  .
                </p>
              </div>

              <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pt-4">
                <div>
                  <p className="craft-label mb-1">Desde</p>
                  <p className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
                    {formatArs(Math.min(ABECEDARIO_COMPLETO_PRECIO_DESDE, ABECEDARIO_PRECIOS_DESDE.numero))}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Completo, personalizado por piezas o solo números.
                  </p>
                </div>
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
          title="Comprá un sistema de letras si tu marca necesita textos variables"
          copy="Si en cambio querés marcar siempre el mismo logo, el sello personalizado te va a dar mejor presencia y velocidad de uso."
          primaryLabel="Comprar abecedario"
          primaryHref="#configurador"
          secondaryLabel="Diseñar sello con logo"
          secondaryHref="/buy?mode=custom"
          dark
        />
      </div>
    </div>
  );
}
