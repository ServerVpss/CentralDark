import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findingId, normalizeFindings, parseSentinelaIssue, reconcileFindingState } from './state-machine.mjs';

const F = { area: 'Workflows', titulo: 'Workflow vermelho: codex-validate', bot: 'codex', sev: 'p2' };
const ID = findingId(F);

function issue(number, id = ID) {
  return { number, title: `[SENTINELA sentinela-${id}] Workflows: Workflow vermelho: codex-validate` };
}

test('findingId é estável para a mesma área+título', () => {
  assert.equal(findingId(F), findingId({ ...F, detalhe: 'outro run' }));
});

test('finding novo sem issue aberta vira ALERT', () => {
  const r = reconcileFindingState({ findings: [F], openIssues: [] });
  assert.equal(r.create.length, 1);
  assert.equal(r.create[0].type, 'ALERT');
  assert.equal(r.keep.length, 0);
  assert.equal(r.recover.length, 0);
});

test('finding idêntico com issue já aberta vira KEEP e não alerta de novo', () => {
  const r = reconcileFindingState({ findings: [F], openIssues: [issue(10)] });
  assert.equal(r.create.length, 0);
  assert.equal(r.keep.length, 1);
  assert.equal(r.recover.length, 0);
});

test('finding que sumiu vira RECOVERY', () => {
  const r = reconcileFindingState({ findings: [], openIssues: [issue(10)] });
  assert.equal(r.create.length, 0);
  assert.equal(r.keep.length, 0);
  assert.equal(r.recover.length, 1);
  assert.equal(r.recover[0].issue.number, 10);
});

test('finding duplicado na mesma varredura é colapsado', () => {
  const normalized = normalizeFindings([F, { ...F, detalhe: 'run diferente' }]);
  assert.equal(normalized.length, 1);
});

test('duas issues abertas com mesmo hash são detectadas como duplicação', () => {
  const r = reconcileFindingState({ findings: [F], openIssues: [issue(13), issue(12)] });
  assert.equal(r.keep.length, 1);
  assert.equal(r.keep[0].issue.number, 12);
  assert.equal(r.duplicates.length, 1);
  assert.equal(r.duplicates[0].canonical.number, 12);
  assert.equal(r.duplicates[0].duplicate.number, 13);
});

test('issue que não é da Sentinela é ignorada', () => {
  assert.equal(parseSentinelaIssue({ number: 1, title: 'issue normal' }), null);
  const r = reconcileFindingState({ findings: [], openIssues: [{ number: 1, title: 'issue normal' }] });
  assert.deepEqual(r.counts, { current: 0, create: 0, keep: 0, recover: 0, duplicates: 0 });
});

test('entrada incompleta falha fechado', () => {
  assert.throws(() => findingId({ area: 'Workflows' }), /finding.titulo obrigatório/);
  assert.throws(() => reconcileFindingState({ findings: 'nao-array' }), /findings deve ser array/);
  assert.throws(() => reconcileFindingState({ openIssues: 'nao-array' }), /openIssues deve ser array/);
});
