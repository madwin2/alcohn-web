# Plan: compra simple, varios sellos, mobile y nuevos materiales en el generador

Fecha: 10/11/2026 · Estado: **implementado en local (sin commit), salvo los materiales nuevos** (sección 4, en otra sesión)

## Estado de implementación (10/11/2026)

| Parte | Estado | Dónde |
|---|---|---|
| Hueco blanco de la home en celular | Hecho: en celular no hay animación de scroll; el CSS ya no oculta bloques | `homeScrollReveals.ts`, `globals.css` |
| Hero mobile corto | Hecho: "Tu marca, en bronce.", un botón "Elegí tu sello" + link "Probar con mi logo" | `Hero.tsx`, `markets/home.ts` |
| Home reordenada en celular | Hecho: usos → envío gratis → antes/después → trabajos → números → logos → preguntas → CTA. "Más que fabricación" solo en desktop | `HomeLanding.tsx` |
| Compra directa en la ficha | Hecho: chico/mediano/grande con precio real, "¿Qué medidas entran?" con dibujo a escala, cantidad, subir logo opcional, agregar al carrito | `sellos/ProductBuyBox.tsx`, `api/cotizador/categorias` |
| Precio en el servidor por tamaño | Hecho: el checkout cotiza por grupo e ignora el precio del navegador | `checkout/pricing.ts`, `supabase/cartItems.ts` |
| Pedido sin logo | Hecho: entra normal; el sello queda con "Logo pendiente" en la nota y `logo_status` en `item_config` | `supabase/sellosFromCart.ts` |
| WhatsApp para mandar el logo | Hecho en confirmación de transferencia y de tarjeta | `checkout/PendingLogoWhatsapp.tsx`, `lib/pendingLogo.ts` |
| Panel al agregar al carrito | Hecho: uno solo para toda la web, "Agregaste…", barra de envío gratis, accesorio sugerido, "+ Agregar otro sello" | `cart/CartDrawer.tsx`, `CartContext.tsx` |
| Envío gratis desde 3 sellos | Hecho en servidor (`checkout/intent`) y en pantalla (ficha, carrito, checkout, generador, barra superior, FAQ, política de envíos) | `shipping/freeShipping.ts` |
| Soldador para pan y fruta, nada para hielo | Hecho (generador y panel del carrito) | `wizardAddons.ts`, `cartAddonSuggestion.ts` |
| Generador: paso "Tu logo" | Hecho: 4 opciones visibles (subir, foto, nombre, WhatsApp) y barra con "Comprar sin muestra" (lleva a la ficha) | `BuyWizard.tsx`, `buy/WizardTextLogo.tsx` |
| Generador: cantidad y "Agregar otro sello" | Hecho en el último paso; vuelve al paso Logo con uso y contacto guardados y muestra nueva por sello | `BuyWizard.tsx` |
| Materiales nuevos (sección 4) | En otra sesión | — |
| Partir `BuyWizard.tsx` en pasos | No hecho (se pospuso para no pisar el trabajo de materiales en el mismo archivo) | — |
| Compra directa en fichas internacionales | No hecho: solo Argentina (afuera sigue el generador) | — |

Este plan resuelve cuatro problemas:

1. Hoy la única forma de comprar un sello personalizado es pasar por el generador de muestras. Quien no está acostumbrado se traba.
2. No hay forma clara de comprar varios sellos en un mismo pedido, ni de sumar accesorios desde la ficha.
3. En el celular la home tiene mucho texto, aparece un espacio en blanco grande y en el generador hay acciones escondidas.
4. El generador de muestras solo sabe dibujar cuero y madera. Faltan hielo, cáscara de fruta, cerámica y pan de hamburguesa.

---

## Decisiones tomadas (10/11/2026)

