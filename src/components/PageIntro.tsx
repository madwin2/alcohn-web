import ActionButton from './ActionButton';
import PriceFrom from './PriceFrom';

interface Cta {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface PageIntroProps {
  label: string;
  title: string;
  description: string;
  mobileDescription?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  highlights?: string[];
  hideHighlightsOnMobile?: boolean;
  priceFrom?: number;
  className?: string;
}

export default function PageIntro({
  label,
  title,
  description,
  mobileDescription,
  primaryCta,
  secondaryCta,
  highlights = [],
  hideHighlightsOnMobile = false,
  priceFrom,
  className = '',
}: PageIntroProps) {
  return (
    <section className={`technical-sheet motion-reveal mb-8 md:mb-16 ${className}`}>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.46fr_0.54fr] border-b border-[var(--alcohn-line)]">
        <div className="p-4 md:p-10 lg:p-12">
          <p className="craft-label mb-3 md:mb-4">{label}</p>
          <h1 className="text-[1.75rem] leading-[1.08] md:text-6xl md:leading-[0.98] font-semibold tracking-tight text-neutral-950">
            {title}
          </h1>
        </div>

        <div className="p-4 md:p-10 lg:p-12 border-t lg:border-l lg:border-t-0 border-[var(--alcohn-line)] flex flex-col justify-between gap-5 md:gap-8">
          <p className="text-sm md:text-base leading-relaxed text-neutral-700 max-w-2xl">
            <span className="md:hidden">{mobileDescription || description}</span>
            <span className="hidden md:inline">{description}</span>
          </p>

          {priceFrom != null && (
            <PriceFrom amount={priceFrom} className="pt-1 border-t border-[var(--alcohn-line)]" />
          )}

          {(primaryCta || secondaryCta) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {primaryCta && (
                <ActionButton href={primaryCta.href} variant={primaryCta.variant || 'primary'} className="w-full sm:w-auto">
                  {primaryCta.label}
                </ActionButton>
              )}
              {secondaryCta && (
                <ActionButton
                  href={secondaryCta.href}
                  onClick={secondaryCta.onClick}
                  variant={secondaryCta.variant || 'secondary'}
                  className="w-full sm:w-auto"
                >
                  {secondaryCta.label}
                </ActionButton>
              )}
            </div>
          )}
        </div>
      </div>

      {highlights.length > 0 && (
        <>
          {/* Mobile: lista vertical compacta con check */}
          <ul
            className={`relative z-10 divide-y divide-[var(--alcohn-line)] sm:hidden ${
              hideHighlightsOnMobile ? 'hidden' : ''
            }`}
          >
            {highlights.map((highlight, index) => (
              <li key={highlight} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center border border-[var(--alcohn-bronze)] bg-[var(--alcohn-bronze)]/15 text-[10px] font-semibold text-[var(--alcohn-bronze-dark)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-[13.5px] font-medium leading-snug text-neutral-900">{highlight}</p>
              </li>
            ))}
          </ul>
          {/* Desktop/tablet: 3 columnas */}
          <div className="relative z-10 hidden sm:grid sm:grid-cols-3">
            {highlights.map((highlight, index) => (
              <div
                key={`d-${highlight}`}
                className="min-h-[108px] border-b-0 border-r border-[var(--alcohn-line)] p-6 last:border-r-0"
              >
                <p className="craft-label mb-5">{String(index + 1).padStart(2, '0')}</p>
                <p className="text-sm font-semibold leading-snug text-neutral-950">{highlight}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
