# Feed para Google Merchant Center

Archivo listo para subir: **`feeds/google-merchant-products.tsv`**.

Regenerar cuando cambien precios, sellos estándar o URLs:

```bash
npm run feed:merchant
```

Los sellos estándar se leen automáticamente desde `src/data/standardStamps.ts`.

## Cómo actualizar el feed en Merchant Center

1. Ejecutá `npm run feed:merchant` en el proyecto.
2. Entrá a [Google Merchant Center](https://merchants.google.com/).
3. **Productos** → **Fuentes de datos** → clic en **`google-merchant-products.tsv`** (la fuente existente; no crees otra).
4. **Subir archivo** y elegí `feeds/google-merchant-products.tsv`.
5. Si te pregunta el tipo de carga: **Reemplazar todos los productos de esta fuente**.
6. Esperá el procesamiento (puede tardar unas horas) y revisá **Diagnósticos**.

## Configuración de la cuenta (una vez)

En Merchant Center, verificá que estén completos:

- **Envío:** https://alcohnsellos.com/politica-envios
- **Devoluciones:** https://alcohnsellos.com/politica-devoluciones
- **Impuestos** para Argentina
- **Listados gratuitos de productos** activados (opcional pero recomendado)

## Notas del feed

- Precio **desde** $69.500 ARS (personalizados y estándar); abecedarios con precio fijo.
- `identifier_exists = no` porque no hay GTIN/EAN.
- Cada sello estándar usa su imagen real del catálogo.
- Las columnas `country` y `language` ya no van en el TSV (se definen en la fuente: Argentina + Español).

## Schema en la web (Search Console)

Las fichas de producto incluyen en `offers`:

- `shippingDetails` (envío a Argentina, plazos de fabricación y tránsito)
- `hasMerchantReturnPolicy` (10 días, enlace a política de devoluciones)

Eso corrige las alertas de **Fichas de comerciantes** en Search Console tras desplegar y revalidar.

Las alertas de **reseñas** (`aggregateRating` / `review`) requieren reseñas visibles en cada ficha; por ahora no se incluyen.
