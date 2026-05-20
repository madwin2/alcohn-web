export type WizardMaterial = 'cuero' | 'madera' | 'ambos' | 'ceramica' | 'alimentos' | 'otros';

export interface StampUseCase {
  slug: string;
  oficio: string;
  material: string;
  title: string;
  seoTitle: string;
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

export const stampUseCases: StampUseCase[] = [
  {
    slug: 'para-madera',
    oficio: 'Carpintería',
    material: 'Madera',
    title: 'Sellos para Madera Personalizados',
    seoTitle: 'Sellos para madera personalizados',
    description:
      'Marcá tablas, cajas, muebles y piezas de carpintería con un sello de bronce personalizado.',
    intro:
      'Un gran aporte de valor para tus trabajos. Aumenta la percepcion de tu marca. Recomendamos diseños limpios y claros, para que la marca se vea y se lea bien.',
    buyMaterial: 'madera',
    heroImage: '/images/carousel/madera.png',
    heroAlt: 'Marca Alcohn aplicada sobre madera',
    productImage: '/images/clientes/elpicahueso1.png',
    productAlt: 'Producto de madera marcado con sello personalizado',
    searchIntent: 'Sello de Bronce',
    applications: ['Tablas de asado', 'Cajas de madera', 'Mangos de cuchillo', 'Muebles', 'Objetos torneados'],
    recommendedSizes: [
      { label: 'Piezas chicas', size: '25x25mm a 35x35mm', copy: 'Para mangos, etiquetas pequeñas y objetos con poca superficie plana.' },
      { label: 'Producto visible', size: '40x40mm a 60x60mm', copy: 'La medida más versátil para tablas, cajas y piezas de autor.' },
      { label: 'Marca protagonista', size: '70x70mm o más', copy: 'Para marcas grandes, tapas, packaging rígido o señalética de taller.' },
    ],
    gallery: [
      { src: '/images/madera/34586fb6-7132-4e59-a481-d3485918f66c.png', alt: 'Sello aplicado sobre madera' },
      { src: '/images/madera/DSCF1323 1.jpg.jpeg', alt: 'Marca en pieza de carpintería' },
      { src: '/images/madera/DSCF1834.jpg.jpeg', alt: 'Detalle de sello en madera' },
      { src: '/images/madera/DSCF2005.jpg.jpeg', alt: 'Trabajo real sobre madera' },
    ],
    proofPoints: ['Marca repetible en series chicas', 'Marca a fuego invorrable', 'Ayuda a vender piezas como producto de marca'],
    faqs: [
      {
        question: '¿Sirve para madera dura y blanda?',
        answer: 'Sí. La definición final depende de la presión, temperatura y terminación de la madera. En el flujo podés subir tu logo y ver una muestra antes de fabricar.',
      },
      {
        question: '¿Qué medida conviene para una tabla?',
        answer: 'Para tablas suele funcionar muy bien entre 40 y 60mm, pero depende de la proporción del logo y del lugar donde se va a marcar.',
      },
    ],
  },
  {
    slug: 'para-cuero',
    oficio: 'Marroquinería',
    material: 'Cuero y PU',
    title: 'Sellos de bronce para cuero y PU',
    seoTitle: 'Sellos para cuero personalizados',
    description:
      'Convertí billeteras, carteras, vainas, materas y etiquetas de cuero en piezas con marca propia.',
    intro:
      'En cuero la marca tiene que sentirse precisa, limpia y proporcional. El cuero permite gran variedad de medidas, y detalles. Por lo que el diseño y la medida es muy variado.',
    buyMaterial: 'cuero',
    heroImage: '/images/carousel/cuero.png',
    heroAlt: 'Marca Alcohn aplicada sobre cuero',
    productImage: '/images/clientes/gorila1.png',
    productAlt: 'Producto de cuero marcado con sello personalizado',
    searchIntent: 'Sello para cuero',
    applications: ['Billeteras', 'Carteras', 'Vainas de cuchillo', 'Materas', 'Etiquetas', 'Accesorios de cuero'],
    recommendedSizes: [
      { label: 'Etiquetas y billeteras', size: '20x20mm a 35x35mm', copy: 'Ideal para piezas chicas o marcas discretas.' },
      { label: 'Carteras y materas', size: '40x40mm a 60x60mm', copy: 'Buena presencia sin ocupar demasiado producto.' },
      { label: 'Piezas grandes', size: '70x70mm o más', copy: 'Para bolsos, tapas amplias o marcas de alto impacto.' },
    ],
    gallery: [
      { src: '/images/cuero/DSCF7781.jpg', alt: 'Sello aplicado sobre cuero' },
      { src: '/images/cuero/DSCF2235.JPG', alt: 'Pieza de marroquinería en cuero marcada' },
      { src: '/images/cuero/DSCF1905.jpg.jpeg', alt: 'Detalle de marca en cuero' },
      { src: '/images/cuero/DSCF7804.jpg', alt: 'Trabajo real sobre cuero' },
    ],
    proofPoints: ['Ideal para emprendedores de marroquinería', 'Funciona en cuero natural y PU.', 'Aporta percepción premium sin cambiar el producto'],
    faqs: [
      {
        question: '¿Se puede usar en PU o cuero sintético?',
        answer: 'Sí, pero cada material responde distinto al calor y a la presión. Por eso conviene elegir el uso correcto y validar medida y muestra antes de fabricar.',
      },
      {
        question: '¿Sirve para vainas de cuchillo?',
        answer: 'Sí. En vainas suele convenir una marca compacta y profunda, especialmente si el espacio plano es reducido.',
      },
    ],
  },
  {
    slug: 'para-ceramica',
    oficio: 'Manualidades',
    material: 'Cerámica',
    title: 'Sellos de bronce para cerámica',
    seoTitle: 'Sellos para cerámica personalizados',
    description:
      'Marcá piezas de cerámica en crudo, placas, objetos decorativos y trabajos de autor con tu logo.',
    intro:
      'La cerámica necesita una marca legible antes de la cocción, con líneas que no se pierdan en la textura. Se suelen usar medidas chicas, por lo que el diseño debe ser simple.',
    buyMaterial: 'ceramica',
    heroImage: '/images/carousel/ceramica.png',
    heroAlt: 'Marca aplicada sobre cerámica en crudo',
    productImage: '/images/ceramica/1.png',
    productAlt: 'Cerámica marcada con sello personalizado',
    searchIntent: 'Sello para cerámica',
    applications: ['Piezas en crudo', 'Placas', 'Objetos decorativos', 'Cerámica de autor', 'Souvenirs'],
    recommendedSizes: [
      { label: 'Firma chica', size: '20x20mm a 30x30mm', copy: 'Para bases, laterales y piezas pequeñas.' },
      { label: 'Marca visible', size: '35x35mm a 50x50mm', copy: 'Para placas, piezas medianas y objetos decorativos.' },
      { label: 'Composición grande', size: '60x60mm o más', copy: 'Para logos con texto o piezas de mayor superficie.' },
    ],
    gallery: [
      { src: '/images/ceramica/1.png', alt: 'Sello aplicado en cerámica' },
      { src: '/images/ceramica/2.png', alt: 'Pieza de cerámica marcada' },
      { src: '/images/ceramica/3.png', alt: 'Detalle de marca en cerámica' },
      { src: '/images/ceramica/4.jpg', alt: 'Trabajo real en cerámica' },
    ],
    proofPoints: ['Útil para ceramistas y talleres', 'Marca el origen de cada pieza', 'Mejora la percepción de producto de autor'],
    faqs: [
      {
        question: '¿Se usa antes o después de cocinar la pieza?',
        answer: 'Normalmente se usa sobre cerámica en crudo o superficie apta. Si tu proceso es distinto, conviene validarlo antes de fabricar.',
      },
      {
        question: '¿Conviene un logo con mucho detalle?',
        answer: 'En cerámica convienen líneas claras y buen contraste de formas. Si el logo tiene mucho detalle, el flujo puede dejarlo para revisión.',
      },
    ],
  },
  {
    slug: 'para-jabon',
    oficio: 'Artesanías',
    material: 'Jabón',
    title: 'Sellos de bronce para jabón artesanal',
    seoTitle: 'Sellos para jabón artesanal personalizados',
    description:
      'Dale identidad a jabones artesanales, velas blandas y productos de cosmética natural con un sello personalizado.',
    intro:
      'En jabón artesanal el sello cumple una función comercial inmediata: hace que un producto simple se vea terminado, cuidado y reconocible.',
    buyMaterial: 'otros',
    heroImage: '/images/carousel/jabon.png',
    heroAlt: 'Marca aplicada sobre jabón artesanal',
    productImage: '/images/jabon/1.png',
    productAlt: 'Jabón artesanal marcado con sello personalizado',
    searchIntent: 'Sello para jabón artesanal',
    applications: ['Jabones artesanales', 'Cosmética natural', 'Velas blandas', 'Souvenirs', 'Regalos corporativos'],
    recommendedSizes: [
      { label: 'Jabón chico', size: '20x20mm a 30x30mm', copy: 'Para piezas pequeñas o logos simples.' },
      { label: 'Jabón estándar', size: '35x35mm a 45x45mm', copy: 'Buena presencia sin deformar la superficie.' },
      { label: 'Etiqueta visual', size: '50x50mm o más', copy: 'Para jabones grandes o marcas con más texto.' },
    ],
    gallery: [
      { src: '/images/jabon/1.png', alt: 'Sello aplicado sobre jabón artesanal' },
      { src: '/images/jabon/2.png', alt: 'Jabón artesanal marcado' },
      { src: '/images/jabon/3.png', alt: 'Detalle de marca en jabón' },
      { src: '/images/jabon/4.png', alt: 'Trabajo real en jabón artesanal' },
    ],
    proofPoints: ['Aumenta percepción de producto terminado', 'Ideal para ferias y packs de regalo', 'Ayuda a diferenciar piezas similares'],
    faqs: [
      {
        question: '¿Sirve para jabones blandos?',
        answer: 'Sí. El resultado depende de la dureza del jabón y del momento de aplicación. Conviene usar diseños claros y no demasiado finos.',
      },
      {
        question: '¿Puede incluir texto chico?',
        answer: 'Puede incluir texto, pero en jabón conviene priorizar legibilidad y tamaño suficiente para que la marca no se empaste.',
      },
    ],
  },
  {
    slug: 'para-packaging',
    oficio: 'Packaging',
    material: 'Cartón',
    title: 'Sellos de bronce para packaging y cartón',
    seoTitle: 'Sellos para packaging personalizados',
    description:
      'Marcá cajas, etiquetas, bolsas, cartón, papel grueso y packaging artesanal con una identidad consistente.',
    intro:
      'El packaging es el primer contacto con tu marca. Un sello bien aplicado hace que una caja o etiqueta genérica parezca parte real del producto.',
    buyMaterial: 'otros',
    heroImage: '/images/clientes/monk2.png',
    heroAlt: 'Packaging artesanal con marca aplicada',
    productImage: '/images/clientes/monk1.png',
    productAlt: 'Packaging marcado con sello personalizado',
    searchIntent: 'Sello para packaging',
    applications: ['Cajas', 'Etiquetas', 'Bolsas de papel', 'Cartón', 'Papel grueso', 'Envoltorios'],
    recommendedSizes: [
      { label: 'Etiqueta chica', size: '25x25mm a 35x35mm', copy: 'Para tags, cierres y sellos secundarios.' },
      { label: 'Caja estándar', size: '40x40mm a 60x60mm', copy: 'Para frente de caja, bolsas y packaging de venta.' },
      { label: 'Marca grande', size: '70x70mm o más', copy: 'Para tapas, bolsas grandes o composición protagonista.' },
    ],
    gallery: [
      { src: '/images/clientes/monk2.png', alt: 'Marca aplicada en packaging' },
      { src: '/images/clientes/monk1.png', alt: 'Producto con packaging marcado' },
    ],
    proofPoints: ['Baja costo frente a tiradas impresas', 'Útil para series cortas y cambios de temporada', 'Aumenta consistencia visual en entregas'],
    faqs: [
      {
        question: '¿Sirve para papel y cartón?',
        answer: 'Sí. En packaging se puede usar con distintas técnicas según material y acabado. Lo importante es elegir una medida legible.',
      },
      {
        question: '¿Conviene más que imprimir cajas?',
        answer: 'Para series chicas, productos artesanales o cambios frecuentes, el sello suele ser más flexible que mandar a imprimir packaging específico.',
      },
    ],
  },
  {
    slug: 'para-lacre',
    oficio: 'Decoración',
    material: 'Lacre',
    title: 'Sellos de bronce para lacre',
    seoTitle: 'Sellos para lacre personalizados',
    description:
      'Creá cierres, invitaciones, packaging y detalles de marca con lacre personalizado.',
    intro:
      'El lacre funciona como detalle de terminación: pequeño, táctil y memorable.',
    buyMaterial: 'otros',
    heroImage: '/images/carousel/lacre.png',
    heroAlt: 'Sello aplicado sobre lacre',
    productImage: '/images/lacre/1.png',
    productAlt: 'Lacre marcado con sello personalizado',
    searchIntent: 'Sello para lacre',
    applications: ['Invitaciones', 'Cierres de packaging', 'Sobres', 'Regalos', 'Ediciones especiales'],
    recommendedSizes: [
      { label: 'Detalle fino', size: '20x20mm a 25x25mm', copy: 'Para sobres chicos o cierres discretos.' },
      { label: 'Lacre clásico', size: '30x30mm a 40x40mm', copy: 'La medida más habitual para lograr presencia y detalle.' },
      { label: 'Sello protagonista', size: '45x45mm o más', copy: 'Para packaging o piezas donde el lacre es parte central del diseño.' },
    ],
    gallery: [
      { src: '/images/lacre/1.png', alt: 'Sello aplicado en lacre' },
      { src: '/images/lacre/2.png', alt: 'Cierre de lacre marcado' },
      { src: '/images/lacre/3.png', alt: 'Detalle de marca en lacre' },
      { src: '/images/lacre/4.png', alt: 'Trabajo real en lacre' },
    ],
    proofPoints: ['Aporta ritual y terminación premium', 'Ideal para packaging boutique', 'Buena opción para ediciones especiales'],
    faqs: [
      {
        question: '¿El mismo sello sirve para lacre y otros materiales?',
        answer: 'Sí, si la medida y el diseño son adecuados. Un mismo sello de bronce puede usarse en distintos contextos con la técnica correcta.',
      },
      {
        question: '¿Qué diseños funcionan mejor?',
        answer: 'Funcionan mejor logos claros, iniciales, isotipos y composiciones con buen espacio entre trazos.',
      },
    ],
  },
  {
    slug: 'para-hielo',
    oficio: 'Coctelería',
    material: 'Hielo',
    title: 'Sellos de bronce para hielo',
    seoTitle: 'Sellos para hielo personalizados',
    description:
      'Marcá hielos para bares, coctelería, eventos y experiencias gastronómicas con identidad propia.',
    intro:
      'En hielo el impacto es visual e inmediato. La marca tiene que leerse rápido y funcionar como detalle de experiencia, por lo que recomendamos medidas medianas o grandes, y diseños simples y claros.',
    buyMaterial: 'alimentos',
    heroImage: '/images/carousel/hielo.png',
    heroAlt: 'Marca aplicada sobre hielo',
    productImage: '/images/carousel/hielo.png',
    productAlt: 'Hielo marcado con sello personalizado',
    searchIntent: 'Sello para hielo',
    applications: ['Bares', 'Coctelería', 'Eventos', 'Hoteles', 'Experiencias gastronómicas'],
    recommendedSizes: [
      { label: 'Hielo chico', size: '20x20mm a 30x30mm', copy: 'Para cubos y marcas simples.' },
      { label: 'Roca estándar', size: '35x35mm a 45x45mm', copy: 'Para hielos grandes de coctelería.' },
      { label: 'Evento o branding', size: '50x50mm o más', copy: 'Para bloques grandes o usos escénicos.' },
    ],
    gallery: [
      { src: '/images/carousel/hielo.png', alt: 'Sello aplicado sobre hielo' },
    ],
    proofPoints: ['Diferencia la experiencia de consumo', 'Muy visual para redes sociales', 'Útil para bares, eventos y marcas premium'],
    faqs: [
      {
        question: '¿El sello toca un alimento?',
        answer: 'En usos gastronómicos conviene seguir prácticas de higiene y manipulación adecuadas. En la compra se identifica el uso para orientar el pedido.',
      },
      {
        question: '¿Qué logo conviene para hielo?',
        answer: 'Isotipos, iniciales o logos simples suelen funcionar mejor, porque el hielo tiene lectura rápida y contraste variable.',
      },
    ],
  },
  {
    slug: 'para-pan',
    oficio: 'Gastronomía',
    material: 'Pan',
    title: 'Sellos de bronce para pan y alimentos',
    seoTitle: 'Sellos para pan personalizados',
    description:
      'Marcá panes, tapas y productos gastronómicos para que tu marca aparezca en la experiencia de consumo.',
    intro:
      'En gastronomía el sello ayuda a que el producto sea recordable y fotografiable. La marca debe ser simple, legible y adecuada al tamaño de la pieza.',
    buyMaterial: 'alimentos',
    heroImage: '/images/carousel/pan.png',
    heroAlt: 'Marca aplicada sobre pan',
    productImage: '/images/pan/1.jpg',
    productAlt: 'Pan marcado con sello personalizado',
    searchIntent: 'Sello para pan',
    applications: ['Panes', 'Hamburguesas', 'Tapas', 'Masas', 'Eventos gastronómicos'],
    recommendedSizes: [
      { label: 'Producto chico', size: '25x25mm a 35x35mm', copy: 'Para panes chicos, tapas o piezas individuales.' },
      { label: 'Pan de burger', size: '40x40mm a 55x55mm', copy: 'Buena presencia sobre superficie curva.' },
      { label: 'Pieza grande', size: '60x60mm o más', copy: 'Para panes grandes o marcas protagonistas.' },
    ],
    gallery: [
      { src: '/images/pan/1.jpg', alt: 'Sello aplicado sobre pan' },
      { src: '/images/pan/2.png', alt: 'Pan marcado con sello' },
      { src: '/images/pan/3.png', alt: 'Detalle de marca en pan' },
      { src: '/images/pan/4.png', alt: 'Trabajo real en pan' },
    ],
    proofPoints: ['Mejora recuerdo de marca', 'Muy útil para hamburgueserías y eventos', 'Aporta diferenciación sin cambiar receta'],
    faqs: [
      {
        question: '¿Sirve para pan de hamburguesa?',
        answer: 'Sí. Es uno de los usos gastronómicos más comunes. La medida depende del diámetro del pan y de la proporción del logo.',
      },
      {
        question: '¿Puedo usarlo en otros alimentos?',
        answer: 'Sí, según superficie y técnica. Para alimentos conviene indicar el uso exacto al diseñar el pedido.',
      },
    ],
  },
  {
    slug: 'para-fruta',
    oficio: 'Decoración de cocktails',
    material: 'Fruta',
    title: 'Sellos de bronce para fruta y decoración de cocktails',
    seoTitle: 'Sellos para fruta personalizados',
    description:
      'Marcá frutas, cítricos y decoraciones de cocktail para bares, eventos y experiencias de marca.',
    intro:
      'La fruta marcada funciona como gesto de diseño: aparece en la foto, en la mesa y en la memoria del cliente. El logo debe ser claro y de lectura rápida.',
    buyMaterial: 'alimentos',
    heroImage: '/images/carousel/fruta.png',
    heroAlt: 'Marca aplicada sobre fruta',
    productImage: '/images/carousel/fruta.png',
    productAlt: 'Fruta marcada con sello personalizado',
    searchIntent: 'Sello para fruta',
    applications: ['Cítricos', 'Decoración de cocktails', 'Bares', 'Eventos', 'Activaciones de marca'],
    recommendedSizes: [
      { label: 'Rodajas chicas', size: '15x15mm a 25x25mm', copy: 'Para cítricos pequeños y detalles discretos.' },
      { label: 'Decoración visible', size: '25x25mm a 35x35mm', copy: 'Para lectura clara en cocktails y fotos.' },
      { label: 'Evento', size: '40x40mm o más', copy: 'Para piezas grandes o branding de activaciones.' },
    ],
    gallery: [
      { src: '/images/carousel/fruta.png', alt: 'Sello aplicado sobre fruta' },
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

export function getStampUseCaseBySlug(slug: string) {
  return stampUseCases.find((useCase) => useCase.slug === slug);
}

export function getStampUseCaseBuyHref(useCase: Pick<StampUseCase, 'slug' | 'buyMaterial'>) {
  return `/buy?mode=custom&material=${useCase.buyMaterial}&uso=${useCase.slug}`;
}
