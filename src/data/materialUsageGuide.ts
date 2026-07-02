export type UsageGuideContent = {
  paragraphs: string[];
  videoSrc?: string;
  posterSrc?: string;
  posterAlt?: string;
};

export type UsageGuideVariant = {
  name: string;
  content: UsageGuideContent;
};

export type UsageGuideMethod = {
  name: string;
  content?: UsageGuideContent;
  variants?: UsageGuideVariant[];
};

export type MaterialUsageGuide = {
  material: string;
  methods?: UsageGuideMethod[];
  variants?: UsageGuideVariant[];
  content?: UsageGuideContent;
};

const USO_RAPIDO = '/images/uso rapido';

function videoPath(folder: 'Manual' | 'Soldador', filename: string) {
  return `/videos/${folder}/${encodeURIComponent(filename)}`;
}

export const materialUsageGuide: MaterialUsageGuide[] = [
  {
    material: 'Cuero',
    methods: [
      {
        name: 'Calor',
        variants: [
          {
            name: 'Manual',
            content: {
              paragraphs: [
                'Se calienta el sello a fuego directo de hornalla o soplete (entre 3 y 5 minutos). El sello se coloca por encima de la llama, a fuego medio/alto.',
                'El apoyo es perpendicular a la superficie y debe ser firme, sin mover ni correr el sello durante el contacto, para evitar marcas desprolijas.',
                'El tiempo de apoyo sobre la superficie es de 1 a 2 segundos.',
                'En el caso del cuero gamuzado, si es un marcado con calor leve, queda solo el relieve; si se le aplica más calor ya se oscurece la marca.',
                'Cueros ideales para este proceso: Vaqueta, Crudo, Gamuzado, Curtido al Cromo.',
              ],
              videoSrc: videoPath('Manual', 'Manual Cuero_1.mp4'),
              posterSrc: `${USO_RAPIDO}/cuero calorRecurso 2.png`,
              posterAlt: 'Marcado de cuero con calor manual',
            },
          },
          {
            name: 'Eléctrico',
            content: {
              paragraphs: [
                'Se deja calentar el sello entre 5 y 10 minutos según el tamaño del sello, apoyando el calentador sobre el soporte metálico.',
                'El apoyo es perpendicular a la superficie y debe ser firme, sin mover ni correr el sello durante el contacto, para evitar marcas desprolijas.',
                'El tiempo de apoyo es de 1 a 2 segundos sobre la superficie.',
                'En el caso del cuero gamuzado, si es un marcado con calor leve, queda solo el relieve; si se le aplica más calor ya se oscurece la marca.',
                'Cueros ideales para este proceso: Vaqueta, Crudo, Gamuzado, Curtido al Cromo.',
              ],
              videoSrc: videoPath('Soldador', 'Soldador Cuero.mp4'),
              posterSrc: `${USO_RAPIDO}/cuero calorRecurso 2.png`,
              posterAlt: 'Marcado de cuero con calentador eléctrico',
            },
          },
        ],
      },
      {
        name: 'Presión',
        content: {
          paragraphs: [
            'Aplicación en frío, sobre una remachadora con base plana.',
            'Se fija el sello a la máquina con una rosca y se aplica presión manual. Hay que colocar una base plana en la máquina para apoyar el cuero.',
            'Para un mejor marcado, podés poner otra pieza de cuero debajo de la pieza a marcar. Si es cuero vaqueta, podés humedecerlo previamente, así copia mejor la forma.',
            'Terminación limpia y precisa en bajorrelieve.',
            'Cueros ideales para este proceso: Vaqueta, Curtido vegetal.',
          ],
          posterSrc: `${USO_RAPIDO}/cuero presionRecurso 1.png`,
          posterAlt: 'Marcado de cuero a presión',
        },
      },
      {
        name: 'Golpe',
        content: {
          paragraphs: [
            'Humeceder el cuero previamente para que copie mejor la forma.',
            'La aplicación se hace martillando sobre el mango moleteado de acero (no se debe martillar directamente sobre el bronce para no dañarlo).',
            'Podés colocar una capa extra de cuero por debajo de la pieza a marcar. Esto ayuda a que copie mejor la forma del diseño.',
            'Este método es apto para sellos chicos (por ej. 1x1, 2x2, 3x2, 4x1, 5x1).',
            'Cueros ideales para este proceso: Vaqueta, Curtido vegetal.',
          ],
          videoSrc: videoPath('Manual', 'Cuero Golpe.mp4'),
          posterSrc: `${USO_RAPIDO}/cuero golpeRecurso 3.png`,
          posterAlt: 'Marcado de cuero a golpe',
        },
      },
      {
        name: 'Ecocuero/PU',
        content: {
          paragraphs: [
            'Antes del marcado, se calienta el ecocuero con pistola de calor durante unos 5 segundos en la zona a marcar. No debe calentarse demasiado tiempo para evitar dañar el ecocuero.',
            'Luego se marca el sello a presión con la remachadora. La presión se ejerce durante unos 5-10 segundos, para que el ecocuero tome la forma del diseño.',
            'Este paso debe hacerse inmediatamente después de calentar el ecocuero, porque sino este se enfriará y la marca tenderá a borrarse.',
          ],
          posterSrc: `${USO_RAPIDO}/cuero presionRecurso 1.png`,
          posterAlt: 'Marcado de ecocuero a presión',
        },
      },
    ],
  },
  {
    material: 'Madera',
    variants: [
      {
        name: 'Manual',
        content: {
          paragraphs: [
            'Se calienta el sello a fuego directo (entre 5 y 15 minutos según tamaño de sello y la dureza de la madera).',
            'Antes de marcarlo, podes humedecer la zona de marcado con un spray, para que el diseño quede más definido.',
            'Apoyo de 1 a 2 segundos sobre la superficie.',
            'El apoyo es perpendicular a la superficie y debe ser firme, sin mover ni correr el sello durante el contacto, para evitar marcas desprolijas.',
            'En caso que quede muy oscura la marca, podes pasarle una lijada para eliminar el excedente.',
          ],
          videoSrc: videoPath('Manual', 'Manual Madera.mp4'),
          posterSrc: `${USO_RAPIDO}/madera calorRecurso 4.png`,
          posterAlt: 'Marcado de madera con calor manual',
        },
      },
      {
        name: 'Eléctrico',
        content: {
          paragraphs: [
            'Se deja calentar el sello entre 10 y 20 minutos según el tamaño del sello, apoyando el calentador sobre el soporte metálico.',
            'El apoyo es perpendicular a la superficie y debe ser firme, sin mover ni correr el sello durante el contacto, para evitar marcas desprolijas.',
            'El tiempo de apoyo sobre la superficie es de 1 a 2 segundos.',
            'Maderas ideales para calentado eléctrico: Pino, Cedro, Álamo.',
          ],
          videoSrc: videoPath('Soldador', 'Soldador Madera.mp4'),
          posterSrc: `${USO_RAPIDO}/madera calorRecurso 4.png`,
          posterAlt: 'Marcado de madera con calentador eléctrico',
        },
      },
    ],
  },
  {
    material: 'Packaging',
    variants: [
      {
        name: 'Manual',
        content: {
          paragraphs: [
            'Se calienta el sello a fuego directo (aprox 5 minutos).',
            'Aplicación manual con mango de madera.',
            'Apoyo de 1 a 2 segundos sobre la superficie.',
            'El apoyo es perpendicular a la superficie y debe colocarse firmemente, sin mover ni correr el sello durante el contacto, para evitar marcas borrosas o desparejas.',
          ],
          videoSrc: videoPath('Manual', 'Manual Packaging.mp4'),
          posterSrc: `${USO_RAPIDO}/packaging calorRecurso 10.png`,
          posterAlt: 'Marcado de packaging con calor manual',
        },
      },
      {
        name: 'Eléctrico',
        content: {
          paragraphs: [
            'Se deja calentar el sello aprox. 10 minutos, apoyando el calentador sobre el soporte metálico.',
            'El apoyo es perpendicular a la superficie y debe ser firme, sin mover ni correr el sello durante el contacto, para evitar marcas desprolijas.',
            'El tiempo de apoyo sobre la superficie es de 1 a 2 segundos.',
          ],
          videoSrc: videoPath('Soldador', 'Soldador Packag.mp4'),
          posterSrc: `${USO_RAPIDO}/packaging maquinaRecurso 9.png`,
          posterAlt: 'Marcado de packaging con calentador eléctrico',
        },
      },
    ],
  },
  {
    material: 'Alimentos',
    variants: [
      {
        name: 'Manual',
        content: {
          paragraphs: [
            'Se calienta el sello a fuego directo (entre 5 y 7 minutos).',
            'Aplicación manual con mango de madera.',
            'Acompañar la curvatura del pan con la mano, para cubrir bien la superficie a marcar.',
          ],
          videoSrc: videoPath('Manual', 'Manual Pan.mp4'),
          posterSrc: `${USO_RAPIDO}/pan a fuegoRecurso 6.png`,
          posterAlt: 'Marcado de pan con calor manual',
        },
      },
      {
        name: 'Eléctrico',
        content: {
          paragraphs: [
            'Se deja calentar el sello aprox 10 minutos, apoyando el calentador sobre el soporte metálico.',
            'El apoyo es perpendicular a la superficie y debe ser firme, sin mover ni correr el sello durante el contacto, para evitar marcas desprolijas.',
            'El tiempo de apoyo sobre la superficie es de 1 a 2 segundos.',
          ],
          videoSrc: videoPath('Soldador', 'Soldador Hamburguesa.mp4'),
          posterSrc: `${USO_RAPIDO}/pan a fuegoRecurso 6.png`,
          posterAlt: 'Marcado de alimentos con calentador eléctrico',
        },
      },
    ],
  },
  {
    material: 'Artesanías',
    content: {
      paragraphs: [
        'Aplicación manual con mango de madera.',
        'Terminación precisa en bajorrelieve.',
      ],
      posterSrc: `${USO_RAPIDO}/jabonRecurso 5.png`,
      posterAlt: 'Marcado de artesanías',
    },
  },
  {
    material: 'Cerámica',
    content: {
      paragraphs: [
        'Marcado sobre la pieza cerámica en estado de cuero.',
        'Presión manual por unos segundos.',
      ],
      posterSrc: `${USO_RAPIDO}/jabonRecurso 5.png`,
      posterAlt: 'Marcado de cerámica',
    },
  },
  {
    material: 'Lacre',
    content: {
      paragraphs: [
        'Se calienta la cera previamente en una cuchara expuesta a fuego de vela, hasta que esté totalmente derretida. No dejar la cera más tiempo del necesario, para que no aparezcan burbujas. Si esto ocurre, déjalo enfriar y repetí el proceso.',
        'Dejá caer el lacre derretido sobre el objeto a sellar, formando un círculo.',
        'Se apoya el sello y se lo deja entre 1 y 2 minutos hasta que la cera seque.',
        'Se retira el sello con cuidado.',
        'Limpia los elementos con un paño. Podés ayudarte con alcohol o agua caliente.',
        'Con la mesa de trabajo limpia y seca, encendé la vela y colocala bajo el horno. Colocá las perlas en la cuchara, y apoyala sobre el plato de bronce.',
      ],
      posterSrc: `${USO_RAPIDO}/marcar lacreRecurso 8.png`,
      posterAlt: 'Marcado con lacre',
    },
  },
  {
    material: 'Hielo',
    content: {
      paragraphs: [
        'Se calienta el sello con agua caliente.',
        'Se lo apoya sobre el hielo deseado. La manipulación se hace con una pinza de coctelería.',
        'Se lo deja actuar unos segundos y luego se retira.',
      ],
      posterSrc: `${USO_RAPIDO}/marcar hieloRecurso 7.png`,
      posterAlt: 'Marcado sobre hielo',
    },
  },
];
