import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assessDelta,
  compileRoute,
  dedupeSources,
  flashDecision,
  promoteRoute,
  selfTest,
  tick,
} from '../scripts/compiler.mjs';

const PASS = 'PASS';

function validInput(overrides = {}) {
  return {
    capability: 'SAFE_DEPLOY',
    boundary: 'repo:ServerVpss/CentralDark:scripts/deploy',
    sources: [
      { id: 'doc', class: 'OFFICIAL_DOC', provenance: 'docs://deploy', state: PASS, fingerprint: 'doc-v1' },
      { id: 'code', class: 'CODE', provenance: 'repo://scripts/deploy.mjs', state: PASS, fingerprint: 'code-v1' },
      { id: 'test', class: 'TEST', provenance: 'repo://scripts/deploy.test.mjs', state: PASS, fingerprint: 'test-v1' },
    ],
    findings: [
      { id: 'f-safe', state: PASS, reusable: true, source_ids: ['doc', 'code', 'test'] },
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

test('self-test do compilador fecha FORJA -> FLASH e delta seletivo', () => {
  const result = selfTest();
  assert.equal(result.ok, true);
  assert.equal(result.flash_ready, 'FLASH_READY');
  assert.equal(result.unaffected_decision, 'EXECUTE_FLASH_ROUTE');
  assert.equal(result.affected_decision, 'RECOMPILE_DELTA');
});
