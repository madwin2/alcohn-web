import ProductCompactCard from '@/components/sellos/ProductCompactCard';

const STANDARD_STAMP_SPECS = [
  { label: 'Material', value: 'Bronce de alta calidad' },
  { label: 'Proceso', value: 'CNC alta precisión' },
  { label: 'Profundidad', value: '3mm' },
  { label: 'Uso', value: 'Cuero y madera' },
  { label: 'Tiempo', value: '72hs habiles' },
] as const;

type StampSpecificationsCardProps = {
  className?: string;
};

export default function StampSpecificationsCard({ className = '' }: StampSpecificationsCardProps) {
  return (
    <ProductCompactCard
      label="Especificaciones"
      title="Ficha técnica"
      badge="ALC-SPEC"
      className={className}
    >
      <dl className="divide-y divide-[var(--alcohn-line)] border-y border-[var(--alcohn-line)]">
        {STANDARD_STAMP_SPECS.map((spec) => (
          <div
            key={spec.label}
            className="grid grid-cols-[minmax(0,38%)_minmax(0,1fr)] gap-3 px-3 py-2.5"
          >
            <dt className="craft-label text-[10px]">{spec.label}</dt>
            <dd className="text-xs leading-relaxed text-neutral-800">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </ProductCompactCard>
  );
}