| Tema | Decisión |
|---|---|
| Medidas en la ficha | Tres categorías: **Sello chico, mediano y grande**. Al tocar una categoría se muestra a qué medidas corresponde. |
| Subir logo | El botón **"Subir tu logo"** se mantiene en la ficha (opcional). |
| Compra sin logo | Entra como **un pedido normal**, sin estados especiales ni bloqueos. El cliente manda el logo por WhatsApp y **Alcohn lo sube al pedido** desde el panel. |
| Promoción por cantidad | **3 sellos o más → envío gratis.** (No hay descuento en precio.) |
| Accesorio sugerido | Madera → soldador · Cuero → mango de golpe o base remachadora (como hoy) · **Pan → soldador** · **Fruta → soldador** · **Hielo → nada** · Cerámica → nada (no se definió; se deja sin sugerencia). |

"Soldador" en el código es el accesorio `calentador-electrico` (código `soldador`) de `src/data/accessories.ts`. Ya existe, solo hay que sugerirlo en más usos.

---

## 0. Punto de partida (lo que hay hoy en el código)

| Tema | Situación actual | Archivo |
|---|---|---|
| Ficha de producto (`/sellos/para-madera`, etc.) | Solo "Desde $76.000" y un botón **Diseñar para madera** que lleva al generador. Sin medida, cantidad ni carrito. | `src/app/sellos/[slug]/page.tsx` |
| Sellos estándar | Ya tienen "Agregar al carrito" con selector de medida. Sirve de modelo. | `src/app/sellos/estandar/[slug]/page.tsx` |
| Categorías de medida | Ya existen en el generador: listas `sellosChicos`, `sellosMedianos`, `sellosGrandes` y la función `getSizeCategory`. Hay que sacarlas a un archivo compartido. | `src/components/BuyWizard.tsx` (líneas ~190–250) |
| Carrito | Guarda título, medida, precio y cantidad. No guarda el id de la muestra de cada sello ni el uso. | `src/lib/cart.ts`, `src/contexts/CartContext.tsx` |
| Generador (6 pasos) | Material → Logo → Contacto → Vista previa → Medida → Pago. Al final agrega el sello y **salta directo al checkout**. | `src/components/BuyWizard.tsx` (3.900 líneas) |
| Accesorios sugeridos | Solo en el último paso del generador y solo para cuero y madera. | `src/lib/wizardAddons.ts` |
| Envío gratis | No existe ninguna regla de envío gratis hoy. | `src/lib/shipping/*`, `src/lib/checkout/pricing.ts` |
| Materiales en la muestra | `resolveMockupGeneration` y `mapWizardMaterialToMockup` convierten cerámica, hielo, pan y fruta en **madera** o **cuero**. Solo hay 3 texturas (`cuero.jpg`, `madera.jpg`, `madera-quemada.png`). | `src/lib/mockupGenerator.ts`, `src/lib/mockupRender.ts`, `src/lib/mockupPythonLikeEffects.ts` |
| Usos cargados | Existen `para-hielo`, `para-pan`, `para-fruta` (los tres con material `alimentos`) y `para-ceramica`. | `src/data/stampUseCases.ts` |
| Hueco blanco en la home mobile | **Bug confirmado en la web publicada:** la sección siguiente al hero arranca con opacidad 0 y solo aparece cuando la animación de scroll la revela. Mientras tanto queda un hueco de casi una pantalla. | `src/lib/homeScrollReveals.ts`, `src/components/animations/HomeScrollShell.tsx` |

---

## 1. Compra directa desde la ficha

### Objetivo
Comprar un sello personalizado en 3 toques: **tamaño → cantidad → agregar al carrito**. El logo se sube en la ficha si el cliente quiere; si no, lo manda por WhatsApp después. El generador queda como opción "Ver cómo queda mi logo".

### Bloque de compra (reemplaza el bloque actual de precio + botones)

