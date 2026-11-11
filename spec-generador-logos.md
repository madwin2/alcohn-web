# Especificación: generador de logos con asesor de fabricabilidad

Fecha: 10/11/2026 · Estado: **propuesta en análisis** (no se tocó la web)

La idea: que un cliente sin logo, o con uno que no sirve para grabar, pueda armar un logo lindo y acorde a su rubro (carpintería, marroquinería, cerámica, jabones…), editarlo como en un Canva simplificado y pasarlo directo al generador de muestras y al carrito. Mientras edita, un **asesor** le avisa qué se puede fabricar y qué no ("esta letra es muy chica", "este trazo no se puede mecanizar").

El objetivo es que salgan logos **realmente buenos**, no plantillas genéricas. Por eso la calidad la ponen tres cosas que controla Alcohn: una **biblioteca curada**, las **reglas del taller** y el **asesor**. La IA solo combina esas piezas según el negocio.

---

## 1. Decisión de fondo: la IA no dibuja el logo

| Opción | Problema / ventaja |
|---|---|
| Generador de imágenes con IA (dibuja el logo entero) | Letras deformadas, imagen en píxeles (no vector), no editable, detalles finos que se empastan. **Se descarta para el logo final.** |
| **IA como "diseñador" que combina piezas curadas** | Sale en vector, 100% editable, siempre fabricable porque las piezas ya están probadas en la CNC. **Opción elegida.** |

Flujo: el cliente describe su negocio → un modelo de lenguaje (Claude u OpenAI, que ya está en `package.json`) devuelve una **receta de diseño en JSON** (composición + tipografía + ícono + textos) → nuestro código la dibuja en SVG → el cliente la edita → el asesor la valida → se exporta al generador.

---

## 2. Punto de partida (lo que hay hoy)

| Tema | Situación actual | Archivo |
|---|---|---|
| Logo de solo texto ("No tengo logo") | 4 estilos tipográficos, hasta 2 líneas y 28 caracteres, dibujado en canvas y exportado como PNG al generador | `src/lib/textLogo.ts`, `src/components/buy/WizardTextLogo.tsx` |
| Integración con el generador | `BuyWizard` recibe el logo de texto (`textLogo: { styleId, lines }`) | `src/components/BuyWizard.tsx` |
| Usos y medidas recomendadas por material | Madera, cuero, cerámica, jabón, packaging, lacre, hielo, pan, fruta, chocolate, colmenas | `src/data/stampUseCases.ts` |
| Muestras sobre material | Mockups de texto y efectos | `src/lib/textStampMockup.ts`, `src/lib/mockupPythonLikeEffects.ts` |

El generador de logos **reemplaza y amplía** el "No tengo logo" actual: el logo de solo texto pasa a ser una composición más.

---

## 3. Experiencia del cliente

1. **Contanos de tu negocio** (un paso, mobile first):
   - Nombre de la marca (obligatorio).
   - Rubro: lista con los rubros más comunes + "Otro" con texto libre.
   - Descripción corta opcional ("marroquinería artesanal en Córdoba, cosido a mano").
   - Estilo: Rústico · Clásico · Moderno · Vintage · Minimalista · Elegante (puede elegir "no sé").
   - Textos opcionales: bajada ("Hecho a mano"), año ("Desde 2019"), ciudad.
   - **¿Dónde lo vas a usar?** (material, opcional pero recomendado): define las reglas del asesor desde el inicio. Si ya viene del generador con material elegido, se completa solo.
2. **Propuestas**: grilla de 6 a 8 logos distintos entre sí (no 8 variantes del mismo). Botón "Ver más propuestas".
3. **Editor**: el cliente toca una propuesta y la ajusta (ver punto 5). El asesor está siempre visible.
4. **Pasar al sello**: elige medida y material → se abre el generador con la muestra ya armada → carrito.

---

## 4. Biblioteca curada (el corazón de la calidad)

### 4.1 Tipografías
- Entre 15 y 25 fuentes, **con licencia que permita uso comercial y embebido** (ej. SIL Open Font License). Se documenta la licencia de cada una.
- Cada fuente tiene ficha: estilos con los que combina, rubros sugeridos, **grosor de trazo mínimo** y **tamaño mínimo legible** medidos en el taller.
- Se descartan fuentes con trazos muy finos o remates delicados que no sobreviven al grabado.

