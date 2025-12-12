# Ejemplo de cómo usar las imágenes

## 1. Carrusel automático (sección dividida - mitad izquierda)

**Ubicación en el código:** `src/app/page.tsx` (línea ~78-85)

**Antes (con placeholders):**
```typescript
<AutoImageCarousel
  images={[
    { id: 1, alt: 'Sello en pan', bgColor: '#f3f4f6' },
    { id: 2, alt: 'Sello en cuero', bgColor: '#e5e7eb' },
    { id: 3, alt: 'Sello en madera', bgColor: '#d1d5db' },
  ]}
  interval={4000}
/>
```

**Después (con imágenes reales):**
```typescript
<AutoImageCarousel
  images={[
    { id: 1, alt: 'Sello en pan', src: '/images/carousel/pan-1.jpg' },
    { id: 2, alt: 'Sello en cuero', src: '/images/carousel/cuero-1.jpg' },
    { id: 3, alt: 'Sello en madera', src: '/images/carousel/madera-1.jpg' },
  ]}
  interval={4000}
/>
```

---

## 2. Imagen del sello (sección dividida - mitad derecha)

**Ubicación en el código:** `src/app/page.tsx` (línea ~90-92)

**Antes (con placeholder):**
```typescript
<div className="w-48 h-48 mb-8 bg-gradient-to-br from-amber-200 to-amber-400 rounded-lg flex items-center justify-center shadow-lg">
  <div className="w-32 h-32 bg-gradient-to-br from-amber-300 to-amber-500 rounded shadow-inner"></div>
</div>
```

**Después (con imagen real):**
```typescript
<div className="w-48 h-48 mb-8 rounded-lg overflow-hidden shadow-lg">
  <img 
    src="/images/sello/sello-bronce.jpg" 
    alt="Sello de bronce Alcohn" 
    className="w-full h-full object-cover"
  />
</div>
```

---

## 3. Imágenes con efecto hover

**Ubicación en el código:** `src/app/page.tsx` (línea ~152-180)

**Antes (con placeholders):**
```typescript
<HoverImage
  defaultImage={{ alt: 'Producto de madera', bgColor: '#d4a574' }}
  hoverImage={{ alt: 'Producto de madera marcado', bgColor: '#b8956a' }}
/>
```

**Después (con imágenes reales):**
```typescript
<HoverImage
  defaultImage={{ alt: 'Producto de madera', src: '/images/hover/madera-default.jpg' }}
  hoverImage={{ alt: 'Producto de madera marcado', src: '/images/hover/madera-hover.jpg' }}
/>
```

**Ejemplo completo para las 4 imágenes:**
```typescript
{/* Imagen 1 - Madera */}
<div className="aspect-square">
  <HoverImage
    defaultImage={{ alt: 'Producto de madera', src: '/images/hover/madera-default.jpg' }}
    hoverImage={{ alt: 'Producto de madera marcado', src: '/images/hover/madera-hover.jpg' }}
  />
</div>

{/* Imagen 2 - Cuero */}
<div className="aspect-square">
  <HoverImage
    defaultImage={{ alt: 'Producto de cuero', src: '/images/hover/cuero-default.jpg' }}
    hoverImage={{ alt: 'Producto de cuero marcado', src: '/images/hover/cuero-hover.jpg' }}
  />
</div>

{/* Imagen 3 */}
<div className="aspect-square">
  <HoverImage
    defaultImage={{ alt: 'Producto', src: '/images/hover/producto3-default.jpg' }}
    hoverImage={{ alt: 'Producto marcado', src: '/images/hover/producto3-hover.jpg' }}
  />
</div>

{/* Imagen 4 */}
<div className="aspect-square">
  <HoverImage
    defaultImage={{ alt: 'Producto', src: '/images/hover/producto4-default.jpg' }}
    hoverImage={{ alt: 'Producto marcado', src: '/images/hover/producto4-hover.jpg' }}
  />
</div>
```

---

## Notas importantes

1. **Rutas de imágenes**: En Next.js, las imágenes en `/public` se referencian desde la raíz con `/`
   - ✅ Correcto: `/images/carousel/pan-1.jpg`
   - ❌ Incorrecto: `public/images/carousel/pan-1.jpg`

2. **Formato de nombres**: Usa nombres descriptivos y sin espacios
   - ✅ Correcto: `sello-bronce.jpg`, `madera-default.jpg`
   - ❌ Incorrecto: `sello bronce.jpg`, `madera default.jpg`

3. **Optimización**: Antes de subir las imágenes, optimízalas para web
   - Usa herramientas como TinyPNG, ImageOptim o similar
   - Formato WebP es ideal para mejor rendimiento

4. **Tamaños recomendados**:
   - Carrusel: 1200x800px
   - Hover: 800x800px (cuadradas)
   - Sello: 600x600px



