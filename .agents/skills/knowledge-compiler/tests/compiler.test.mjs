import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assessDelta,
  compileRoute,
  dedupeSources,
  flashDecision,
  judgeHermesChallenge,
  promoteRoute,
  selfTest,
  tick,
  validateExternalPolicyProposal,
} from '../scripts/compiler.mjs';

const PASS = 'PASS';

function validInput(overrides = {}) {
  return {
    capability: 'SAFE_DEPLOY',
    boundary: 'repo:ServerVpss/CentralDark:scripts/deploy',
    sources: [
      { id: 'doc', class: 'OFFICIAL_DOC', provenance: 'docs://deploy', state: PASS, fingerprint: 'doc-v1' },
      { id: 'paper', class: 'ACADEMIC_PAPER', provenance: 'arxiv://agents', state: PASS, fingerprint: 'paper-v1' },
      { id: 'code', class: 'CODE', provenance: 'repo://scripts/deploy.mjs', state: PASS, fingerprint: 'code-v1' },
      { id: 'test', class: 'TEST', provenance: 'repo://scripts/deploy.test.mjs', state: PASS, fingerprint: 'test-v1' },
    ],
    findings: [
      { id: 'f-safe', state: PASS, reusable: true, source_ids: ['doc', 'paper', 'code', 'test'] },
    ],
    conflicts: [{ id: 'merge-vs-reset', status: 'RESOLVED' }],
    counterproof: { status: PASS, evidence: 'test://negative' },
    canonical_owner: 'docs/deploy-owner.md',
    callable_skill: '.agents/skills/safe-deploy/SKILL.md',
    real_consumer: 'scripts/deploy.mjs',
    test_ref: 'scripts/deploy.test.mjs',
    gate_ref: '.github/workflows/deploy.yml',
    dependencies: [
      { kind: 'PATH', id: 'scripts/deploy.mjs' },
      { kind: 'PATH', id: 'docs/deploy-owner.md' },
      { kind: 'CAPABILITY', id: 'SAFE_DEPLOY' },
      { kind: 'BOUNDARY', id: 'repo:ServerVpss/CentralDark:scripts/deploy' },
    ],
    compiled_from_head: '1111111111111111111111111111111111111111',
    ...overrides,
  };
}

function passReceipt(overrides = {}) {
  return {
    authority_valid: true,
    apply: PASS,
    proof: PASS,
    test: PASS,
    regression: PASS,
    final_counterproof: PASS,
    gate: PASS,
    verified_at_head: '2222222222222222222222222222222222222222',
    ...overrides,
  };
}

test('dedupe: muitas entradas idênticas não multiplicam evidência', () => {
  const sources = [
    { id: 'a', class: 'CODE', provenance: 'repo://a', state: PASS, fingerprint: 'same' },
    { id: 'b', class: 'CODE', provenance: 'repo://b', state: PASS, fingerprint: 'same' },
    { id: 'c', class: 'TEST', provenance: 'repo://c', state: PASS, fingerprint: 'other' },
  ];
  const result = dedupeSources(sources);
  assert.equal(result.unique.length, 2);
  assert.equal(result.dropped.length, 1);
});

test('forja: fontes + ouro provado + owner/skill/consumer/test/gate convergem em uma route_ir', () => {
  const compiled = compileRoute(validInput());
  assert.equal(compiled.status, 'COMPILED');
  assert.equal(typeof compiled.route_id, 'string');
  assert.equal(compiled.route_id.length, 24);
  assert.equal(compiled.route_ir.capability, 'SAFE_DEPLOY');
  assert.deepEqual(compiled.route_ir.proven_reusable_findings, ['f-safe']);
  assert.equal(compiled.route_ir.schema_version, 2);
  assert.equal(compiled.blockers.length, 0);
});

