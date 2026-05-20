import Link from 'next/link';
import Divider from './Divider';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-tight">Alcohn</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Sellos de bronce de alta precisión fabricados en CNC. Mar del Plata, Argentina.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-4">Productos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/productos/sello-personalizado-cuero" className="inline-flex min-h-9 items-center text-sm text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white">
                  Para cuero
                </Link>
              </li>
              <li>
                <Link href="/productos/sello-personalizado-madera" className="inline-flex min-h-9 items-center text-sm text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white">
                  Para madera
                </Link>
              </li>
              <li>
                <Link href="/productos/sello-para-alimentos" className="inline-flex min-h-9 items-center text-sm text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white">
                  Para alimentos
                </Link>
              </li>
              <li>
                <Link href="/abecedarios" className="inline-flex min-h-9 items-center text-sm text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white">
                  Abecedarios
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-4">Información</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/proceso" className="inline-flex min-h-9 items-center text-sm text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/sobre-alcohn" className="inline-flex min-h-9 items-center text-sm text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white">
                  Sobre Alcohn
                </Link>
              </li>
              <li>
                <Link href="/faq" className="inline-flex min-h-9 items-center text-sm text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="inline-flex min-h-9 items-center text-sm text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li className="text-sm text-neutral-400">Mar del Plata, Argentina</li>
              <li>
                <Link href="/buy?mode=custom" className="inline-flex min-h-9 items-center text-sm text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white">
                  Diseñar mi sello
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Divider className="mt-12 pt-8 border-neutral-800" />
        <div className="text-center text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} Alcohn. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
