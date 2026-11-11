# Generador de muestras: hielo, cáscara de fruta, cerámica y pan

Fecha: 11/11/2026 · Estado: **primera versión programada** (ver sección 10)

Objetivo: que el cliente que elige hielo, fruta, cerámica o pan vea **su logo marcado en ese material, de forma tan real que parezca una foto de un trabajo hecho**. Hoy esos materiales se muestran como madera o cuero (`mapWizardMaterialToMockup` en `src/lib/mockupGenerator.ts`).

---

## 1. Por qué no alcanza con lo que hay hoy

El generador actual (cuero y madera) hace esto:
1. Toma una foto de textura **plana** que ocupa todo el cuadro (`cuero.jpg`, `madera.jpg`).
2. Pone el logo centrado, siempre al ~63 % del ancho, sin importar la medida del sello.
3. Aplica un efecto (quemado o bajorrelieve) con una luz fija desde arriba a la izquierda.
4. Le suma perspectiva, desenfoque y viñeta "de cámara" a toda la imagen.

Para cuero y madera funciona porque son superficies planas y grandes. Para los materiales nuevos no:

| Problema | Por qué importa |
|---|---|
| Hielo, fruta y pan son **objetos**, no superficies infinitas. | El logo tiene que quedar **dentro** del cubo, la naranja o el pan, con fondo alrededor. |
| Son **curvos** (naranja, pan, base de un bowl). | Un sello plano apoyado sobre algo curvo marca fuerte en el centro y menos en los bordes. Si el logo queda parejo, se nota falso. |
| El **tamaño real** importa. | Un sello de 6 cm en una naranja se ve ridículo; uno de 2 cm en un pan se pierde. El logo tiene que dibujarse a escala real. |
| La **luz** tiene que coincidir con la foto. | Si la foto está iluminada desde la derecha y el relieve desde la izquierda, el ojo lo detecta enseguida. |
| Cada material **reacciona distinto**. | El hielo se derrite (brillo, transparencia), el pan y la fruta se tuestan (color), la arcilla se hunde y levanta un borde. |

---

## 2. Cómo lo voy a hacer: "escenas calibradas" + simulación del marcado

### 2.1 Escenas en lugar de texturas
Cada material tiene 1 o 2 **escenas**: una foto real (de ustedes) del objeto sin marcar, más un archivo de datos que preparo yo:

```
public/mockup-scenes/pan-brioche-45/
  foto.jpg            ← foto original, sin marca
  escena.json         ← datos de la escena (abajo)
  superficie.png      ← mapa de alturas del objeto (domo del pan, esfera de la naranja…)
  zona.png            ← dónde se puede marcar (máscara del objeto)
  semillas.png        ← (solo pan con sésamo) dónde hay semillas
```

`escena.json` guarda:
- **Escala**: cuántos píxeles son 1 mm (se toma de la medida típica del objeto: cubo de bar ~5 cm, pan ~10 cm). Así el logo se dibuja **del tamaño real del sello**.
- **Centro de marcado** y **orientación** (en una foto a 45° el logo se inclina con el objeto).
- **Forma de la superficie**: plana, domo (pan), esfera (naranja), cilindro (vaso), con su radio en mm.
- **Luz**: de qué lado viene y qué tan alta está (se calibra con la foto marcada de verdad).
- **Foco**: cuánto desenfoque tiene la foto en esa zona, y el grano/ruido de la cámara, para que el logo no se vea "más nítido" que el resto.

Estos mapas se preparan **una sola vez** por escena (script `scripts/mockup-scene-prepare.mjs`). En el momento de generar la muestra solo se leen, así que la muestra sigue tardando 1–2 segundos.

### 2.2 Simulación del marcado (común a los 4 materiales)
Para cada muestra:

1. **Logo → máscara** (se reutiliza lo actual: `prepareLogoForStamp`, `buildMockupMaskFromRgba`).
2. **Escala real**: el logo se dibuja con la medida elegida (en el paso de Vista previa todavía no hay medida, así que se usa la recomendada para ese material, ver sección 4).
3. **Contacto del sello**: el sello es plano y el objeto es curvo. Calculo cuánto se hunde el sello en cada punto según la curvatura y la "blandura" del material:
   - Naranja de 7 cm con sello de 3 cm: los bordes del logo quedan ~3 mm más arriba que el centro → se marcan más suave o se cortan. Eso pasa en la realidad y es lo que hace creíble la muestra.
   - Pan (blando): se aplasta, el contacto es más parejo pero el borde del logo pierde fuerza.
   - Hielo y cerámica cruda planos: contacto completo.
