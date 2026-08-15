import fs from 'node:fs';
import path from 'node:path';

/**
 * Escrita UTF-8 atômica e idempotente para artefatos derivados do memory-linker.
 *
 * - valida no-op por bytes quando skipIfUnchanged=true;
 * - grava em arquivo temporário irmão;
 * - fsync no arquivo antes do rename;
 * - rename atômico sobre o alvo;
 * - fsync do diretório como durabilidade best-effort.
 *
 * Retorna UPDATED ou UNCHANGED para que telemetria não confunda execução com mutação.
 */
export function atomicWriteUtf8Sync(target, contents, { skipIfUnchanged = true, mode = 0o600 } = {}) {
  if (skipIfUnchanged && fs.existsSync(target)) {
    try {
      if (fs.readFileSync(target, 'utf8') === contents) return 'UNCHANGED';
    } catch {
      // leitura falhou: segue para escrita real em vez de fabricar no-op
    }
  }

  const dir = path.dirname(target);
  fs.mkdirSync(dir, { recursive: true });
  const temp = path.join(
    dir,
    `.${path.basename(target)}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`,
  );

  let fd = null;
  let committed = false;
  try {
    fd = fs.openSync(temp, 'wx', mode);
    const buffer = Buffer.from(contents, 'utf8');
    let offset = 0;
    while (offset < buffer.length) {
      offset += fs.writeSync(fd, buffer, offset, buffer.length - offset);
    }
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = null;

    fs.renameSync(temp, target);
    committed = true;

    try {
      const dirFd = fs.openSync(dir, 'r');
      try {
        fs.fsyncSync(dirFd);
      } finally {
        fs.closeSync(dirFd);
      }
    } catch {
      // Plataformas sem fsync de diretório ainda preservam atomicidade do rename.
    }

    return 'UPDATED';
  } finally {
    if (fd !== null) {
      try { fs.closeSync(fd); } catch {}
    }
    if (!committed) {
      try { fs.unlinkSync(temp); } catch {}
    }
  }
}