### 4.2 Íconos por rubro
- Vectoriales, dibujados **para sello**: trazos gruesos, pocos detalles, huecos amplios.
- Cada ícono con 2 niveles de detalle: **normal** y **simplificado** (para medidas chicas o materiales que empastan).
- Lista inicial por rubro (a completar):
  - Carpintería: serrucho, formón, cepillo, tronco, veta, escuadra.
  - Marroquinería: aguja e hilo, costura, cuero estirado, cinturón, billetera.
  - Cerámica: torno, vasija, mano con arcilla.
  - Jabones / cosmética: gota, hoja, flor, burbuja.
  - Gastronomía / panadería: espiga, trigo, horno, cuchara de madera.
  - Apicultura: abeja, panal, hexágono.
  - Chocolate / pastelería: grano de cacao, batidor.
  - Genéricos: estrella, laurel, sol, montaña, ondas, marcos y filetes.
- **Recomendado: contratar a un diseñador** para dibujar la biblioteca inicial (es el trabajo más grande y el que más impacta en la calidad).

### 4.3 Composiciones (plantillas)
8 a 10 estructuras, todas paramétricas (se acomodan al largo del texto):
- Horizontal (ícono + nombre).
- Apilado (ícono arriba, nombre abajo, bajada).
- Círculo con texto curvo arriba y abajo.
- Escudo / emblema.
- Sello vintage (nombre + "Desde 2019" + ciudad).
- Monograma (iniciales).
- Solo texto (los 4 estilos actuales).
- Marco rectangular con filetes.

Cada composición declara qué campos acepta (nombre, bajada, año, ciudad, ícono) y su rango de medidas recomendado.

---

## 5. Editor (tipo Canva, acotado)

Lo que el cliente **sí** puede hacer:
- Editar cada texto.
- Cambiar tipografía (solo de la biblioteca).
- Cambiar el ícono (por rubro, con buscador) o quitarlo.
- Cambiar de composición sin perder los textos.
- Agrandar / achicar / mover elementos dentro de la composición, con guías y centrado automático.
- Ajustar espaciado entre letras y curvatura del texto (en composiciones circulares).
- Deshacer / rehacer.

Lo que **no** puede (a propósito): subir fuentes propias, rotar libremente, superponer cosas sin límite, usar degradados o colores (el sello es una sola tinta / un solo relieve). Menos opciones = mejores resultados.

Técnica sugerida: editor propio en **SVG** con un modelo de datos simple (la receta JSON es el estado del editor). Alternativas a evaluar: Fabric.js o Konva. Los textos se convierten a trazos (contornos) al exportar para que la fábrica reciba el vector exacto.

---

## 6. Asesor de fabricabilidad

### 6.1 Reglas medibles (determinísticas)
Se calculan sobre el vector **a la medida física elegida** y con los límites del material. Cada aviso tiene nivel (verde / amarillo / rojo), explicación en lenguaje simple y, cuando se puede, **botón "Arreglarlo"**.

| Regla | Ejemplo de aviso | Arreglo automático |
|---|---|---|
| Alto mínimo de texto | "La bajada mide 1,6 mm de alto, va a costar leerla." | Agrandar el texto o el sello, acortar la bajada |
| Grosor mínimo de trazo | "Esta línea mide 0,3 mm, no se puede fabricar en bronce." | Engrosar trazo / usar ícono simplificado |
| Huecos que se cierran | "El hueco de la 'e' se va a empastar en lacre." | Más espaciado, fuente más abierta |
| Separación entre elementos | "El ícono queda pegado al texto." | Reacomodar |
| Densidad de detalle | "Demasiado detalle para 25×25 mm." | Versión simplificada del ícono |
| Cantidad de texto | "Son muchas palabras para esta medida." | Sugerir sacar año o ciudad |
| Elementos cerca del borde | "El texto queda muy cerca del borde del sello." | Achicar contenido |
| Áreas de relleno grandes | (según material) aviso si un bloque lleno grande no marca parejo | Pasar a contorno |

**Los números límite los define el taller**, por material. Tabla a completar (los valores son orientativos, a confirmar con pruebas):

| Material | Trazo mínimo | Alto de texto mínimo | Hueco mínimo | Notas |
|---|---|---|---|---|
| Madera | a calibrar | a calibrar | a calibrar | |
| Cuero | a calibrar | a calibrar | a calibrar | |
| Lacre | a calibrar | a calibrar | a calibrar | empasta más: pedir huecos amplios |
| Jabón | a calibrar | a calibrar | a calibrar | |
| Pan / fruta / hielo | a calibrar | a calibrar | a calibrar | diseños muy simples |
| Cerámica, chocolate, packaging, colmenas | a calibrar | a calibrar | a calibrar | |

Propuesta: armar una **plancha de prueba por material** (líneas de distinto grosor, textos de distinto alto, letras con huecos) y fijar los valores con lo que realmente sale bien.

