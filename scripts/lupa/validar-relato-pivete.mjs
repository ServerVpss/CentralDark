#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FULL_HEADERS = Object.freeze([
  '🧠 CENTRALDARK — ESTADO DA MISSÃO',
  '🎯 VEREDITO=',
  '📊 PROGRESSO=',
  '✅ O QUE JÁ ESTÁ PRONTO=',
  '🟡 O QUE ESTÁ PARCIAL=',
  '❌ O QUE AINDA FALTA=',
  '🚫 BLOQUEADORES=',
  '⚠️ PENDÊNCIAS NÃO BLOQUEANTES=',
  '🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=',
  '🔎 PROVA=',
  '🧭 FLUXO VISUAL=',
  '🗣️ PAPO RETO DO PIVETE=',
  '➡️ PRÓXIMO GATE=',
  '🧰 COMANDO CIRÚRGICO=',
  '🧪 COLETA DO CHEFE=',
  '👑 AÇÃO DO CHEFE=',
  '🛡️ O QUE NÃO FOI TOCADO=',
]);

const SHORT_HEADERS = Object.freeze([
  '🎯 VEREDITO=',
  '📊 PROGRESSO=',
  '🔎 PROVA=',
  '➡️ PRÓXIMO GATE=',
  '👑 AÇÃO DO CHEFE=',
]);

const STATUS_POINTS = Object.freeze({
  PASS: 100,
  PARTIAL: 50,
  FAIL: 0,
  BLOCKED: 0,
  PENDING: 0,
  UNKNOWN: 0,
  SKIPPED: 0,
  TIMEOUT: 0,
});
const REPORT_SITUATIONS = new Set(['PASS', 'PARTIAL_COM_PROVA', 'BLOCKED', 'UNKNOWN']);
const EMITTER_ROLES = new Set(['WRITER', 'REVIEWER', 'JUDGE', 'COORDINATOR', 'READ_ONLY']);
const SHA40 = /^[0-9a-f]{40}$/i;
const PLACEHOLDER = /^(?:<[^>]+>|NÃO_INFORMAD[OA]|PREENCHER|TODO|TBD|UNKNOWN|UNRESOLVED|.*A DEFINIR.*)$/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalize(text) {
  return String(text || '').replace(/\r\n/g, '\n').trim();
}

function stripHtmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, '');
}

function stripFencedBlocks(text) {
  return text.replace(/```[\s\S]*?```/g, '');
}

function semanticText(text) {
  return stripFencedBlocks(stripHtmlComments(text));
}

function headerMatches(line, header) {
  const trimmed = line.trim();
  if (header === FULL_HEADERS[0]) return trimmed.includes(header);
  return trimmed.startsWith(header);
}

function requireOrderedHeaders(text, headers) {
  const lines = semanticText(text).split('\n');
  let previous = -1;
  const positions = new Map();
  for (const header of headers) {
    const hits = [];
    lines.forEach((line, index) => { if (headerMatches(line, header)) hits.push(index); });
    assert(hits.length > 0, `REPORT_HEADER_MISSING:${header}`);
    assert(hits.length === 1, `REPORT_HEADER_DUPLICATED:${header}:${hits.length}`);
    assert(hits[0] > previous, `REPORT_HEADER_ORDER_INVALID:${header}`);
    previous = hits[0];
    positions.set(header, hits[0]);
  }
  return positions;
}

function uniqueFieldValue(text, field) {
  const pattern = new RegExp(`^${field}\\s*=\\s*(.*)$`, 'i');
  const hits = semanticText(text).split('\n')
    .map((line) => line.trim().match(pattern))
    .filter(Boolean);
  assert(hits.length > 0, `REPORT_FIELD_MISSING:${field}`);
  assert(hits.length === 1, `REPORT_FIELD_DUPLICATED:${field}:${hits.length}`);
  return hits[0][1].trim();
}

function inlineHeaderValue(text, header) {
  const hits = semanticText(text).split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith(header));
  assert(hits.length === 1, `REPORT_INLINE_HEADER_INVALID:${header}:${hits.length}`);
  return hits[0].slice(header.length).trim();
}

