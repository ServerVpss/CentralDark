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

const SHA40 = /^[0-9a-f]{40}$/i;
const PLACEHOLDER = /^(?:<[^>]+>|NÃO_INFORMAD[OA]|PREENCHER|TODO|TBD|UNKNOWN|UNRESOLVED|.*A DEFINIR.*)$/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalize(text) {
  return String(text || '').replace(/\r\n/g, '\n').trim();
}

function requireOrderedHeaders(text, headers) {
  let previous = -1;
  for (const header of headers) {
    const current = text.indexOf(header);
    assert(current >= 0, `REPORT_HEADER_MISSING:${header}`);
    assert(current > previous, `REPORT_HEADER_ORDER_INVALID:${header}`);
    previous = current;
  }
}

function parseMeasuredProgress(text, mode) {
  const full = text.match(/PERCENTUAL_MEDIDO\s*=\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)%/i);
  const compact = text.match(/MEDIDO\s*:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)%/i);
  const match = mode === 'short' ? (compact || full) : full;
  assert(match, 'REPORT_MEASURED_PERCENT_MISSING');
  const earned = Number(match[1]);
  const total = Number(match[2]);
  const percent = Number(match[3]);
  assert(total > 0, 'REPORT_PERCENT_TOTAL_ZERO');
  assert(earned >= 0 && earned <= total, 'REPORT_PERCENT_POINTS_INVALID');
  const calculated = Number(((earned / total) * 100).toFixed(1));
  assert(Math.abs(calculated - percent) < 0.11, `REPORT_PERCENT_MISMATCH:${earned}/${total}:${percent}:${calculated}`);
  return { earned, total, percent };
}

function fieldValue(text, field) {
  const match = text.match(new RegExp(`^${field}\\s*=\\s*(.+)$`, 'im'));
  return match ? match[1].trim() : null;
}

function validateEstimate(text, mode) {
  if (mode === 'short') return;
  const value = fieldValue(text, 'ESTIMATIVA');
  const scope = fieldValue(text, 'ESCOPO_DA_ESTIMATIVA');
  assert(value, 'REPORT_ESTIMATE_FIELD_MISSING');
  assert(scope, 'REPORT_ESTIMATE_SCOPE_MISSING');
  if (value !== 'NÃO_CALCULADA') {
    assert(/^\d+(?:\.\d+)?%$/.test(value), 'REPORT_ESTIMATE_INVALID');
    assert(scope !== 'NÃO_APLICÁVEL', 'REPORT_ESTIMATE_SCOPE_NOT_DECLARED');
  }
}

function validateVisualFlow(text, mode) {
  if (mode === 'short') return;
  const required = fieldValue(text, 'DIAGRAMA_OBRIGATÓRIO');
  const reason = fieldValue(text, 'MOTIVO');
  assert(required && /^(SIM|NÃO)$/i.test(required), 'REPORT_DIAGRAM_REQUIRED_INVALID');
  assert(reason && reason.length >= 5, 'REPORT_DIAGRAM_REASON_MISSING');

  const flowStart = text.indexOf('🧭 FLUXO VISUAL=');
  const flowEnd = text.indexOf('🗣️ PAPO RETO DO PIVETE=', flowStart);
  assert(flowStart >= 0 && flowEnd > flowStart, 'REPORT_DIAGRAM_SECTION_INVALID');
  const section = text.slice(flowStart, flowEnd);

  if (required.toUpperCase() === 'SIM') {
    assert(/```mermaid[\s\S]*?sequenceDiagram[\s\S]*?```/i.test(section), 'REPORT_MERMAID_SEQUENCE_MISSING');
    assert(!/(TOKEN|PASSWORD|SECRET|AUTHORIZATION|COOKIE|PRIVATE[_ -]?KEY)\s*[:=]/i.test(section), 'REPORT_DIAGRAM_SECRET_PATTERN');
  } else {
    assert(/NÃO_APLICÁVEL/i.test(section), 'REPORT_DIAGRAM_NOT_APPLICABLE_MISSING');
  }
}

function validateFullSemantics(text, progress, mode) {
  const measuredScope = fieldValue(text, 'ESCOPO_MEDIDO');
  assert(measuredScope && measuredScope.length > 3, 'REPORT_MEASURED_SCOPE_MISSING');

  const situation = fieldValue(text, 'SITUAÇÃO');
  assert(situation && /^(PASS|PARTIAL_COM_PROVA|BLOCKED|UNKNOWN)$/i.test(situation), 'REPORT_SITUATION_INVALID');
  const operational = fieldValue(text, 'OPERACIONAL');
  const complete = fieldValue(text, 'COMPLETO');
  assert(operational && /^(SIM|NÃO)$/i.test(operational), 'REPORT_OPERATIONAL_INVALID');
  assert(complete && /^(SIM|NÃO)$/i.test(complete), 'REPORT_COMPLETE_INVALID');
  if (situation.toUpperCase() === 'PASS') assert(progress.percent === 100, 'REPORT_PASS_WITHOUT_100_PERCENT');
  if (complete.toUpperCase() === 'SIM') assert(progress.percent === 100, 'REPORT_COMPLETE_WITHOUT_100_PERCENT');

  for (const field of ['ERRO', 'CAUSA', 'CORREÇÃO', 'TESTE_DA_CICATRIZ', 'REGRESSÃO']) {
    assert(fieldValue(text, field) !== null, `REPORT_TECH_FIELD_MISSING:${field}`);
  }
  for (const field of ['REPOSITÓRIO', 'PR_OU_ISSUE', 'BRANCH', 'HEAD', 'CHECKS', 'TESTES', 'RECEIPT', 'FONTE_DA_PROVA']) {
    assert(fieldValue(text, field) !== null, `REPORT_PROOF_FIELD_MISSING:${field}`);
  }
  assert(/AUTORIA_DO_PADRÃO\s*=\s*SEGREDO\/CHEFE/i.test(text), 'REPORT_AUTHORSHIP_MISSING');

  if (mode === 'pr') {
    const repository = fieldValue(text, 'REPOSITÓRIO');
    const pr = fieldValue(text, 'PR_OU_ISSUE');
    const branch = fieldValue(text, 'BRANCH');
    const head = fieldValue(text, 'HEAD');
    assert(repository === 'ServerVpss/CentralDark', 'PR_REPORT_REPOSITORY_INVALID');
    assert(pr && !PLACEHOLDER.test(pr), 'PR_REPORT_REFERENCE_PLACEHOLDER');
    assert(branch && !PLACEHOLDER.test(branch), 'PR_REPORT_BRANCH_PLACEHOLDER');
    assert(head && SHA40.test(head) && head !== '0'.repeat(40), 'PR_REPORT_HEAD_INVALID');
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
  if (mode !== 'short') validateFullSemantics(normalized, progress, mode);
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
  try {
    main();
  } catch (error) {
    console.error(`REPORT_STATUS=BLOCKED REASON=${error.message}`);
    process.exitCode = 1;
  }
}
