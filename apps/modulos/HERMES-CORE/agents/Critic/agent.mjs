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

const PROTEGIDAS = [
  'apps/bot-telegram/', 'apps/modulos/status/', 'apps/modulos/Bolt/', 'apps/modulos/WebUI/',
  'apps/modulos/graph-panel/', 'apps/modulos/elite-anthropic-proxy/', 'scripts/webhook/',
  'scripts/contas-admin/', '.github/workflows/', 'infra/caddy/', 'secrets/',
];

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

function heuristica(decisao, resultado, historico) {
  const problemas = [];
  if (!resultado.ok) problemas.push(`etapa falhou: ${String(resultado.saida || '').slice(0, 120)}`);
  if (/ferramenta desconhecida/.test(resultado.saida || '')) problemas.push('decisor inventou ferramenta inexistente');
  if (/🚫 bloqueio/.test(resultado.saida || '')) problemas.push('tentou comando bloqueado pelas travas de segurança');
  if (decisao?.ferramenta === 'git' && String(decisao.args?.acao || '') === 'commit_push'
      && resultado.ok && !/REMOTE_HEAD_VERIFIED=[0-9a-f]{40}/i.test(String(resultado.saida || ''))) {
    problemas.push('git commit_push sem prova de HEAD remoto');
  }
  if (decisao?.ferramenta === 'aprender' && resultado.ok
      && !/LEARNING_PERSISTENCE_VERIFIED=true/.test(String(resultado.saida || ''))) {
    problemas.push('aprendizado sem prova de persistência nos dois destinos');
  }
  const ult = (historico ?? []).slice(-2);
  if (ult.length === 2 && ult.every(h => !h.ok)) problemas.push('3ª falha em sequência se esta contar — risco de pausa');
  return problemas;
}

async function auditoriaModelo(decisao, resultado) {
  const prompt = `Você é o Critic do Hermes (auditor). Etapa executada:
FERRAMENTA: ${decisao.ferramenta}
ARGS: ${JSON.stringify(decisao.args).slice(0, 500)}
RESULTADO (falhou): ${String(resultado.saida).slice(0, 800)}

Em UMA frase (max 140 chars, PT-BR): qual a causa provável e o que a próxima etapa deve fazer diferente? Sem markdown.`;
  const p = pexec('darkai', ['--model', MODELO_AUDITORIA, prompt], { maxBuffer: 1024 * 1024, timeout: TIMEOUT_MS });
  p.child.stdin.end();
  const { stdout } = await p;
  return stdout.trim().slice(0, 200);
}

export async function auditar(decisao, resultado, historico = []) {
  const problemas = heuristica(decisao, resultado, historico);
  if (problemas.length === 0) return { aprovado: true, parecer: 'ok' };
  let parecer = problemas.join('; ');
  if (!resultado.ok) {
    try {
      const diag = await auditoriaModelo(decisao, resultado);
      if (diag) parecer = diag;
    } catch {}
  }
  return { aprovado: false, parecer };
}

export function resultadoAprovadoPeloCritic(resultado = {}, parecer = null) {
  return resultado?.ok === true && parecer?.aprovado === true;
}

