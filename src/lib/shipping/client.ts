'use client';

import type { ShippingCatalog } from './types';
import { config } from '@/lib/config';

export async function fetchShippingCost(
  tipo: 'Domicilio' | 'Sucursal'
): Promise<number> {
  try {
    const res = await fetch(`/api/shipping/cost?tipo=${encodeURIComponent(tipo)}`);
    const data = (await res.json()) as { costo?: number };
    if (res.ok && typeof data.costo === 'number') return data.costo;
  } catch {
    // fallback
  }
  return tipo === 'Domicilio' ? config.shipping.domicilio : config.shipping.sucursal;
}

let catalogPromise: Promise<ShippingCatalog | null> | null = null;

export async function fetchShippingCatalog(): Promise<ShippingCatalog | null> {
  if (!catalogPromise) {
    catalogPromise = (async () => {
      try {
        const res = await fetch('/api/shipping/catalog');
        const data = (await res.json()) as ShippingCatalog & { error?: string };
        if (!res.ok || !data.provinces?.length) return null;
        return data;
      } catch {
        return null;
      }
    })();
  }
  return catalogPromise;
}
