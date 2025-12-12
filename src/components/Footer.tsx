import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Alcohn</h3>
            <p className="text-secondary-dark text-sm">
              Sellos de bronce de alta precisión fabricados en CNC. Mar del Plata, Argentina.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Productos</h4>
            <ul className="space-y-2 text-sm text-secondary-dark">
              <li>
                <Link href="/productos/sellos-para-cuero" className="hover:text-accent">
                  Para cuero
                </Link>
              </li>
              <li>
                <Link href="/productos/sellos-para-madera" className="hover:text-accent">
                  Para madera
                </Link>
              </li>
              <li>
                <Link href="/productos/sellos-para-alimentos" className="hover:text-accent">
                  Para alimentos
                </Link>
              </li>
              <li>
                <Link href="/productos/abecedarios" className="hover:text-accent">
                  Abecedarios
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Información</h4>
            <ul className="space-y-2 text-sm text-secondary-dark">
              <li>
                <Link href="/proceso" className="hover:text-accent">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/sobre-alcohn" className="hover:text-accent">
                  Sobre Alcohn
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-accent">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-accent">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-secondary-dark">
              <li>Mar del Plata, Argentina</li>
              <li>
                <Link href="/cotizar" className="hover:text-accent">
                  Cotizar ahora
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-secondary-dark">
          <p>© {new Date().getFullYear()} Alcohn. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}