4. **Mapa de profundidad del marcado**: a partir del contacto, armo el relieve del hundimiento. El perfil del borde cambia por material: redondeado (hielo derretido, pan), nítido (arcilla), suave (cáscara).
5. **Luz**: con el relieve calculo sombras y brillos usando **la luz de esa escena** (hoy la luz es fija).
6. **Respuesta del material** (cambia el color, el brillo o la transparencia, ver sección 3).
7. **Proyección**: el logo se "pega" a la superficie curva y a la perspectiva de la foto (en el pan a 45° el logo se achica arriba y se curva en los bordes).
8. **Micro-detalle**: el efecto se modula con la textura propia de la foto: poros de la naranja, miga y grietas del pan, escarcha del hielo, marcas de torno de la arcilla. Así el marcado "toma" la superficie y no queda como un sticker.
9. **Igualar la foto**: mismo desenfoque y mismo grano que la zona de la foto. **No** se agregan viñeta ni perspectiva artificial (la foto ya es real).
10. **Recorte final** con la máscara del objeto: nada se dibuja fuera del cubo, la naranja o el pan.

### 2.3 Lo que no voy a usar
**Generar la muestra con IA de imágenes** (como `api/mockups/generate-ai`). Se ve linda, pero **cambia el logo** (letras deformadas, detalles inventados), y para un sello eso es lo peor que puede pasar: el cliente aprueba algo que no es su sello. Todo lo de arriba es cálculo sobre fotos reales: el logo que se ve es exactamente el que se fabrica.

---

## 3. Cada material en detalle

### 3.1 Hielo (transparente de bar)
**Qué se muestra:** cubo grande de **hielo transparente de bar**.

**Cómo se ve de verdad:** el bronce caliente derrite el hielo. El logo queda **hundido, liso y más transparente** que el resto del cubo (la escarcha desaparece donde tocó el sello). En los bordes del hueco hay **brillos blancos** finos y a veces gotitas de agua. No hay ningún cambio de color.

**Efecto:**
- Hundimiento de bordes muy redondeados (el agua derretida suaviza todo).
- Dentro del hueco: se quita la escarcha (menos blanco, más contraste) y se **refracta** el fondo: la imagen de abajo se desplaza un poco según la pendiente del hueco, como una lupa.
- Brillos especulares fuertes en los bordes, según la luz de la escena.
- Película de agua: un brillo suave extra en el hueco y 2 o 3 gotitas cerca de los bordes (con posición fija por logo, no al azar en cada muestra).
- Detalles muy finos (menos de ~0,8 mm) se "funden": en la realidad tampoco se ven.

**Riesgo principal:** que se vea como un logo "pintado de blanco". Por eso necesito sí o sí una foto de un cubo marcado de verdad para calibrar.

### 3.2 Cáscara de fruta (pedazo de piel de cítrico cortado)
**Qué se marca:** un **pedazo de piel de cítrico cortado** (naranja, limón), como el que se usa de decoración en tragos. No la fruta entera.

**Cómo se ve de verdad:** el sello caliente tuesta la cáscara: marca **marrón caramelo a casi negro**, con el interior del trazo más oscuro en los bordes. El aceite de la cáscara deja la zona **brillante**. Los **poros** de la cáscara siguen visibles dentro de la marca. Hundimiento leve. En los bordes del pedazo se ve el blanco (albedo) del corte.

**Efecto:**
- Contacto sobre una superficie **levemente curva** (el pedazo de piel se arquea un poco), así que los extremos de un logo largo marcan apenas más suave.
- El logo nunca se sale del pedazo de piel.
- Rampa de color: naranja/amarillo → caramelo → marrón oscuro, según la intensidad del contacto. Los trazos finos quedan más claros (transmiten menos calor), los anchos más oscuros.
- Poros: los hoyitos de la cáscara quedan un poco más claros (el sello no los alcanza).
- Brillo de aceite: un poco más de especular en la marca.
- Hundimiento de 0,3–0,5 mm con borde suave.