```
SELLO DE BRONCE PARA MADERA
$ 76.000 · o 3 cuotas sin interés de $29.133

1. Elegí el tamaño
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │ Sello chico  │ │ Sello mediano│ │ Sello grande │
   │   $76.000    │ │    $xx       │ │    $xx       │
   └──────────────┘ └──────────────┘ └──────────────┘
   ⓘ ¿Qué medidas entran?          ← al tocar, se despliega:

   Sello chico: hasta 8×1 cm, 4×2 cm, 3×2,5 cm, 2,5×2,5 cm
   [dibujo a escala al lado de una moneda / tarjeta]
   Ideal para: etiquetas, cuero chico, llaveros

2. Cantidad   [ − 1 + ]
   Llevando 3 sellos o más, el envío es gratis.

3. Tu logo (opcional)
   [ ↑ Subir tu logo ]
   ¿No lo tenés a mano? Comprá igual y mandalo por WhatsApp después.

[ AGREGAR AL CARRITO ]           ← botón principal, ancho completo en mobile
[ Ver cómo queda mi logo → ]     ← secundario, abre el generador con el tamaño ya elegido

Fabricación en 72 hs hábiles · Garantía de por vida
```

Reglas:
- **Al tocar cada categoría** se muestra qué medidas incluye (texto + dibujo a escala). El contenido sale de las mismas listas que usa el generador, así nunca quedan distintas.
- Por defecto queda marcada la categoría más vendida en ese uso.
- El precio se actualiza al cambiar tamaño y cantidad.
- La medida exacta dentro de la categoría la define Alcohn al recibir el logo (igual que hoy por WhatsApp). En el carrito y el pedido figura como *"Sello chico (medida final según tu logo)"*.
- "Subir tu logo" es opcional y no frena el botón de agregar.

### Pedido sin logo
- El pedido entra **igual que cualquier otro**, sin estado especial.
- En la página de éxito se agrega un bloque: *"¿Todavía no nos mandaste tu logo? Mandalo por WhatsApp con tu número de pedido #1234"* + botón con el mensaje armado (número de pedido + lista de sellos). Se muestra siempre que algún sello del pedido no tenga logo subido.
- **Alcohn sube el logo al pedido desde el panel** cuando llega por WhatsApp. Hay que confirmar que el panel interno (fuera de esta web) tenga esa opción; si no la tiene, agregar en la web un endpoint protegido `POST /api/orders/[id]/logo` (mismo patrón que `api/orders/[id]/comprobante`).

### Cambios técnicos
1. **`src/lib/stampSizeCategories.ts` (nuevo):** mover `sellosChicos`, `sellosMedianos`, `sellosGrandes` y `getSizeCategory` fuera de `BuyWizard.tsx`, con el texto "qué medidas entran" de cada categoría. Lo usan la ficha y el generador.
   - Corregir de paso el `sizeMapFallback` del generador (25×25, 40×40, 60×60 mm): 6×6 cm no está en ninguna lista. Debe usar una medida representativa de cada categoría.
2. **Precio por categoría:** tomarlo del cotizador (`/api/cotizador/tiers`, `resolveGrupoCodigo`) para que coincida con el generador. Si la categoría tiene varios precios internos, mostrar el de la medida más común como "desde".
3. **`src/components/sellos/ProductBuyBox.tsx` (nuevo):** el bloque de compra. Se usa en `src/app/sellos/[slug]/page.tsx` y en la versión `[market]`.
4. **Ampliar `CartItem`** (`src/lib/cart.ts`) con campos opcionales: `sizeCategory`, `usoSlug`, `logoUrl`, `mockupSolicitudId`. Los ítems viejos guardados en el navegador siguen funcionando.
5. **Subida del logo desde la ficha:** reutilizar `src/lib/supabase/storage.ts`, guardar la URL en el ítem y pasarla al pedido en `sellosFromCart.ts`.
6. **Validación en el servidor:** `src/lib/checkout/pricing.ts` recotiza estos ítems por categoría (no confiar en el precio del navegador).
7. **Páginas de éxito** (`checkout/success`, `checkout/transferencia/confirmacion`, `checkout/openpay/success` y las de `[market]`): bloque de WhatsApp para mandar el logo.
8. **Tracking:** `add_to_cart` con `origen: 'ficha' | 'generador'`, `categoria` y `con_logo: true/false`.
9. **`StickyMobileCta`** en la ficha: muestra precio + "Agregar al carrito" en lugar de "Diseñar".

