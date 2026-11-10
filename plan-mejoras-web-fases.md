# Guía de auditoría y plan de mejoras — web Alcohn

Actualizado: 10/11/2026 · Reemplaza la versión del 02/11.
Sale de la auditoría del 31/10, del informe de competencia (`Informe_Competencia_Alcohn.md`) y
de una revisión nueva con los datos de la semana del 3 al 10/11.

Etapa actual: **análisis**. Lo que figura como "pendiente" está anotado, no aplicado.
Lo que hace el dueño aparte está en `tareas-por-mi-cuenta.md` y en `Pendientes.md`.

---

## 1. Resumen

1. **El primer paso del generador es la verdadera portada, y es la pantalla más pobre de la web.**
   Entran unas 1.200 personas por semana, el 92 % desde anuncios de Instagram y Facebook, y
   el 66 % se va sin tocar nada. Ahí no se ve precio, cuotas, 72 hs, garantía ni un ejemplo de
   la muestra. La barra de cuotas que se sumó a toda la web está oculta justo en esa pantalla.
2. **El precio sigue apareciendo recién al final** (punto C2 de la auditoría, nunca se hizo).
   De 69 personas que llegaron a ver medidas y precios, 16 pasaron a pagar.
3. **Más de la mitad de los que llegan al paso del logo no intentan subirlo.** De 405, 164
   tocaron "subir" y 105 lo subieron. Falta un camino para seguir sin logo.
4. **Los arreglos del 2/11 funcionan, pero todavía no se nota en las ventas.** 90 personas
   retomaron donde habían dejado; las proporciones del embudo siguen iguales. Es una sola
   semana y con menos tráfico: hay que volver a mirar el 16/11 y a fin de mes.
5. **El tráfico de anuncios bajó cerca de 40 % desde el 27/10**, antes de los cambios. Hay que
   mirar la inversión y el desgaste de los anuncios en Meta.
6. **De lo que faltaba del plan:** seguridad y 72 hs siguen siendo necesarias; los complementos
   según el uso bajan de prioridad (ver sección 4).

---

## 1 bis. Decisiones del dueño (10/11)

Estas decisiones mandan sobre lo que dicen las secciones 5 y 6.

