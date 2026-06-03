'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ActionButton from './ActionButton';
import CartButton from './cart/CartButton';

const logoLinkClassName =
  'font-semibold uppercase tracking-[0.14em] text-white hover:text-neutral-300 transition-colors';

const navItems = [
  { href: '/productos', label: 'Productos' },
  { href: '/proceso', label: 'Proceso' },
  { href: '/como-usar-sellos', label: 'Uso de sellos' },
  { href: '/casos-reales', label: 'Casos reales' },
  { href: '/faq', label: 'FAQ' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsMenuOpen(false);

  // Cerrar al cambiar de ruta y al presionar ESC
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleKey);
    // Bloquear scroll del body cuando el menú está abierto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isMenuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <header className="atelier-header text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        {/* Mobile: menú | ALCOHN | carrito */}
        <div className="grid h-14 grid-cols-[2.75rem_1fr_2.75rem] items-center lg:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            className="inline-flex h-11 w-11 items-center justify-center border border-neutral-700 text-white hover:border-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>

          <Link
            href="/"
            onClick={closeMenu}
            className={`${logoLinkClassName} justify-self-center text-sm`}
          >
            ALCOHN
          </Link>

          <div className="justify-self-end">
            <CartButton />
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden h-16 items-center justify-between gap-3 lg:flex">
          <Link
            href="/"
            onClick={closeMenu}
            className={`${logoLinkClassName} flex-shrink-0 text-sm`}
          >
            ALCOHN
          </Link>

          <nav className="flex gap-6 xl:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-neutral-300 hover:text-white transition-colors border-b border-transparent hover:border-[var(--alcohn-bronze)]"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/sobre-alcohn" className="text-sm text-neutral-300 hover:text-white transition-colors border-b border-transparent hover:border-[var(--alcohn-bronze)]">
              Sobre Alcohn
            </Link>
            <Link href="/contacto" className="text-sm text-neutral-300 hover:text-white transition-colors border-b border-transparent hover:border-[var(--alcohn-bronze)]">
              Contacto
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <CartButton />
            <ActionButton
              href="/buy?mode=custom"
              variant="secondary"
              className="bg-white text-neutral-900 border-white hover:border-[var(--alcohn-bronze)] hover:bg-[var(--alcohn-paper)] text-xs px-4"
            >
              Dise&ntilde;ar sello
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Backdrop mobile menu */}
      {isMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menu"
          onClick={closeMenu}
          className="lg:hidden fixed inset-0 top-14 z-40 bg-black/55 backdrop-blur-sm"
        />
      )}

      {/* Mobile drawer */}
      {isMenuOpen && (
        <nav
          className="lg:hidden absolute left-0 right-0 top-14 z-50 border-t border-neutral-800 bg-[rgba(17,16,14,0.98)] shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          aria-label="Navegacion mobile"
        >
          <div className="container mx-auto px-4 py-4 space-y-1">
            <Link
              href="/buy?mode=custom"
              onClick={closeMenu}
              className="flex min-h-[52px] items-center justify-between border border-[var(--alcohn-bronze)] bg-[var(--alcohn-bronze)]/12 px-4 text-sm font-semibold uppercase tracking-wide text-white"
            >
              Diseñar mi sello
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <div className="grid">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex min-h-[48px] items-center border-b border-white/8 px-1 text-[15px] transition-colors ${
                      active ? 'text-white font-semibold' : 'text-neutral-200 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/sobre-alcohn"
                onClick={closeMenu}
                className={`flex min-h-[48px] items-center border-b border-white/8 px-1 text-[15px] transition-colors ${
                  isActive('/sobre-alcohn') ? 'text-white font-semibold' : 'text-neutral-200 hover:text-white'
                }`}
              >
                Sobre Alcohn
              </Link>
              <Link
                href="/contacto"
                onClick={closeMenu}
                className={`flex min-h-[48px] items-center px-1 text-[15px] transition-colors ${
                  isActive('/contacto') ? 'text-white font-semibold' : 'text-neutral-200 hover:text-white'
                }`}
              >
                Contacto
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
