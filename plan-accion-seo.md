# Plan de acción SEO — Alcohn Web

> Para ejecutar con Cursor. Basado en auditoría del código (jul 2026), informe SEO (jun 2026) e informe de tráfico GA4/Search Console (jun 2026).
> **Reglas:** no modificar la versión desktop ni el diseño visual. Cambios solo de metadata, JSON-LD, contenido y datos. No tocar `/buy`, `/carrito`, `/checkout`.

---

## Contexto

El on-page ya está bien resuelto (titles, descriptions, canonical, OG, Product/LocalBusiness/Breadcrumb/FAQ schema, landings por uso, alts descriptivos). El 100% de los clics orgánicos entran como "fragmentos de producto" en Google. Este plan ataca lo que falta: estrellas de rating en esos fragmentos, schema FAQ en landings, y las queries donde ya hay impresiones sin clics ("sellos para cajas de cartón" pos. 34, "sellos de bronce" pos. 14, "sello de bronce personalizado" pos. 10).

---

## Tarea 1 — `aggregateRating` y reviews en el schema Product (impacto alto)

Hoy los clics orgánicos ya salen como fragmentos de producto pero sin estrellas. Agregarlas mejora CTR directo.

**Archivos:** `src/lib/seo.ts`, `src/data/testimonials.ts`, `src/app/sellos/[slug]/page.tsx`, `src/app/productos/[slug]/page.tsx`, `src/app/sellos/estandar/[slug]/layout.tsx` (o donde se llame `buildProductJsonLd`).

1. En `src/data/testimonials.ts`: extender `Testimonial` con `rating?: number` (1–5) y `datePublished?: string` (ISO). Cargar los valores reales de las reseñas de Google (son 5 estrellas en su mayoría — verificar en Google Business Profile).
2. En `src/lib/seo.ts` → `buildProductJsonLd`: aceptar un input opcional `aggregateRating?: { ratingValue: number; reviewCount: number }` y opcionalmente `reviews` (array con author, ratingValue, reviewBody). Emitirlos dentro del nodo Product.
3. Calcular ratingValue/reviewCount desde `testimonials.ts` (helper `getAggregateRating()`), no hardcodear números sueltos.
4. Pasar el aggregateRating en las páginas de producto (`/sellos/[slug]`, `/productos/[slug]`, `/sellos/estandar/[slug]`).

**Nota de cumplimiento:** Google pide que las reviews del schema Product refieran al producto y sean recolectadas por el sitio. Las reseñas actuales vienen de Google Business Profile (hablan del negocio). Riesgo de que Google ignore el markup: bajo-medio; penalización: improbable pero posible si se abusa. Mitigación a futuro: capturar reseñas propias post-compra (WhatsApp/email) con rating explícito y asociarlas al producto comprado. Implementar igual ahora con las reseñas reales existentes, sin inflar valores.

