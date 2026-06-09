import Link from 'next/link';
import Divider from './Divider';
import { SITE_CONTACT, SITE_SOCIAL } from '@/lib/seo';

const footerLinkClass =
  'inline-flex min-h-9 items-center text-sm text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white';

function FooterContactDetails({ className = '' }: { className?: string }) {
  return (
    <address className={`not-italic text-sm leading-relaxed text-neutral-300 ${className}`}>
      <p>{SITE_CONTACT.streetAddress}</p>
      <p>
        CP {SITE_CONTACT.postalCode}, {SITE_CONTACT.addressLocality},{' '}
        {SITE_CONTACT.addressRegion}, {SITE_CONTACT.addressCountry}
      </p>
      <p className="mt-2">
        <a
          href={`tel:${SITE_CONTACT.phoneTel}`}
          className="font-medium text-neutral-200 hover:text-white transition-colors"
        >
          {SITE_CONTACT.phoneDisplay}
        </a>
      </p>
      <p className="mt-1">
        <a
          href={SITE_CONTACT.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 hover:text-white transition-colors"
        >
          WhatsApp
        </a>
      </p>
      <p className="mt-1">
        <a
          href={`mailto:${SITE_CONTACT.email}`}
          className="text-neutral-400 hover:text-white transition-colors break-all"
        >
          {SITE_CONTACT.email}
        </a>
      </p>
    </address>
  );
}

function FooterLegalLinks({ linkClass }: { linkClass: string }) {
  return (
    <>
      <Link href="/politica-envios" className={linkClass}>
        Política de envíos
      </Link>
      <Link href="/politica-devoluciones" className={linkClass}>
        Política de devoluciones
      </Link>
      <Link href="/terminos" className={linkClass}>
        Términos y condiciones
      </Link>
      <Link href="/privacidad" className={linkClass}>
        Política de privacidad
      </Link>
    </>
  );
}

function PaymentMethods({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        Medios de pago
      </span>
      <span
        aria-label="Visa"
        title="Visa"
        className="inline-flex h-6 items-center justify-center rounded-sm bg-neutral-100 px-2 text-[10px] font-bold tracking-wide text-neutral-700"
      >
        <svg
          viewBox="0 0 48 16"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-auto"
          aria-hidden="true"
        >
          <text
            x="24"
            y="13"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="14"
            fill="#1A1F71"
          >
            VISA
          </text>
        </svg>
      </span>
      <span
        aria-label="Mastercard"
        title="Mastercard"
        className="inline-flex h-6 items-center justify-center rounded-sm bg-neutral-100 px-2"
      >
        <svg
          viewBox="0 0 32 20"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-auto"
          aria-hidden="true"
        >
          <circle cx="12" cy="10" r="6.5" fill="#EB001B" />
          <circle cx="20" cy="10" r="6.5" fill="#F79E1B" />
          <path
            d="M16 5.2a6.48 6.48 0 0 1 0 9.6 6.48 6.48 0 0 1 0-9.6z"
            fill="#FF5F00"
          />
        </svg>
      </span>
    </div>
  );
}

export default function Footer() {
  const mobileLinkClass =
    'flex min-h-[44px] items-center text-sm text-neutral-200 hover:text-white transition-colors';

  return (
    <footer className="bg-neutral-900 text-white py-8 md:py-16 pb-24 md:pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="md:hidden space-y-5">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Alcohn</h3>
            <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
              Sellos de bronce CNC. Fabricación en Mar del Plata, envío a todo Argentina.
            </p>
            <FooterContactDetails className="mt-4" />
            <a
              href={SITE_SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-[44px] items-center text-sm font-medium text-neutral-200 hover:text-white transition-colors"
            >
              Instagram @alcohn.cnc
            </a>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <Link href="/productos" className={mobileLinkClass}>
              Productos
            </Link>
            <Link href="/proceso" className={mobileLinkClass}>
              Cómo funciona
            </Link>
            <Link href="/sobre-alcohn" className={mobileLinkClass}>
              Sobre Alcohn
            </Link>
            <Link href="/contacto" className={mobileLinkClass}>
              Contacto
            </Link>
            <Link href="/faq" className={mobileLinkClass}>
              FAQ
            </Link>
            <Link href="/casos-reales" className={mobileLinkClass}>
              Casos reales
            </Link>
            <FooterLegalLinks linkClass={mobileLinkClass} />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-tight">Alcohn</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Sellos de bronce de alta precisión fabricados en CNC. Envío a todo Argentina.
            </p>
            <FooterContactDetails className="mt-4" />
            <a
              href={SITE_SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={`${footerLinkClass} mt-4`}
            >
              Instagram @alcohn.cnc
            </a>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-4">
              Productos
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/sellos/para-cuero" className={footerLinkClass}>
                  Para cuero
                </Link>
              </li>
              <li>
                <Link href="/sellos/para-madera" className={footerLinkClass}>
                  Para madera
                </Link>
              </li>
              <li>
                <Link href="/sellos/para-pan" className={footerLinkClass}>
                  Para alimentos
                </Link>
              </li>
              <li>
                <Link href="/abecedarios" className={footerLinkClass}>
                  Abecedarios
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-4">
              Información
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/proceso" className={footerLinkClass}>
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/sobre-alcohn" className={footerLinkClass}>
                  Sobre Alcohn
                </Link>
              </li>
              <li>
                <Link href="/faq" className={footerLinkClass}>
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/contacto" className={footerLinkClass}>
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/politica-envios" className={footerLinkClass}>
                  Política de envíos
                </Link>
              </li>
              <li>
                <Link href="/politica-devoluciones" className={footerLinkClass}>
                  Política de devoluciones
                </Link>
              </li>
              <li>
                <Link href="/terminos" className={footerLinkClass}>
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className={footerLinkClass}>
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-4">
              Comprar
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/buy?mode=custom" className={footerLinkClass}>
                  Diseñar mi sello
                </Link>
              </li>
              <li>
                <Link href="/sellos/estandar" className={footerLinkClass}>
                  Sellos estándar
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Divider className="mt-5 md:mt-12 pt-4 md:pt-8 border-neutral-800" />
        <div className="flex flex-col items-center gap-3 text-center text-xs md:text-sm text-neutral-500 md:flex-row md:justify-between md:gap-4 md:text-left">
          <p>© {new Date().getFullYear()} Alcohn. Todos los derechos reservados.</p>
          <PaymentMethods />
        </div>
      </div>
    </footer>
  );
}
