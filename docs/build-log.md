# Build Log - Alcohn Web

Este archivo documenta el progreso de construcción del sitio web de Alcohn.

## 1. Estructura base
- [x] Creada app con Next.js 14 (app router)
- [x] Configurado TypeScript
- [x] Configurado TailwindCSS con paleta industrial minimal/high-tech
- [x] Creada estructura de carpetas según guardrails
- [x] Creado layout base con Header y Footer

## 2. Archivos de datos y configuración
- [x] Creado `/src/data/faq.ts` con preguntas frecuentes
- [x] Creado `/src/data/products.ts` con productos mock
- [x] Creado `/src/data/brands.ts` con marcas que confían
- [x] Creado `/src/data/process.ts` con pasos del proceso
- [x] Creado `/src/types/index.ts` con tipos compartidos
- [x] Creado `/src/lib/config.ts` con configuración centralizada (WhatsApp, envíos, etc.)

## 3. Componentes reutilizables
- [x] Creado `Hero.tsx` - Hero con CTAs
- [x] Creado `SectionTitle.tsx` - Títulos de sección
- [x] Creado `Timeline.tsx` - Timeline de pasos
- [x] Creado `FaqList.tsx` - Lista de FAQs con acordeón
- [x] Creado `ProductCard.tsx` - Card de producto
- [x] Creado `ProductsGrid.tsx` - Grid de productos
- [x] Creado `LogoCloud.tsx` - Nube de logos de marcas
- [x] Creado `WhatsappButton.tsx` - Botón de WhatsApp con mensaje prellenado
- [x] Creado `ContactForm.tsx` - Formulario de contacto
- [x] Creado `Header.tsx` - Header con navegación
- [x] Creado `Footer.tsx` - Footer con links

## 4. Componentes de cotización
- [x] Creado `cotizar/UploadStep.tsx` - Paso de subida de logo
- [x] Creado `cotizar/MaterialStep.tsx` - Paso de selección de material
- [x] Creado `cotizar/SizeStep.tsx` - Paso de selección de medida
- [x] Creado `cotizar/SummaryStep.tsx` - Resumen de cotización
- [x] Creado `cotizar/ActionsStep.tsx` - CTAs finales (comprar/WhatsApp)

## 5. Páginas principales
- [x] Creada página `/` (Home) según `02-home-landing.md`
- [x] Creada página `/cotizar` con flujo completo
- [x] Creada página `/proceso` según `04-proceso-como-funciona.md`
- [x] Creada página `/sobre-alcohn` según `07-sobre-alcohn.md`
- [x] Creada página `/faq` según `08-faq.md`
- [x] Creada página `/contacto` según `09-contacto-y-whatsapp.md`
- [x] Creada página `/casos-reales` según `06-casos-reales-y-confianza.md`
- [x] Creada página `/productos` (listado) según `03-productos.md`
- [x] Creada página `/productos/[slug]` (detalle) dinámica
- [x] Creada página `/checkout` (placeholder) según `10-checkout-y-pagos.md`
- [x] Creada página `not-found.tsx` para 404

## 6. SEO y metadatos
- [x] Agregados metadatos básicos en layout principal
- [x] Agregados metadatos específicos en cada página
- [x] Keywords según `11-seo-y-contenidos.md`

## 7. Pendientes / TODOs

### Datos que faltan confirmar
- [ ] Precios exactos de sellos (actualmente mock: $44.000 desde)
- [ ] Precios exactos de envío (actualmente: domicilio $8.000, sucursal $5.000)
- [ ] Número de WhatsApp real (actualmente placeholder)
- [ ] Tiempo exacto de producción (actualmente: 10 días hábiles)

### Imágenes y contenido visual
- [ ] Agregar imágenes reales de sellos en productos
- [ ] Agregar imágenes reales en casos reales
- [ ] Agregar logos reales de marcas que confían
- [ ] Agregar imágenes en home (sello marcando cuero, máquina CNC)

### Funcionalidades pendientes
- [ ] Implementar subida real de logos (actualmente simulada)
- [ ] Conectar cotizador con backend/IA para sugerencia de medidas real
- [ ] Implementar checkout completo con pasarela de pago
- [ ] Conectar formulario de contacto con webhook/email
- [ ] Implementar lógica de cálculo de precios real basada en medidas

