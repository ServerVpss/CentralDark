#!/usr/bin/env node
// 🌐 Universal-Handler — ponte UNIVERSAL do Hermes com qualquer serviço externo.
//
// Substitui a antiga ideia de "Lovable-Handler": NÃO é preso a nenhuma plataforma.
// É a interface única do Core pra falar com o mundo por HTTP — deploy webhook, health de
// serviço, chamada de API, disparo de webhook, introspecção de PM2. Serve pra tudo.
//
// API: handle(acao, args) → { ok, saida }
// Ações:
//   http    { metodo?, url, headers?, body?, timeout_ms? }  request HTTP genérico
//   ping    { url, timeout_ms? }                            health-check + latência
//   webhook { url, body, headers?, timeout_ms? }            POST JSON
//   deploy  { url, body?, headers?, timeout_ms? }           dispara um deploy via webhook
//   pm2     { nome? }                                        status (read-only) de processos PM2
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const pexec = promisify(execFile);

const DEFAULT_TIMEOUT = 20_000;
const MAX_SAIDA = 4000;

function corta(s) { return String(s ?? '').slice(0, MAX_SAIDA); }

// Request HTTP genérico — o coração universal do handler.
async function req({ metodo = 'GET', url, headers = {}, body, timeout_ms = DEFAULT_TIMEOUT }) {
  if (!url || !/^https?:\/\//i.test(url)) return { ok: false, saida: 'url inválida (precisa http/https)' };
  const t0 = Date.now();
  const opts = { method: String(metodo).toUpperCase(), headers: { ...headers }, signal: AbortSignal.timeout(timeout_ms) };
  if (body !== undefined && opts.method !== 'GET' && opts.method !== 'HEAD') {
    if (typeof body === 'object') { opts.body = JSON.stringify(body); opts.headers['Content-Type'] ??= 'application/json'; }
    else opts.body = String(body);
  }
  try {
    const r = await fetch(url, opts);
    const txt = await r.text().catch(() => '');
    const ms = Date.now() - t0;
    return {
      ok: r.status < 400,
      status: r.status,
      ms,
      saida: `HTTP ${r.status} (${ms}ms) ${url}\n${corta(txt)}`,
    };
  } catch (e) {
    const ms = Date.now() - t0;
    return { ok: false, ms, saida: `falha (${ms}ms) ${url}: ${e.name === 'TimeoutError' ? 'timeout ' + timeout_ms + 'ms' : e.message}` };
  }
}

export async function handle(acao, args = {}) {
  switch ((acao || '').toLowerCase()) {
    case 'http':
      return req(args);

    case 'ping': {
      const r = await req({ metodo: 'GET', url: args.url, timeout_ms: args.timeout_ms || 8000 });
      return { ok: r.ok, saida: r.ok ? `🟢 ${args.url} vivo — HTTP ${r.status} em ${r.ms}ms` : `🔴 ${args.url} — ${r.saida}` };
    }

    case 'webhook':
    case 'deploy': {
      if (!args.url) return { ok: false, saida: `${acao}: url obrigatória` };
      const r = await req({ metodo: args.metodo || 'POST', url: args.url, headers: args.headers, body: args.body ?? {}, timeout_ms: args.timeout_ms || 30_000 });
      const emoji = r.ok ? (acao === 'deploy' ? '🚀' : '📡') : '🔴';
      return { ok: r.ok, saida: `${emoji} ${acao} → ${r.saida}` };
    }

    case 'pm2': {
      try {
        const { stdout } = await pexec('bash', ['-lc', 'pm2 jlist'], { maxBuffer: 10 * 1024 * 1024, timeout: 15_000 });
        const lista = JSON.parse(stdout);
        const filtro = args.nome ? lista.filter(p => (p.name || '').toLowerCase().includes(String(args.nome).toLowerCase())) : lista;
        const linhas = filtro.map(p => `${p.pm2_env?.status === 'online' ? '🟢' : '🔴'} ${p.name} (id ${p.pm_id}) — ${p.pm2_env?.status} restarts=${p.pm2_env?.restart_time ?? '?'}`);
        return { ok: true, saida: corta(linhas.join('\n') || '(nenhum processo)') };
      } catch (e) { return { ok: false, saida: `pm2 falhou: ${e.message.slice(0, 300)}` }; }
    }

    default:
      return { ok: false, saida: `Universal-Handler: ação desconhecida "${acao}" (use http|ping|webhook|deploy|pm2)` };
  }
}

// CLI standalone pra debug: node agent.mjs ping https://api.centralldark.com/health
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, acao = 'ping', url = 'https://status.centralldark.com'] = process.argv;
  handle(acao, { url }).then(r => { console.log(JSON.stringify(r, null, 2)); process.exit(r.ok ? 0 : 1); });
}
