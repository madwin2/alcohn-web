import Image from 'next/image';
import Link from 'next/link';
import SpecStrip from '@/components/SpecStrip';
import SectionHeader from '@/components/SectionHeader';
import StampSpecifications from '@/components/StampSpecifications';
import PageIntro from '@/components/PageIntro';
import SalesCtaBand from '@/components/SalesCtaBand';
import SizeRecommendationsSection from '@/components/sellos/SizeRecommendationsSection';
import PurchaseInclusions from '@/components/PurchaseInclusions';
import { stampUseCases } from '@/data/stampUseCases';

export const metadata = {
  title: 'Sellos Personalizados - Alcohn',
  description: 'Diseñá tu sello único subiendo tu logo. Sellos de bronce a medida con precisión CNC.',
};

const processCards = [
  {
    code: '01',
    title: 'Subís tu logo',
    copy: 'Aceptamos PNG, JPG o SVG. El flujo guarda tus datos para retomar el pedido si el archivo necesita revisión.',
  },
  {
    code: '02',
    title: 'Elegís uso y medida',
    copy: 'Cuero, madera, packaging, alimentos u otro material. Te mostramos medidas sugeridas para comprar con más seguridad.',
  },
  {
    code: '03',
    title: 'Ves muestra y precio',
    copy: 'Antes de fabricar, el pedido queda claro: logo, medida, material, precio y forma de pago.',
  },
];

export default function SellosPersonalizadosPage() {
  return (
    <div className="atelier-page min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <PageIntro
          label="Sello personalizado"
          title="Tu logo convertido en herramienta de marca"
          description="Para marroquinería, carpintería, ceramica, packaging, gastronomía, lacre y proyectos artesanales. Un sello de bronce te permite marcar tus productos, aportandole un valor agreagado y distincion."
          primaryCta={{
            label: 'Subir logo y ver precio',
            href: '/buy?mode=custom',
          }}
          secondaryCta={{
            label: 'Ver medidas recomendadas',
            href: '#medidas',
            variant: 'secondary',
          }}
          highlights={[
            'Muestra digital antes de fabricar',
            'Pago online seguro con la plataforma de BBVA',
            'Atencion personalizada en todo momento',
          ]}
        />

        <SpecStrip />

        <section className="mb-20">
          <div className="mb-8 grid grid-cols-1 items-end gap-6 lg:grid-cols-[0.62fr_0.38fr]">
            <div>
              <p className="craft-label mb-4">Elegí por intención</p>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-neutral-950">
                El mismo sello, explicado para el material que vas a marcar.
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-neutral-700">
              Si venís por cuero, madera, pan, packaging o hielo, entrá por una guía específica con fotos y
              medidas recomendadas. El diseñador online sigue siendo el mismo.
            </p>
          </div>

          <div className="technical-sheet">
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {stampUseCases.map((useCase, index) => (
                <Link
                  key={useCase.slug}
                  href={`/sellos/${useCase.slug}`}
                  className="group relative min-h-[220px] overflow-hidden border-b border-r border-[var(--alcohn-line)] p-5 text-white"
                >
                  <Image
                    src={useCase.heroImage}
                    alt={useCase.heroAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,16,14,0.12)_0%,rgba(17,16,14,0.58)_62%,rgba(17,16,14,0.86)_100%)]" />
                  <div className="relative flex h-full min-h-[180px] flex-col justify-between">
                    <p className="text-[10px] font-semibold uppercase text-white/62">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <div>
                      <h3 className="text-2xl font-semibold leading-tight tracking-tight">{useCase.oficio}</h3>
                      <p className="mt-2 text-xs font-semibold uppercase text-white/72">{useCase.material}</p>
                      <p className="mt-5 text-xs font-semibold uppercase text-white/80">Ver fotos y medidas</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-20 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4">
          <div className="material-frame relative aspect-[4/3] overflow-hidden">
            <Image
              src="/images/sello/sellologo.png"
              alt="Sello personalizado de bronce"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 58vw"
              priority
            />
            <div className="absolute left-4 top-4 border border-white/20 bg-black/70 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase text-white">Logo a bronce</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="technical-sheet p-6 md:p-8 flex flex-col justify-between">
              <div className="relative z-10">
                <p className="craft-label mb-5">Control antes de fabricar</p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-950">
                  Sello de Bronce Personalizado
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                  El usuario no sólo consulta: deja datos, ve el camino, entiende el precio y puede pagar. Si el logo falla, Alcohn queda con contexto para recuperar la venta.
                </p>
              </div>
            </div>

            <div className="material-frame relative aspect-[4/3] overflow-hidden">
              <Image
                src="/images/sello/selloestandar.png"
                alt="Aplicación de sello en material"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>
        </section>

        <StampSpecifications />

        <div id="medidas" className="mb-20">
          <SizeRecommendationsSection />
        </div>

        <PurchaseInclusions className="mb-20" showKitIllustration />

        <section className="mb-20">
          <SectionHeader
            title="Cómo funciona"
            subtitle="Un flujo simple para comprar, no para abrir una conversación nueva."
            align="left"
          />

          <div className="technical-sheet">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3">
              {processCards.map((step) => (
                <article key={step.code} className="border-b md:border-b-0 md:border-r last:border-r-0 border-[var(--alcohn-line)] p-6 md:p-8">
                  <div className="mb-8 flex h-11 w-11 items-center justify-center border border-[var(--alcohn-line-strong)] bg-white text-sm font-semibold">
                    {step.code}
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                    {step.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SalesCtaBand
          title="Diseñá el sello con tu logo y avanzá con precio real"
          copy="El recorrido guarda la información clave para que puedas comprar online y para que Alcohn pueda recuperar el pedido si el mockup necesita revisión."
          primaryLabel="Subir logo y ver precio"
          primaryHref="/buy?mode=custom"
          secondaryLabel="Ver proceso completo"
          secondaryHref="/proceso"
          dark
        />
      </div>
    </div>
  );
}
