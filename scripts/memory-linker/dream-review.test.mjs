#!/usr/bin/env node

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildDreamProposal,
  sanitizeDreamText,
  validateDreamProposal,
} from './dream-review.mjs';

const HEAD = 'a'.repeat(40);

function event(overrides = {}) {
  return {
    timestamp: '2026-08-14T12:00:00-03:00',
    source: 'chat:segredo-sol',
    session_id: 'session-001',
    head_sha: HEAD,
    kind: 'RULE',
    target: 'docs/CONSCIENCIA/APRENDIZADOS.md',
    claim: 'Confronto util gera informacao nova.',
    learning_delta: 'Registrar delta reutilizavel antes de promover para o canonico.',
    evidence: [{ type: 'receipt', value: 'review-p1-closed' }],
    ...overrides,
  };
}

test('gera somente candidato isolado e nunca aplica direto', () => {
  const proposal = buildDreamProposal([event()], { headSha: HEAD });

  assert.equal(proposal.status, 'CANDIDATE');
  assert.equal(proposal.candidate_count, 1);
  assert.equal(proposal.apply_allowed, false);
  assert.equal(proposal.direct_canonical_mutation, false);
  assert.equal(proposal.raw_session_mutation, false);
  assert.equal(proposal.candidates[0].promotion.status, 'CANDIDATE');
  assert.equal(proposal.candidates[0].promotion.direct_canonical_mutation, false);
  assert.equal(proposal.promotion_contract.authority, 'SEGREDO/CHEFE');
  assert.equal(validateDreamProposal(proposal).ok, true);
});

test('deduplica observacoes equivalentes sem perder fontes e evidencias', () => {
  const proposal = buildDreamProposal([
    event(),
    event({
      timestamp: '2026-08-14T13:00:00-03:00',
      source: 'hermes:background-review',
      session_id: 'session-002',
      evidence: [
        { type: 'receipt', value: 'review-p1-closed' },
        { type: 'test', value: 'dream-review-pass' },
      ],
    }),
  ], { headSha: HEAD });

  assert.equal(proposal.candidate_count, 1);
  assert.equal(proposal.candidates[0].observations, 2);
  assert.deepEqual(proposal.candidates[0].sources, ['chat:segredo-sol', 'hermes:background-review']);
  assert.equal(proposal.candidates[0].session_ids.length, 2);
  assert.equal(proposal.candidates[0].evidence.length, 2);
});

test('rejeita evento sem evidencia e nao fabrica aprendizado', () => {
  const proposal = buildDreamProposal([event({ evidence: [] })], { headSha: HEAD });

  assert.equal(proposal.status, 'NO_NEW_INFORMATION');
  assert.equal(proposal.accepted_event_count, 0);
  assert.equal(proposal.rejected_event_count, 1);
  assert.equal(proposal.rejected[0].reason, 'EVIDENCE_MISSING');
  assert.equal(proposal.candidate_count, 0);
});

test('rejeita evento sem HEAD em vez de cola-lo artificialmente ao estado atual', () => {
  const proposal = buildDreamProposal([
    event({ head_sha: '' }),
  ], { headSha: HEAD });

  assert.equal(proposal.accepted_event_count, 0);
  assert.equal(proposal.rejected[0].reason, 'EVENT_HEAD_MISSING');
});

test('rejeita evento vinculado a outro HEAD', () => {
  const proposal = buildDreamProposal([
    event({ head_sha: 'b'.repeat(40) }),
  ], { headSha: HEAD });

  assert.equal(proposal.accepted_event_count, 0);
  assert.equal(proposal.rejected[0].reason, 'HEAD_MISMATCH');
});

test('rejeita evento sem delta reutilizavel', () => {
  const proposal = buildDreamProposal([
    event({ learning_delta: '' }),
  ], { headSha: HEAD });

  assert.equal(proposal.candidate_count, 0);
  assert.equal(proposal.rejected[0].reason, 'LEARNING_DELTA_MISSING');
});

test('sanitiza segredo sintetico antes de materializar candidato', () => {
  const syntheticSecret = ['abcdefghijkl', 'mnopqrstuv'].join('');
  const syntheticBearer = ['abcdefghijklmno', 'pqrstuvwxyz123456'].join('');
  const proposal = buildDreamProposal([
    event({
      claim: `token=${syntheticSecret} deve ser removido`,
      evidence: [{ type: 'note', value: `Bearer ${syntheticBearer}` }],
    }),
  ], { headSha: HEAD });

  const serialized = JSON.stringify(proposal);
  assert.equal(proposal.candidate_count, 1);
  assert.match(proposal.candidates[0].claim, /\[REDACTED\]/);
  assert.equal(serialized.includes(syntheticSecret), false);
  assert.equal(serialized.includes(syntheticBearer), false);
});

test('sanitizador nao altera texto comum', () => {
  assert.equal(sanitizeDreamText('memoria sem segredo'), 'memoria sem segredo');
});

test('validador reprova proposta que tenta aplicar direto', () => {
  const proposal = buildDreamProposal([event()], { headSha: HEAD });
  proposal.apply_allowed = true;
  proposal.direct_canonical_mutation = true;

  const result = validateDreamProposal(proposal);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('APPLY_MUST_BE_FALSE'));
  assert.ok(result.errors.includes('DIRECT_CANONICAL_MUTATION_FORBIDDEN'));
});

test('validador reprova tentativa de desligar MetaLupa ou revalidacao no mesmo HEAD', () => {
  const proposal = buildDreamProposal([event()], { headSha: HEAD });
  proposal.promotion_contract.meta_lupa_required = false;
  proposal.promotion_contract.same_head_revalidation_required = false;
  proposal.candidates[0].promotion.meta_lupa_required = false;
  proposal.candidates[0].promotion.same_head_revalidation_required = false;

  const result = validateDreamProposal(proposal);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('PROMOTION_META_LUPA_REQUIRED'));
  assert.ok(result.errors.includes('PROMOTION_SAME_HEAD_REQUIRED'));
  assert.ok(result.errors.some((error) => error.startsWith('CANDIDATE_META_LUPA_REQUIRED:')));
  assert.ok(result.errors.some((error) => error.startsWith('CANDIDATE_SAME_HEAD_REQUIRED:')));
});

test('HEAD invalido falha fechado', () => {
  assert.throws(
    () => buildDreamProposal([event()], { headSha: 'curto' }),
    /HEAD_SHA_INVALID/,
  );
});
