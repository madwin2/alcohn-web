/**
 * Renombra imágenes referenciadas en src/ con nombres SEO-friendly
 * y actualiza rutas en código.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/** @type {[string, string][]} rutas relativas public/images/... */
const FILE_RENAMES = [
  // Hero
  ['public/images/hero/imagen-hero.jpeg', 'public/images/hero/sello-bronce-hero-taller-alcohn.jpeg'],

  // Home inicio
  ['public/images/inicio/Madera.webp', 'public/images/inicio/madera-carpinteria-profesional.webp'],
  ['public/images/inicio/madera2.webp', 'public/images/inicio/pieza-acero-marca-artesanal.webp'],
  ['public/images/inicio/ultima.webp', 'public/images/inicio/billetera-cuero-marca-taller.webp'],

  // Scroll / craft story
  ['public/images/scroll/motoquero2.webp', 'public/images/scroll/madera-firma-repetible.webp'],
  ['public/images/scroll/viejo1.webp', 'public/images/scroll/artesano-taller-identidad.webp'],
  [
    'public/images/scroll/Firefly_Gemini Flash_Una foto producto de una tote ba 586498 ViW (1).png',
    'public/images/scroll/tote-packaging-marca-producto.png',
  ],

  // Nosotros
  ['public/images/nosotros/mecanizado.webp', 'public/images/nosotros/mecanizado-cnc-precision.webp'],

  // Before / after
  ['public/images/transforma/1.jpeg', 'public/images/transforma/antes-despues-logo-sello-01.jpeg'],
  ['public/images/transforma/2.jpeg', 'public/images/transforma/antes-despues-sello-cuero-02.jpeg'],
  ['public/images/transforma/3.jpeg', 'public/images/transforma/antes-despues-estampado-cuero-03.jpeg'],
  ['public/images/transforma/4.jpeg', 'public/images/transforma/antes-despues-producto-cuero-04.jpeg'],

  // Sello / kit
  ['public/images/sello/sellologo.webp', 'public/images/sello/sello-personalizado-logo.webp'],
  ['public/images/sello/selloestandar.webp', 'public/images/sello/sello-estandar-bronce.webp'],
  ['public/images/sello/Que incluye.png', 'public/images/sello/kit-sello-que-incluye.png'],
  ['public/images/sello/Que incluye1.png', 'public/images/sello/kit-sello-pieza-01-cabezal.png'],
  ['public/images/sello/Que incluye2.png', 'public/images/sello/kit-sello-pieza-02-mango.png'],
  ['public/images/sello/Que incluye3.png', 'public/images/sello/kit-sello-pieza-03-varilla.png'],
  ['public/images/sello/Que incluye4.png', 'public/images/sello/kit-sello-pieza-04-accesorios.png'],

  // Producto carousel
  ['public/images/producto/1.webp', 'public/images/producto/sello-bronce-galeria-01.webp'],
  ['public/images/producto/2.webp', 'public/images/producto/sello-bronce-galeria-02.webp'],
  ['public/images/producto/3.webp', 'public/images/producto/sello-bronce-galeria-03.webp'],
  ['public/images/producto/4.webp', 'public/images/producto/sello-bronce-galeria-04.webp'],
  ['public/images/producto/5.webp', 'public/images/producto/sello-bronce-galeria-05.webp'],

  // Moneda (wizard escala)
  ['public/images/moneda/moneda.svg', 'public/images/moneda/moneda-escala-referencia.svg'],

  // Materiales — cerámica, jabón, lacre, pan
  ['public/images/ceramica/1.webp', 'public/images/ceramica/sello-ceramica-aplicado-01.webp'],
  ['public/images/ceramica/2.webp', 'public/images/ceramica/sello-ceramica-pieza-02.webp'],
  ['public/images/ceramica/3.webp', 'public/images/ceramica/sello-ceramica-detalle-03.webp'],
  ['public/images/ceramica/4.webp', 'public/images/ceramica/sello-ceramica-trabajo-04.webp'],
  ['public/images/jabon/1.webp', 'public/images/jabon/sello-jabon-aplicado-01.webp'],
  ['public/images/jabon/2.webp', 'public/images/jabon/sello-jabon-pieza-02.webp'],
  ['public/images/jabon/3.webp', 'public/images/jabon/sello-jabon-detalle-03.webp'],
  ['public/images/jabon/4.webp', 'public/images/jabon/sello-jabon-trabajo-04.webp'],
  ['public/images/lacre/1.webp', 'public/images/lacre/sello-lacre-aplicado-01.webp'],
  ['public/images/lacre/2.webp', 'public/images/lacre/sello-lacre-cierre-02.webp'],
  ['public/images/lacre/3.webp', 'public/images/lacre/sello-lacre-detalle-03.webp'],
  ['public/images/lacre/4.webp', 'public/images/lacre/sello-lacre-trabajo-04.webp'],
  ['public/images/pan/1.webp', 'public/images/pan/sello-pan-hamburguesa-01.webp'],
  ['public/images/pan/2.webp', 'public/images/pan/sello-pan-hamburguesa-02.webp'],
  ['public/images/pan/3.webp', 'public/images/pan/sello-pan-hamburguesa-03.webp'],
  ['public/images/pan/4.webp', 'public/images/pan/sello-pan-hamburguesa-04.webp'],

  // Madera
  [
    'public/images/madera/34586fb6-7132-4e59-a481-d3485918f66c.webp',
    'public/images/madera/sello-madera-aplicado-01.webp',
  ],
  ['public/images/madera/DSCF1323 1.jpg.webp', 'public/images/madera/sello-madera-carpinteria-02.webp'],
  ['public/images/madera/DSCF1834.jpg.webp', 'public/images/madera/sello-madera-detalle-03.webp'],
  ['public/images/madera/DSCF2005.jpg.webp', 'public/images/madera/sello-madera-trabajo-04.webp'],

  // Cuero
  ['public/images/cuero/DSCF7781.webp', 'public/images/cuero/sello-cuero-aplicado-01.webp'],
  ['public/images/cuero/DSCF2235.webp', 'public/images/cuero/sello-cuero-marroquineria-02.webp'],
  ['public/images/cuero/DSCF1905.jpg.webp', 'public/images/cuero/sello-cuero-detalle-03.webp'],
  ['public/images/cuero/DSCF7804.webp', 'public/images/cuero/sello-cuero-trabajo-04.webp'],

  // Clientes (referenciados en landings)
  ['public/images/clientes/elpicahueso1.webp', 'public/images/clientes/cliente-elpicahueso-02.webp'],
  ['public/images/clientes/gorila1.webp', 'public/images/clientes/cliente-gorila-02.webp'],
  ['public/images/clientes/monk1.webp', 'public/images/clientes/cliente-monk-02.webp'],
  ['public/images/clientes/monk2.webp', 'public/images/clientes/cliente-monk-03.webp'],

  // Marcas
  ['public/images/brands/Cheval.webp', 'public/images/brands/brand-cheval.webp'],
  ['public/images/brands/Marcas Brooksfield.webp', 'public/images/brands/brand-brooksfield.webp'],
  ['public/images/brands/Marcas Dash.webp', 'public/images/brands/brand-dash.webp'],
  ['public/images/brands/Marcas EN.webp', 'public/images/brands/brand-en.webp'],
  ['public/images/brands/Marcas JC.webp', 'public/images/brands/brand-jc.webp'],
  ['public/images/brands/Marcas Kosi.webp', 'public/images/brands/brand-kosiuko.webp'],
  ['public/images/brands/Marcas Lee.webp', 'public/images/brands/brand-lee.webp'],
  ['public/images/brands/Marcas Mistral.webp', 'public/images/brands/brand-mistral.webp'],
  ['public/images/brands/Marcas MSP.webp', 'public/images/brands/brand-msp.webp'],
  ['public/images/brands/Marcas Tucci.webp', 'public/images/brands/brand-tucci.webp'],
  ['public/images/brands/Marcas UNRaf.webp', 'public/images/brands/brand-unraf.webp'],
  ['public/images/brands/Marcas Vit.webp', 'public/images/brands/brand-vit.webp'],
  ['public/images/brands/Terrazas de los Andes.webp', 'public/images/brands/brand-terrazas-andes.webp'],
];

