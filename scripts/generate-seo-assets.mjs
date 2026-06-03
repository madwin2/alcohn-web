import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');
const APP = path.join(ROOT, 'src', 'app');
const LOGO = path.join(PUBLIC, 'images', 'sello', 'sellologo.webp');
const FAVICON_LOGO = path.join(PUBLIC, 'images', 'logo alcohn', 'logo alcohn.png');

async function generateOgImage() {
  const width = 1200;
  const height = 630;
  const background = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 17, g: 16, b: 14 },
    },
  });

  const logo = await sharp(LOGO)
    .resize(420, 420, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const titleSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .brand { fill: #ffffff; font-family: Arial, Helvetica, sans-serif; font-weight: 700; font-size: 72px; }
        .tagline { fill: #c4a574; font-family: Arial, Helvetica, sans-serif; font-weight: 600; font-size: 34px; }
        .sub { fill: rgba(255,255,255,0.72); font-family: Arial, Helvetica, sans-serif; font-size: 28px; }
      </style>
      <text x="620" y="250" class="brand">Alcohn</text>
      <text x="620" y="310" class="tagline">Sellos de bronce hechos en CNC</text>
      <text x="620" y="370" class="sub">Mar del Plata, Argentina</text>
    </svg>
  `);

  const output = path.join(PUBLIC, 'og-default.jpg');
  await background
    .composite([
      { input: logo, top: 105, left: 90 },
      { input: titleSvg, top: 0, left: 0 },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(output);

  console.log(`[ok] OG image -> ${path.relative(ROOT, output)}`);
}

async function generateFavicons() {
  const logo = sharp(FAVICON_LOGO).resize(512, 512, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  const faviconPath = path.join(APP, 'favicon.ico');
  await logo.clone().resize(32, 32).png().toFile(faviconPath);

  const iconPath = path.join(APP, 'icon.png');
  await logo.clone().resize(32, 32).png().toFile(iconPath);

  const applePath = path.join(APP, 'apple-icon.png');
  await logo.clone().resize(180, 180).png().toFile(applePath);

  const publicApple = path.join(PUBLIC, 'apple-touch-icon.png');
  await logo.clone().resize(180, 180).png().toFile(publicApple);

  console.log(`[ok] favicon -> ${path.relative(ROOT, faviconPath)}`);
  console.log(`[ok] icon -> ${path.relative(ROOT, iconPath)}`);
  console.log(`[ok] apple-icon -> ${path.relative(ROOT, applePath)}`);
  console.log(`[ok] apple-touch-icon -> ${path.relative(ROOT, publicApple)}`);
}

async function main() {
  await generateOgImage();
  await generateFavicons();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
