# Auditoría SEO — Alcohn

**Dominio:** alcohncnc.com
**Fecha:** 2026-05-29
**Alcance:** SEO técnico + on-page + performance + local. Solo informe, sin aplicar cambios.

---

## 0. TL;DR — Qué te llevás de este informe

El sitio está **bien por dentro** (contenido claro, jerarquía de H1/H2 correcta, alt text en la mayoría de imágenes, URLs limpias en castellano). Pero le falta casi toda la "envoltura" que Google necesita para encontrarlo, entenderlo y rankearlo:

1. **No existe `robots.txt`** → Google no tiene instrucciones de qué indexar.
2. **No existe `sitemap.xml`** → Google tiene que descubrir cada página a mano.
3. **No hay datos estructurados (Schema.org)** → no aparecés con estrellitas, FAQs ni ficha de negocio local en los resultados.
4. **Solo 1 de 20 páginas tiene Open Graph** → cuando alguien comparte el link por WhatsApp se ve feo.
5. **190 MB de imágenes sin optimizar** (algunas de 13 MB) → mata la velocidad en móvil, y la velocidad es factor de ranking.
6. **No tenés Google Search Console, Google Analytics ni Google Business Profile** → estás "ciego" frente a Google y no apareces en Maps.

Ninguno es difícil de arreglar. Te dejo abajo el detalle, ordenado por prioridad.

---

## Estado de implementación (seguimiento)

Última actualización: **2026-05-29**

### Sprint 1 — Quick wins críticos
- [x] Crear `src/app/robots.ts`.
- [x] Crear `src/app/sitemap.ts`.
- [x] Agregar `metadataBase` en `src/app/layout.tsx`.
- [x] Agregar `openGraph` y `twitter` por defecto en `src/app/layout.tsx`.
- [x] Crear imagen OG dedicada 1200×630 (`/public/og-default.jpg`).
- [x] Agregar JSON-LD `Organization` en layout raíz.
- [x] Agregar JSON-LD `LocalBusiness` en `/contacto` y `/sobre-alcohn`.
- [x] Agregar JSON-LD `FAQPage` en `/faq`.
- [x] Google Business Profile *(confirmado por vos como ya hecho)*.
- [ ] Google Search Console + envío de sitemap *(pendiente de configuración externa)*.

### Sprint 2 — Calidad por página
- [x] Sprint 2 completo (canonical, OG por página, metadata en `/sellos/estandar` y Product/Breadcrumb schema).
- [x] Marcar `/buy`, `/carrito`, `/checkout/*` con `robots: noindex`.
- [x] Agregar `canonical` en páginas principales (`/`, `/productos`, `/abecedarios`, `/proceso`, `/como-usar-sellos`, `/faq`, `/casos-reales`, `/sobre-alcohn`, `/contacto`).
- [x] Agregar `openGraph` y `twitter` en páginas principales.
- [x] Completar `generateMetadata` de `/productos/[slug]` y `/sellos/[slug]` con `canonical` + `openGraph` + `twitter`.
- [x] Resolver metadata de `/sellos/estandar` y `/sellos/estandar/[slug]` usando `layout.tsx` server-side.
- [x] Agregar JSON-LD `Product` y `BreadcrumbList` en `/productos/[slug]`, `/sellos/[slug]` y `/sellos/estandar/[slug]`.
- [x] Agregar JSON-LD `BreadcrumbList` en páginas internas principales.
- [x] Reemplazar `<img>` por `next/image` en `src/components/MobileOverlayCarousel.tsx`.
- [x] Reemplazar los `<img>` restantes por `next/image` en `src/components/buy/StampSizeScalePreview.tsx`.
- [x] Crear `src/app/manifest.ts` (genera `/manifest.webmanifest`) con nombre, colores e ícono base.
- [x] Completar paquete de favicon/íconos (`src/app/favicon.ico`, `src/app/apple-icon.png`, `public/apple-touch-icon.png`).
- [x] Agregar comando `npm run seo:assets` para regenerar OG + favicons.
- [x] Agregar JSON-LD `WebSite` en la home (`src/app/page.tsx`).
- [x] Agregar JSON-LD `CollectionPage` en `/productos` (`src/app/productos/page.tsx`).
- [x] Crear script de optimización masiva de imágenes WebP: `scripts/optimize-images.mjs`.
- [x] Agregar comando `npm run images:optimize`.
- [x] Ejecutar `npm run images:optimize` sobre `public/images`.
- [x] Resultado de la ejecución: 125 imágenes convertidas, de **188.6 MB** a **10.6 MB** (ahorro aprox. **94.4%**).
- [x] Actualizar referencias de imágenes principales del sitio a `.webp` (home, productos, abecedarios, casos, carruseles, logos de marcas y clientes).

