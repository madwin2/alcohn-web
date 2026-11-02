import { describe, expect, it } from 'vitest';
import type { CartItem } from '@/lib/cart';
import { computeCheckoutPricing, computeMarketCheckoutPricing } from '../pricing';
import {
  calcularPresupuestoPersonalizado,
  cotizarAbecedarioDesdeVariante,
  getAbecedarioCompletoPrecio,
  getAbecedarioCompletoPrecioTransferencia,
} from '@/lib/abecedarioConfigurator';
import { getAccessoryBySlug, getAccessoryLinkPrice } from '@/data/accessories';

const base: Omit<CartItem, 'id' | 'designSlug' | 'variantSize' | 'collection'> = {
  title: 'Línea',
  material: 'Bronce',
  process: 'CNC',
  price: 1,
  qty: 1,
  image: '/x.webp',
};

describe('checkout pricing ignora el precio del navegador', () => {
  it('re-cotiza el abecedario completo por tamaño', () => {
    const item: CartItem = {
      ...base,
      id: 'abc',
      collection: 'Abecedarios',
      designSlug: 'abecedario-bronce-completo',
      variantSize: 'Completo (A-Z, a-z, 0-9) · Arial · 7mm',
    };
    const result = computeCheckoutPricing([item], null);
    expect(result.unpricedItems).toHaveLength(0);
    expect(result.openpaySubtotal).toBe(getAbecedarioCompletoPrecio(7));
    expect(result.transferSubtotal).toBe(getAbecedarioCompletoPrecioTransferencia(7));
  });

  it('re-cotiza el abecedario personalizado igual que el configurador', () => {
    const presupuesto = calcularPresupuestoPersonalizado({
      mayusculas: 2,
      minusculas: 0,
      numeros: 1,
      extrasQty: 3,
      extrasChars: '&@!',
      soportes: 1,
      tamanoMm: 5,
      fuente: 'arial',
    });
    const detalle = presupuesto.lineas
      .filter((l) => l.qty > 0)
      .map((l) => `${l.qty}x ${l.label}`)
      .join(', ');
    const quote = cotizarAbecedarioDesdeVariante(
      'abecedario-personalizado',
      `${detalle} · Arial · 5mm`
    );
    expect(quote?.link).toBe(presupuesto.total);
  });

  it('rechaza un abecedario con más piezas que el máximo o tamaño inexistente', () => {
    expect(
      cotizarAbecedarioDesdeVariante('abecedario-personalizado', '9x Abecedario en Mayúscula · Arial · 5mm')
    ).toBeNull();
    expect(
      cotizarAbecedarioDesdeVariante('abecedario-bronce-completo', 'Completo · Arial · 2mm')
    ).toBeNull();
  });

  it('usa el precio del catálogo para accesorios', () => {
    const accessory = getAccessoryBySlug('mango-de-golpe')!;
    const item: CartItem = {
      ...base,
      id: 'mango',
      collection: 'Accesorios',
      designSlug: 'mango-de-golpe',
      variantSize: 'Único',
    };
    const result = computeCheckoutPricing([item], null);
    expect(result.openpaySubtotal).toBe(getAccessoryLinkPrice(accessory));
  });

  it('no cobra variantes agotadas ni accesorios desconocidos', () => {
    const agotado: CartItem = {
      ...base,
      id: 'cal',
      collection: 'Accesorios',
      designSlug: 'calentador-electrico',
      variantSize: 'Con regulador',
    };
    const inventado: CartItem = {
      ...base,
      id: 'x',
      collection: 'Accesorios',
      designSlug: 'accesorio-inventado',
      variantSize: 'Único',
    };
    const result = computeCheckoutPricing([agotado, inventado], null);
    expect(result.linkItems).toHaveLength(0);
    expect(result.unpricedItems).toHaveLength(2);
  });

  it('no cobra un sello que no se puede cotizar', () => {
    const sello: CartItem = {
      ...base,
      id: 'sello',
      collection: 'Personalizado',
      designSlug: 'personalizado-1',
      variantSize: '40x40mm',
    };
    const result = computeCheckoutPricing([sello], null);
    expect(result.unpricedItems).toHaveLength(1);
    expect(result.openpaySubtotal).toBe(0);
  });

  it('internacional re-cotiza aunque el carrito traiga precio local', () => {
    const item: CartItem = {
      ...base,
      id: 'mango',
      collection: 'Accesorios',
      designSlug: 'mango-de-golpe',
      variantSize: 'Único',
      price: 1,
      market: 'mx',
      currency: 'MXN',
    };
    const result = computeMarketCheckoutPricing([item], null, 'mx');
    expect(result.marketItems[0].price).toBeGreaterThan(1);
  });
});
