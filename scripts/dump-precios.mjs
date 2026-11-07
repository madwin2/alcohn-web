import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)])
);

const URL_BASE = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function q(path) {
  const res = await fetch(`${URL_BASE}/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

const grupos = await q('precios_sello_grupo?select=user_id,codigo,precio_transferencia');
console.log('GRUPOS', JSON.stringify(grupos, null, 2));

const userId = grupos[0]?.user_id;
const mg = await q(
  `precios_sello_medida_grupo?select=ancho,largo,grupo_codigo&user_id=eq.${userId}&order=ancho,largo`
);
console.log('MEDIDA_GRUPO count=' + mg.length, JSON.stringify(mg));

const mf = await q(
  `precios_sello_medida_fija?select=ancho,largo,precio_transferencia&user_id=eq.${userId}&order=ancho,largo`
);
console.log('MEDIDA_FIJA count=' + mf.length, JSON.stringify(mf));
