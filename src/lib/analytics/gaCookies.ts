/**
 * Lee del request las cookies de Google Analytics 4 para guardar en la orden
 * quién compró (client_id) y en qué sesión (session_id). Alcohn AI las usa al
 * confirmar el pago para mandar el `purchase` a GA4 por Measurement Protocol,
 * así la venta queda atribuida al canal por el que llegó la persona.
 */

/** Stream web de GA4 (G-6KPY518GPC) → cookie `_ga_6KPY518GPC`. */
const GA4_STREAM_COOKIE = '_ga_6KPY518GPC';

function readCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rest] = part.split('=');
    if (rawKey?.trim() === name) {
      const value = rest.join('=').trim();
      return value ? decodeURIComponent(value) : null;
    }
  }
  return null;
}

/** `_ga` = "GA1.1.<random>.<timestamp>" → client_id "<random>.<timestamp>". */
function parseClientId(gaCookie: string | null): string | null {
  if (!gaCookie) return null;
  const match = /^GA\d+\.\d+\.(\d+\.\d+)$/.exec(gaCookie);
  return match ? match[1] : null;
}

/**
 * `_ga_<stream>`: formato nuevo "GS2.1.s<session_id>$o…" o viejo
 * "GS1.1.<session_id>.<n>…".
 */
function parseSessionId(streamCookie: string | null): string | null {
  if (!streamCookie) return null;
  const gs2 = /^GS2\.\d+\.s(\d+)/.exec(streamCookie);
  if (gs2) return gs2[1];
  const gs1 = /^GS1\.\d+\.(\d+)\./.exec(streamCookie);
  return gs1 ? gs1[1] : null;
}

export function readGaIdsFromRequest(
  req: Request
): { ga_client_id?: string; ga_session_id?: string } {
  const cookieHeader = req.headers.get('cookie') ?? '';
  if (!cookieHeader) return {};
  const clientId = parseClientId(readCookie(cookieHeader, '_ga'));
  const sessionId = parseSessionId(readCookie(cookieHeader, GA4_STREAM_COOKIE));
  return {
    ...(clientId ? { ga_client_id: clientId } : {}),
    ...(sessionId ? { ga_session_id: sessionId } : {}),
  };
}