---

## 2. Varios sellos en un mismo pedido + accesorios

### Casos

| Caso | Solución |
|---|---|
| 3 sellos **iguales** | Selector de cantidad en la ficha y en el último paso del generador. |
| 3 sellos **distintos** (otro logo o tamaño) | Botón **"+ Agregar otro sello"** en el panel del carrito y al final del generador. |
| Mismo logo en **varios tamaños** | En el paso Medida del generador: casilla "Sumar también este tamaño" en las otras opciones. Se agregan como ítems separados con el mismo logo. |

### Envío gratis desde 3 sellos
- Regla: si el carrito tiene **3 sellos o más** (se cuentan unidades de sellos, no accesorios), el envío cuesta $0.
- Se calcula en el servidor (`src/lib/checkout/pricing.ts` y `/api/shipping/cost`), no solo en pantalla.
- Mensajes que empujan a llegar a 3:
  - En el panel del carrito: barra de progreso *"Te falta 1 sello para el envío gratis"* → *"¡Tenés envío gratis!"*.
  - En la ficha, debajo de la cantidad: *"Llevando 3 sellos o más, el envío es gratis."*
  - En el último paso del generador, junto a "Agregar otro sello".
- Solo Argentina (el envío internacional tiene otra lógica en `src/lib/shipping/international.ts`). Se puede extender después.
- Agregarlo a la FAQ, a la barra superior de promos (`PromoBar`) y a la política de envíos.

### Al agregar al carrito: panel lateral (no se redirige al checkout)
Mismo comportamiento en toda la web (fichas, generador, estándar, accesorios):

```
✓ Agregaste: Sello chico para madera  ×1      $76.000

▓▓▓▓▓▓░░░░  Te faltan 2 sellos para el envío gratis

Completá tu kit
[img] Soldador eléctrico   $xx   [ + Agregar ]

[ + Agregar otro sello ]   [ IR A PAGAR ]
```

- Reutilizar `CartDrawer` (`src/components/cart/CartDrawer.tsx`), que se abre solo al agregar.
- "+ Agregar otro sello" vuelve a la ficha del mismo uso (o al listado si el cliente quiere otro uso).

### Accesorio sugerido por uso
Ampliar `getWizardAddonSuggestion` en `src/lib/wizardAddons.ts` para que reciba el **uso** (`usoSlug`), no solo el material, porque pan, fruta y hielo comparten el material `alimentos`:

| Uso | Sugerencia |
|---|---|
| Madera | Soldador |
| Cuero | Mango de golpe (sellos hasta 3×3 cm) o base remachadora (más grandes) |
| Pan | Soldador |
| Fruta | Soldador |
| Hielo | Ninguna |
| Cerámica, jabón, lacre, packaging | Ninguna (por ahora) |

- Si ya hay un soldador en el carrito, no se vuelve a sugerir aunque agregue otro sello de madera o pan.
- Actualizar el texto del soldador (`ADDON_PITCH`) para pan y fruta: *"Calienta el sello parejo para marcar pan y cáscaras sin fuego directo."*

### En el generador
1. El último paso pasa a ser **Resumen**: sello armado, cantidad (− 1 +), accesorio sugerido, aviso de envío gratis y dos botones:
   - **[ Agregar otro sello ]** → guarda este sello en el carrito y vuelve al paso Logo **conservando** uso, nombre y WhatsApp.
   - **[ Ir a pagar ]**.
2. Si ya hay sellos en el carrito, arriba se ve: *"Tenés 2 sellos en el carrito"* con link para verlos.
3. En `handleAddWizardToCheckout` separar "agregar al carrito" de "ir al checkout".
4. Una muestra (`mockupSolicitudId`) por sello: hoy hay una sola por sesión (`mockupSolicitudIdRef`). Crear una nueva al empezar cada sello adicional y guardarla en el ítem del carrito.

---

## 3. Mobile

