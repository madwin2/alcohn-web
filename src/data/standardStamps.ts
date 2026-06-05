export type StandardCollection = 'campo' | 'futbol' | 'patrio';
export type CollectionFilter = 'todos' | StandardCollection;
export type SizeTier = 'S' | 'M' | 'L' | 'XL';

export interface StandardStampSize {
  tier: SizeTier;
  widthCm: number;
  heightCm: number;
}

export interface StandardStampDesign {
  slug: string;
  title: string;
  collection: StandardCollection;
  description: string;
  image: string;
  hoverImage: string;
  sizes: StandardStampSize[];
}

const BASE = '/images/sellos estandar';

function stampImage(...parts: string[]): string {
  return `${BASE}/${parts.join('/')}`;
}

function formatSizeLabel(widthCm: number, heightCm: number): string {
  const fmt = (n: number) =>
    Number.isInteger(n) ? String(n) : String(n).replace('.', ',');
  return `${fmt(widthCm)}×${fmt(heightCm)}CM`;
}

export function getSizeLabel(size: StandardStampSize): string {
  return formatSizeLabel(size.widthCm, size.heightCm);
}

type SizeEntry = StandardStampSize | null;

function sizes(entries: SizeEntry[]): StandardStampSize[] {
  return entries.filter((entry): entry is StandardStampSize => entry !== null);
}

