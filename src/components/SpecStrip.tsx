export default function SpecStrip() {
  const specs = [
    'BRONCE MACIZO',
    'MECANIZADO CNC',
    'PROFUNDIDAD PERFECTA',
    'HECHO A MEDIDA',
  ];

  return (
    <div className="border-t border-b precision-rule py-4 md:py-6 mb-8 md:mb-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {specs.map((spec, index) => (
          <div key={index} className="flex items-center">
            <div className="w-1 h-4 bg-[var(--alcohn-bronze)] mr-3 flex-shrink-0" />
            <span className="text-xs uppercase tracking-wider text-neutral-700 font-semibold">
              {spec}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
