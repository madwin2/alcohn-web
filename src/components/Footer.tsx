import Link from 'next/link';
import Divider from './Divider';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-8 md:py-16 pb-24 md:pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="md:hidden space-y-5">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Alcohn</h3>
            <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
              Sellos de bronce CNC. Mar del Plata, Argentina.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <Link href="/productos" className="flex min-h-[44px] items-center text-sm text-neutral-200 hover:text-white transition-colors">Productos</Link>
            <Link href="/proceso" className="flex min-h-[44px] items-center text-sm text-neutral-200 hover:text-white transition-colors">Cómo funciona</Link>
            <Link href="/sobre-alcohn" className="flex min-h-[44px] items-center text-sm text-neutral-200 hover:text-white transition-colors">Sobre Alcohn</Link>
            <Link href="/contacto" className="flex min-h-[44px] items-center text-sm text-neutral-200 hover:text-white transition-colors">Contacto</Link>
            <Link href="/faq" className="flex min-h-[44px] items-center text-sm text-neutral-200 hover:text-white transition-colors">FAQ</Link>
            <Link href="/casos-reales" className="flex min-h-[44px] items-center text-sm text-neutral-200 hover:text-white transition-colors">Casos reales</Link>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-tight">Alcohn</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
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
        <Divider className="mt-5 md:mt-12 pt-4 md:pt-8 border-neutral-800" />
        <div className="text-center text-xs md:text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} Alcohn. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