**Verificación:** pasar `/sellos/para-madera` por el [Rich Results Test](https://search.google.com/test/rich-results) → debe detectar Product con reviewSnippet sin errores.

---

## Tarea 2 — FAQPage JSON-LD en landings `/sellos/[slug]` (impacto medio, esfuerzo mínimo)

Las landings ya renderizan FAQs (`useCase.faqs`) pero sin schema. En `/faq` ya existe el patrón FAQPage — replicarlo.

**Archivos:** `src/lib/seo.ts`, `src/app/sellos/[slug]/page.tsx`.

1. Extraer a `src/lib/seo.ts` un helper `buildFaqJsonLd(faqs: {question, answer}[])` (mover/reusar la lógica que hoy vive en `src/app/faq/page.tsx`).
2. En `/sellos/[slug]/page.tsx`: emitir un tercer `<script type="application/ld+json">` con las FAQs del use case (todos los use cases tienen FAQs, packaging incluido).
3. Refactorizar `/faq/page.tsx` para usar el mismo helper.

**Expectativa:** desde 2023 Google muestra rich results de FAQ solo a sitios de alta autoridad, así que el beneficio inmediato es semántico (mejor entendimiento de la página), no visual. El esfuerzo es mínimo, se justifica igual.

---

## Tarea 3 — Capturar "sellos para cajas de cartón" (impacto alto)

12 impresiones/mes en posición 34 y la landing existe (`para-packaging`) pero la frase exacta "cajas de cartón" casi no aparece. No crear página nueva: optimizar la existente.

**Archivo:** `src/data/stampUseCases.ts` (entrada `para-packaging`).

1. `seoTitle`: cambiar a `Sello para cajas de cartón y packaging | Bronce CNC | Alcohn`.
2. `seoDescription`: incluir "cajas de cartón" naturalmente. Ej: `Sello de bronce CNC para marcar cajas de cartón, etiquetas y bolsas de papel. Ideal para packaging artesanal y series cortas. Envío a todo Argentina.`
3. `title` (H1): `Sellos para cajas de cartón y packaging`.
4. En `applications`: cambiar `'Cajas'` por `'Cajas de cartón'`.
5. Agregar 1 FAQ nueva con la keyword: `¿Sirve para cajas de cartón corrugado?` con respuesta técnica real (presión/temperatura, tipos de cartón que funcionan mejor).
6. Revisar `intro`/`description` para mencionar "cartón" al menos una vez más de forma natural (sin stuffing).

---

## Tarea 4 — Reforzar el head term "sellos de bronce" en `/productos` (impacto medio-alto)

"sellos de bronce" pos. 14 y "sellos en bronce" pos. 32. `/productos` es la página candidata pero su title empieza con la cola, no con el head term.

**Archivo:** `src/app/productos/page.tsx`.

1. `PRODUCTOS_TITLE`: cambiar a `Sellos de bronce personalizados | Cuero, madera, pan y packaging | Alcohn` (head term al inicio, se mantiene la cola).
2. Agregar un bloque de texto corto (2–3 párrafos, ~150 palabras) al final de la página — visible, no oculto — que describa qué es un sello de bronce CNC, materiales que marca y por qué bronce (durabilidad, retención de calor, precisión). Debe usar naturalmente "sellos de bronce", "sellos en bronce personalizados" y "marcaje en bronce" (query con 8 impresiones). Estilo sobrio, consistente con la estética actual; en mobile puede ir colapsado si molesta al layout.
3. Enlaces internos dentro de ese texto hacia `/sellos/para-madera`, `/sellos/para-cuero` y `/proceso` con anchor text descriptivo (ej: "sello de bronce para madera", no "ver más").

---

## Tarea 5 — Fixes menores (impacto bajo, esfuerzo bajo)

1. **Sitemap** (`src/app/sitemap.ts`): `lastModified: now` en cada build hace que Google ignore el campo. Opciones: quitar `lastModified`, o usar fechas estáticas por ruta actualizadas solo cuando cambia el contenido. Preferida: quitarlo.
2. **Logo de Organization** (`src/lib/seo.ts`): el nodo Organization usa `og-default.jpg` como `logo`. Crear/usar un logo real cuadrado o rectangular (mín. 112x112px, fondo no transparente preferido) en `/public`, ej. `/logo-alcohn.png`, y referenciarlo en `logo`. Mantener `image` como está.
3. **Breadcrumb** (`src/app/sellos/[slug]/page.tsx`): el ítem "Sellos por uso" apunta a `/productos`. Unificar: renombrar el ítem a "Productos" (opción simple) para que nombre y URL coincidan.

---

## Verificación final (checklist para Cursor)

- [ ] `npm run build` sin errores ni warnings nuevos.
- [ ] Rich Results Test en: home, `/productos`, `/sellos/para-madera`, `/sellos/para-packaging`, `/faq` → Product (con rating), FAQPage, BreadcrumbList y LocalBusiness válidos.
- [ ] Validar JSON-LD en https://validator.schema.org con una URL de cada template.
- [ ] Ningún cambio visual en desktop (comparar antes/después en viewport 1440px).
- [ ] `sitemap.xml` sigue incluyendo todas las landings.
- [ ] Tras el deploy: en Search Console, inspeccionar y pedir reindexación de `/productos`, `/sellos/para-packaging` y `/sellos/para-madera`.
