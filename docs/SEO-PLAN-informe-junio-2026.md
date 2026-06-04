# Plan SEO Alcohn — Informe junio 2026

**Fuente:** `Informe_SEO_Alcohn.docx` (mercado argentino, junio 2026)  
**Dominio objetivo:** `https://alcohnsellos.com`  
**Dominio en conflicto:** `alcohncnc.com` (sigue indexado; parte autoridad)

**Cómo usar este documento:** cada ítem tiene un **ID** (`SEO-###`). Trabajamos **de a uno**: antes de tocar código, el agente explica qué archivos cambian y por qué; vos confirmás; luego se implementa y se marca `[x]`.

**Leyenda**

| Campo | Significado |
|-------|-------------|
| **Tipo** | `código` = repo Next.js · `infra` = DNS/hosting · `contenido` = copy/fotos que debés proveer · `externo` = Search Console, GBP, etc. |
| **Estado** | `[ ]` pendiente · `[x]` hecho · `[~]` parcial |

---

## Resumen ejecutivo (del informe)

- Base técnica del sitio nuevo: **buena** (metadata, OG, canonical, robots, sitemap, URLs).
- Bloqueo principal: **dos dominios** sin migración 301 → Google no transfiere autoridad de `alcohncnc.com` a `alcohnsellos.com`.
- Competidor referencia: **Hanko** (blog, FAQ, precios visibles, nicho pan/hamburguesa).
- Ventaja Alcohn infrautilizada en SEO: CNC, marcas (Brooksfield, Tucci, Mistral, Lee), +6.000 sellos.

---

## Sprint 1 — Esta semana (alto impacto, bajo esfuerzo en código)

### SEO-001 · Reemplazar testimonio placeholder en home

| | |
|---|---|
| **Prioridad** | Crítica |
| **Tipo** | `código` + `contenido` |
| **Estado** | `[x]` |

**Problema (informe):** En producción aparece *"Desde que compre alcohn bla bla bla"* — destruye credibilidad.

**Estado actual en repo:**

- `src/components/LogoCloud.tsx` (~línea 169): blockquote con el texto placeholder (visible en **mobile**).
- En desktop el bloque muestra copy genérico sin testimonio con nombre.

**Cambio propuesto:**

1. Reemplazar el blockquote por un testimonio real: cita, **nombre**, **rubro/taller**, **ciudad** (ideal con foto).
2. Opcional: alinear el bloque mobile con el mensaje de desktop o unificar ambas vistas.

**Archivos a modificar:** `src/components/LogoCloud.tsx` (y assets en `public/images/` si hay foto).

**Contenido que necesitás proveer:** texto exacto del cliente + permiso de uso + imagen opcional.

**Schema relacionado:** más adelante `SEO-012` (Review JSON-LD) puede reutilizar el mismo testimonio.

---

### SEO-002 · Corregir typo "PASO A PASA"

| | |
|---|---|
| **Prioridad** | Alta |
| **Tipo** | `código` |
| **Estado** | `[x]` |

**Problema:** Texto visible *"PASO A PASA PARA COMPRAR"*.

**Archivo:** `src/components/DossInspiredSections.tsx` (~línea 57).

**Cambio:** `PASO A PASA` → `PASO A PASO`.

---

### SEO-003 · Revisar bloque "+5 materiales" / "Años de uso" sin número

| | |
|---|---|
| **Prioridad** | Media |
| **Tipo** | `código` + `contenido` |
| **Estado** | `[x]` |

**Problema (informe):** Sin cifra concreta suena vacío frente a visitantes de SEO.

**Archivo:** `src/components/LogoCloud.tsx` (stats en desktop: "+5 materiales posibles", etc.).

**Opciones:**

- Poner número real (ej. años de experiencia, cantidad de sellos fabricados).
- Reescribir copy con dato verificable (+6.000 sellos del informe).
- Eliminar la stat si no hay dato defendible.

---

### SEO-004 · Eliminar `meta keywords` obsoleto

| | |
|---|---|
| **Prioridad** | Baja |
| **Tipo** | `código` |
| **Estado** | `[x]` |

**Problema:** Google/Bing no usan `keywords` desde hace años; da sensación de SEO desactualizado.

**Archivo:** `src/app/layout.tsx` — quitar la propiedad `keywords` del objeto `metadata`.

**Nota:** No afecta ranking; es limpieza.

---

### SEO-005 · Dominio canónico definitivo + migración 301