test('conflito não arbitrado impede FLASH', () => {
  const compiled = compileRoute(validInput({
    conflicts: [{ id: 'c1', status: 'UNRESOLVED' }],
  }));
  assert.equal(compiled.status, 'CANDIDATE');
  assert.ok(compiled.blockers.includes('UNRESOLVED_CONFLICT:c1'));
});

test('achado sem fonte PROVEN não pode virar ouro', () => {
  const compiled = compileRoute(validInput({
    sources: [{ id: 'blog', class: 'COMMUNITY', provenance: 'community://post', state: 'CANDIDATE' }],
    findings: [{ id: 'claim', state: PASS, reusable: true, source_ids: ['blog'] }],
  }));
  assert.equal(compiled.status, 'CANDIDATE');
  assert.ok(compiled.blockers.includes('PROVEN_FINDING_WITHOUT_PROVEN_SOURCE:claim'));
  assert.ok(compiled.blockers.includes('NO_PROVEN_REUSABLE_DELTA'));
});

test('conhecimento sem consumidor real fica knowledge-only, não cristal operacional', () => {
  const compiled = compileRoute(validInput({ real_consumer: '' }));
  assert.equal(compiled.status, 'CANDIDATE');
  assert.ok(compiled.blockers.includes('OPERATIONAL_CRYSTAL_FIELD_MISSING:real_consumer'));
});

test('MetaForja rejeita limiar externo numérico sem política local', () => {
  const policy = validateExternalPolicyProposal({
    kind: 'TOIL_AUTOMATION',
    numeric_threshold: 5,
    source_guideline: true,
  });
  assert.equal(policy.ok, false);
  assert.ok(policy.blockers.includes('EXTERNAL_NUMERIC_THRESHOLD_REQUIRES_LOCAL_POLICY'));

  const compiled = compileRoute(validInput({ external_policy: {
    kind: 'TOIL_AUTOMATION',
    numeric_threshold: 5,
  } }));
  assert.equal(compiled.status, 'CANDIDATE');
});

test('MetaForja aceita guideline numérica somente com aplicabilidade local provada', () => {
  const policy = validateExternalPolicyProposal({
    kind: 'CI_GUIDELINE',
    numeric_threshold: 10,
    local_threshold_policy_proven: true,
    hard_gate: true,
    local_gate_policy_proven: true,
    source_guideline: true,
  });
  assert.equal(policy.ok, true);
  assert.ok(policy.warnings.includes('SOURCE_GUIDELINE_ACCEPTED_AS_GUIDANCE_NOT_HARD_POLICY'));
});

test('SLO não pode bloquear deploy sem SLI alvo janela policy owner e medição', () => {
  const blocked = validateExternalPolicyProposal({
    kind: 'SLO_POLICY',
    deploy_block: true,
    slo: { sli: 'availability' },
  });
  assert.equal(blocked.ok, false);
  assert.ok(blocked.blockers.some((value) => value.startsWith('SLO_DEPLOY_BLOCK_MISSING:')));

  const valid = validateExternalPolicyProposal({
    kind: 'SLO_POLICY',
    deploy_block: true,
    slo: {
      sli: 'successful_requests',
      target: '99.9%',
      window: '30d',
      policy_owner: 'service-owner',
      measurement_ref: 'metrics://service/sli',
    },
  });
  assert.equal(valid.ok, true);
});

test('rotina determinística não justifica agente novo por padrão', () => {
  const result = validateExternalPolicyProposal({
    kind: 'TOIL_AUTOMATION',
    deterministic_routine: true,
    new_agent_required: true,
  });
  assert.equal(result.ok, false);
  assert.ok(result.blockers.includes('DETERMINISTIC_TASK_BEFORE_AGENT'));
});

test('percepção memória ação não autorizam multiagente por default', () => {
  const result = validateExternalPolicyProposal({
    kind: 'AGENT_ARCHITECTURE',
    multi_agent_default: true,
  });
  assert.equal(result.ok, false);
  assert.ok(result.blockers.includes('MULTI_AGENT_DEFAULT_FORBIDDEN'));
});

