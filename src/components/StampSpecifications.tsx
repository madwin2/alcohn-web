import SectionHeader from '@/components/SectionHeader';
import { stampSpecifications } from '@/data/stampSpecifications';

interface StampSpecificationsProps {
  className?: string;
}

export default function StampSpecifications({ className = 'mb-20' }: StampSpecificationsProps) {
  return (
    <section className={className}>
      <SectionHeader title="Especificaciones" align="left" />

      <div className="technical-sheet">
        <dl className="relative z-10 divide-y divide-[var(--alcohn-line)]">
          {stampSpecifications.map(([label, value]) => (
            <div key={label} className="grid grid-cols-1 md:grid-cols-[0.28fr_0.72fr]">
              <dt className="craft-label border-b md:border-b-0 md:border-r border-[var(--alcohn-line)] p-5 md:p-6">
                {label}
              </dt>
              <dd className="p-5 md:p-6 text-sm leading-relaxed text-neutral-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