| | |
|---|---|
| **Prioridad** | **Crítica (mayor impacto global)** |
| **Tipo** | `infra` + `externo` |
| **Estado** | `[x]` |

**Problema:** `alcohncnc.com` indexado primero; `alcohnsellos.com` casi invisible en búsquedas de marca.

**Acciones (informe — no están en este repo):**

1. Confirmar dominio definitivo: **`alcohnsellos.com`** (recomendado).
2. Mapear cada URL vieja → equivalente nueva.
3. Configurar **redirecciones 301** (no 302) en el host de `alcohncnc.com`.
4. Verificar **ambos** dominios en Google Search Console.
5. Enviar sitemap de `alcohnsellos.com`.
6. Inspección de URL + solicitar reindexación de páginas clave.

**En código (ya OK):** `SITE_URL` en `src/lib/seo.ts` = `https://alcohnsellos.com`; canonicals apuntan ahí.

**Tabla de mapeo sugerida (completar según URLs reales del sitio viejo):**

| alcohncnc.com (ejemplo) | alcohnsellos.com |
|-------------------------|------------------|
| `/` | `/` |
| *(completar)* | `/productos` |
| *(completar)* | `/sellos/para-cuero` |
| … | … |

---

### SEO-006 · Google Search Console + Bing Webmaster

| | |
|---|---|
| **Prioridad** | Crítica |
| **Tipo** | `externo` |
| **Estado** | `[x]` (configurado; indexación en curso) |

**Acciones:**

- Verificar propiedad de `alcohnsellos.com`.
- Enviar `https://alcohnsellos.com/sitemap.xml`.
- Monitorear cobertura e impresiones.

**Repo:** `src/app/sitemap.ts` y `src/app/robots.ts` ya declaran el sitemap.

---

### SEO-007 · Google Analytics 4 + Tag Manager

| | |
|---|---|
| **Prioridad** | Alta (medición, no ranking directo) |
| **Tipo** | `externo` + posible `código` |
| **Estado** | `[~]` |

**Verificar:** si `AnalyticsProvider` / eventos en `src/lib/analytics/` ya envían a GA4 con el ID correcto en `.env`.

**Acción externa:** crear propiedad GA4, enlazar con GTM si aplica.

---

## Sprint 2 — Próximas 2 semanas

### SEO-008 · Completar Schema.org (rich results)

| | |
|---|---|
| **Prioridad** | Alta |
| **Tipo** | `código` |
| **Estado** | `[x]` |

**Informe decía "no hay JSON-LD"** — en el repo **ya hay parte implementada**. Falta completar según informe:

| Schema | Estado actual | Acción pendiente |
|--------|---------------|------------------|
| **Organization** | `src/lib/seo.ts` + `layout.tsx` | Agregar `sameAs` (Instagram `@alcohn.cnc`), logo URL estable |
| **LocalBusiness** | `seo.ts` + páginas contacto/sobre | Mover o duplicar en layout global; validar teléfono WhatsApp |
| **WebSite** | `src/app/page.tsx` | OK |
| **Product** | `src/app/productos/[slug]/page.tsx` | Verificar `price`, `priceCurrency` (ARS), `availability`, `brand` |
| **FAQPage** | `src/app/faq/page.tsx` | OK |
| **BreadcrumbList** | Varias páginas + `buildBreadcrumbJsonLd` | Extender a landings `/sellos/*` si falta |
| **Review** | No detectado | Nuevo JSON-LD en testimonios reales (`SEO-001`, `SEO-013`) |

**Archivos típicos:** `src/lib/seo.ts`, `src/app/layout.tsx`, `src/app/sellos/[slug]/page.tsx`, componentes de testimonios.

---

### SEO-009 · Reescribir titles y meta descriptions (tabla on-page)

| | |
|---|---|
| **Prioridad** | Alta |
| **Tipo** | `código` + `contenido` |
| **Estado** | `[x]` |

**Regla del informe:** keyword + diferenciador (72hs, Argentina, CNC, precio/comprar donde aplique).

