import Link from 'next/link';
import SectionTitle from '@/components/SectionTitle';
import Timeline from '@/components/Timeline';
import { processSteps } from '@/data/process';

export const metadata = {
  title: 'Cómo funciona - Alcohn',
  description: 'Proceso simple y transparente para obtener tu sello de bronce personalizado. Desde el envío de tu logo hasta la entrega final.',
};

export default function ProcesoPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Cómo funciona"
          subtitle="Desde tu logo hasta tu sello en la mano. Un proceso pensado para que sea simple, claro y humano."
        />

        <Timeline steps={processSteps} />

        {/* Info técnica */}
        <section className="py-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Lo que necesitás saber</h2>
          <div className="space-y-6 text-gray-700">
            <div className="bg-secondary rounded-lg p-6">
              <p className="leading-relaxed">
                <strong className="text-gray-900">Un mismo sello sirve para varios materiales.</strong> Podés usar el mismo
                sello para marcar cuero, madera y otros materiales según tus necesidades. La versatilidad es parte del diseño.
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-6">
              <p className="leading-relaxed">
                <strong className="text-gray-900">Se puede calentar a fuego:</strong> hornalla o soplete. También se puede usar
                en frío con prensa o remachadora. Te asesoramos sobre el mejor método según tu material.
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-6">
              <p className="leading-relaxed">
                <strong className="text-gray-900">Tiempo estimado:</strong> 10 días hábiles de producción + envío. 
                Trabajamos con tiempos realistas y te mantenemos informado en cada paso.
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-6">
              <p className="leading-relaxed">
                <strong className="text-gray-900">Envíos a todo el país</strong> por Correo Argentino a sucursal o domicilio. 
                Llegamos a donde estés.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">¿Listo para empezar?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Tu historia merece un sello que la represente. Empezá ahora.
          </p>
          <Link
            href="/buy?mode=custom"
            className="inline-block bg-accent text-primary px-8 py-4 rounded-md font-semibold hover:bg-accent-light transition-colors"
          >
            Cotizar ahora
          </Link>
        </section>
      </div>
    </div>
  );
}

