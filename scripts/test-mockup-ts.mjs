import fs from 'fs';
import sharp from 'sharp';
import { prepareLogoForStamp } from '../src/lib/logoStampPrepare.ts';
import { renderMockup } from '../src/lib/mockupRender.ts';

const logoPath = process.argv[2];
if (!logoPath) {
  console.error('Uso: node --experimental-strip-types scripts/test-mockup-ts.mjs <logo.png>');
  process.exit(1);
}

const raw = fs.readFileSync(logoPath);
const t0 = Date.now();
const prepared = await prepareLogoForStamp(raw);
const out = await renderMockup(prepared, process.argv[3] || 'madera');
const outPath = process.env.TEMP + '/test_mockup_ts.jpg';
fs.writeFileSync(outPath, out);
console.log('OK', out.length, 'bytes', Date.now() - t0 + 'ms', outPath);
