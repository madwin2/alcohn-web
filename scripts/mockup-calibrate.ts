/**
 * Hoja de prueba de las muestras por escena.
 *
 * Uso: npx tsx scripts/mockup-calibrate.ts [carpetaSalida] [escena,escena] [logo.png,logo.png]
 * Genera cada muestra en tamaño completo y una hoja con todas juntas.
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { prepareLogoForStamp } from '../src/lib/logoStampPrepare';
import { renderSceneMockup } from '../src/lib/mockupScenes/render';
import { MOCKUP_SCENES } from '../src/lib/mockupScenes/scenes';

const DEFAULT_LOGOS = [
  'public/images/brand/alcohn-logo.png',
  'public/images/brands/brand-dash.webp',
  'public/images/brands/brand-cheval.webp',
  'public/images/brands/brand-msp.webp',
  'public/images/brands/brand-tucci.webp',
  'public/images/brands/brand-brooksfield.webp',
];

async function main() {
  const outDir = process.argv[2] || path.join(process.env.TEMP || '.', 'mockup-calibrate');
  const sceneIds = process.argv[3] ? process.argv[3].split(',') : Object.keys(MOCKUP_SCENES);
  const logos = process.argv[4] ? process.argv[4].split(',') : DEFAULT_LOGOS;
  fs.mkdirSync(outDir, { recursive: true });

  const thumbs: { input: Buffer; left: number; top: number }[] = [];
  const tw = 480;
  const th = 320;
  let row = 0;
  for (const sceneId of sceneIds) {
    let col = 0;
    for (const logoPath of logos) {
      const raw = fs.readFileSync(logoPath);
      const prepared = await prepareLogoForStamp(raw);
      const t0 = Date.now();
      const res = await renderSceneMockup(prepared, sceneId);
      const ms = Date.now() - t0;
      const name = `${sceneId}__${path.basename(logoPath).replace(/\.\w+$/, '')}.jpg`;
      fs.writeFileSync(path.join(outDir, name), res.buffer);
      console.log(
        `${name}  ${ms}ms  logo ${res.logoMm.width.toFixed(1)}×${res.logoMm.height.toFixed(1)} mm${res.fitted ? ' (ajustado al objeto)' : ''}`,
      );
      thumbs.push({
        input: await sharp(res.buffer).resize(tw, th, { fit: 'cover' }).jpeg().toBuffer(),
        left: col * tw,
        top: row * th,
      });
      col++;
    }
    row++;
  }
  const sheet = await sharp({
    create: { width: tw * logos.length, height: th * sceneIds.length, channels: 3, background: '#222' },
  })
    .composite(thumbs)
    .jpeg({ quality: 85 })
    .toBuffer();
  fs.writeFileSync(path.join(outDir, '_hoja.jpg'), sheet);
  console.log('Hoja:', path.join(outDir, '_hoja.jpg'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
