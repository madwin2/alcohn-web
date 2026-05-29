/**
 * Openpay Argentina (BBVA / GeoPagos): OAuth client_credentials + Checkout Orders API.
 * Documentación: https://developers.openpayargentina.com.ar/
 * Montos en la API: unidad menor ARS (centavos), moneda ISO numérica "032".
 */

const CURRENCY_ARS = '032';

export type OpenpayEnv = 'development' | 'production';

export interface OpenpayCartLine {
  id: string;
  title: string;
  price: number;
  qty: number;
}

function getEndpoints(env: OpenpayEnv) {
  const authOverride = process.env.OPENPAY_AUTH_BASE_URL?.trim().replace(/\/$/, '');
  const checkoutOverride = process.env.OPENPAY_CHECKOUT_API_BASE_URL?.trim().replace(/\/$/, '');

  if (env === 'production') {
    return {
      authBase: authOverride || 'https://auth.geopagos.com',
      checkoutApiBase: checkoutOverride || 'https://api.openpayargentina.com.ar',
    };
  }
  return {
    authBase: authOverride || 'https://auth.preprod.geopagos.com',
    checkoutApiBase: checkoutOverride || 'https://api-mpos-openpay-ar.stg.geopagos.io',
  };
}

/**
 * Por defecto **production**: el auth de sandbox documentado (`auth.preprod.geopagos.com/oauth/token`)
 * devuelve 404; las credenciales del panel BBVA/Openpay suelen ser de producción.
 * Forzar sandbox: `OPENPAY_ENV=development` (y si Openpay indica otra URL de auth, `OPENPAY_AUTH_BASE_URL`).
 */
export function getOpenpayEnv(): OpenpayEnv {
  const v = process.env.OPENPAY_ENV?.trim().toLowerCase();
  if (v === 'development' || v === 'staging' || v === 'sandbox') return 'development';
  return 'production';
}

function getOpenpayCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId =
    process.env.OPENPAY_CLIENT_ID?.trim() || process.env.CLIENT_ID?.trim();
  const clientSecret =
    process.env.OPENPAY_CLIENT_SECRET?.trim() || process.env.CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

/** Pesos ARS (enteros o decimales) → centavos para la API */
export function arsToMinorUnits(ars: number): number {
  return Math.round(ars * 100);
}

/**
 * Origen absoluto del sitio (sin barra final).
 * Openpay exige URLs https en producción; con `http://localhost` la pasarela
 * suele armar mal el redirect (`https://http/localhost:3000/...`).
 * Para pruebas locales: `OPENPAY_REDIRECT_BASE_URL` con un túnel HTTPS (ngrok, etc.).
 */
export function getSiteBaseUrl(): string {
  const openpayOverride = process.env.OPENPAY_REDIRECT_BASE_URL?.trim();
  if (openpayOverride) return normalizeSiteOrigin(openpayOverride);

  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return normalizeSiteOrigin(explicit);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${host}`;
  }

  return 'http://127.0.0.1:3000';
}

function normalizeSiteOrigin(raw: string): string {
  let value = raw.trim().replace(/\/$/, '');
  if (!value) return 'http://127.0.0.1:3000';

  if (!/^https?:\/\//i.test(value)) {
    const isLocal =
      value.startsWith('localhost') ||
      value.startsWith('127.0.0.1') ||
      value.includes(':3000');
    value = isLocal ? `http://${value}` : `https://${value}`;
  }

  try {
    const url = new URL(value.includes('://') ? value : `http://${value}`);
    return url.origin;
  } catch {
    return 'http://127.0.0.1:3000';
  }
}

/** URLs de retorno post-pago (Openpay redirect_urls). */
export function buildOpenpayRedirectUrls(ordenId?: string): {
  success: string;
  failed: string;
} {
  const base = getSiteBaseUrl();
  const q = ordenId ? `?orden_id=${encodeURIComponent(ordenId)}` : '';
  return {
    success: `${base}/checkout/openpay/success${q}`,
    failed: `${base}/checkout/openpay/failed${q}`,
  };
}

