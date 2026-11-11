# Auditoría de plataformas de medición y venta — 11/11/2026

Revisado: Google Merchant Center, Search Console, Meta (Ads Manager + Events Manager), Google Analytics 4, Google Ads y la tabla `ordenes` de Supabase (para cruzar ventas reales).

## 🔴 Crítico (está costando plata hoy)

### 1. Meta no recibe compras desde ~1/11
- En Events Manager, el dataset **Alcohn Web Sale (1322492025954445)** muestra el evento **Comprar** con "última recepción hace 10 días".
- En Supabase hay **ventas web por transferencia pagadas el 3/11 ($76.000), 4/11 ($113.000) y 6/11 ($76.000)** que nunca llegaron a Meta.
- **Corrección (después de investigar):** la API de Conversiones de Alcohn AI (edge `meta-conversion`) **funciona bien**: esas 3 ventas sí se mandaron (3/11, 5/11 y 7/11, `success=true`). Pero desde junio la API manda **todas** las compras, web y WhatsApp, al dataset **Ventas WhatsApp (887849613777106)**, nunca al dataset web **Alcohn Web Sale (1322492025954445)**. La división de señales que existe es otra: compras con anuncio de WhatsApp → además a **Ventas CTWA (1590689962745150)**; web vs. WhatsApp solo se distingue por `action_source` (`website` / `physical_store`) dentro del mismo dataset.
- El cambio del 2/11 (commit `1b922fc`, "deduplicar eventos de Meta") sacó el Purchase del navegador en la confirmación de transferencia, porque se suponía que la API lo cubría. Como la API manda al otro dataset, el dataset web se quedó sin compras de transferencia. Desde el 2/11 la única fuente de Purchase web es Openpay, y no hubo pagos con tarjeta aprobados.
- La deduplicación por `event_id` = id de orden solo funciona dentro del **mismo** dataset; entre 1322… y 887… no hay deduplicación.
- Efecto: la "Campaña de Ventas Web" (dataset web) no ve ventas por transferencia, que hoy son casi todas las ventas web.
- ✅ **Resuelto 11/11 (meta-conversion v26):** las órdenes web pagadas van solo a Alcohn Web Sale (con respaldo a Ventas WhatsApp si Meta las rechaza); las de WhatsApp/app siguen en Ventas WhatsApp. Probado con evento de prueba: "Comprar · Procesado · Servidor" en Alcohn Web Sale. Las 3 ventas del 3–7/11 no se reenviaron, para no contarlas dos veces.

### 2. GA4 no registra ninguna conversión
- Eventos clave últimos 7 días: **0**. `purchase` figura como "No se han detectado datos" en 28 días.
- Llegan solo: page_view, scroll, click, form_start, session_start, user_engagement, first_visit, wizard_step.
- El código **sí** empuja al dataLayer `purchase`, `purchase_international`, `click_whatsapp` y `mockup_generado`, pero ninguno llega a GA4 → **faltan las etiquetas de evento GA4 en GTM (GTM-5NSG5G4L)** o no se publicó la versión.
- Además no hay `add_to_cart` ni `begin_checkout` hacia GTM (solo hacia Meta).
- **Acción:** en GTM crear etiquetas "Evento GA4" con activadores de evento personalizado para `purchase`, `purchase_international`, `click_whatsapp`, `mockup_generado` (y agregar `add_to_cart`/`begin_checkout` en el código). Marcar `purchase` y `click_whatsapp` como evento clave. Publicar.
- Contexto: esos eventos se armaron en agosto solo para conversiones de **Google Ads** (ver `GUIA_CURSOR_eventos-conversion-ads.md`), no para GA4. Además, el activador "purchase arg" escuchaba un evento llamado `purchase arg`, pero la web siempre mandó `purchase`: la conversión "Ads - Compra Argentina" nunca pudo dispararse.
- ✅ **Resuelto 11/11 (GTM versión 9):** activador corregido a `purchase`; etiquetas GA4 nuevas `GA4 - purchase`, `GA4 - purchase internacional` (se envía como `purchase`), `GA4 - click_whatsapp` y `GA4 - mockup_generado`, con variables `items`, `ubicacion`, `market`, `material`, `medida`. Verificado en la web real: `click_whatsapp` llegó a GA4 con ubicación y país.
- ⏳ **Pendiente:** marcar `click_whatsapp` y `mockup_generado` como eventos clave en GA4 (Administrar → Eventos → Eventos recientes → estrella) cuando aparezcan en la lista (hasta 24 h). `purchase` ya es clave por defecto.
- ⏳ **Limitación:** la compra por transferencia solo llega a GA4 si el cliente sube el comprobante en la web. Si lo manda por WhatsApp, no se mide. Solución completa: que Alcohn AI mande `purchase` a GA4 desde el servidor (Measurement Protocol) al confirmar el pago, como ya hace con Meta.
  - 🔧 **En curso 11/11:** meta-conversion v27 publicada (manda `purchase` a GA4 al confirmar transferencias web AR); la web guarda el id de visitante de GA4 en la orden (`src/lib/analytics/gaCookies.ts`, falta publicar); GTM tiene guardada (sin publicar) la excepción de `GA4 - purchase` en `/checkout/transferencia`. Falta: cargar `GA4_API_SECRET` en Supabase, push de la web y publicar GTM.
- Todavía no se miden `add_to_cart` ni `begin_checkout` en GA4: requiere un cambio en el código de la web.

