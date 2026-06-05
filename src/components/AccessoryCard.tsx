'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Accessory } from '@/data/accessories';
import ActionButton from '@/components/ActionButton';
import { useCart } from '@/contexts/CartContext';

interface AccessoryCardProps {
  accessory: Accessory;
}

export default function AccessoryCard({ accessory }: AccessoryCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const price = accessory.price;

  const handleAdd = () => {
    addItem({
      title: accessory.title,
      collection: 'Accesorios',
      material: 'Accesorio',
      process: '—',
      variantSize: 'Único',
      price,
      image: accessory.image,
      designSlug: accessory.slug,
    });
    setAdded(true);
  };

  return (
    <div className="material-card p-3 flex flex-col">
      <div className="material-frame aspect-square relative overflow-hidden">
        <Image
          src={accessory.image}
          alt={accessory.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className="px-2 pb-2 pt-5 space-y-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">{accessory.title}</h3>
        <p className="text-sm text-neutral-600 leading-relaxed flex-1">{accessory.description}</p>
        <div className="pt-4 border-t border-[var(--alcohn-line)]">
          <p className="text-sm text-neutral-600">
            <span className="craft-label mr-2">Precio</span>${price.toLocaleString('es-AR')}
          </p>
        </div>
        {added ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-neutral-900">Agregado al carrito.</p>
            <ActionButton href="/checkout" variant="primary" className="w-full">
              Finalizar compra
            </ActionButton>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="w-full min-h-[44px] border border-[var(--alcohn-ink)] bg-[var(--alcohn-ink)] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[var(--alcohn-ink-soft)] transition-colors"
          >
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  );
}
