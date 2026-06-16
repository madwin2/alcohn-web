/**
 * Genera feeds/pinterest-bulk-upload.csv para importación masiva en Pinterest.
 * Las imágenes apuntan a URLs públicas de alcohnsellos.com (no hay que subir archivos).
 * Ejecutar: npm run feed:pinterest
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { products } from '../src/data/products';
import { standardStampDesigns } from '../src/data/standardStamps';
import { stampUseCases } from '../src/data/stampUseCases';
import { stampUsageGuides } from '../src/data/stampUsageGuides';
import { accessories } from '../src/data/accessories';
import { getClientes } from '../src/lib/clientes';
import { whyChooseReasons } from '../src/data/aboutAlcohn';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://www.alcohnsellos.com';
const PINTEREST_BATCH_LIMIT = 200;

type PinRow = {
  title: string;
  image: string;
  board: string;
  description: string;
  link: string;
  keywords: string;
};

const PRODUCT_IMAGE: Record<string, string> = {
  'sello-personalizado-cuero': '/images/carousel/cuero.webp',
  'sello-personalizado-madera': '/images/carousel/madera.webp',
  'sello-personalizado-universal': '/images/sello/sello-personalizado-logo.webp',
  'sello-para-alimentos': '/images/carousel/pan.webp',
  'sello-personalizado-ceramica': '/images/carousel/ceramica.webp',
  'sello-personalizado-lacre': '/images/carousel/lacre.webp',
  'abecedario-bronce-completo': '/images/abecedario/abecedario.webp',
  'abecedario-bronce-numeros': '/images/abecedario/abecedario.webp',
};

const HOME_PINS: PinRow[] = [
  {
    title: 'Sellos de bronce CNC personalizados | Alcohn',
    image: '/images/hero/sello-bronce-hero-taller-alcohn.jpeg',
    board: 'Alcohn/Nuestra marca',
    description:
      'Convertí tu logo en un sello de bronce de precisión CNC. Fabricación en Argentina, envío a todo el país.',
    link: '/',
    keywords: 'sellos de bronce, personalizados, CNC, Argentina, Alcohn',
  },
  {
    title: 'Marroquinería profesional con sello de bronce',
    image: '/images/no%20solo%20fabricamos/a%20mano.jpeg',
    board: 'Alcohn/Sellos personalizados',
    description: 'Marcá cuero genuino y sintético con tu logo. Sellos de bronce para marroquinería profesional.',
    link: '/sellos/para-cuero',
    keywords: 'cuero, marroquinería, sello personalizado, bronce',
  },
  {
    title: 'Carpintería profesional con marca en madera',
    image: '/images/inicio/madera-carpinteria-profesional.webp',
    board: 'Alcohn/Sellos personalizados',
    description: 'Sellos de bronce para tablas, cajas y piezas de carpintería con tu diseño.',
    link: '/sellos/para-madera',
    keywords: 'madera, carpintería, sello bronce, personalizado',
  },
  {
    title: 'Diferenciá tus productos alimenticios',
    image: '/images/no%20solo%20fabricamos/inferno.jpeg',
    board: 'Alcohn/Sellos personalizados',
    description: 'Sellos de bronce para pan, hamburguesas y gastronomía. Marcá con tu logo antes de hornear.',
    link: '/sellos/para-pan',
    keywords: 'pan, gastronomía, sello alimentos, bronce',
  },
  {
    title: 'Packaging con identidad de marca',
    image: '/images/inicio/cuero.webp',
    board: 'Alcohn/Sellos personalizados',
    description: 'Reforzá tu marca en cada unidad con sellos de bronce para packaging y cartón.',
    link: '/sellos/para-packaging',
    keywords: 'packaging, cartón, marca, sello bronce',
  },
  {
    title: 'Precisión CNC en sellos de bronce',
    image: '/images/nosotros/mecanizado-cnc-precision.webp',
    board: 'Alcohn/Nuestra marca',
    description: 'Mecanizado CNC de alta precisión para sellos duraderos y marcas repetibles.',
    link: '/proceso',
    keywords: 'CNC, precisión, bronce, fabricación Argentina',
  },
  {
    title: 'Firma repetible en madera',
    image: '/images/scroll/madera-firma-repetible.webp',
    board: 'Alcohn/Casos reales',
    description: 'Marcas limpias y repetibles en series de productos de madera.',
    link: '/casos-reales',
    keywords: 'madera, marca, sello bronce, carpintería',
  },
];

const COLLECTION_BOARD: Record<string, string> = {
  campo: 'Alcohn/Sellos estandar/Campo',
  futbol: 'Alcohn/Sellos estandar/Futbol',
  patrio: 'Alcohn/Sellos estandar/Patrio',
};

const PINTEREST_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'] as const;

const HEADERS = [
  'Title',
  'Media URL',
  'Pinterest board',
  'Thumbnail',
  'Description',
  'Link',
  'Publish date',
  'Keywords',
];

function absoluteUrl(relativePath: string) {
  const normalized = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  try {
    return `${SITE_URL}${encodeURI(decodeURI(normalized))}`;
  } catch {
    return `${SITE_URL}${encodeURI(normalized)}`;
  }
}

function sanitizeText(value: string) {
  return value
    .replace(/\u2026/g, '...')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function truncate(value: string, max: number) {
  const clean = sanitizeText(value);
  return clean.length <= max ? clean : `${clean.slice(0, max - 3).trim()}...`;
}

const PNG_FALLBACK_PREFIXES = ['/images/carousel/', '/images/abecedario/'];

const WEBP_TO_PNG: Record<string, string> = {
  '/images/inicio/cuero.webp': '/images/inicio/cuero.png',
};

function resolvePinterestImageUrl(relativePath: string): string {
  const lower = relativePath.toLowerCase();
  if (PINTEREST_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return absoluteUrl(relativePath);
  }
  if (lower.endsWith('.webp')) {
    let decoded = relativePath;
    try {
      decoded = decodeURIComponent(relativePath);
    } catch {
      decoded = relativePath;
    }
    if (WEBP_TO_PNG[decoded]) {
      return absoluteUrl(WEBP_TO_PNG[decoded]);
    }
    if (PNG_FALLBACK_PREFIXES.some((prefix) => decoded.startsWith(prefix))) {
      return absoluteUrl(relativePath.replace(/\.webp$/i, '.png'));
    }
    return absoluteUrl(relativePath);
  }
  return absoluteUrl(relativePath);
}

function isOnSiteImage(src: string) {
  return src.startsWith('/images/');
}

function escapeCsv(value: string) {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function collectPins(): PinRow[] {
  const seen = new Set<string>();
  const pins: PinRow[] = [];

  const add = (pin: PinRow) => {
    if (!isOnSiteImage(pin.image)) return;
    const imageKey = absoluteUrl(pin.image);
    if (seen.has(imageKey)) return;
    seen.add(imageKey);
    pins.push(pin);
  };

  for (const pin of HOME_PINS) add(pin);

  for (const product of products) {
    const image = PRODUCT_IMAGE[product.slug] ?? product.images.default;
    const link =
      product.category === 'abecedario'
        ? '/abecedarios'
        : `/productos/${product.slug}`;
    add({
      title: truncate(product.seoTitle, 100),
      image,
      board: product.category === 'abecedario' ? 'Alcohn/Abecedarios' : 'Alcohn/Sellos personalizados',
      description: truncate(product.seoDescription, 500),
      link,
      keywords: 'sello bronce, personalizado, Alcohn, Argentina',
    });
  }

  for (const useCase of stampUseCases) {
    const link = `/sellos/${useCase.slug}`;
    const keywords = `sello bronce, ${useCase.material.toLowerCase()}, ${useCase.oficio.toLowerCase()}, Alcohn`;

    add({
      title: truncate(useCase.seoTitle, 100),
      image: useCase.heroImage,
      board: 'Alcohn/Sellos personalizados',
      description: truncate(useCase.seoDescription ?? useCase.description, 500),
      link,
      keywords,
    });

    add({
      title: truncate(`${useCase.title} — trabajo real`, 100),
      image: useCase.productImage,
      board: 'Alcohn/Casos reales',
      description: truncate(useCase.intro, 500),
      link,
      keywords,
    });

    for (const item of useCase.gallery) {
      add({
        title: truncate(`${useCase.title} — ${item.alt}`, 100),
        image: item.src,
        board: 'Alcohn/Casos reales',
        description: truncate(item.caption ?? useCase.description, 500),
        link,
        keywords,
      });
    }
  }

  for (const design of standardStampDesigns) {
    const link = `/sellos/estandar/${design.slug}`;
    const board = COLLECTION_BOARD[design.collection] ?? 'Alcohn/Sellos estandar';
    const keywords = `sello estándar, ${design.title}, bronce, Alcohn`;

    add({
      title: truncate(`Sello estándar ${design.title} en bronce | Alcohn`, 100),
      image: design.image,
      board,
      description: truncate(design.description, 500),
      link,
      keywords,
    });

    add({
      title: truncate(`${design.title} marcado en cuero — sello estándar Alcohn`, 100),
      image: design.hoverImage,
      board,
      description: truncate(design.description, 500),
      link,
      keywords,
    });
  }

  for (const accessory of accessories) {
    add({
      title: truncate(`${accessory.title} para sellos de bronce | Alcohn`, 100),
      image: accessory.image,
      board: 'Alcohn/Accesorios',
      description: truncate(accessory.description, 500),
      link: '/accesorios',
      keywords: 'accesorio, sello bronce, taller, Alcohn',
    });
  }

  for (const cliente of getClientes()) {
    cliente.imagenes.forEach((image, index) => {
      const photoLabel = image.match(/-(\d+)\.webp$/i)?.[1] ?? String(index + 1);
      add({
        title: truncate(`Caso real: ${cliente.data.nombre} con sello Alcohn - foto ${photoLabel}`, 100),
        image,
        board: 'Alcohn/Casos reales',
        description: truncate(
          `Marca personalizada en bronce para ${cliente.data.nombre}. Sellos CNC Alcohn, envío a todo Argentina.`,
          500,
        ),
        link: '/casos-reales',
        keywords: 'caso real, sello bronce, personalizado, Alcohn',
      });
    });
  }

  for (const guide of stampUsageGuides) {
    for (const method of guide.methods) {
      if (!method.image) continue;
      add({
        title: truncate(`Cómo marcar ${guide.title.toLowerCase()} — ${method.label}`, 100),
        image: method.image,
        board: 'Alcohn/Como usar sellos',
        description: truncate(
          [method.intro, ...method.bullets, method.note].filter(Boolean).join(' '),
          500,
        ),
        link: '/como-usar-sellos',
        keywords: `cómo usar, ${guide.title.toLowerCase()}, sello bronce, Alcohn`,
      });
    }
  }

  for (const reason of whyChooseReasons) {
    add({
      title: truncate(reason.title, 100),
      image: reason.image,
      board: 'Alcohn/Nuestra marca',
      description: truncate(reason.copy, 500),
      link: '/sobre-alcohn',
      keywords: 'Alcohn, sellos bronce, Argentina, taller',
    });
  }

  return pins;
}

function pinToCsvLine(pin: PinRow, mediaUrl: string) {
  return [
    truncate(pin.title, 100),
    mediaUrl,
    pin.board,
    '',
    truncate(pin.description, 500),
    absoluteUrl(pin.link),
    '',
    sanitizeText(pin.keywords),
  ]
    .map(escapeCsv)
    .join(',');
}

function main() {
  const pins = collectPins();
  const resolvedPins: Array<{ pin: PinRow; mediaUrl: string }> = [];
  const seenMedia = new Set<string>();
  const seenTitles = new Set<string>();

  for (const pin of pins) {
    const mediaUrl = resolvePinterestImageUrl(pin.image);
    if (seenMedia.has(mediaUrl)) continue;
    seenMedia.add(mediaUrl);

    let title = truncate(pin.title, 100);
    let suffix = 2;
    while (seenTitles.has(title)) {
      const base = truncate(pin.title, 96);
      title = truncate(`${base} (${suffix})`, 100);
      suffix += 1;
    }
    seenTitles.add(title);

    resolvedPins.push({ pin: { ...pin, title }, mediaUrl });
  }

  const outDir = path.join(ROOT, 'feeds');
  const outFile = path.join(outDir, 'pinterest-bulk-upload.csv');
  fs.mkdirSync(outDir, { recursive: true });

  const lines = [
    HEADERS.join(','),
    ...resolvedPins.map(({ pin, mediaUrl }) => pinToCsvLine(pin, mediaUrl)),
  ];
  fs.writeFileSync(outFile, `${lines.join('\r\n')}\r\n`, 'utf8');

  console.log(`CSV generado: ${outFile}`);
  console.log(`${resolvedPins.length} pines listos · imágenes desde ${SITE_URL}`);

  if (resolvedPins.length > PINTEREST_BATCH_LIMIT) {
    console.warn(
      `Pinterest permite hasta ${PINTEREST_BATCH_LIMIT} pines por carga. Subi en tandas o pedinos que partamos el CSV.`,
    );
  }
}

main();
