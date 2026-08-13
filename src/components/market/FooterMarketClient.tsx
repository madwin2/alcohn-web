'use client';

import Link from 'next/link';
import { useMarket } from '@/contexts/MarketContext';
import { pushGtmEvent } from '@/lib/analytics/gtm';
import { getMarketConfig } from '@/lib/markets/config';
import { marketBuyPath, marketPath } from '@/lib/markets/paths';

const footerLinkClass =
  'inline-flex min-h-9 items-center text-sm text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white';

const mobileLinkClass =
  'flex min-h-[44px] items-center text-sm text-neutral-200 hover:text-white transition-colors';

export function FooterMarketTagline({ className = '' }: { className?: string }) {
  const { market } = useMarket();

  if (market === 'ar') {
    return (
      <p className={`text-sm text-neutral-300 leading-relaxed ${className}`}>
        Sellos de bronce de alta precisión fabricados en CNC. Envío a todo Argentina.
      </p>
    );
  }

  const country = getMarketConfig(market).countryName;
  return (
    <p className={`text-sm text-neutral-300 leading-relaxed ${className}`}>
      Sellos de bronce CNC fabricados en Argentina. Envío internacional DHL a {country}.
    </p>
  );
}

export function FooterMobileTagline({ className = '' }: { className?: string }) {
  const { market } = useMarket();

  if (market === 'ar') {
    return (
      <p className={`mt-2 text-sm text-neutral-300 leading-relaxed ${className}`}>
        Sellos de bronce CNC. Fabricación en Mar del Plata, envío a todo Argentina.
      </p>
    );
  }

  const country = getMarketConfig(market).countryName;
  return (
    <p className={`mt-2 text-sm text-neutral-300 leading-relaxed ${className}`}>
      Sellos de bronce CNC. Fabricación en Mar del Plata, envío DHL a {country}.
    </p>
  );
}

export function FooterWhatsappLink({
  href,
  className = '',
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { market } = useMarket();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => pushGtmEvent('click_whatsapp', { ubicacion: 'footer', market })}
    >
      {children}
    </a>
  );
}

const LEGAL_LINKS = [
  { href: '/politica-envios', label: 'Política de envíos' },
  { href: '/politica-devoluciones', label: 'Política de devoluciones' },
  { href: '/terminos', label: 'Términos y condiciones' },
  { href: '/privacidad', label: 'Política de privacidad' },
] as const;

export function FooterLegalLinks({
  linkClass = footerLinkClass,
}: {
  linkClass?: string;
}) {
  const { market } = useMarket();

  return (
    <>
      {LEGAL_LINKS.map((item) => (
        <Link key={item.href} href={marketPath(market, item.href)} className={linkClass}>
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function FooterLegalLinksList({ linkClass = footerLinkClass }: { linkClass?: string }) {
  const { market } = useMarket();

  return (
    <>
      {LEGAL_LINKS.map((item) => (
        <li key={item.href}>
          <Link href={marketPath(market, item.href)} className={linkClass}>
            {item.label}
          </Link>
        </li>
      ))}
    </>
  );
}

export function FooterProductLinks({ linkClass = footerLinkClass }: { linkClass?: string }) {
  const { market } = useMarket();

  return (
    <ul className="space-y-2">
      <li>
        <Link href={marketPath(market, '/sellos/para-cuero')} className={linkClass}>
          Para cuero
        </Link>
      </li>
      <li>
        <Link href={marketPath(market, '/sellos/para-madera')} className={linkClass}>
          Para madera
        </Link>
      </li>
      <li>
        <Link href={marketPath(market, '/sellos/para-pan')} className={linkClass}>
          Para alimentos
        </Link>
      </li>
      <li>
        <Link href={marketPath(market, '/abecedarios')} className={linkClass}>
          Abecedarios
        </Link>
      </li>
      {market !== 'ar' && (
        <li>
          <Link href={marketPath(market, '/accesorios/mango-de-golpe')} className={linkClass}>
            Mango de golpe
          </Link>
        </li>
      )}
    </ul>
  );
}

export function FooterComprarLinks({ linkClass = footerLinkClass }: { linkClass?: string }) {
  const { market } = useMarket();

  return (
    <ul className="space-y-2">
      <li>
        <Link href={marketBuyPath(market)} className={linkClass}>
          Diseñar mi sello
        </Link>
      </li>
      {market === 'ar' && (
        <li>
          <Link href="/sellos/estandar" className={linkClass}>
            Sellos estándar
          </Link>
        </li>
      )}
      {market !== 'ar' && (
        <li>
          <Link href={marketPath(market, '/productos')} className={linkClass}>
            Ver catálogo
          </Link>
        </li>
      )}
    </ul>
  );
}

export function FooterNavLinks({ linkClass = mobileLinkClass }: { linkClass?: string }) {
  const { market } = useMarket();

  return (
    <>
      <Link href={marketPath(market, '/productos')} className={linkClass}>
        Productos
      </Link>
      <Link href={marketPath(market, '/proceso')} className={linkClass}>
        Cómo funciona
      </Link>
      <Link href={marketPath(market, '/sobre-alcohn')} className={linkClass}>
        Sobre Alcohn
      </Link>
      <Link href={marketPath(market, '/contacto')} className={linkClass}>
        Contacto
      </Link>
      <Link href={marketPath(market, '/faq')} className={linkClass}>
        FAQ
      </Link>
      <Link href={marketPath(market, '/casos-reales')} className={linkClass}>
        Casos reales
      </Link>
    </>
  );
}

export function FooterInfoLinks({ linkClass = footerLinkClass }: { linkClass?: string }) {
  const { market } = useMarket();

  return (
    <>
      <li>
        <Link href={marketPath(market, '/proceso')} className={linkClass}>
          Cómo funciona
        </Link>
      </li>
      <li>
        <Link href={marketPath(market, '/sobre-alcohn')} className={linkClass}>
          Sobre Alcohn
        </Link>
      </li>
      <li>
        <Link href={marketPath(market, '/faq')} className={linkClass}>
          Preguntas frecuentes
        </Link>
      </li>
      <li>
        <Link href={marketPath(market, '/contacto')} className={linkClass}>
          Contacto
        </Link>
      </li>
    </>
  );
}
