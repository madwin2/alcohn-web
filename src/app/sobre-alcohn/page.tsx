import Link from 'next/link';
import SectionTitle from '@/components/SectionTitle';

export const metadata = {
  title: 'Sobre Alcohn - Sellos de bronce fabricados en CNC',
  description: 'Empresa de Mar del Plata con más de 4 años de experiencia fabricando sellos de bronce de alta precisión con CNC propia.',
};

export default function SobreAlcohnPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Sobre Alcohn"
          subtitle="Diseño industrial y fabricación de precisión"
        />

        <div className="max-w-3xl mx-auto space-y-8">
          <section className="prose prose-lg">
            <p className="text-lg text-gray-700 leading-relaxed">
              Alcohn nació en <strong>Mar del Plata, en 2019</strong>, como un taller de diseño industrial con una misión clara: unir la precisión de la tecnología CNC con el alma artesanal de los oficios tradicionales.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              <em>"Un sello no es un pedazo de bronce. Es una historia grabada."</em>
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              En nuestros comienzos, atendíamos pedidos de marroquineros y carpinteros locales. Con el tiempo, nuestra reputación creció gracias a la calidad de los grabados y la atención personalizada. Hoy, somos un referente nacional en sellos de bronce, trabajando para emprendedores, talleres, PYMES y grandes marcas.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Cada sello está diseñado integralmente en CNC, en ambas caras. Se lijan, pulen y terminan a mano para lograr brillo y suavidad. La parte trasera lleva la marca Alcohn y puede incluir una firma o frase. Los mangos son diseños exclusivos, no piezas estándar del mercado.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong>Cada sello de Alcohn debe sentirse como una pieza de joyería industrial.</strong>
            </p>
          </section>

          <section className="bg-secondary rounded-lg p-8 border-l-4 border-accent">
            <blockquote className="text-xl font-semibold italic text-center text-gray-800">
              "Detrás de cada sello hay una persona con sueños, esfuerzo y esperanza. Nos obsesiona el detalle, porque sabemos que después ese sello va a ir sobre el producto final de otro emprendedor."
            </blockquote>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Nuestros valores</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <span className="text-accent mr-3 text-xl">✓</span>
                <div>
                  <strong className="text-gray-900">Calidad:</strong> cada sello debe ser perfecto, funcional y estéticamente impecable.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3 text-xl">✓</span>
                <div>
                  <strong className="text-gray-900">Creatividad:</strong> innovación constante en diseño y presentación.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3 text-xl">✓</span>
                <div>
                  <strong className="text-gray-900">Cercanía:</strong> conexión humana real con los clientes.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3 text-xl">✓</span>
                <div>
                  <strong className="text-gray-900">Innovación:</strong> aplicación constante de nuevas tecnologías.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3 text-xl">✓</span>
                <div>
                  <strong className="text-gray-900">Adaptabilidad:</strong> soluciones a medida para cada necesidad.
                </div>
              </li>
            </ul>
          </section>

          <section className="bg-bronce/10 rounded-lg p-6 border border-bronce/20">
            <h2 className="text-2xl font-semibold mb-4">Nuestra misión</h2>
            <p className="text-gray-700 leading-relaxed">
              Fabricar productos de altísima calidad para la personalización profesional de los trabajos de nuestros clientes, brindando una experiencia humana, confiable y cercana, guiada por la innovación, la creatividad y la mejora continua.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Convertimos a los trabajadores del cuero y la madera en profesionales del oficio, revalorizando su trabajo y su historia.
            </p>
          </section>

          <section className="text-center pt-8">
            <Link
              href="/proceso"
              className="inline-block bg-accent text-primary px-8 py-4 rounded-md font-semibold hover:bg-accent-light transition-colors"
            >
              Ver cómo trabajamos
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

