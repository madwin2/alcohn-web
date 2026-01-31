import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  bg?: 'white' | 'neutral';
  padding?: 'default' | 'large' | 'small';
  id?: string;
}

export default function Section({ 
  children, 
  className = '', 
  bg = 'white',
  padding = 'default',
  id
}: SectionProps) {
  const bgClass = bg === 'neutral' ? 'bg-neutral-50' : 'bg-white';
  const paddingClass = {
    default: 'py-20 md:py-24',
    large: 'py-24 md:py-32',
    small: 'py-16',
  }[padding];

  return (
    <section 
      id={id} 
      className={`snap-start snap-always h-[calc(100vh-4rem)] flex items-center justify-center ${bgClass} ${paddingClass} ${className}`}
      data-snap-section
    >
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}




