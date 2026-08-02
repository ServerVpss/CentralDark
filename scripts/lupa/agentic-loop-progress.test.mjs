import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCourseCustodyGates, calculateProgress, deriveSituation, formatPiveteReport, validateGates } from './agentic-loop-progress.mjs';

const gate = (id, status, required = true) => ({ id, label: id, status, required, evidence: [`proof:${id}`], next_step: status === 'PASS' ? '' : `fix:${id}` });

test('estados incertos valem zero e bloqueiam conclusão', () => {
  for (const status of ['UNKNOWN', 'SKIPPED', 'PENDING']) {
    const gates = [gate('A', 'PASS'), gate('B', status)];
    assert.equal(calculateProgress(gates).earned, 100);
    assert.equal(deriveSituation(gates), 'PARTIAL_BLOQUEADO');
  }
  assert.equal(deriveSituation([gate('A', 'TIMEOUT')]), 'BLOCKED');
});

test('conclusão só existe com todos os gates obrigatórios em PASS', () => {
  assert.equal(deriveSituation([gate('A', 'PASS'), gate('B', 'PASS')]), 'DONE_COM_PROVA');
  assert.equal(deriveSituation([gate('A', 'PASS'), gate('B', 'PARTIAL')]), 'PARTIAL_COM_PROVA');
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

test('rejeita evidência vazia e ID duplicado', () => {
  assert.throws(() => validateGates([{ ...gate('A', 'PASS'), evidence: [] }]), /GATE_WITHOUT_EVIDENCE/);
  assert.throws(() => validateGates([gate('A', 'PASS'), gate('A', 'PASS')]), /GATE_DUPLICATED/);
});

test('relatório emite todos os campos obrigatórios e HEAD runtime', () => {
  const report = {
    situation: 'PARTIAL_BLOQUEADO', error: 'erro', cause: 'causa', correction: 'corrigir',
    test: 'teste', scar: 'cicatriz', progress: { earned: 100, total: 200, percent: 50 },
    blocking_pending: ['x'], non_blocking_pending: [], anticipation: 'antecipar', next_movement: 'mover',
    measured_head: 'a'.repeat(40), chief_action: 'NADA_AGORA',
  };
  const output = formatPiveteReport(report);
  for (const field of ['SITUAÇÃO=', 'ERRO=', 'CAUSA=', 'CORREÇÃO=', 'TESTE=', 'CICATRIZ=', 'PERCENTUAL=', 'PENDÊNCIAS_BLOQUEANTES=', 'PENDÊNCIAS_NÃO_BLOQUEANTES=', 'ANTECIPAÇÃO=', 'PRÓXIMO_MOVIMENTO=', 'HEAD_PROVADO=', 'CI_NO_HEAD=', 'O_QUE_O_CHEFE_PRECISA_FAZER=']) {
    assert.match(output, new RegExp(field));
  }
  assert.match(output, new RegExp('a'.repeat(40)));
});

test('saída JSON deve carregar gates completos por contrato', () => {
  const gates = [gate('A', 'PASS'), gate('B', 'UNKNOWN')];
  const payload = JSON.parse(JSON.stringify({ gates, progress: calculateProgress(gates) }));
  assert.deepEqual(payload.gates, gates);
});
