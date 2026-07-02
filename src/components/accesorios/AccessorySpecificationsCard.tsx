import type { AccessorySpec } from '@/data/accessories';

type AccessorySpecificationsCardProps = {
  specs: AccessorySpec[];
  className?: string;
};

export default function AccessorySpecificationsCard({
  specs,
  className = '',
}: AccessorySpecificationsCardProps) {
  return (
    <dl className={`divide-y divide-[var(--alcohn-line)] border-y border-[var(--alcohn-line)] ${className}`}>
      {specs.map((spec) => (
        <div key={spec.label} className="flex items-baseline justify-between gap-3 py-1.5 md:gap-4 md:py-2">
          <dt className="craft-label text-[10px]">{spec.label}</dt>
          <dd className="text-right text-xs leading-relaxed text-neutral-800">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
