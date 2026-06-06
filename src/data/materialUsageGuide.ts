export type UsageGuideItem = {
  text: string;
  subItems?: string[];
};

export type UsageGuideMethod = {
  name: string;
  items: UsageGuideItem[];
};

export type MaterialUsageGuide = {
  material: string;
  methods?: UsageGuideMethod[];
  items?: UsageGuideItem[];
};

export const materialUsageGuide: MaterialUsageGuide[] = [
  {
    material: 'Cuero',
    methods: [
      {
        name: 'Calor',
        items: [
          {
            text: 'Se calienta el sello a fuego directo de hornalla o soplete (entre 3 y 5 minutos). La posición de calentado ideal es justo por encima de la llama, con la hornalla a fuego medio/alto.',
          },
          {
            text: 'El marcado es manual, con ayuda del mango de madera. El apoyo es perpendicular a la superficie y debe colocarse firmemente, sin mover ni correr el sello durante el tiempo de contacto, para evitar marcas borrosas o desparejas.',
          },
          { text: 'El tiempo de apoyo es de 1 a 2 segundos sobre la superficie.' },
          {
            text: 'Terminación oscurecida.',
            subItems: [
              'En el caso del cuero gamuzado, si es un marcado con calor leve, queda solo el relieve, si se le aplica más calor ya se oscurece la marca.',
            ],
          },
          { text: 'Cueros ideales para este proceso: Vaqueta, Crudo, Gamuzado, Curtido al Cromo.' },
        ],
      },
      {
        name: 'Presión',
        items: [
          { text: 'Aplicación en frío, sobre una remachadora con base plana.' },
          {
            text: 'Se fija el sello a la máquina con una rosca y se aplica presión manual. Hay que colocar una base plana en la máquina para apoyar el cuero.',
          },
          {
            text: 'Para un mejor marcado, podés poner otra pieza de cuero debajo de la pieza a marcar. Si es cuero vaqueta, podés humedecerlo previamente, así copia mejor la forma.',
          },
          { text: 'Terminación limpia y precisa en bajorrelieve.' },
          { text: 'Cueros ideales para este proceso: Vaqueta, Curtido vegetal.' },
        ],
      },
      {
        name: 'Golpe',
        items: [
          { text: 'Humeceder el cuero previamente para que copie mejor la forma.' },
          {
            text: 'La aplicación se hace martillando sobre el mango moleteado de acero (no se debe martillar directamente sobre el bronce para no dañarlo).',
          },
          {
            text: 'Podés colocar una capa extra de cuero por debajo de la pieza a marcar. Esto ayuda a que copie mejor la forma del diseño.',
          },
          { text: 'Este método es apto para sellos chicos (por ej. 1x1, 2x2, 3x2, 4x1, 5x1).' },
          { text: 'Cueros ideales para este proceso: Vaqueta, Curtido vegetal.' },
        ],
      },
      {
        name: 'Ecocuero/PU',
        items: [
          {
            text: 'Antes del marcado, se calienta el ecocuero con pistola de calor durante unos 5 segundos en la zona a marcar.',
            subItems: ['No debe calentarse demasiado tiempo para evitar dañar el ecocuero.'],
          },
          {
            text: 'Luego se marca el sello a presión con la remachadora. La presión se ejerce durante unos 5-10 segundos, para que el ecocuero tome la forma del diseño.',
            subItems: [
              'Este paso debe hacerse inmediatamente después de calentar el ecocuero, porque sino este se enfriará y la marca tenderá a borrarse.',
            ],
          },
        ],
      },
    ],
  },
  {
    material: 'Madera',
    items: [
      {
        text: 'Se calienta el sello a fuego directo (entre 5 y 15 minutos según tamaño de sello y la dureza de la madera).',
      },
      {
        text: 'Aplicación manual con mango de madera.',
        subItems: [
          'Antes de marcarlo, podes humedecer la zona de marcado con un spray, para que el diseño quede más definido.',
        ],
      },
      { text: 'Apoyo de 1 a 2 segundos sobre la superficie.' },
      {
        text: 'El apoyo es perpendicular a la superficie y debe colocarse firmemente, sin mover ni correr el sello durante el contacto, para evitar marcas borrosas o desparejas.',
      },
      {
        text: 'Terminación oscura.',
        subItems: ['En caso que quede muy oscura la marca, podes pasarle una lijada para eliminar el excedente.'],
      },
    ],
  },
  {
    material: 'Packaging',
    items: [
      { text: 'Se calienta el sello a fuego directo (aprox 5 minutos).' },
      { text: 'Aplicación manual con mango de madera.' },
      { text: 'Apoyo de 1 a 2 segundos sobre la superficie.' },
      {
        text: 'El apoyo es perpendicular a la superficie y debe colocarse firmemente, sin mover ni correr el sello durante el contacto, para evitar marcas borrosas o desparejas.',
      },
      { text: 'Terminación oscura.' },
    ],
  },
  {
    material: 'Alimentos',
    items: [
      { text: 'Se calienta el sello a fuego directo (entre 5 y 7 minutos).' },
      { text: 'Aplicación manual con mango de madera.' },
      {
        text: 'Acompañar la curvatura del pan con la mano, para cubrir bien la superficie a marcar.',
      },
      { text: 'Terminación oscura.' },
    ],
  },
  {
    material: 'Artesanías',
    items: [
      { text: 'Aplicación manual con mango de madera.' },
      { text: 'Terminación precisa en bajorrelieve.' },
    ],
  },
  {
    material: 'Cerámica',
    items: [
      { text: 'Marcado sobre la pieza cerámica en estado de cuero.' },
      { text: 'Presión manual por unos segundos.' },
    ],
  },
  {
    material: 'Lacre',
    items: [
      {
        text: 'Se calienta la cera previamente en una cuchara expuesta a fuego de vela, hasta que esté totalmente derretida',
        subItems: [
          'No dejar la cera más tiempo del necesario, para que no aparezcan burbujas. Si esto ocurre, déjalo enfriar y repetí el proceso.',
        ],
      },
      { text: 'Dejá caer el lacre derretido sobre el objeto a sellar, formando un círculo.' },
      { text: 'Se apoya el sello y se lo deja entre 1 y 2 minutos hasta que la cera seque.' },
      { text: 'Se retira el sello con cuidado' },
      { text: 'Limpia los elementos con un paño. Podés ayudarte con alcohol o agua caliente.' },
      {
        text: 'Con la mesa de trabajo limpia y seca,encendé la vela y colocala bajo el horno. Colocá las perlas en la cuchara, y apoyala sobre el plato de bronce.',
      },
    ],
  },
  {
    material: 'HIELO',
    items: [
      { text: 'Se calienta el sello con agua caliente' },
      {
        text: 'Se lo apoya sobre el hielo deseado. La manipulación se hace con una pinza de coctelería.',
      },
      { text: 'Se lo deja actuar unos segundos y luego se retira' },
    ],
  },
];

