export interface WhyChooseReason {
  title: string;
  copy: string;
  image: string;
  alt: string;
}

export interface TeamMember {
  /** Dejar vacío hasta tener el nombre definitivo. */
  name: string;
  role: string;
  bio: string;
  /** Ruta en /public o null para mostrar iniciales. */
  image: string | null;
}

export const whyChooseReasons: WhyChooseReason[] = [
  {
    title: 'Líderes en la Industria Nacional',
    copy: 'Fabricamos en nuestro taller de Mar del Plata y acompañamos a marcas, talleres y emprendedores de todo el país. Más de 6.000 sellos entregados, clientes conformes y marcas reconocidas respaldan una forma de trabajar basada en diseño, precisión y compromiso.',
    image: '/images/hero/sello-bronce-hero-taller-alcohn.jpeg',
    alt: 'Taller Alcohn en Mar del Plata, fabricación de sellos de bronce',
  },
  {
    title: 'Experiencia comprobada',
    copy: 'Desde 2019 fabricamos sellos personalizados para cuero, madera, papel, packaging, alimentos y otros materiales. Esa experiencia nos permite saber qué funciona en cada superficie, cómo adaptar cada diseño y qué necesita cada cliente para lograr una marca clara, duradera y profesional.',
    image: '/images/sobre%20alcohn/experiencia.jpeg',
    alt: 'Experiencia en fabricación de sellos personalizados para distintos materiales',
  },
  {
    title: 'Atención personalizada',
    copy: 'Estamos presentes antes, durante y después de cada pedido. Respondemos dudas, asesoramos medidas, revisamos diseños, enviamos muestras digitales y acompañamos a cada cliente para que compre con seguridad y reciba un sello a la altura de su trabajo.',
    image: '/images/sobre%20alcohn/atencion%20personalizada.jpeg',
    alt: 'Atención personalizada en el taller Alcohn con diseño y asesoramiento',
  },
  {
    title: 'Sellos de calidad profesional',
    copy: 'Fabricamos sellos de bronce con mecanizado CNC, profundidad de grabado de hasta 3 mm y detalles finos de alta precisión. Cada pieza está pensada para lograr marcas definidas, soportar el uso diario en taller y diferenciarse de los sellos genéricos del mercado.',
    image: '/images/sobre%20alcohn/sellos%20calidad%20profesional.jpeg',
    alt: 'Sellos de bronce de calidad profesional fabricados en Alcohn',
  },
];

export const teamMembers: TeamMember[] = [
  {
    name: '',
    role: 'Dirección y diseño',
    bio: 'Visión de producto, criterio estético y relación con cada marca.',
    image: null,
  },
  {
    name: '',
    role: 'Producción y CNC',
    bio: 'Mecanizado, control de calidad y terminación de cada pieza.',
    image: null,
  },
  {
    name: '',
    role: 'Operaciones',
    bio: 'Logística, plazos y que cada pedido salga en tiempo y forma.',
    image: null,
  },
  {
    name: '',
    role: 'Atención al cliente',
    bio: 'Asesoramiento, seguimiento y resolución en cada consulta.',
    image: null,
  },
];
