import { NextResponse } from 'next/server';
import { getCotizadorCatalog } from '@/lib/cotizador';
import { computeCheckoutPricing } from '@/lib/checkout/pricing';
import { parseCartItemsFromBody } from '@/lib/supabase/cartItems';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { items?: unknown };
  try {
    body = (await req.json()) as { items?: unknown };
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const items = parseCartItemsFromBody(body.items);
  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Carrito vacío o inválido' }, { status: 400 });
  }

  const catalog = await getCotizadorCatalog();
  const pricing = computeCheckoutPricing(items, catalog);

  return NextResponse.json({
    openpaySubtotal: pricing.openpaySubtotal,
    transferSubtotal: pricing.transferSubtotal,
    linkLineItems: pricing.linkItems.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      qty: item.qty,
    })),
  });
}
