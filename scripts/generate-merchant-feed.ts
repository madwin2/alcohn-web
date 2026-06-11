/**
 * Genera feeds/google-merchant-products.tsv para Google Merchant Center.
 * Ejecutar: npm run feed:merchant
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { standardStampDesigns } from '../src/data/standardStamps';
import { STANDARD_STAMP_PRICE_FROM_ARS } from '../src/lib/catalog';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://alcohnsellos.com';
const BRAND = 'Alcohn';
const GOOGLE_CATEGORY = 'Herramientas y ferretería > Herramientas > Sellos y punzones';

const CUSTOM_FROM = 69500;

type FeedRow = {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string;
  price: number;
};

const STATIC_ROWS: FeedRow[] = [
  {
    id: 'prod-sello-personalizado-cuero',
    title: 'Sello de bronce personalizado para cuero | Alcohn',
    description:
      'Sello de bronce CNC con tu logo para marroquinería y cuero. Incluye mango, muestra digital y envío a todo Argentina. Precio desde según medida.',
    link: '/productos/sello-personalizado-cuero',
    image: '/images/carousel/cuero.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'prod-sello-personalizado-madera',
    title: 'Sello de bronce personalizado para madera | Alcohn',
    description:
      'Sello de bronce para carpintería y madera con tu diseño. Fabricación CNC en Argentina. Ideal para piezas de autor y packaging en madera.',
    link: '/productos/sello-personalizado-madera',
    image: '/images/carousel/madera.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'prod-sello-personalizado-universal',
    title: 'Sello de bronce personalizado cuero y madera | Alcohn',
    description:
      'Sello versátil de bronce para cuero y madera con tu logo. Un solo sello para talleres con varios materiales. CNC, envío nacional.',
    link: '/productos/sello-personalizado-universal',
    image: '/images/sello/sello-personalizado-logo.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'prod-sello-para-alimentos',
    title: 'Sello de bronce para alimentos, pan y queso | Alcohn',
    description:
      'Sello de bronce para pan, hamburguesas, queso y gastronomía. Forma adaptada para no marcar con la base. Fabricación CNC Argentina.',
    link: '/productos/sello-para-alimentos',
    image: '/images/carousel/pan.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'prod-sello-personalizado-ceramica',
    title: 'Sello de bronce personalizado para cerámica | Alcohn',
    description:
      'Sello de bronce para marcar cerámica en crudo antes del horneado. Diseño con tu logo, precisión CNC, envío a todo el país.',
    link: '/productos/sello-personalizado-ceramica',
    image: '/images/carousel/ceramica.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'prod-sello-personalizado-lacre',
    title: 'Sello de bronce personalizado para lacre | Alcohn',
    description:
      'Sello elegante de bronce para lacre en invitaciones y packaging premium. Fabricado en CNC, con tu diseño personalizado.',
    link: '/productos/sello-personalizado-lacre',
    image: '/images/carousel/lacre.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'prod-abecedario-completo',
    title: 'Abecedario de bronce completo A-Z y 0-9 | Alcohn',
    description:
      'Letras y números de bronce individuales para componer textos en cuero y madera. Incluye caja organizadora. Fabricación CNC.',
    link: '/productos/abecedario-bronce-completo',
    image: '/images/abecedario/abecedario.webp',
    price: 85000,
  },
  {
    id: 'prod-abecedario-numeros',
    title: 'Abecedario de números en bronce 0-9 | Alcohn',
    description:
      'Números de bronce 0-9 para fechas y códigos en cuero y madera. Cada número es un sello independiente. Envío nacional.',
    link: '/productos/abecedario-bronce-numeros',
    image: '/images/abecedario/abecedario.webp',
    price: 35000,
  },
  {
    id: 'sello-para-madera',
    title: 'Sello de bronce para madera personalizado | Carpintería CNC',
    description:
      'Sello de bronce para madera con tu logo. Marcá tablas, cajas y piezas de autor. Fabricación CNC Alcohn, envío Argentina.',
    link: '/sellos/para-madera',
    image: '/images/carousel/madera.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'sello-para-cuero',
    title: 'Sello de bronce para cuero | Marroquinería profesional',
    description:
      'Sello de bronce para cuero genuino y sintético. Ideal para marroquinería, billeteras y talleres. Logo personalizado, CNC.',
    link: '/sellos/para-cuero',
    image: '/images/carousel/cuero.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'sello-para-ceramica',
    title: 'Sello de bronce para cerámica personalizado',
    description:
      'Marcá cerámica en crudo con sello de bronce CNC. Diseño personalizado, marcas limpias después del horneado.',
    link: '/sellos/para-ceramica',
    image: '/images/carousel/ceramica.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'sello-para-jabon',
    title: 'Sello de bronce para jabón artesanal',
    description:
      'Sello de bronce para jabonería artesanal y cosmética sólida. Tu logo en cada pieza. Fabricación en Argentina.',
    link: '/sellos/para-jabon',
    image: '/images/carousel/jabon.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'sello-para-packaging',
    title: 'Sello de bronce para packaging y cartón',
    description:
      'Sello de bronce para marcar packaging, cartón y productos de papel. Refuerza tu marca en cada unidad.',
    link: '/sellos/para-packaging',
    image: '/images/clientes/cliente-monk-02.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'sello-para-lacre',
    title: 'Sello de bronce para lacre personalizado',
    description:
      'Sello de bronce para lacre en sobres, invitaciones y cierres premium. Diseño elegante, fabricación CNC.',
    link: '/sellos/para-lacre',
    image: '/images/carousel/lacre.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'sello-para-hielo',
    title: 'Sello para hielo y coctelería | Bronce CNC',
    description:
      'Sello de bronce para marcar hielo y cocteles. Ideal para bares y eventos. Diseño personalizado Alcohn.',
    link: '/sellos/para-hielo',
    image: '/images/carousel/hielo.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'sello-para-pan',
    title: 'Sello para pan y hamburguesa personalizado | Bronce',
    description:
      'Sello de bronce para pan de hamburguesa, masas y gastronomía. Marcá con tu logo antes de hornear.',
    link: '/sellos/para-pan',
    image: '/images/carousel/pan.webp',
    price: CUSTOM_FROM,
  },
  {
    id: 'sello-para-fruta',
    title: 'Sello para fruta y decoración de cocktails',
    description:
      'Sello de bronce para fruta y coctelería. Decoración y branding en barra. Fabricación CNC Argentina.',
    link: '/sellos/para-fruta',
    image: '/images/carousel/fruta.webp',
    price: CUSTOM_FROM,
  },
];

function standardStampRows(): FeedRow[] {
  return standardStampDesigns.map((design) => ({
    id: `estandar-${design.slug}`,
    title: `Sello estándar ${design.title} en bronce | Alcohn`,
    description:
      design.description ||
      `Sello de bronce con diseño ${design.title}. Elegí medida, personalizá y comprá online con envío a todo Argentina.`,
    link: `/sellos/estandar/${design.slug}`,
    image: design.image,
    price: STANDARD_STAMP_PRICE_FROM_ARS,
  }));
}

const HEADERS = [
  'id',
  'title',
  'description',
  'link',
  'image_link',
  'availability',
  'price',
  'brand',
  'condition',
  'google_product_category',
  'identifier_exists',
];

function absoluteUrl(relativePath: string) {
  const normalized = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${SITE_URL}${encodeURI(normalized)}`;
}

function formatPrice(ars: number) {
  return `${Number(ars).toFixed(2)} ARS`;
}

function escapeTsv(value: string | number) {
  const s = String(value).replace(/\r?\n/g, ' ').replace(/\t/g, ' ').trim();
  if (/["\t\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowToLine(row: FeedRow) {
  const cells = [
    row.id,
    row.title.slice(0, 150),
    row.description.slice(0, 5000),
    absoluteUrl(row.link),
    absoluteUrl(row.image),
    'in_stock',
    formatPrice(row.price),
    BRAND,
    'new',
    GOOGLE_CATEGORY,
    'no',
  ];
  return cells.map(escapeTsv).join('\t');
}

const rows = [...STATIC_ROWS, ...standardStampRows()];
const outDir = path.join(ROOT, 'feeds');
const outFile = path.join(outDir, 'google-merchant-products.tsv');
fs.mkdirSync(outDir, { recursive: true });

const lines = [HEADERS.join('\t'), ...rows.map((row) => rowToLine(row))];
fs.writeFileSync(outFile, `${lines.join('\n')}\n`, 'utf8');

console.log(`Feed generado: ${outFile}`);
console.log(`${rows.length} productos (${standardStampDesigns.length} sellos estándar) · ${SITE_URL}`);
