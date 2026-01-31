import SectionHeader from '@/components/SectionHeader';
import ActionButton from '@/components/ActionButton';
import SpecStrip from '@/components/SpecStrip';
import { abecedarios } from '@/lib/catalog';

export const metadata = {
  title: 'Abecedarios - Alcohn',
  description: 'Conjunto completo de letras y números individuales de bronce para marcar textos personalizados.',
};

export default function AbecedariosPage() {
  const mainAbecedario = abecedarios[0]; // Abecedario completo
  const priceDisplay =
    typeof mainAbecedario.price === 'number'
      ? `$${mainAbecedario.price.toLocaleString('es-AR')}`
      : `$${mainAbecedario.price.desde.toLocaleString('es-AR')}`;

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Hero */}
        <div className="mb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-6 tracking-tight">
            Abecedarios
          </h1>
          <p className="text-base text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Conjunto completo de letras y números individuales de bronce para marcar textos personalizados. 
            Cada letra es un sello independiente, permitiendo máxima flexibilidad en la composición.
          </p>
        </div>

        {/* Spec Strip */}
        <SpecStrip />

        {/* Imagen de portada */}
        <section className="mb-20">
          <div className="w-full">
            <img
              src="/images/abecedario/abecedario.png"
              alt="Abecedario de bronce con letras y números"
              className="w-full h-auto object-cover"
            />
          </div>
        </section>

        {/* Descripción principal */}
        <section className="mb-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6 tracking-tight">
              ¿Qué es un abecedario?
            </h2>
            <div className="space-y-4 text-base text-neutral-700 leading-relaxed">
              <p>
                Un abecedario de bronce es un conjunto de sellos individuales, uno por cada letra del alfabeto y número. 
                A diferencia de un sello fijo con un texto grabado, el abecedario te permite componer cualquier texto 
                combinando las letras y números según necesites.
              </p>
              <p>
                Ideal para marcar productos con nombres, fechas, códigos o textos que cambian frecuentemente. 
                Cada letra está fabricada con la misma precisión CNC que nuestros sellos personalizados, 
                garantizando marcas consistentes y duraderas.
              </p>
            </div>
          </div>
        </section>

        {/* Qué incluye */}
        <section className="mb-20 border-t border-neutral-300 pt-16">
          <SectionHeader
            title="Qué incluye"
            align="left"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Abecedario completo */}
            <div className="border border-neutral-300 bg-white p-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4 tracking-tight">
                {mainAbecedario.title}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                {mainAbecedario.description}
              </p>
              
              <div className="mb-6">
                <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-3">
                  INCLUYE
                </div>
                <ul className="space-y-2">
                  {mainAbecedario.includes.map((item, index) => (
                    <li key={index} className="text-sm text-neutral-700 flex items-start">
                      <span className="mr-2 text-neutral-400">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-neutral-200">
                <p className="text-lg text-neutral-900 mb-4">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-2">
                    Desde
                  </span>
                  {priceDisplay}
                </p>
                <ActionButton
                  href={`/buy?mode=abecedario&product=${mainAbecedario.slug}`}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  Comprar / Cotizar
                </ActionButton>
              </div>
            </div>

            {/* Abecedario números */}
            {abecedarios[1] && (
              <div className="border border-neutral-300 bg-white p-8">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4 tracking-tight">
                  {abecedarios[1].title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                  {abecedarios[1].description}
                </p>
                
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-3">
                    INCLUYE
                  </div>
                  <ul className="space-y-2">
                    {abecedarios[1].includes.map((item, index) => (
                      <li key={index} className="text-sm text-neutral-700 flex items-start">
                        <span className="mr-2 text-neutral-400">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-neutral-200">
                  <p className="text-lg text-neutral-900 mb-4">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-2">
                      Desde
                    </span>
                    {typeof abecedarios[1].price === 'number'
                      ? `$${abecedarios[1].price.toLocaleString('es-AR')}`
                      : `$${abecedarios[1].price.desde.toLocaleString('es-AR')}`}
                  </p>
                  <ActionButton
                    href={`/buy?mode=abecedario&product=${abecedarios[1].slug}`}
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Comprar / Cotizar
                  </ActionButton>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Especificaciones */}
        <section className="mb-20 border-t border-neutral-300 pt-16">
          <SectionHeader
            title="Especificaciones"
            align="left"
          />

          <div className="max-w-3xl">
            <dl className="divide-y divide-neutral-200">
              <div className="py-6">
                <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                  Material
                </dt>
                <dd className="text-sm text-neutral-900">
                  Bronce de alta calidad, mecanizado con precisión CNC
                </dd>
              </div>
              <div className="py-6">
                <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                  Profundidad
                </dt>
                <dd className="text-sm text-neutral-900">
                  1.5mm - 2mm para marcas consistentes
                </dd>
              </div>
              <div className="py-6">
                <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                  Uso
                </dt>
                <dd className="text-sm text-neutral-900">
                  Cuero genuino y sintético, maderas duras y blandas, ceramica en crudo, lacre, alimentos, hielo.
                </dd>
              </div>
              <div className="py-6">
                <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                  Tiempo de producción
                </dt>
                <dd className="text-sm text-neutral-900">
                  10-14 días hábiles para abecedario completo, 7-10 días para números
                </dd>
              </div>
              <div className="py-6">
                <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                  Organización
                </dt>
                <dd className="text-sm text-neutral-900">
                  Incluye caja organizadora con separadores para fácil acceso a cada letra
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* CTA Final */}
        <div className="border-t border-neutral-300 pt-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2 tracking-tight">
                ¿Listo para marcar textos personalizados?
              </h3>
              <p className="text-sm text-neutral-600">
                Elegí tu abecedario y comenzá a marcar productos con textos únicos.
              </p>
            </div>
            <ActionButton
              href={`/buy?mode=abecedario&product=${mainAbecedario.slug}`}
              variant="primary"
              className="flex-shrink-0"
            >
              Comprar / Cotizar
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

