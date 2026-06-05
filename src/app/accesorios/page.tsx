import type { Metadata } from 'next';
import AccessoryCard from '@/components/AccessoryCard';
import PageIntro from '@/components/PageIntro';
import SalesCtaBand from '@/components/SalesCtaBand';
import { accessories } from '@/data/accessories';
import { getAccessoryMinPriceFrom } from '@/lib/pricing';
import { buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Accesorios para sellos de bronce | Calentador, mango y base | Alcohn',
  description:
    'Calentador eléctrico, mango de golpe y base de aluminio para remachadora. Complementos para marcar cuero y madera con sellos de bronce.',
  path: '/accesorios',
});

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Accesorios', path: '/accesorios' },
]);

const minPrice = getAccessoryMinPriceFrom();

export default function AccesoriosPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Complementos de taller"
          title="Accesorios para marcar con sellos de bronce"
          description="Herramientas que complementan tu sello: calentar en forma segura, martillar en frío o montar en remachadora. Precios visibles y compra directa."
          primaryCta={{
            label: 'Ver accesorios',
            href: '#catalogo-accesorios',
          }}
          secondaryCta={{
            label: 'Ver sellos',
            href: '/productos',
            variant: 'secondary',
          }}
          priceFrom={minPrice}
          highlights={[
            'Calentador eléctrico para uso frecuente',
            'Mango de golpe para marcado en frío',
            'Base de aluminio para remachadora',
          ]}
        />

        <section id="catalogo-accesorios" className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {accessories.map((accessory) => (
            <AccessoryCard key={accessory.slug} accessory={accessory} />
          ))}
        </section>

        <div className="mt-20">
          <SalesCtaBand
            title="¿Necesitás un sello para usar con estos accesorios?"
            copy="Diseñá tu sello con logo o elegí un diseño estándar listo para comprar."
            primaryLabel="Subir logo y ver precio"
            primaryHref="/buy?mode=custom"
            secondaryLabel="Ver sellos estándar"
            secondaryHref="/sellos/estandar"
          />
        </div>
      </div>
    </div>
  );
}
