import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

const logoPath =
  'C:/Users/Julian/.cursor/projects/c-Users-Julian-Documents-Alcohn-Web/assets/c__Users_Julian_AppData_Roaming_Cursor_User_workspaceStorage_c6fcf68841557b3eba552fd15583ff88_images_base_antonella_barletta_1779903786535-57f8cc4d-0033-4662-8b4e-8ed114dcd19b.png';

const logoBuf = fs.readFileSync(logoPath);
console.log('logo file bytes:', logoBuf.length);

const script = path.join(process.cwd(), 'Ejemplo de Mockup', 'mockup_generator.py');
const tmpIn = path.join(os.tmpdir(), `diag_in_${Date.now()}.png`);
const tmpOut = path.join(os.tmpdir(), `diag_out_${Date.now()}.jpg`);
fs.writeFileSync(tmpIn, logoBuf);

const argsBase = [script, '--input', tmpIn, '--output', tmpOut, '--material', 'madera'];
const attempts = [
  { cmd: 'py', args: ['-3', ...argsBase] },
  { cmd: 'python', args: [...argsBase] },
  { cmd: 'python3', args: [...argsBase] },
];

for (const { cmd, args } of attempts) {
  const t0 = Date.now();
  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, {
      timeout: 90_000,
      maxBuffer: 20 * 1024 * 1024,
      windowsHide: true,
    });
    const ms = Date.now() - t0;
    const ok = fs.existsSync(tmpOut) && fs.statSync(tmpOut).size > 0;
    console.log(`OK ${cmd}: ${ms}ms out=${ok ? fs.statSync(tmpOut).size : 0} bytes`);
    if (stderr) console.log('stderr:', String(stderr).slice(0, 200));
    if (stdout) console.log('stdout:', String(stdout).slice(0, 200));
    if (ok) break;
  } catch (e) {
    console.log(`FAIL ${cmd}: ${Date.now() - t0}ms`, e.message?.slice(0, 120));
  }
}

try {
  fs.unlinkSync(tmpIn);
} catch {}
try {
  fs.unlinkSync(tmpOut);
} catch {}
