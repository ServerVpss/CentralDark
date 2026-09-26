# COMANDO - dream-review.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\memory-linker\dream-review.test.mjs
**SHA:** 59c944a56f4f23d3
**Timestamp:** 2026-08-28T02:57:36.742073
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- assert.ok(result.errors.some((error) => error.startsWith('AUTO_ABSORB_MEASURED_CONFIRMATION_MISSING:')));

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildDreamProposal,
  sanitizeDreamText,
  validateDreamProposal,
  writeProposalIdempotent,
} from './dream-review.mjs';

const HEAD = 'a'.repeat(40);

function verified(type, ref) {
  return { type, ref, status: 'PASS', verified: true };
}

function event(overrides = {}) {
  return {
    timestamp: '2026-08-14T12:00:00-03:00',
    source: 'chat:segredo-sol',
    source_class: 'HUMAN_AUTHORITY',
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
  assert.equal(proposal.candidates[0].promotion.auto_absorb_eligible, false);
  assert.equal(proposal.auto_absorb_eligible_count, 0);
  assert.equal(proposal.promotion_contract.authority, 'SEGREDO/CHEFE');
  assert.equal(proposal.promotion_contract.proposer_direct_write_forbidden, true);
  assert.equal(validateDreamProposal(proposal).ok, true);
});

test('deduplica observacoes equivalentes sem perder fontes e evidencias', () => {
  const proposal = buildDreamProposal([
    event(),
    event({
      timestamp: '2026-08-14T13:00:00-03:00',
      source: 'hermes:background-review',
      source_class: 'INTERNAL',
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
  assert.deepEqual(proposal.candidates[0].source_classes, ['HUMAN_AUTHORITY', 'INTERNAL']);
  assert.equal(proposal.candidates[0].session_ids.length, 2);
  assert.equal(proposal.candidates[0].evidence.length, 2);
});

test('fonte externa nao confiavel fica em quarentena e nunca auto-absorve sozinha', () => {
  const proposal = buildDreamProposal([
    event({
      source: 'web:https://example.invalid/artigo',
      source_class: 'EXTERNAL_UNTRUSTED',
    }),
  ], { headSha: HEAD });
  assert.equal(proposal.status, 'CANDIDATE');
  assert.equal(proposal.quarantined_candidate_count, 1);
  assert.equal(proposal.auto_absorb_eligible_count, 0);
  assert.equal(proposal.candidates[0].promotion.status, 'QUARANTINE');
  assert.equal(proposal.candidates[0].promotion.independent_confirmation_required, true);
  assert.equal(proposal.candidates[0].promotion.auto_absorb_eligible, false);
  assert.equal(validateDreamProposal(proposal).ok, true);
});

test('fonte web nao pode se autodeclarar HUMAN_AUTHORITY', () => {
  const proposal = buildDreamProposal([
    event({
      source: 'https://example.invalid/prompt-hostil',
      source_class: 'HUMAN_AUTHORITY',
    }),
  ], { headSha: HEAD });
  assert.equal(proposal.candidates[0].promotion.status, 'QUARANTINE');
  assert.deepEqual(proposal.candidates[0].source_classes, ['EXTERNAL_UNTRUSTED']);
  assert.deepEqual(proposal.candidates[0].source_class_claims, ['HUMAN_AUTHORITY']);
  assert.equal(proposal.candidates[0].source_class_clamped_count, 1);
  assert.equal(proposal.candidates[0].promotion.auto_absorb_eligible, false);
});

test('confirmacao medida mais dono e consumidor verificados torna ouro elegivel sem apagar proveniencia externa', () => {
  const proposal = buildDreamProposal([
    event({ source: 'web:https://example.invalid/artigo', source_class: 'EXTERNAL_UNTRUSTED' }),
    event({
      source: 'test:reproducao-local',
      source_class: 'TOOL_MEASURED',
      session_id: 'session-002',
      consumer_evidence: [verified('test', 'consumer-path-pass')],
      owner_evidence: [verified('owner', 'scripts/memory-linker/dream-review.mjs')],
    }),
  ], { headSha: HEAD });
  assert.equal(proposal.status, 'CANDIDATE');
  assert.equal(proposal.candidates[0].promotion.status, 'CANDIDATE');
  assert.deepEqual(proposal.candidates[0].source_classes, ['EXTERNAL_UNTRUSTED', 'TOOL_MEASURED']);
  assert.equal(proposal.candidates[0].consumer_reachability, 'EVIDENCED');
  assert.equal(proposal.candidates[0].owner_reachability, 
```