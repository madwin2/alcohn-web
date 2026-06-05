import Image from 'next/image';
import ProductCompactCard from '@/components/sellos/ProductCompactCard';
import PurchaseInclusionsKitExplorer from '@/components/PurchaseInclusionsKitExplorer';
import MobileCarousel from '@/components/MobileCarousel';

type InclusionVariant = 'personalizado' | 'estandar' | 'abecedario';

export const KIT_ILLUSTRATION_SRC = '/images/sello/kit-sello-que-incluye.png';

export type InclusionItem = {
  title: string;
  copy: string;
};

interface PurchaseInclusionsProps {
  variant?: InclusionVariant;
  items?: string[];
  /** Reemplaza los ítems por defecto del variant (título + descripción). */
  inclusionItems?: InclusionItem[];
  className?: string;
  compact?: boolean;
  title?: string;
  copy?: string;
  /** Ilustración del kit (sello + mango). Activa en páginas de material. */
  showKitIllustration?: boolean;
  /** Logo del cliente (esquina de la tarjeta compacta). */
  logoUrl?: string | null;
}

const defaultItems: Record<InclusionVariant, InclusionItem[]> = {
  personalizado: [
    {
      title: 'Sello de bronce',
      copy: 'Pieza mecanizada en CNC, lista para marcar con profundidad y lectura.',
    },
    {
      title: 'Mango ergonómico',
      copy: 'Incluido para uso manual a fuego directo. Cómodo y controlado sobre el material.',
    },
    {
      title: 'Varilla de Acero Inoxidable Roscada M6',
      copy: 'La varilla permite poder calentar el sello sin ningun riesgo de quemadura.',
    },
    {
      title: 'Adaptación para remachadora',
      copy: 'Prisionero para poder enroscar el sello en la remachadora. Tambien se puede usar sin el.',
    },
    {
      title: 'Muestra Fisica en Cuero',
      copy: 'Luego de hacerlo, marcamos un pedacito de cuero, para que veas el resultado final.',
    },
    {
      title: 'Guía rápida de uso',
      copy: 'Indicaciones para probar, marcar y cuidar el sello desde el primer día.',
    },
  ],
  estandar: [
    {
      title: 'Diseño estándar en bronce',
      copy: 'El modelo elegido, fabricado en bronce y listo para sumar al carrito.',
    },
    {
      title: 'Medida seleccionada',
      copy: 'Precio visible según tamaño para comprar sin esperar una cotización.',
    },
    {
      title: 'Mango de uso',
      copy: 'Configuración práctica para aplicar la marca con control.',
    },
    {
      title: 'Guía rápida de uso',
      copy: 'Recomendaciones de prueba, presión, calor y cuidado.',
    },
  ],
  abecedario: [
    {
      title: 'Piezas de bronce',
      copy: 'Letras o números individuales para componer textos, fechas o series.',
    },
    {
      title: 'Caja organizadora',
      copy: 'Para mantener el set protegido y fácil de usar en el taller.',
    },
    {
      title: 'Guía rápida de uso',
      copy: 'Recomendaciones para alinear, presionar y cuidar las piezas.',
    },
  ],
};

export function buildStandardStampInclusions(designTitle: string): InclusionItem[] {
  const [first, ...rest] = defaultItems.personalizado;
  return [
    {
      ...first,
      title: `Sello Estándar - ${designTitle}`,
    },
    ...rest,
  ];
}

function normalizeItems(variant: InclusionVariant, items?: string[]): InclusionItem[] {
  if (!items || items.length === 0) return defaultItems[variant];

  return items.map((item) => {
    const lower = item.toLowerCase();
    if (lower.includes('sello')) {
      return {
        title: item,
        copy: 'Pieza principal de bronce fabricada para marcar tu producto.',
      };
    }
    if (lower.includes('mango')) {
      return {
        title: item,
        copy: 'Incluido para aplicar presión con mejor control manual.',
      };
    }
    if (lower.includes('remachadora') || lower.includes('adaptaci')) {
      return {
        title: item,
        copy: 'Incluida en todos los sellos personalizados para uso con presión pareja.',
      };
    }
    if (lower.includes('muestra')) {
      return {
        title: item,
        copy: 'La ves antes de fabricar para validar medida, proporción y resultado.',
      };
    }
    if (lower.includes('guía') || lower.includes('guia')) {
      return {
        title: item,
        copy: 'Indicaciones simples para probar, marcar y cuidar el sello.',
      };
    }
    return {
      title: item,
      copy: 'Incluido para que el pedido llegue listo para usar.',
    };
  });
}

