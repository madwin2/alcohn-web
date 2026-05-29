'use client';

import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from '@/lib/cart';

interface CartItemRowProps {
  item: CartItem;
  showImage?: boolean;
}

export default function CartItemRow({ item, showImage = true }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 pb-4 border-b border-neutral-200 last:border-0 last:pb-0">
      {showImage && (
        <div className="relative w-20 h-20 bg-neutral-50 border border-neutral-200 flex-shrink-0">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
            {item.title}
          </h3>
          <button
            onClick={() => removeItem(item.id)}
            className="flex-shrink-0 inline-flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center p-1 hover:bg-neutral-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
            aria-label={`Eliminar ${item.title}`}
          >
            <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium px-2 py-0.5 border border-neutral-300 bg-white">
            {item.variantSize}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.id, item.qty - 1)}
              className="w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center border border-neutral-300 bg-white hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
              aria-label="Disminuir cantidad"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-sm font-medium text-neutral-900 w-8 text-center">
              {item.qty}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.qty + 1)}
              className="w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center border border-neutral-300 bg-white hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
              aria-label="Aumentar cantidad"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <p className="text-sm font-semibold text-neutral-900">
            ${(item.price * item.qty).toLocaleString('es-AR')}
          </p>
        </div>
      </div>
    </div>
  );
}


