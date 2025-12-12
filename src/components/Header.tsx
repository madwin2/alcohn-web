import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Alcohn
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/productos" className="hover:text-accent transition-colors">
              Productos
            </Link>
            <Link href="/proceso" className="hover:text-accent transition-colors">
              Proceso
            </Link>
            <Link href="/casos-reales" className="hover:text-accent transition-colors">
              Casos reales
            </Link>
            <Link href="/sobre-alcohn" className="hover:text-accent transition-colors">
              Sobre Alcohn
            </Link>
            <Link href="/faq" className="hover:text-accent transition-colors">
              FAQ
            </Link>
            <Link href="/contacto" className="hover:text-accent transition-colors">
              Contacto
            </Link>
          </nav>
          <Link
            href="/cotizar"
            className="bg-accent text-primary px-4 py-2 rounded-md font-semibold hover:bg-accent-light transition-colors"
          >
            Cotizar ahora
          </Link>
        </div>
      </div>
    </header>
  );
}

