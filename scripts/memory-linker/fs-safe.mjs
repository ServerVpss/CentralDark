import fs from 'node:fs';
import path from 'node:path';

function pathEscapesRoot(rootReal, targetReal) {
  const relative = path.relative(rootReal, targetReal);
  return relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
}

/**
 * Resolve somente arquivo regular que permaneça fisicamente dentro da raiz.
 * Symlink de arquivo é recusado antes de read/write; symlink de ancestral que
 * resolva para fora também falha pelo realpath.
 */
export function ensureRegularFileInsideRootSync(root, target) {
  const rootReal = fs.realpathSync(root);
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink()) throw new Error('PATH_SYMLINK_FORBIDDEN');
  if (!stat.isFile()) throw new Error('PATH_NOT_REGULAR_FILE');

  const targetReal = fs.realpathSync(target);
  if (pathEscapesRoot(rootReal, targetReal)) throw new Error('PATH_OUTSIDE_ROOT');
  return targetReal;
}

/**
 * Escrita UTF-8 atômica e idempotente para artefatos derivados do memory-linker.
 *
 * - recusa substituir symlink/target não regular;
 * - preserva o modo POSIX do arquivo existente por padrão;
 * - arquivo novo usa 0600, salvo `mode` explícito;
 * - valida no-op por bytes quando skipIfUnchanged=true;
 * - grava em arquivo temporário irmão;
 * - fsync no arquivo antes do rename;
 * - rename atômico sobre o alvo;
 * - fsync do diretório como durabilidade best-effort.
 *
 * Retorna UPDATED ou UNCHANGED para que telemetria não confunda execução com mutação.
 */
export function atomicWriteUtf8Sync(target, contents, { skipIfUnchanged = true, mode = null } = {}) {
  let targetMode = mode ?? 0o600;

  if (fs.existsSync(target)) {
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink()) throw new Error('ATOMIC_TARGET_SYMLINK_FORBIDDEN');
    if (!stat.isFile()) throw new Error('ATOMIC_TARGET_NOT_REGULAR_FILE');
    if (mode === null) targetMode = stat.mode & 0o777;

    if (skipIfUnchanged) {
      if (fs.readFileSync(target, 'utf8') === contents) return 'UNCHANGED';
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
    fd = fs.openSync(temp, 'wx', targetMode);
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
