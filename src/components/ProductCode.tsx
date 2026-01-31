interface ProductCodeProps {
  code: string;
  className?: string;
}

export default function ProductCode({ code, className = '' }: ProductCodeProps) {
  return (
    <div className={`text-[10px] uppercase tracking-wider text-neutral-500 font-mono ${className}`}>
      {code}
    </div>
  );
}






