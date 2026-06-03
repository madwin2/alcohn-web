import { rmSync } from 'node:fs';

rmSync('.next', { recursive: true, force: true });
console.log('Caché .next eliminada. Reiniciá el servidor con npm run dev.');
