import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string | ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export default function SectionHeader({ 
  title, 
  subtitle, 
  align = 'center',
  className = '' 
}: SectionHeaderProps) {
  const isLeft = align === 'left';
  const alignClass = isLeft ? 'text-left' : 'text-center';
  const subtitleClass = isLeft
    ? 'craft-label max-w-2xl leading-relaxed'
    : 'craft-label max-w-2xl mx-auto leading-relaxed';

  return (
    <div className={`mb-16 ${alignClass} ${className}`}>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-neutral-900 tracking-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className={subtitleClass}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

