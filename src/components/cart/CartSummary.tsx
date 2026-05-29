'use client';

interface CartSummaryProps {
  subtotal: number;
  shippingCost?: number;
  shippingLabel?: string;
  className?: string;
}

export default function CartSummary({
  subtotal,
  shippingCost = 0,
  shippingLabel,
  className = '',
}: CartSummaryProps) {
  const total = subtotal + shippingCost;
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-neutral-600">Subtotal</span>
        <span className="font-semibold text-neutral-900">
          ${subtotal.toLocaleString('es-AR')}
        </span>
      </div>
      {shippingCost > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-600">
            Envío{shippingLabel ? ` (${shippingLabel})` : ''}
          </span>
          <span className="font-semibold text-neutral-900">
            ${shippingCost.toLocaleString('es-AR')}
          </span>
        </div>
      )}
      <div className="flex justify-between items-center text-sm pt-2 border-t border-neutral-200">
        <span className="text-neutral-900 font-medium">Total</span>
        <span className="text-lg font-semibold text-neutral-900">
          ${total.toLocaleString('es-AR')}
        </span>
      </div>
      {shippingCost === 0 && !shippingLabel && (
        <p className="text-xs text-neutral-500">El envío se confirma en el siguiente paso</p>
      )}
    </div>
  );
}


