# Feed para Google Merchant Center

Archivo listo para subir: **`feeds/google-merchant-products.tsv`** (30 productos).

Regenerar cuando cambien precios o URLs:

```bash
node scripts/generate-merchant-feed.mjs
```

## Cómo subirlo (rápido)

1. Entrá a [Google Merchant Center](https://merchants.google.com/).
2. **Productos** → **Añadir productos** → **Añadir otra fuente de productos**.
3. Elegí **Subir un archivo** (o “Hoja de cálculo / archivo”).
4. País de venta: **Argentina**.
5. Idioma: **Español**.
6. Subí el archivo `feeds/google-merchant-products.tsv` (formato TSV, separado por tabulaciones).
7. Mapeá columnas si Google lo pide (los nombres del encabezado ya coinciden con el estándar).
8. Completá antes **envío** y **impuestos** en la configuración de la cuenta (obligatorio para aprobar productos).

## Notas

- Los precios son el **“desde”** publicado en la web (personalizados $69.500, estándar según diseño).
- `identifier_exists = no` porque no hay GTIN/EAN (producto artesanal a medida).
- Las URLs apuntan a fichas reales en `alcohnsellos.com` (productos, landings `/sellos/*`, estándar).
- Si Google rechaza algún ítem por imagen genérica en sellos estándar, reemplazá `image_link` en el TSV por una foto específica de ese diseño.

## Listados gratuitos

En Merchant Center, activá **Listados gratuitos de productos** (Free listings) para aparecer en resultados tipo Shopping sin campaña de pago.

## Política de devoluciones (obligatorio en Merchant)

URL para pegar en la configuración de la tienda (no está enlazada desde el menú del sitio aún):

**https://alcohnsellos.com/politica-devoluciones**
