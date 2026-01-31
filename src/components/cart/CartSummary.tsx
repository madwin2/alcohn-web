'use client';

interface CartSummaryProps {
  subtotal: number;
  className?: string;
}

export default function CartSummary({ subtotal, className = '' }: CartSummaryProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-neutral-600">Subtotal</span>
        <span className="text-lg font-semibold text-neutral-900">
          ${subtotal.toLocaleString('es-AR')}
        </span>
      </div>
      <p className="text-xs text-neutral-500">
        El envío se calcula luego
      </p>
    </div>
  );
}


