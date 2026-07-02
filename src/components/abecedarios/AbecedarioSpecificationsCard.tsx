const ABECEDARIO_SPECS = [
  { label: 'Material', value: 'Bronce de alta calidad' },
  { label: 'Proceso', value: 'CNC alta precisión' },
  { label: 'Profundidad', value: '3mm' },
  { label: 'Uso', value: 'Cuero, madera, cerámica y packaging' },
  { label: 'Producción', value: '10-14 días hábiles' },
] as const;

interface AbecedarioSpecificationsCardProps {
  className?: string;
}

export default function AbecedarioSpecificationsCard({ className = '' }: AbecedarioSpecificationsCardProps) {
  return (
    <dl className={`divide-y divide-[var(--alcohn-line)] border-y border-[var(--alcohn-line)] ${className}`}>
      {ABECEDARIO_SPECS.map((spec) => (
        <div key={spec.label} className="flex items-baseline justify-between gap-4 py-2">
          <dt className="craft-label text-[10px]">{spec.label}</dt>
          <dd className="text-right text-xs leading-relaxed text-neutral-800">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
