# Openpay Argentina (BBVA / GeoPagos) — Generar link de pago

Guía portable para replicar la integración en otro proyecto. Documentación oficial: https://developers.openpayargentina.com.ar/

Flujo: **OAuth client_credentials → crear orden de Checkout → obtener `links.checkout` → redirigir al usuario**.

---

## 1. Credenciales y variables de entorno

Las credenciales (`client_id` / `client_secret`) las entrega el panel de BBVA/Openpay. **Nunca** exponerlas en el cliente: todas las llamadas van desde el servidor.

```bash
# Obligatorias
OPENPAY_CLIENT_ID=
OPENPAY_CLIENT_SECRET=

# Ambiente: por defecto "production". Para sandbox: development | staging | sandbox
# OPENPAY_ENV=development

# Overrides de endpoints (solo si Openpay indica otras URLs)
# OPENPAY_AUTH_BASE_URL=https://auth.prd.geopagos.io
# OPENPAY_CHECKOUT_API_BASE_URL=https://api.openpayargentina.com.ar

# URL pública del sitio, usada para armar las redirect_urls
NEXT_PUBLIC_SITE_URL=https://tudominio.com
# En local: la pasarela rompe con http://localhost. Usar túnel HTTPS (ngrok http 3000)
# OPENPAY_REDIRECT_BASE_URL=https://xxxx.ngrok-free.app

# Pruebas: cobra solo este monto en ARS (ej. 100) ignorando el carrito real
# OPENPAY_TEST_AMOUNT_ARS=100
# Dev: saltea la pasarela y va directo al success (no funciona en producción)
# OPENPAY_SIMULATE_SUCCESS=true
```

## 2. Endpoints

| Ambiente | Auth | Checkout API |
| --- | --- | --- |
| production | `https://auth.prd.geopagos.io` | `https://api.openpayargentina.com.ar` |
| development / sandbox | `https://auth.preprod.geopagos.com` | `https://api-mpos-openpay-ar.stg.geopagos.io` |

Nota importante: el auth de sandbox documentado (`auth.preprod.geopagos.com/oauth/token`) suele devolver **404**, y las credenciales del panel BBVA normalmente son de producción. Por eso el default recomendado es `production`; si necesitás sandbox, pedile a Openpay la URL vigente de token y ponela en `OPENPAY_AUTH_BASE_URL`.

## 3. Convenciones de la API

- Montos en **unidad menor** (centavos): `$1.500,00 ARS` → `150000`.
- Moneda: código **ISO numérico** `"032"` (ARS), como string.
- Content-Type y Accept: `application/vnd.api+json` (formato JSON:API).

## 4. Obtener el access token

`POST {authBase}/oauth/token`

```json
{
  "grant_type": "client_credentials",
  "client_id": "...",
  "client_secret": "...",
  "scope": "*"
}
```

Header: `Content-Type: application/json`. Respuesta: `{ "access_token": "..." , ... }`.

```ts
async function fetchAccessToken(authBase: string): Promise<string> {
  const res = await fetch(`${authBase}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.OPENPAY_CLIENT_ID,
      client_secret: process.env.OPENPAY_CLIENT_SECRET,
      scope: '*',
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Openpay auth falló (${res.status}): ${text.slice(0, 200)}`);
  const { access_token } = JSON.parse(text);
  if (!access_token) throw new Error('Openpay auth: sin access_token');
  return access_token;
}
```

## 5. Crear la orden y obtener el link de pago

`POST {checkoutApiBase}/api/v2/orders`

Headers:

```
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
Authorization: Bearer {access_token}
```

Body:

```json
{
  "data": {
    "attributes": {
      "currency": "032",
      "items": [
        {
          "id": 1,
          "name": "Sello personalizado 40x40",
          "unitPrice": { "currency": "032", "amount": 150000 },
          "quantity": 1
        }
      ],
      "redirect_urls": {
        "success": "https://tudominio.com/checkout/openpay/success?orden_id=abc",
        "failed": "https://tudominio.com/checkout/openpay/failed?orden_id=abc"
      }
    }
  }
}
```

La respuesta trae el link en `links.checkout`, pero **la ubicación varía según la versión de la API**: puede estar en `data.links.checkout`, en `data.attributes.links.checkout`, o dentro de un array de links. Conviene buscar en los tres lugares y, si la URL es relativa, prefijarla con el `checkoutApiBase`.

```ts
function readCheckoutFromLinks(links: unknown): string | null {
  if (!links || typeof links !== 'object') return null;
  if (Array.isArray(links)) {
    for (const entry of links) {
      const c = (entry as { checkout?: unknown })?.checkout;
      if (typeof c === 'string' && c) return c;
    }
    return null;
  }
  const c = (links as { checkout?: unknown }).checkout;
  return typeof c === 'string' && c ? c : null;
}

function extractCheckoutUrl(body: any): string | null {
  const data = body?.data;
  if (!data) return null;
  return readCheckoutFromLinks(data.links) ?? readCheckoutFromLinks(data.attributes?.links);
}
```

Implementación completa:

```ts
const CURRENCY_ARS = '032';

type CartLine = { id: string; title: string; price: number; qty: number };

export async function createOpenpayCheckoutOrder(lines: CartLine[], ordenId?: string) {
  const env = process.env.OPENPAY_ENV === 'development' ? 'development' : 'production';
  const authBase =
    process.env.OPENPAY_AUTH_BASE_URL ??
    (env === 'production' ? 'https://auth.prd.geopagos.io' : 'https://auth.preprod.geopagos.com');
  const checkoutApiBase =
    process.env.OPENPAY_CHECKOUT_API_BASE_URL ??
    (env === 'production'
      ? 'https://api.openpayargentina.com.ar'
      : 'https://api-mpos-openpay-ar.stg.geopagos.io');

  const token = await fetchAccessToken(authBase);

  const base = (process.env.OPENPAY_REDIRECT_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || '')
    .replace(/\/$/, '');
  const q = ordenId ? `?orden_id=${encodeURIComponent(ordenId)}` : '';

  const res = await fetch(`${checkoutApiBase}/api/v2/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          currency: CURRENCY_ARS,
          items: lines.map((line, i) => ({
            id: i + 1,
            name: line.title.slice(0, 120) || `Ítem ${i + 1}`,
            unitPrice: { currency: CURRENCY_ARS, amount: Math.round(line.price * 100) },
            quantity: Math.max(1, Math.floor(line.qty)),
          })),
          redirect_urls: {
            success: `${base}/checkout/openpay/success${q}`,
            failed: `${base}/checkout/openpay/failed${q}`,
          },
        },
      },
    }),
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const detail = json?.errors?.[0]?.detail ?? json?.errors?.[0]?.title ?? text.slice(0, 300);
    throw new Error(`Openpay crear orden falló (${res.status}): ${detail}`);
  }

  let checkoutUrl = extractCheckoutUrl(json);
  if (!checkoutUrl) throw new Error('Openpay: la respuesta no incluye links.checkout');
  if (!/^https?:\/\//i.test(checkoutUrl)) {
    checkoutUrl = `${checkoutApiBase.replace(/\/$/, '')}/${checkoutUrl.replace(/^\//, '')}`;
  }
  return { checkoutUrl, rawOrder: json };
}
```

## 6. Ejemplo con cURL

```bash
TOKEN=$(curl -s -X POST https://auth.prd.geopagos.io/oauth/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"client_credentials","client_id":"TU_ID","client_secret":"TU_SECRET","scope":"*"}' \
  | jq -r .access_token)

curl -s -X POST https://api.openpayargentina.com.ar/api/v2/orders \
  -H "Content-Type: application/vnd.api+json" \
  -H "Accept: application/vnd.api+json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"data":{"attributes":{"currency":"032","items":[{"id":1,"name":"Prueba","unitPrice":{"currency":"032","amount":10000},"quantity":1}],"redirect_urls":{"success":"https://tudominio.com/checkout/openpay/success","failed":"https://tudominio.com/checkout/openpay/failed"}}}}' | jq
```

## 7. Route handler de ejemplo (Next.js App Router)

```ts
// src/app/api/checkout/openpay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOpenpayCheckoutOrder } from '@/lib/openpayArgentina';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: 'Se requiere al menos un ítem válido' }, { status: 400 });
  }
  if (!process.env.OPENPAY_CLIENT_ID || !process.env.OPENPAY_CLIENT_SECRET) {
    return NextResponse.json({ error: 'Openpay no configurado' }, { status: 503 });
  }
  try {
    const { checkoutUrl } = await createOpenpayCheckoutOrder(items, body?.orden_id);
    return NextResponse.json({ checkoutUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    console.error('[openpay checkout]', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
```

En el front: `const { checkoutUrl } = await res.json(); window.location.href = checkoutUrl;`

Y hay que crear las dos páginas de retorno (`/checkout/openpay/success` y `/checkout/openpay/failed`), que reciben `?orden_id=` para actualizar el estado del pedido.

## 8. Validaciones recomendadas antes de llamar a la API

- Cada ítem: `price >= 0`, `1 <= qty <= 999`, `title` no vacío.
- Subtotal dentro de un rango razonable (ej. `> 0` y `< 50.000.000` ARS) para cortar montos absurdos.
- Nombre del ítem truncado a ~120 caracteres.
- Rechazar el request si faltan credenciales, devolviendo 503 en vez de 500.

## 9. Problemas frecuentes

| Síntoma | Causa / solución |
| --- | --- |
| Auth devuelve 404 con HTML | Host de sandbox desactualizado. Usar `production` o pedir la URL vigente a Openpay. |
| Redirect a `https://http/localhost:3000/...` | Openpay exige HTTPS en `redirect_urls`. Usar un túnel (ngrok) en `OPENPAY_REDIRECT_BASE_URL`. |
| `la respuesta no incluye links.checkout` | La versión de la API puso el link en otra rama del JSON. Loguear la respuesta cruda y ampliar `extractCheckoutUrl`. |
| Montos 100x menores/mayores | Faltó (o sobró) la conversión a centavos. |
| 401 al crear la orden | Token vencido o credenciales de otro ambiente que el endpoint de checkout. |
