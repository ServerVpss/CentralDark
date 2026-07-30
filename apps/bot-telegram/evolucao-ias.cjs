#!/usr/bin/env node
/**
 * evolucao-ias.cjs — evolução baseada em fatos do CentralDark.
 *
 * Regra central:
 * - IA disponível: revisa achados produzidos pelo auditor determinístico.
 * - IA indisponível ou resposta inválida: o script continua sozinho e declara MODO SCRIPT.
 * - Nenhuma conversa, fallback ou mensagem aleatória vira aprendizado/XP.
 * - Contribuição só é registrada quando cita finding_id existente e o hash da evidência.
 *
 * A abertura de branch, commit, PR, testes e XP acontece no workflow
 * `.github/workflows/sentinela-divergencias.yml`, com um escritor por vez.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const AUDITOR = path.join(REPO_ROOT, 'scripts', 'evolucao', 'auditar-autonomia.py');
const STATE_FILE = process.env.EVOLUCAO_STATE_FILE || path.join(__dirname, 'evolucao-state.json');
const CHAT_ID = process.env.EVOLUCAO_CHAT_ID || '-5365750004';
const LOOP_MIN_MS = Number(process.env.EVOLUCAO_INTERVAL_MIN_MS || 30 * 60 * 1000);
const LOOP_MAX_MS = Number(process.env.EVOLUCAO_INTERVAL_MAX_MS || 60 * 60 * 1000);

function carregarEnvSeguro() {
  const envPath = process.env.AGENT_ENV_FILE || '/root/CentralDark/secrets/agent.env';
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (/^[A-Z0-9_]+$/.test(key) && value && !process.env[key]) process.env[key] = value;
  }
}
carregarEnvSeguro();

const AGENTES = [
  {
    id: 'gemini',
    nome: 'Gemini',
    model: process.env.DARKAI_MODEL_GEMINI || 'google/gemini-3-flash-preview',
    tokenEnv: 'BOT_TOKEN_GEMINI',
  },
  {
    id: 'gpt',
    nome: 'GPT',
    model: process.env.DARKAI_MODEL_GPT || 'openai/gpt-5.4',
    tokenEnv: 'BOT_TOKEN_GPT',
  },
  {
    id: 'claude',
    nome: 'Claude',
    model: process.env.DARKAI_MODEL_CLAUDE || 'anthropic/claude-sonnet-4.6',
    tokenEnv: 'BOT_TOKEN_CLAUDE',
  },
];

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function lerEstado() {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return {
      schema: 2,
      runs: Number(parsed.runs || 0),
      contributions: Array.isArray(parsed.contributions) ? parsed.contributions.slice(-100) : [],
      lastEvidenceSha: parsed.lastEvidenceSha || '',
    };
  } catch {
    return { schema: 2, runs: 0, contributions: [], lastEvidenceSha: '' };
  }
}

function salvarEstado(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  const temp = `${STATE_FILE}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temp, STATE_FILE);
}

function executarAuditoria() {
  const result = spawnSync('python3', [AUDITOR, '--json-stdout'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 120000,
    env: process.env,
  });
  if (![0, 1].includes(result.status)) {
    throw new Error(`AUDITOR_INDISPONIVEL exit=${result.status} stderr=${String(result.stderr || '').slice(0, 300)}`);
  }
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    throw new Error('AUDITOR_JSON_INVALIDO');
  }
  if (!Array.isArray(report.findings) || typeof report.summary !== 'object') {
    throw new Error('AUDITOR_SCHEMA_INVALIDO');
  }
  report.evidence_sha256 = sha256(canonical({ summary: report.summary, findings: report.findings }));
  return report;
}

function resumoScript(report) {
  const findings = report.findings.slice(0, 5);
  const linhas = [
    'MODO SCRIPT — auditoria determinística; nenhuma IA foi fingida.',
    `Evidência: ${report.evidence_sha256}`,
    `Bloqueadores: ${report.summary.blockers} | Avisos: ${report.summary.warnings}`,
  ];
  if (!findings.length) {
    linhas.push('Resultado: nenhum achado dentro dos gates auditados. Isso não prova áreas fora do escopo.');
  } else {
    linhas.push('Achados:');
    for (const item of findings) linhas.push(`- ${item.id} [${item.severity}] ${item.path}: ${item.title}`);
  }
  linhas.push('Execução técnica, commit, PR, testes e XP ficam a cargo do workflow autossuficiente.');
  return linhas.join('\n');
}

function promptRevisao(report, agente) {
  const achados = report.findings.map((item) => ({
    id: item.id,
    severity: item.severity,
    path: item.path,
    title: item.title,
    evidence: item.evidence,
  }));
  return [
    'Você revisa o CentralDark. Não invente arquivos, testes, commits, runtime ou sucesso.',
    `AGENTE=${agente.id}`,
    `EVIDENCE_SHA256=${report.evidence_sha256}`,
    `ACHADOS=${JSON.stringify(achados)}`,
    'Responda SOMENTE JSON válido com:',
    '{"evidence_sha256":"...","finding_ids":["..."],"analysis":"...","next_action":"..."}',
    'finding_ids deve conter apenas IDs apresentados. Sem achado comprovado, use lista vazia.',
  ].join('\n');
}

function extrairJson(texto) {
  const start = texto.indexOf('{');
  const end = texto.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(texto.slice(start, end + 1)); } catch { return null; }
}

function revisarComIA(report, agente) {
  const probe = spawnSync('bash', ['-lc', 'command -v darkai'], { encoding: 'utf8' });
  if (probe.status !== 0) return { ok: false, reason: 'DARKAI_COMMAND_AUSENTE' };
  const prompt = promptRevisao(report, agente);
  const result = spawnSync('darkai', [
    '--model', agente.model,
    '--system', 'Revisor técnico fail-closed. Fatos e provas acima de eloquência.',
    prompt,
  ], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 180000,
    env: process.env,
  });
  if (result.status !== 0 || !String(result.stdout || '').trim()) {
    return { ok: false, reason: `DARKAI_FALHOU_${result.status}` };
  }
  const parsed = extrairJson(result.stdout);
  if (!parsed || parsed.evidence_sha256 !== report.evidence_sha256 || !Array.isArray(parsed.finding_ids)) {
    return { ok: false, reason: 'RESPOSTA_IA_SEM_RECIBO_VALIDO' };
  }
  const validIds = new Set(report.findings.map((item) => item.id));
  if (parsed.finding_ids.some((id) => !validIds.has(id))) {
    return { ok: false, reason: 'RESPOSTA_IA_INVENTOU_FINDING_ID' };
  }
  if (typeof parsed.analysis !== 'string' || typeof parsed.next_action !== 'string') {
    return { ok: false, reason: 'RESPOSTA_IA_SCHEMA_INVALIDO' };
  }
  return { ok: true, data: parsed };
}

async function enviarTelegram(token, text) {
  if (!token) return { sent: false, reason: 'TOKEN_TELEGRAM_AUSENTE' };
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text.slice(0, 3900),
      disable_web_page_preview: true,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) return { sent: false, reason: `TELEGRAM_HTTP_${response.status}` };
  return { sent: true, messageId: data.result?.message_id || null };
}

function mensagemIA(report, agente, review) {
  return [
    `AGENTE ${agente.nome} — CONTRIBUIÇÃO VALIDADA`,
    `Evidência: ${report.evidence_sha256}`,
    `Finding IDs: ${review.finding_ids.length ? review.finding_ids.join(', ') : 'nenhum'}`,
    `Análise: ${review.analysis}`,
    `Próxima ação: ${review.next_action}`,
    'Observação: esta revisão não recebe XP sozinha. Só pontua se o finding entrar em correção testada e PR rastreável.',
  ].join('\n');
}

function escolherAgente(state) {
  const count = Object.fromEntries(AGENTES.map((agent) => [agent.id, 0]));
  for (const row of state.contributions) if (row.mode === 'IA' && row.agent in count) count[row.agent]++;
  return [...AGENTES].sort((a, b) => count[a.id] - count[b.id] || a.id.localeCompare(b.id))[0];
}

async function executarAgente(report, agente, state, { dryRun = false } = {}) {
  const review = revisarComIA(report, agente);
  let mode = 'SCRIPT';
  let findingIds = report.findings.map((item) => item.id);
  let text = resumoScript(report);
  let token = process.env.BOT_TOKEN_AUTONOMIA || '';
  let reason = review.reason || '';

  if (review.ok) {
    mode = 'IA';
    findingIds = review.data.finding_ids;
    text = mensagemIA(report, agente, review.data);
    token = process.env[agente.tokenEnv] || process.env.BOT_TOKEN_AUTONOMIA || '';
    reason = '';
  }

  const delivery = dryRun ? { sent: false, reason: 'DRY_RUN' } : await enviarTelegram(token, text);
  const contribution = {
    at: new Date().toISOString(),
    agent: mode === 'IA' ? agente.id : 'script',
    mode,
    evidence_sha256: report.evidence_sha256,
    finding_ids: findingIds,
    review_reason: reason,
    telegram_sent: Boolean(delivery.sent),
    telegram_message_id: delivery.messageId || null,
  };
  state.contributions.push(contribution);
  state.contributions = state.contributions.slice(-100);
  state.runs++;
  state.lastEvidenceSha = report.evidence_sha256;
  salvarEstado(state);
  console.log(JSON.stringify({ contribution, delivery, report: report.summary }, null, 2));
  return contribution;
}

function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function nextInterval() { return Math.floor(LOOP_MIN_MS + Math.random() * Math.max(1, LOOP_MAX_MS - LOOP_MIN_MS)); }

async function ciclo(options = {}) {
  const state = lerEstado();
  const report = executarAuditoria();
  const agentes = options.all ? AGENTES : [escolherAgente(state)];
  for (const agente of agentes) await executarAgente(report, agente, state, options);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const options = { all: args.has('--all'), dryRun: args.has('--test') || args.has('--dry-run') };
  if (args.has('--loop')) {
    while (true) {
      try { await ciclo(options); } catch (error) { console.error(`[evolucao-ias] ${error.message}`); }
      await delay(nextInterval());
    }
  } else {
    await ciclo(options);
  }
}

main().catch((error) => {
  console.error(`[evolucao-ias] FATAL ${error.stack || error.message}`);
  process.exit(2);
});
