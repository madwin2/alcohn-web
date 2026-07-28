/**
 * POST /api/orders/[id]/confirmar-pago
 *
 * Opción A: inserta los `sellos` desde `ordenes.carrito_json` y marca la orden
 * como pagada (`estado_pago_web='pagado'`, `estado_orden='Señado'`).
 *
 * Usar también al validar transferencias web: si la orden ya está `pagado` pero
 * faltan filas respecto al carrito (p. ej. solo se materializó el sello), completa
 * los ítems faltantes (accesorios) sin duplicar los existentes.
 *
 * Idempotente: reclama el pago con un UPDATE atómico para evitar sellos duplicados
 * si el navegador llama dos veces (React Strict Mode / refresh).
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';
import {
  buildSellosInsertsFromCart,
  enrichCartItemsWithItemType,
  resolveItemType,
  type CartLineForDb,
} from '@/lib/supabase/sellosFromCart';
import { publishMockupLogoToBaseBucket } from '@/lib/supabase/publishMockupToBase';
import type { CartItem } from '@/lib/cart';
import type { SelloItemType } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function isCartItem(x: unknown): x is CartItem {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.title === 'string' &&
    typeof o.price === 'number' &&
    typeof o.qty === 'number' &&
    typeof o.designSlug === 'string'
  );
}

function readEnvioCosto(notasWeb: unknown): number {
  if (!notasWeb || typeof notasWeb !== 'object') return 0;
  const n = (notasWeb as { envio_costo?: unknown }).envio_costo;
  const v = typeof n === 'number' ? n : typeof n === 'string' ? Number(n) : 0;
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function cartLineKey(item: CartLineForDb): string {
  return `${resolveItemType(item)}::${item.designSlug}::${item.id}`;
}

function existingSelloKey(row: {
  item_type: string | null;
  item_config: unknown;
  mockup_solicitud_id: string | null;
}): string | null {
  const cfg =
    row.item_config && typeof row.item_config === 'object'
      ? (row.item_config as Record<string, unknown>)
      : {};
  const slug = typeof cfg.design_slug === 'string' ? cfg.design_slug : '';
  const cartId = typeof cfg.cart_item_id === 'string' ? cfg.cart_item_id : '';
  const type = (row.item_type || 'SELLO') as string;
  if (slug || cartId) return `${type}::${slug}::${cartId}`;
  // Accesorios creados a mano en la app suelen no tener config: dedupe por tipo.
  if (type !== 'SELLO' && type !== 'ABECEDARIO') return `${type}::*::*`;
  return null;
}

interface RouteContext {
  params: { id: string };
}

type OrdenRow = {
  id: string;
  estado_pago_web: string | null;
  carrito_json: unknown;
  mockup_solicitud_id: string | null;
  notas_web: unknown;
};

export async function POST(_req: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: claimed, error: claimErr } = await supabase
    .from('ordenes')
    .update({
      estado_pago_web: 'pagado',
      estado_orden: 'Señado',
      pago_confirmado_at: now,
    } as never)
    .eq('id', params.id)
    .neq('estado_pago_web', 'pagado')
    .select('id, estado_pago_web, carrito_json, mockup_solicitud_id, notas_web')
    .maybeSingle();

  if (claimErr) {
    return NextResponse.json({ error: claimErr.message }, { status: 500 });
  }

  let orden: OrdenRow | null = claimed as OrdenRow | null;
  let completingMissing = false;

  if (!orden) {
    const { data: existing, error: exErr } = await supabase
      .from('ordenes')
      .select('id, estado_pago_web, carrito_json, mockup_solicitud_id, notas_web')
      .eq('id', params.id)
      .maybeSingle();

    if (exErr) {
      return NextResponse.json({ error: exErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }
    orden = existing as OrdenRow;

    const { data: existingSellos, error: existingErr } = await supabase
      .from('sellos')
      .select('id, item_type, item_config, mockup_solicitud_id')
      .eq('orden_id', params.id);

    if (existingErr) {
      return NextResponse.json({ error: existingErr.message }, { status: 500 });
    }

    if (existingSellos && existingSellos.length > 0) {
      completingMissing = true;
      // Continúa abajo: insertará solo líneas del carrito que aún no existen,
      // y rellena accesorios incompletos (sin diseño / sin item_config).
    }
    // Si ya está pagado y no hay sellos, seguimos e insertamos todo el carrito.
  }

  const rawItems = orden.carrito_json;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return NextResponse.json(
      { error: 'La orden no tiene carrito_json para crear sellos' },
      { status: 400 }
    );
  }

  const items: CartItem[] = [];
  for (const row of rawItems) {
    if (!isCartItem(row)) {
      return NextResponse.json({ error: 'carrito_json corrupto' }, { status: 400 });
    }
    items.push(row as CartItem);
  }

  const enrichedItems = enrichCartItemsWithItemType(items);
  const envioCosto = completingMissing ? 0 : readEnvioCosto(orden.notas_web);

  let sellosToInsert = buildSellosInsertsFromCart(params.id, enrichedItems, {
    mockup_solicitud_id: orden.mockup_solicitud_id,
    envio_costo: envioCosto,
  });

  let patchedIncomplete = 0;

  if (completingMissing) {
    const { data: existingSellos, error: existingErr } = await supabase
      .from('sellos')
      .select('id, item_type, diseno, item_config, mockup_solicitud_id, largo_real, ancho_real')
      .eq('orden_id', params.id);

    if (existingErr) {
      return NextResponse.json({ error: existingErr.message }, { status: 500 });
    }

    const expectedByType = new Map<SelloItemType, ReturnType<typeof buildSellosInsertsFromCart>[number]>();
    for (const row of buildSellosInsertsFromCart(params.id, enrichedItems, {
      mockup_solicitud_id: orden.mockup_solicitud_id,
      envio_costo: 0,
    })) {
      if (row.item_type) expectedByType.set(row.item_type, row);
    }

    // Rellenar accesorios ya creados pero incompletos (diseno vacío / sin config).
    for (const s of existingSellos ?? []) {
      const type = (s.item_type || 'SELLO') as SelloItemType;
      if (type === 'SELLO' || type === 'ABECEDARIO') continue;
      const expected = expectedByType.get(type);
      if (!expected) continue;

      const cfg =
        s.item_config && typeof s.item_config === 'object'
          ? (s.item_config as Record<string, unknown>)
          : {};
      const incomplete =
        !s.diseno ||
        String(s.diseno).trim() === '' ||
        Object.keys(cfg).length === 0 ||
        s.largo_real === 0.1 ||
        s.ancho_real === 0.1;

      if (!incomplete) continue;

      const { error: patchErr } = await supabase
        .from('sellos')
        .update({
          diseno: expected.diseno,
          nota: expected.nota,
          item_config: expected.item_config,
          largo_real: null,
          ancho_real: null,
          valor: expected.valor,
        } as never)
        .eq('id', s.id);

      if (!patchErr) patchedIncomplete += 1;
    }

    const taken = new Set<string>();
    for (const s of existingSellos ?? []) {
      const key = existingSelloKey(s as {
        item_type: string | null;
        item_config: unknown;
        mockup_solicitud_id: string | null;
      });
      if (key) taken.add(key);
      const t = (s as { item_type?: string | null }).item_type;
      if (t && t !== 'SELLO' && t !== 'ABECEDARIO') {
        taken.add(`${t}::*::*`);
      }
    }

    const pendingItems = enrichedItems.filter((item) => {
      const type = resolveItemType(item);
      const full = cartLineKey(item);
      const byType = `${type}::*::*`;
      if (taken.has(full)) return false;
      if (type !== 'SELLO' && type !== 'ABECEDARIO' && taken.has(byType)) return false;
      return true;
    });

    if (pendingItems.length === 0) {
      return NextResponse.json({
        ok: true,
        already_paid: true,
        sellos_existed: true,
        patched_incomplete: patchedIncomplete,
      });
    }

    sellosToInsert = buildSellosInsertsFromCart(params.id, pendingItems, {
      mockup_solicitud_id: orden.mockup_solicitud_id,
      envio_costo: 0,
    });
  }

  if (sellosToInsert.length === 0) {
    return NextResponse.json(
      { error: 'No hay ítems de sello en el carrito' },
      { status: 400 }
    );
  }

  const { data: insertedSellos, error: insErr } = await supabase
    .from('sellos')
    .insert(sellosToInsert as never)
    .select('id, mockup_solicitud_id, item_type');

  if (insErr) {
    if (insErr.code === '23505') {
      return NextResponse.json({ ok: true, sellos_existed: true });
    }
    return NextResponse.json(
      { error: 'No se pudieron crear los sellos', detail: insErr.message },
      { status: 500 }
    );
  }

  const mockupId = orden.mockup_solicitud_id;
  if (mockupId && insertedSellos?.length && !completingMissing) {
    const published = await publishMockupLogoToBaseBucket(supabase, mockupId, params.id);
    if (published) {
      const target = (insertedSellos as { id: string; mockup_solicitud_id: string | null }[]).find(
        (s) => s.mockup_solicitud_id === mockupId
      );
      if (target) {
        await supabase
          .from('sellos')
          .update({ archivo_base: published.path } as never)
          .eq('id', target.id);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    sellos_created: sellosToInsert.length,
    completed_missing: completingMissing,
    patched_incomplete: patchedIncomplete,
    item_types: sellosToInsert.map((s) => s.item_type as SelloItemType),
    envio_incluido_en_valor: envioCosto > 0,
    archivo_base_publicado: Boolean(mockupId) && !completingMissing,
  });
}
