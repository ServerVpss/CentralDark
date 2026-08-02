import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import {
  buildCourseCustodyGates,
  buildVisualBinaryGate,
  calculateProgress,
  deriveSituation,
  formatPiveteReport,
  requirementSatisfied,
  resolveVerifiedHead,
  validateGates,
  validateMetaLupaReceipt,
  validateTestReceipt,
} from './agentic-loop-progress.mjs';
import { validateReport } from './validar-relato-pivete.mjs';

const gate = (id, status, required = true) => ({ id, label: id, status, required, evidence: [`proof:${id}`], next_step: status === 'PASS' ? '' : `fix:${id}` });
function tempJson(payload) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentic-receipt-'));
  const file = path.join(dir, 'receipt.json');
  fs.writeFileSync(file, `${JSON.stringify(payload)}\n`);
  return { dir, file };
}

test('estados incertos valem zero e bloqueiam conclusão', () => {
  for (const status of ['UNKNOWN', 'SKIPPED', 'PENDING']) {
    const gates = [gate('A', 'PASS'), gate('B', status)];
    assert.equal(calculateProgress(gates).earned, 100);
    assert.equal(deriveSituation(gates), 'PARTIAL_BLOQUEADO');
  }
  assert.equal(deriveSituation([gate('A', 'TIMEOUT')]), 'BLOCKED');
});

test('operacional e completo são gates diferentes', () => {
  const gates = [gate('CORE', 'PASS'), gate('ATTACHMENT', 'PARTIAL', false)];
  assert.equal(requirementSatisfied({ gates }, 'operational'), true);
  assert.equal(requirementSatisfied({ gates }, 'complete'), false);
  assert.equal(deriveSituation(gates), 'PARTIAL_COM_PROVA');
});

test('percentual inclui todos os gates e rejeita fraude estrutural', () => {
  assert.deepEqual(calculateProgress([gate('A', 'PASS'), gate('B', 'PARTIAL'), gate('C', 'UNKNOWN')]), { earned: 150, total: 300, percent: 50 });
  assert.throws(() => validateGates([{ ...gate('A', 'PASS'), evidence: [] }]), /GATE_WITHOUT_EVIDENCE/);
  assert.throws(() => validateGates([gate('A', 'PASS'), gate('A', 'PASS')]), /GATE_DUPLICATED/);
});

test('curso e binários só concluem com bytes e hashes válidos', () => {
  assert.equal(buildCourseCustodyGates({ condensedPresent: true, receiptPresent: true, originalAttachmentPresent: true, originalAttachmentValid: true })[1].status, 'PASS');
  assert.equal(buildCourseCustodyGates({ condensedPresent: true, receiptPresent: true, originalAttachmentPresent: true, originalAttachmentValid: false })[1].status, 'FAIL');
  assert.equal(buildVisualBinaryGate({ declared: false, allPresent: false, allValid: false }).status, 'PARTIAL');
  assert.equal(buildVisualBinaryGate({ declared: true, allPresent: true, allValid: false }).status, 'FAIL');
  assert.equal(buildVisualBinaryGate({ declared: true, allPresent: true, allValid: true }).status, 'PASS');
});

test('receipt de testes exige PASS e HEAD exato', () => {
  const head = 'a'.repeat(40);
  const ok = tempJson({ schema_version: 1, status: 'PASS', head_sha: head, suites: ['a.test.mjs'], issued_at_utc: new Date().toISOString() });
  try {
    assert.equal(validateTestReceipt(ok.file, head).status, 'PASS');
    assert.throws(() => validateTestReceipt(ok.file, 'b'.repeat(40)), /TEST_RECEIPT_HEAD_MISMATCH/);
  } finally { fs.rmSync(ok.dir, { recursive: true, force: true }); }
});

test('receipt de testes ausente ou sem suites bloqueia', () => {
  assert.throws(() => validateTestReceipt('/nao-existe.json', 'a'.repeat(40)), /TEST_RECEIPT_MISSING/);
  const bad = tempJson({ schema_version: 1, status: 'PASS', head_sha: 'a'.repeat(40), suites: [], issued_at_utc: new Date().toISOString() });
  try { assert.throws(() => validateTestReceipt(bad.file, 'a'.repeat(40)), /TEST_RECEIPT_SUITES_MISSING/); }
  finally { fs.rmSync(bad.dir, { recursive: true, force: true }); }
});