### 3.3 Cerámica (pieza ya horneada: el resultado final)
**Qué se muestra:** la pieza **ya horneada**, que es lo que el cliente termina teniendo. El sello se aplicó en crudo, así que la marca es un **hundimiento**, no una quemadura.

**Cómo se ve de verdad:** hundimiento **nítido** con bordes apenas suavizados por la cocción y un reborde muy leve alrededor. Sombra dentro de los trazos. Si la pieza está **esmaltada**, el esmalte se acumula en el hueco: el logo se ve **más oscuro o más intenso** que el resto y en los bordes el esmalte se adelgaza y aclara (el efecto típico de "esmalte que rompe en los relieves"). Si es **sin esmaltar**, el logo es solo relieve y sombra.

**Efecto:**
- Relieve hundido con bordes nítidos, sombra interna (oclusión) y reborde leve.
- Variante esmaltada: el hueco toma el color del esmalte más concentrado (más oscuro) y los bordes se aclaran. Brillo del esmalte encima.
- Las marcas de torno y la textura de la foto atraviesan el logo (se respetan, no se borran).
- Contacto sobre superficie plana o levemente curva (base de bowl/taza, plato).

### 3.4 Pan de hamburguesa
**Cómo se ve de verdad** (la foto real "BULLGUER" del sitio lo muestra bien): marca **marrón muy oscuro, casi negra**, pareja en el centro, con un borde tostado más claro. La corteza brillante del brioche sigue brillando alrededor. El pan se hunde un poco y el logo **sigue la curva del domo**. Las grietas de la corteza atraviesan la marca.

**Efecto:**
- Proyección sobre domo (el pan a 45° es la escena principal).
- Contacto: el pan se aplasta, así que el centro marca parejo y los extremos de un logo grande pierden intensidad.
- Rampa de color tostado (dorado → marrón → casi negro) con un halo tostado de 1–2 mm alrededor del trazo.
- Hundimiento suave (0,5–1 mm) con sombra leve.
- **Sésamo**: las semillas quedan **por encima** del logo; las que están dentro de la marca se tuestan un poco (no desaparecen).
- Las grietas y la textura de la corteza modulan la marca.

---

## 4. Medidas por material

En el paso **Vista previa** todavía no se eligió la medida, así que se usa la recomendada. En el paso **Medida**, la muestra se vuelve a generar con la medida elegida para que el cliente vea si queda grande o chico sobre el objeto.

| Material | Objeto de la escena | Medida por defecto de la muestra | Medida máxima razonable |
|---|---|---|---|
| Hielo | Cubo de ~5–6 cm | 3,5–4 cm | ~5 cm (según el cubo) |
| Fruta | Naranja/limón de ~7 cm | 2,5 cm | ~3,5 cm (más grande no marca los bordes) |
| Cerámica | Base de bowl / placa | 2–3 cm | Sin límite fuerte |
| Pan | Pan de ~10 cm | 5–6 cm | ~8 cm |

Estas medidas las ajusto con ustedes; también sirven para limitar los tamaños que se ofrecen en la ficha (plan general, sección 4 paso 5).

Si el logo tiene detalles muy finos para ese material (hielo y pan sobre todo), se muestra un aviso honesto: *"En hielo los detalles muy finos se marcan menos. Te recomendamos la medida mediana."*

---

## 5. Calibración (cómo me aseguro de que sea realista)

No hace falta que Alcohn haga pruebas de marcado. La referencia de "cómo se ve de verdad" sale de:
- Las fotos reales de trabajos que ya están en la web (pan "BULLGUER", piezas de cerámica, etc.).
- Fotos de referencia públicas de cada material marcado (solo para mirar y ajustar, no se usan en la web).

Proceso:
1. Genero la muestra con 6 logos típicos: texto fino, texto grueso, logo circular, logo con mucho detalle, una sola letra, logo muy horizontal.
2. Armo una hoja de comparación (`scripts/mockup-calibrate.mjs`) con las muestras al lado de las referencias.
3. **Un material se publica solo cuando ustedes aprueban esa hoja.** Hasta entonces sigue mostrándose como hoy.

## 6. Cambios en el código