| Página | Title actual (repo) | Title sugerido (informe) | Archivo |
|--------|---------------------|---------------------------|---------|
| **Home** | `Alcohn - Sellos de bronce personalizados \| Hecho en Argentina con CNC` | `Sellos de bronce CNC \| Logo a sello en 72hs \| Argentina` (o variante con "comprar"/precio) | `src/app/page.tsx`, `layout.tsx` |
| **/productos** | `Productos - Alcohn` | `Sellos de bronce personalizados para cuero, madera, pan y packaging \| Alcohn` | `src/app/productos/page.tsx` |
| **/sellos/para-cuero** | `{seoTitle} - Alcohn` → ver `stampUseCases` | `Sello de bronce para cuero \| Marroquinería profesional \| Alcohn Argentina` | `src/data/stampUseCases.ts` + `generateMetadata` en `sellos/[slug]/page.tsx` |
| **/sellos/para-pan** | idem | `Sello para pan y hamburguesa personalizado \| Bronce CNC \| Envío a todo el país` | idem |
| **/casos-reales** | `Casos reales - Alcohn` | `Casos reales: marcas que usan sellos Alcohn (Brooksfield, Tucci, Mistral, Lee)` | `src/app/casos-reales/page.tsx` |
| **/faq** | `Preguntas frecuentes - Alcohn` | (informe no lista; mantener keyword "sello de bronce") | `src/app/faq/page.tsx` |
| **/proceso** | `Cómo funciona - Alcohn` | Reforzar "comprar" / pasos / 72hs si aplica | `src/app/proceso/page.tsx` |

**H1:** revisar que coincida con intención de búsqueda (no solo el `<title>`); archivos de cada `page.tsx` y `PageIntro`.

---

### SEO-010 · Precios "desde" visibles en landings (vs. Hanko)

| | |
|---|---|
| **Prioridad** | Alta (conversión + SEO comparativo) |
| **Tipo** | `código` + `contenido` |
| **Estado** | `[x]` |

**Problema:** Usuario debe ir a `/buy?mode=custom` para ver precio; Hanko muestra precios en home/producto.

**Acciones:**

1. Definir rangos o precios "desde" por categoría (cuero, pan, madera, etc.).
2. Mostrar en `/productos`, `/sellos/[slug]` y opcionalmente home.
3. Reflejar en **Product** schema (`offers.price` en ARS).

**Archivos:** `src/data/products.ts`, `stampUseCases.ts`, páginas de producto/sellos, posible componente `PriceFrom`.

---

### SEO-011 · 4–6 testimonios reales con nombre y rubro

| | |
|---|---|
| **Prioridad** | Alta |
| **Tipo** | `contenido` + `código` |
| **Estado** | `[ ]` |

**Referencia Hanko:** "Martín - Restaurante", "Paula - Marroquinería".

**Alcohn tiene logos de marcas grandes pero poco caso/testimonio asociado.**

**Acciones:**

- Crear datos en `src/data/testimonials.ts` (nuevo) o ampliar sección en `LogoCloud` / `casos-reales`.
- Enlazar marcas del logo cloud con mini-casos (Brooksfield, Tucci, etc.) donde haya permiso.

---

### SEO-012 · Schema Review en testimonios

| | |
|---|---|
| **Prioridad** | Media |
| **Tipo** | `código` |
| **Estado** | `[ ]` |
| **Depende de** | SEO-001, SEO-011 |

**Implementar** `Review` / `AggregateRating` con nombre, fecha, rating cuando haya reseñas verificables.

---

### SEO-013 · Google Business Profile (Mar del Plata)

| | |
|---|---|
| **Prioridad** | Alta (Local Pack) |
| **Tipo** | `externo` |
| **Estado** | `[~]` según auditoría mayo — confirmar con vos |

**Acciones:** reclamar/optimizar ficha, categoría, fotos, horarios, link a `alcohnsellos.com`, pedir reseñas.

---

### SEO-014 · Verificar cobertura del sitemap

| | |
|---|---|
| **Prioridad** | Media |
| **Tipo** | `código` |
| **Estado** | `[x]` en repo |

**Informe pedía incluir todas las landings de uso.**

**Estado `src/app/sitemap.ts`:** incluye rutas estáticas + `/productos/{slug}` + `/sellos/{slug}` + `/sellos/estandar/{slug}`.

**Landings de uso actuales (`stampUseCases`):**

- `para-madera`, `para-cuero`, `para-ceramica`, `para-jabon`, `para-packaging`, `para-lacre`, `para-hielo`, `para-pan`, `para-fruta`

**Pendiente del informe (no existen aún):**

- `para-hamburguesa` (separada de pan) — Sprint 3
- `para-chocolate` — Sprint 3

**Acción:** al crear URLs nuevas, agregarlas a `stampUseCases` (el sitemap las tomará automáticamente).