test('Meta Lupa aceita somente ALLOWED no mesmo HEAD', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'meta-receipt-'));
  const receipt = path.join(root, 'meta.json');
  fs.mkdirSync(path.join(root, '.agents/skills/meta-lupa/scripts'), { recursive: true });
  fs.writeFileSync(path.join(root, '.agents/skills/meta-lupa/scripts/meta_lupa.py'), '# fixture');
  fs.writeFileSync(receipt, '{}');
  const head = 'c'.repeat(40);
  const runner = () => JSON.stringify({ STATUS: 'ALLOWED', META_LUPA_GATE: 'PASS', META_LUPA_RECEIPT_VALID: 'SIM', workspace_head: head, META_LUPA_USAGE_ID: 'usage', META_LUPA_CANONICAL_SHA: 'tree' });
  try {
    assert.equal(validateMetaLupaReceipt({ root, receiptPath: receipt, expectedHead: head, runner }).STATUS, 'ALLOWED');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('Meta Lupa bloqueada nunca vira PASS', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'meta-receipt-'));
  const receipt = path.join(root, 'meta.json');
  fs.mkdirSync(path.join(root, '.agents/skills/meta-lupa/scripts'), { recursive: true });
  fs.writeFileSync(path.join(root, '.agents/skills/meta-lupa/scripts/meta_lupa.py'), '# fixture');
  fs.writeFileSync(receipt, '{}');
  const runner = () => JSON.stringify({ STATUS: 'BLOCKED', REASON: 'META_LUPA_HEAD_MISMATCH', META_LUPA_GATE: 'BLOCKED' });
  try {
    assert.throws(() => validateMetaLupaReceipt({ root, receiptPath: receipt, expectedHead: 'd'.repeat(40), runner }), /META_LUPA_VALIDATION_UNAVAILABLE/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('expected-head é comparado ao checkout real', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentic-head-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: root });
    execFileSync('git', ['config', 'user.name', 'Test'], { cwd: root });
    fs.writeFileSync(path.join(root, 'a.txt'), 'a');
    execFileSync('git', ['add', 'a.txt'], { cwd: root });
    execFileSync('git', ['commit', '-qm', 'init'], { cwd: root });
    const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    assert.equal(resolveVerifiedHead(root, head), head);
    assert.throws(() => resolveVerifiedHead(root, '1'.repeat(40)), /EXPECTED_HEAD_MISMATCH/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('motor oficial emite gates estruturados, receipts, emissor e se autovalida', () => {
  const gates = [gate('CORE', 'PASS'), gate('ATTACHMENT', 'PARTIAL', false)];
  const report = {
    schema_version: 5,
    situation: 'PARTIAL_COM_PROVA', error: 'NENHUM', cause: 'NÃO_APLICÁVEL', correction: 'NENHUMA',
    test: '1 suíte com receipt PASS no HEAD', scar: 'cicatriz', progress: { earned: 150, total: 200, percent: 75 },
    gates, operational_ready: true, complete: false,
    test_receipt: { status: 'PASS', suites: ['a'] },
    meta_lupa_receipt: { META_LUPA_USAGE_ID: 'usage', META_LUPA_CANONICAL_SHA: 'tree' },
    blocking_pending: [], non_blocking_pending: ['ATTACHMENT: fix:ATTACHMENT'],
    next_movement: 'mover', measured_head: 'a'.repeat(40), chief_action: 'NADA_AGORA',
  };
  const output = formatPiveteReport(report);
  const validation = validateReport(output, 'full');
  assert.equal(validation.progress.percent, 75);
  assert.match(output, /GATES_MEDIDOS_JSON=\[/);
  assert.match(output, /META_LUPA_GATE=PASS/);
  assert.match(output, /EMISSOR=agentic-loop-progress/);
  assert.match(output, /PAPEL_DO_EMISSOR=READ_ONLY/);
  assert.doesNotMatch(output, /SITUAÇÃO=PASS/);
});