export const standardStampDesigns: StandardStampDesign[] = [
  // CAMPO
  {
    slug: 'mate',
    title: 'Mate',
    collection: 'campo',
    description: 'Sello de mate imperial para marcar cuero, madera y productos de campo.',
    image: stampImage('campo/MATE/Mate.png'),
    hoverImage: stampImage('campo/MATE/mate-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 2.8, heightCm: 1.6 },
      { tier: 'M', widthCm: 4, heightCm: 2.3 },
      { tier: 'L', widthCm: 6.7, heightCm: 3.8 },
      { tier: 'XL', widthCm: 8, heightCm: 4.5 },
    ]),
  },
  {
    slug: 'herradura',
    title: 'Herradura',
    collection: 'campo',
    description: 'Herradura clásica para marcar productos de cuero y madera.',
    image: stampImage('campo/HERRADURA/Herradura.png'),
    hoverImage: stampImage('campo/HERRADURA/herradura-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 2.8, heightCm: 2.5 },
      { tier: 'M', widthCm: 4, heightCm: 3.5 },
      null,
      { tier: 'XL', widthCm: 6, heightCm: 5.2 },
    ]),
  },
  {
    slug: 'cabeza-caballo',
    title: 'Cabeza de Caballo',
    collection: 'campo',
    description: 'Cabeza de caballo para marcar piezas de cuero con identidad de campo.',
    image: stampImage('campo/CABEZA CABALLO/Cabeza Caballo.png'),
    hoverImage: stampImage('campo/CABEZA CABALLO/cabeza-caballo-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 2.8, heightCm: 2.5 },
      { tier: 'M', widthCm: 4, heightCm: 3.5 },
      null,
      { tier: 'XL', widthCm: 6, heightCm: 5.4 },
    ]),
  },
  {
    slug: 'caballo',
    title: 'Caballo',
    collection: 'campo',
    description: 'Caballo saltando para marcar productos de cuero y madera con estilo gauchesco.',
    image: stampImage('campo/CABALLO/Caballo.png'),
    hoverImage: stampImage('campo/CABALLO/caballo-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 3, heightCm: 2.3 },
      { tier: 'M', widthCm: 4, heightCm: 3 },
      { tier: 'L', widthCm: 5.4, heightCm: 4 },
      { tier: 'XL', widthCm: 7, heightCm: 5.3 },
    ]),
  },

  // FÚTBOL
  {
    slug: 'boca-juniors',
    title: 'Boca Juniors',
    collection: 'futbol',
    description: 'Escudo de Boca Juniors en bronce para marcar cuero y productos de hinchada.',
    image: stampImage('futbol/Boca/Boca Juniors.png'),
    hoverImage: stampImage('futbol/Boca/boca-juniors-marcado-cuero.jpeg'),
    sizes: sizes([
      { tier: 'S', widthCm: 2.9, heightCm: 2.4 },
      { tier: 'M', widthCm: 4, heightCm: 3.3 },
      { tier: 'L', widthCm: 5, heightCm: 4.2 },
      { tier: 'XL', widthCm: 6, heightCm: 5 },
    ]),
  },
  {
    slug: 'river-plate',
    title: 'River Plate',
    collection: 'futbol',
    description: 'Escudo de River Plate en bronce para marcar cuero y accesorios.',
    image: stampImage('futbol/River/River.png'),
    hoverImage: stampImage('futbol/River/river-plate-marcado-cuero.jpg'),
    sizes: sizes([
      { tier: 'S', widthCm: 2.9, heightCm: 2.5 },
      { tier: 'M', widthCm: 4, heightCm: 3.4 },
      { tier: 'L', widthCm: 4.7, heightCm: 4 },
      { tier: 'XL', widthCm: 6, heightCm: 5.1 },
    ]),
  },
  {
    slug: 'independiente',
    title: 'Independiente',
    collection: 'futbol',
    description: 'Escudo de Independiente en bronce para marcar productos de cuero.',
    image: stampImage('futbol/Independiente/Independiente.png'),
    hoverImage: stampImage('futbol/Independiente/independiente-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 2.5, heightCm: 2.4 },
      { tier: 'M', widthCm: 4, heightCm: 3.8 },
      { tier: 'L', widthCm: 4.2, heightCm: 4 },
      { tier: 'XL', widthCm: 6, heightCm: 5.7 },
    ]),
  },
  {
    slug: 'racing',
    title: 'Racing',
    collection: 'futbol',
    description: 'Escudo de Racing Club en bronce para marcar cuero y productos personalizados.',
    image: stampImage('futbol/Racing/Racing.png'),
    hoverImage: stampImage('futbol/Racing/racing-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 2, heightCm: 2.5 },
      { tier: 'M', widthCm: 4, heightCm: 3.3 },
      { tier: 'L', widthCm: 5, heightCm: 4.1 },
      { tier: 'XL', widthCm: 6, heightCm: 5 },
    ]),
  },
  {
    slug: 'rosario-central',
    title: 'Rosario Central',
    collection: 'futbol',
    description: 'Escudo de Rosario Central en bronce para marcar cuero y accesorios.',
    image: stampImage('futbol/Rosario/Rosario.png'),
    hoverImage: stampImage('futbol/Rosario/rosario-central-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 2.85, heightCm: 2.5 },
      { tier: 'M', widthCm: 4, heightCm: 3.5 },
      { tier: 'L', widthCm: 5, heightCm: 4.4 },
      { tier: 'XL', widthCm: 6, heightCm: 5.3 },
    ]),
  },
  {
    slug: 'newells',
    title: "Newell's Old Boys",
    collection: 'futbol',
    description: "Escudo de Newell's Old Boys en bronce para marcar cuero y productos de hinchada.",
    image: stampImage('futbol/Newels/Newells.png'),
    hoverImage: stampImage('futbol/Newels/newells-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 2.8, heightCm: 2.3 },
      { tier: 'M', widthCm: 4, heightCm: 3.2 },
      { tier: 'L', widthCm: 5, heightCm: 4 },
      { tier: 'XL', widthCm: 6, heightCm: 4.8 },
    ]),
  },
  {
    slug: 'afa',
    title: 'AFA',
    collection: 'futbol',
    description: 'Escudo de la AFA en bronce para marcar productos de la selección argentina.',
    image: stampImage('futbol/AFA/AFA.png'),
    hoverImage: stampImage('futbol/AFA/afa-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 2.8, heightCm: 1.8 },
      { tier: 'M', widthCm: 4, heightCm: 2.5 },
      { tier: 'L', widthCm: 5, heightCm: 3.1 },
      { tier: 'XL', widthCm: 6, heightCm: 3.8 },
    ]),
  },

  // PATRIO
  {
    slug: 'argentina-mapa',
    title: 'Argentina',
    collection: 'patrio',
    description: 'Mapa de Argentina en bronce para marcar productos nacionales y artesanales.',
    image: stampImage('patrio/Argentina/argentina-mapa-sello-bronce.png'),
    hoverImage: stampImage('patrio/Argentina/argentina-mapa-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 3, heightCm: 1.4 },
      { tier: 'M', widthCm: 5, heightCm: 2.35 },
      { tier: 'L', widthCm: 8, heightCm: 3.6 },
      { tier: 'XL', widthCm: 10, heightCm: 4.5 },
    ]),
  },
  {
    slug: 'escudo-argentina',
    title: 'Escudo Nacional',
    collection: 'patrio',
    description: 'Escudo nacional argentino en bronce para marcar productos premium.',
    image: stampImage('patrio/Escudo Argentina/Escudo Argentina.png'),
    hoverImage: stampImage('patrio/Escudo Argentina/escudo-argentina-marcado-cuero.jpg'),
    sizes: sizes([
      { tier: 'S', widthCm: 3, heightCm: 2 },
      { tier: 'M', widthCm: 5, heightCm: 3.2 },
      { tier: 'L', widthCm: 6, heightCm: 4 },
      { tier: 'XL', widthCm: 8, heightCm: 5.4 },
    ]),
  },
  {
    slug: 'malvinas',
    title: 'Malvinas',
    collection: 'patrio',
    description: 'Islas Malvinas en bronce para marcar productos con identidad patria.',
    image: stampImage('patrio/Malvinas/Malvinass.png'),
    hoverImage: stampImage('patrio/Malvinas/malvinas-marcado-cuero.png'),
    sizes: sizes([
      null,
      { tier: 'M', widthCm: 3, heightCm: 3 },
      null,
      { tier: 'XL', widthCm: 5, heightCm: 5 },
    ]),
  },
  {
    slug: 'sol-de-mayo',
    title: 'Sol de Mayo',
    collection: 'patrio',
    description: 'Sol de Mayo en bronce, símbolo patrio para marcar cuero y madera.',
    image: stampImage('patrio/Sol de Mayo/Sol de Mayo.png'),
    hoverImage: stampImage('patrio/Sol de Mayo/sol-de-mayo-marcado-cuero.jpg'),
    sizes: sizes([
      null,
      { tier: 'M', widthCm: 3, heightCm: 3 },
      null,
      { tier: 'XL', widthCm: 5, heightCm: 5 },
    ]),
  },
  {
    slug: 'capybara',
    title: 'Carpincho',
    collection: 'campo',
    description: 'Carpincho en bronce para marcar productos de campo y cuero.',
    image: stampImage('patrio/Capybara/Capybara.png'),
    hoverImage: stampImage('patrio/Capybara/capybara-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 2, heightCm: 1.75 },
      { tier: 'M', widthCm: 2.8, heightCm: 2.4 },
      { tier: 'L', widthCm: 4, heightCm: 3.5 },
      { tier: 'XL', widthCm: 6, heightCm: 5.25 },
    ]),
  },
  {
    slug: 'bandera-argentina',
    title: 'Bandera Argentina',
    collection: 'patrio',
    description: 'Bandera argentina en bronce para marcar productos nacionales.',
    image: stampImage('patrio/Bandera Argentina/bandera-argentina-sello-bronce.png'),
    hoverImage: stampImage('patrio/Bandera Argentina/bandera-argentina-marcado-cuero.png'),
    sizes: sizes([
      { tier: 'S', widthCm: 2, heightCm: 1.25 },
      { tier: 'M', widthCm: 3.8, heightCm: 2.4 },
      { tier: 'L', widthCm: 6, heightCm: 3.8 },
      { tier: 'XL', widthCm: 7, heightCm: 4.4 },
    ]),
  },
];

export const COLLECTION_LABELS: Record<CollectionFilter, string> = {
  todos: 'Todos',
  futbol: 'Fútbol',
  patrio: 'Patrio',
  campo: 'Campo',
};

export function getStandardStampBySlug(slug: string): StandardStampDesign | undefined {
  return standardStampDesigns.find((d) => d.slug === slug);
}

export function getStandardStampsByCollection(collection: CollectionFilter): StandardStampDesign[] {
  if (collection === 'todos') return standardStampDesigns;
  return standardStampDesigns.filter((d) => d.collection === collection);
}

export function getAllCollectionFilters(): CollectionFilter[] {
  return ['todos', 'futbol', 'patrio', 'campo'];
}
