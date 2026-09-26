# PADRAO - pattern-discovery.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\memory-linker\pattern-discovery.test.mjs
**SHA:** 38c5e12274737fb5
**Timestamp:** 2026-08-28T02:57:36.903967
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const pattern = enriched.pattern_discovery.patterns[0];

### Ouro Bruto (primeiros 5000 chars)
```
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  discoverPatterns,
  enrichDreamProposal,
  jaccardSimilarity,
  patternTokens,
  validatePatternDiscovery,
} from './pattern-discovery.mjs';

const HEAD = 'a'.repeat(40);

function candidate(id, overrides = {}) {
  return {
    id,
    fingerprint: `${id}-fingerprint`,
    kind: 'RULE',
    target: 'docs/CONSCIENCIA/APRENDIZADOS.md',
    learning_delta: 'Registrar delta reutilizavel antes de promover para o canonico.',
    observations: 1,
    session_ids: [`session-${id}`],
    sources: [`test:${id}`],
    source_classes: ['TOOL_MEASURED'],
    promotion: { status: 'CANDIDATE', auto_absorb_eligible: true },
    ...overrides,
  };
}

function proposal(candidates) {
  return { head_sha: HEAD, candidates };
}

test('tokenizacao e similaridade sao deterministicas e toleram acento', () => {
  const a = patternTokens('Registrar delta reutilizável antes de promover para o canônico.');
  const b = patternTokens('Registrar delta reutilizavel e promover regra no canonico.');
  assert.ok(a.includes('reutilizavel'));
  assert.ok(b.includes('canonico'));
  assert.ok(jaccardSimilarity(a, b) >= 0.6);
});

test('descobre recorrencia entre fingerprints distintos no mesmo dono sem chamar isso de prova', () => {
  const result = discoverPatterns(proposal([
    candidate('a'),
    candidate('b', { learning_delta: 'Registrar delta reutilizavel e promover regra no canonico.' }),
  ]));
  assert.equal(result.pattern_count, 1);
  assert.equal(result.patterns[0].status, 'PATTERN_CANDIDATE');
  assert.equal(result.patterns[0].candidate_count, 2);
  assert.equal(result.patterns[0].evidence_scope, 'RECURRENCE_ONLY_NOT_CAUSAL_PROOF');
  assert.equal(result.pattern_is_proof, false);
});

test('nao fabrica padrao de duas ocorrencias exatamente iguais ja deduplicadas', () => {
  const same = candidate('a');
  const result = discoverPatterns(proposal([same]));
  assert.equal(result.pattern_count, 0);
});

test('nao cruza targets diferentes mesmo quando o texto parece igual', () => {
  const result = discoverPatterns(proposal([
    candidate('a'),
    candidate('b', { target: 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md' }),
  ]));
  assert.equal(result.pattern_count, 0);
});

test('nao agrupa deltas lexicalmente fracos ou diferentes', () => {
  const result = discoverPatterns(proposal([
    candidate('a'),
    candidate('b', { learning_delta: 'Bloquear segredo externo antes de qualquer commit.' }),
  ]));
  assert.equal(result.pattern_count, 0);
});

test('complete-link impede A~B e B~C de fabricar A=C', () => {
  const result = discoverPatterns(proposal([
    candidate('a', { learning_delta: 'alpha bravo charlie delta' }),
    candidate('b', { learning_delta: 'alpha bravo charlie echo' }),
    candidate('c', { learning_delta: 'alpha bravo echo foxtrot' }),
  ]));
  assert.equal(result.pattern_count, 1);
  assert.equal(result.patterns[0].candidate_count, 2);
  assert.deepEqual(result.patterns[0].member_candidate_ids, ['a', 'b']);
});

test('recorrencia provada em membros elegiveis gera handoff automatico sem escrita direta', () => {
  const enriched = enrichDreamProposal(proposal([
    candidate('a'),
    candidate('b', { learning_delta: 'Registrar delta reutilizavel e promover regra no canonico.' }),
  ]));
  assert.equal(enriched.pattern_discovery.autonomy_handoff_eligible_count, 1);
  assert.equal(enriched.pattern_discovery.autonomy_queue.length, 1);
  assert.equal(enriched.pattern_discovery.autonomy_queue[0].action, 'HANDOFF_TO_AUTHORIZED_WRITER');
  assert.equal(enriched.pattern_discovery.autonomy_queue[0].apply_directly, false);
  assert.equal(validatePatternDiscovery(enriched).ok, true);
});

test('quarentena externa nunca entra na fila de autonomia', () => {
  const external = {
    source_classes: ['EXTERNAL_UNTRUSTED'],
    promotion: { status: 'QUARANTINE', auto_absorb_eligible: false },
  };
  const enriched = enrichDreamProposal(proposal([
    candidate('a', external),
    candidate('b', { ...external, learning_delta: 'Registrar delta reutilizavel e promover regra no canonico.' }),
  ]));
  assert.equal(enriched.pattern_discovery.pattern_count, 1);
  assert.equal(enriched.pattern_discovery.patterns[0].status, 'QUARANTINE');
  assert.equal(enriched.pattern_discovery.autonomy_handoff_eligible_count, 0);
  assert.equal(enriched.pattern_discovery.autonomy_queue.length, 0);
  assert.equal(validatePatternDiscovery(enriched).ok, true);
});

test('validator bloqueia fila forjada para padrao inelegivel', () => {
  const enriched = enrichDreamProposal(proposal([
    candidate('a', { promotion: { status: 'CANDIDATE', auto_absorb_eligible: false } }),
    candidate('b', {
      learning_delta: 'Registrar delta reutilizavel e promover regra no canonico.',
      promotion: { status: 'CANDIDATE', auto_absorb_eligible: false },
    }),
  ]));
  const pattern = enriched.pattern_discovery.patterns[0];
  enriched.pattern_discovery.autonomy_queue.push({
    id: '
```