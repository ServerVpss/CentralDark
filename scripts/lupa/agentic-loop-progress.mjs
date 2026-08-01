#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const STATUS_POINTS = Object.freeze({
  PASS: 100,
  PARTIAL: 50,
  FAIL: 0,
  BLOCKED: 0,
  PENDING: 0,
  UNKNOWN: 0,
  SKIPPED: 0,
  TIMEOUT: 0,
});

export const REQUIRED_GATE_IDS = Object.freeze([
  'VISUAL_PACKAGE_MANIFEST',
  'ZIP_PRESENT_IN_REPOSITORY',
  'CANONICAL_SKILL_VERSIONED',
  'CI_GATE_ENFORCED',
  'CI_FAILURE_VISIBLE_IN_PR',
  'AGENT_READS_FAILED_LOG',
  'AUTOMATIC_REPAIR_REPUSH',
  'GLOBAL_PROGRESS_REPORT',
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function validateSnapshot(snapshot) {
  assert(snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot), 'SNAPSHOT_NOT_OBJECT');
  assert(snapshot.schema_version === 1, 'SCHEMA_VERSION_INVALID');
  assert(snapshot.package_id === 'CENTRALDARK-AGENTIC-LOOP-4K', 'PACKAGE_ID_INVALID');
  assert(snapshot.source_of_truth === 'ServerVpss/CentralDark', 'SOURCE_OF_TRUTH_INVALID');
  assert(Array.isArray(snapshot.gates), 'GATES_NOT_ARRAY');

  const ids = new Set();
  for (const gate of snapshot.gates) {
    assert(gate && typeof gate === 'object' && !Array.isArray(gate), 'GATE_NOT_OBJECT');
    assert(typeof gate.id === 'string' && gate.id.length > 0, 'GATE_ID_INVALID');
    assert(!ids.has(gate.id), `GATE_DUPLICATED:${gate.id}`);
    ids.add(gate.id);
    assert(Object.hasOwn(STATUS_POINTS, gate.status), `GATE_STATUS_INVALID:${gate.id}:${gate.status}`);
    assert(Array.isArray(gate.evidence) && gate.evidence.length > 0, `GATE_WITHOUT_EVIDENCE:${gate.id}`);
    assert(gate.evidence.every((item) => typeof item === 'string' && item.trim().length > 0), `GATE_EVIDENCE_INVALID:${gate.id}`);
    assert(typeof gate.next_step === 'string', `GATE_NEXT_STEP_INVALID:${gate.id}`);
  }

  for (const required of REQUIRED_GATE_IDS) {
    assert(ids.has(required), `REQUIRED_GATE_MISSING:${required}`);
  }
  return true;
}

export function calculateProgress(snapshot) {
  validateSnapshot(snapshot);
  const total = snapshot.gates.length * 100;
  const earned = snapshot.gates.reduce((sum, gate) => sum + STATUS_POINTS[gate.status], 0);
  const percent = Number(((earned / total) * 100).toFixed(1));
  return { earned, total, percent };
}

export function formatPiveteReport(snapshot) {
  const progress = calculateProgress(snapshot);
  const closed = snapshot.gates.filter((gate) => gate.status === 'PASS').map((gate) => gate.label);
  const blockers = snapshot.gates.filter((gate) => ['FAIL', 'BLOCKED', 'UNKNOWN', 'TIMEOUT'].includes(gate.status));
  const partial = snapshot.gates.filter((gate) => ['PARTIAL', 'PENDING', 'SKIPPED'].includes(gate.status));

  const join = (items, fallback = 'NENHUM') => items.length ? items.join(' | ') : fallback;
  return [
    `SITUAÇÃO=${snapshot.status}`,
    `PROGRESSO_GERAL=${progress.percent}% (${progress.earned}/${progress.total})`,
    `O_QUE_JÁ_FECHOU=${join(closed)}`,
    `PENDÊNCIAS_BLOQUEANTES=${join(blockers.map((gate) => `${gate.label}: ${gate.next_step}`))}`,
    `PENDÊNCIAS_NÃO_BLOQUEANTES=${join(partial.map((gate) => `${gate.label}: ${gate.next_step}`))}`,
    `PRÓXIMO_MOVIMENTO=${snapshot.next_gate}`,
    `O_QUE_O_CHEFE_PRECISA_FAZER=${snapshot.chief_action}`,
  ].join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const suppliedPath = args.find((arg) => !arg.startsWith('--'));
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const defaultPath = path.resolve(scriptDir, '../../docs/ARQUITETURA/CENTRALDARK-AGENTIC-LOOP-4K-STATUS.json');
  const snapshotPath = path.resolve(suppliedPath || defaultPath);
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const progress = calculateProgress(snapshot);
  if (snapshot.expected_percent !== progress.percent) {
    throw new Error(`EXPECTED_PERCENT_MISMATCH:${snapshot.expected_percent}:${progress.percent}`);
  }
  process.stdout.write(jsonMode
    ? `${JSON.stringify({ ...progress, status: snapshot.status, next_gate: snapshot.next_gate }, null, 2)}\n`
    : `${formatPiveteReport(snapshot)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`AGENTIC_LOOP_PROGRESS_BLOCKED=${error.message}`);
    process.exitCode = 1;
  }
}
