#!/usr/bin/env node
// 🛠️  Agente Executor — roda a etapa decidida pelo core. Com trava de segurança.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pexec = promisify(execFile);
import { registrar as registrarNoLedger } from '../Knowledge-Collector/agent.mjs';
import { handle as handlerUniversal } from '../Universal-Handler/agent.mjs';
const ROOT = '/root/CentralDark';
const APRENDIZADOS = join(dirname(fileURLToPath(import.meta.url)), '../../knowledge/aprendizados.json');
const ARSENAL_APRENDIZADOS = join(ROOT, 'docs/CONSCIENCIA/ARSENAL/APRENDIZADOS.md');

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

// Redator de segredos — nenhum token/chave persiste em state.json, hermes.log ou notificação.
// Todo retorno de _executar passa por aqui (defesa em profundidade pra QUALQUER ferramenta).
const PADROES_SEGREDO = [
  /sk-elite-[A-Za-z0-9_-]{6,}/g,
  /sk-[A-Za-z0-9_-]{20,}/g,
  /Bearer\s+[A-Za-z0-9._-]{20,}/gi,
  /eyJ[A-Za-z0-9._-]{20,}/g,           // JWT (supabase/anon keys)
];
function redigirSegredos(s) {
  let t = String(s ?? '');
  for (const rx of PADROES_SEGREDO)
    t = t.replace(rx, m => m.slice(0, 6) + '…REDACTED');
  return t;
}

export async function executar(ferramenta, args) {
  const r = await _executar(ferramenta, args);
  return { ...r, saida: redigirSegredos(r.saida) };
}

async function _executar(ferramenta, args) {
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
        const p = pexec('darkai', ['--model', modelo, prompt], { env: { ...process.env }, maxBuffer: 10*1024*1024, timeout: 180_000 });
        p.child.stdin.end(); // darkai lê stdin quando não é TTY — pipe aberto trava no $(cat) até o timeout
        const { stdout } = await p;
        return { ok: true, saida: stdout.slice(0, 4000) };
      } catch (e) { return { ok: false, saida: `${(e.stderr || '').trim()} ${e.message}`.trim().slice(0, 1500) }; }
    }
    case 'aprender': {
      const categoria = String(args.categoria || 'geral').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'geral';
      const licao = String(args.licao || '').trim().slice(0, 300);
      if (!licao) return { ok: false, saida: 'lição vazia' };
      try {
        const base = JSON.parse(await readFile(APRENDIZADOS, 'utf8'));
        base.categorias ??= {};
        base.categorias[categoria] ??= { gatilhos: [categoria], licoes: [] };
        if (!base.categorias[categoria].licoes.includes(licao)) {
          base.categorias[categoria].licoes.push(licao);
          base.atualizado = new Date().toISOString().slice(0, 10);
          await writeFile(APRENDIZADOS, JSON.stringify(base, null, 2));
        }
        // Não engolir falha do ledger: JSON sem ARSENAL não é sucesso completo.
        try {
          registrarNoLedger('licao', `hermes-runtime cat=${categoria}`, '-', licao, 'hermes');
        } catch (e) {
          return { ok: false, saida: `falha ao registrar no ledger: ${e.message.slice(0, 200)}` };
        }

        // Read-back dos dois destinos antes de emitir verde.
        const jsonDepois = JSON.parse(await readFile(APRENDIZADOS, 'utf8'));
        const jsonOk = Array.isArray(jsonDepois?.categorias?.[categoria]?.licoes)
          && jsonDepois.categorias[categoria].licoes.includes(licao);
        const ledgerDepois = await readFile(ARSENAL_APRENDIZADOS, 'utf8');
        const ledgerOk = ledgerDepois.includes(licao);
        if (!jsonOk || !ledgerOk) {
          return {
            ok: false,
            saida: `LEARNING_PERSISTENCE_VERIFIED=false json=${jsonOk} ledger=${ledgerOk}`,
          };
        }

        return {
          ok: true,
          saida: `LEARNING_PERSISTENCE_VERIFIED=true categoria=${categoria} json=true ledger=true`,
        };
      } catch (e) {
        return { ok: false, saida: `LEARNING_PERSISTENCE_VERIFIED=false falha ao salvar aprendizado: ${e.message.slice(0, 200)}` };
      }
    }
    case 'git': {
      const acao = args.acao || 'status';
      try {
        if (acao === 'status') {
          const { stdout } = await pexec('bash', ['-lc', `cd ${ROOT} && git status --short`]);
          return { ok: true, saida: stdout || '(limpo)' };
        }
        if (acao === 'commit_push') {
          const msg = String(args.mensagem || 'chore(hermes): auto-commit').slice(0, 200);
          // Git cirúrgico: NUNCA add -A. paths explícitos; fallback = só tracked, excluindo disputados.
          const brutos = Array.isArray(args.paths) ? args.paths : [];
          const limpos = brutos.map(x => String(x).replace(/[^\w@\/.\-]/g, '')).filter(Boolean);
          const add = limpos.length
            ? `git add ${limpos.map(x => `'${x}'`).join(' ')}`
            : `git add -u -- ':!apps/modulos/status/painel-data.json' ':!*.env' ':!*.bak'`;
          const script = [
            'set -o pipefail',
            'set -eu',
            `cd ${ROOT}`,
            add,
            'git commit -m "$HERMES_COMMIT_MSG"',
            'if ! git push origin main; then',
            '  if ! git pull --rebase --autostash origin main || ! git push origin main; then',
            "    git rebase --abort >/dev/null 2>&1 || true",
            "    echo 'PUSH PENDENTE — relatar'",
            '    exit 23',
            '  fi',
            'fi',
            'LOCAL_HEAD="$(git rev-parse HEAD)"',
            'REMOTE_HEAD="$(git ls-remote origin refs/heads/main | cut -f1)"',
            'test "$LOCAL_HEAD" = "$REMOTE_HEAD" || {',
            "  echo 'PUSH PENDENTE — relatar'",
            '  exit 23',
            '}',
            'echo "REMOTE_HEAD_VERIFIED=$REMOTE_HEAD"',
          ].join('\n');
          const { stdout } = await pexec('bash', ['-lc', script], {
            env: { ...process.env, HERMES_COMMIT_MSG: msg },
            timeout: 120_000,
          });
          if (!/REMOTE_HEAD_VERIFIED=[0-9a-f]{40}/.test(stdout)) {
            return { ok: false, saida: 'PUSH PENDENTE — relatar: confirmação do HEAD remoto ausente' };
          }
          return { ok: true, saida: stdout.slice(-2000) };
        }
        return { ok: false, saida: `ação git desconhecida: ${acao}` };
      } catch (e) {
        const detalhe = `${e.stdout || ''}\n${e.stderr || e.message}`.trim().slice(0, 3000);
        return { ok: false, saida: `git ${acao} falhou: ${detalhe}` };
      }
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
    case 'handler': {
      // Ponte universal: HTTP/webhook/deploy/ping/pm2 pra qualquer serviço externo.
      try {
        const r = await handlerUniversal(args.acao, args);
        return { ok: !!r.ok, saida: String(r.saida ?? '') };
      } catch (e) { return { ok: false, saida: `handler falhou: ${e.message.slice(0, 300)}` }; }
    }
    default:
      return { ok: false, saida: `ferramenta desconhecida: ${ferramenta}` };
  }
}