- **El generador no se convierte en portada ni muestra el precio al inicio.** El recorrido
  está pensado para ir construyendo valor paso a paso y que queden los interesados. G1 y G2
  quedan descartadas como estaban escritas. Sí se aceptan mejoras que respeten esa idea:
  - Paso 1: una sola frase que diga qué va a pasar ("Mirá cómo queda tu sello con tu logo.
    Gratis."), sin precio.
  - Paso de medidas (G4): cuando el precio ya aparece, mostrar la cuota y una medida
    recomendada.
- **Seguir sin logo (G3):** válido. Hoy solo existe el link a WhatsApp; falta poder seguir
  dentro de la web.
- **Tarjeta de Alimentos (G5):** no se toca por ahora. La agrupación en Cuero, Madera y Otros
  fue decisión del dueño; queda anotado el dato (de 24 % a 14 %) para volver a mirarlo.
- **Complementos según el uso (Fase 7):** interesa.
- **Medir las 72 hs y seguridad:** todavía no.
- **Audience Network, fichas, portada y guías para Google:** a decidir después de la
  explicación.

### Hecho el 10/11 (commiteado, sin publicar)

- **Paso 1 del generador:** la bajada ahora dice "Tocá una opción y mirá cómo queda tu sello
  con tu logo. Gratis y sin compromiso." Sin precio.
- **Paso de medidas (G4):** junto al precio con tarjeta se muestra "o 3 cuotas sin interés de
  $X". La etiqueta de la medida sugerida dice "Recomendada" (siempre es la mediana).
- **Seguir sin logo (G3):** "No tengo logo: usar el nombre de mi marca", con 4 tipos de letra.
  Arma la imagen y sigue por el mismo camino que un logo subido. En la solicitud queda anotado
  que es un logo de texto y con qué letra. Eventos `logo_text_open` y `logo_text_used`.
- **Complementos (Fase 7):** en el paso de pago, solo Argentina. Madera → calentador; cuero
  hasta 3x3 cm → mango de golpe (con opción de cambiar a la base); cuero más grande → base
  para remachadora. Eventos `wizard_addon_shown`, `wizard_addon_added`, `wizard_addon_removed`.
- **Alcohn AI:** los accesorios de pedidos web se registran como accesorio. Falta desplegar
  `confirm-web-order`.
- **Fichas (F1–F3):** botón fijo en celular, reseñas de Google bajo el botón, textos
  repasados y "cuero y PU" bien escrito.
- **Portada (F4, F5):** el testimonio de "Lucía M." se reemplazó por una reseña real de Google
  (Andrea Leone); los contadores ya no muestran cero.

Pendiente de estas mejoras: probar "seguir sin logo" en un celular real dentro de Instagram;
el evento de inicio de pago a Meta no incluye el accesorio; medir dos semanas.

---

## 2. Qué se hizo desde la auditoría

| Tema | Estado | Dónde |
|---|---|---|
| Verificación de pagos Openpay (S1) | Hecho | web |
| Meta sin duplicados, valor real (M1, M2) | Hecho | web |
| Consentimiento de Google Ads (M3) | Hecho | web |
| Fotos de stock fuera de los testimonios (B1) | Hecho | web |
| Cookies sin bloqueo, medición de todos los visitantes (U1, M5) | Hecho | web |
| Atribución de ventas de WhatsApp a la web (M4) | Hecho | Alcohn AI |
| Generador en celular: avance guardado, ayuda Instagram, cámara, botones claros | Hecho 2/11 | web |
| Arreglos rápidos: tildes, hero visible, equipo, horario, videos livianos (T2, U2, U3, B5, B6) | Hecho 2/11 | web |
| Seña y "resto antes del envío" (T1) | Hecho 2/11 | web |
| 15 % por transferencia, un solo mensaje (C7 en parte) | Hecho 2/11 | web |
| Primer paso: Cuero, Madera y Otros (C6) | Hecho 2/11 | web |
| Reseñas reales de Google en portada, generador y casos reales (B2) | Hecho 3/11 | web |
| Tipo de sello según el uso (C5) | Hecho 3/11, función desplegada 7/11 | web + Alcohn AI + Supabase |
| Barra de cuotas, 72 hs y vista previa, profundidad, garantía de por vida, preguntas de uso y cuidado (M1–M3, M6–M8 del informe de competencia) | Hecho y publicado 9/11 | web |
| Encuesta de Reseñas de Clientes en Google al confirmar el pedido | Hecho y publicado 9/11 | web |
| Fichas de chocolate/alfajores y colmenas | Publicadas 9/11, "para revisar" | web |
| Otros países: "tú", cuño en Chile, precios y feeds alineados, hreflang | Hecho 7/11 | web |
| Mercado Libre: publicaciones nuevas y precios | Hecho 7–10/11 | ML |

Nota: `Pendientes.md` decía que las etapas 2, 3 y 4 estaban sin publicar. Ya están publicadas
(commit `20941bc`, verificado en alcohnsellos.com el 10/11).

---

## 3. Los números de esta semana

Generador, del 3 al 10/11. Desde el 1/11 se mide a todos los visitantes, no solo a los que
aceptan cookies, así que estos números no se pueden comparar uno a uno con los de octubre.

| Paso | Sesiones | % del total |
|---|---:|---:|
| Entran al generador (paso "¿Qué querés marcar?") | 1.193 | 100 % |
| Llegan al paso del logo | 405 | 34 % |
| Tocan "subir logo" o "sacar foto" | 164 | 14 % |
| Suben el logo | 105 | 9 % |
| Ven el paso de datos de contacto | 130 | 11 % |
| Ven la muestra | 81 | 7 % |
| Ven medidas y precios | 69 | 6 % |
| Llegan a elegir cómo pagar | 16 | 1,3 % |
| Pagan en la web (semana del 2/11) | 4 | 0,3 % |

Otros datos:

- **De dónde vienen:** Instagram pago 842, Facebook pago 176, directo 60, Audience Network 58.
- **Audience Network** (la red de apps de Meta): 58 sesiones, 1 llegó al logo. Es tráfico que
  no sirve.
- **Por navegador:** Instagram 34 % llega al logo, Facebook 32 %, otro celular 35 %, PC 50 %.
- **Volumen:** 75 muestras iniciadas por día del 20 al 26/10; 47 por día desde el 29/10.
- **Proporciones por semana (octubre → noviembre):** suben logo 33–39 % de los que eligen
  material (sin cambio); dejan WhatsApp 66–78 % de los que suben logo (sin cambio).
- **"Otros":** antes del cambio, 24 % elegía un uso que no era cuero ni madera; ahora 14 %.
  Solo 80 sesiones abrieron "Otros".
- **Funciones nuevas:** 90 sesiones retomaron el avance guardado; 21 usaron la cámara; 7
  tocaron "terminar más tarde".
- **Cookies:** 226 aceptaron, 47 rechazaron.
- **Ventas web pagadas por semana:** 5, 7, 3, 4, 6, 4. Con tarjeta: entre 0 y 2 por semana.
- **Pedidos de otros canales por semana:** 39, 37, 30, 36, 44, 27.

No se pudo medir la velocidad con PageSpeed (cupo agotado). Queda pendiente mirar "Métricas
web principales" en Search Console.

---

## 4. Lo que faltaba del plan: ¿sigue valiendo?

| Fase | ¿Sigue valiendo? | Por qué |
|---|---|---|
| **1. Seguridad de la base** | Sí, igual que antes | Nada cambió: las tablas siguen abiertas con la clave pública. Se hace con tiempo y con permiso por migración. |
| **7. Complementos según el uso** | Sí, pero baja de prioridad | Solo 16 personas por semana llegan al paso de pago. Aunque la mitad sume un accesorio, son 2 o 3 ventas. Conviene primero arreglar la entrada del generador. Además los accesorios ya se venden en Mercado Libre. Pendiente previo: en Alcohn AI y en `confirm-web-order` los accesorios todavía entran como "sello". |
| **8. Cumplir las 72 hs** | Sí, y sube de prioridad | Desde el 9/11 "72 hs hábiles" está en la barra superior, en todas las fichas y en Mercado Libre. Sigue sin medirse (mediana web: 4 días hábiles; 37 % en 3). El dato para Google todavía dice "3 a 5 días". |
| Recordatorio de pago y seguimiento de muestras (C3) | Sí | Lo lleva el dueño en otro chat. |
| Pedir reseña a todos (K1) | Decisión tomada: se sigue pidiendo a conformes | La encuesta de Reseñas de Clientes en Google ya cubre a todos los que compran en la web. |
| Fotos reales, campaña de fin de año, otro medio de pago | Sí | Los lleva el dueño. La campaña de fin de año ya está justa de tiempo (hoy es 10/11). |

---

## 5. Mejoras nuevas, en orden de impacto

### A. Generador (donde entra casi todo el tráfico pago)

| # | Mejora | Qué se ve hoy | Qué haría |
|---|---|---|---|
| G1 | **Convertir el primer paso en una portada corta** | Título, dos fotos, "Otros" y media pantalla vacía. Sin precio, cuotas, 72 hs ni garantía. La barra de cuotas está oculta en el generador en celular (`ConditionalHeader.tsx`). | Arriba: "Mirá tu sello con tu logo antes de pagar. Gratis." Un ejemplo real de muestra (logo → sello → marca en cuero). Una línea: "Desde $76.000 · 3 cuotas sin interés · listo en 72 hs · garantía de por vida". Debajo, las opciones. |
| G2 | **Precios por medida a la vista desde el inicio** (C2 de la auditoría) | El precio aparece en el paso 5, después de dejar los datos. 69 lo ven, 16 siguen. | Un desplegable "Ver precios por medida" en el paso 1 y en las fichas, con precio por transferencia y valor de la cuota. |
| G3 | **Seguir sin logo** | 241 de 405 no tocan "subir". Hoy la única salida es escribir por WhatsApp. | Dos caminos: "Todavía no tengo el logo: ver medidas y precios" (deja WhatsApp y un vendedor sigue) y "Quiero un sello con mi nombre" (texto + 3 o 4 tipografías, con muestra automática). |
| G4 | **Paso de medidas: bajar el golpe del precio** | Se muestra el total. | Mostrar primero la cuota ("3 cuotas de $X"), marcar una medida recomendada según el logo y dejar el botón de WhatsApp con la muestra adjunta. |
| G5 | **Revisar "Otros"** | Los usos que no son cuero ni madera bajaron de 24 % a 14 %. Pan es de las fichas con más búsquedas. | Tercera tarjeta con foto: "Alimentos" (pan, hielo, fruta, chocolate). "Otros" queda para cerámica, jabón, cartón y lacre. Medir dos semanas. |
| G6 | **Quien sube el logo y no deja datos se pierde** | Unas 25–30 personas por semana. | Mostrar la muestra en baja calidad antes de pedir los datos, y pedir el WhatsApp para "recibirla en buena calidad y con precios". Evaluar el costo de generar más muestras. |

### B. Anuncios de Meta

| # | Mejora | Detalle |
|---|---|---|
| A1 | **Sacar Audience Network** de las ubicaciones | 58 sesiones por semana, 1 llegó al logo. |
| A2 | **Revisar por qué bajó el tráfico 40 %** desde el 27/10 | Inversión, frecuencia y desgaste de los anuncios. |
| A3 | **Anuncios con el uso en el link** | Ningún anuncio entra con `?material=` o `?uso=`. Un anuncio de cuero que abre directo en "Subí tu logo" ahorra un paso. Probar contra el actual. |
| A4 | **Públicos de remarketing por paso** | Los que eligieron material y no subieron logo; los que vieron precios y no pagaron. Mensaje: la muestra gratis y las cuotas. |

### C. Fichas y portada

| # | Mejora | Qué se ve hoy |
|---|---|---|
| F1 | **Botón fijo abajo en las fichas, en celular** | La ficha de cuero mide 6.600 px de alto. Hay botones al principio y al final, y un tramo de más de 4.000 px sin ninguno. |
| F2 | **Reseñas de Google en las fichas** | Están en portada, generador y casos reales, pero no en las fichas, que es donde llega la gente de Google. |
| F3 | **Textos de las fichas** | "El cuero permite gran variedad de medidas, y detalles. Por lo que el diseño y la medida es muy variado." y "cuero y pu" en minúscula en títulos y botones. Repasar las 11 fichas. |
| F4 | **Testimonio de la portada** | En celular aparece "Lucía M. — Marroquinería artesanal, Córdoba" (`LogoCloud.tsx`). No figura entre las reseñas de Google cargadas. Confirmar si es real; si no, reemplazarlo por una reseña real con link. |
| F5 | **Contadores de la portada** | "+0 años", "+0 sellos", "0 hs" hasta que carga la animación. En un celular lento o para Google se lee cero. Escribir el número real y animar encima. |
| F6 | **Las 9 tarjetas de usos dicen todas "Desde $76.000"** | Repetido nueve veces no informa. Mostrarlo una vez arriba, o mostrar la medida típica de cada uso. |
| F7 | **Portada cargada arriba** | En celular, antes de los botones hay título, bajada, precio, cuotas y garantía (7 líneas). Probar con la garantía debajo de los botones. |

### D. Posicionamiento en Google

El armado técnico está bien: 147 páginas en el mapa del sitio, títulos y descripciones propios,
una sola H1 por página, páginas por país enlazadas entre sí, generador y carrito fuera del índice.

| # | Mejora | Detalle |
|---|---|---|
| S1 | **Guías que responden búsquedas** (K6 de la auditoría) | No hay ninguna. Empezar por: cómo marcar cuero a fuego, qué medida de sello elegir, sello para pan de hamburguesa, cómo marcar madera sin quemarla. Cada una enlaza a su ficha y al generador. |
| S2 | **Plazo en los datos para Google** | Dice "3 a 5 días" y la web promete 72 hs. Alinear cuando se mida (Fase 8). |
| S3 | **Estrellas en Google** | Se quitó la calificación armada a mano (correcto). Las estrellas vuelven cuando la encuesta de Reseñas de Clientes junte opiniones: verificar que aparezca con una compra real. |
| S4 | **Página de casos reales pesada** | 457 KB de HTML, el doble que la portada. Revisar si los testimonios se repiten en el código. |
| S5 | **Fichas nuevas sin enlaces** | Chocolate y colmenas no aparecen en la portada ni en el listado. Sumar un enlace desde lacre, madera y productos. |
| S6 | **Seguimiento** | Comparar a mediados de diciembre contra la línea base del 5/11 (ver informe de competencia). Sumar "Métricas web principales". |
| S7 | **Ficha de Google** | Publicar fotos reales y novedades cada semana, y cargar los productos. Es la fuente de las "+100 reseñas" que ahora muestra la web. |

### E. Medición

| # | Mejora | Detalle |
|---|---|---|
| D1 | **Tablero semanal del embudo** (M7 de la auditoría) | Los números de la sección 3 salieron de consultas a mano. Una vista en Comercial Web con esos pasos por semana y por origen. |
| D2 | **Medir el clic en el precio y en WhatsApp por paso** | Para saber si G2 y G4 funcionan. |
| D3 | **Borrar la muestra de prueba** `67772097-7976-4239-848c-d8f97c283275` | Quedó de una prueba del 2/11. Falta el OK del dueño. |

---

## 6. Orden propuesto

1. **G1 + G2:** primer paso del generador como portada, con precio y cuotas. Es donde está el
   66 % de la pérdida y son cambios de texto e imagen.
2. **A1 + A2:** ubicaciones y caída de tráfico en Meta. No requiere tocar la web.
3. **G3:** seguir sin logo.
4. **G4 + G5:** paso de medidas y tarjeta de Alimentos.
5. **F1–F5:** fichas y portada.
6. **Fase 8:** medir las 72 hs (panel en Alcohn AI).
7. **Fase 1:** seguridad de la base.
8. **S1:** primeras cuatro guías.
9. **Fase 7:** complementos según el uso.

Cada cambio del generador se mide dos semanas antes y después con la tabla de la sección 3.
Próxima revisión del embudo: 16/11.

---

## 7. Detalle de las fases que siguen abiertas

### Fase 1 — Cerrar el acceso público a la base

`clientes`, `ordenes`, `sellos` y otras tablas no tienen reglas de acceso y la clave pública
(visible en el navegador de Alcohn AI) permite leer y modificar todo.

| Quién | Con qué clave | ¿Se rompe al cerrar? |
|---|---|---|
| Web | Clave de servidor | No |
| Bot de WhatsApp (VPS) | `SUPABASE_SERVICE_KEY` | No, si en el VPS es la clave de servidor (verificar) |
| Workers (vector, Andreani) | Clave de servidor | No |
| Funciones de Supabase | Clave de servidor, con respaldo a la pública | No, si el secreto está cargado (verificar) |
| Alcohn AI, extensión y sincronización de programas | Clave pública + usuario | **Sí**, salvo que se creen reglas para usuarios aprobados |

Pasos: verificar claves; función `es_usuario_aprobado()` (cualquiera puede registrarse, así que
no alcanza con "usuario logueado"); activar reglas tabla por tabla empezando por una de bajo
riesgo; impedir que alguien se apruebe solo; probar login, Pedidos, Producción, Comercial,
Envíos, extensión, programas, bot y un pedido web completo.

### Fase 7 — Complementos según el uso

Madera → calentador eléctrico. Cuero → mango de golpe o base para remachadora. Un toque para
sumarlo en el paso de pago, con el precio del catálogo. Antes: que Alcohn AI y
`confirm-web-order` registren el accesorio como accesorio.

### Fase 8 — Cumplir las 72 hs hábiles

1. Panel en Alcohn AI con el tiempo de cada etapa (pago → vectorizado → programado → hecho →
   foto) por semana.
2. Atacar la etapa que más demora.
3. Cuando se cumpla de forma estable: alinear el dato para Google y mostrar la fecha estimada
   en el checkout.

---

## 8. Cómo se hizo esta revisión

- Consultas de solo lectura a Supabase el 10/11 (`web_analytics_events`, `mockup_solicitudes`,
  `ordenes`).
- Revisión en celular de la portada, el primer paso del generador y la ficha de cuero, con el
  mismo código que está publicado.
- Revisión de títulos, descripciones, mapa del sitio y `robots.txt` en alcohnsellos.com.
- No se revisaron en esta vuelta: el checkout paso a paso, las páginas de otros países y la
  velocidad medida por Google.
- No se cambió nada en la web ni en la base.
