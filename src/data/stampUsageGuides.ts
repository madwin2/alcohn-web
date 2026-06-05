import type { WizardUsoSlug } from '@/data/stampUseCases';

export type UsageMethodId = 'presion' | 'golpe' | 'calor';

export type StampUsageMethod = {
  id: UsageMethodId;
  label: string;
  intro?: string;
  bullets: string[];
  note?: string;
  image?: string;
  imageAlt?: string;
};

export type StampUsageGuide = {
  slug: WizardUsoSlug;
  title: string;
  intro: string;
  methods: StampUsageMethod[];
};

const USO_RAPIDO = '/images/uso rapido';

export const stampUsageGuides: StampUsageGuide[] = [
  {
    slug: 'para-cuero',
    title: 'Marroquinería',
    intro: 'Marcas personalizadas para piezas de cuero y PU.',
    methods: [
      {
        id: 'presion',
        label: 'Presión',
        bullets: [
          'Aplicación en frío, sobre una remachadora con base plana.',
          'Se fija el sello a la máquina con una rosca y se aplica presión manual.',
          'Terminación limpia y precisa en bajorrelieve.',
        ],
        image: `${USO_RAPIDO}/cuero presionRecurso 1.png`,
        imageAlt: 'Esquema de marcado en cuero con prensa y presión en frío',
      },
      {
        id: 'golpe',
        label: 'Golpe',
        intro:
          'Método muy práctico y extendido para sellos pequeños, de 3 cm o menos. Terminación precisa en bajorrelieve.',
        bullets: [
          'Humecé el cuero previamente para que copie mejor la forma.',
          'Aplicación con martillado sobre mango metálico.',
        ],
        image: `${USO_RAPIDO}/cuero golpeRecurso 3.png`,
        imageAlt: 'Esquema de marcado en cuero con martillo y mango metálico',
      },
      {
        id: 'calor',
        label: 'Calor',
        intro:
          'Apoyo perpendicular y presión firme para marcas precisas. Ideal para cueros flexibles o para destacar más el diseño.',
        bullets: [
          'Se calienta el sello a fuego directo de hornalla o soplete (entre 3 y 5 minutos).',
          'Aplicación manual con mango de madera.',
          'Se apoya de 1 a 2 segundos sobre la superficie.',
          'Terminación oscurecida.',
        ],
        image: `${USO_RAPIDO}/cuero calorRecurso 2.png`,
        imageAlt: 'Esquema de marcado en cuero con sello caliente',
      },
    ],
  },
  {
    slug: 'para-madera',
    title: 'Madera',
    intro: 'Apoyo perpendicular y presión firme para marcas precisas.',
    methods: [
      {
        id: 'calor',
        label: 'Calor',
        bullets: [
          'Se calienta el sello a fuego directo (entre 5 y 15 minutos según tamaño de sello y la dureza de la madera).',
          'Aplicación manual con mango de madera.',
          'Apoyo de 1 a 2 segundos sobre la superficie.',
          'Terminación oscura.',
        ],
        image: `${USO_RAPIDO}/madera calorRecurso 4.png`,
        imageAlt: 'Esquema de marcado en madera con sello caliente',
      },
    ],
  },
  {
    slug: 'para-jabon',
    title: 'Artesanías',
    intro: 'Apoyo perpendicular y presión firme para marcas precisas.',
    methods: [
      {
        id: 'presion',
        label: 'Presión',
        bullets: [
          'Aplicación manual con mango de madera.',
          'Terminación precisa en bajorrelieve.',
        ],
        note: 'Agregar alcohol al 96 %.',
        image: `${USO_RAPIDO}/jabonRecurso 5.png`,
        imageAlt: 'Esquema de marcado en jabón con presión manual',
      },
    ],
  },
  {
    slug: 'para-packaging',
    title: 'Packaging',
    intro:
      'Un detalle que realza la presentación de tus productos. Ideal para artesanías, regalos empresariales y producciones propias.',
    methods: [
      {
        id: 'presion',
        label: 'Presión',
        bullets: [
          'Aplicación en frío, mediante una prensa.',
          'Se fija el sello mediante rosca o pegamento (solución fija), colocando la pieza a marcar en la base de la máquina.',
          'Accionamiento manual.',
          'Terminación limpia y precisa en bajorrelieve.',
        ],
        image: `${USO_RAPIDO}/packaging maquinaRecurso 9.png`,
        imageAlt: 'Esquema de marcado en packaging con prensa en frío',
      },
      {
        id: 'calor',
        label: 'Calor',
        intro: 'Apoyo perpendicular y presión firme para marcas precisas.',
        bullets: [
          'Se calienta el sello a fuego directo (aprox. 5 minutos).',
          'Aplicación manual con mango de madera.',
          'Apoyo de 1 a 2 segundos sobre la superficie. Terminación oscura.',
        ],
        image: `${USO_RAPIDO}/packaging calorRecurso 10.png`,
        imageAlt: 'Esquema de marcado en packaging con sello caliente',
      },
    ],
  },
  {
    slug: 'para-lacre',
    title: 'Lacre',
    intro:
      'Un detalle que realza la presentación de tus productos. Ideal para artesanías, regalos empresariales y producciones propias.',
    methods: [
      {
        id: 'presion',
        label: 'Lacre',
        bullets: [
          'Se calienta la cera previamente.',
          'Se vierte la cera en la superficie a marcar, con una cuchara.',
          'Se apoya el sello y se lo deja 1 minuto hasta que la cera seque.',
          'Se retira el sello con cuidado.',
        ],
        image: `${USO_RAPIDO}/marcar lacreRecurso 8.png`,
        imageAlt: 'Esquema de aplicación de sello sobre lacre',
      },
    ],
  },
  {
    slug: 'para-hielo',
    title: 'Hielo',
    intro: 'Diseño de precisión que realza la presentación de tus bebidas.',
    methods: [
      {
        id: 'calor',
        label: 'Hielo',
        bullets: [
          'Se calienta el sello con agua caliente.',
          'Se lo apoya sobre el hielo deseado.',
          'Se lo deja actuar unos segundos y luego se retira.',
        ],
        image: `${USO_RAPIDO}/marcar hieloRecurso 7.png`,
        imageAlt: 'Esquema de marcado sobre hielo con sello caliente',
      },
    ],
  },
  {
    slug: 'para-pan',
    title: 'Alimentos',
    intro: 'Apoyo parejo y presión firme para marcas precisas.',
    methods: [
      {
        id: 'calor',
        label: 'Calor',
        bullets: [
          'Se calienta el sello a fuego directo (entre 5 y 7 minutos).',
          'Aplicación manual con mango de madera.',
          'Acompañá la curvatura del pan con la mano, para cubrir bien la superficie a marcar.',
          'Terminación oscura.',
        ],
        image: `${USO_RAPIDO}/pan a fuegoRecurso 6.png`,
        imageAlt: 'Esquema de marcado en pan con sello caliente',
      },
    ],
  },
  {
    slug: 'para-ceramica',
    title: 'Cerámica',
    intro: 'Apoyo perpendicular y presión firme para marcas precisas en piezas en crudo.',
    methods: [
      {
        id: 'presion',
        label: 'Presión',
        bullets: [
          'Marcá antes de la cocción, con base estable y presión controlada.',
          'Aplicación manual con mango de madera.',
          'Terminación precisa en bajorrelieve.',
          'Evitá arrastrar el sello para no deformar bordes finos.',
        ],
      },
    ],
  },
  {
    slug: 'para-fruta',
    title: 'Fruta',
    intro: 'Apoyo parejo y contacto breve para marcas legibles en cítricos y decoración.',
    methods: [
      {
        id: 'calor',
        label: 'Calor',
        bullets: [
          'Usá sello limpio y superficies firmes y relativamente planas.',
          'Calentá el sello con agua caliente o fuego suave según la fruta.',
          'Apoyá unos segundos y retirá sin arrastrar.',
          'Probá primero en una rodaja de descarte.',
        ],
      },
    ],
  },
];

export function getStampUsageGuideBySlug(slug: string): StampUsageGuide | undefined {
  return stampUsageGuides.find((guide) => guide.slug === slug);
}
