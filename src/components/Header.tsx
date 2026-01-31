import Link from 'next/link';
import ActionButton from './ActionButton';
import CartButton from './cart/CartButton';

export default function Header() {
  return (
    <header className="bg-neutral-900 text-white sticky top-0 z-50 border-b border-neutral-800">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-semibold tracking-tight hover:text-neutral-300 transition-colors">
            Alcohn
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link href="/productos" className="text-sm text-neutral-300 hover:text-white transition-colors border-b border-transparent hover:border-white">
              Productos
            </Link>
            <Link href="/proceso" className="text-sm text-neutral-300 hover:text-white transition-colors border-b border-transparent hover:border-white">
              Proceso
            </Link>
            <Link href="/casos-reales" className="text-sm text-neutral-300 hover:text-white transition-colors border-b border-transparent hover:border-white">
              Casos reales
            </Link>
            <Link href="/sobre-alcohn" className="text-sm text-neutral-300 hover:text-white transition-colors border-b border-transparent hover:border-white">
              Sobre Alcohn
            </Link>
            <Link href="/faq" className="text-sm text-neutral-300 hover:text-white transition-colors border-b border-transparent hover:border-white">
              FAQ
            </Link>
            <Link href="/contacto" className="text-sm text-neutral-300 hover:text-white transition-colors border-b border-transparent hover:border-white">
              Contacto
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <CartButton />
            <ActionButton
              href="/buy?mode=custom"
              variant="secondary"
              className="bg-white text-neutral-900 border-white hover:bg-neutral-100 text-xs"
            >
              Cotizar
            </ActionButton>
          </div>
        </div>
      </div>
    </header>
  );
}
