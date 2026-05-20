import ActionButton from './ActionButton';

interface Cta {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface PageIntroProps {
  label: string;
  title: string;
  description: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  highlights?: string[];
  className?: string;
}

export default function PageIntro({
  label,
  title,
  description,
  primaryCta,
  secondaryCta,
  highlights = [],
  className = '',
}: PageIntroProps) {
  return (
    <section className={`technical-sheet motion-reveal mb-12 md:mb-16 ${className}`}>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.46fr_0.54fr] border-b border-[var(--alcohn-line)]">
        <div className="p-6 md:p-10 lg:p-12">
          <p className="craft-label mb-4">{label}</p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[0.98] text-neutral-950">
            {title}
          </h1>
        </div>

        <div className="p-6 md:p-10 lg:p-12 border-t lg:border-l lg:border-t-0 border-[var(--alcohn-line)] flex flex-col justify-between gap-8">
          <p className="text-sm md:text-base leading-relaxed text-neutral-700 max-w-2xl">
            {description}
          </p>

          {(primaryCta || secondaryCta) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {primaryCta && (
                <ActionButton href={primaryCta.href} variant={primaryCta.variant || 'primary'} className="w-full sm:w-auto">
                  {primaryCta.label}
                </ActionButton>
              )}
              {secondaryCta && (
                <ActionButton href={secondaryCta.href} variant={secondaryCta.variant || 'secondary'} className="w-full sm:w-auto">
                  {secondaryCta.label}
                </ActionButton>
              )}
            </div>
          )}
        </div>
      </div>

      {highlights.length > 0 && (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3">
          {highlights.map((highlight, index) => (
            <div
              key={highlight}
              className="min-h-[108px] border-b sm:border-b-0 sm:border-r last:border-r-0 border-[var(--alcohn-line)] p-6"
            >
              <p className="craft-label mb-5">{String(index + 1).padStart(2, '0')}</p>
              <p className="text-sm font-semibold leading-snug text-neutral-950">{highlight}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
