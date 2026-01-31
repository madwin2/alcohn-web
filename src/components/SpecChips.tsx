interface SpecChip {
  label: string;
  value: string;
}

interface SpecChipsProps {
  specs: SpecChip[];
  className?: string;
}

export default function SpecChips({ specs, className = '' }: SpecChipsProps) {
  if (!specs || specs.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {specs.map((spec, index) => (
        <div
          key={index}
          className="inline-flex items-center px-2 py-0.5 border border-neutral-300 bg-white"
        >
          <span className="text-[10px] uppercase tracking-wider text-neutral-600 font-medium">
            {spec.label}
          </span>
          <span className="text-[10px] text-neutral-900 ml-1.5 font-medium">
            {spec.value}
          </span>
        </div>
      ))}
    </div>
  );
}