async function fetchAccessToken(env: OpenpayEnv): Promise<string> {
  const creds = getOpenpayCredentials();
  if (!creds) {
    throw new Error('OPENPAY_CLIENT_ID y OPENPAY_CLIENT_SECRET no están configurados');
  }
  const { authBase } = getEndpoints(env);
  const res = await fetch(`${authBase}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      scope: '*',
    }),
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    if (res.status === 404 && env === 'development') {
      throw new Error(
        'Openpay auth devolvió 404 (HTML o texto plano). El host de sandbox suele estar mal en la doc: probá OPENPAY_ENV=production en .env o pedí a Openpay la URL actual de token.'
      );
    }
    throw new Error(`Openpay auth: respuesta no JSON (${res.status})`);
  }
  if (!res.ok) {
    const msg =
      typeof json === 'object' && json !== null && 'error_description' in json
        ? String((json as { error_description?: string }).error_description)
        : text.slice(0, 200);
    throw new Error(`Openpay auth falló (${res.status}): ${msg}`);
  }
  const token = (json as { access_token?: string }).access_token;
  if (!token) throw new Error('Openpay auth: sin access_token');
  return token;
}

function readCheckoutFromLinks(links: unknown): string | null {
  if (!links) return null;
  if (typeof links === 'string') return null;
  if (Array.isArray(links)) {
    for (const entry of links) {
      if (entry && typeof entry === 'object' && 'checkout' in entry) {
        const c = (entry as { checkout?: unknown }).checkout;
        if (typeof c === 'string' && c.length > 0) return c;
      }
    }
    return null;
  }
  if (typeof links === 'object' && 'checkout' in links) {
    const c = (links as { checkout?: unknown }).checkout;
    return typeof c === 'string' && c.length > 0 ? c : null;
  }
  return null;
}

/** La API devuelve `links.checkout` en distintos sitios según versión (objeto, array, o dentro de `attributes`). */
function extractCheckoutUrl(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const root = body as {
    data?: {
      links?: unknown;
      attributes?: { links?: unknown };
    };
  };
  const data = root.data;
  if (!data) return null;

  const fromTop = readCheckoutFromLinks(data.links);
  if (fromTop) return fromTop;

  const attrs = data.attributes;
  if (attrs && typeof attrs === 'object' && 'links' in attrs) {
    const fromAttrs = readCheckoutFromLinks((attrs as { links?: unknown }).links);
    if (fromAttrs) return fromAttrs;
  }

  return null;
}

function absolutizeCheckoutUrl(url: string, checkoutApiBase: string): string {
  const base = checkoutApiBase.replace(/\/$/, '');
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url.replace(/^\//, '')}`;
}

export interface CreateOpenpayCheckoutInput {
  lines: OpenpayCartLine[];
  /** Si viene de Supabase, se agrega a las URLs de redirect para callbacks. */
  ordenId?: string;
}

export interface CreateOpenpayCheckoutResult {
  checkoutUrl: string;
  rawOrder?: unknown;
}

export async function createOpenpayCheckoutOrder(
  input: CreateOpenpayCheckoutInput
): Promise<CreateOpenpayCheckoutResult> {
  const env = getOpenpayEnv();
  const token = await fetchAccessToken(env);
  const { checkoutApiBase } = getEndpoints(env);
  const redirectUrls = buildOpenpayRedirectUrls(input.ordenId);
  if (
    process.env.NODE_ENV === 'development' &&
    redirectUrls.success.startsWith('http://')
  ) {
    console.warn(
      '[openpay] redirect_urls usan HTTP. Si Openpay te manda a https://http/localhost…, ' +
        'definí OPENPAY_REDIRECT_BASE_URL con un túnel HTTPS (ngrok) o NEXT_PUBLIC_SITE_URL=https://tu-dominio'
    );
    console.warn('[openpay] success URL enviada:', redirectUrls.success);
  }

  const items = input.lines.map((line, index) => ({
    id: index + 1,
    name: line.title.slice(0, 120) || `Ítem ${index + 1}`,
    unitPrice: {
      currency: CURRENCY_ARS,
      amount: arsToMinorUnits(line.price),
    },
    quantity: Math.max(1, Math.floor(line.qty)),
  }));

  const attributes: Record<string, unknown> = {
    currency: CURRENCY_ARS,
    items,
    redirect_urls: redirectUrls,
  };

  const res = await fetch(`${checkoutApiBase}/api/v2/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: { attributes } }),
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Openpay orders: respuesta no JSON (${res.status})`);
  }

  if (!res.ok) {
    const errObj = json as { errors?: Array<{ detail?: string; title?: string }> };
    const detail = errObj.errors?.[0]?.detail || errObj.errors?.[0]?.title || text.slice(0, 300);
    throw new Error(`Openpay crear orden falló (${res.status}): ${detail}`);
  }

  let checkoutUrl = extractCheckoutUrl(json);
  if (!checkoutUrl) {
    const preview =
      typeof json === 'object' && json !== null
        ? JSON.stringify(json).slice(0, 900)
        : String(json);
    console.warn('[openpay] respuesta crear orden sin checkout URL:', preview);
    throw new Error('Openpay: la respuesta no incluye links.checkout');
  }
  checkoutUrl = absolutizeCheckoutUrl(checkoutUrl, checkoutApiBase);

  return { checkoutUrl, rawOrder: json };
}

export function sumLinesSubtotal(lines: OpenpayCartLine[]): number {
  return lines.reduce((s, l) => s + l.price * l.qty, 0);
}

/**
 * Si `OPENPAY_TEST_AMOUNT_ARS` está definido (ej. 100), Openpay cobra solo ese monto.
 * Los ítems reales del carrito no se envían a la pasarela; sirve para pruebas sin gastar el total.
 * Quitar la variable antes de producción.
 */
export function getOpenpayTestAmountArs(): number | null {
  const raw = process.env.OPENPAY_TEST_AMOUNT_ARS?.trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || n > 1_000_000) return null;
  return Math.round(n);
}

/**
 * Salta la pasarela Openpay y redirige directo a /checkout/openpay/success.
 * Solo en desarrollo: `OPENPAY_SIMULATE_SUCCESS=true` + NODE_ENV !== 'production'.
 */
export function isOpenpaySimulateSuccessEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  const v = process.env.OPENPAY_SIMULATE_SUCCESS?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export function linesForOpenpayCharge(lines: OpenpayCartLine[]): OpenpayCartLine[] {
  const testAmount = getOpenpayTestAmountArs();
  if (testAmount == null) return lines;
  return [
    {
      id: 'openpay-test',
      title: 'Prueba Openpay Alcohn',
      price: testAmount,
      qty: 1,
    },
  ];
}