### 3.1 Home
- **Arreglar el hueco blanco (bug):** en mobile el contenido arranca visible; la animación solo hace un leve desplazamiento, nunca deja opacidad 0. Si la animación no se dispara en 1 s, o el usuario tiene "reducir movimiento", se muestra todo. Archivos: `homeScrollReveals.ts`, `HomeScrollShell.tsx`.
- **Hero mobile más corto** (`Hero.tsx`):
  - Título corto en mobile. Propuesta: *"Tu marca, en bronce."* (desktop mantiene el actual). Se puede cambiar el texto sin tocar el diseño.
  - Una línea de apoyo: *"Sellos para cuero, madera, alimentos y packaging."*
  - Precio + 72 hs en una sola línea chica. La nota de transferencia/cuotas y la garantía salen del hero (ya están en la barra superior y en la ficha).
  - Un botón principal **"Ver sellos"** y uno secundario chico **"Ver cómo queda mi logo"**.
  - Reseñas de Google en una línea chica.
  - Resultado: el hero entra en una pantalla y se ve el inicio de la sección siguiente.
- **Orden nuevo de la home en mobile**, más fotos y menos párrafos:
  1. Hero
  2. **"¿Para qué lo vas a usar?"**: tarjetas con foto (Cuero, Madera, Hielo, Pan, Fruta, Cerámica, Packaging) en carrusel. Llevan a cada ficha con compra directa.
  3. Antes/después (logo → sello → marca), sin texto largo.
  4. Casos reales (fotos de clientes, una línea por foto).
  5. Reseñas.
  6. Banner "3 sellos o más: envío gratis".
  7. Preguntas frecuentes en acordeón (3–4).
  8. CTA final.
- Regla de texto en mobile: máximo 2 líneas por párrafo; lo demás va a "Ver más" o se elimina.
- `TrustStatsStrip`, `WhyChoose*` y bloques de texto similares: en mobile se muestra uno solo.

### 3.2 Generador – paso "Tu logo"
Problemas: abajo solo aparece "← Atrás"; WhatsApp queda escondido bajo el pliegue; "No tengo logo" es un acordeón con un "+" chiquito.

Propuesta: **cuatro opciones del mismo peso, visibles sin scroll**, y barra inferior fija.

```
Tu logo                                   Paso 2 de 6
¿Cómo querés armar tu sello?

[ ↑  Subir mi logo                    ]  ← grande, borde punteado
     PNG, JPG o SVG · lo mejoramos gratis
[ 📷 Sacarle una foto a mi logo       ]
[ Aa No tengo logo: usar mi nombre    ]
[ 💬 Prefiero que me ayuden por WhatsApp ]

──────────── barra fija ────────────
[ ← ]   [ Comprar sin muestra y mandar el logo después ]
```

- Barra fija con **Atrás** chico a la izquierda y la acción principal a la derecha:
  - Sin logo: **"Comprar sin muestra"** → salta a Tamaño y Resumen. El pedido entra normal y el logo llega por WhatsApp (mismo flujo que la ficha).
  - Con logo: **"Continuar"**.
- WhatsApp pasa a ser una de las cuatro opciones visibles.
- "No tengo logo" es un botón que abre el armado de texto (no acordeón).
- Los consejos de foto (de frente, buena luz) aparecen solo después de tocar "Sacarle una foto".
- Mismo patrón (barra fija + acciones visibles) en Contacto, Vista previa, Medida y Resumen.
- Archivos: `BuyWizard.tsx` (paso logo, líneas ~2540–2700), `WizardMobileHeader.tsx`, `WizardTextLogo.tsx`.
- **Partir `BuyWizard.tsx`** en un componente por paso (`src/components/buy/steps/*`) antes de tocar el flujo. Con 3.900 líneas en un archivo, cada cambio es riesgoso.

### 3.3 Ficha de producto en mobile
- Foto (carrusel) más baja y, enseguida, el bloque de compra de la sección 1.
- Sticky inferior con precio + "Agregar al carrito".
- Texto técnico (desbaste, espesor) dentro de un acordeón "Especificaciones".

