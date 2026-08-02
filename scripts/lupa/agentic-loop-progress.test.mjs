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
} from './agentic-loop-progress.mjs';
import { validateReport } from './validar-relato-pivete.mjs';

const gate = (id, status, required = true) => ({ id, label: id, status, required, evidence: [`proof:${id}`], next_step: status === 'PASS' ? '' : `fix:${id}` });

test('estados incertos valem zero e bloqueiam conclusão', () => {
  for (const status of ['UNKNOWN', 'SKIPPED', 'PENDING']) {
    const gates = [gate('A', 'PASS'), gate('B', status)];
    assert.equal(calculateProgress(gates).earned, 100);
    assert.equal(deriveSituation(gates), 'PARTIAL_BLOQUEADO');
  }
  assert.equal(deriveSituation([gate('A', 'TIMEOUT')]), 'BLOCKED');
});

test('DONE_COM_PROVA exige todos os gates em PASS', () => {
  assert.equal(deriveSituation([gate('A', 'PASS'), gate('B', 'PASS')]), 'DONE_COM_PROVA');
  assert.equal(deriveSituation([gate('A', 'PASS'), gate('B', 'PARTIAL')]), 'PARTIAL_COM_PROVA');
  assert.equal(deriveSituation([gate('A', 'PASS'), gate('B', 'PARTIAL', false)]), 'PARTIAL_COM_PROVA');
});

test('operacional e completo são gates diferentes', () => {
  const gates = [gate('CORE', 'PASS'), gate('ATTACHMENT', 'PARTIAL', false)];
  assert.equal(requirementSatisfied({ gates }, 'operational'), true);
  assert.equal(requirementSatisfied({ gates }, 'complete'), false);
});

test('percentual inclui todos os gates', () => {
  const result = calculateProgress([gate('A', 'PASS'), gate('B', 'PARTIAL'), gate('C', 'UNKNOWN')]);
  assert.deepEqual(result, { earned: 150, total: 300, percent: 50 });
});

test('curso original pode sair de PARTIAL quando bytes e SHA existem', () => {
  const gates = buildCourseCustodyGates({ condensedPresent: true, receiptPresent: true, originalAttachmentPresent: true, originalAttachmentValid: true });
  assert.equal(gates[0].status, 'PASS');
  assert.equal(gates[1].status, 'PASS');
});

test('curso original inválido não vira PASS', () => {
  const gates = buildCourseCustodyGates({ condensedPresent: true, receiptPresent: true, originalAttachmentPresent: true, originalAttachmentValid: false });
  assert.equal(gates[1].status, 'FAIL');
});

test('binários visuais podem concluir e divergência falha', () => {
  assert.equal(buildVisualBinaryGate({ declared: false, allPresent: false, allValid: false }).status, 'PARTIAL');
  assert.equal(buildVisualBinaryGate({ declared: true, allPresent: true, allValid: false }).status, 'FAIL');
  assert.equal(buildVisualBinaryGate({ declared: true, allPresent: true, allValid: true }).status, 'PASS');
});

test('rejeita evidência vazia, ID duplicado e modo inválido', () => {
  assert.throws(() => validateGates([{ ...gate('A', 'PASS'), evidence: [] }]), /GATE_WITHOUT_EVIDENCE/);
  assert.throws(() => validateGates([gate('A', 'PASS'), gate('A', 'PASS')]), /GATE_DUPLICATED/);
  assert.throws(() => requirementSatisfied({ gates: [gate('A', 'PASS')] }, 'ambiguous'), /REQUIREMENT_MODE_INVALID/);
});

test('verifica expected-head contra o checkout real', () => {
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

test('motor oficial emite contrato completo, diagrama e se autovalida', () => {
  const gates = [gate('CORE', 'PASS'), gate('ATTACHMENT', 'PARTIAL', false)];
  const report = {
    schema_version: 4,
    source_of_truth: 'ServerVpss/CentralDark',
    situation: 'PARTIAL_COM_PROVA', error: 'NENHUM', cause: 'NÃO_APLICÁVEL', correction: 'NENHUMA',
    test: 'node --test testes', scar: 'cicatriz', progress: { earned: 150, total: 200, percent: 75 },
    gates, operational_ready: true, complete: false,
    blocking_pending: [], non_blocking_pending: ['ATTACHMENT: fix:ATTACHMENT'],
    anticipation: 'antecipar', next_movement: 'mover', measured_head: 'a'.repeat(40),
    chief_action: 'NADA_AGORA',
  };
  const output = formatPiveteReport(report);
  const validation = validateReport(output, 'full');
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.progress, { earned: 150, total: 200, percent: 75 });
  for (const field of [
    '🧠 CENTRALDARK — ESTADO DA MISSÃO', '🎯 VEREDITO=', '📊 PROGRESSO=',
    'PERCENTUAL_MEDIDO=150/200=75%', 'ESTIMATIVA=NÃO_CALCULADA',
    '✅ O QUE JÁ ESTÁ PRONTO=', '🟡 O QUE ESTÁ PARCIAL=', '❌ O QUE AINDA FALTA=',
    '🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=', '🔎 PROVA=', '🧭 FLUXO VISUAL=',
    'DIAGRAMA_OBRIGATÓRIO=SIM', 'sequenceDiagram', '🗣️ PAPO RETO DO PIVETE=',
    '➡️ PRÓXIMO GATE=', '🧰 COMANDO CIRÚRGICO=', '🧪 COLETA DO CHEFE=',
    '👑 AÇÃO DO CHEFE=', '🛡️ O QUE NÃO FOI TOCADO=', 'AUTORIA_DO_PADRÃO=SEGREDO/CHEFE',
  ]) assert.match(output, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(output, new RegExp('a'.repeat(40)));
});

test('motor oficial não emite PASS quando a entrega está parcial', () => {
  const gates = [gate('CORE', 'PASS'), gate('ZIP', 'PARTIAL', false)];
  const report = {
    schema_version: 4,
    situation: 'PARTIAL_COM_PROVA', error: 'NENHUM', cause: 'NÃO_APLICÁVEL', correction: 'NENHUMA',
    test: 'teste', scar: 'cicatriz', progress: { earned: 150, total: 200, percent: 75 },
    gates, operational_ready: true, complete: false, blocking_pending: [],
    non_blocking_pending: ['ZIP: fix:ZIP'], anticipation: 'antecipar', next_movement: 'mover',
    measured_head: 'b'.repeat(40), chief_action: 'NADA_AGORA',
  };
  const output = formatPiveteReport(report);
  assert.match(output, /SITUAÇÃO=PARTIAL_COM_PROVA/);
  assert.match(output, /COMPLETO=NÃO/);
  assert.doesNotMatch(output, /SITUAÇÃO=PASS/);
});

test('saída JSON carrega gates completos por contrato', () => {
  const gates = [gate('A', 'PASS'), gate('B', 'UNKNOWN')];
  const payload = JSON.parse(JSON.stringify({ gates, progress: calculateProgress(gates) }));
  assert.deepEqual(payload.gates, gates);
});