test('Agentic RAG não transforma corpus inteiro em custo obrigatório de runtime', () => {
  const result = validateExternalPolicyProposal({
    kind: 'AGENTIC_RAG',
    full_corpus_every_runtime: true,
  });
  assert.equal(result.ok, false);
  assert.ok(result.blockers.includes('AGENTIC_RETRIEVAL_MUST_NOT_FORCE_FULL_CORPUS_RUNTIME'));
});

test('nome de engine não vira pin sem fitness observado e runtime disponível', () => {
  const blocked = validateExternalPolicyProposal({
    kind: 'ENGINE_SELECTION',
    engine_pin: 'o3',
  });
  assert.equal(blocked.ok, false);
  assert.ok(blocked.blockers.includes('ENGINE_PIN_REQUIRES_OBSERVED_FITNESS'));
  assert.ok(blocked.blockers.includes('ENGINE_PIN_REQUIRES_RUNTIME_AVAILABILITY'));

  const allowed = validateExternalPolicyProposal({
    kind: 'ENGINE_SELECTION',
    engine_pin: 'engine-observed',
    engine_fitness_observed: true,
    engine_runtime_available: true,
  });
  assert.equal(allowed.ok, true);
});

test('owner vindo de fonte externa não é owner canônico por nome', () => {
  const blocked = validateExternalPolicyProposal({
    kind: 'GENERIC',
    external_owner_name: 'slo-guard',
    canonical_owner_verified: false,
  });
  assert.equal(blocked.ok, false);
  assert.ok(blocked.blockers.includes('EXTERNAL_OWNER_NOT_CANONICAL_OWNER'));
});

test('placeholder não pode provar comportamento', () => {
  const blocked = validateExternalPolicyProposal({
    kind: 'GENERIC',
    placeholder_test: true,
    behavior_claim: 'PROVEN',
  });
  assert.equal(blocked.ok, false);
  assert.ok(blocked.blockers.includes('PLACEHOLDER_TEST_IS_NOT_BEHAVIOR_PROOF'));
});

test('promoção exige autoridade existente e todos os checks PASS', () => {
  const compiled = compileRoute(validInput());
  assert.equal(promoteRoute(compiled, passReceipt({ authority_valid: false })).status, 'BLOCKED');
  assert.equal(promoteRoute(compiled, passReceipt({ gate: 'UNKNOWN' })).status, 'PENDING');
  assert.equal(promoteRoute(compiled, passReceipt({ final_counterproof: 'FAIL' })).status, 'BLOCKED');

  const promoted = promoteRoute(compiled, passReceipt());
  assert.equal(promoted.status, 'FLASH_READY');
  assert.equal(promoted.route.state, 'FLASH_READY');
});

test('runtime FLASH reutiliza rota quando o delta não toca suas dependências', () => {
  const promoted = promoteRoute(compileRoute(validInput()), passReceipt());
  const decision = flashDecision(promoted.route, {
    changed_dependencies: ['PATH:apps/outro/modulo.mjs'],
    affected_capabilities: ['OUTRA_CAPACIDADE'],
  });
  assert.equal(decision.decision, 'EXECUTE_FLASH_ROUTE');
  assert.deepEqual(decision.load, ['ROUTE_IR', 'CANONICAL_OWNER', 'CALLABLE_SKILL', 'LIVE_STATE', 'APPLICABLE_PROOF']);
});

test('delta afetado invalida só a rota dependente', () => {
  const promoted = promoteRoute(compileRoute(validInput()), passReceipt());
  const affected = assessDelta(promoted.route, {
    changed_dependencies: ['PATH:scripts/deploy.mjs'],
  });
  assert.equal(affected.stale, true);
  assert.equal(affected.reason, 'AFFECTED_DELTA_RECOMPILE_REQUIRED');

  const decision = flashDecision(promoted.route, {
    changed_dependencies: ['PATH:scripts/deploy.mjs'],
  });
  assert.equal(decision.decision, 'RECOMPILE_DELTA');
});

