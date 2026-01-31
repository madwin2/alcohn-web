# Especificación Técnica - Servicio Python de Mockups

## Descripción General

Este servicio genera mockups visuales consistentes y realistas de sellos de bronce aplicados sobre diferentes materiales. El servicio utiliza procesamiento de imágenes con Python para crear efectos visuales precisos y reproducibles.

## Requisitos de Texturas y Efectos

### Material: Cuero

**Textura Base:**
- Textura de cuero vaqueta marrón clarito
- Grano natural y visible
- Variaciones sutiles de color que simulan el cuero real

**Efectos del Logo:**
1. **Logo Negro**: El logo debe aparecer en negro sólido sobre la textura de cuero
2. **Sombreado Suave**: 
   - Aplicar un sombreado suave en el área del logo
   - El sombreado debe simular la compresión del cuero
   - Gradiente suave desde los bordes hacia el centro del logo
3. **Biselado (Bevel)**:
   - Crear un efecto de biselado en los bordes del logo
   - Transición suave y redondeada entre el área del logo y el cuero circundante
   - Los bordes deben verse ligeramente elevados (el cuero alrededor del logo)
4. **Sombra**:
   - Sombra suave alrededor del logo para dar profundidad
   - La sombra debe seguir la forma del logo
   - Intensidad moderada, no demasiado oscura
5. **Brillo (Highlights)**:
   - Brillo sutil en los bordes exteriores del cuero (donde no está el logo)
   - Simular la reflexión de luz natural sobre el cuero
   - Los bordes del logo deben tener un ligero brillo que indique profundidad

**Resultado Visual:**
- El logo debe verse como una impresión en relieve (debossed) sobre el cuero
- El área del logo debe ser ligeramente más oscura que el cuero circundante
- Debe transmitir la sensación de que el sello fue presionado físicamente sobre el cuero

### Material: Madera

**Textura Base:**
- Textura de madera de pino clarita
- Vetas naturales visibles
- Variaciones de color que simulan la madera real

**Efectos del Logo:**
1. **Logo Negro**: El logo debe aparecer en negro sólido sobre la textura de madera
2. **Textura de Madera Quemada Superpuesta**:
   - Superponer una textura de madera quemada específicamente en el área del logo
   - La textura quemada debe seguir la forma del logo
   - Debe verse como si la madera fuera quemada/grabada en esa área específica
   - Color más oscuro, con textura carbonizada
3. **Glow Exterior (Resplandor de Calor)**:
   - Aplicar un efecto de glow (resplandor) alrededor del logo
   - El glow debe simular el calor que se escapa de la marca quemada
   - Color cálido (naranja/amarillo suave) que se desvanece hacia el exterior
   - Intensidad moderada, no demasiado intenso
   - El glow debe ser más intenso cerca del logo y desvanecerse gradualmente

**Resultado Visual:**
- El logo debe verse como una marca quemada/grabada en la madera
- Debe haber un resplandor cálido alrededor que simule el calor residual
- La textura de madera quemada debe ser visible dentro del área del logo
- Debe transmitir la sensación de que el sello fue aplicado con calor sobre la madera

## Procesamiento del Logo

### Entrada
- Logo en formato PNG, JPG o SVG
- Debe ser monocromático (negro sobre fondo blanco/transparente)
- Puede venir como base64 data URL o URL pública

### Procesamiento
1. **Validación**: Verificar que el logo sea válido y procesable
2. **Conversión**: Si es SVG, convertir a PNG
3. **Extracción del Logo**: 
   - Extraer solo el área del logo (ignorar fondos blancos/transparentes)
   - Crear una máscara del logo
4. **Ajuste de Tamaño**: 
   - Ajustar el logo al tamaño del sello manteniendo proporciones
   - Respetar el aspect ratio del diseño del logo

## Generación del Mockup

### Dimensiones
- **Resolución mínima**: 1920x1080px
- **Resolución recomendada**: 2560x1440px o superior
- **Formato**: PNG de alta calidad

### Proceso por Material

#### Cuero
1. Cargar textura base de cuero vaqueta marrón clarito
2. Aplicar el logo negro en la posición central
3. Aplicar sombreado suave en el área del logo
4. Aplicar efecto de biselado en los bordes
5. Aplicar sombras alrededor del logo
6. Aplicar brillos en los bordes exteriores
7. Combinar todas las capas con blending modes apropiados

#### Madera
1. Cargar textura base de madera de pino clarita
2. Aplicar el logo negro en la posición central
3. Superponer textura de madera quemada en el área del logo
4. Aplicar efecto de glow exterior (resplandor de calor)
5. Ajustar intensidades y opacidades
6. Combinar todas las capas con blending modes apropiados

## API Endpoint

### POST `/api/mockups/generate`

