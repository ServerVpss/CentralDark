#!/usr/bin/env node
// 🧐 Agente Critic — auditor implacável. Audita CADA etapa executada.
// Barato por design: heurística local sempre; modelo (gemini flash via darkai) SÓ quando a etapa falhou.
// Fail-safe: qualquer erro aqui é ignorado pelo orquestrador — o Critic nunca derruba uma missão.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const pexec = promisify(execFile);

const MODELO_AUDITORIA = 'google/gemini-3-flash-preview';
const TIMEOUT_MS = 12_000;

// 🔒 Áreas protegidas (CLAUDE.md §9) — veto ANTES da execução; só "PERMITO PIVETE" libera
const PROTEGIDAS = [
  'apps/bot-telegram/', 'apps/modulos/status/', 'apps/modulos/Bolt/', 'apps/modulos/WebUI/',
  'apps/modulos/graph-panel/', 'apps/modulos/elite-anthropic-proxy/', 'scripts/webhook/',
  'scripts/contas-admin/', '.github/workflows/', 'infra/caddy/', 'secrets/',
];

// vetar(ferramenta, args) → string com motivo do veto, ou null se liberado
export function vetar(ferramenta, args = {}) {
  const alvos = [];
  if (ferramenta === 'escrever_arquivo' && args.path) alvos.push(String(args.path));
  if (ferramenta === 'shell' && /\b(rm|mv|cp|>|>>|sed -i|tee)\b/.test(args.comando || '')) alvos.push(String(args.comando));
  if (ferramenta === 'git' && Array.isArray(args.paths)) alvos.push(...args.paths.map(String));
  for (const a of alvos) {
    const hit = PROTEGIDAS.find(p => a.replace('/root/CentralDark/', '').includes(p));
    if (hit) return `🔒 VETO (Critic): "${hit}" é área protegida — só o Pivete autoriza (PERMITO PIVETE). Replaneje sem tocar nela.`;
  }
  return null;
}

// Heurística local — 0 tokens
function heuristica(decisao, resultado, historico) {
  const problemas = [];
  if (!resultado.ok) problemas.push(`etapa falhou: ${String(resultado.saida || '').slice(0, 120)}`);
  if (/ferramenta desconhecida/.test(resultado.saida || '')) problemas.push('decisor inventou ferramenta inexistente');
  if (/🚫 bloqueio/.test(resultado.saida || '')) problemas.push('tentou comando bloqueado pelas travas de segurança');
  const ult = (historico ?? []).slice(-2);
  if (ult.length === 2 && ult.every(h => !h.ok)) problemas.push('3ª falha em sequência se esta contar — risco de pausa');
  return problemas;
}

// Auditoria com modelo barato — só quando falhou (economia agressiva)
async function auditoriaModelo(decisao, resultado) {
  const prompt = `Você é o Critic do Hermes (auditor). Etapa executada:
FERRAMENTA: ${decisao.ferramenta}
ARGS: ${JSON.stringify(decisao.args).slice(0, 500)}
RESULTADO (falhou): ${String(resultado.saida).slice(0, 800)}

Em UMA frase (max 140 chars, PT-BR): qual a causa provável e o que a próxima etapa deve fazer diferente? Sem markdown.`;
  const p = pexec('darkai', ['--model', MODELO_AUDITORIA, prompt], { maxBuffer: 1024 * 1024, timeout: TIMEOUT_MS });
  p.child.stdin.end(); // darkai lê stdin quando não é TTY — pipe aberto trava no $(cat) até o timeout
  const { stdout } = await p;
  return stdout.trim().slice(0, 200);
}

// API principal — auditar(decisao, resultado, historico) → { aprovado, parecer }
export async function auditar(decisao, resultado, historico = []) {
  const problemas = heuristica(decisao, resultado, historico);
  if (problemas.length === 0) return { aprovado: true, parecer: 'ok' };

  let parecer = problemas.join('; ');
  if (!resultado.ok) {
    try {
      const diag = await auditoriaModelo(decisao, resultado);
      if (diag) parecer = diag;
    } catch { /* heurística já basta */ }
  }
  return { aprovado: false, parecer };
}

// CLI standalone pra debug
if (import.meta.url === `file://${process.argv[1]}`) {
  const decisao = { ferramenta: 'shell', args: { comando: 'exemplo' } };
  const resultado = { ok: false, saida: process.argv[2] || 'erro de teste' };
  auditar(decisao, resultado).then(r => console.log(JSON.stringify(r, null, 2)));
}
