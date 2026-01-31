interface DividerProps {
  className?: string;
  variant?: 'default' | 'thick';
}

export default function Divider({ className = '', variant = 'default' }: DividerProps) {
  const borderClass = variant === 'thick' ? 'border-neutral-300' : 'border-neutral-200';
  
  return (
    <div className={`border-t ${borderClass} ${className}`} />
  );
}






