export type BeforeBuyFaq = {
  question: string;
  answer: string;
};

/** Preguntas generales para sellos estándar (cuero y madera), curadas desde landings por material. */
export const standardStampBeforeBuyFaqs: BeforeBuyFaq[] = [
  {
    question: '¿Viene eléctrico?',
    answer:
      'El sello viene por defecto con un mango a rosca. También vendemos calentadores eléctricos, una alternativa muy práctica al calentado por fuego directo.',
  },
  {
    question: '¿Sirve para todo tipo de cuero?',
    answer:
      'Sí. Sirve para vaqueta, gamuzado, curtido al cromo/vegetal, etc. Solo no recomendamos marcar cueros con texturas muy complejas, como los que simulan piel de cocodrilo.',
  },
  {
    question: '¿Sirve para maderas duras?',
    answer:
      'Sí, funciona. Solo precisa más tiempo de calentado (10-15 minutos aprox). Lo ideal es que el diseño sea sencillo y tenga buen grosor de los trazos.',
  },
];
