import SpecStrip from '@/components/SpecStrip';
import IntentCard from '@/components/IntentCard';
import ActionButton from '@/components/ActionButton';
import Image from 'next/image';

export const metadata = {
  title: 'Productos - Alcohn',
  description: 'Sellos de bronce y abecedarios. Precisión industrial para cuero, madera, ceramica y alimentos.',
};

export default function ProductosPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header editorial */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-4 tracking-tight">
            Productos
          </h1>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto uppercase tracking-wider">
            Sellos de bronce y abecedarios. Precisión industrial para cuero, madera, ceramica y alimentos.
          </p>
        </div>

        {/* Spec Strip - Compacta */}
        <SpecStrip />

        {/* Bloque principal: "Elegí cómo querés marcar" */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
              ELEGÍ CÓMO QUERÉS MARCAR
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <IntentCard
              title="Sellos personalizados"
              description="Subí tu logo y diseñamos tu sello único. Ideal para marcar tu marca personal o empresa con un diseño completamente a medida."
              href="/sellos/personalizados"
              variant="primary"
              image="/images/sello/sellologo.png"
              imageAlt="Sello personalizado de bronce"
            />
            <IntentCard
              title="Sellos estándar"
              description="Diseños listos para usar. Argentina, fútbol, cuero, madera y más. Elige un diseño y personalizamos la medida."
              href="/sellos/estandar"
              variant="secondary"
              image="/images/sello/selloestandar.png"
              imageAlt="Sellos estándar de bronce"
            />
          </div>
        </div>

        {/* Bloque secundario: Abecedarios */}
        <div className="border-t border-neutral-300 pt-16">
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
              ABECEDARIOS
            </h2>
          </div>
          
          <div className="border border-neutral-300 bg-white flex flex-col">
            {/* Image Preview */}
            <div className="aspect-[8/3] bg-neutral-50 relative overflow-hidden border-b border-neutral-300">
              <Image
                src="/images/abecedario/abecedario.png"
                alt="Abecedario de bronce con letras y números"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 100vw"
              />
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 flex flex-col flex-1">
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-4 tracking-tight">
                  Abecedarios
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
                  Conjunto completo de letras y números individuales de bronce para marcar textos personalizados. 
                  Cada letra es un sello independiente, permitiendo máxima flexibilidad en la composición.
                </p>
              </div>
              
              <div className="mt-auto pt-6 border-t border-neutral-200">
                <ActionButton
                  href="/abecedarios"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Ver abecedarios
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