### 3.4 Revisión mobile completa (checklist)
Recorrer en 375 px y 390 px: home, productos, cada ficha, accesorios, abecedarios, carrito, checkout, páginas de éxito, FAQ, contacto, sobre Alcohn. En cada una:
- Sin huecos por animaciones (mismo bug que la home).
- Acción principal visible sin scroll o en barra fija.
- El botón flotante de WhatsApp no tapa botones (verificar en carrito y checkout).
- Botones de al menos 44 px de alto, textos de al menos 14 px.
- Imagen del hero en WebP y tamaño justo para celular.

---

## 4. Nuevos materiales en el generador de muestras

### Objetivo
Que quien elige hielo, cáscara de fruta, cerámica o pan vea **su logo sobre ese material**, con un efecto creíble, en lugar de verlo en madera o cuero como pasa hoy.

### Cómo funciona hoy
`renderMockup(logo, material)` toma una foto de textura y aplica uno de dos efectos:
- **Quemado** (madera): `applyMaderaBurnPythonLike`.
- **Bajorrelieve** (cuero): `applyCueroEmbossPythonLike`.

### Efecto por material

| Material | Cómo se ve la marca real | Efecto a programar | Base |
|---|---|---|---|
| **Cerámica** (arcilla cruda) | Hundido nítido, sin quemado, sombra interna marcada. | Bajorrelieve con bordes más definidos que el cuero y sombra más fuerte. | `applyCueroEmbossPythonLike` con otros parámetros. |
| **Cáscara de fruta** (naranja, limón) | Marca tostada marrón/caramelo con relieve leve. | Quemado marrón-anaranjado suave + hundido leve + brillo de aceite. | Mezcla de quemado y bajorrelieve con otra paleta. |
| **Hielo** | El bronce caliente derrite: logo hundido, más transparente, brillo de agua en bordes. | Hundido suave + aclarado interior + reflejos blancos en bordes + leve desenfoque. Sin oscurecer. | Bajorrelieve con luces invertidas + capa de brillo. |
| **Pan de hamburguesa** | Marca tostada sobre superficie curva, con semillas de sésamo. | Quemado marrón de bordes difusos + deformación curva (el logo sigue el domo) + semillas por encima del logo. | Quemado de madera + deformación esférica + máscara de semillas. |

### Pasos
1. **Fotos de textura (las saca Alcohn).** Por material, 2 o 3 fotos:
   - Cenital, luz pareja, sin logo, al menos 2000 px de ancho.
   - Hielo: cubo grande o esfera transparente. Fruta: cáscara de naranja y de limón. Cerámica: placa de arcilla cruda. Pan: pan de hamburguesa desde arriba.
   - Muy recomendable: **una foto marcada de verdad** por material, para calibrar el efecto contra la realidad.
   - Destino: `public/mockup-textures/` → `ceramica.jpg`, `fruta-naranja.jpg`, `fruta-limon.jpg`, `hielo.jpg`, `pan.jpg`, `pan-semillas-mask.png`.
   - Mientras no estén las fotos, se puede programar y probar con fotos provisorias; **no se publica** un material hasta tener su foto real.
2. **Ampliar `MockupMaterial`** (`mockupRender.ts`) con `'ceramica' | 'fruta' | 'hielo' | 'pan'`: textura, color de respaldo y zona válida para el logo (en pan y hielo el logo no puede salirse de la pieza).
3. **Funciones de efecto nuevas** en `mockupPythonLikeEffects.ts`: `applyCeramicaDebossEffect`, `applyFrutaBrandEffect`, `applyHieloMeltEffect`, `applyPanBrandEffect` + `warpLogoToDome`.
4. **Corregir el mapeo del material elegido:**
   - `mapWizardMaterialToMockup` y `resolveMockupGeneration` usan el **uso** (`para-hielo`, `para-pan`, `para-fruta`, `para-ceramica`) en vez del material genérico `alimentos`.
   - `wizardCartImageUrl`: miniatura del carrito con la textura correcta.
   - El aviso de "muestra de referencia" (`mockupUsesFallbackTexture`) queda solo para jabón, lacre y packaging.
