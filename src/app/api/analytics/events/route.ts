import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AnalyticsBody {
  eventName?: unknown;
  pagePath?: unknown;
  pageUrl?: unknown;
  referrer?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmTerm?: unknown;
  utmContent?: unknown;
  visitorId?: unknown;
  sessionId?: unknown;
  metadata?: unknown;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function getClientIp(req: Request): string | null {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip');
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase no configurado en el servidor' },
      { status: 500 }
    );
  }

  let body: AnalyticsBody;
  try {
    body = (await request.json()) as AnalyticsBody;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const eventName = asNonEmptyString(body.eventName);
  const pagePath = asNonEmptyString(body.pagePath);

  if (!eventName || !pagePath) {
    return NextResponse.json(
      { error: 'eventName y pagePath son obligatorios' },
      { status: 400 }
    );
  }

  if (eventName.length > 80 || pagePath.length > 300) {
    return NextResponse.json(
      { error: 'eventName o pagePath exceden largo permitido' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const userAgent = request.headers.get('user-agent');
  const clientIp = getClientIp(request);

  const { error } = await supabase.from('web_analytics_events').insert({
    event_name: eventName,
    page_path: pagePath,
    page_url: asNullableString(body.pageUrl),
    referrer: asNullableString(body.referrer),
    utm_source: asNullableString(body.utmSource),
    utm_medium: asNullableString(body.utmMedium),
    utm_campaign: asNullableString(body.utmCampaign),
    utm_term: asNullableString(body.utmTerm),
    utm_content: asNullableString(body.utmContent),
    visitor_id: asNullableString(body.visitorId),
    session_id: asNullableString(body.sessionId),
    metadata: sanitizeMetadata(body.metadata),
    ip: clientIp,
    user_agent: userAgent,
  });

  if (error) {
    return NextResponse.json(
      { error: 'No se pudo guardar el evento', detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