function parseGatesJson(raw) {
  let gates;
  try { gates = JSON.parse(raw); }
  catch { throw new Error('REPORT_GATES_JSON_INVALID'); }
  assert(Array.isArray(gates) && gates.length > 0, 'REPORT_GATES_EMPTY');
  const ids = new Set();
  let earned = 0;
  for (const gate of gates) {
    assert(gate && typeof gate === 'object' && !Array.isArray(gate), 'REPORT_GATE_NOT_OBJECT');
    assert(typeof gate.id === 'string' && gate.id.trim().length > 0, 'REPORT_GATE_ID_INVALID');
    assert(!ids.has(gate.id), `REPORT_GATE_DUPLICATED:${gate.id}`);
    ids.add(gate.id);
    assert(typeof gate.status === 'string' && Object.hasOwn(STATUS_POINTS, gate.status), `REPORT_GATE_STATUS_INVALID:${gate.id}`);
    assert(gate.pontos === STATUS_POINTS[gate.status], `REPORT_GATE_POINTS_INVALID:${gate.id}:${gate.pontos}:${STATUS_POINTS[gate.status]}`);
    assert(typeof gate.prova === 'string' && gate.prova.trim().length > 0, `REPORT_GATE_PROOF_MISSING:${gate.id}`);
    earned += gate.pontos;
  }
  return { gates, earned, total: gates.length * 100, percent: Number(((earned / (gates.length * 100)) * 100).toFixed(1)) };
}

function parseMeasuredProgress(text, mode) {
  const clean = semanticText(text);
  const measured = mode === 'short'
    ? clean.match(/MEDIDO\s*:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)%/i)
    : clean.match(/^PERCENTUAL_MEDIDO\s*=\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)%$/im);
  assert(measured, 'REPORT_MEASURED_PERCENT_MISSING');

  const rawGates = mode === 'short'
    ? clean.match(/GATES_JSON\s*:\s*(\[[^\n]*?\])\s*;\s*MEDIDO/i)?.[1]
    : uniqueFieldValue(clean, 'GATES_MEDIDOS_JSON');
  assert(rawGates, 'REPORT_GATES_JSON_MISSING');
  const derived = parseGatesJson(rawGates);
  const earned = Number(measured[1]);
  const total = Number(measured[2]);
  const percent = Number(measured[3]);
  assert(total > 0, 'REPORT_PERCENT_TOTAL_ZERO');
  assert(earned >= 0 && earned <= total, 'REPORT_PERCENT_POINTS_INVALID');
  const calculated = Number(((earned / total) * 100).toFixed(1));
  assert(Math.abs(calculated - percent) < 0.11, `REPORT_PERCENT_MISMATCH:${earned}/${total}:${percent}:${calculated}`);
  assert(earned === derived.earned && total === derived.total && Math.abs(percent - derived.percent) < 0.11,
    `REPORT_GATES_PERCENT_MISMATCH:${earned}/${total}:${percent}:${derived.earned}/${derived.total}:${derived.percent}`);
  return { earned, total, percent, gates: derived.gates };
}

function validateEstimate(text, mode) {
  if (mode === 'short') return;
  const value = uniqueFieldValue(text, 'ESTIMATIVA');
  const scope = uniqueFieldValue(text, 'ESCOPO_DA_ESTIMATIVA');
  const measuredScope = uniqueFieldValue(text, 'ESCOPO_MEDIDO');
  assert(!/(estim|previs|proje|hip[oó]t)/i.test(measuredScope), 'REPORT_ESTIMATE_INSIDE_MEASURED_SCOPE');
  if (value !== 'NÃO_CALCULADA') {
    assert(/^\d+(?:\.\d+)?%$/.test(value), 'REPORT_ESTIMATE_INVALID');
    assert(scope !== 'NÃO_APLICÁVEL', 'REPORT_ESTIMATE_SCOPE_NOT_DECLARED');
  }
}

function sectionBetween(text, startHeader, endHeader) {
  const clean = stripHtmlComments(text);
  const start = clean.indexOf(startHeader);
  const end = clean.indexOf(endHeader, start + startHeader.length);
  assert(start >= 0 && end > start, `REPORT_SECTION_INVALID:${startHeader}`);
  return clean.slice(start + startHeader.length, end).trim();
}

function validateVisualFlow(text, mode) {
  if (mode === 'short') return;
  const required = uniqueFieldValue(text, 'DIAGRAMA_OBRIGATÓRIO');
  const reason = uniqueFieldValue(text, 'MOTIVO');
  assert(/^(SIM|NÃO)$/i.test(required), 'REPORT_DIAGRAM_REQUIRED_INVALID');
  assert(reason.length >= 5, 'REPORT_DIAGRAM_REASON_MISSING');
  const section = sectionBetween(text, '🧭 FLUXO VISUAL=', '🗣️ PAPO RETO DO PIVETE=');
  if (required.toUpperCase() === 'SIM') {
    assert(/```mermaid[\s\S]*?sequenceDiagram[\s\S]*?```/i.test(section), 'REPORT_MERMAID_SEQUENCE_MISSING');
    assert(!/(TOKEN|PASSWORD|SECRET|AUTHORIZATION|COOKIE|PRIVATE[_ -]?KEY)\s*[:=]/i.test(section), 'REPORT_DIAGRAM_SECRET_PATTERN');
  } else assert(/NÃO_APLICÁVEL/i.test(section), 'REPORT_DIAGRAM_NOT_APPLICABLE_MISSING');
}

