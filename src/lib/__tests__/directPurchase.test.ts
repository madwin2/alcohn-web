import { describe, expect, it } from 'vitest';
import type { CartItem } from '@/lib/cart';
import { estimateTransferSubtotal } from '@/lib/cart';
import type { CotizadorCatalog } from '@/lib/cotizador/types';
import { computeCheckoutPricing } from '@/lib/checkout/pricing';
import {
  FREE_SHIPPING_MIN_STAMPS,
  countStampUnits,
  qualifiesForFreeShipping,
  stampsMissingForFreeShipping,
} from '@/lib/shipping/freeShipping';
import {
  formatMeasureCm,
  resolveCartLineCategory,
  stampCategoryFromVariantLabel,
  stampCategoryVariantLabel,
} from '@/lib/stampSizeCategories';
import { buildSellosInsertsFromCart } from '@/lib/supabase/sellosFromCart';
import { parseCartItemsFromBody } from '@/lib/supabase/cartItems';
import { getWizardAddonSuggestion } from '@/lib/wizardAddons';
import { getCartAddonSuggestion } from '@/lib/cartAddonSuggestion';
import { pendingLogoStampsFromCart, pendingLogoWhatsappUrl } from '@/lib/pendingLogo';

const catalog: CotizadorCatalog = {
  catalogUserId: 'test',
  precioPorGrupo: { chicos: 76000, medianos: 91500, grandes: 113000, xl: 150000 },
  medidaAGrupo: {},
  precioFijoPorMedida: {},
  medidaGrupoFilas: [],
  medidaFijaFilas: [],
};

function categoryLine(
  category: 'chico' | 'mediano' | 'grande',
  overrides: Partial<CartItem> = {}
): CartItem {
  return {
    id: `personalizado-para-madera-${category}`,
    title: `Sello para madera · ${category}`,
    collection: 'Personalizado',
    material: 'Bronce',
    process: 'CNC',
    variantSize: stampCategoryVariantLabel(category),
    price: 1, // el navegador puede mandar cualquier cosa
    qty: 1,
    image: '/x.webp',
    designSlug: 'personalizado-para-madera',
    sizeCategory: category,
    usoSlug: 'para-madera',
    logoStatus: 'pendiente',
    ...overrides,
  };
}

const accessory = (slug: string, qty = 1): CartItem => ({
  id: `${slug}-Único`,
  title: slug,
  collection: 'Accesorios',
  material: 'Accesorio',
  process: '—',
  variantSize: 'Único',
  price: 1000,
  qty,
  image: '/a.png',
  designSlug: slug,
});

describe('compra por tamaño desde la ficha', () => {
  it('el texto de la variante ida y vuelta da la misma categoría', () => {
    for (const key of ['chico', 'mediano', 'grande'] as const) {
      expect(stampCategoryFromVariantLabel(stampCategoryVariantLabel(key))).toBe(key);
    }
    expect(stampCategoryFromVariantLabel('30x20mm')).toBeNull();
  });

  it('reconoce la categoría aunque el carrito llegue sin `sizeCategory`', () => {
    const line = categoryLine('grande', { sizeCategory: undefined });
    expect(resolveCartLineCategory(line)?.grupo).toBe('grandes');
  });

  it('el servidor cotiza por grupo e ignora el precio del navegador', () => {
    const result = computeCheckoutPricing(
      [categoryLine('chico'), categoryLine('mediano', { qty: 2 })],
      catalog
    );
    expect(result.unpricedItems).toHaveLength(0);
    expect(result.transferSubtotal).toBe(76000 + 91500 * 2);
    expect(result.linkItems[0].price).toBe(87400);
  });

  it('el pedido guarda la categoría, el uso y el logo pendiente, sin medida inventada', () => {
    const [row] = buildSellosInsertsFromCart('orden-1', [categoryLine('mediano')]);
    expect(row.largo_real).toBeNull();
    expect(row.ancho_real).toBeNull();
    expect(row.nota).toContain('Logo pendiente');
    expect(row.item_config).toMatchObject({
      size_category: 'mediano',
      grupo_precio: 'medianos',
      uso_slug: 'para-madera',
      logo_status: 'pendiente',
    });
  });

  it('cada sello lleva su propia muestra si la tiene', () => {
    const mid = '11111111-2222-3333-4444-555555555555';
    const rows = buildSellosInsertsFromCart(
      'orden-1',
      [categoryLine('chico', { mockupSolicitudId: mid, logoStatus: 'subido' }), categoryLine('grande')],
      { mockup_solicitud_id: '99999999-2222-3333-4444-555555555555' }
    );
    expect(rows[0].mockup_solicitud_id).toBe(mid);
    expect(rows[1].mockup_solicitud_id).toBe('99999999-2222-3333-4444-555555555555');
  });

  it('el parser del checkout conserva los campos nuevos y descarta valores inválidos', () => {
    const parsed = parseCartItemsFromBody([
      { ...categoryLine('chico'), mockupSolicitudId: 'no-es-uuid', usoSlug: 'x y z' },
    ]);
    expect(parsed?.[0]).toMatchObject({ sizeCategory: 'chico', logoStatus: 'pendiente' });
    expect(parsed?.[0].mockupSolicitudId).toBeUndefined();
    expect(parsed?.[0].usoSlug).toBeUndefined();
  });

  it('formatea medidas en cm con coma', () => {
    expect(formatMeasureCm(2.5, 2.5)).toBe('2,5 × 2,5 cm');
    expect(formatMeasureCm(8, 1)).toBe('8 × 1 cm');
  });
});