test('nova fonte só invalida quando declarada relevante à capacidade', () => {
  const promoted = promoteRoute(compileRoute(validInput()), passReceipt());
  assert.equal(
    assessDelta(promoted.route, { new_source_relevant_to_capability: 'OUTRA_CAPACIDADE' }).stale,
    false,
  );
  assert.equal(
    assessDelta(promoted.route, { new_source_relevant_to_capability: 'SAFE_DEPLOY' }).stale,
    true,
  );
});

test('TICK é recibo comprimido; não contém scratchpad/cadeia privada', () => {
  const receipt = tick({
    phase: 'COMPILE',
    delta: '3 sources -> 1 route',
    owner: 'docs/deploy-owner.md',
    route: 'abc',
    blocker: 0,
    next: 'VERIFY',
  });
  assert.deepEqual(Object.keys(receipt).sort(), ['blocker', 'delta', 'next', 'owner', 'phase', 'route']);
  assert.equal(receipt.phase, 'COMPILE');
});


test('desafio Hermes: só ganha Instinto Superior com missão fechada no CURRENT e proof readback', () => {
  const head = '3333333333333333333333333333333333333333';
  const route_input = validInput({ compiled_from_head: head });
  const winner = {
    challenge_id: 'hermes-missao-1',
    owner: route_input.canonical_owner,
    boundary: route_input.boundary,
    current_head: head,
    source_review: 'PASS',
    win_conditions: [{ id: 'prova-real', state: 'PASS', evidence_ref: 'receipt://goal/t1' }],
    route_input,
    promotion_receipt: passReceipt({ verified_at_head: head }),
    runtime_effect: { status: 'PASS', evidence_ref: 'runtime://test/200+effect' },
    readback: { status: 'PASS', evidence_ref: 'sha256://updated-owner' },
    last_good_preserved: true,
    receipt_ref: 'repo://receipts/goal',
    crystal_fingerprint: 'sha256:verified-crystal',
  };
  const good = judgeHermesChallenge(winner);
  assert.equal(good.tier, 'INSTINTO_SUPERIOR');
  assert.equal(good.status, 'WIN');
  assert.equal(good.reward.paid_entitlement, false);

  assert.notEqual(judgeHermesChallenge({
    ...winner, runtime_effect: { status: 'UNKNOWN' },
  }).tier, 'INSTINTO_SUPERIOR');
  assert.notEqual(judgeHermesChallenge({
    ...winner, win_conditions: [{ id: 'claim', state: 'PASS' }],
  }).tier, 'INSTINTO_SUPERIOR');
  assert.notEqual(judgeHermesChallenge({
    ...winner, promotion_receipt: passReceipt({ verified_at_head: head, gate: 'UNKNOWN' }),
  }).tier, 'INSTINTO_SUPERIOR');
  assert.notEqual(judgeHermesChallenge({
    ...winner, current_head: 'different-head',
  }).tier, 'INSTINTO_SUPERIOR');
  assert.equal(judgeHermesChallenge({
    ...winner, sensitive: true,
  }).status, 'QUARENTENA');
  assert.equal(judgeHermesChallenge({
    ...winner, duplicate: true,
  }).status, 'REUSE');
  assert.equal(judgeHermesChallenge({
    ...winner, promotion_receipt: passReceipt({ verified_at_head: head, authority_valid: false }),
  }).status, 'BLOCKED');
});

test('self-test do compilador fecha FORJA -> FLASH, política externa e delta seletivo', () => {
  const result = selfTest();
  assert.equal(result.ok, true);
  assert.equal(result.flash_ready, 'FLASH_READY');
  assert.equal(result.unaffected_decision, 'EXECUTE_FLASH_ROUTE');
  assert.equal(result.affected_decision, 'RECOMPILE_DELTA');
  assert.equal(result.external_threshold_blocked, 'CANDIDATE');
});
