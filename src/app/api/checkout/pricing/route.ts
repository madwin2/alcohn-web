import { NextResponse } from 'next/server';
import { getCotizadorCatalog } from '@/lib/cotizador';
import { computeCheckoutPricing, computeMarketCheckoutPricing } from '@/lib/checkout/pricing';
import { isMarketCode } from '@/lib/markets/config';
import type { MarketCode } from '@/lib/markets/types';
import { parseCartItemsFromBody } from '@/lib/supabase/cartItems';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { items?: unknown; market?: unknown };
  try {
    body = (await req.json()) as { items?: unknown; market?: unknown };
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const items = parseCartItemsFromBody(body.items);
  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Carrito vacío o inválido' }, { status: 400 });
  }

  const market: MarketCode =
    typeof body.market === 'string' && isMarketCode(body.market) ? body.market : 'ar';

  const catalog = await getCotizadorCatalog();
  const pricing = computeCheckoutPricing(items, catalog);
  const marketPricing = computeMarketCheckoutPricing(items, catalog, market);

  return NextResponse.json({
    openpaySubtotal: pricing.openpaySubtotal,
    transferSubtotal: pricing.transferSubtotal,
    linkLineItems: pricing.linkItems.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      qty: item.qty,
    })),
    market,
    currency: marketPricing.currency,
    marketSubtotal: marketPricing.marketSubtotal,
    marketLineItems: marketPricing.marketItems.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      qty: item.qty,
      market: item.market,
      currency: item.currency,
    })),
  });
}
