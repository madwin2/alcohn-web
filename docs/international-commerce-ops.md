# Operaciones de comercio internacional Alcohn

Guía interna para pedidos LatAm (Chile, Perú, Colombia, México) con envío DHL y pagos internacionales.

## Dónde ver el pedido

- Tabla Supabase `ordenes`.
- Datos internacionales en `ordenes.notas_web.international`:
  - `market`, `currency`, `shippingAddress`, `dhlShippingAmount`, `paymentProvider`, `paymentReference`.

## Campos de envío DHL

El checkout internacional guarda:

- Nombre y apellido
- Email y teléfono (DHL contacta por importación)
- País (según mercado)
- Región / departamento / estado
- Ciudad y, si aplica, distrito o colonia
- Código postal
- Dirección línea 1 y línea 2
- Documento de identidad según país

## Aviso de aduana (copy del sitio)

> El precio pagado en Alcohn incluye producto y envío DHL, pero no incluye impuestos, aranceles ni gastos de importación del país de destino. Si corresponden, DHL contactará al comprador por email o teléfono y el comprador los pagará directamente a DHL.

## SQL requerido en Supabase

Antes del primer pedido internacional en producción, ejecutar:

`docs/sql/003_ordenes_metodo_pago_internacional.sql`

Sin eso, `POST /api/checkout/international/intent` falla al insertar `metodo_pago = 'Internacional'` por el check constraint.

## Variables de entorno de pago

| Variable | Uso |
| --- | --- |
| `INTERNATIONAL_PAYMENT_PROVIDER` | `mock` en desarrollo; `dlocal` para sandbox/producción |
| `DLOCAL_API_KEY` | API key (Integrations → API Integration en el dashboard) |
| `DLOCAL_SECRET_KEY` | Secret key |
| `DLOCAL_API_BASE` | Sandbox: `https://api-sbx.dlocalgo.com` · Live: `https://api.dlocalgo.com` |
| `DLOCAL_SMARTFIELDS_API_KEY` | Solo checkout embebido (Smartfields); v1 usa redirect hosted |

En desarrollo, `mock` confirma el pago sin pasarela real.

## Etiqueta DHL (manual v1)

1. Confirmar pago en Supabase (`estado` / notas de pago).
2. Fabricar según plazo habitual (72 h hábiles).
3. Crear envío en DHL con la dirección de `notas_web.international.shippingAddress`.
4. Cobrar envío ya incluido en el pedido; no volver a facturar envío al cliente.
5. Guardar tracking y avisar al cliente.

## Mensaje al cliente tras despacho

```text
Hola, tu pedido Alcohn ya fue despachado por DHL. Cuando el envío llegue a aduana, DHL puede contactarte por email o teléfono para pagar impuestos/aranceles de importación si corresponden. Ese pago se realiza directamente a DHL.
```

## Precios internacionales

- Producto: precio transferencia ARS × tasa fija × 1,15, redondeado por mercado.
- Envío DHL: monto fijo por país en moneda local (ver `src/lib/markets/config.ts`).

## Feeds Merchant

Regenerar cuando cambien precios o catálogo internacional:

```bash
npm run feed:merchant:latam
```

Un TSV por país en `feeds/google-merchant-products-{cl,pe,co,mx}.tsv`.
