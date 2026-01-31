import SpecStrip from '@/components/SpecStrip';
import ActionButton from '@/components/ActionButton';
import SectionHeader from '@/components/SectionHeader';
import SizeRecommendationsSection from '@/components/sellos/SizeRecommendationsSection';

export const metadata = {
  title: 'Sellos Personalizados - Alcohn',
  description: 'Diseña tu sello único subiendo tu logo. Sellos de bronce a medida con precisión industrial.',
};

export default function SellosPersonalizadosPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Hero */}
        <div className="mb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-6 tracking-tight">
            Sello personalizado
          </h1>
          <p className="text-base text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Subí tu logo y diseñamos tu sello único. Fabricamos sellos de bronce a medida con precisión CNC, 
            garantizando marcas profundas y duraderas en cuero y madera. Ideal para estampar tu marca personal o empresa.
          </p>
        </div>

        {/* Spec Strip */}
        <SpecStrip />

        {/* Galería de imágenes */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Imagen grande izquierda */}
            <div className="relative aspect-[3/2]">
              <img
                src="/images/sello/sellologo.png"
                alt="Sello personalizado de bronce"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Imágenes derecha - divididas en dos */}
            <div className="grid grid-cols-1 gap-4">
              {/* Imagen superior derecha */}
              <div className="relative aspect-[3/2]">
                <img
                  src="/images/sello/sellologo.png"
                  alt="Detalle de sello personalizado"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Imagen inferior derecha */}
              <div className="relative aspect-[3/2]">
                <img
                  src="/images/sello/selloestandar.png"
                  alt="Aplicación de sello en material"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona - 3 pasos */}
        <section className="mb-20">
          <SectionHeader
            title="Cómo funciona"
            subtitle="Proceso simple en 3 pasos"
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Paso 1 */}
            <div className="border border-neutral-300 bg-white p-8">
              <div className="mb-6">
                <div className="w-12 h-12 border border-neutral-900 flex items-center justify-center mb-4">
                  <span className="text-lg font-semibold text-neutral-900">01</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3 tracking-tight">
                  Subís tu logo
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Subí tu logo en formato PNG, JPG o SVG. Aceptamos logos con fondo transparente o los recortamos por vos.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="border border-neutral-300 bg-white p-8">
              <div className="mb-6">
                <div className="w-12 h-12 border border-neutral-900 flex items-center justify-center mb-4">
                  <span className="text-lg font-semibold text-neutral-900">02</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3 tracking-tight">
                  Elegís medida
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Elegís un tamaño recomendado o especificás tu medida exacta. Fabricamos desde 10×10mm hasta 100×100mm y todas las variantes rectangulares.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="border border-neutral-300 bg-white p-8">
              <div className="mb-6">
                <div className="w-12 h-12 border border-neutral-900 flex items-center justify-center mb-4">
                  <span className="text-lg font-semibold text-neutral-900">03</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3 tracking-tight">
                  Ves muestra digital
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Te enviamos una muestra digital del sello antes de fabricarlo. Aprobás y fabricamos tu sello en 7-10 días hábiles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tamaños recomendados */}
        <SizeRecommendationsSection />

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
                  Desbaste general de 3mm y grabado profundo de 1.7mm.
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
                  7-10 días hábiles desde la aprobación del diseño
                </dd>
              </div>
              <div className="py-6">
                <dt className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">
                  Incluye
                </dt>
                <dd className="text-sm text-neutral-900">
                  <ul className="list-none space-y-1">
                    <li>· Sello de bronce personalizado</li>
                    <li>· Mango ergonómico</li>
                    <li>· Adaptacion para Remachadora</li>
                    <li>· Muestra digital antes de fabricar</li>
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* CTA Fijo */}
        <div className="border-t border-neutral-300 pt-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2 tracking-tight">
                ¿Listo para diseñar tu sello?
              </h3>
              <p className="text-sm text-neutral-600">
                Iniciá el proceso de diseño y recibí tu muestra digital en 24-48 horas.
              </p>
            </div>
            <ActionButton
              href="/buy?mode=custom"
              variant="primary"
              className="flex-shrink-0"
            >
              Iniciar diseño
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}


