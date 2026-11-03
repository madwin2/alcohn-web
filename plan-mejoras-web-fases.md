# Plan de mejoras web — por fases

Fecha: 2026-11-02 · Sale de la auditoría del 31/10 y de lo que ya se resolvió.
Estado: **para aprobar**. Cada fase es un commit (o varios) y se revisa antes de seguir.

Ya hecho: verificación de pagos Openpay, Meta sin duplicados, consentimiento de Google Ads,
fotos de stock fuera, cookies sin bloqueo y medición siempre, atribución de ventas a la web
(Alcohn AI), generador en celular (avance guardado, ayuda Instagram, botones claros), seña
alineada y "resto al retirar" corregido.

Fuera de este plan (lo hace el dueño aparte): ver `tareas-por-mi-cuenta.md`.

---

## Fase 1 — Cerrar el acceso público a la base (crítico)

**Qué pasa hoy:** `clientes`, `ordenes`, `sellos` y otras tablas no tienen RLS y el rol
`anon` tiene permisos. Con la clave pública (visible en el navegador de Alcohn AI) se puede
leer y modificar todo, incluso marcar un pedido como pagado sin pasar por la verificación de
Openpay.

**Quién usa la base y si se rompe:**

| Quién | Con qué clave | ¿Se rompe al cerrar `anon`? |
|---|---|---|
| Web (alcohnsellos.com) | Service role, solo en el servidor | No |
| Bot de WhatsApp (VPS) | `SUPABASE_SERVICE_KEY` | No, si en el VPS es la service key (verificar) |
| Workers (vector, Andreani) | Service role | No |
| Edge functions (`confirm-web-order`, `meta-conversion`, `webhook-bot`) | Service role, con respaldo a anon | No, si el secreto service role está cargado (verificar) |
| Alcohn AI (app interna) | Clave pública + usuario logueado | **Sí**, salvo que se creen reglas para usuarios aprobados |
| Extensión "nuevo pedido" y sincronización de programas | Usuario logueado | Igual que Alcohn AI |

**Cómo hacerlo, por etapas y con permiso para cada migración:**
1. Verificar las claves del VPS y los secretos de las edge functions.
2. Función `es_usuario_aprobado()` (lee `solicitudes_registro.estado = 'APROBADO'`). Ojo: hoy
   cualquiera puede registrarse y obtener sesión; las reglas no pueden ser solo "usuario logueado".
3. Activar RLS con reglas para usuarios aprobados en una tabla de bajo riesgo, probar la app
   completa, y seguir con `clientes`, `ordenes`, `sellos` y el resto. Quitar permisos a `anon`.
4. Que nadie pueda aprobarse a sí mismo en `solicitudes_registro`.
5. Probar: login, Pedidos, Producción, Comercial, Envíos, extensión, programas, un mensaje del
   bot, un pedido web de punta a punta.

Repos: Alcohn AI (migraciones) + Supabase. La web no cambia.

---

## Fase 2 — Arreglos rápidos (web)

- Errores de tipeo: "Precision Industrial", "Atencion Personalizada", "Produccion Local",
  "Experiencia Unica", "podes", "tenes", "queres", "estandar" (`HomeLanding.tsx`,
  `ContactoPageContent.tsx`, `DossInspiredSections.tsx`).
- Sacar `DossInspiredSections` de la portada (se carga oculta).
- Títulos y botones del hero visibles desde el inicio (hoy arrancan invisibles hasta que carga
  la animación, `Hero.tsx`).
- Nombres, rol y una frase de cada integrante del equipo (`aboutAlcohn.ts`). **Necesito los datos.**
- Datos de la empresa: dirección igual a la ficha de Google (Alberti 1254), horario de atención,
  "Titular: Julián Moreno, fundador de Alcohn" junto a los datos bancarios, Factura C visible.
- Videos e imágenes pesadas: videos a 720p con poster y `preload="none"`, `<img>` de la portada a
  `next/image`.

---

## Fase 3 — Tarjeta y transferencia, claro y simple

**Qué pasa hoy:** el precio con tarjeta es el de transferencia + 15 %. Eso equivale a un 13 %
de descuento por transferencia, y la web dice tres cosas distintas: "10 % de descuento" (paso
medida), "Ahorrás $13.725" (pago) y nada en otros lados.

**Decisión necesaria antes de tocar:**
- **A (recomendada):** mismos precios. Tarjeta = "precio de lista, 3 cuotas sin interés";
  transferencia = "precio contado, ahorrás $X". Se muestra el ahorro en pesos, sin porcentaje,
  así nunca queda desalineado.