5. **Tamaños por material:** hielo y pan tienen límite físico. Definir qué categorías se ofrecen en cada uno (probablemente hielo y pan solo chico y mediano) en `stampSizeLimits.ts` / `stampUseCases.ts`. Aplica también al bloque de compra de la ficha.
6. **Pruebas:** sumar casos a `scripts/test-mockup-ts.mjs` con 5 logos típicos (texto fino, logo grueso, círculo, mucho detalle, una sola letra) por material. Revisar los resultados con Alcohn antes de publicar cada material.
7. **Paso Material del generador:** mostrar los 4 materiales con su foto, a la par de cuero y madera, para que se descubran.

### Orden
Cerámica (la más parecida al cuero) → Fruta → Hielo → Pan (la más difícil por la curva y las semillas). Cada material se publica por separado cuando está aprobado.

---

## 5. Orden de trabajo

| Fase | Qué incluye | Por qué en este orden | Tamaño |
|---|---|---|---|
| **1. Arreglos rápidos mobile** | Hueco blanco de la home; paso "Tu logo" con 4 opciones y barra fija. | Bug visible que frena ventas hoy. | Chico (1–2 días) |
| **2. Ordenar el generador** | Partir `BuyWizard.tsx` en pasos; sacar las categorías de medida a `stampSizeCategories.ts`; corregir `sizeMapFallback`. | Base para las fases 3 y 4 sin romper nada. | Chico–mediano (2 días) |
| **3. Compra directa en la ficha** | `ProductBuyBox` con chico/mediano/grande y "qué medidas entran", subir logo opcional, carrito ampliado, éxito con WhatsApp, validación en servidor, sticky mobile. | Lo que más destraba la compra del cliente "simple". | Mediano (3–5 días) |
| **4. Varios sellos + envío gratis + accesorios** | Panel al agregar, "+ Agregar otro sello", cantidad, envío gratis desde 3 sellos (servidor + mensajes), soldador para pan y fruta, Resumen del generador con "Agregar otro sello". | Sube el ticket; se apoya en la fase 3. | Mediano (3–4 días) |
| **5. Home mobile rediseñada** | Hero corto, orden nuevo, menos texto, tarjetas por uso, banner de envío gratis. | Con las fichas ya vendiendo directo, la home lleva a ellas. | Mediano (2–3 días) |
| **6. Nuevos materiales** | Cerámica → Fruta → Hielo → Pan. | Depende de las fotos. Se puede hacer en paralelo desde la fase 2: solo toca archivos `mockup*.ts`. | Grande (1–2 semanas según fotos) |
| **7. Revisión mobile completa** | Checklist de la sección 3.4 en todas las páginas. | Sobre la web ya cambiada. | Chico–mediano |

Cada fase se publica por separado, con prueba en celular (375 px) antes de subir.

---

## 6. Lo que falta de parte de Alcohn

1. **Fotos de textura** de cerámica, fruta, hielo y pan (sección 4, paso 1). Es lo único que bloquea la fase 6.
2. **Panel interno:** confirmar si ya se puede subir un logo a un pedido existente. Si no, se agrega el endpoint en la fase 3.
3. Opcional: confirmar el título corto del hero mobile (*"Tu marca, en bronce."*) o proponer otro. Si no hay respuesta, se usa ese.

---

## 7. Cómo medimos si funcionó

- % de visitas a fichas que agregan al carrito (antes / después).
- Compras desde la ficha vs. desde el generador.
- % de pedidos sin logo y tiempo hasta que llega el logo por WhatsApp.
- Sellos promedio por pedido y % de pedidos con 3 o más (efecto del envío gratis).
- % de pedidos con soldador u otro accesorio.
- Abandono en el paso "Tu logo" (ya se mide con `trackWizardStep`).
- Uso del generador en cerámica, fruta, hielo y pan, y conversión de esos usos.