### Mejoras futuras
- [ ] Agregar blog/recursos según `11-seo-y-contenidos.md`
- [ ] Implementar sistema de testimonios dinámico
- [ ] Agregar página de políticas (opcional según arquitectura)
- [ ] Agregar página `/gracias` post-formulario/compra

## 8. Revisión de identidad de marca [✔️ Completada]

### Ajustes de paleta de colores
- [✔️ Ajustado] Actualizada paleta de Tailwind: reemplazado amarillo/verde flúo por dorado (`#D4AF37`), plateado y bronce
- [✔️ Ajustado] Agregados colores `bronce` y `silver` a la configuración de Tailwind
- [✔️ Ajustado] Reemplazadas todas las referencias a `accent-green` por `accent-light` en componentes

### Ajustes de tono y contenido
- [✔️ Ajustado] **Home (`/`):** Actualizado hero con frase "Tu marca, grabada para siempre" y subtítulo más emocional
- [✔️ Ajustado] **Home:** Mejorado CTA final con mensaje "¿Listo para contar tu historia?" y texto sobre legado
- [✔️ Ajustado] **Sobre Alcohn:** Reescrito con tono más humano, incluyendo historia desde 2019, valores completos y misión
- [✔️ Ajustado] **Proceso:** Mejorado subtítulo y sección técnica con tono más cercano y explicativo
- [✔️ Ajustado] **Cotización:** Agregado subtítulo emocional "Tu historia merece un sello que la represente"
- [✔️ Ajustado] **FAQ:** Mejorado subtítulo con tono más conversacional
- [✔️ Ajustado] **Contacto:** Agregado mensaje más humano en subtítulo y sección de WhatsApp

### Ajustes de CTAs
- [✔️ Ajustado] Todos los CTAs ahora usan color `accent` (dorado) en lugar de `primary` (negro)
- [✔️ Ajustado] FAQ: CTA cambiado de "Contactanos" a "Hablar por WhatsApp" (más directo)
- [✔️ Ajustado] Todos los botones principales mantienen coherencia visual con paleta dorado/negro

### Ajustes visuales
- [✔️ Ajustado] **Timeline:** Cambiado color de números de `accent` a `bronce` para mejor coherencia
- [✔️ Ajustado] **ProductCard:** Botón actualizado a color `accent` (dorado)
- [✔️ Ajustado] **ContactForm:** Botón actualizado a color `accent` (dorado)

### SEO y metadatos
- [✔️ Ajustado] Actualizado título principal: "Alcohn - Sellos de bronce personalizados | Hecho en Argentina con CNC"
- [✔️ Ajustado] Descripción mejorada con frases clave: "Más que una herramienta, una forma de contar tu historia"
- [✔️ Ajustado] Keywords actualizadas: agregado "hecho en Argentina, precisión CNC, profesionalización del oficio"

### Componentes mejorados
- [✔️ Ajustado] **UploadStep:** Agregado mensaje tranquilizador "No te preocupes si no tenés el archivo perfecto"
- [✔️ Ajustado] Todos los componentes mantienen coherencia con identidad de marca

### Testimonios reales
- [✔️ Ajustado] Creado `/src/data/testimonials.ts` con 9 testimonios reales de clientes
- [✔️ Ajustado] **Casos reales:** Actualizada sección de testimonios con casos reales, diseño en grid 2 columnas con borde bronce
- [✔️ Ajustado] Título de sección cambiado a "Lo que dicen nuestros clientes" con subtítulo descriptivo
- [✔️ Ajustado] Creado componente `TestimonialsCarousel.tsx` - Carrusel moderno que muestra 2 testimonios a la vez (1 en mobile)
- [✔️ Ajustado] Carrusel incluye: navegación con flechas, indicadores de puntos, contador de slides, transiciones suaves

## 9. Notas técnicas
- El proyecto sigue la estructura de carpetas definida en `13-architecture-guardrails.md`
- Todos los datos mock están en `/src/data` y no dentro de componentes
- Los componentes son reutilizables y modulares
- El contenido y tono respetan los documentos en `/docs`, especialmente `14-empresa-alcohn.md` y `15-empresa-alcohn-summary.md`
- El diseño sigue el estilo industrial minimalista con alma artesanal según `12-ui-ux-alcohn.md`
- Paleta de colores: blanco, negro, dorado, plateado, bronce (refleja exclusividad, distinción y calidad)
- Tono de comunicación: inspirador, cercano, argentino, profesional, con orgullo del oficio