**Request Body:**
```json
{
  "logo": "data:image/png;base64,...",
  "size": "40x40mm",
  "material": "cuero" | "madera" | "ambos" | "ceramica" | "alimentos" | "otros",
  "aspectRatio": 1.0,
  "customSize": {
    "width": 40,
    "height": 40
  }
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "mockupUrl": "https://storage.alcohn.com/mockups/abc123.png",
  "thumbnailUrl": "https://storage.alcohn.com/mockups/thumbnails/abc123.jpg",
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00Z",
    "processingTime": 3500,
    "material": "cuero"
  }
}
```

## Stack Tecnológico Recomendado

### Librerías Python
- **Pillow (PIL)**: Procesamiento básico de imágenes
- **OpenCV**: Operaciones avanzadas de imagen, filtros, blending
- **NumPy**: Operaciones matemáticas y manipulación de arrays
- **scikit-image**: Efectos de imagen, filtros, transformaciones

### Efectos Específicos

**Para Cuero:**
- `cv2.GaussianBlur()` para sombreado suave
- `cv2.filter2D()` para efectos de biselado
- `cv2.addWeighted()` para blending de capas
- Filtros de brillo y contraste

**Para Madera:**
- `cv2.GaussianBlur()` para el glow exterior
- `cv2.addWeighted()` para superponer textura quemada
- Filtros de color para el efecto de calor (naranja/amarillo)
- Operaciones morfológicas para definir bordes

## Texturas Necesarias

### Texturas Base
1. **Cuero vaqueta marrón clarito**: Textura de alta resolución (mínimo 2048x2048px)
2. **Madera de pino clarita**: Textura de alta resolución (mínimo 2048x2048px)

### Texturas de Efectos
1. **Madera quemada**: Textura de madera carbonizada para superponer en el área del logo

## Consideraciones de Calidad

### Consistencia
- Los mockups deben ser **100% reproducibles** con los mismos inputs
- No debe haber variaciones aleatorias entre generaciones
- Los efectos deben aplicarse de manera determinística

### Realismo
- Los efectos deben verse naturales y creíbles
- Las texturas deben ser de alta calidad
- Los efectos de luz y sombra deben ser coherentes

### Rendimiento
- Tiempo objetivo: menos de 10 segundos por mockup
- Tiempo máximo: 30 segundos
- Optimizar operaciones de imagen para velocidad

## Ejemplo de Implementación (Pseudocódigo)

```python
def generate_leather_mockup(logo_image, size, texture_path):
    # 1. Cargar textura de cuero
    leather_texture = load_texture(texture_path)
    
    # 2. Procesar logo
    logo_mask = extract_logo_mask(logo_image)
    logo_black = convert_to_black(logo_image, logo_mask)
    
    # 3. Aplicar efectos
    shadowed_area = apply_soft_shadow(logo_mask)
    beveled_edges = apply_bevel_effect(logo_mask)
    highlights = generate_highlights(logo_mask)
    
    # 4. Combinar capas
    result = combine_layers(
        base=leather_texture,
        logo=logo_black,
        shadow=shadowed_area,
        bevel=beveled_edges,
        highlights=highlights
    )
    
    return result

def generate_wood_mockup(logo_image, size, wood_texture_path, burned_texture_path):
    # 1. Cargar texturas
    wood_texture = load_texture(wood_texture_path)
    burned_texture = load_texture(burned_texture_path)
    
    # 2. Procesar logo
    logo_mask = extract_logo_mask(logo_image)
    logo_black = convert_to_black(logo_image, logo_mask)
    
    # 3. Aplicar efectos
    burned_area = apply_burned_texture(logo_mask, burned_texture)
    heat_glow = generate_heat_glow(logo_mask)
    
    # 4. Combinar capas
    result = combine_layers(
        base=wood_texture,
        logo=logo_black,
        burned=burned_area,
        glow=heat_glow
    )
    
    return result
```

## Notas de Implementación

1. **Reproducibilidad**: Usar semillas fijas para cualquier operación aleatoria (si es necesario)
2. **Cache**: Implementar cache de texturas cargadas para mejorar rendimiento
3. **Validación**: Validar que todas las texturas necesarias estén disponibles antes de procesar
4. **Error Handling**: Manejar errores de carga de texturas, procesamiento de imágenes, etc.
5. **Logging**: Registrar tiempos de procesamiento y errores para monitoreo

## Próximos Pasos

1. Obtener o crear las texturas base (cuero y madera)
2. Obtener o crear la textura de madera quemada
3. Implementar las funciones de procesamiento de efectos
4. Probar con diferentes logos y tamaños
5. Ajustar parámetros de efectos para lograr el resultado visual deseado
6. Optimizar para rendimiento
image.png