export default function PurchaseInclusions({
  variant = 'personalizado',
  items,
  inclusionItems,
  className = '',
  compact = false,
  title = 'Qué incluye tu compra',
  copy,
  showKitIllustration = true,
  logoUrl,
}: PurchaseInclusionsProps) {
  const normalizedItems = inclusionItems ?? normalizeItems(variant, items);
  const usesFullKit = inclusionItems != null || variant === 'personalizado';
  const introCopy =
    copy ||
    (usesFullKit
      ? 'Además del sello, cada compra incluye los elementos necesarios para utilizar el sello en el material seleccionado.'
      : 'El pedido deja claro qué recibís antes de avanzar al pago.');

  if (!compact && showKitIllustration && usesFullKit) {
    return (
      <PurchaseInclusionsKitExplorer
        items={normalizedItems}
        className={className}
      />
    );
  }

  if (compact) {
    const logoSrc = logoUrl || null;
    return (
      <ProductCompactCard label="Incluido" title={title} className={className}>
        <ul className="space-y-2">
          {normalizedItems.slice(0, 6).map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className={`grid grid-cols-[22px_1fr] gap-2 text-xs leading-relaxed text-neutral-700 ${index >= 4 ? 'hidden md:grid' : ''}`}
            >
              <span className="mt-0.5 flex h-4 w-4 items-center justify-center border border-[var(--alcohn-line-strong)] text-[9px] font-semibold text-neutral-700">
                {index + 1}
              </span>
              <span>{item.title}</span>
            </li>
          ))}
          {normalizedItems.length > 4 && (
            <li className="text-[11px] uppercase tracking-wide text-neutral-500 md:hidden">
              +{normalizedItems.length - 4} ítems más
            </li>
          )}
        </ul>
        {logoSrc && (
          <div className="mt-3 flex justify-end" title="Tu logo">
            <div className="h-14 w-14 overflow-hidden border border-[var(--alcohn-line-strong)] bg-white/90 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="Logo del cliente"
                className="h-full w-full object-contain p-1"
              />
            </div>
          </div>
        )}
      </ProductCompactCard>
    );
  }

  return (
    <section className={`technical-sheet blueprint-sheet overflow-hidden ${className}`}>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.36fr_0.64fr]">
        <div className="relative border-b lg:border-b-0 lg:border-r border-[var(--alcohn-line)] p-6 md:p-8 lg:p-10">
          <p className="craft-label mb-5">Ficha de compra / Alcohn</p>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-neutral-950">
            {title}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-neutral-700">
            {introCopy}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-[10px] font-semibold uppercase text-neutral-500">
            <span className="border border-dashed border-[var(--alcohn-line)] bg-white/60 px-3 py-2">
              Bronce CNC
            </span>
            <span className="border border-dashed border-[var(--alcohn-line)] bg-white/60 px-3 py-2">
              Listo para taller
            </span>
          </div>
          {showKitIllustration && (
            <div className="mt-8 flex w-full justify-center">
              <Image
                src={KIT_ILLUSTRATION_SRC}
                alt="Ilustración del sello de bronce con mango, varilla y cabezal de marcado"
                width={4502}
                height={2973}
                className="mx-auto h-auto w-auto max-w-[280px] object-contain object-center mix-blend-multiply"
                sizes="(max-width: 1024px) 80vw, 280px"
              />
            </div>
          )}
          <svg
            aria-hidden
            className="blueprint-annotation pointer-events-none absolute right-6 top-6 hidden h-24 w-24 text-neutral-950/60 md:block"
            viewBox="0 0 96 96"
            fill="none"
          >
            <path d="M13 53C21 31 43 18 73 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="4 5" />
            <path d="M68 14L78 22L67 29" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 67C39 79 63 78 81 61" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        <MobileCarousel rowClassName="sm:grid sm:grid-cols-2" hint="Deslizá lo incluido">
          {normalizedItems.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="mobile-snap-card purchase-inclusion-cell border border-[var(--alcohn-line)] p-5 md:p-6 sm:min-w-0 sm:border-b sm:border-r sm:even:border-r-0"
            >
              <div className="mb-8 flex items-start justify-between gap-4">
                <span className="flex h-9 w-9 items-center justify-center border border-[var(--alcohn-line-strong)] bg-white/80 text-xs font-semibold text-neutral-900">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-semibold uppercase text-neutral-400">
                  KIT-{String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                {item.copy}
              </p>
            </article>
          ))}
        </MobileCarousel>
      </div>
    </section>
  );
}