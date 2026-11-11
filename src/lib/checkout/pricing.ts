import type { CartItem } from '@/lib/cart';
import {
  getAccessoryBySlug,
  getAccessoryLinkPrice,
  getAccessoryTransferPrice,
} from '@/data/accessories';
import { cotizarAbecedarioDesdeVariante } from '@/lib/abecedarioConfigurator';
import { cotizarRectangular, type CotizadorCatalog } from '@/lib/cotizador';
import { cotizarGrupo } from '@/lib/cotizador/quote';
import { resolveCartLineCategory } from '@/lib/stampSizeCategories';
import { getMarketConfig } from '@/lib/markets/config';
import { convertTransferArsToMarketPrice } from '@/lib/markets/pricing';
import type { MarketCode } from '@/lib/markets/types';
import { isNonSelloCartLine, parseVariantSizeToCm } from '@/lib/supabase/sellosFromCart';

function isAccessoryCartLine(item: CartItem): boolean {
  const collection = item.collection?.toLowerCase() ?? '';
  const size = item.variantSize.toLowerCase();
  return collection === 'accesorios' || size === 'único' || size === 'unico';
}

function isAbecedarioCartLine(item: CartItem): boolean {
  return (
    item.designSlug.toLowerCase().includes('abecedario') ||
    (item.collection?.toLowerCase() ?? '').includes('abecedario')
  );
}

function sumCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/**
 * Precio de una línea calculado SOLO con datos del servidor (catálogo de accesorios,
 * cotizador, tabla de abecedarios). Nunca usa `item.price`, que viene del navegador
 * y se puede editar. Devuelve null si la línea no se puede cotizar.
 */
function resolveLinePrices(
  item: CartItem,
  catalog: CotizadorCatalog | null
): { link: number; transfer: number } | null {
  const accessory = getAccessoryBySlug(item.designSlug);
  if (accessory) {
    if (accessory.variants?.length) {
      const variant =
        accessory.variants.find((v) => v.label === item.variantSize) ??
        (isAccessoryCartLine(item) ? accessory.variants.find((v) => !v.outOfStock) : undefined);
      if (!variant || variant.outOfStock || variant.linkPrice <= 0) return null;
      return { link: variant.linkPrice, transfer: variant.transferPrice };
    }
    return {
      link: getAccessoryLinkPrice(accessory),
      transfer: getAccessoryTransferPrice(accessory),
    };
  }

  if (isAccessoryCartLine(item)) return null;

  if (isAbecedarioCartLine(item)) {
    return cotizarAbecedarioDesdeVariante(item.designSlug, item.variantSize);
  }

  if (!catalog) return null;

  // Compra por tamaño desde la ficha: precio del grupo (la medida exacta se define con el logo).
  const category = resolveCartLineCategory(item);
  if (category) {
    const precio = cotizarGrupo(catalog, category.grupo);
    if (!precio) return null;
    return { link: precio.link, transfer: precio.transferencia };
  }

  const dims = parseVariantSizeToCm(item.variantSize);
  if (dims.ancho_real == null || dims.largo_real == null) return null;
  const quote = cotizarRectangular(catalog, dims.ancho_real, dims.largo_real);
  if (!quote) return null;
  return {
    link: quote.precio_link_ars,
    transfer: quote.precio_transferencia_ars,
  };
}

export interface CheckoutPricing {
  openpaySubtotal: number;
  transferSubtotal: number;
  linkItems: CartItem[];
  transferItems: CartItem[];
  /** Líneas que el servidor no pudo cotizar: el checkout no debe cobrarlas. */
  unpricedItems: CartItem[];
}

export interface MarketCheckoutPricing {
  market: MarketCode;
  currency: string;
  marketSubtotal: number;
  marketItems: CartItem[];
  unpricedItems: CartItem[];
}

export function computeMarketCheckoutPricing(
  items: CartItem[],
  catalog: CotizadorCatalog | null,
  market: MarketCode
): MarketCheckoutPricing {
  const currency = getMarketConfig(market).currency;

  // Siempre se re-cotiza en el servidor: el precio local que trae el carrito es solo de muestra.
  const base = computeCheckoutPricing(items, catalog);
  const sourceItems = market === 'ar' ? base.linkItems : base.transferItems;

  const marketItems = sourceItems.map((item) => {
    const price =
      market === 'ar'
        ? item.price
        : convertTransferArsToMarketPrice(item.price, market);
    return { ...item, price, market, currency };
  });

  return {
    market,
    currency,
    marketItems,
    marketSubtotal: marketItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    unpricedItems: base.unpricedItems,
  };
}

export function computeCheckoutPricing(
  items: CartItem[],
  catalog: CotizadorCatalog | null
): CheckoutPricing {
  const productItems = items.filter((item) => !isNonSelloCartLine(item));
  const linkItems: CartItem[] = [];
  const transferItems: CartItem[] = [];
  const unpricedItems: CartItem[] = [];

  for (const item of productItems) {
    const prices = resolveLinePrices(item, catalog);
    if (!prices) {
      unpricedItems.push(item);
      continue;
    }
    linkItems.push({ ...item, price: prices.link });
    transferItems.push({ ...item, price: prices.transfer });
  }

  return {
    openpaySubtotal: sumCartSubtotal(linkItems),
    transferSubtotal: sumCartSubtotal(transferItems),
    linkItems,
    transferItems,
    unpricedItems,
  };
}
