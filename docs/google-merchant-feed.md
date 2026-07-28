# Feed para Google Merchant Center

## Argentina

Archivo listo para subir: **`feeds/google-merchant-products.tsv`**.

Regenerar cuando cambien precios, sellos estándar o URLs:

```bash
npm run feed:merchant
```

Los sellos estándar se leen automáticamente desde `src/data/standardStamps.ts`.

### Cómo actualizar el feed en Merchant Center (Argentina)

1. Ejecutá `npm run feed:merchant` en el proyecto.
2. Entrá a [Google Merchant Center](https://merchants.google.com/).
3. **Productos** → **Fuentes de datos** → clic en **`google-merchant-products.tsv`** (la fuente existente; no crees otra).
4. **Subir archivo** y elegí `feeds/google-merchant-products.tsv`.
5. Si te pregunta el tipo de carga: **Reemplazar todos los productos de esta fuente**.
6. Esperá el procesamiento (puede tardar unas horas) y revisá **Diagnósticos**.

### Configuración de la cuenta Argentina (una vez)

En Merchant Center, verificá que estén completos:

- **Envío:** https://alcohnsellos.com/politica-envios
- **Devoluciones:** https://alcohnsellos.com/politica-devoluciones
- **Impuestos** para Argentina
- **Listados gratuitos de productos** activados (opcional pero recomendado)

---

## LatAm (Chile, Perú, Colombia, México)

Archivos generados:

- `feeds/google-merchant-products-cl.tsv`
- `feeds/google-merchant-products-pe.tsv`
- `feeds/google-merchant-products-co.tsv`
- `feeds/google-merchant-products-mx.tsv`

Regenerar:

```bash
npm run feed:merchant:latam
```

### Catálogo incluido

Solo productos del catálogo internacional v1:

- Páginas de uso (`/sellos/para-*`)
- Abecedarios
- Mango de golpe

No incluye sellos estándar ni accesorios solo Argentina.

### Precios

- Precio **desde** en moneda local (CLP, PEN, COP, MXN).
- Derivado del precio transferencia ARS × tasa fija × 1,15 (`convertTransferArsToMarketPrice`).
- Cada feed usa URLs con prefijo de mercado (`/cl`, `/pe`, `/co`, `/mx`).

### Merchant Center por país

Creá **una fuente de datos por país** con país, idioma y moneda alineados:

| Feed | País | Moneda | Política envíos |
| --- | --- | --- | --- |
| `google-merchant-products-cl.tsv` | Chile | CLP | `https://www.alcohnsellos.com/cl/politica-envios` |
| `google-merchant-products-pe.tsv` | Perú | PEN | `https://www.alcohnsellos.com/pe/politica-envios` |
| `google-merchant-products-co.tsv` | Colombia | COP | `https://www.alcohnsellos.com/co/politica-envios` |
| `google-merchant-products-mx.tsv` | México | MXN | `https://www.alcohnsellos.com/mx/politica-envios` |

La landing, el checkout y el feed deben usar la **misma moneda** por mercado.

El costo de envío DHL se configura en Merchant Center por país o queda reflejado en la política de envíos internacional.

---

## Notas comunes

- `identifier_exists = no` porque no hay GTIN/EAN.
- Las columnas `country` y `language` no van en el TSV (se definen en la fuente de Merchant Center).

## Schema en la web (Search Console)

Las fichas de producto incluyen en `offers`:

- `shippingDetails` (envío según mercado)
- `hasMerchantReturnPolicy` (enlace a política de devoluciones del mercado)

Las alertas de **reseñas** (`aggregateRating` / `review`) requieren reseñas visibles en cada ficha; por ahora no se incluyen.
