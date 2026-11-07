/**
 * Genera feeds/google-merchant-products-{cl,pe,co,mx}.tsv para Google Merchant Center.
 * Ejecutar: npm run feed:merchant:latam
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAccessoryBySlug, getAccessoryLinkPrice } from '../src/data/accessories';
import { products } from '../src/data/products';
import { getStampPriceFrom, stampUseCases } from '../src/data/stampUseCases';
import {
  isAccessoryAvailableInMarket,
  isProductSlugAvailableInMarket,
  isStampUseCaseAvailableInMarket,
} from '../src/lib/markets/catalog';
import { INTERNATIONAL_MARKETS, getMarketConfig } from '../src/lib/markets/config';
import { marketPath } from '../src/lib/markets/paths';
import { marketProductDescription } from '../src/lib/markets/seo';
import { convertPublicArsToMarketPrice } from '../src/lib/markets/pricing';
import type { InternationalMarketCode } from '../src/lib/markets/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://www.alcohnsellos.com';
const BRAND = 'Alcohn';
const GOOGLE_CATEGORY = 'Herramientas y ferretería > Herramientas > Sellos y punzones';

type FeedRow = {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string;
  /** Precio ARS que recibe la página (PriceFrom / JSON-LD); se convierte igual que en la web. */
  pageArs: number;
};

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

function formatPrice(amount: number, currency: string) {
  return `${Number(amount).toFixed(2)} ${currency}`;
}

function escapeTsv(value: string | number) {
  const s = String(value).replace(/\r?\n/g, ' ').replace(/\t/g, ' ').trim();
  if (/["\t\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildInternationalRows(): FeedRow[] {
  const rows: FeedRow[] = [];

  for (const useCase of stampUseCases) {
    if (!isStampUseCaseAvailableInMarket(useCase.slug, 'cl')) continue;
    rows.push({
      id: `sello-${useCase.slug}`,
      title: useCase.seoTitle,
      description: useCase.seoDescription ?? useCase.description,
      link: `/sellos/${useCase.slug}`,
      image: useCase.heroImage,
      pageArs: getStampPriceFrom(useCase.buyMaterial),
    });
  }

  // Los sellos personalizados ya están cubiertos por /sellos/para-*; /{market}/productos/{slug}
  // no existe. Solo se publican los abecedarios, que tienen página propia.
  for (const product of products) {
    if (!isProductSlugAvailableInMarket(product.slug, 'cl')) continue;
    if (product.category !== 'abecedario') continue;
    const publicPrice =
      typeof product.price === 'number' ? product.price : product.price.desde;
    rows.push({
      id: `prod-${product.slug}`,
      title: product.seoTitle,
      description: product.seoDescription,
      link: '/abecedarios',
      image: product.images.default,
      pageArs: publicPrice,
    });
  }

  const mango = getAccessoryBySlug('mango-de-golpe');
  if (mango && isAccessoryAvailableInMarket('mango-de-golpe', 'cl')) {
    rows.push({
      id: 'accesorio-mango-de-golpe',
      title: mango.seoTitle ?? mango.title,
      description: mango.seoDescription ?? mango.description,
      link: '/accesorios/mango-de-golpe',
      image: mango.image,
      pageArs: mango.variants?.[0]?.linkPrice ?? getAccessoryLinkPrice(mango),
    });
  }

  return rows;
}

function rowToLine(row: FeedRow, market: InternationalMarketCode) {
  const config = getMarketConfig(market);
  // Misma conversión que PriceFrom y el JSON-LD de la página de destino.
  const localPrice = convertPublicArsToMarketPrice(row.pageArs, market);
  const cells = [
    `${market}-${row.id}`,
    row.title.replace(/Alcohn Argentina/g, 'Alcohn').slice(0, 150),
    marketProductDescription(row.description, market).slice(0, 5000),
    absoluteUrl(marketPath(market, row.link)),
    absoluteUrl(row.image),
    'in_stock',
    formatPrice(localPrice, config.currency),
    BRAND,
    'new',
    GOOGLE_CATEGORY,
    'no',
  ];
  return cells.map(escapeTsv).join('\t');
}

const baseRows = buildInternationalRows();
const outDir = path.join(ROOT, 'feeds');
fs.mkdirSync(outDir, { recursive: true });

for (const market of INTERNATIONAL_MARKETS) {
  const outFile = path.join(outDir, `google-merchant-products-${market}.tsv`);
  const lines = [HEADERS.join('\t'), ...baseRows.map((row) => rowToLine(row, market))];
  fs.writeFileSync(outFile, `${lines.join('\n')}\n`, 'utf8');
  const currency = getMarketConfig(market).currency;
  console.log(`Feed generado: ${outFile} (${baseRows.length} productos · ${currency})`);
}

console.log(`Base URL: ${SITE_URL}`);
