#!/usr/bin/env node
// 🛠️  Executor — roda a etapa decidida pelo cérebro. Com trava de segurança.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, isAbsolute } from 'node:path';

const pexec = promisify(execFile);
const ROOT = '/root/CentralDark';

const BLOQUEIOS = [
  /\breboot\b/i, /\bshutdown\b/i, /\bhalt\b/i, /\bpoweroff\b/i,
  /\brm\s+-rf\s+\/(\s|$)/i, /\brm\s+-rf\s+\/\*/i,
  /whatsapp-server/i,
  /git\s+push\s+.*--force/i,
  /pm2\s+(delete|stop|restart)\s+(1|whatsapp)/i,
];

function bloqueia(cmd) {
  for (const rx of BLOQUEIOS) if (rx.test(cmd)) return `bloqueio: ${rx}`;
  if (/\b(rm|mv|cp|chmod|chown)\b/.test(cmd)) {
    const paths = cmd.match(/\/root\/[^\s'";]+/g) || [];
    for (const p of paths) if (!p.startsWith(ROOT)) return `path fora do CentralDark: ${p}`;
  }
  return null;
}

function pathSafe(p) {
  const abs = isAbsolute(p) ? p : resolve(ROOT, p);
  if (!abs.startsWith(ROOT + '/') && abs !== ROOT) throw new Error(`path fora do CentralDark: ${abs}`);
  return abs;
}

export async function executar(ferramenta, args) {
  switch (ferramenta) {
    case 'shell': {
      const cmd = String(args.comando || '').trim();
      if (!cmd) return { ok: false, saida: 'comando vazio' };
      const bloq = bloqueia(cmd);
      if (bloq) return { ok: false, saida: `🚫 ${bloq}` };
      try {
        const { stdout, stderr } = await pexec('bash', ['-lc', `cd ${ROOT} && ${cmd}`], {
          maxBuffer: 5 * 1024 * 1024, timeout: 300_000,
        });
        return { ok: true, saida: (stdout + (stderr ? '\n[stderr]\n' + stderr : '')).slice(0, 4000) };
      } catch (e) {
        return { ok: false, saida: `exit=${e.code} ${(e.stdout||'').slice(0,1500)}\n${(e.stderr||e.message).slice(0,1500)}` };
      }
    }
    case 'darkai': {
      const modelo = args.modelo || 'openai/gpt-5';
      const prompt = String(args.prompt || '');
      if (!prompt) return { ok: false, saida: 'prompt vazio' };
      try {
        const { stdout } = await pexec('darkai', ['--model', modelo, prompt], { maxBuffer: 10*1024*1024, timeout: 180_000 });
        return { ok: true, saida: stdout.slice(0, 4000) };
      } catch (e) { return { ok: false, saida: e.message }; }
    }
    case 'git': {
      const acao = args.acao || 'status';
      try {
        if (acao === 'status') {
          const { stdout } = await pexec('bash', ['-lc', `cd ${ROOT} && git status --short`]);
          return { ok: true, saida: stdout || '(limpo)' };
        }
        if (acao === 'commit_push') {
          const msg = (args.mensagem || 'chore(hermes): auto-commit').replace(/"/g, '\\"');
          const { stdout } = await pexec('bash', ['-lc', `cd ${ROOT} && git add -A && git commit -m "${msg}" && git pull --rebase origin main && git push origin main 2>&1 | tail -20`], { timeout: 120_000 });
          return { ok: true, saida: stdout.slice(0, 2000) };
        }
        return { ok: false, saida: `ação git desconhecida: ${acao}` };
      } catch (e) { return { ok: false, saida: e.message.slice(0, 2000) }; }
    }
    case 'escrever_arquivo': {
      try {
        const abs = pathSafe(args.path);
        await mkdir(dirname(abs), { recursive: true });
        await writeFile(abs, String(args.conteudo ?? ''));
        return { ok: true, saida: `✅ escrito ${abs} (${(args.conteudo||'').length} bytes)` };
      } catch (e) { return { ok: false, saida: e.message }; }
    }
    case 'ler_arquivo': {
      try {
        const abs = pathSafe(args.path);
        const txt = await readFile(abs, 'utf8');
        return { ok: true, saida: txt.slice(0, 4000) };
      } catch (e) { return { ok: false, saida: e.message }; }
    }
    case 'notificar_progresso': {
      return { ok: true, saida: `📢 ${args.mensagem || ''}` };
    }
    default:
      return { ok: false, saida: `ferramenta desconhecida: ${ferramenta}` };
  }
}
