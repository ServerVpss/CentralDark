import test from 'node:test';
import assert from 'node:assert/strict';

import {
  extractScopeClass,
  validatePrTrilho,
} from './centraldark-pr-trilho-contract.mjs';

const validBody = `
# 🧿 INTENÇÃO
Criar PR-trilho vivo para missão SITE-FIRST sem virar PR gigante nem texto solto.

Refs #1444
MISSION_ID: SITE_FIRST_INSTALL_20260908
OWNER: centraldark-operational-method
WRITER: SOL
SCOPE_CLASS: SITE_FIRST
SCOPE: SITE_FIRST
LIVE_STATE: PR aberto, HEAD medido, main não tocada
ARQUIVOS: scripts/ci/centraldark-pr-trilho-contract.mjs
EVIDÊNCIA: teste unitário e workflow dedicado
COUNTERPROOF: UNKNOWN != PASS; DOCUMENTED != EXECUTED; MERGED != DEPLOYED
BLOQUEIOS: CI same-head ainda precisa concluir
NEXT_CURSOR: medir checks do HEAD atual

PROVAR_SITE != PROVAR_CASA
PROVAR_CASA != PROVAR_SITE
`;

test('valid PR-trilho body passes with PR-mãe link, mission, owner, writer, scope, evidence and next cursor', () => {
  const result = validatePrTrilho({
    title: '🧿 SITE-FIRST: INSTALAÇÃO INICIAL CENTRALDARK',
    body: validBody,
    files: ['scripts/ci/centraldark-pr-trilho-contract.mjs'],
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.scopeClass, 'SITE_FIRST');
});

test('extractScopeClass reads explicit SCOPE_CLASS before generic scope', () => {
  assert.equal(extractScopeClass(validBody.replace('SCOPE_CLASS: SITE_FIRST', 'SCOPE_CLASS: LABEL_GATE')), 'LABEL_GATE');
});

test('PR without PR-mãe link fails closed', () => {
  const result = validatePrTrilho({
    title: '🧿 SITE-FIRST: SEM PR MÃE',
    body: validBody.replace('Refs #1444', ''),
    files: ['scripts/ci/centraldark-pr-trilho-contract.mjs'],
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_TRILHO_PR_MAE_REF_MISSING'));
  assert.ok(result.errors.includes('PR_TRILHO_NOT_LINKED_TO_PR_MAE'));
});

test('UNKNOWN as PASS is forbidden', () => {
  const result = validatePrTrilho({
    title: '🧿 SITE-FIRST: UNKNOWN RUIM',
    body: validBody.replace('UNKNOWN != PASS', 'UNKNOWN = PASS'),
    files: ['scripts/ci/centraldark-pr-trilho-contract.mjs'],
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_TRILHO_UNKNOWN_AS_PASS_FORBIDDEN'));
});

test('merged cannot be declared as deployed', () => {
  const result = validatePrTrilho({
    title: '🧿 SITE-FIRST: MERGE RUIM',
    body: `${validBody}\nMERGED = DEPLOYED\n`,
    files: ['scripts/ci/centraldark-pr-trilho-contract.mjs'],
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_TRILHO_MERGED_AS_DEPLOYED_FORBIDDEN'));
});

test('site and casa proof distinction is required when both domains are mentioned', () => {
  const body = validBody
    .replace('PROVAR_SITE != PROVAR_CASA', '')
    .replace('PROVAR_CASA != PROVAR_SITE', '');
  const result = validatePrTrilho({
    title: '🧿 SITE-FIRST: DISTINÇÃO FALTANTE',
    body,
    files: ['scripts/ci/centraldark-pr-trilho-contract.mjs'],
  });

  assert.equal(result.ok, true);
  assert.ok(result.warnings.includes('PR_TRILHO_SITE_CASA_DISTINCTION_NOT_EXPLICIT'));
  assert.ok(result.warnings.includes('PR_TRILHO_CASA_SITE_DISTINCTION_NOT_EXPLICIT'));
});

test('unknown scope class fails instead of becoming generic pass', () => {
  const result = validatePrTrilho({
    title: '🧿 SITE-FIRST: ESCOPO DESCONHECIDO',
    body: validBody.replace('SCOPE_CLASS: SITE_FIRST', 'SCOPE_CLASS: UNIVERSO_TOTAL'),
    files: ['scripts/ci/centraldark-pr-trilho-contract.mjs'],
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_TRILHO_SCOPE_CLASS_UNKNOWN:UNIVERSO_TOTAL'));
});

test('parallel V2/V3/V4 language fails without proven gap', () => {
  const result = validatePrTrilho({
    title: '🧿 SITE-FIRST: V3 PROIBIDO',
    body: `${validBody}\nCriar V3 do painel.\n`,
    files: ['scripts/ci/centraldark-pr-trilho-contract.mjs'],
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PR_TRILHO_PARALLEL_VERSION_FORBIDDEN_WITHOUT_PROVEN_GAP'));
});
