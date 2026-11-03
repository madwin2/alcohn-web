# Plan: correcciones del generador de muestras en celular

Fecha: 2026-11-02 · Estado: **para aprobar** (no hay nada implementado)

## Por qué

Datos de los últimos 90 días (web_analytics_events + mockup_solicitudes):

| De cada 100 que eligen material | Quedan |
|---|---|
| Suben el logo | 38 |
| Dejan sus datos | 27 |
| Ven su muestra | 25 |
| Pasan de la medida al pago | ~10 |
| Inician el checkout | 2,6 |

- El **82 %** de las sesiones del generador son del navegador interno de **Instagram/Facebook**. Ahí suben el logo el 30 %; en un navegador de celular común, el 40 %; en computadora, el 45 %.
- El generador **no guarda el avance**. El 27 % de los visitantes vuelve en otra visita y empieza de cero; esos suben el logo más (55 % contra 35 %), lo que indica que salieron a buscarlo.
- La medida es la primera vez que ven el precio: ahí se va el 58 %. El 61 % de los que compran después de una muestra lo hace por WhatsApp.
- Casi todos estos datos son anteriores al 2026-11-02, cuando se sumaron "Sacarle una foto a tu logo" y "¿No tenés logo?".

Decisiones que se mantienen: el precio se sigue mostrando **después** de los datos de contacto; se piden nombre, WhatsApp y email.

---

## Fase 1: paso del logo (la caída más grande)

### 1.1 Guardar el avance del generador
**Qué:** si la persona sale (a buscar el logo, a WhatsApp, cierra Instagram) y vuelve, sigue donde estaba.

- Guardar en `localStorage` (clave nueva, p. ej. `alcohn_wizard_draft_v1`): paso, material, uso, nombre/WhatsApp/email si ya los dejó, id de la muestra (`mockupSolicitudIdRef`) y fecha.
- El logo **no** se guarda como imagen en el navegador, porque puede pasar el límite de espacio. Ya se sube al storage de la muestra (`syncWizardLogos`); al restaurar se usa esa URL (`archivo_base_url`) y se rearma el `File` con `fetch` → `blob`.
- Vence a los 7 días o cuando se completa la compra.
- Al volver: aviso arriba "Seguís donde lo dejaste · Empezar de nuevo".
- No restaurar si la URL trae otro material o producto (un anuncio distinto).

**Archivos:** `src/components/BuyWizard.tsx` (cargar al iniciar y guardar en cada cambio de paso), un módulo nuevo `src/lib/wizardDraft.ts` (leer/guardar/borrar, con try/catch), y `src/lib/wizardSupabaseSession.ts` (hoy guarda los ids en `sessionStorage`, que se pierde si Instagram cierra la página).

**Listo cuando:** en celular, subir un logo, recargar o cerrar la pestaña y volver al link deja a la persona en el paso de contacto con su logo visible.

### 1.2 Ayuda para quien entra desde Instagram o Facebook
**Qué:** detectar el navegador interno (user agent `Instagram` / `FBAN|FBAV`) y mostrar, solo ahí, una ayuda en el paso del logo:

> ¿Tu logo está en WhatsApp o en el mail? Guardalo en la galería y volvé: tu avance queda guardado.

Más un botón secundario **"Terminar más tarde"** que abre WhatsApp con un mensaje a Alcohn que incluye el link para retomar. La persona queda como contacto aunque no termine.

**Archivos:** `BuyWizard.tsx` (bloque del paso del logo, debajo de "Sacarle una foto a tu logo") y un helper `isInAppBrowser()` en `src/lib/`.

**Listo cuando:** la ayuda aparece solo con el user agent de Instagram o Facebook, y el botón abre WhatsApp con el link para retomar.

### 1.3 Medir lo que pasa dentro de cada paso
Eventos nuevos con `trackEvent` (analítica propia) y `pushGtmEvent`:

| Evento | Cuándo |
|---|---|
| `logo_picker_open` | toca "Tocá para subir tu logo" (`metadata.fuente: 'galeria'`) o la cámara (`'camara'`) |
| `logo_uploaded` | el archivo se cargó bien (tipo y peso en metadata) |
| `logo_upload_error` | archivo inválido o error al leerlo |
| `logo_crop` | elige recortar, usar sin recortar o cancelar |
| `wizard_resumed` | se restauró un avance guardado (paso de origen) |
| `wizard_save_later` | tocó "Terminar más tarde" |

Todos llevan `navegador: 'instagram' | 'facebook' | 'movil' | 'desktop'`.

**Listo cuando:** se ve cada evento en `web_analytics_events` probando en local con la API interceptada.

---

## Fase 2: paso de los datos de contacto

### 2.1 Mostrar el logo y lo que viene
- Miniatura del logo arriba del formulario: "Tu logo ✓".
- Texto en celular igual de concreto que en computadora: "En segundos ves tu muestra, las medidas y el precio. Te la mandamos también por WhatsApp."

**Archivos:** `src/components/buy/ContactStep.tsx` (prop nueva `logoUrl`) y `BuyWizard.tsx`.

### 2.2 Arreglar la ventana de recorte en celular
- El recorte se sale por la derecha a 375 px de ancho: limitar el ancho de la imagen al del modal.
- Orden de botones: **"Usar sin recortar"** como principal, "Aplicar recorte" como segundo y "Cancelar" como link chico.

**Archivos:** `BuyWizard.tsx` (modal de `pendingLogoUpload`).

**Listo cuando:** a 375 px el recorte entra completo en pantalla.

---

## Fase 3: paso de la medida (primera vez que ven el precio)

### 3.1 Salida por WhatsApp para el que duda
- Link debajo del botón "Continuar →": **"¿Dudas con la medida o el precio? Consultanos por WhatsApp"**.
- El mensaje incluye material, medida elegida, precio y el link de la muestra, para que el equipo responda sin pedir nada de nuevo.
- Se mide como `click_whatsapp` con `ubicacion: 'wizard_medida'` (GTM y analítica propia), igual que el botón de "sin logo".

### 3.2 Confianza junto al precio
Una línea chica bajo el resumen: "Bronce macizo · Garantía de por vida · Listo en 72 hs hábiles · Factura C". El texto se toma de `src/lib/config.ts` para no desalinear plazos.

**Archivos:** `BuyWizard.tsx` (CTA de celular del paso medida) y `src/components/buy/WizardSizeStepMobile.tsx`.

---

## Cómo se prueba (cada fase)

1. `npm run dev`, vista celular de 375×812, interceptando `/api/mockups`, `/api/analytics`, `/api/clientes` y `/api/checkout` para no crear datos reales.
2. Recorrer el generador completo y simular el user agent de Instagram para ver la ayuda.
3. `npx tsc --noEmit`, tests (`npm test`) y `next build`.
4. Nada se sube a GitHub ni Vercel sin aprobación.

## Cómo medimos si funcionó

Comparar dos semanas antes y dos semanas después de publicar, separando Instagram/Facebook del resto:

- % que sube el logo (meta: de 38 % a 45 %+).
- % de los que suben el logo que dejan sus datos (meta: de 71 % a 78 %+).
- Clics en "Terminar más tarde" y en WhatsApp desde la medida, y cuántos terminan en pedido (vista `v_comercial_ventas_origen_web`).
- Visitas que retoman un avance guardado.

## Orden sugerido

1. **Fase 1 completa** (1.1 + 1.2 + 1.3): un commit.
2. **Fase 2**: un commit.
3. **Fase 3**: un commit.

Cada fase se revisa en el celular antes de pasar a la siguiente.

## Fuera de este plan (para después)
- Generador de logos que reemplace "Armar mi diseño por WhatsApp".
- Seguimiento automático por WhatsApp de muestras sin compra y pedidos sin pagar (Alcohn AI).
- Mostrar un precio "desde" antes de los datos (descartado por ahora: el precio va después del contacto).