const MUTATING_SHELL = /\b(?:rm|mv|cp|mkdir|touch|chmod|chown|tee|truncate|install|rsync|sed\s+-i|perl\s+-[^\n]*i|git\s+(?:add|commit|push|merge|rebase|reset|apply|checkout|switch)|npm\s+(?:install|i)|pnpm\s+install|yarn\s+add|pm2\s+(?:restart|reload|start|stop|delete)|docker\s+(?:compose\s+)?(?:up|down|restart|rm))\b/i;
const SHELL_REDIRECTION_WRITE = /(?:^|[\s;&|])\d*>>?(?!&)(?=\s*[^\s])/;
const SHELL_PYTHON_WRITE = /(?:python(?:3)?\b[^\n]*\bopen\s*\([^\n]*,[^\n]*['"](?:w|a|x)[+b]?['"]|\bdd\b[^\n]*\bof=)/i;
const SHELL_NODE_FS_WRITE = /\b(?:node|bun)\b[^\n]*(?:(?:node:)?fs|require\s*\(\s*['"](?:node:)?fs['"]\s*\)|from\s+['"](?:node:)?fs['"])[^\n]*\b(?:writeFile(?:Sync)?|appendFile(?:Sync)?|createWriteStream|truncate(?:Sync)?|rm(?:Sync)?|unlink(?:Sync)?|rename(?:Sync)?|copyFile(?:Sync)?|mkdir(?:Sync)?)\b/i;
const BEHAVIOR_TEST_SHELL = /(?:\bnode\s+--test\b|\bnpm\s+(?:test|run\s+test(?=\s|:|$))|\bpnpm\s+(?:test|run\s+test(?=\s|:|$))|\byarn\s+(?:test|run\s+test(?=\s|:|$))|\bbun\s+test\b|\bdeno\s+test\b|\bpytest\b|\bvitest\b|\bjest\b|\bpython(?:3)?\s+-m\s+unittest\b|\bgo\s+test\b|\bcargo\s+test\b|\bdotnet\s+test\b)/i;

function gitMuta(h) {
  if (h?.ferramenta !== 'git') return false;
  const acao = String(h.args?.acao || '').toLowerCase();
  return acao !== '' && acao !== 'status';
}

function handlerMuta(h) {
  if (h?.ferramenta !== 'handler') return false;
  const acao = String(h.args?.acao || '').toLowerCase();
  if (acao === 'deploy' || acao === 'webhook') return true;
  if (acao !== 'http') return false;
  const metodo = String(h.args?.metodo || h.args?.method || 'GET').toUpperCase();
  return !['GET', 'HEAD'].includes(metodo);
}

function shellMuta(comando) {
  const cmd = String(comando || '');
  return MUTATING_SHELL.test(cmd)
    || SHELL_REDIRECTION_WRITE.test(cmd)
    || SHELL_PYTHON_WRITE.test(cmd)
    || SHELL_NODE_FS_WRITE.test(cmd);
}

function classificarMutacao(h, index) {
  if (!h) return null;
  if (h.ferramenta === 'escrever_arquivo') return { index, kind: 'LOCAL', step: h };
  if (h.ferramenta === 'shell' && shellMuta(h.args?.comando)) return { index, kind: 'LOCAL', step: h };
  if (h.ferramenta === 'git' && gitMuta(h)) return { index, kind: 'GIT_REMOTE', step: h };
  if (h.ferramenta === 'aprender') return { index, kind: 'KNOWLEDGE', step: h };
  if (handlerMuta(h)) return { index, kind: 'REMOTE_HANDLER', step: h };
  return null;
}

function listarMutacoes(historico) {
  const out = [];
  for (let i = 0; i < historico.length; i++) {
    const m = classificarMutacao(historico[i], i);
    if (m) out.push(m);
  }
  return out;
}

function indiceTesteComportamentalDepois(historico, depoisDe) {
  for (let i = Math.max(0, depoisDe + 1); i < historico.length; i++) {
    const h = historico[i] || {};
    if (h.ok !== true || h.critic) continue;
    if (h.ferramenta === 'shell' && BEHAVIOR_TEST_SHELL.test(String(h.args?.comando || ''))) return i;
  }
  return -1;
}

function indiceProvaGit(historico, mutacao) {
  for (let i = mutacao.index; i < historico.length; i++) {
    const h = historico[i] || {};
    if (h.ok !== true || h.critic || h.ferramenta !== 'git') continue;
    if (String(h.args?.acao || '') !== 'commit_push') continue;
    if (/REMOTE_HEAD_VERIFIED=[0-9a-f]{40}/i.test(String(h.resultado || ''))) return i;
  }
  return -1;
}

function indiceProvaKnowledge(historico, mutacao) {
  const categoria = String(mutacao.step.args?.categoria || 'geral').toLowerCase();
  const licao = String(mutacao.step.args?.licao || '').trim();
  for (let i = mutacao.index; i < historico.length; i++) {
    const h = historico[i] || {};
    if (h.ok !== true || h.critic || h.ferramenta !== 'aprender') continue;
    if (String(h.args?.categoria || 'geral').toLowerCase() !== categoria) continue;
    if (String(h.args?.licao || '').trim() !== licao) continue;
    if (/LEARNING_PERSISTENCE_VERIFIED=true/.test(String(h.resultado || ''))) return i;
  }
  return -1;
}

function contratoRemoteHandler(historico, mutacao) {
  const targetAction = String(mutacao.step.args?.acao || '').toLowerCase();
  const targetUrl = String(mutacao.step.args?.url || '').trim();
  for (let i = mutacao.index; i < historico.length; i++) {
    const h = historico[i] || {};
    if (h.ferramenta !== 'handler' || !handlerMuta(h)) continue;
    if (String(h.args?.acao || '').toLowerCase() !== targetAction) continue;
    if (String(h.args?.url || '').trim() !== targetUrl) continue;
    const verifyUrl = String(h.args?.verify_url || '').trim();
    const verifyContains = String(h.args?.verify_contains || '').trim();
    if (verifyUrl && verifyContains) return { mutation_index: i, verifyUrl, verifyContains };
  }
  return null;
}

function indiceProvaRemoteHandler(historico, mutacao) {
  const contrato = contratoRemoteHandler(historico, mutacao);
  if (!contrato) return -1;
  for (let i = contrato.mutation_index + 1; i < historico.length; i++) {
    const h = historico[i] || {};
    if (h.ok !== true || h.critic || h.ferramenta !== 'handler') continue;
    if (String(h.args?.acao || '').toLowerCase() !== 'http') continue;
    const metodo = String(h.args?.metodo || h.args?.method || 'GET').toUpperCase();
    if (metodo !== 'GET') continue;
    if (String(h.args?.url || '').trim() !== contrato.verifyUrl) continue;
    if (!String(h.resultado || '').includes(contrato.verifyContains)) continue;
    return i;
  }
  return -1;
}

function provarMutacao(historico, mutacao) {
  if (mutacao.kind === 'LOCAL') {
    const index = indiceTesteComportamentalDepois(historico, mutacao.index);
    return { ok: index >= 0, proof_index: index, proof_kind: 'BEHAVIOR_TEST' };
  }
  if (mutacao.kind === 'GIT_REMOTE') {
    const index = indiceProvaGit(historico, mutacao);
    return { ok: index >= 0, proof_index: index, proof_kind: 'REMOTE_HEAD_READBACK' };
  }
  if (mutacao.kind === 'KNOWLEDGE') {
    const index = indiceProvaKnowledge(historico, mutacao);
    return { ok: index >= 0, proof_index: index, proof_kind: 'DUAL_STORE_READBACK' };
  }
  if (mutacao.kind === 'REMOTE_HANDLER') {
    const index = indiceProvaRemoteHandler(historico, mutacao);
    return { ok: index >= 0, proof_index: index, proof_kind: 'REMOTE_POSTCONDITION' };
  }
  return { ok: false, proof_index: -1, proof_kind: 'UNKNOWN' };
}

function avaliarMutacoes(historico) {
  const mutacoes = listarMutacoes(historico);
  const proofs = [];
  const problems = [];
  for (const m of mutacoes) {
    const p = provarMutacao(historico, m);
    proofs.push({ mutation_index: m.index, mutation_step_ok: m.step.ok === true, kind: m.kind, ...p });
    if (p.ok) continue;
    if (m.kind === 'LOCAL') problems.push(`mutação sem teste comportamental bem-sucedido posterior (etapa=${m.index})`);
    else if (m.kind === 'GIT_REMOTE') problems.push(`git remoto sem confirmação REMOTE_HEAD_VERIFIED (etapa=${m.index})`);
    else if (m.kind === 'KNOWLEDGE') problems.push(`aprendizado sem confirmação LEARNING_PERSISTENCE_VERIFIED (etapa=${m.index})`);
    else if (m.kind === 'REMOTE_HANDLER') problems.push(`mutação remota sem pós-condição verificável: exigir verify_url + verify_contains e GET posterior correspondente (etapa=${m.index})`);
    else problems.push(`mutação sem prova reconhecida (etapa=${m.index})`);
  }
  return { mutacoes, proofs, problems };
}

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

export function auditarFinalizacao({ missao = '', decisao = {}, historico = [] } = {}) {
  const problemas = [];
  const resumo = String(decisao?.args?.mensagem || decisao?.pensamento || '').trim();
  const ultimo = historico.length ? historico[historico.length - 1] : null;
  const mut = avaliarMutacoes(historico);
  const ultimaMutacao = mut.mutacoes.length ? mut.mutacoes[mut.mutacoes.length - 1] : null;
  const ultimaProva = ultimaMutacao ? mut.proofs.find(p => p.mutation_index === ultimaMutacao.index) : null;
  const locais = mut.proofs.filter(p => p.kind === 'LOCAL');
  const estadoSemantico = String(decisao?.estado || '').trim().toUpperCase();

  if (decisao?.terminou !== true) problemas.push('decisor não propôs conclusão');
  if (estadoSemantico !== 'FATO') problemas.push(`estado semântico final não resolvido: ${estadoSemantico || 'AUSENTE'}`);
  if (decisao?.ferramenta !== 'notificar_progresso') problemas.push('conclusão deve usar notificar_progresso');
  if (!resumo) problemas.push('resumo final ausente');
  if (!historico.length) problemas.push('histórico vazio: nenhuma ação/evidência observada');
  if (ultimo && ultimo.ok !== true) problemas.push('última etapa não está aprovada');
  if (ultimo?.critic) problemas.push('última etapa possui reprovação do Critic');
  problemas.push(...mut.problems);

  const receipt = {
    schema_version: 2,
    gate: 'HERMES_FINALIZATION_CRITIC',
    status: problemas.length ? 'BLOCKED' : 'PASS',
    semantic_state: estadoSemantico || null,
    mission_sha256: sha256(missao),
    history_sha256: sha256(JSON.stringify(historico)),
    decision_model: decisao?._modelo_usado || null,
    history_entries: historico.length,
    last_step_index: historico.length ? historico.length - 1 : -1,
    last_mutation_index: ultimaMutacao?.index ?? -1,
    behavior_test_after_mutation_index: ultimaMutacao?.kind === 'LOCAL' ? (ultimaProva?.proof_index ?? -1) : -1,
    mutations_total: mut.mutacoes.length,
    mutation_proofs: mut.proofs,
    unproven_mutations: mut.proofs.filter(p => !p.ok).map(p => ({ mutation_index: p.mutation_index, kind: p.kind })),
    checks: {
      completion_proposed: decisao?.terminou === true,
      semantic_state_fact: estadoSemantico === 'FATO',
      completion_tool_valid: decisao?.ferramenta === 'notificar_progresso',
      summary_present: Boolean(resumo),
      history_present: historico.length > 0,
      last_step_ok: Boolean(ultimo && ultimo.ok === true),
      last_step_critic_clear: Boolean(ultimo && !ultimo.critic),
      mutation_has_later_behavior_test: locais.every(p => p.ok),
      all_mutations_proved: mut.proofs.every(p => p.ok),
    },
    problems: problemas,
  };

  return { aprovado: problemas.length === 0, parecer: problemas.length ? problemas.join('; ') : 'gate final aprovado', receipt };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const decisao = { ferramenta: 'shell', args: { comando: 'exemplo' } };
  const resultado = { ok: false, saida: process.argv[2] || 'erro de teste' };
  auditar(decisao, resultado).then(r => console.log(JSON.stringify(r, null, 2)));
}
