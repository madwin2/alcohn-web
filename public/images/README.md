# Imágenes del sitio

Coloca aquí las imágenes del sitio web organizadas en las siguientes carpetas:

## Estructura de carpetas

### `/carousel/`
Imágenes para el carrusel automático de la sección dividida (mitad izquierda).
- `pan-1.jpg` - Imagen del sello en pan (primera)
- `cuero-1.jpg` - Imagen del sello en cuero (segunda)
- `madera-1.jpg` - Imagen del sello en madera (tercera)

### `/hover/`
Imágenes para la sección de hover (4 imágenes con efecto hover).
- `madera-default.jpg` - Producto de madera (estado normal)
- `madera-hover.jpg` - Producto de madera marcado (al pasar cursor)
- `cuero-default.jpg` - Producto de cuero (estado normal)
- `cuero-hover.jpg` - Producto de cuero marcado (al pasar cursor)
- `producto3-default.jpg` - Tercer producto (estado normal)
- `producto3-hover.jpg` - Tercer producto marcado (al pasar cursor)
- `producto4-default.jpg` - Cuarto producto (estado normal)
- `producto4-hover.jpg` - Cuarto producto marcado (al pasar cursor)

### `/sello/`
Imagen del sello para la sección dividida (mitad derecha).
- `sello-bronce.jpg` - Imagen del sello de bronce

## Formato recomendado
- **Formato**: JPG, PNG o WebP
- **Tamaño**: Optimiza las imágenes antes de subirlas (recomendado: máximo 2MB por imagen)
- **Resolución**: 
  - Carrusel: mínimo 1200x800px
  - Hover: mínimo 800x800px (cuadradas)
  - Sello: mínimo 600x600px

## Cómo usar las imágenes

Una vez que coloques las imágenes en estas carpetas, actualiza los archivos:
- `src/app/page.tsx` - Reemplaza los `bgColor` por las rutas de las imágenes

Ejemplo:
```typescript
// Antes (placeholder):
{ id: 1, alt: 'Sello en pan', bgColor: '#f3f4f6' }

// Después (con imagen):
{ id: 1, alt: 'Sello en pan', src: '/images/carousel/pan-1.jpg' }
```





