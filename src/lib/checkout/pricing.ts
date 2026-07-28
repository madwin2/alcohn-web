import type { CartItem } from '@/lib/cart';
import {
  getAccessoryBySlug,
  getAccessoryLinkPrice,
  getAccessoryTransferPrice,
} from '@/data/accessories';
import { precioTransferencia } from '@/lib/abecedarioConfigurator';
import { cotizarRectangular, type CotizadorCatalog } from '@/lib/cotizador';
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

function resolveLinePrices(
  item: CartItem,
  catalog: CotizadorCatalog | null
): { link: number; transfer: number } {
  const accessory = getAccessoryBySlug(item.designSlug);
  if (accessory) {
    return {
      link: getAccessoryLinkPrice(accessory),
      transfer: getAccessoryTransferPrice(accessory),
    };
  }

  if (isAccessoryCartLine(item)) {
    return {
      link: item.price,
      transfer: precioTransferencia(item.price),
    };
  }

  if (isAbecedarioCartLine(item)) {
    return {
      link: item.price,
      transfer: precioTransferencia(item.price),
    };
  }

  if (catalog) {
    const dims = parseVariantSizeToCm(item.variantSize);
    if (dims.ancho_real != null && dims.largo_real != null) {
      const quote = cotizarRectangular(catalog, dims.ancho_real, dims.largo_real);
      if (quote) {
        return {
          link: quote.precio_link_ars,
          transfer: quote.precio_transferencia_ars,
        };
      }
    }
  }

  return {
    link: item.price,
    transfer: precioTransferencia(item.price),
  };
}

export interface CheckoutPricing {
  openpaySubtotal: number;
  transferSubtotal: number;
  linkItems: CartItem[];
  transferItems: CartItem[];
}

export interface MarketCheckoutPricing {
  market: MarketCode;
  currency: string;
  marketSubtotal: number;
  marketItems: CartItem[];
}

export function computeMarketCheckoutPricing(
  items: CartItem[],
  catalog: CotizadorCatalog | null,
  market: MarketCode
): MarketCheckoutPricing {
  const currency = getMarketConfig(market).currency;
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
  };
}

export function computeCheckoutPricing(
  items: CartItem[],
  catalog: CotizadorCatalog | null
): CheckoutPricing {
  const productItems = items.filter((item) => !isNonSelloCartLine(item));
  const linkItems: CartItem[] = [];
  const transferItems: CartItem[] = [];

  for (const item of productItems) {
    const { link, transfer } = resolveLinePrices(item, catalog);
    linkItems.push({ ...item, price: link });
    transferItems.push({ ...item, price: transfer });
  }

  return {
    openpaySubtotal: sumCartSubtotal(linkItems),
    transferSubtotal: sumCartSubtotal(transferItems),
    linkItems,
    transferItems,
  };
}