| Archivo | Cambio |
|---|---|
| `src/lib/mockupRender.ts` | `MockupMaterial` suma `'hielo' \| 'fruta' \| 'ceramica' \| 'pan'`. Nueva función `renderSceneMockup(logo, escena, medidaMm)` para los materiales con escena. Cuero y madera siguen igual. |
| `src/lib/mockupScenes/` (nuevo) | Carga de escenas, contacto, proyección sobre superficie, luz, igualación de foco y grano. |
| `src/lib/mockupMaterials/` (nuevo) | Un archivo por material: `hielo.ts`, `fruta.ts`, `ceramica.ts`, `pan.ts` con su efecto. |
| `src/lib/mockupGenerator.ts` | `mapWizardMaterialToMockup` usa el **uso** (`para-hielo`, `para-pan`, `para-fruta`, `para-ceramica`), no `alimentos`. |
| `src/app/api/mockups/generate/route.ts` | Recibe `uso` y `medida` (opcional). |
| `src/components/BuyWizard.tsx` | `resolveMockupGeneration` deja de mandar estos usos a madera/cuero; se regenera la muestra al cambiar la medida; miniatura del carrito correcta (`wizardCartImageUrl`). |
| `scripts/mockup-scene-prepare.mjs` (nuevo) | Prepara mapas de cada escena a partir de la foto y de los datos que marco. |
| `scripts/mockup-calibrate.mjs` (nuevo) | Hoja de comparación real vs. generado. |
| `scripts/test-mockup-ts.mjs` | Casos de prueba por material. |

Presupuesto de tiempo por muestra: ≤ 2 s en el servidor, igual que hoy.

---

## 7. Orden de trabajo

1. **Base de escenas** (carga, escala real, contacto, proyección, luz, igualar foco). Se prueba con cerámica. *Puedo arrancar esto con las fotos que ya hay en el sitio, sin esperar las nuevas.*
2. **Cerámica** → calibración → aprobación → publicar.
3. **Pan** → calibración → aprobación → publicar.
4. **Fruta** → ídem.
5. **Hielo** (el más difícil por la transparencia) → ídem.

Cada material, una vez que llegan sus fotos: 2–4 días hasta la hoja de comparación.

---

## 8. Imágenes: prompts para ChatGPT (versión 3: la marca es la protagonista)

**Regla principal:** la foto es para ver **la marca**, no el producto. La superficie donde va el logo es la protagonista; el negocio (bar, hamburguesería, taller) solo da contexto en los bordes de la foto.

En todos los prompts:
- Cámara **cenital o casi cenital**, de frente a la superficie que se marca (nunca de costado).
- La superficie a marcar ocupa **la mitad o más de la foto**, centrada, lisa, limpia y en foco.
- El contexto del negocio aparece **solo en los bordes**, cortado y desenfocado.
- Foto de celular en un local real, sin producción de estudio. Sin texto, sin logos, sin manos. Horizontal 3:2.

**Aprobada:** base de bowl en el taller (`public/mockup-scenes/ceramica-base-bowl.webp`).

### Hielo – vaso visto desde arriba
```
Foto cenital, tomada con celular directamente desde arriba, de un vaso old fashioned sobre la barra de madera gastada de un bar de coctelería de Buenos Aires. Adentro hay un negroni y un único cubo grande de hielo transparente de bar, con la cara superior plana, seca y paralela a la cámara, apenas por encima del líquido. La cara superior del cubo es la protagonista: está en el centro exacto de la foto, ocupa cerca de la mitad del alto de la imagen, se ve completa, cristalina, limpia y perfectamente enfocada. El borde del vaso rodea el cubo; alrededor solo se ve un poco de la barra de madera y, cortados en los bordes de la foto, un posavasos y un jigger. Luz cálida y real del bar. Foto real de bar, nada de estudio, de publicidad ni de render. Sin texto, sin logos, sin marcas en el hielo. Formato horizontal 3:2.
```

### Piel de cítrico – tabla de barra desde arriba
```
Foto cenital, tomada con celular directamente desde arriba, sobre una tabla de madera de barra gastada y con marcas de cuchillo, en un bar de coctelería de Buenos Aires. En el centro hay una tira ancha de piel de naranja recién sacada con pelador, con la cara exterior hacia arriba, plana: forma ovalada irregular, bordes desparejos con un poco de blanco, poros visibles y brillo del aceite. La piel es la protagonista: está en el centro de la foto, ocupa más de la mitad del ancho de la imagen, se ve completa y perfectamente enfocada. En los bordes de la foto, cortados: media naranja, la punta de un pelador y la base de un vaso. Luz real y cálida del bar. Foto real de trabajo detrás de la barra, nada de estudio. Sin texto, sin logos. Formato horizontal 3:2.
```