### Pendiente externo / siguiente fase
- [ ] Google Search Console + envío de sitemap *(configuración externa)*.
- [ ] Medir antes/después en PageSpeed Insights y guardar capturas.
- [ ] Sprint 4 — blog / contenido long tail (continuo).

## 1. SEO técnico (lo crítico)

### 1.1. Falta `robots.txt`
**Estado:** no existe.
**Por qué importa:** es el primer archivo que pide Google al visitar tu sitio. Sin él, asume "todo abierto", pero también queda en duda si hay sitemap.
**Solución:** crear `src/app/robots.ts` (lo soporta Next.js 14 nativamente) apuntando al sitemap.

### 1.2. Falta `sitemap.xml`
**Estado:** no existe.
**Por qué importa:** es el listado oficial de URLs del sitio. Sin sitemap, Google tarda semanas en descubrir productos nuevos (sellos estándar, casos de uso, etc.).
**Solución:** crear `src/app/sitemap.ts` que incluya:

- Home `/`
- `/productos` y cada `/productos/[slug]` (productos estáticos)
- `/sellos/[slug]` (los 9 use-cases: para-madera, para-cuero, para-ceramica, para-jabon, para-packaging, para-lacre, para-hielo, para-pan, para-fruta)
- `/sellos/estandar` y cada `/sellos/estandar/[slug]` (los 13 diseños)
- `/abecedarios`, `/proceso`, `/como-usar-sellos`, `/faq`, `/casos-reales`, `/sobre-alcohn`, `/contacto`
- **No incluir:** `/buy`, `/carrito`, `/checkout/*` (son flujos privados).

### 1.3. Falta `metadataBase` en el layout raíz
**Estado:** `src/app/layout.tsx` no define `metadataBase`.
**Por qué importa:** sin esto, todas las URLs de Open Graph (imágenes para compartir) salen como rutas relativas y se rompen cuando alguien comparte el link.
**Solución:** agregar `metadataBase: new URL('https://alcohncnc.com')` en el `metadata` del layout.

### 1.4. Falta Open Graph + Twitter en todas las páginas (excepto `/sellos/[slug]`)
**Estado:** solo `src/app/sellos/[slug]/page.tsx` define `openGraph`. El resto no.
**Por qué importa:** cuando alguien manda el link de tu home, FAQ, o un producto por WhatsApp / Instagram / Facebook, no aparece preview con imagen. Se ve el link "pelado". Pésimo para conversión.
**Solución:**
- En el layout raíz, definir `openGraph` y `twitter` por defecto (con la imagen `/og-default.jpg` de 1200×630).
- Crear una imagen Open Graph por defecto: 1200×630 px, logo + claim "Sellos de bronce hechos en CNC".
- En las páginas con `generateMetadata` (productos, sellos), agregar `openGraph` con la imagen específica del producto.

### 1.5. Falta `alternates.canonical` en todas las páginas
**Estado:** ninguna página declara URL canónica.
**Por qué importa:** evita problemas de contenido duplicado (por ejemplo si alguien linkea con `?utm_source=...` o `www.` vs sin `www.`).
**Solución:** en cada `metadata` / `generateMetadata`, agregar `alternates: { canonical: '/ruta' }`.

### 1.6. Falta `keywords` ya no aplica
**Estado:** el layout tiene `keywords: 'sello de bronce, ...'`.
**Por qué importa:** Google dejó de usar la metaetiqueta `keywords` en 2009. No hace daño pero no suma. Se puede dejar o quitar; no es prioridad.

