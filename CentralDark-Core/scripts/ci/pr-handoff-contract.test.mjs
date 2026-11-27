import test from 'node:test';
import assert from 'node:assert/strict';

import { validatePrHandoff } from './pr-handoff-contract.mjs';

const validBody = `
# 🧿 Intenção
Cristalizar handoff bruto para PRs futuros.

Refs #1444

WRITER: SOL
OWNER: centraldark-operational-method
HEAD: abc123
ARQUIVOS: scripts/ci/pr-handoff-contract.mjs
PROVADO: teste local cobre contrato mínimo
QUEBRADO: nenhum bloqueio atual medido neste fixture
EVIDÊNCIA_FALTANTE: CI same-head ainda precisa medir quando rodar no GitHub
NEXT_CURSOR: medir checks do PR

UNKNOWN != PASS
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
`;

test('valid handoff includes intention, refs, writer, files, proof, blockers and next cursor', () => {
  const result = validatePrHandoff({
    title: '🧿 DOCS+TEST: PR HANDOFF CONTRACT',
    body: validBody,
    files: ['scripts/ci/pr-handoff-contract.mjs'],
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('empty body fails closed', () => {
  const result = validatePrHandoff({ title: '🧿 DOCS: VAZIO', body: '' });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_HANDOFF_BODY_EMPTY'));
});

test('missing issue or refs fails closed', () => {
  const result = validatePrHandoff({
    title: '🧿 DOCS: SEM REFS',
    body: validBody.replace('Refs #1444', ''),
    files: ['scripts/ci/pr-handoff-contract.mjs'],
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_HANDOFF_REFS_MISSING'));
});

test('unknown as pass is forbidden', () => {
  const result = validatePrHandoff({
    title: '🧿 DOCS: UNKNOWN RUIM',
    body: validBody.replace('UNKNOWN != PASS', 'UNKNOWN = PASS'),
    files: ['scripts/ci/pr-handoff-contract.mjs'],
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_HANDOFF_UNKNOWN_AS_PASS_FORBIDDEN'));
});

test('documentation cannot be equated with execution', () => {
  const result = validatePrHandoff({
    title: '🧿 DOCS: DOCUMENTO RUIM',
    body: validBody.replace('DOCUMENTED != EXECUTED', 'DOCUMENTED = EXECUTED'),
    files: ['scripts/ci/pr-handoff-contract.mjs'],
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_HANDOFF_DOCUMENTED_AS_EXECUTED_FORBIDDEN'));
});