### Pan de hamburguesa – hamburguesa desde arriba
```
Foto cenital, tomada con celular directamente desde arriba, de una hamburguesa recién servida en una hamburguesería de barrio en Argentina. Se ve la tapa del pan de papa casero desde arriba: redonda, dorada, mate con apenas brillo, con algunas grietas finas solo cerca del borde y sin semillas. La tapa del pan es la protagonista: está en el centro de la foto, ocupa cerca de dos tercios del alto de la imagen, se ve completa, limpia y perfectamente enfocada. Por debajo del borde del pan asoman un poco de cheddar fundido y panceta. Alrededor, el papel manteca arrugado sobre una bandeja de metal y, cortadas en un borde de la foto, unas papas fritas. Luz natural de ventana del local. Comida real y casera, nada de publicidad de cadena ni producto plástico. Sin texto, sin logos, sin marcas en el pan. Formato horizontal 3:2.
```
Variante con sésamo: cambiar "sin semillas" por "con semillas de sésamo repartidas, no muy densas".

### Cerámica – taza, franja sin esmaltar de frente
```
Foto de primer plano, tomada con celular de frente y a la misma altura, de una taza de cerámica gres hecha a torno, ya horneada, en el taller de una ceramista argentina. La taza está esmaltada arriba (verde oliva con chorreaduras) y abajo sin esmaltar, con la arcilla horneada color arena tostado y marcas de torno. La franja de arcilla sin esmaltar es la protagonista: está en el centro de la foto, mirando de frente a la cámara, ocupa más de la mitad del ancho de la imagen, limpia y perfectamente enfocada. El borde superior de la taza y el asa quedan cortados o en los bordes de la foto. Atrás, muy desenfocado, el taller. Luz natural de ventana. Foto real de taller, nada de estudio. Sin texto, sin logos, sin sellos. Formato horizontal 3:2.
```

### Si ChatGPT no respeta el encuadre
- *"Misma imagen, pero tomada directamente desde arriba"*.
- *"Más cerca: que [la cara del hielo / la piel / la tapa del pan / la franja de arcilla] ocupe más de la mitad de la foto"*.
- *"Más real, como una foto de celular, menos producida"*.

## 9. Decisiones tomadas

- **Cerámica:** se muestra la pieza **ya horneada** (resultado final). Si es esmaltada, el esmalte se oscurece en el hueco del logo.
- **Fruta:** **pedazo de piel de cítrico cortado**, no la fruta entera.
- **Hielo:** **transparente de bar**.

## 10. Estado (11/11/2026)

Programado y probado en local (sin publicar, sin commit):
- Escenas en `public/mockup-scenes/`: pan cenital, hielo en negroni cenital, piel de naranja, base de bowl y franja de taza.
- Motor: `src/lib/mockupScenes/` (`scenes.ts` medidas de cada foto, `render.ts` escala real + curvatura + contacto + igualar foco/grano, `materials.ts` efecto por material, `raster.ts` utilidades).
- `mockupGenerator.ts` y `/api/mockups/generate` eligen la escena por uso (`para-hielo`, `para-pan`, `para-fruta`, `para-ceramica`). Cuero y madera no cambian.
- Generador (`BuyWizard.tsx`): manda el uso y si la medida es solo de referencia; deja de mostrar el aviso de "textura de referencia" para estos materiales; miniatura del carrito con la foto del material.
- Hoja de prueba: `npx tsx scripts/mockup-calibrate.ts <carpeta>`. Cada muestra tarda ~0,2–0,5 s.

Pendiente:
- Foto del pan: el papel tiene impresa una "M" (parece la marca de otro local). Regenerar con papel manteca liso.
- Regenerar la muestra al elegir la medida en el paso Medida (hoy se genera una vez, con la medida recomendada).
- Cerámica: se usa la base del bowl (logo centrado en el disco, en perspectiva, con zoom). La taza queda como escena alternativa.
- Aprobación de Alcohn de la hoja de prueba antes de publicar.
- Pan y piel usan texturas reales de quemado (`public/mockup-scenes/texturas/`) mezcladas con la foto.