describe('envío gratis desde 3 sellos', () => {
  it('cuenta unidades de sellos y no accesorios', () => {
    const items = [categoryLine('chico', { qty: 2 }), accessory('calentador-electrico', 3)];
    expect(countStampUnits(items)).toBe(2);
    expect(stampsMissingForFreeShipping(items)).toBe(1);
    expect(qualifiesForFreeShipping(items)).toBe(false);
  });

  it('con 3 sellos es gratis en Argentina y no afuera', () => {
    const items = [categoryLine('chico', { qty: 2 }), categoryLine('grande')];
    expect(countStampUnits(items)).toBe(FREE_SHIPPING_MIN_STAMPS);
    expect(qualifiesForFreeShipping(items, 'ar')).toBe(true);
    expect(qualifiesForFreeShipping(items, 'mx')).toBe(false);
  });

  it('el subtotal por transferencia es 15% menos que con tarjeta', () => {
    expect(estimateTransferSubtotal([{ price: 87400, qty: 2 }])).toBe(152000);
  });
});

describe('accesorio sugerido según el uso', () => {
  it('pan y fruta → soldador; hielo → nada', () => {
    expect(getWizardAddonSuggestion('alimentos', null, 'para-pan')?.primary).toBe('calentador-electrico');
    expect(getWizardAddonSuggestion('alimentos', null, 'para-fruta')?.primary).toBe('calentador-electrico');
    expect(getWizardAddonSuggestion('alimentos', null, 'para-hielo')).toBeNull();
    expect(getWizardAddonSuggestion('madera', null, 'para-madera')?.primary).toBe('calentador-electrico');
  });

  it('en el panel no repite un accesorio que ya está en el carrito', () => {
    const line = categoryLine('chico', { usoSlug: 'para-pan', designSlug: 'personalizado-para-pan', id: 'p' });
    expect(getCartAddonSuggestion([line], 'p')?.accessory.slug).toBe('calentador-electrico');
    expect(getCartAddonSuggestion([line, accessory('calentador-electrico')], 'p')).toBeNull();
  });

  it('en cuero con sello grande sugiere la base para remachadora', () => {
    const line = categoryLine('grande', { usoSlug: 'para-cuero', id: 'c' });
    expect(getCartAddonSuggestion([line], 'c')?.accessory.slug).toBe('base-aluminio-remachadora');
  });
});

describe('logo pendiente', () => {
  it('lista solo los sellos sin logo y arma el WhatsApp con el pedido', () => {
    const stamps = pendingLogoStampsFromCart([
      categoryLine('chico', { qty: 3 }),
      categoryLine('grande', { logoStatus: 'subido' }),
    ]);
    expect(stamps).toEqual(['3× Sello para madera · chico']);
    const url = pendingLogoWhatsappUrl('orden-123', stamps);
    expect(url).toContain('https://wa.me/');
    expect(decodeURIComponent(url)).toContain('orden-123');
  });
});
