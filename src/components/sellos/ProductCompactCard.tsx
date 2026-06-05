import type { ReactNode } from 'react';

type ProductCompactCardProps = {
  label: string;
  title: string;
  badge?: string;
  children: ReactNode;
  className?: string;
};

export default function ProductCompactCard({
  label,
  title,
  badge = 'ALC-KIT',
  children,
  className = '',
}: ProductCompactCardProps) {
  return (
    <div
      className={`technical-sheet blueprint-sheet relative flex flex-col p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--alcohn-line)] pb-3">
        <div>
          <p className="craft-label mb-1">{label}</p>
          <h3 className="text-base font-semibold tracking-tight text-neutral-950">{title}</h3>
        </div>
        <span className="hidden shrink-0 text-[10px] font-semibold uppercase text-neutral-400 sm:block">
          {badge}
        </span>
      </div>
      <div className="mt-3 flex-1">{children}</div>
    </div>
  );
}
