interface SpecStripProps {
  className?: string;
}

export default function SpecStrip({ className = '' }: SpecStripProps) {
  const specs = [
    'BRONCE MACIZO',
    'MECANIZADO CNC',
    'PROFUNDIDAD PERFECTA',
    'HECHO A MEDIDA',
  ];

  return (
    <div
      className={`border-t border-b precision-rule py-2 md:py-6 mb-4 md:mb-16 ${className}`}
    >
      {/* Mobile: franja horizontal compacta, sin grilla 2×2 */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-1 md:hidden">
        {specs.map((spec, index) => (
          <span key={spec} className="inline-flex items-center gap-1.5">
            {index > 0 && (
              <span aria-hidden className="text-[9px] text-neutral-400">
                ·
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-0.5 shrink-0 bg-[var(--alcohn-bronze)]" />
              <span className="text-[9px] font-semibold uppercase tracking-wide text-neutral-700">{spec}</span>
            </span>
          </span>
        ))}
      </div>

      <div className="hidden md:grid md:grid-cols-4 md:gap-8">
        {specs.map((spec, index) => (
          <div key={index} className="flex items-center">
            <div className="mr-3 h-4 w-1 shrink-0 bg-[var(--alcohn-bronze)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
              {spec}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
