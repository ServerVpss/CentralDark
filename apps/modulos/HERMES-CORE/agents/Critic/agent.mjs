#!/usr/bin/env node
// 🧐 Agente Critic — auditor implacável. Audita CADA etapa executada.
// Barato por design: heurística local sempre; modelo (gemini flash via darkai) SÓ quando a etapa falhou.
// Fail-safe da auditoria comum: heurística local preserva parecer mesmo se o modelo cair.
// Fail-closed da finalização: terminou=true é só proposta; conclusão exige gate determinístico.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
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

// Resultado de etapa só é verde quando Executor E Critic concordam.
// Critic ausente/indisponível não é aprovação implícita.
export function resultadoAprovadoPeloCritic(resultado = {}, parecer = null) {
  return resultado?.ok === true && parecer?.aprovado === true;
}

// Mutações de shell: cobre comandos conhecidos E redirecionamentos/escritas programáticas observadas.
// A lista é conservadora de propósito: dúvida sobre escrita => tratar como mutação.
const MUTATING_SHELL = /\b(?:rm|mv|cp|mkdir|touch|chmod|chown|tee|truncate|install|rsync|sed\s+-i|perl\s+-[^\n]*i|git\s+(?:add|commit|push|merge|rebase|reset|apply|checkout|switch)|npm\s+(?:install|i)|pnpm\s+install|yarn\s+add|pm2\s+(?:restart|reload|start|stop|delete)|docker\s+(?:compose\s+)?(?:up|down|restart|rm))\b/i;
const SHELL_REDIRECTION_WRITE = /(?:^|[\s;&|])\d*>>?(?!&)(?=\s*[^\s])/;
const SHELL_PYTHON_WRITE = /(?:python(?:3)?\b[^\n]*\bopen\s*\([^\n]*,[^\n]*['"](?:w|a|x)[+b]?['"]|\bdd\b[^\n]*\bof=)/i;
const SHELL_NODE_FS_WRITE = /\b(?:node|bun)\b[^\n]*(?:(?:node:)?fs|require\s*\(\s*['"](?:node:)?fs['"]\s*\)|from\s+['"](?:node:)?fs['"])[^\n]*\b(?:writeFile(?:Sync)?|appendFile(?:Sync)?|createWriteStream|truncate(?:Sync)?|rm(?:Sync)?|unlink(?:Sync)?|rename(?:Sync)?|copyFile(?:Sync)?|mkdir(?:Sync)?)\b/i;

// Depois de mutação, só um teste comportamental explícito satisfaz o gate final.
// Sintaxe, tipo, lint, build, hash, git state, curl/health e ping são evidências úteis,
// mas NÃO demonstram sozinhos que a mudança faz o que deveria fazer.
const BEHAVIOR_TEST_SHELL = /(?:\bnode\s+--test\b|\bnpm\s+(?:test|run\s+test(?=\s|:|$))|\bpnpm\s+(?:test|run\s+test(?=\s|:|$))|\byarn\s+(?:test|run\s+test(?=\s|:|$))|\bbun\s+test\b|\bdeno\s+test\b|\bpytest\b|\bvitest\b|\bjest\b|\bpython(?:3)?\s+-m\s+unittest\b|\bgo\s+test\b|\bcargo\s+test\b|\bdotnet\s+test\b)/i;

function gitMuta(h) {
  if (h?.ferramenta !== 'git') return false;
  const acao = String(h.args?.acao || '').toLowerCase();
  return acao !== '' && acao !== 'status';
}

function shellMuta(comando) {
  const cmd = String(comando || '');
  return MUTATING_SHELL.test(cmd)
    || SHELL_REDIRECTION_WRITE.test(cmd)
    || SHELL_PYTHON_WRITE.test(cmd)
    || SHELL_NODE_FS_WRITE.test(cmd);
}

function indiceUltimaMutacao(historico) {
  let idx = -1;
  for (let i = 0; i < historico.length; i++) {
    const h = historico[i] || {};
    if (h.ferramenta === 'escrever_arquivo' || gitMuta(h)) idx = i;
    else if (h.ferramenta === 'shell' && shellMuta(h.args?.comando)) idx = i;
  }
  return idx;
}

function indiceTesteComportamentalDepois(historico, depoisDe) {
  for (let i = Math.max(0, depoisDe + 1); i < historico.length; i++) {
    const h = historico[i] || {};
    if (h.ok !== true || h.critic) continue;
    if (h.ferramenta === 'shell' && BEHAVIOR_TEST_SHELL.test(String(h.args?.comando || ''))) return i;
  }
  return -1;
}

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

// Gate final determinístico: terminou=true é PROPOSTA, nunca prova de conclusão.
// O Critic final pode bloquear. Não usa LLM nem depende da narrativa do decisor.
export function auditarFinalizacao({ missao = '', decisao = {}, historico = [] } = {}) {
  const problemas = [];
  const resumo = String(decisao?.args?.mensagem || decisao?.pensamento || '').trim();
  const ultimo = historico.length ? historico[historico.length - 1] : null;
  const ultimaMutacao = indiceUltimaMutacao(historico);
  const testeComportamentalDepois = indiceTesteComportamentalDepois(historico, ultimaMutacao);

  if (decisao?.terminou !== true) problemas.push('decisor não propôs conclusão');
  if (decisao?.ferramenta !== 'notificar_progresso') problemas.push('conclusão deve usar notificar_progresso');
  if (!resumo) problemas.push('resumo final ausente');
  if (!historico.length) problemas.push('histórico vazio: nenhuma ação/evidência observada');
  if (ultimo && ultimo.ok !== true) problemas.push('última etapa não está aprovada');
  if (ultimo?.critic) problemas.push('última etapa possui reprovação do Critic');

  if (ultimaMutacao >= 0 && testeComportamentalDepois < 0) {
    problemas.push('houve mutação sem teste comportamental bem-sucedido posterior');
  }

  const receipt = {
    schema_version: 1,
    gate: 'HERMES_FINALIZATION_CRITIC',
    status: problemas.length ? 'BLOCKED' : 'PASS',
    mission_sha256: sha256(missao),
    history_sha256: sha256(JSON.stringify(historico)),
    decision_model: decisao?._modelo_usado || null,
    history_entries: historico.length,
    last_step_index: historico.length ? historico.length - 1 : -1,
    last_mutation_index: ultimaMutacao,
    behavior_test_after_mutation_index: testeComportamentalDepois,
    checks: {
      completion_proposed: decisao?.terminou === true,
      completion_tool_valid: decisao?.ferramenta === 'notificar_progresso',
      summary_present: Boolean(resumo),
      history_present: historico.length > 0,
      last_step_ok: Boolean(ultimo && ultimo.ok === true),
      last_step_critic_clear: Boolean(ultimo && !ultimo.critic),
      mutation_has_later_behavior_test: ultimaMutacao < 0 || testeComportamentalDepois > ultimaMutacao,
    },
    problems: problemas,
  };

  return {
    aprovado: problemas.length === 0,
    parecer: problemas.length ? problemas.join('; ') : 'gate final aprovado',
    receipt,
  };
}

// CLI standalone pra debug
if (import.meta.url === `file://${process.argv[1]}`) {
  const decisao = { ferramenta: 'shell', args: { comando: 'exemplo' } };
  const resultado = { ok: false, saida: process.argv[2] || 'erro de teste' };
  auditar(decisao, resultado).then(r => console.log(JSON.stringify(r, null, 2)));
}