- **B:** descuento real del 15 %: la transferencia queda 2,2 % más barata que hoy (menos
  ingreso en ~80 % de las ventas).
- **C:** mantener la transferencia y subir la tarjeta para que la diferencia sea 15 % exacto.

**Qué se cambia (con la opción elegida):** paso medida, paso pago del generador, checkout,
fichas de producto, FAQ y carrito. Un solo helper para el texto, para que no se vuelva a
desalinear.

---

## Fase 4 — Primer paso del generador: Cuero, Madera y Otros

- Tres opciones grandes, con foto: **Cuero**, **Madera**, **Otros**.
- "Otros" abre la lista completa: cerámica, jabón, cartón, lacre, hielo, pan, fruta (y
  cualquier uso nuevo que se agregue al catálogo).
- Los links de anuncios con `material`/`uso` siguen funcionando igual.
- Medir: % que pasa de material a logo, antes y después.

Archivos: `BuyWizard.tsx` (paso material), catálogo de usos del generador.

---

## Fase 5 — Reseñas reales de Google

- Un solo dato en la configuración: calificación, cantidad, link a la ficha y fecha de
  actualización (se actualiza a mano una vez por mes; más adelante, por la API de Places).
- Mostrarlo en la portada, en el primer paso del generador y en "Casos reales":
  "4,9 ★ · 100+ reseñas en Google", con link.
- Schema para Google: hoy calcula un 5,0 con 21 testimonios cargados a mano. Google no permite
  marcar como propias reseñas que vienen de otro sitio; se quita ese `aggregateRating` del
  schema de producto (la ficha de Google ya muestra las estrellas en Maps y búsqueda local).
- **Necesito:** la calificación y la cantidad actuales de la ficha.

Archivos: `src/data/testimonials.ts`, `src/lib/seo.ts`, componentes de portada y generador.

---

## Fase 6 — Que el taller reciba el tipo de sello correcto

**Qué pasa hoy:** todo lo que se compra en el generador entra como "Clásico"
(`process: 'CNC'`). Pan o lacre se fabrican distinto y hoy dependen de que alguien lea el título.

- El generador manda el tipo según el uso elegido: Pan y Fruta → **Alimento**; Lacre → **Lacre**.
- **Necesito confirmar:** hielo, jabón, cerámica y cartón, ¿son Clásico o tienen otro tipo?
- Ver si conviene ofrecer la profundidad de 3 mm (con su precio) para alimentos.
- Probar de punta a punta: pedido web → `sellos.tipo` correcto en Alcohn AI / Producción.

Archivos: `BuyWizard.tsx` (ítem del carrito), `src/lib/supabase/sellosFromCart.ts`.

---

## Fase 7 — Complementos según el uso

- Después de elegir la medida (o en el paso de pago), sugerir el accesorio que corresponde:
  madera → calentador eléctrico; cuero → mango de golpe o base para remachadora.
- Un toque para sumarlo al pedido, con el precio del catálogo (el servidor ya recotiza
  accesorios).
- Medir cuántos lo agregan y el ticket promedio web antes y después.
- Más adelante: "otra medida del mismo diseño" y envío gratis desde 3 sellos (si la regla sigue).

Archivos: `BuyWizard.tsx`, `src/data/accessories.ts`.

---

## Fase 8 — Cumplir las 72 hs hábiles (operación, no texto)

La promesa se mantiene: hay que mejorar el proceso. Hoy, en pedidos web, la mediana de pago a
"Hecho" es 4 días hábiles y solo el 37 % sale en 3.

1. Medir: panel en Alcohn AI con el tiempo de cada etapa (pago → vectorizado → programado →
   hecho → foto) por semana, para ver dónde se traba.
2. Atacar el cuello de botella que aparezca (vectorización, programación, máquina o fotos).
3. Cuando se cumpla de forma estable, alinear el schema de Google (hoy dice 3 a 5 días) y
   mostrar la fecha estimada en el checkout ("listo para enviar el jueves 6").

Repo: Alcohn AI (panel) + definiciones con el equipo.

---

## Después (sin fecha)

- Vincular automáticamente pedidos de WhatsApp a su muestra web y mandarlos a Meta.
- Tablero web único en Comercial y país del visitante en la analítica propia.
- Historias de clientes por rubro y link de recompra con el logo ya cargado.
- Mercado internacional, contenido educativo, textos técnicos en lenguaje de beneficio.

## Orden sugerido

1 → 2 → 3 → 4 → 5 → 6 → 7, y la 8 en paralelo (es operativa).
La Fase 1 toca la base compartida: se hace con tiempo y probando cada etapa.
