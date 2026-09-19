// utils/fs-safe.mjs — helpers de FS à prova de bala (recriado 2026-07-05)
// Contrato atual: compatível com chamadas antigas (opts) e com o HERMES Core v5
// (tag + opts), sempre devolvendo receipt estruturado em vez de undefined.
import { rename } from 'node:fs/promises';

export async function renameComRetry(src, dst, tagOrOpts = {}, maybeOpts = {}) {
  const tag = typeof tagOrOpts === 'string' ? tagOrOpts : '';
  const opts = (tagOrOpts && typeof tagOrOpts === 'object') ? tagOrOpts : (maybeOpts || {});
  const tentativas = Number(opts.tentativas ?? 5);
  const delayBase = Number(opts.delayMs ?? 120);
  let ultimoErro = null;

  for (let i = 0; i < tentativas; i++) {
    try {
      await rename(src, dst);
      return { ok: true, attempts: i + 1, tag };
    } catch (err) {
      ultimoErro = err;
      if (err?.code === 'ENOTEMPTY') {
        try { opts.onEnotempty?.(tag); } catch {}
      }

      const retriable = ['EBUSY', 'EPERM', 'ENOENT', 'EACCES', 'EAGAIN', 'ENOTEMPTY'].includes(err?.code);
      if (!retriable || i === tentativas - 1) {
        return {
          ok: false,
          reason: err?.code || 'UNKNOWN',
          error: String(err?.message || err),
          attempts: i + 1,
          tag,
        };
      }

      try { opts.log?.(`[fs-safe] retry ${i + 1}/${tentativas} ${tag} code=${err?.code || 'UNKNOWN'}`); } catch {}
      await new Promise((resolve) => setTimeout(resolve, delayBase * Math.pow(2, i)));
    }
  }

  return {
    ok: false,
    reason: ultimoErro?.code || 'UNKNOWN',
    error: String(ultimoErro?.message || ultimoErro || 'rename falhou'),
    attempts: tentativas,
    tag,
  };
}

export default { renameComRetry };