### 1.7. Falta favicon completo y manifest
**Estado:** solo hay `src/app/icon.svg`. No hay `favicon.ico`, `apple-touch-icon.png` ni `manifest.json`.
**Por qué importa:** safari iOS y Android usan apple-touch-icon. Sin manifest no se puede "agregar a pantalla de inicio".
**Solución:** generar set completo de favicons (https://realfavicongenerator.net) y un `manifest.json` mínimo con nombre, color de tema y los íconos.

---

## 2. Datos estructurados (Schema.org / JSON-LD) — **0 actualmente**

Esto es lo que más impacto inmediato tiene para Alcohn porque te diferencia visualmente en los resultados de Google.

### 2.1. Organization (en el layout raíz)
Identifica a Alcohn como empresa. Incluir nombre, logo, web, sameAs (redes sociales).

### 2.2. LocalBusiness (en `/sobre-alcohn` y `/contacto`)
**Crítico para SEO local en Mar del Plata.** Incluye dirección, teléfono, horario, geo coordinates, area servida. Hace que aparezcas en búsquedas tipo "sellos de bronce Mar del Plata" y en Google Maps.

### 2.3. Product (en `/productos/[slug]` y `/sellos/[slug]` y `/sellos/estandar/[slug]`)
Ficha de producto con nombre, imagen, descripción, precio, marca ("Alcohn"), `availability`. Google muestra precio y disponibilidad directamente en los resultados.

### 2.4. FAQPage (en `/faq`)
Las FAQs marcadas con Schema aparecen como acordeón directamente en los resultados de Google. Gran ganancia de CTR.

### 2.5. BreadcrumbList (en páginas internas)
Muestra la ruta de navegación ("Inicio > Productos > Sello para cuero") debajo del título en Google.

### 2.6. Review/AggregateRating (en `/casos-reales` o en productos)
Si tenés testimonios reales, marcarlos como Review hace que aparezcan estrellas en resultados.

---

## 3. Auditoría por página (metadatos)

| Página | Title | Description | OG | Twitter | Canonical | JSON-LD | Acción |
|---|---|---|---|---|---|---|---|
| `/` (home) | ✅ (del layout) | ✅ | ❌ | ❌ | ❌ | ❌ | Agregar metadata propia + OG + WebSite schema |
| `/productos` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Agregar OG + CollectionPage schema |
| `/productos/[slug]` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Agregar OG con imagen del producto + Product schema |
| `/sellos/[slug]` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | Solo falta twitter + canonical + Product schema |
| `/sellos/estandar` | ❌ (sin metadata) | ❌ | ❌ | ❌ | ❌ | ❌ | **Es 'use client', mover metadata a parent o convertir a server** |
| `/sellos/estandar/[slug]` | ❌ (sin metadata) | ❌ | ❌ | ❌ | ❌ | ❌ | **Es 'use client' — los 13 productos no se indexan bien** |
| `/abecedarios` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Agregar OG + Product schema |
| `/proceso` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Agregar OG + HowTo schema (gran oportunidad) |
| `/como-usar-sellos` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Agregar OG + HowTo schema |
| `/faq` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Agregar OG + **FAQPage schema** (alto impacto) |
| `/casos-reales` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Agregar OG |
| `/sobre-alcohn` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Agregar OG + **LocalBusiness schema** |
| `/contacto` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Agregar OG + **LocalBusiness schema** |
| `/buy`, `/carrito`, `/checkout` | — | — | — | — | — | — | Excluir del sitemap. Agregar `robots: { index: false }` |

**Problema serio:** `/sellos/estandar` y `/sellos/estandar/[slug]` son `'use client'`. En Next 14, los client components no pueden exportar `metadata`. Esto significa que los 13 productos estándar **no tienen título, descripción ni OG propios**. Hay dos formas de resolverlo:

- Convertir esas páginas a server component y mover el estado interactivo a un sub-componente cliente.
- Crear un `layout.tsx` en cada carpeta con la metadata.

---

## 4. SEO on-page (lo que ya está bien)

- ✅ Lang declarado: `<html lang="es">` correcto.
- ✅ Un H1 por página (Hero o PageIntro). No hay páginas con múltiples H1.
- ✅ Jerarquía H1 → H2 → H3 correcta.
- ✅ URLs limpias en castellano (`/sellos/para-cuero`, `/abecedarios`).
- ✅ Alt text presente en casi todas las imágenes (revisé `<Image>` y todas tienen `alt`).
- ✅ Internal linking razonable (footer, header, CTAs cruzadas).
- ✅ Redirect 301 de `/sellos/personalizados → /productos` ya configurado.

### Detalles menores a corregir
- `MobileOverlayCarousel.tsx` usa `<img>` en vez de `next/image` → no se beneficia de la optimización automática.
- Algunos `alt=""` (4 casos) en componentes decorativos: revisar si son realmente decorativos o si deberían describir la imagen.

---

## 5. Performance / Core Web Vitals — **prioridad alta**

Google usa LCP, CLS e INP como factores de ranking. En móvil esto es decisivo.

### 5.1. Imágenes sin optimizar — el problema más grande
- Total de `/public/images`: **190 MB**.
- 25+ imágenes pesan más de **1 MB cada una**.
- Top 3 monstruos:
  - `public/images/cuero/DSCF7804.jpg` → **13.9 MB**
  - `public/images/cuero/DSCF2235.JPG` → **10.8 MB**
  - `public/images/cuero/DSCF7781.jpg` → **10.3 MB**
- 114 archivos PNG, **solo 4 WebP**. PNG es 3–5× más pesado que WebP a igual calidad.

**Acciones:**
1. Convertir todo `/public/images/` a WebP o AVIF (script Node con `sharp`, que ya está en `package.json`).
2. Redimensionar: ninguna imagen debería superar los **1920px de ancho** (la mayoría se muestran en cards de 600×600).
3. Apuntar a **<200 KB por imagen** salvo el hero (que puede ser <400 KB).
4. Después de la conversión, el peso debería bajar de 190 MB a ~20 MB.

### 5.2. Font
✅ Usa `next/font/google` con Inter. Bien.

### 5.3. Scripts
✅ No hay scripts pesados sin `next/script`. Bien.

### 5.4. Sugerencia: medir con PageSpeed Insights
Antes y después de optimizar imágenes, correr https://pagespeed.web.dev/ sobre `alcohncnc.com` y dejar capturas para comparar.

---

## 6. Keywords objetivo (deducidas del contenido)

### Primarias (alta intención de compra, foco principal)
- sello de bronce personalizado
- sello de bronce para cuero
- sello de bronce para madera
- sello para marroquinería
- sello para alimentos
- sello CNC
- sellos personalizados Argentina

### Secundarias (use cases, ya cubiertos con URLs)
- sello para cerámica, sello para jabón artesanal, sello para packaging, sello para lacre, sello para hielo, sello para pan, sello para fruta
- abecedarios de bronce
- sello con logo

### Locales (críticas, hoy sin trabajo SEO local)
- sellos de bronce Mar del Plata
- fabricación CNC Mar del Plata
- sellos personalizados Argentina

### Long tail (oportunidades de blog futuro, sin trabajar)
- cómo marcar cuero sin quemarlo
- qué medida de sello elegir
- diferencia entre sello de bronce y sello de goma
- cómo vectorizar un logo para sello

> En el archivo `11-seo-y-contenidos.md` ya están listadas estas keywords y notas para blog. La estrategia base está pensada — falta ejecutarla.

---

## 7. SEO local (Mar del Plata) — gran oportunidad sin tocar

Alcohn es un negocio físico en Mar del Plata. Hoy no aparece en Google Maps ni en búsquedas locales.

**Acciones (gratis):**
1. **Crear Google Business Profile** (https://business.google.com): nombre "Alcohn", categoría "Fabricación de sellos" o "Servicios de grabado", dirección del taller, horario, fotos, web, WhatsApp.
2. Agregar **LocalBusiness JSON-LD** en `/sobre-alcohn` y `/contacto` con las mismas coordenadas y datos.
3. Listar Alcohn en directorios locales: Páginas Amarillas, Guía Oeste, MercadoLibre Mar del Plata, etc. (genera backlinks locales).

---

## 8. Herramientas externas a configurar (todas gratis)

| Herramienta | Para qué | Prioridad |
|---|---|---|
| **Google Search Console** | Ver qué búsquedas te encuentran, errores de indexación, enviar sitemap | 🔴 Alta |
| **Google Business Profile** | Aparecer en Maps y búsquedas locales | 🔴 Alta |
| **Google Analytics 4 (GA4)** | Tráfico, fuentes, comportamiento — opcional si ya usás analytics propio | 🟡 Media |
| **Bing Webmaster Tools** | Mismo que Search Console pero para Bing/DuckDuckGo | 🟢 Baja |
| **PageSpeed Insights** | Medir Core Web Vitals (no requiere cuenta) | 🔴 Alta |

> Para todas estas necesitás verificar que sos el dueño del dominio. Se hace agregando un meta tag al `<head>` o un archivo en `/public`. Lo dejamos para cuando avancemos.

---

## 9. Plan de acción priorizado

### 🔴 Sprint 1 — Quick wins críticos (1–2 días de trabajo)
1. Crear `robots.ts` y `sitemap.ts` en `src/app/`.
2. Agregar `metadataBase`, `openGraph` y `twitter` por defecto en el layout raíz.
3. Crear imagen Open Graph 1200×630 (`/public/og-default.jpg`).
4. Agregar JSON-LD **Organization** en el layout raíz.
5. Agregar JSON-LD **LocalBusiness** en `/contacto` y `/sobre-alcohn`.
6. Agregar JSON-LD **FAQPage** en `/faq`.
7. Crear cuentas de Google Search Console + Google Business Profile y enviar el sitemap.

### 🟠 Sprint 2 — Calidad por página (2–3 días)
1. Agregar `alternates.canonical` en todas las páginas.
2. Agregar `openGraph` específico en cada `generateMetadata` de productos y use cases.
3. Convertir `/sellos/estandar` y `/sellos/estandar/[slug]` a server components (o usar layouts) para poder declarar metadata.
4. Agregar JSON-LD **Product** en productos y sellos.
5. Agregar JSON-LD **BreadcrumbList** en páginas internas.
6. Marcar `/buy`, `/carrito`, `/checkout/*` con `robots: { index: false }`.

### 🟡 Sprint 3 — Performance (1 semana)
1. Script Node con `sharp` para convertir todo `/public/images/` a WebP optimizado.
2. Redimensionar a <1920px.
3. Cambiar `<img>` por `<Image>` en `MobileOverlayCarousel`.
4. Medir antes/después en PageSpeed Insights.

### 🟢 Sprint 4 — Contenido / blog (continuo)
1. Crear `/blog` o `/recursos` con los 4 artículos ya planeados en `11-seo-y-contenidos.md`.
2. Optimizar cada artículo para long tail.
3. Linkear desde productos relacionados.

---

## 10. Anexo — Archivos y rutas relevantes

**Para tocar metadatos / SEO técnico:**
- `src/app/layout.tsx` — root metadata
- `src/app/page.tsx` — home (sin metadata propia hoy)
- `src/app/sellos/[slug]/page.tsx` — la única página con OG hoy
- `src/app/productos/[slug]/page.tsx` — `generateMetadata` básico
- `src/app/sellos/estandar/page.tsx` — `'use client'`, **sin metadata posible**
- `src/app/sellos/estandar/[slug]/page.tsx` — `'use client'`, **sin metadata posible**

**Archivos a crear (no existen):**
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `public/og-default.jpg`
- `public/favicon.ico`, `public/apple-touch-icon.png`, `public/manifest.json`

**Datos para Schema.org (a recolectar):**
- Dirección exacta del taller (calle, número, código postal de Mar del Plata)
- Coordenadas (lat, lng)
- Horario de atención
- Teléfono y WhatsApp visibles
- Redes sociales (Instagram, Facebook, etc.) para `sameAs`

---

¿Avanzamos con el Sprint 1?