### 3. Meta: campaña web optimiza a "Iniciar pago", no a compra
- "Campaña de Ventas Web": 245 pagos iniciados a **$3.663 c/u** (~$900 mil en 30 días) contra ~6 ventas web pagadas en el período.
- Una vez arreglado el punto 1, evaluar optimizar a Purchase (o a una conversión personalizada de compra).

## 🟠 Importante

### 4. Merchant Center: feed desactualizado y casi todo "encontrado por Google"
- 46 productos, pero **solo 3 vienen de vos**; 43 los infiere Google rastreando la web (sin control de título, precio ni categoría).
- La fuente de archivo `google-merchant-products.tsv` se subió **una sola vez el 11/06/2026 y tiene 1 producto**. El archivo local tiene 28 productos (actualizado 6/11) y además existen `-cl`, `-co`, `-mx`, `-pe` que nunca se subieron.
- La fuente "Content API" tiene 0 productos.
- **Acción:** servir el feed desde una URL pública (ej. `/feeds/google-merchant-products.tsv`) y configurarlo como fuente **programada diaria**; agregar las fuentes de CL/CO/MX/PE con su etiqueta de país.

### 5. Merchant Center: 2 productos con "La URL de la tienda online no coincide"
- "Sello de Bronce Personalizado para Cuero" y "Sello para Madera Personalizado" (cargados a mano en MC). Corregir el link a `https://www.alcohnsellos.com/...` o borrarlos una vez que el feed real esté activo.

### 6. Merchant Center: faltan datos de configuración
- Calidad de tienda MX / CO / CL: "Faltan señales".
- No está cargado el **umbral de envío gratis** (la web ya tiene "envío gratis desde 3").
- Sin canales de atención al cliente validados; sin promociones (podría mostrarse el 15 % por transferencia).
- No está conectado el seguimiento de eventos clave (vincular GA4 con MC).
- Hay "varias cuentas de Google Ads vinculadas": 2 de ellas están **canceladas** (983-698-7507 y 750-141-1778). Desvincularlas.

### 7. Fotos de escudos de clubes en el feed
- El feed incluye Boca, River, Independiente, Racing, Rosario Central, Newell's y AFA. Son marcas registradas: riesgo de rechazo por "falsificación / propiedad intelectual" en Merchant Center y Meta, que puede afectar a la cuenta entera. Recomiendo sacarlos del feed de Shopping/catálogo.

## 🟡 SEO (Search Console)

Contexto bueno: 705 clics en 3 meses (vs 270 los 3 meses anteriores), impresiones 18 mil (vs 5,3 mil), posición media 7,9.

8. **Dependencia de la marca:** ~160 de 705 clics son "alcohn", "alcohn sellos", "alcohn cnc". Búsquedas genéricas con CTR muy bajo: "sello para cuero" 226 impr. / 3 clics, "sello para pan de hamburguesa" 204 / 4, "sellos para cuero" 216 / 3. Revisar títulos y meta descriptions de `/sellos/para-cuero` y `/sellos/para-pan`.
9. **7 "Error de redirección"** en `/cl/`, `/co/`, `/mx/`, `/pe/` (con barra) y URLs viejas sin `www`. Hoy redirigen bien (probado con user-agent de Googlebot) → apretar **"Validar corrección"**.
10. **Soft 404:** diseños estándar inexistentes (`madera-nudos`, `vaca-silueta`, `trophy-copa`, `hoja-arce`, `cuero-textura`) responden **200** con "Diseño estándar no encontrado" + noindex. Deberían devolver 404 real (`notFound()`) o redirigir 301 a `/sellos/estandar`.
11. 4 páginas "Duplicada sin canónica" y 2 con 404: revisar en el informe de Páginas.
12. Core Web Vitals: "sin datos" (poco tráfico de Chrome todavía); 5 videos sin indexar (normal si no son páginas de video).

## 🟡 Meta – otros

13. Diagnósticos activos: falta **coincidencias avanzadas manuales** (mandar email/teléfono hasheado en checkout) y **confirmar el dominio `alcohnsellos.com`** en la lista de permitidos.
14. Evento `__missing_event` (4 en 28 días): algún `fbq('track')` se llama sin nombre.
15. Hay un segundo píxel "Alcohn CNC - Píxel de Meta (508077424075557)" que disparó el 24–25/10. La web actual usa solo 1322492025954445: confirmar que no quedó instalado en otro lado.
16. 17 borradores sin publicar y 148 campañas (muchas viejas): limpiar para evitar publicar algo por error.
17. Calidad de coincidencia: PageView 6,1/10 – WizardStep 6,5/10 (mejora con el punto 13).
18. La caída de eventos del píxel desde el 3/11 (≈2.700 → ≈950/día) es mayormente por quitar el PageView duplicado (esperado), pero conviene confirmarlo en el desglose por evento.

## ⚪ Google Ads
19. Cuenta "Alcohn - Sellos de Bronce" (413-654-6460): **todas las campañas pausadas** y 0 compras medidas. Si se reactiva, primero arreglar el punto 2 e importar `purchase` desde GA4.

## Otras cosas a mirar (no revisadas hoy)
- **Openpay:** desde el 29/10 no hay ningún pago con tarjeta aprobado; hay 5 órdenes "pendiente" (25/10, 28/10, 29/10 y dos el 10/11). Puede ser abandono o un problema en el cobro.
- Google Business Profile (reseñas/llamadas), Mercado Libre y Pinterest (hay `feeds/pinterest-bulk-upload.csv`).
- Search Console abre por defecto con la cuenta **fundascorteza**; las propiedades están en alcohn.cnc. Lo mismo pasa en Google Ads.
