Prompt para Cursor (Next.js + Tailwind) – Página Productos Alcohn

Contexto / rol
Actuá como Senior UX/UI + Frontend Engineer. Estoy construyendo la web de Alcohn (sellos de bronce premium para marcar cuero y madera). El estilo debe sentirse hiper tecnológico, industrial, preciso, premium, tipo “catálogo europeo” con mucho aire, grillas limpias, tipografía sobria, y producto como protagonista.

Stack

Next.js (App Router)

TailwindCSS

Componentes accesibles, responsive, performance-first

Preferir Server Components donde aplique, y Client Components sólo para interacciones (filtros, wizard).

Objetivo

Implementar una Product Listing Page + Product Detail (Product Sheet) + CTA de compra que abre un flujo en otra pestaña/página:
Qué querés marcar → subir logo → elegir medida (3 opciones + precios) → vista muestra digital automática → datos de pago (transferencia).

Referencias estéticas (importante)

Inspirate en:

Grid minimal premium tipo catálogo (cards simples, mucha respiración).

Ficha técnica tipo “product sheet” con imagen grande + specs + pequeño dibujo/diagrama.

Nada marketinero, nada ruidoso. Mucho blanco / gris cálido muy leve. Bordes suaves, sombras casi imperceptibles, micro-interacciones sutiles.

Información funcional (reglas)

Catálogo con precios visibles.

Sólo dos familias reales:

Sellos personalizados

Abecedarios de bronce

La PLP (productos) debe permitir filtrar por “qué querés marcar” (ej: cuero / madera / ambos).

Al elegir “cuero” o “madera”, deben cambiar las fotos/preview de las cards para mostrar el sello aplicado en ese material (mismo producto, diferente imagen).

Cada producto tiene:

name

short description (1 línea máximo)

price (desde / fijo)

category (sello | abecedario)

images: default, onLeather, onWood

specs para ficha técnica (material, proceso, profundidad, tiempos, etc.)

CTA principal:

En cards: “Comprar” abre /buy (nueva pestaña) con el wizard.

En product sheet: “Comprar” + “Ver ficha técnica PDF” (puede ser placeholder).

Diseño UI
Layout general

Fondo: blanco o gris muy claro (#f6f5f2-ish).

Contenedor centrado, max-w-6xl o max-w-7xl.

Grilla PLP: 3 columnas desktop, 2 tablet, 1 mobile.

Cards: imagen cuadrada o 4:3, con fondo neutro y sombra mínima.

Tipografía: usar system font o Inter (si ya está), tracking levemente abierto en títulos.

Header de la página productos

Título: “Productos”

Subtítulo corto: “Sellos de bronce y abecedarios. Precisión industrial para cuero y madera.”

Barra de controles:

Segment control: Qué querés marcar: [Cuero] [Madera] [Ambos]

Filtro: [Todos] [Sellos] [Abecedarios]

Orden: “Destacados / Menor precio / Mayor precio”

Search opcional (si suma, minimal).

Card de producto

Imagen protagonista

Nombre

Precio (visible, sobrio)

Tag pequeño (SELL0 / ABECEDARIO)

Acciones:

“Ver ficha”

“Comprar” (primary)

Hover: elevar 1-2px, borde levemente más oscuro, transición suave 150-200ms.

Product Sheet (detalle)

Layout tipo ficha técnica:

Columna izquierda: imagen grande + thumbnails (según cuero/madera/ambos).

Columna derecha: nombre, precio, CTA comprar, bullets de valor (3 máximo), y tabla de specs.

Sección “Especificaciones” estilo tabla:

Material: Bronce

Uso: cuero/madera

Proceso: CNC alta precisión

Profundidad: (placeholder)

Tiempo de producción: (placeholder)

Incluye: (placeholder)

Sección “Diagrama” (placeholder) con un mini SVG simple o caja con “Diagrama técnico”.

Sección “FAQ técnico” 3 items (acorde industrial).

Wizard de compra (/buy)

Abrir en nueva pestaña desde “Comprar”.

Steps (paso a paso)

Qué querés marcar

Selección: cuero / madera / ambos

Subir logo

Upload (png/jpg/svg)

Validación mínima, preview

Elegir medida

Mostrar 3 opciones calculadas/placeholder:

Opción S / M / L (o 30mm/40mm/50mm)

Cada una con precio

Recomendación automática (badge “Recomendado”)

Muestra digital automática

Generar mock digital placeholder:

Mostrar el logo sobre textura (según material elegido)

Nota: “Vista previa estimada”

Pago

Mostrar datos de transferencia (placeholder)

CTA: “Enviar comprobante por WhatsApp”

Confirmación final (sin checkout real por ahora)

UX importante

Progress bar / stepper arriba

Botones: Atrás / Continuar

Guardar estado en URL o localStorage (simple)

Diseño sobrio industrial, nada infantil.

Implementación (requerimientos de código)

Crear rutas:

/products (listing)

/products/[slug] (detalle tipo ficha)

/buy (wizard)

Crear estructura de datos mock en src/data/products.ts (o similar) con 6-10 productos ejemplo.

Crear componentes:

ProductGrid

ProductCard

ProductFilters

ProductSheet

BuyWizard (client)

Stepper

Tailwind:

Definir tokens simples (spacing, border, shadow)

Evitar colores saturados. Accent mínimo (negro/gris).

Accesibilidad:

Botones con focus ring

Inputs accesibles

Performance:

next/image con sizes correctos

Evitar re-renders innecesarios

Entregables que quiero que generes ahora

Código completo de:

app/products/page.tsx

app/products/[slug]/page.tsx

app/buy/page.tsx

Componentes en src/components/...

Data mock src/data/products.ts

Estilos Tailwind necesarios (si hace falta, proponer ajustes en tailwind.config pero sin inventar plugins raros).

Dejar placeholders claros donde luego conectaremos la generación real de mockup y el cálculo real de medidas.