const CLIENTE_KEYS = [
  'amano',
  'artemisa',
  'elfaro',
  'elpasuco',
  'elpicahueso',
  'gorila',
  'hyn',
  'luy',
  'monk',
  'sabor a roble',
  'weberly',
];

function clienteSlug(nombre) {
  return nombre.toLowerCase().replace(/\s+/g, '-');
}

for (const nombre of CLIENTE_KEYS) {
  const slug = clienteSlug(nombre);
  const variants = [
    [`public/images/clientes/${nombre}.webp`, `public/images/clientes/cliente-${slug}.webp`],
    [`public/images/clientes/${nombre}1.webp`, `public/images/clientes/cliente-${slug}-02.webp`],
    [`public/images/clientes/${nombre}2.webp`, `public/images/clientes/cliente-${slug}-03.webp`],
  ];
  for (const pair of variants) {
    FILE_RENAMES.push(pair);
  }
}

function toUrlPath(rel) {
  return '/' + rel.replace(/^public\//, '').replace(/\\/g, '/');
}

function renameFile(fromRel, toRel) {
  const from = path.join(ROOT, fromRel);
  const to = path.join(ROOT, toRel);
  if (!fs.existsSync(from)) {
    console.warn(`[skip] no existe: ${fromRel}`);
    return false;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  try {
    execSync(`git mv "${from}" "${to}"`, { cwd: ROOT, stdio: 'pipe' });
  } catch {
    fs.renameSync(from, to);
  }
  console.log(`[ok] ${fromRel} → ${toRel}`);
  return true;
}

function walkReplace(dir, replacements) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name === '.next' || name === '.git') continue;
      walkReplace(full, replacements);
      continue;
    }
    if (!/\.(ts|tsx|js|jsx|md|css|json)$/.test(name)) continue;
    let text = fs.readFileSync(full, 'utf8');
    let changed = false;
    for (const [oldUrl, newUrl] of replacements) {
      if (text.includes(oldUrl)) {
        text = text.split(oldUrl).join(newUrl);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(full, text);
      console.log(`[src] ${path.relative(ROOT, full)}`);
    }
  }
}

const replacements = FILE_RENAMES.map(([from, to]) => [toUrlPath(from), toUrlPath(to)]).sort(
  (a, b) => b[0].length - a[0].length
);

let renamed = 0;
for (const [from, to] of FILE_RENAMES) {
  if (renameFile(from, to)) renamed++;
}

walkReplace(path.join(ROOT, 'src'), replacements);

console.log(`\nListo: ${renamed} archivos renombrados, rutas actualizadas en src/`);