function validateCollection(text, mode) {
  if (mode === 'short') return;
  const section = sectionBetween(text, '🧪 COLETA DO CHEFE=', '👑 AÇÃO DO CHEFE=');
  if (/^NENHUMA\s*$/i.test(section)) return;
  const fences = section.match(/```/g) || [];
  assert(fences.length === 2, 'REPORT_COLLECTION_SINGLE_SCRIPT_REQUIRED');
  assert(/E:\\CentralDark\\Pivete\\TEMP/i.test(section), 'REPORT_COLLECTION_TEMP_PATH_MISSING');
  assert(/read[- ]only|somente leitura/i.test(section), 'REPORT_COLLECTION_NOT_READ_ONLY');
  const protectedAction = /\b(?:pm2|systemctl|docker)\s+(?:restart|stop|start|rm)|\brm\s+-rf\b|git\s+push\s+--force|\bgit\s+merge\b|\bdeploy\b/i.test(section);
  if (protectedAction) {
    assert(/AUTORIZAÇÃO_EXPLÍCITA\s*=\s*SIM/i.test(section), 'REPORT_COLLECTION_PROTECTED_ACTION');
    assert(/ALVO_EXATO\s*=\s*\S+/i.test(section), 'REPORT_COLLECTION_TARGET_MISSING');
  }
}

function blockerSection(text) {
  return sectionBetween(text, '🚫 BLOQUEADORES=', '⚠️ PENDÊNCIAS NÃO BLOQUEANTES=');
}

function validateEmitter(text, mode) {
  if (mode === 'short') {
    const proof = inlineHeaderValue(text, '🔎 PROVA=');
    const emitter = proof.match(/(?:^|;)\s*EMISSOR\s*:\s*([^;]+)/i)?.[1]?.trim();
    const role = proof.match(/(?:^|;)\s*PAPEL\s*:\s*([^;]+)/i)?.[1]?.trim()?.toUpperCase();
    assert(emitter && !PLACEHOLDER.test(emitter), 'REPORT_EMITTER_MISSING');
    assert(role && EMITTER_ROLES.has(role), 'REPORT_EMITTER_ROLE_INVALID');
    return { emitter, role };
  }
  const emitter = uniqueFieldValue(text, 'EMISSOR');
  const role = uniqueFieldValue(text, 'PAPEL_DO_EMISSOR').toUpperCase();
  assert(emitter && !PLACEHOLDER.test(emitter), 'REPORT_EMITTER_MISSING');
  assert(EMITTER_ROLES.has(role), 'REPORT_EMITTER_ROLE_INVALID');
  const authorship = semanticText(text).split('\n').filter((line) => /^AUTORIA_DO_PADRÃO\s*=/i.test(line.trim()));
  assert(authorship.length === 1, `REPORT_AUTHORSHIP_NOT_UNIQUE:${authorship.length}`);
  assert(/^AUTORIA_DO_PADRÃO\s*=\s*SEGREDO\/CHEFE\s*$/i.test(authorship[0].trim()), 'REPORT_AUTHORSHIP_INVALID');
  if (['REVIEWER', 'JUDGE', 'READ_ONLY'].includes(role)) {
    assert(!/(?:ASSUM[EO]|ATU[AO])[^\n]{0,60}\b(?:WRITER|PROMOTOR)\b/i.test(semanticText(text)), 'REPORT_REVIEWER_ROLE_ESCALATION');
  }
  return { emitter, role };
}

function validateShortSemantics(text, progress) {
  const progressLine = inlineHeaderValue(text, '📊 PROGRESSO=');
  const situation = progressLine.match(/(?:^|;)\s*SITUAÇÃO\s*:\s*([^;]+)/i)?.[1]?.trim()?.toUpperCase();
  assert(situation && REPORT_SITUATIONS.has(situation), 'REPORT_SITUATION_INVALID');
  if (situation === 'PASS') assert(progress.percent === 100, 'REPORT_PASS_WITHOUT_100_PERCENT');
  if (situation === 'BLOCKED') {
    const verdict = inlineHeaderValue(text, '🎯 VEREDITO=');
    const next = inlineHeaderValue(text, '➡️ PRÓXIMO GATE=');
    assert(/bloque|imped|falh|pendên/i.test(`${verdict} ${next}`), 'REPORT_SHORT_BLOCKER_MISSING');
  }
  validateEmitter(text, 'short');
}

function validateFullSemantics(text, progress, mode) {
  const measuredScope = uniqueFieldValue(text, 'ESCOPO_MEDIDO');
  assert(measuredScope.length > 3, 'REPORT_MEASURED_SCOPE_MISSING');
  const situation = uniqueFieldValue(text, 'SITUAÇÃO').toUpperCase();
  assert(REPORT_SITUATIONS.has(situation), 'REPORT_SITUATION_INVALID');
  const operational = uniqueFieldValue(text, 'OPERACIONAL').toUpperCase();
  const complete = uniqueFieldValue(text, 'COMPLETO').toUpperCase();
  assert(/^(SIM|NÃO)$/.test(operational), 'REPORT_OPERATIONAL_INVALID');
  assert(/^(SIM|NÃO)$/.test(complete), 'REPORT_COMPLETE_INVALID');
  if (situation === 'PASS') {
    assert(progress.percent === 100, 'REPORT_PASS_WITHOUT_100_PERCENT');
    assert(operational === 'SIM' && complete === 'SIM', 'REPORT_PASS_STATE_INCOHERENT');
  }
  if (['BLOCKED', 'UNKNOWN'].includes(situation)) {
    assert(operational === 'NÃO', 'REPORT_BLOCKED_MARKED_OPERATIONAL');
    if (situation === 'BLOCKED') assert(!/^[-\s]*NENHUM\s*$/i.test(blockerSection(text)), 'REPORT_BLOCKER_MISSING');
  }
  if (complete === 'SIM') assert(progress.percent === 100, 'REPORT_COMPLETE_WITHOUT_100_PERCENT');

  for (const field of ['ERRO', 'CAUSA', 'CORREÇÃO', 'TESTE_DA_CICATRIZ', 'REGRESSÃO']) uniqueFieldValue(text, field);
  for (const field of ['REPOSITÓRIO', 'PR_OU_ISSUE', 'BRANCH', 'HEAD', 'CHECKS', 'TESTES', 'RECEIPT', 'FONTE_DA_PROVA']) uniqueFieldValue(text, field);
  const emitter = validateEmitter(text, mode);
  validateCollection(text, mode);

  if (mode === 'pr') {
    const repository = uniqueFieldValue(text, 'REPOSITÓRIO');
    const pr = uniqueFieldValue(text, 'PR_OU_ISSUE');
    const branch = uniqueFieldValue(text, 'BRANCH');
    const head = uniqueFieldValue(text, 'HEAD');
    assert(repository === 'ServerVpss/CentralDark', 'PR_REPORT_REPOSITORY_INVALID');
    assert(pr && !PLACEHOLDER.test(pr), 'PR_REPORT_REFERENCE_PLACEHOLDER');
    assert(branch && !PLACEHOLDER.test(branch), 'PR_REPORT_BRANCH_PLACEHOLDER');
    assert(head && SHA40.test(head) && head !== '0'.repeat(40), 'PR_REPORT_HEAD_INVALID');
    assert(emitter.role === 'WRITER', 'PR_REPORT_EMITTER_MUST_BE_WRITER');
  }
}

export function validateReport(text, mode = 'full') {
  const normalized = normalize(text);
  assert(['full', 'short', 'pr'].includes(mode), `REPORT_MODE_INVALID:${mode}`);
  assert(normalized.length > 0, 'REPORT_EMPTY');
  requireOrderedHeaders(normalized, mode === 'short' ? SHORT_HEADERS : FULL_HEADERS);
  const progress = parseMeasuredProgress(normalized, mode);
  validateEstimate(normalized, mode);
  validateVisualFlow(normalized, mode);
  if (mode === 'short') validateShortSemantics(normalized, progress);
  else validateFullSemantics(normalized, progress, mode);
  return { valid: true, mode, progress };
}

function argValue(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function main() {
  const args = process.argv.slice(2);
  const input = argValue(args, '--input');
  const mode = argValue(args, '--mode', 'full');
  assert(input, 'REPORT_INPUT_REQUIRED');
  const text = fs.readFileSync(path.resolve(input), 'utf8');
  const result = validateReport(text, mode);
  console.log(JSON.stringify({ REPORT_STATUS: 'PASS', ...result }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); }
  catch (error) { console.error(`REPORT_STATUS=BLOCKED REASON=${error.message}`); process.exitCode = 1; }
}