---

### SEO-015 · Footer: redes sociales + revisar duplicación de copy

| | |
|---|---|
| **Prioridad** | Media |
| **Tipo** | `código` |
| **Estado** | `[x]` |

**Informe:** sin links sociales en footer; duplicación de texto Alcohn / Mar del Plata.

**Archivo:** `src/components/Footer.tsx`

**Cambios:**

- Agregar Instagram (mínimo): `https://www.instagram.com/alcohn.cnc/`
- Opcional: TikTok u otros canales activos.
- Unificar copy mobile vs desktop si el informe detectó repetición percibida (mobile: "Sellos de bronce CNC…"; desktop: "alta precisión fabricados en CNC…").

**Schema:** enlazar `sameAs` en `organizationJsonLd` (`SEO-008`).

---

## Sprint 3 — Mes 1–2

### SEO-016 · Blog — 6 posts (90 días)

| | |
|---|---|
| **Prioridad** | Alta (long-tail) |
| **Tipo** | `código` + `contenido` |
| **Estado** | `[ ]` |

**Posts sugeridos (informe):**

1. Sello de bronce vs goma vs láser — por material (pilar 1500+ palabras).
2. Cómo aplicar sello al fuego en cuero sin quemar (video).
3. Sello para pan y hamburguesa: temperatura, tiempo, diseño.
4. De taller a marca: 5 casos marroquinería.
5. Diseñar logo que rinda en sello (profundidad, contraste).
6. Sellos para gastronomía (hub → landings comida).

**Implementación técnica sugerida:** ruta `/blog/[slug]`, MDX o CMS, entrada en `sitemap.ts`, metadata por post, internal links a `/sellos/*`.

---

### SEO-017 · Landings nuevas: hamburguesa y chocolate

| | |
|---|---|
| **Prioridad** | Media-alta |
| **Tipo** | `código` + `contenido` |
| **Estado** | `[ ]` |

Separar de `para-pan` para competir con Hanko en "sello para hamburguesa".

**Archivos:** nuevo entry en `src/data/stampUseCases.ts`, imágenes en `public/images/`, rutas `/sellos/para-hamburguesa`, `/sellos/para-chocolate`.

---

### SEO-018 · Sección B2B con casos Brooksfield, Tucci, Mistral, Lee

| | |
|---|---|
| **Prioridad** | Media |
| **Tipo** | `código` + `contenido` |
| **Estado** | `[ ]` |

Página o bloque `/b2b` o ampliar `/casos-reales` con estudios detallados (fotos, rubro, resultado).

**Keyword objetivo:** "sello logo bronce CNC", compra B2B.

---

### SEO-019 · Landings por sinónimos de búsqueda

| | |
|---|---|
| **Prioridad** | Media |
| **Tipo** | `código` + `contenido` |
| **Estado** | `[ ]` |

| Keyword (informe) | Acción |
|-------------------|--------|
| marca al fuego para cuero | Landing o sección en `/sellos/para-cuero` |
| branding iron argentina | Página bilingüe o sección técnica |

---

### SEO-020 · Off-page: backlinks y menciones

| | |
|---|---|
| **Prioridad** | Media |
| **Tipo** | `externo` / relaciones |
| **Estado** | `[ ]` |

- Menciones desde clientes top (sección proveedores en sus webs).
- Medios: marroquinería, diseño (La Nación Diseño, etc.).
- Directorios: Guía del Calzado, Cluster Diseño MDP, Polo Tecnológico MDP.
- Instagram 20K+ como canal (ya existe `@alcohn.cnc`).

---

## Sprint 4 — Mes 3

### SEO-021 · Core Web Vitals (LCP, CLS, INP)

| | |
|---|---|
| **Prioridad** | Media |
| **Tipo** | `código` + `infra` |
| **Estado** | `[ ]` |

Auditoría mobile: hero, imágenes grandes, JS del wizard/buy.

**Herramientas:** PageSpeed Insights, Search Console → Experiencia.

---

### SEO-022 · A/B test CTA principal

| | |
|---|---|
| **Prioridad** | Baja (CRO) |
| **Tipo** | `código` + analytics |
| **Estado** | `[ ]` |

Probar: "Diseñar sello" vs "Ver precio en 1 minuto".

---

### SEO-023 · Página comparativa Alcohn vs alternativas