### 6.2 Consejos de diseño (IA)
Comentarios suaves, nunca bloqueantes, por ejemplo:
- "El ícono compite con el nombre: probá achicarlo."
- "Para cuero, el estilo rústico queda mejor con menos líneas."
- "Tu marca es larga: la composición horizontal se va a leer mejor."

### 6.3 También para logos subidos
El mismo asesor (parte medible) se aplica a los **logos que el cliente sube** hoy en el generador. Para eso hay que medir el logo a partir de la imagen (o del SVG si lo sube en vector). Esto da valor inmediato aunque el cliente no use el generador de logos.

---

## 7. Cómo genera propuestas la IA

- Entrada: nombre, rubro, descripción, estilo, textos opcionales, material.
- El modelo recibe **el catálogo de piezas disponibles** (ids de fuentes, íconos y composiciones con sus fichas) y debe devolver un JSON validado con esquema, por ejemplo:
  `{ composicion: "circulo-texto-curvo", fuente: "x", icono: "serrucho", textos: { nombre, bajada, anio }, motivo: "..." }`
- El servidor valida que todas las piezas existan y que la receta pase el asesor; las que no pasan se corrigen o se descartan.
- Se piden 8 a 10 recetas **variadas** (distintas composiciones y fuentes) y se muestran las mejores 6 a 8.
- Costo estimado: una llamada por tanda de propuestas, del orden de centavos de dólar.
- Respaldo sin IA: si el servicio falla, se arman propuestas con reglas fijas por rubro y estilo.

---

## 8. Paso al sello y a producción

- Export: **SVG con textos convertidos a contornos** + PNG para la muestra.
- Entra a `BuyWizard` igual que hoy el logo de texto, pero guardando la **receta JSON** junto al pedido para poder reabrir y editar.
- En el panel, Alcohn ve el vector listo para producir (menos retoques manuales).
- Opcional más adelante: el cliente guarda su logo y descarga un **kit de marca** (versiones horizontal / apilada / monograma) para redes y etiquetas.

---

## 9. Riesgos y cuidados

| Riesgo | Cómo se cubre |
|---|---|
| Licencias de tipografías e íconos | Solo fuentes con licencia comercial documentada; íconos propios o con licencia comercial clara |
| Logos parecidos a marcas registradas | Biblioteca propia (no se copian logos); aviso al cliente de que la marca registrada es responsabilidad suya |
| Propuestas genéricas o repetidas | Biblioteca amplia por rubro + pedir variedad a la IA + revisar muestras reales antes de lanzar |
| Avisos del asesor equivocados | Calibrar con planchas de prueba; empezar con avisos amarillos (no bloqueantes) hasta confiar en los números |
| Editor pesado en celulares | Diseño mobile first, SVG liviano, pocas fuentes cargadas a la vez |

---

## 10. Etapas propuestas

| Etapa | Qué incluye | Por qué en este orden |
|---|---|---|
| **1. Asesor de fabricabilidad** | Planchas de prueba por material, tabla de límites, avisos sobre logos subidos y logo de texto actual | Impacto inmediato, no depende de la IA ni de la biblioteca |
| **2. Biblioteca y editor** | Fuentes curadas, íconos por rubro (diseñador), composiciones, editor SVG, export a `BuyWizard` | Es la base de la calidad; ya sirve sin IA (el cliente elige rubro y estilo) |
| **3. Propuestas con IA** | Descripción del negocio → recetas JSON → propuestas variadas + consejos de diseño | Se suma sobre piezas que ya funcionan |
| **4. Extras** | Guardar logos, reabrir desde el pedido, kit de marca, íconos generados con IA y pasados a vector | Cuando lo anterior esté medido |

---

## 11. Cómo medimos si funciona

- % de clientes sin logo que terminan un logo y llegan al carrito.
- % de pedidos que Alcohn tiene que retocar o pedir de nuevo al cliente (debería bajar).
- Cantidad de avisos rojos al momento de comprar (debería tender a cero).
- Encuesta corta al terminar: "¿Te gustó tu logo?".

---

## 12. Decisiones pendientes

- [ ] ¿Rubros de la primera tanda de íconos? (sugerido: carpintería, marroquinería, cerámica, jabones, panadería, apicultura)
- [ ] ¿Diseñador externo para la biblioteca o se dibuja en casa?
- [ ] Valores límite por material (planchas de prueba).
- [ ] ¿El generador de logos es gratis para todos o solo se habilita al comprar?
- [ ] ¿El asesor bloquea la compra con avisos rojos o solo advierte?
- [ ] Proveedor de IA (Claude u OpenAI) y límite de propuestas por cliente para controlar costos.
