export interface WhyChooseReason {
  title: string;
  copy: string;
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
    title: 'Líderes en la industria nacional',
    copy: 'Fabricamos en nuestro taller de Mar del Plata y acompañamos a marcas, talleres y emprendedores de todo el país. Más de 6.000 sellos entregados, clientes conformes y marcas reconocidas respaldan una forma de trabajar basada en diseño, precisión y compromiso.',
  },
  {
    title: 'Experiencia comprobada',
    copy: 'Desde 2019 fabricamos sellos personalizados para cuero, madera, papel, packaging, alimentos y otros materiales. Esa experiencia nos permite saber qué funciona en cada superficie, cómo adaptar cada diseño y qué necesita cada cliente para lograr una marca clara, duradera y profesional.',
  },
  {
    title: 'Atención personalizada',
    copy: 'Estamos presentes antes, durante y después de cada pedido. Respondemos dudas, asesoramos medidas, revisamos diseños, enviamos muestras digitales y acompañamos a cada cliente para que compre con seguridad y reciba un sello a la altura de su trabajo.',
  },
  {
    title: 'Sellos de calidad profesional',
    copy: 'Fabricamos sellos de bronce con mecanizado CNC, profundidad de grabado de hasta 3 mm y detalles finos de alta precisión. Cada pieza está pensada para lograr marcas definidas, soportar el uso diario en taller y diferenciarse de los sellos genéricos del mercado.',
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
