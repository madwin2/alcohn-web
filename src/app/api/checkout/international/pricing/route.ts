import { NextResponse } from 'next/server';
import { computeMarketCheckoutPricing } from '@/lib/checkout/pricing';
import { getCotizadorCatalog } from '@/lib/cotizador';
import { isInternationalMarket } from '@/lib/markets/config';
import { getDhlShippingAmount } from '@/lib/shipping/international';
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

  if (typeof body.market !== 'string' || !isInternationalMarket(body.market)) {
    return NextResponse.json({ error: 'País internacional inválido' }, { status: 400 });
  }

  const items = parseCartItemsFromBody(body.items);
  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Carrito vacío o inválido' }, { status: 400 });
  }

  const catalog = await getCotizadorCatalog();
  const pricing = computeMarketCheckoutPricing(items, catalog, body.market);
  const shipping = getDhlShippingAmount(body.market);

  return NextResponse.json({
    market: body.market,
    currency: pricing.currency,
    subtotal: pricing.marketSubtotal,
    shipping,
    total: pricing.marketSubtotal + shipping,
    lineItems: pricing.marketItems.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      qty: item.qty,
      market: item.market,
      currency: item.currency,
    })),
  });
}
