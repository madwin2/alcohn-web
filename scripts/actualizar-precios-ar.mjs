/**
 * Actualiza la tabla de precios ARS (grupos, medida->grupo y medidas fijas) en Supabase.
 * Uso: node scripts/actualizar-precios-ar.mjs [--apply]
 * Sin --apply solo muestra el diff.
 */
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)])
);

const BASE = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function api(path, init = {}) {
  const res = await fetch(`${BASE}/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...init.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path}: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

const GRUPOS = { chicos: 76000, medianos: 91500, grandes: 113000, xl: 161000 };

const MEDIDA_GRUPO_NUEVAS = [{ ancho: 10, largo: 1, grupo_codigo: 'medianos' }];

const MEDIDAS_FIJAS = [
  [8, 5, 166500], [9, 5, 189000], [10, 5, 195000], [11, 5, 210000],
  [12, 5, 221000], [13, 5, 238000], [14, 5, 251000], [15, 5, 265000],
  [8, 6, 171000], [9, 6, 192000], [10, 6, 199000], [11, 6, 214000],
  [12, 6, 229000], [13, 6, 243000], [14, 6, 259000], [15, 6, 275000],
  [11, 4, 160000], [12, 4, 165000], [13, 4, 170000],
  [11, 3, 160000], [12, 3, 165000], [13, 3, 170000],
];

const FIJAS_A_BORRAR = [[11, 1.3333], [12, 1.3333], [13, 1.3333]];

const grupos = await api('precios_sello_grupo?select=user_id,codigo,precio_transferencia');
const userId = grupos[0].user_id;
const uid = `user_id=eq.${userId}`;

for (const [codigo, precio] of Object.entries(GRUPOS)) {
  const actual = grupos.find((g) => g.codigo === codigo)?.precio_transferencia;
  console.log(`grupo ${codigo}: ${actual} -> ${precio}`);
  if (APPLY) {
    await api(`precios_sello_grupo?${uid}&codigo=eq.${codigo}`, {
      method: 'PATCH',
      body: JSON.stringify({ precio_transferencia: precio }),
    });
  }
}

const medidaGrupo = await api(`precios_sello_medida_grupo?select=ancho,largo,grupo_codigo&${uid}`);
for (const fila of MEDIDA_GRUPO_NUEVAS) {
  const existe = medidaGrupo.some((m) => m.ancho === fila.ancho && m.largo === fila.largo);
  console.log(`medida_grupo ${fila.ancho}x${fila.largo}: ${existe ? 'ya existe' : 'INSERT'} ${fila.grupo_codigo}`);
  if (APPLY && !existe) {
    await api('precios_sello_medida_grupo', {
      method: 'POST',
      body: JSON.stringify({ ...fila, user_id: userId }),
    });
  }
}

const fijas = await api(`precios_sello_medida_fija?select=ancho,largo,precio_transferencia&${uid}`);
for (const [ancho, largo, precio] of MEDIDAS_FIJAS) {
  const actual = fijas.find((f) => f.ancho === ancho && f.largo === largo);
  console.log(`fija ${ancho}x${largo}: ${actual ? actual.precio_transferencia : 'nueva'} -> ${precio}`);
  if (!APPLY) continue;
  if (actual) {
    await api(`precios_sello_medida_fija?${uid}&ancho=eq.${ancho}&largo=eq.${largo}`, {
      method: 'PATCH',
      body: JSON.stringify({ precio_transferencia: precio }),
    });
  } else {
    await api('precios_sello_medida_fija', {
      method: 'POST',
      body: JSON.stringify({ ancho, largo, precio_transferencia: precio, user_id: userId }),
    });
  }
}

for (const [ancho, largo] of FIJAS_A_BORRAR) {
  console.log(`fija ${ancho}x${largo}: DELETE`);
  if (APPLY) {
    await api(`precios_sello_medida_fija?${uid}&ancho=eq.${ancho}&largo=eq.${largo}`, {
      method: 'DELETE',
    });
  }
}

console.log(APPLY ? '\nAplicado.' : '\nSimulacion (usar --apply para escribir).');
