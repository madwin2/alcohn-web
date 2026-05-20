import ActionButton from './ActionButton';

interface SalesCtaBandProps {
  title: string;
  copy: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  proof?: string[];
  dark?: boolean;
}

export default function SalesCtaBand({
  title,
  copy,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  proof = [],
  dark = false,
}: SalesCtaBandProps) {
  if (dark) {
    return (
      <section className="dark-system-panel p-6 md:p-10 text-white">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase text-white/56 mb-4">Compra online</p>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight max-w-3xl">
              {title}
            </h2>
            <p className="mt-5 text-sm md:text-base leading-relaxed text-white/62 max-w-2xl">
              {copy}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
            <ActionButton href={primaryHref} variant="secondary" className="bg-white text-neutral-900 border-white hover:bg-[var(--alcohn-paper)]">
              {primaryLabel}
            </ActionButton>
            {secondaryHref && secondaryLabel && (
              <ActionButton href={secondaryHref} variant="ghost" className="text-white hover:text-white">
                {secondaryLabel}
              </ActionButton>
            )}
          </div>
        </div>

        {proof.length > 0 && (
          <div className="relative z-10 mt-8 grid grid-cols-1 sm:grid-cols-3 border border-white/12">
            {proof.map((item) => (
              <div key={item} className="border-b sm:border-b-0 sm:border-r last:border-r-0 border-white/12 p-4">
                <p className="text-xs font-semibold uppercase text-white/72">{item}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="technical-sheet p-6 md:p-10">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:items-end">
        <div>
          <p className="craft-label mb-4">Siguiente paso</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-neutral-950 max-w-3xl">
            {title}
          </h2>
          <p className="mt-5 text-sm md:text-base leading-relaxed text-neutral-700 max-w-2xl">
            {copy}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
          <ActionButton href={primaryHref} variant="primary">
            {primaryLabel}
          </ActionButton>
          {secondaryHref && secondaryLabel && (
            <ActionButton href={secondaryHref} variant="secondary">
              {secondaryLabel}
            </ActionButton>
          )}
        </div>
      </div>
    </section>
  );
}
