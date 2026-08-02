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
  const match = mode === 'full' ? full : (compact || full);
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

function validateEstimate(text, mode) {
  if (mode !== 'full') return;
  const estimate = text.match(/ESTIMATIVA\s*=\s*([^\n]+)/i);
  assert(estimate, 'REPORT_ESTIMATE_FIELD_MISSING');
  const value = estimate[1].trim();
  const scope = text.match(/ESCOPO_DA_ESTIMATIVA\s*=\s*([^\n]+)/i);
  assert(scope, 'REPORT_ESTIMATE_SCOPE_MISSING');
  if (value !== 'NÃO_CALCULADA') {
    assert(/^\d+(?:\.\d+)?%$/.test(value), 'REPORT_ESTIMATE_INVALID');
    assert(scope[1].trim() !== 'NÃO_APLICÁVEL', 'REPORT_ESTIMATE_SCOPE_NOT_DECLARED');
  }
}

function validateFullSemantics(text, progress) {
  const measuredScope = text.match(/ESCOPO_MEDIDO\s*=\s*([^\n]+)/i);
  assert(measuredScope && measuredScope[1].trim().length > 3, 'REPORT_MEASURED_SCOPE_MISSING');

  const situation = text.match(/SITUAÇÃO\s*=\s*(PASS|PARTIAL_COM_PROVA|BLOCKED|UNKNOWN)/i);
  assert(situation, 'REPORT_SITUATION_INVALID');
  const operational = text.match(/OPERACIONAL\s*=\s*(SIM|NÃO)/i);
  const complete = text.match(/COMPLETO\s*=\s*(SIM|NÃO)/i);
  assert(operational, 'REPORT_OPERATIONAL_INVALID');
  assert(complete, 'REPORT_COMPLETE_INVALID');
  if (situation[1].toUpperCase() === 'PASS') assert(progress.percent === 100, 'REPORT_PASS_WITHOUT_100_PERCENT');
  if (complete[1].toUpperCase() === 'SIM') assert(progress.percent === 100, 'REPORT_COMPLETE_WITHOUT_100_PERCENT');

  for (const field of ['ERRO', 'CAUSA', 'CORREÇÃO', 'TESTE_DA_CICATRIZ', 'REGRESSÃO']) {
    assert(new RegExp(`${field}\\s*=`, 'i').test(text), `REPORT_TECH_FIELD_MISSING:${field}`);
  }
  for (const field of ['REPOSITÓRIO', 'PR_OU_ISSUE', 'BRANCH', 'HEAD', 'CHECKS', 'TESTES', 'RECEIPT', 'FONTE_DA_PROVA']) {
    assert(new RegExp(`${field}\\s*=`, 'i').test(text), `REPORT_PROOF_FIELD_MISSING:${field}`);
  }
  assert(/AUTORIA_DO_PADRÃO\s*=\s*SEGREDO\/CHEFE/i.test(text), 'REPORT_AUTHORSHIP_MISSING');
}

export function validateReport(text, mode = 'full') {
  const normalized = normalize(text);
  assert(['full', 'short'].includes(mode), `REPORT_MODE_INVALID:${mode}`);
  assert(normalized.length > 0, 'REPORT_EMPTY');
  requireOrderedHeaders(normalized, mode === 'full' ? FULL_HEADERS : SHORT_HEADERS);
  const progress = parseMeasuredProgress(normalized, mode);
  validateEstimate(normalized, mode);
  if (mode === 'full') validateFullSemantics(normalized, progress);
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
