import assert from 'node:assert/strict';
import test from 'node:test';

import { buildDreamReviewWithPatterns } from './dream-review-run.mjs';

const HEAD = 'a'.repeat(40);

function verified(type, ref) {
  return { type, ref, status: 'PASS', verified: true };
}

function event(index, overrides = {}) {
  return {
    timestamp: `2026-08-14T1${index}:00:00-03:00`,
    source: `test:pattern-${index}`,
    source_class: 'TOOL_MEASURED',
    session_id: `session-${index}`,
    head_sha: HEAD,
    kind: 'RULE',
    target: 'docs/CONSCIENCIA/APRENDIZADOS.md',
    claim: `Observacao material ${index}`,
    learning_delta: index === 1
      ? 'Registrar delta reutilizavel antes de promover para o canonico.'
      : 'Registrar delta reutilizavel e promover regra no canonico.',
    evidence: [verified('test', `event-${index}-pass`)],
    owner_evidence: [verified('owner', 'docs/CONSCIENCIA/APRENDIZADOS.md')],
    consumer_evidence: [verified('consumer', `consumer-${index}-pass`)],
    ...overrides,
  };
}

test('façade do Dream Review descobre padrao e gera handoff sem aplicar direto', () => {
  const proposal = buildDreamReviewWithPatterns([event(1), event(2)], { headSha: HEAD });
  assert.equal(proposal.candidate_count, 2);
  assert.equal(proposal.pattern_discovery.pattern_count, 1);
  assert.equal(proposal.pattern_discovery.autonomy_handoff_eligible_count, 1);
  assert.equal(proposal.pattern_discovery.autonomy_queue[0].action, 'HANDOFF_TO_AUTHORIZED_WRITER');
  assert.equal(proposal.pattern_discovery.autonomy_queue[0].apply_directly, false);
  assert.equal(proposal.direct_canonical_mutation, false);
});

test('fonte externa recorrente continua fora da fila autonoma', () => {
  const proposal = buildDreamReviewWithPatterns([
    event(1, { source: 'web:https://example.invalid/a', source_class: 'EXTERNAL_UNTRUSTED' }),
    event(2, { source: 'web:https://example.invalid/b', source_class: 'EXTERNAL_UNTRUSTED' }),
  ], { headSha: HEAD });
  assert.equal(proposal.pattern_discovery.pattern_count, 1);
  assert.equal(proposal.pattern_discovery.autonomy_handoff_eligible_count, 0);
  assert.equal(proposal.pattern_discovery.autonomy_queue.length, 0);
});
