# Imágenes para el efecto scroll

Coloca aquí las imágenes que aparecen progresivamente al hacer scroll en la sección de la cita destacada (lado derecho).

## Estructura

Las imágenes deben nombrarse:
- `scroll-1.png` - Primera imagen (aparece primero)
- `scroll-2.png` - Segunda imagen (aparece después)
- `scroll-3.png` - Tercera imagen (aparece al final)

## Características

- Las imágenes aparecen de forma superpuesta
- Se muestran progresivamente mientras haces scroll
- Tamaño recomendado: 400x400px (cuadradas)
- Formato: PNG, JPG o WebP

## Cómo actualizar el código

Una vez que subas las imágenes, actualiza `src/app/page.tsx` (línea ~58-64):

```typescript
<ScrollImages
  sectionId="quote-section"
  images={[
    { id: 1, top: '0', right: '0', src: '/images/scroll/scroll-1.png', alt: 'Imagen 1' },
    { id: 2, top: '8rem', right: '2rem', src: '/images/scroll/scroll-2.png', alt: 'Imagen 2' },
    { id: 3, top: '16rem', right: '4rem', src: '/images/scroll/scroll-3.png', alt: 'Imagen 3' },
  ]}
/>
```





