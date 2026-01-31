import Link from 'next/link';

interface ActionButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  target?: string;
  rel?: string;
  className?: string;
}

export default function ActionButton({
  children,
  href,
  onClick,
  variant = 'secondary',
  target,
  rel,
  className = '',
}: ActionButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1';
  
  const variantStyles = {
    primary: 'bg-neutral-900 text-white border border-neutral-900 hover:bg-neutral-800 focus:ring-neutral-900',
    secondary: 'bg-white text-neutral-900 border border-neutral-300 hover:border-neutral-900 focus:ring-neutral-900',
    ghost: 'bg-transparent text-neutral-700 border border-transparent hover:border-neutral-300 hover:text-neutral-900 focus:ring-neutral-900',
  };

  const icon = variant === 'primary' ? (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ) : (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={combinedClassName}
      >
        {children}
        {icon}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={combinedClassName}
    >
      {children}
      {icon}
    </button>
  );
}






