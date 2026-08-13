import ActionButton from './ActionButton';
import PriceFrom from './PriceFrom';

interface Cta {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  gtmEvent?: { name: string; params?: Record<string, unknown> };
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
  titleOnlyOnMobile?: boolean;
  /** Mobile: título + texto + CTA en un solo bloque compacto (sin columna derecha separada). */
  compactMobile?: boolean;
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
  titleOnlyOnMobile = false,
  compactMobile = false,
  priceFrom,
  className = '',
}: PageIntroProps) {
  const hideMobileExtras = titleOnlyOnMobile || hideHighlightsOnMobile;
  const mobileMargin = compactMobile ? 'mb-4' : titleOnlyOnMobile ? 'mb-5' : 'mb-8';

  return (
    <section
      className={`technical-sheet motion-reveal ${mobileMargin} md:mb-16 ${className}`}
    >
      <div
        className={`relative z-10 grid grid-cols-1 lg:grid-cols-[0.46fr_0.54fr] border-[var(--alcohn-line)] ${
          titleOnlyOnMobile || compactMobile ? 'md:border-b' : 'border-b'
        }`}
      >
        <div
          className={`${compactMobile || titleOnlyOnMobile ? 'p-3 md:p-10 lg:p-12' : 'p-4 md:p-10 lg:p-12'} ${
            titleOnlyOnMobile || compactMobile ? 'pb-3 md:pb-10' : ''
          } ${compactMobile ? 'md:pb-10' : ''}`}
        >
          <p
            className={`craft-label ${
              compactMobile || titleOnlyOnMobile ? 'mb-1.5 md:mb-4' : 'mb-2 md:mb-4'
            }`}
          >
            {label}
          </p>
          <h1
            className={`font-semibold tracking-tight text-neutral-950 ${
              compactMobile
                ? 'text-lg leading-[1.15] md:text-6xl md:leading-[0.98]'
                : titleOnlyOnMobile
                  ? 'text-xl leading-[1.12] md:text-6xl md:leading-[0.98]'
                  : 'text-[1.75rem] leading-[1.08] md:text-6xl md:leading-[0.98]'
            }`}
          >
            {title}
          </h1>

          {compactMobile && (
            <div className="mt-2.5 space-y-2.5 border-t border-[var(--alcohn-line)] pt-2.5 md:hidden">
              <p className="text-[13px] leading-snug text-neutral-700">{description}</p>
              {priceFrom != null && (
                <PriceFrom amount={priceFrom} className="pt-2 border-t border-[var(--alcohn-line)]" />
              )}
              {(primaryCta || secondaryCta) && (
                <div className="flex flex-col gap-2">
                  {primaryCta && (
                    <ActionButton
                      href={primaryCta.href}
                      variant={primaryCta.variant || 'primary'}
                      className="w-full"
                    >
                      {primaryCta.label}
                    </ActionButton>
                  )}
                  {secondaryCta && (
                    <ActionButton
                      href={secondaryCta.href}
                      onClick={secondaryCta.onClick}
                      gtmEvent={secondaryCta.gtmEvent}
                      variant={secondaryCta.variant || 'secondary'}
                      className="w-full"
                    >
                      {secondaryCta.label}
                    </ActionButton>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`p-4 md:p-10 lg:p-12 border-[var(--alcohn-line)] flex-col justify-between gap-5 md:gap-8 ${
            compactMobile
              ? 'hidden md:flex md:border-t-0 md:border-l'
              : titleOnlyOnMobile
                ? 'hidden md:flex md:border-t-0 md:border-l'
                : 'flex border-t lg:border-l lg:border-t-0'
          }`}
        >
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
                  gtmEvent={secondaryCta.gtmEvent}
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
              hideMobileExtras ? 'hidden' : ''
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
