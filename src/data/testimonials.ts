export interface Testimonial {
  name: string;
  quote: string;
  /** Foto de perfil real de Google. Sin foto, se muestran las iniciales. */
  image?: string;
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

// Sin aggregateRating ni review en el schema de producto: son reseñas de Google sobre el
// negocio, y Google no permite marcarlas como propias del producto. Ver `googleReviews.ts`.

const avatar = (filename: string) => `/images/testimonials/${filename}`;


export const testimonials: Testimonial[] = [
  {
    name: 'Leandro Muñoz',
    quote:
      'Destaco el excelente trabajo, la responsabilidad, la puntualidad y la calidad. Con una atención llena de calidez y amabilidad.',
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Juan Ví',
    quote:
      'Excelente atención y asesoramiento para el proceso de armar la matriz de tu marca o logo, la mejor calidad y terminación.',
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Emanuel Naval',
    quote:
      'Excelente empresa, muy buena atención, siempre respondieron a mis consultas. Cumplen con los tiempos de fabricación y entrega. El producto tiene muy buena calidad y terminación.',
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Lucas Vega',
    quote:
      '100% recomendable. Desde el primer mensaje hasta la entrega, se tomaron el tiempo para explicar y sacar todas las dudas.',
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Guillermo Berasategui',
    quote:
      'Excelente todo, absolutamente todo. Desde la atención inicial hasta la post venta. Muy profesionales, vale la pena trabajar con ellos.',
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Estela Burgos',
    quote:
      'Realmente excelente. En el diseño, dedicación, atención y rapidez en el envío. Gracias Alcohn, altamente recomendable.',
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Andrea Leone',
    quote:
      'Increíble el sello que me enviaron, me encantó cómo queda en mis calzados. Ahora mi marca tiene un toque de distinción más.',
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Diego Ríos Pérez',
    quote:
      'Súper recomendable. Muy buena calidad del material y acabado del sello. Con gran profesionalismo te indican cómo usarlo.',
    source: 'Google',
    rating: 5,
  },
  {
    name: 'Rosario Plaza',
    quote:
      'Excelente atención, resolvieron mis dudas y realizaron el trabajo en tiempo y forma. Muy recomendable, le da a mis bolsos un toque de distinción.',
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
