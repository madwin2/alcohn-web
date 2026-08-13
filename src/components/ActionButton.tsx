'use client';

import Link from 'next/link';
import { pushGtmEvent } from '@/lib/analytics/gtm';

interface ActionButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  target?: string;
  rel?: string;
  className?: string;
  /** Evento de dataLayer a disparar al hacer clic (serializable, usable desde Server Components). */
  gtmEvent?: { name: string; params?: Record<string, unknown> };
}

export default function ActionButton({
  children,
  href,
  onClick,
  variant = 'secondary',
  target,
  rel,
  className = '',
  gtmEvent,
}: ActionButtonProps) {
  const baseStyles = 'inline-flex min-h-[42px] items-center justify-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.05em] font-semibold transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-offset-1 md:min-h-[44px] md:px-4 md:py-2 md:text-xs md:tracking-wider';
  
  const variantStyles = {
    primary: 'bg-[var(--alcohn-ink)] text-white border border-[var(--alcohn-ink)] hover:bg-[var(--alcohn-ink-soft)] hover:border-bronze focus:ring-neutral-900',
    secondary: 'bg-[var(--alcohn-surface)] text-neutral-900 border border-neutral-300 hover:border-bronze hover:bg-white focus:ring-neutral-900',
    ghost: 'bg-transparent text-neutral-700 border border-transparent hover:border-bronze hover:text-neutral-900 focus:ring-neutral-900',
  };

  const showsExternalIcon = Boolean(target === '_blank' || href?.startsWith('http'));

  const icon = variant === 'primary' && showsExternalIcon ? (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ) : (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  const handleClick = () => {
    if (gtmEvent) pushGtmEvent(gtmEvent.name, gtmEvent.params);
    onClick?.();
  };

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={combinedClassName}
        onClick={handleClick}
      >
        {children}
        {icon}
      </Link>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={combinedClassName}
    >
      {children}
      {icon}
    </button>
  );
}






