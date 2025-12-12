# Architecture Guardrails – Alcohn Web

Este documento define cómo debe estructurarse el proyecto para que sea modular, mantenible y fácil de iterar. Cursor debe respetar estas reglas al crear nuevas páginas o componentes.

## 1. Stack objetivo
- Framework: Next.js (app router)
- Lenguaje: TypeScript
- Estilos: TailwindCSS
- Idioma del contenido: español (Argentina)

## 2. Principios
1. **Separación de responsabilidades**: las páginas solo orquestan contenido, los componentes hacen el layout.
2. **Reutilización**: hero, timeline, faq, cards de producto deben ser componentes reutilizables en `/components`.
3. **Contenido afuera del código**: todo el contenido fijo que ya está en `/docs` debe respetarse. Si hace falta más detalle, dejar marcado con TODO.
4. **Crecimiento**: la página de cotización debe pensarse para luego conectarse a backend/IA sin romper la UI.

## 3. Estructura de carpetas sugerida

```text
/src
  /app
    (rutas de páginas)
  /components
    (componentes UI reutilizables)
  /lib
    (helpers, formateadores, datos simulados)
  /data
    (arrays de FAQs, productos mock, etc.)
  /styles
    (si hace falta)
  /types
    (tipos compartidos)
3.1. /app

/app/page.tsx → home usando /docs/02-home-landing.md

/app/productos/page.tsx → listado general

/app/productos/[slug]/page.tsx → detalle por tipo de producto (cuero, madera…)

/app/proceso/page.tsx

/app/cotizar/page.tsx

/app/casos-reales/page.tsx

/app/sobre-alcohn/page.tsx

/app/faq/page.tsx

/app/contacto/page.tsx

/app/checkout/page.tsx (puede ser placeholder)

3.2. /components

Hero.tsx

SectionTitle.tsx

BenefitsGrid.tsx

ProductsGrid.tsx

Timeline.tsx

FaqList.tsx

ContactForm.tsx

WhatsappButton.tsx

MockUploadForm.tsx (para /cotizar)

LogoCloud.tsx (marcas que confían)

3.3. /data

faq.ts → basado en /docs/08-faq.md

products.ts → basado en /docs/03-productos.md

brands.ts → logos o nombres de clientes

process.ts → pasos del proceso

Esto permite que el contenido se cambie sin tocar JSX.

## 4. Componentes reutilizables obligatorios

Hero: recibe título, subtítulo, CTAs.

Timeline: recibe array de pasos.

FAQ: recibe array de preguntas/respuestas.

ProductsGrid: recibe array de productos.

ContactForm + WhatsappButton: para contacto rápido.

## 5. Página de cotización /cotizar

Debe estar dividida en pasos:

Subir logo

Elegir material

Elegir medida sugerida

Mostrar precio estimado

Mostrar CTA (comprar / WhatsApp)

Cada paso debe ser un componente separado dentro de /components/cotizar/

UploadStep.tsx

MaterialStep.tsx

SizeStep.tsx

SummaryStep.tsx

ActionsStep.tsx

El estado se puede manejar en la página con un hook, no hace falta Zustand todavía.

## 6. Logging de avances

Crear un archivo en /docs/build-log.md donde el sistema (o vos) vaya anotando qué se creó y qué falta.

Formato sugerido:

# Build Log

## 1. Estructura base
- [x] Creada app con Next.js
- [ ] Creada página /productos
- [ ] Creada página /cotizar
- [ ] Componentes base

## 2. Pendientes
- [ ] Conectar cotizador a backend
- [ ] Reemplazar precios mock con tabla real

Cursor debe mantener este estilo cuando agregue nuevas páginas.

## 7. Estándares de código

Usar funciones de servidor solo cuando sea necesario.

Nombrar componentes en PascalCase.

Tipar props de los componentes.

No mezclar datos mock dentro del componente; importarlos desde /data.

## 8. Tono y contenido

Siempre usar el contenido de /docs/*.md como verdad.

Si algún dato no está (precio exacto, tiempos, costo de envío) dejar TODO: en el código o en /docs/build-log.md.

## 9. Finalidad

La finalidad de estas guardrails es que el proyecto quede profesional, ordenado y extensible para:

conectar con tu app de mockups,

conectar con un backend,

cambiar precios sin tocar componentes.
