// utils/fs-safe.mjs — helpers de FS à prova de bala (recriado 2026-07-05)
import { rename } from 'node:fs/promises';
export async function renameComRetry(src, dst, opts = {}) {
  const tentativas = opts.tentativas ?? 5;
  const delayBase  = opts.delayMs ?? 120;
  let ultimoErro;
  for (let i = 0; i < tentativas; i++) {
    try { await rename(src, dst); return; }
    catch (err) {
      ultimoErro = err;
      const retriable = ['EBUSY','EPERM','ENOENT','EACCES','EAGAIN'].includes(err.code);
      if (!retriable || i === tentativas - 1) throw err;
      await new Promise(r => setTimeout(r, delayBase * Math.pow(2, i)));
    }
  }
  throw ultimoErro;
}
export default { renameComRetry };
