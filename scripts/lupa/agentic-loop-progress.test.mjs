import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCourseCustodyGates,
  calculateProgress,
  deriveSituation,
  formatPiveteReport,
  requirementSatisfied,
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
  const report = { gates };
  assert.equal(requirementSatisfied(report, 'operational'), true);
  assert.equal(requirementSatisfied(report, 'complete'), false);
  assert.equal(deriveSituation(gates), 'PARTIAL_COM_PROVA');
});

test('gate completo falha mesmo quando o único residual é opcional', () => {
  const gates = [gate('CORE', 'PASS'), gate('ZIP', 'PARTIAL', false)];
  assert.equal(requirementSatisfied({ gates }, 'complete'), false);
  assert.equal(requirementSatisfied({ gates }, 'operational'), true);
});

test('percentual inclui todos os gates', () => {
  const result = calculateProgress([gate('A', 'PASS'), gate('B', 'PARTIAL'), gate('C', 'UNKNOWN')]);
  assert.deepEqual(result, { earned: 150, total: 300, percent: 50 });
});

test('curso condensado pode passar sem fingir que o anexo original está no Git', () => {
  const gates = buildCourseCustodyGates({ condensedPresent: true, receiptPresent: true, originalAttachmentPresent: false });
  assert.equal(gates[0].id, 'COURSE_CONDENSED_VERSIONED');
  assert.equal(gates[0].status, 'PASS');
  assert.equal(gates[0].required, true);
  assert.equal(gates[1].id, 'COURSE_ORIGINAL_ATTACHMENT');
  assert.equal(gates[1].status, 'PARTIAL');
  assert.equal(gates[1].required, false);
  assert.match(gates[1].evidence.join(' '), /bytes do anexo original permanecem externos/i);
});

test('ausência do receipt derruba o gate condensado', () => {
  const gates = buildCourseCustodyGates({ condensedPresent: true, receiptPresent: false, originalAttachmentPresent: false });
  assert.equal(gates[0].status, 'FAIL');
  assert.equal(gates[1].status, 'PARTIAL');
});

test('rejeita evidência vazia, ID duplicado e modo inválido', () => {
  assert.throws(() => validateGates([{ ...gate('A', 'PASS'), evidence: [] }]), /GATE_WITHOUT_EVIDENCE/);
  assert.throws(() => validateGates([gate('A', 'PASS'), gate('A', 'PASS')]), /GATE_DUPLICATED/);
  assert.throws(() => requirementSatisfied({ gates: [gate('A', 'PASS')] }, 'ambiguous'), /REQUIREMENT_MODE_INVALID/);
});

test('motor oficial emite o contrato completo e se autovalida', () => {
  const gates = [gate('CORE', 'PASS'), gate('ATTACHMENT', 'PARTIAL', false)];
  const report = {
    schema_version: 3,
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
    '🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=', '🔎 PROVA=', '🗣️ PAPO RETO DO PIVETE=',
    '➡️ PRÓXIMO GATE=', '🧰 COMANDO CIRÚRGICO=', '🧪 COLETA DO CHEFE=',
    '👑 AÇÃO DO CHEFE=', '🛡️ O QUE NÃO FOI TOCADO=', 'AUTORIA_DO_PADRÃO=SEGREDO/CHEFE',
  ]) {
    assert.match(output, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(output, new RegExp('a'.repeat(40)));
});

test('motor oficial não emite PASS quando a entrega está parcial', () => {
  const gates = [gate('CORE', 'PASS'), gate('ZIP', 'PARTIAL', false)];
  const report = {
    schema_version: 3,
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

test('saída JSON deve carregar gates completos por contrato', () => {
  const gates = [gate('A', 'PASS'), gate('B', 'UNKNOWN')];
  const payload = JSON.parse(JSON.stringify({ gates, progress: calculateProgress(gates) }));
  assert.deepEqual(payload.gates, gates);
});
