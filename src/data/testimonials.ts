export interface Testimonial {
  name: string;
  quote: string;
  image: string;
  /** Origen de la reseña (casos-reales / Google Business). */
  source?: 'Google';
  /** Valoración 1–5 (reseñas de Google Business Profile). */
  rating?: number;
  /** Fecha de publicación ISO 8601. */
  datePublished?: string;
}

/** Para JSON-LD de reseñas en /casos-reales. */
export function toReviewJsonLdInputs(items: Testimonial[]) {
  return items.map((item) => ({
    authorName: item.name,
    reviewBody: item.quote,
  }));
}

export type ProductReviewInput = {
  author: string;
  ratingValue: number;
  reviewBody: string;
  datePublished?: string;
};

/** Promedio y conteo desde testimonios con rating (schema Product). */
export function getAggregateRating(items: Testimonial[] = testimonials) {
  const rated = items.filter((t): t is Testimonial & { rating: number } => t.rating != null);
  if (rated.length === 0) return undefined;
  const reviewCount = rated.length;
  const ratingValue =
    Math.round((rated.reduce((sum, t) => sum + t.rating, 0) / reviewCount) * 10) / 10;
  return { ratingValue, reviewCount };
}

/** Reseñas para schema Product (subset con rating explícito). */
export function toProductReviewInputs(items: Testimonial[] = testimonials): ProductReviewInput[] {
  return items
    .filter((t) => t.rating != null)
    .map((t) => ({
      author: t.name,
      ratingValue: t.rating!,
      reviewBody: t.quote,
      ...(t.datePublished ? { datePublished: t.datePublished } : {}),
    }));
}

const avatar = (filename: string) => `/images/testimonials/${filename}`;

/** Retratos genéricos de Unsplash (testimonios sin foto propia aún). */
const portrait = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=80&h=80&q=80`;

export const testimonials: Testimonial[] = [
  {
    name: 'Leandro Muñoz',
    quote:
      'Destaco el excelente trabajo, la responsabilidad, la puntualidad y la calidad. Con una atención llena de calidez y amabilidad.',
    image: portrait('photo-1507003211169-0a1dd7228f2d'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Juan Ví',
    quote:
      'Excelente atención y asesoramiento para el proceso de armar la matriz de tu marca o logo, la mejor calidad y terminación.',
    image: portrait('photo-1500648767791-00dcc994a43e'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Emanuel Naval',
    quote:
      'Excelente empresa, muy buena atención, siempre respondieron a mis consultas. Cumplen con los tiempos de fabricación y entrega. El producto tiene muy buena calidad y terminación.',
    image: portrait('photo-1472099645785-5658abf4ff4e'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Lucas Vega',
    quote:
      '100% recomendable. Desde el primer mensaje hasta la entrega, se tomaron el tiempo para explicar y sacar todas las dudas.',
    image: portrait('photo-1519345182560-3f2917c472ef'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Guillermo Berasategui',
    quote:
      'Excelente todo, absolutamente todo. Desde la atención inicial hasta la post venta. Muy profesionales, vale la pena trabajar con ellos.',
    image: portrait('photo-1438761681033-6461ffad8d80'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Estela Burgos',
    quote:
      'Realmente excelente. En el diseño, dedicación, atención y rapidez en el envío. Gracias Alcohn, altamente recomendable.',
    image: portrait('photo-1544005313-94ddf0286df2'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Andrea Leone',
    quote:
      'Increíble el sello que me enviaron, me encantó cómo queda en mis calzados. Ahora mi marca tiene un toque de distinción más.',
    image: portrait('photo-1534528741775-53994a69daeb'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Diego Ríos Pérez',
    quote:
      'Súper recomendable. Muy buena calidad del material y acabado del sello. Con gran profesionalismo te indican cómo usarlo.',
    image: portrait('photo-1506794778202-cad84cf45f1d'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Rosario Plaza',
    quote:
      'Excelente atención, resolvieron mis dudas y realizaron el trabajo en tiempo y forma. Muy recomendable, le da a mis bolsos un toque de distinción.',
    image: portrait('photo-1527980965255-d3b416303d12'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Rosana Sosa',
    quote:
      'Excelente producto. Superó mis expectativas, prolijo, de calidad y muy fácil de usar. Le otorga un plus a mi emprendimiento. Me llegó en tiempo y forma. Gracias Alcohn.',
    image: avatar('rosana-sosa.png'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Erica Hovorka',
    quote:
      'De excelencia total el trabajo del equipo de los sellos míos. Les dije qué quería, cómo y enseguida me explicaron; nos pusimos de acuerdo entendiendo lo que deseaba yo. Gracias Alcohn.',
    image: avatar('erica-hovorka.png'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Vanesa Arenas',
    quote:
      'Realmente estoy muy conforme con la atención, la entrega rápida y un sello muy completo, con tips para diferentes usos. Muy buen trabajo.',
    image: avatar('vanesa-arenas.png'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Mercedes Berraondo',
    quote:
      'Es la segunda vez que compro. Me encantan sus sellos, la calidad es impecable y funcionan perfectamente. Los recomiendo.',
    image: avatar('mercedes-berraondo.png'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'María Josefina González Castellanos',
    quote:
      'Excelente experiencia. Mandé a hacer un cuño y el resultado es impecable. Destaco la atención humana: por una confusión mía, enviaron el sello con una adaptación que no era obligatoria. Ese compromiso marca la diferencia. Me resolvieron la forma de sellar mis productos.',
    image: avatar('maria-josefina-gonzalez.png'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Isaías Galván Mendoza',
    quote: 'Excelente producto. Felicidades por la calidad del material.',
    image: avatar('isaias-galvan.png'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Andrés Neznajko',
    quote:
      'Excelente producto. Rapidez en respuesta, efectivos modelos de muestra y efectividad en el producto. Altamente recomendable.',
    image: avatar('andres-neznajko.png'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Guillermo Bansi',
    quote:
      'Excelente trabajo, muy buena atención, presentación y atención al cliente. Recomiendo totalmente los productos.',
    image: avatar('guillermo-bansi.png'),
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Javiero Núñez',
    quote:
      'Excelente desde todo punto de vista: amabilidad, precio, envío y calidad. Muchas gracias.',
    image: avatar('javiero-nunez.png'),
    source: 'Google',
    rating: 5,
  },
];

export function toColumnItems(items: Testimonial[]) {
  return items.map((t) => ({
    text: `"${t.quote}"`,
    image: t.image,
    name: t.name,
  }));
}

export function splitTestimonialsIntoColumns<T>(items: T[]): [T[], T[], T[]] {
  const columns: T[][] = [[], [], []];
  items.forEach((item, index) => {
    columns[index % 3].push(item);
  });
  return [columns[0], columns[1], columns[2]];
}
