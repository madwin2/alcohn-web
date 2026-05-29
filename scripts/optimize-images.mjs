import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images');
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 80;
const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const SKIP_SEGMENTS = new Set(['.next', 'node_modules']);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(1)} ${units[index]}`;
}

async function collectImageFiles(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_SEGMENTS.has(entry.name)) continue;
      await collectImageFiles(fullPath, files);
      continue;
    }
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (VALID_EXTENSIONS.has(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function optimizeImage(filePath) {
  const originalStats = await fs.stat(filePath);
  const parsed = path.parse(filePath);
  const outputPath = path.join(parsed.dir, `${parsed.name}.webp`);

  const transformer = sharp(filePath).rotate().resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
    fit: 'inside',
  });

  await transformer.webp({ quality: WEBP_QUALITY }).toFile(outputPath);

  const optimizedStats = await fs.stat(outputPath);
  const diff = originalStats.size - optimizedStats.size;

  return {
    filePath,
    outputPath,
    originalSize: originalStats.size,
    optimizedSize: optimizedStats.size,
    savedBytes: diff,
  };
}

async function main() {
  const files = await collectImageFiles(IMAGES_DIR);

  if (files.length === 0) {
    console.log('No se encontraron imágenes JPG/PNG para optimizar.');
    return;
  }

  console.log(`Optimizando ${files.length} imágenes en ${IMAGES_DIR}`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let totalSaved = 0;
  let converted = 0;

  for (const filePath of files) {
    try {
      const result = await optimizeImage(filePath);
      totalOriginal += result.originalSize;
      totalOptimized += result.optimizedSize;
      totalSaved += result.savedBytes;
      converted += 1;

      console.log(
        `[ok] ${path.relative(ROOT_DIR, result.filePath)} -> ${path.relative(
          ROOT_DIR,
          result.outputPath
        )} (${formatBytes(result.originalSize)} -> ${formatBytes(
          result.optimizedSize
        )})`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`[error] ${path.relative(ROOT_DIR, filePath)}: ${message}`);
    }
  }

  const percentage = totalOriginal
    ? ((totalSaved / totalOriginal) * 100).toFixed(1)
    : '0.0';

  console.log('\nResumen');
  console.log(`- Archivos convertidos: ${converted}/${files.length}`);
  console.log(`- Tamaño original total: ${formatBytes(totalOriginal)}`);
  console.log(`- Tamaño webp total: ${formatBytes(totalOptimized)}`);
  console.log(`- Ahorro estimado: ${formatBytes(totalSaved)} (${percentage}%)`);
  console.log(
    '- Nota: este script crea archivos .webp al lado del original. Después hay que actualizar referencias para usar WebP.'
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
