import assert from 'node:assert/strict';
import test from 'node:test';

import { buildDreamReviewWithPatterns, routePatternAutonomy } from './dream-review-run.mjs';

const HEAD = 'a'.repeat(40);
const TARGET = 'docs/CONSCIENCIA/APRENDIZADOS.md';

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
    target: TARGET,
    claim: `Observacao material ${index}`,
    learning_delta: index === 1
      ? 'Registrar delta reutilizavel antes de promover para o canonico.'
      : 'Registrar delta reutilizavel e promover regra no canonico.',
    evidence: [verified('test', `event-${index}-pass`)],
    owner_evidence: [verified('owner', TARGET)],
    consumer_evidence: [verified('consumer', `consumer-${index}-pass`)],
    ...overrides,
  };
}

function jarvisState(overrides = {}) {
  return {
    mission_id: 'memory-pattern-autonomy',
    coordinator: 'SOL',
    head: { sha: HEAD },
    writer: { agent: 'hermes-pivete', role: 'HERMES' },
    scope: { allowed: [TARGET], denied: [] },
    trail: { route_id: 'memory-pattern-route' },
    global_contract_entry: {
      scope_id: 'canon/centraldark-universal-contract-20260919',
      contract_schema: 6,
      phase: 'ENTRY',
      observed_head: HEAD,
      trace_id: 'dream-contract-entry',
      github_t0: { status: 'PASS', head_sha: HEAD },
      vps_t0: { status: 'PASS', head_sha: HEAD },
      cross_surface_drift_classified: true,
      owner_proof: { status: 'PASS', owner: TARGET },
      writer_scope_proof: { status: 'PASS', scope: TARGET },
      preflight: { status: 'PASS', evidence_ref: 'test:dream-preflight' },
      counterproof_plan: { status: 'READY', evidence_ref: 'test:dream-counterproof-plan' },
      rollback: { status: 'PREPARED', evidence_ref: 'git:dream-rollback' },
      next_cursor: 'DREAM_WRITE_THEN_T1',
      fixed_point: false,
    },
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

test('fila elegivel vira CALL aceito pelo writer canonico sem executar transporte', () => {
  const proposal = buildDreamReviewWithPatterns([event(1), event(2)], {
    headSha: HEAD,
    jarvisState: jarvisState(),
  });
  assert.equal(proposal.autonomy_routing.mode, 'CANONICAL_AGENT_CALL_ROUTING');
  assert.equal(proposal.autonomy_routing.protocol, 'CENTRALDARK_AGENT_CALL_V1');
  assert.equal(proposal.autonomy_routing.queue_count, 1);
  assert.equal(proposal.autonomy_routing.accepted_call_count, 1);
  assert.equal(proposal.autonomy_routing.blocked_call_count, 0);
  assert.equal(proposal.autonomy_routing.explicit_allowed_scope_required, true);
  assert.equal(proposal.autonomy_routing.transport_execution, false);
  assert.equal(proposal.autonomy_routing.routed[0].call.to, 'hermes-pivete');
  assert.equal(proposal.autonomy_routing.routed[0].receipt.accepted, true);
  assert.equal(proposal.autonomy_routing.routed[0].receipt.write_authorized, true);
});

test('roteamento bloqueia HEAD velho em vez de fabricar autonomia', () => {
  const proposal = buildDreamReviewWithPatterns([event(1), event(2)], { headSha: HEAD });
  const routing = routePatternAutonomy(proposal, jarvisState({ head: { sha: 'b'.repeat(40) } }));
  assert.equal(routing.accepted_call_count, 0);
  assert.equal(routing.blocked_call_count, 1);
  assert.equal(routing.routed[0].receipt.accepted, false);
  assert.equal(routing.routed[0].receipt.status, 'BLOCKED_STALE_HEAD');
});

test('roteamento bloqueia ausencia de writer em vez de assumir caneta', () => {
  const proposal = buildDreamReviewWithPatterns([event(1), event(2)], { headSha: HEAD });
  const routing = routePatternAutonomy(proposal, jarvisState({ writer: { agent: 'NONE', role: 'HERMES' } }));
  assert.equal(routing.accepted_call_count, 0);
  assert.equal(routing.blocked_call_count, 1);
  assert.equal(routing.routed[0].receipt.accepted, false);
  assert.equal(routing.routed[0].receipt.status, 'BLOCKED_NO_WRITER');
});

test('roteamento bloqueia escopo vazio mesmo que agent-call isolado aceitasse lista aberta', () => {
  const proposal = buildDreamReviewWithPatterns([event(1), event(2)], { headSha: HEAD });
  const routing = routePatternAutonomy(proposal, jarvisState({ scope: { allowed: [], denied: [] } }));
  assert.equal(routing.accepted_call_count, 0);
  assert.equal(routing.blocked_call_count, 1);
  assert.equal(routing.routed[0].receipt.accepted, false);
  assert.equal(routing.routed[0].receipt.status, 'BLOCKED_AUTHORIZED_SCOPE_UNPROVEN');
});
