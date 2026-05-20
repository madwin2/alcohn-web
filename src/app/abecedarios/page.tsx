import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';
import ActionButton from '@/components/ActionButton';
import SpecStrip from '@/components/SpecStrip';
import PageIntro from '@/components/PageIntro';
import SalesCtaBand from '@/components/SalesCtaBand';
import { abecedarios } from '@/lib/catalog';

export const metadata = {
  title: 'Abecedarios - Alcohn',
  description: 'Conjunto completo de letras y números individuales de bronce para marcar textos personalizados.',
};

export default function AbecedariosPage() {
  const mainAbecedario = abecedarios[0];
  const priceDisplay =
    typeof mainAbecedario.price === 'number'
      ? `$${mainAbecedario.price.toLocaleString('es-AR')}`
      : `$${mainAbecedario.price.desde.toLocaleString('es-AR')}`;

  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Letras y números"
          title="Abecedarios de bronce para marcar textos variables"
          description="Una herramienta modular para talleres que necesitan nombres, fechas, códigos, iniciales o series. Cada letra funciona como sello independiente y mantiene la precisión CNC de Alcohn."
          primaryCta={{
            label: 'Comprar abecedario',
            href: `/buy?mode=abecedario&product=${mainAbecedario.slug}`,
          }}
          secondaryCta={{
            label: 'Ver sellos personalizados',
            href: '/sellos/personalizados',
            variant: 'secondary',
          }}
          highlights={[
            'Textos que cambian sin fabricar un sello nuevo',
            'Ideal para series, fechas y nombres',
            'Caja organizadora y guía de uso',
          ]}
        />

        <SpecStrip />

        <section className="mb-20">
          <div className="material-frame relative aspect-[16/7] overflow-hidden">
            <Image
              src="/images/abecedario/abecedario.png"
              alt="Abecedario de bronce con letras y números"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        </section>

        <section className="mb-20 technical-sheet">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.36fr_0.64fr]">
            <div className="border-b lg:border-b-0 lg:border-r border-[var(--alcohn-line)] p-6 md:p-8">
              <p className="craft-label mb-4">Qué es</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-950">
                Un sistema de marcado flexible
              </h2>
            </div>
            <div className="p-6 md:p-8 space-y-4 text-sm md:text-base leading-relaxed text-neutral-700">
              <p>
                A diferencia de un sello fijo con un texto grabado, el abecedario te permite componer cualquier texto combinando letras y números según necesites.
              </p>
              <p>
                Es útil para productos con nombres, fechas, códigos o textos que cambian frecuentemente, manteniendo una marca consistente en cuero, madera y packaging.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20 border-t border-[var(--alcohn-line)] pt-16">
          <SectionHeader title="Qué incluye" align="left" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {abecedarios.slice(0, 2).map((abecedario, index) => {
              const price =
                typeof abecedario.price === 'number'
                  ? `$${abecedario.price.toLocaleString('es-AR')}`
                  : `$${abecedario.price.desde.toLocaleString('es-AR')}`;

              return (
                <article key={abecedario.slug} className="material-card p-6 md:p-8">
                  <p className="craft-label mb-4">{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-4 tracking-tight">
                    {abecedario.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                    {abecedario.description}
                  </p>

                  <div className="mb-6 border-t border-[var(--alcohn-line)] pt-6">
                    <div className="craft-label mb-3">Incluye</div>
                    <ul className="space-y-2">
                      {abecedario.includes.map((item) => (
                        <li key={item} className="flex items-start text-sm text-neutral-700">
                          <span className="mr-2 text-[var(--alcohn-bronze)]">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-[var(--alcohn-line)]">
                    <p className="text-lg text-neutral-900 mb-4">
                      <span className="craft-label mr-2">Desde</span>
                      {price}
                    </p>
                    <ActionButton
                      href={`/buy?mode=abecedario&product=${abecedario.slug}`}
                      variant={index === 0 ? 'primary' : 'secondary'}
                      className="w-full sm:w-auto"
                    >
                      Comprar {index === 0 ? 'abecedario' : 'números'}
                    </ActionButton>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mb-20 border-t border-[var(--alcohn-line)] pt-16">
          <SectionHeader title="Especificaciones" align="left" />
          <div className="technical-sheet">
            <dl className="relative z-10 divide-y divide-[var(--alcohn-line)]">
              {[
                ['Material', 'Bronce de alta calidad, mecanizado con precisión CNC'],
                ['Profundidad', '1.5mm - 2mm para marcas consistentes'],
                ['Uso', 'Cuero, madera, cerámica en crudo, lacre, alimentos, hielo y packaging'],
                ['Producción', '10-14 días hábiles para abecedario completo, 7-10 días para números'],
                ['Organización', 'Caja organizadora con separadores para acceso rápido a cada letra'],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-1 md:grid-cols-[0.28fr_0.72fr]">
                  <dt className="craft-label border-b md:border-b-0 md:border-r border-[var(--alcohn-line)] p-5 md:p-6">
                    {label}
                  </dt>
                  <dd className="p-5 md:p-6 text-sm leading-relaxed text-neutral-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <SalesCtaBand
          title="Comprá un sistema de letras si tu marca necesita textos variables"
          copy="Si en cambio querés marcar siempre el mismo logo, el sello personalizado te va a dar mejor presencia y velocidad de uso."
          primaryLabel="Comprar abecedario"
          primaryHref={`/buy?mode=abecedario&product=${mainAbecedario.slug}`}
          secondaryLabel="Diseñar sello con logo"
          secondaryHref="/buy?mode=custom"
          dark
        />
      </div>
    </div>
  );
}
