'use client';

import { useState } from 'react';
import Link from 'next/link';
import ActionButton from './ActionButton';
import CartButton from './cart/CartButton';

const navItems = [
  { href: '/productos', label: 'Productos' },
  { href: '/proceso', label: 'Proceso' },
  { href: '/como-usar-sellos', label: 'Uso de sellos' },
  { href: '/casos-reales', label: 'Casos reales' },
  { href: '/faq', label: 'FAQ' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="atelier-header text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <Link
            href="/"
            onClick={closeMenu}
            className="text-lg font-semibold tracking-tight hover:text-neutral-300 transition-colors flex-shrink-0"
          >
            Alcohn
          </Link>

          <nav className="hidden lg:flex gap-6 xl:gap-8">
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

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
              aria-expanded={isMenuOpen}
              className="lg:hidden inline-flex h-11 w-11 items-center justify-center border border-neutral-700 text-white hover:border-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
            <CartButton />
            <ActionButton
              href="/buy?mode=custom"
              variant="secondary"
              className="bg-white text-neutral-900 border-white hover:border-[var(--alcohn-bronze)] hover:bg-[var(--alcohn-paper)] text-xs px-3 md:px-4"
            >
              <span className="hidden sm:inline">Dise&ntilde;ar sello</span>
              <span className="sm:hidden">Dise&ntilde;ar</span>
            </ActionButton>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="lg:hidden border-t border-neutral-800 py-3" aria-label="Navegacion mobile">
            <div className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="block px-1 py-3 text-sm text-neutral-200 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/sobre-alcohn"
                onClick={closeMenu}
                className="block px-1 py-3 text-sm text-neutral-200 hover:text-white transition-colors"
              >
                Sobre Alcohn
              </Link>
              <Link
                href="/contacto"
                onClick={closeMenu}
                className="block px-1 py-3 text-sm text-neutral-200 hover:text-white transition-colors"
              >
                Contacto
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