| | |
|---|---|
| **Prioridad** | Baja |
| **Tipo** | `contenido` + `código` |
| **Estado** | `[ ]` |

Captura búsquedas comparativas + defensa de marca (sin disparar a competidores de forma agresiva).

---

## Estrategia de keywords (referencia — no es un solo ticket)

Priorizar contenido y titles hacia:

| Keyword | Acción vinculada |
|---------|------------------|
| sello de bronce personalizado | SEO-009 home |
| sello para cuero | SEO-009, SEO-010, reindexación |
| sello para madera personalizado | SEO-009 landing madera |
| sello para pan / hamburguesa | SEO-009, SEO-017 |
| sello para lacre | landing `para-lacre` |
| sello para hielo cocktail | landing `para-hielo` |
| cómo hacer sello para marcar madera | SEO-016 post blog |
| sello logo bronce CNC | SEO-018 B2B |
| marca al fuego para cuero | SEO-019 |
| branding iron argentina | SEO-019 |

---

## KPIs a monitorear (90 días)

| KPI | Herramienta | Meta informe |
|-----|-------------|--------------|
| Impresiones orgánicas | Search Console | +200% vs baseline |
| Clicks orgánicos | Search Console | +150% |
| Posición media "sello de bronce personalizado" | Search Console | Top 10 |
| URLs indexadas | Search Console | 100% sitemap |
| Backlinks dominio | Ahrefs / SE Ranking | +15 |
| Conversiones `/buy` | GA4 | baseline + meta |
| Reseñas Google | GBP | +10 con 5★ |

---

## Orden recomendado de implementación en código

Trabajar en este orden (explicación previa cada ítem):

1. ~~**SEO-001**~~ — testimonio provisional ✅
2. ~~**SEO-002**~~ — typo ✅
3. ~~**SEO-004**~~ — meta keywords eliminado ✅
4. ~~**SEO-003**~~ — stats ✅
5. ~~**SEO-009**~~ — titles en todas las páginas indexables ✅
6. ~~**SEO-008**~~ — schema completado ✅
7. ~~**SEO-010**~~ — precios "desde" en landings ✅
8. **SEO-015** — footer redes ← **siguiente sugerido**
9. **SEO-011 / SEO-012** — testimonios + Review schema
10. Resto Sprint 3–4 y tareas **infra/externo** (SEO-005, 006, 007, 013, 020) en paralelo con vos

---

## Registro de cambios aplicados

| ID | Fecha | Notas |
|----|-------|-------|
| SEO-001 | 2026-06-03 | Testimonio provisional en `LogoCloud.tsx` (Lucía M., marroquinería, Córdoba). Reemplazar cuando haya cita real. |
| SEO-002 | 2026-06-03 | Typo corregido en `DossInspiredSections.tsx`. |
| SEO-004 | 2026-06-03 | Eliminado `keywords` de `layout.tsx`. |
| SEO-003 | 2026-06-03 | Stats desktop en `LogoCloud.tsx`: +9 usos/materiales, Bronce para toda la vida. |
| SEO-009 | 2026-06-03 | Titles/descriptions SEO en todas las páginas; helper `createPageMetadata` en `seo.ts`; `seoTitle`/`seoDescription` en productos y landings `/sellos/*`. |
| SEO-008 | 2026-06-03 | Schema global (Organization+LocalBusiness), `buildProductJsonLd`, precios en `/sellos/*`, reseñas Google en `/casos-reales` desde `testimonials.ts`. |
| SEO-005 | 2026-06-04 | Redirección 301 alcohncnc.com → alcohnsellos.com (GoDaddy + hosting). |
| SEO-006/007 | 2026-06-04 | Search Console + GA4 configurados (indexación en curso). |
| SEO-013 | 2026-06-04 | GBP alineado con dirección schema (Alberti y Güemes, 7600). |
| SEO-010 | 2026-06-04 | Precios "desde" en home, productos, landings /sellos/*, estándar; `PriceFrom`, `pricing.ts`. |
| — | 2026-06-04 | Dirección LocalBusiness en schema (Alberti y Güemes, CP 7600). |

---

## Fuentes del informe

- alcohnsellos.com, alcohncnc.com
- hanko.ar, distylo.com.ar, MercadoLibre, crelacre, lafabricacuero.com.ar
- Instagram @alcohn.cnc

**Documento relacionado en repo:** `docs/seo-auditoria-2026-05.md` (auditoría anterior; varias tareas ya marcadas hechas).
