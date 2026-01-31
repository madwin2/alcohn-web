export default function SpecStrip() {
  const specs = [
    'BRONCE MACIZO',
    'MECANIZADO CNC',
    'PROFUNDIDAD PERFECTA',
    'HECHO A MEDIDA',
  ];

  return (
    <div className="border-t border-b border-neutral-300 py-6 mb-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {specs.map((spec, index) => (
          <div key={index} className="flex items-center">
            <div className="w-1 h-4 bg-neutral-900 mr-3 flex-shrink-0" />
            <span className="text-xs uppercase tracking-wider text-neutral-700 font-medium">
              {spec}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
