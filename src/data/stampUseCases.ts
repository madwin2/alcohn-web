export type WizardMaterial = 'cuero' | 'madera' | 'ambos' | 'ceramica' | 'alimentos' | 'otros';

export interface StampUseCase {
  slug: string;
  oficio: string;
  material: string;
  title: string;
  seoTitle: string;
  seoDescription?: string;
  description: string;
  intro: string;
  buyMaterial: WizardMaterial;
  heroImage: string;
  heroAlt: string;
  productImage: string;
  productAlt: string;
  searchIntent: string;
  applications: string[];
  recommendedSizes: Array<{
    label: string;
    size: string;
    copy: string;
  }>;
  gallery: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  proofPoints: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

const STAMP_PRICE_FROM_ARS: Record<WizardMaterial, number> = {
  cuero: 69500,
  madera: 69500,
  ambos: 69500,
  ceramica: 69500,
  alimentos: 69500,
  otros: 69500,
};

export function getStampPriceFrom(material: WizardMaterial): number {
  return STAMP_PRICE_FROM_ARS[material];
}

export const stampUseCases: StampUseCase[] = [
  {
    slug: 'para-madera',
    oficio: 'Carpintería',
    material: 'Madera',
    title: 'Sellos para Madera Personalizados',
    seoTitle: 'Sello de bronce para madera personalizado | Carpintería CNC | Alcohn',
    seoDescription:
      'Sello de bronce CNC para tablas, cajas y muebles. Marcá madera con tu logo. Fabricación en Argentina, envío a todo el país.',
    description:
      'Marcá tablas, cajas, muebles y piezas de carpintería con un sello de bronce personalizado.',
    intro:
      'Un gran aporte de valor para tus trabajos. Aumenta la percepcion de tu marca. Recomendamos diseños limpios y claros, para que la marca se vea y se lea bien.',
    buyMaterial: 'madera',
    heroImage: '/images/carousel/madera.webp',
    heroAlt: 'Marca Alcohn aplicada sobre madera',
    productImage: '/images/clientes/cliente-elpicahueso-02.webp',
    productAlt: 'Producto de madera marcado con sello personalizado',
    searchIntent: 'Sello de Bronce',
    applications: ['Tablas de asado', 'Cajas de madera', 'Mangos de cuchillo', 'Muebles', 'Objetos torneados'],
    recommendedSizes: [
      { label: 'Piezas chicas', size: '25x25mm a 35x35mm', copy: 'Para mangos, etiquetas pequeñas y objetos con poca superficie plana.' },
      { label: 'Producto visible', size: '40x40mm a 60x60mm', copy: 'La medida más versátil para tablas, cajas y piezas de autor.' },
      { label: 'Marca protagonista', size: '70x70mm o más', copy: 'Para marcas grandes, tapas, packaging rígido o señalética de taller.' },
    ],
    gallery: [
      { src: '/images/madera/sello-madera-aplicado-01.webp', alt: 'Sello aplicado sobre madera' },
      { src: '/images/madera/sello-madera-carpinteria-02.webp', alt: 'Marca en pieza de carpintería' },
      { src: '/images/madera/sello-madera-detalle-03.webp', alt: 'Detalle de sello en madera' },
      { src: '/images/madera/sello-madera-trabajo-04.webp', alt: 'Trabajo real sobre madera' },
    ],
    proofPoints: ['Marca repetible en series chicas', 'Marca a fuego invorrable', 'Ayuda a vender piezas como producto de marca'],
    faqs: [
      {
        question: '¿Sirve para maderas duras?',
        answer:
          'Sí, funciona. Solo precisa más tiempo de calentado (10-15 minutos aprox). Lo ideal es que el diseño sea sencillo y tenga buen grosor de los trazos.',
      },
      {
        question: '¿Viene eléctrico?',
        answer:
          'El sello viene por defecto con un mango a rosca. También vendemos calentadores eléctricos, una alternativa muy práctica al calentado por fuego directo.',
      },
      {
        question: '¿Cómo se coloca el sello en la hornalla?',
        answer: 'El sello debe estar apoyado encima de la llama, a fuego medio/alto.',
      },
      {
        question: '¿Funciona en melamina?',
        answer:
          'En melamina no funciona, porque la aplicación con calor derrite la capa externa de la superficie.',
      },
    ],
  },
  {
    slug: 'para-cuero',
    oficio: 'Marroquinería',
    material: 'Cuero y PU',
    title: 'Sellos de bronce para cuero y PU',
    seoTitle: 'Sello de bronce para cuero | Marroquinería profesional | Alcohn Argentina',
    seoDescription:
      'Sello personalizado para cuero y PU. Marroquinería, billeteras y materas con marca CNC. Envío a todo Argentina.',
    description:
      'Convertí billeteras, carteras, vainas, materas y etiquetas de cuero en piezas con marca propia.',
    intro:
      'En cuero la marca tiene que sentirse precisa, limpia y proporcional. El cuero permite gran variedad de medidas, y detalles. Por lo que el diseño y la medida es muy variado.',
    buyMaterial: 'cuero',
    heroImage: '/images/carousel/cuero.webp',
    heroAlt: 'Marca Alcohn aplicada sobre cuero',
    productImage: '/images/clientes/cliente-gorila-02.webp',
    productAlt: 'Producto de cuero marcado con sello personalizado',
    searchIntent: 'Sello para cuero',
    applications: ['Billeteras', 'Carteras', 'Vainas de cuchillo', 'Materas', 'Etiquetas', 'Accesorios de cuero'],
    recommendedSizes: [
      { label: 'Etiquetas y billeteras', size: '20x20mm a 35x35mm', copy: 'Ideal para piezas chicas o marcas discretas.' },
      { label: 'Carteras y materas', size: '40x40mm a 60x60mm', copy: 'Buena presencia sin ocupar demasiado producto.' },
      { label: 'Piezas grandes', size: '70x70mm o más', copy: 'Para bolsos, tapas amplias o marcas de alto impacto.' },
    ],
    gallery: [
      { src: '/images/cuero/sello-cuero-aplicado-01.webp', alt: 'Sello aplicado sobre cuero' },
      { src: '/images/cuero/sello-cuero-marroquineria-02.webp', alt: 'Pieza de marroquinería en cuero marcada' },
      { src: '/images/cuero/sello-cuero-detalle-03.webp', alt: 'Detalle de marca en cuero' },
      { src: '/images/cuero/sello-cuero-trabajo-04.webp', alt: 'Trabajo real sobre cuero' },
    ],
    proofPoints: ['Ideal para emprendedores de marroquinería', 'Funciona en cuero natural y PU.', 'Aporta percepción premium sin cambiar el producto'],
    faqs: [
      {
        question: '¿Sirve para todo tipo de cuero?',
        answer:
          'Sí. Sirve para vaqueta, gamuzado, curtido al cromo/vegetal, etc. Solo no recomendamos marcar cueros con texturas muy complejas, como los que simulan piel de cocodrilo.',
      },
      {
        question: '¿Puedo marcar productos ya armados?',
        answer:
          'Es posible, pero lo recomendable es marcar el cuero antes de armar el producto.',
      },
      {
        question: '¿El uso para cuero y PU es el mismo?',
        answer:
          'No es el mismo, son procesos distintos porque cada material reacciona distinto a la presión y al calor. En este link podés acceder a información más detallada.',
      },
      {
        question: '¿Qué medida suele pedirse para billeteras y cinturones?',
        answer:
          'Algo pequeño, de 2 o 3 cm, es lo más común para este tipo de productos. Los diseños suelen ser sencillos, con dibujos simples o iniciales.',
      },
    ],
  },
  {
    slug: 'para-ceramica',
    oficio: 'Manualidades',
    material: 'Cerámica',
    title: 'Sellos de bronce para cerámica',
    seoTitle: 'Sello de bronce para cerámica personalizado | Alcohn Argentina',
    seoDescription:
      'Sellos CNC para cerámica en crudo, placas y piezas de autor. Marcá antes de la cocción con precisión.',
    description:
      'Marcá piezas de cerámica en crudo, placas, objetos decorativos y trabajos de autor con tu logo.',
    intro:
      'La cerámica necesita una marca legible antes de la cocción, con líneas que no se pierdan en la textura. Se suelen usar medidas chicas, por lo que el diseño debe ser simple.',
    buyMaterial: 'ceramica',
    heroImage: '/images/carousel/ceramica.webp',
    heroAlt: 'Marca aplicada sobre cerámica en crudo',
    productImage: '/images/ceramica/sello-ceramica-aplicado-01.webp',
    productAlt: 'Cerámica marcada con sello personalizado',
    searchIntent: 'Sello para cerámica',
    applications: ['Piezas en crudo', 'Placas', 'Objetos decorativos', 'Cerámica de autor', 'Souvenirs'],
    recommendedSizes: [
      { label: 'Firma chica', size: '20x20mm a 30x30mm', copy: 'Para bases, laterales y piezas pequeñas.' },
      { label: 'Marca visible', size: '35x35mm a 50x50mm', copy: 'Para placas, piezas medianas y objetos decorativos.' },
      { label: 'Composición grande', size: '60x60mm o más', copy: 'Para logos con texto o piezas de mayor superficie.' },
    ],
    gallery: [
      { src: '/images/ceramica/sello-ceramica-aplicado-01.webp', alt: 'Sello aplicado en cerámica' },
      { src: '/images/ceramica/sello-ceramica-pieza-02.webp', alt: 'Pieza de cerámica marcada' },
      { src: '/images/ceramica/sello-ceramica-detalle-03.webp', alt: 'Detalle de marca en cerámica' },
      { src: '/images/ceramica/sello-ceramica-trabajo-04.webp', alt: 'Trabajo real en cerámica' },
    ],
    proofPoints: ['Útil para ceramistas y talleres', 'Marca el origen de cada pieza', 'Mejora la percepción de producto de autor'],
    faqs: [
      {
        question: '¿Qué diseños son convenientes?',
        answer:
          'En un sello de cerámica conviene que el diseño tenga trazos finos para una mejor penetración en el material.',
      },
      {
        question: '¿Qué medidas son las más comunes?',
        answer: 'Sellos chicos, de 3 cm o menos, son los más pedidos.',
      },
      {
        question: '¿Qué tipo de superficies puedo marcar?',
        answer:
          'Son preferibles las superficies planas, ya que las zonas curvas se vuelven complejas de marcar, aun en sellos pequeños.',
      },
    ],
  },
  {
    slug: 'para-jabon',
    oficio: 'Artesanías',
    material: 'Jabón',
    title: 'Sellos de bronce para jabón artesanal',
    seoTitle: 'Sello de bronce para jabón artesanal | Alcohn Argentina',
    seoDescription:
      'Sello personalizado para jabones, velas y cosmética natural. Bronce CNC, ideal para ferias y regalos.',
    description:
      'Dale identidad a jabones artesanales, velas blandas y productos de cosmética natural con un sello personalizado.',
    intro:
      'En jabón artesanal el sello cumple una función comercial inmediata: hace que un producto simple se vea terminado, cuidado y reconocible.',
    buyMaterial: 'otros',
    heroImage: '/images/carousel/jabon.webp',
    heroAlt: 'Marca aplicada sobre jabón artesanal',
    productImage: '/images/jabon/sello-jabon-aplicado-01.webp',
    productAlt: 'Jabón artesanal marcado con sello personalizado',
    searchIntent: 'Sello para jabón artesanal',
    applications: ['Jabones artesanales', 'Cosmética natural', 'Velas blandas', 'Souvenirs', 'Regalos corporativos'],
    recommendedSizes: [
      { label: 'Jabón chico', size: '20x20mm a 30x30mm', copy: 'Para piezas pequeñas o logos simples.' },
      { label: 'Jabón estándar', size: '35x35mm a 45x45mm', copy: 'Buena presencia sin deformar la superficie.' },
      { label: 'Etiqueta visual', size: '50x50mm o más', copy: 'Para jabones grandes o marcas con más texto.' },
    ],
    gallery: [
      { src: '/images/jabon/sello-jabon-aplicado-01.webp', alt: 'Sello aplicado sobre jabón artesanal' },
      { src: '/images/jabon/sello-jabon-pieza-02.webp', alt: 'Jabón artesanal marcado' },
      { src: '/images/jabon/sello-jabon-detalle-03.webp', alt: 'Detalle de marca en jabón' },
      { src: '/images/jabon/sello-jabon-trabajo-04.webp', alt: 'Trabajo real en jabón artesanal' },
    ],
    proofPoints: ['Aumenta percepción de producto terminado', 'Ideal para ferias y packs de regalo', 'Ayuda a diferenciar piezas similares'],
    faqs: [
      {
        question: '¿Qué diseños son convenientes?',
        answer:
          'Convienen los trazos finos para una mejor penetración en el jabón. Y un diseño sencillo permite mejor definición.',
      },
    ],
  },
  {
    slug: 'para-packaging',
    oficio: 'Packaging',
    material: 'Cartón',
    title: 'Sellos de bronce para packaging y cartón',
    seoTitle: 'Sello de bronce para packaging y cartón | Alcohn',
    seoDescription:
      'Marcá cajas, etiquetas y cartón con sello de bronce CNC. Ideal para series cortas y packaging artesanal.',
    description:
      'Marcá cajas, etiquetas, bolsas, cartón, papel grueso y packaging artesanal con una identidad consistente.',
    intro:
      'El packaging es el primer contacto con tu marca. Un sello bien aplicado hace que una caja o etiqueta genérica parezca parte real del producto.',
    buyMaterial: 'otros',
    heroImage: '/images/clientes/cliente-monk-03.webp',
    heroAlt: 'Packaging artesanal con marca aplicada',
    productImage: '/images/clientes/cliente-monk-02.webp',
    productAlt: 'Packaging marcado con sello personalizado',
    searchIntent: 'Sello para packaging',
    applications: ['Cajas', 'Etiquetas', 'Bolsas de papel', 'Cartón', 'Papel grueso', 'Envoltorios'],
    recommendedSizes: [
      { label: 'Etiqueta chica', size: '25x25mm a 35x35mm', copy: 'Para tags, cierres y sellos secundarios.' },
      { label: 'Caja estándar', size: '40x40mm a 60x60mm', copy: 'Para frente de caja, bolsas y packaging de venta.' },
      { label: 'Marca grande', size: '70x70mm o más', copy: 'Para tapas, bolsas grandes o composición protagonista.' },
    ],
    gallery: [
      { src: '/images/clientes/cliente-monk-03.webp', alt: 'Marca aplicada en packaging' },
      { src: '/images/clientes/cliente-monk-02.webp', alt: 'Producto con packaging marcado' },
    ],
    proofPoints: ['Baja costo frente a tiradas impresas', 'Útil para series cortas y cambios de temporada', 'Aumenta consistencia visual en entregas'],
    faqs: [
      {
        question: '¿Puedo marcarlo a presión?',
        answer:
          'Solo si es un cartón forrado con papel de encuadernación. De no ser el caso, tenés la opción de marcar en caliente.',
      },
      {
        question: '¿Qué tipo de papel es conveniente marcar?',
        answer: 'Lo ideal es un papel grueso, de 300g o más.',
      },
      {
        question: '¿Necesito alguna máquina en especial?',
        answer:
          'Lo mejor es usar una prensa. Para facilitar el marcado, se coloca un trozo extra de papel entre la pieza a marcar y la base de la prensa.',
      },
      {
        question: '¿Puedo marcar en sobrerrelieve?',
        answer:
          'Sí, es posible. Se precisan dos matrices, una de las cuales va por debajo del papel y otra por encima.',
      },
      {
        question: '¿Puedo marcar papel kraft/madera?',
        answer:
          'Nuestros sellos funcionan perfecto para papel kraft. El marcado, en este caso, es con calor.',
      },
    ],
  },
  {
    slug: 'para-lacre',
    oficio: 'Decoración',
    material: 'Lacre',
    title: 'Sellos de bronce para lacre',
    seoTitle: 'Sello de bronce para lacre personalizado | Alcohn Argentina',
    seoDescription:
      'Sellos para lacre en invitaciones, sobres y packaging boutique. Bronce CNC, diseño elegante.',
    description:
      'Creá cierres, invitaciones, packaging y detalles de marca con lacre personalizado.',
    intro:
      'El lacre funciona como detalle de terminación: pequeño, táctil y memorable.',
    buyMaterial: 'otros',
    heroImage: '/images/carousel/lacre.webp',
    heroAlt: 'Sello aplicado sobre lacre',
    productImage: '/images/lacre/sello-lacre-aplicado-01.webp',
    productAlt: 'Lacre marcado con sello personalizado',
    searchIntent: 'Sello para lacre',
    applications: ['Invitaciones', 'Cierres de packaging', 'Sobres', 'Regalos', 'Ediciones especiales'],
    recommendedSizes: [
      { label: 'Detalle fino', size: '20x20mm a 25x25mm', copy: 'Para sobres chicos o cierres discretos.' },
      { label: 'Lacre clásico', size: '30x30mm a 40x40mm', copy: 'La medida más habitual para lograr presencia y detalle.' },
      { label: 'Sello protagonista', size: '45x45mm o más', copy: 'Para packaging o piezas donde el lacre es parte central del diseño.' },
    ],
    gallery: [
      { src: '/images/lacre/sello-lacre-aplicado-01.webp', alt: 'Sello aplicado en lacre' },
      { src: '/images/lacre/sello-lacre-cierre-02.webp', alt: 'Cierre de lacre marcado' },
      { src: '/images/lacre/sello-lacre-detalle-03.webp', alt: 'Detalle de marca en lacre' },
      { src: '/images/lacre/sello-lacre-trabajo-04.webp', alt: 'Trabajo real en lacre' },
    ],
    proofPoints: ['Aporta ritual y terminación premium', 'Ideal para packaging boutique', 'Buena opción para ediciones especiales'],
    faqs: [
      {
        question: '¿El mismo sello de lacre sirve para chocolates?',
        answer:
          'Sí, el mismo formato de sello de lacre sirve para marcar chocolates y darles un toque extra a tus creaciones.',
      },
    ],
  },
  {
    slug: 'para-hielo',
    oficio: 'Coctelería',
    material: 'Hielo',
    title: 'Sellos de bronce para hielo',
    seoTitle: 'Sello para hielo y coctelería | Bronce CNC | Alcohn',
    seoDescription:
      'Sello de bronce para hielo en bares y eventos. Marcá cubos y roca con tu logo. Envío a todo el país.',
    description:
      'Marcá hielos para bares, coctelería, eventos y experiencias gastronómicas con identidad propia.',
    intro:
      'En hielo el impacto es visual e inmediato. La marca tiene que leerse rápido y funcionar como detalle de experiencia, por lo que recomendamos medidas medianas o grandes, y diseños simples y claros.',
    buyMaterial: 'alimentos',
    heroImage: '/images/carousel/hielo.webp',
    heroAlt: 'Marca aplicada sobre hielo',
    productImage: '/images/carousel/hielo.webp',
    productAlt: 'Hielo marcado con sello personalizado',
    searchIntent: 'Sello para hielo',
    applications: ['Bares', 'Coctelería', 'Eventos', 'Hoteles', 'Experiencias gastronómicas'],
    recommendedSizes: [
      { label: 'Hielo chico', size: '20x20mm a 30x30mm', copy: 'Para cubos y marcas simples.' },
      { label: 'Roca estándar', size: '35x35mm a 45x45mm', copy: 'Para hielos grandes de coctelería.' },
      { label: 'Evento o branding', size: '50x50mm o más', copy: 'Para bloques grandes o usos escénicos.' },
    ],
    gallery: [
      { src: '/images/carousel/hielo.webp', alt: 'Sello aplicado sobre hielo' },
    ],
    proofPoints: ['Diferencia la experiencia de consumo', 'Muy visual para redes sociales', 'Útil para bares, eventos y marcas premium'],
    faqs: [
      {
        question: '¿Qué profundidad tiene el marcado?',
        answer:
          'Los sellos para hielo tienen una profundidad de 3 mm, que funciona perfecto para estas aplicaciones.',
      },
      {
        question: '¿Cómo manipular el sello en alimentos?',
        answer:
          'Recomendamos mantener el sello limpio, manipularlo con guantes o pinza y evitar contacto prolongado con la piel por los cambios de temperatura durante el uso.',
      },
    ],
  },
  {
    slug: 'para-pan',
    oficio: 'Gastronomía',
    material: 'Pan',
    title: 'Sellos de bronce para pan y alimentos',
    seoTitle: 'Sello para pan y hamburguesa personalizado | Bronce CNC | Alcohn',
    seoDescription:
      'Sello de bronce para pan, hamburguesas y gastronomía. Marcá masas con tu logo. Fabricación CNC, envío nacional.',
    description:
      'Marcá panes, tapas y productos gastronómicos para que tu marca aparezca en la experiencia de consumo.',
    intro:
      'En gastronomía el sello ayuda a que el producto sea recordable y fotografiable. La marca debe ser simple, legible y adecuada al tamaño de la pieza.',
    buyMaterial: 'alimentos',
    heroImage: '/images/carousel/pan.webp',
    heroAlt: 'Marca aplicada sobre pan',
    productImage: '/images/pan/sello-pan-hamburguesa-01.webp',
    productAlt: 'Pan marcado con sello personalizado',
    searchIntent: 'Sello para pan',
    applications: ['Panes', 'Hamburguesas', 'Tapas', 'Masas', 'Eventos gastronómicos'],
    recommendedSizes: [
      { label: 'Producto chico', size: '25x25mm a 35x35mm', copy: 'Para panes chicos, tapas o piezas individuales.' },
      { label: 'Pan de burger', size: '40x40mm a 55x55mm', copy: 'Buena presencia sobre superficie curva.' },
      { label: 'Pieza grande', size: '60x60mm o más', copy: 'Para panes grandes o marcas protagonistas.' },
    ],
    gallery: [
      { src: '/images/pan/sello-pan-hamburguesa-01.webp', alt: 'Sello aplicado sobre pan' },
      { src: '/images/pan/sello-pan-hamburguesa-02.webp', alt: 'Pan marcado con sello' },
      { src: '/images/pan/sello-pan-hamburguesa-03.webp', alt: 'Detalle de marca en pan' },
      { src: '/images/pan/sello-pan-hamburguesa-04.webp', alt: 'Trabajo real en pan' },
    ],
    proofPoints: ['Mejora recuerdo de marca', 'Muy útil para hamburgueserías y eventos', 'Aporta diferenciación sin cambiar receta'],
    faqs: [
      {
        question: '¿Se puede hacer un logo complejo para panes?',
        answer:
          'Recomendamos diseños bien sencillos, por ejemplo un logo solo o el nombre de la marca. Cuanto más simple es el diseño, mejor va a marcarse.',
      },
      {
        question: '¿Qué medida se recomienda para empanadas o pizzas?',
        answer:
          'No más de 1 cm de alto y aproximadamente 4 cm de ancho, con un diseño bien sencillo.',
      },
      {
        question: '¿Viene eléctrico?',
        answer:
          'El sello viene por defecto con un mango a rosca. También vendemos calentadores eléctricos, una alternativa muy práctica al calentado por fuego directo.',
      },
    ],
  },
  {
    slug: 'para-fruta',
    oficio: 'Decoración de cocktails',
    material: 'Fruta',
    title: 'Sellos de bronce para fruta y decoración de cocktails',
    seoTitle: 'Sello para fruta y decoración de cocktails | Bronce CNC | Alcohn',
    seoDescription:
      'Sellos para fruta y cítricos en bares y eventos. Bronce CNC, marca visible en cada servicio.',
    description:
      'Marcá frutas, cítricos y decoraciones de cocktail para bares, eventos y experiencias de marca.',
    intro:
      'La fruta marcada funciona como gesto de diseño: aparece en la foto, en la mesa y en la memoria del cliente. El logo debe ser claro y de lectura rápida.',
    buyMaterial: 'alimentos',
    heroImage: '/images/carousel/fruta.webp',
    heroAlt: 'Marca aplicada sobre fruta',
    productImage: '/images/carousel/fruta.webp',
    productAlt: 'Fruta marcada con sello personalizado',
    searchIntent: 'Sello para fruta',
    applications: ['Cítricos', 'Decoración de cocktails', 'Bares', 'Eventos', 'Activaciones de marca'],
    recommendedSizes: [
      { label: 'Rodajas chicas', size: '15x15mm a 25x25mm', copy: 'Para cítricos pequeños y detalles discretos.' },
      { label: 'Decoración visible', size: '25x25mm a 35x35mm', copy: 'Para lectura clara en cocktails y fotos.' },
      { label: 'Evento', size: '40x40mm o más', copy: 'Para piezas grandes o branding de activaciones.' },
    ],
    gallery: [
      { src: '/images/carousel/fruta.webp', alt: 'Sello aplicado sobre fruta' },
    ],
    proofPoints: ['Diseñado para experiencias visuales', 'Ayuda a generar contenido para redes', 'Ideal para bares, eventos y marcas de bebida'],
    faqs: [
      {
        question: '¿Qué frutas funcionan mejor?',
        answer: 'Suelen funcionar mejor superficies firmes y relativamente planas, como cítricos o frutas cortadas con buena estructura.',
      },
      {
        question: '¿Puede ser el mismo sello que uso en hielo?',
        answer: 'Sí, muchas marcas usan el mismo sello para hielo y frutas si el tamaño del logo funciona en ambos soportes.',
      },
    ],
  },
];

export type WizardUsoSlug = (typeof stampUseCases)[number]['slug'];

/** Texto corto para el wizard de compra (no el párrafo SEO de cada landing). */
const WIZARD_OPTION_SHORT_COPY: Record<WizardUsoSlug, string> = {
  'para-madera': 'Tablas, cajas y muebles.',
  'para-cuero': 'Billeteras, carteras y etiquetas.',
  'para-ceramica': 'Piezas en crudo y placas.',
  'para-jabon': 'Jabones y cosmética artesanal.',
  'para-packaging': 'Cajas, etiquetas y cartón.',
  'para-lacre': 'Cierres e invitaciones.',
  'para-hielo': 'Hielo para bares y eventos.',
  'para-pan': 'Panes, tapas y masas.',
  'para-fruta': 'Frutas y decoración de cocktails.',
};

/** Opciones del paso «Qué querés marcar» (misma grilla que la home). */
export type WizardMaterialOption = {
  slug: WizardUsoSlug;
  oficio: string;
  materialLabel: string;
  buyMaterial: WizardMaterial;
  shortDescription: string;
};

export const wizardMaterialOptions: WizardMaterialOption[] = stampUseCases.map((useCase) => ({
  slug: useCase.slug,
  oficio: useCase.oficio,
  materialLabel: useCase.material,
  buyMaterial: useCase.buyMaterial,
  shortDescription: WIZARD_OPTION_SHORT_COPY[useCase.slug],
}));

export function getStampUseCaseBySlug(slug: string) {
  return stampUseCases.find((useCase) => useCase.slug === slug);
}

export function getWizardOptionBySlug(slug: string): WizardMaterialOption | undefined {
  return wizardMaterialOptions.find((o) => o.slug === slug);
}

export function getStampUseCaseBuyHref(useCase: Pick<StampUseCase, 'slug' | 'buyMaterial'>) {
  return `/buy?mode=custom&material=${useCase.buyMaterial}&uso=${useCase.slug}`;
}
