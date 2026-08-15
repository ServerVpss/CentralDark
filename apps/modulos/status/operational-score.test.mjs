import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

import { aggregateCapsule, validateEvent } from './capsula-observavel.mjs';
import {
  CAPABILITY_SIGNATURES,
  OPERATIONAL_SCORE_CONTRACT,
  compileBehavioralMaterial,
  renderOperationalScore,
  selectSkillSignature,
  validateSignatureRegistry,
} from './operational-score.mjs';

const HASH = 'a'.repeat(64);
const DIGEST = '1'.repeat(40);

function event(overrides = {}) {
  return {
    schema_version: 1,
    capsule_id: 'CAPSULA-OPERATIONAL-SCORE',
    run_id: 'run-score-001',
    mission_id: 'mission-score-001',
    iteration: 1,
    timestamp_utc: '2026-08-15T23:30:00Z',
    phase: 'OBSERVE',
    candidate_ref: 'candidate@sha',
    candidate_digest: DIGEST,
    baseline_ref: 'baseline',
    fixture_ref: 'fixture',
    evaluator_ref: 'judge-read-only',
    writer: 'sol-writer',
    event_actor: 'sol-writer',
    action: 'medir partitura operacional',
    status: 'UNKNOWN',
    reason: '',
    chief_decision: 'PENDING',
    chief_receipt_ref: '',
    chief_receipt_hash: '',
    tests: { total: 1, pass: 0, fail: 1, skipped: 0 },
    evidence_hash: HASH,
    failure_observed: false,
    failure_fingerprint: '',
    new_failure_class: false,
    correction_verified: false,
    retained_after_retest: false,
    false_green_found: false,
    regression_found: false,
    active_capabilities: ['META_LUPA'],
    generalization: { pass: 0, total: 0 },
    retention: { pass: 0, total: 0 },
    ...overrides,
  };
}

function chiefPass(overrides = {}) {
  return event({
    phase: 'DECIDE',
    status: 'PASS',
    tests: { total: 3, pass: 3, fail: 0, skipped: 0 },
    event_actor: 'SEGREDO/CHEFE',
    chief_decision: 'APPROVED',
    chief_receipt_ref: 'github://ServerVpss/CentralDark/pull/912#chief-receipt',
    chief_receipt_hash: 'd'.repeat(64),
    evidence_hash: 'c'.repeat(64),
    ...overrides,
  });
}

test('registry tem ids estáveis e owners físicos no checkout', () => {
  assert.deepEqual(validateSignatureRegistry({ repoRoot: resolve(import.meta.dirname, '../../..') }), []);
  assert.equal(CAPABILITY_SIGNATURES.META_LUPA.semantic_role, 'investigacao_e_contraprova');
  assert.equal(CAPABILITY_SIGNATURES.ARTIFACT_TO_CAPABILITY.owner, 'scripts/memory-linker/artifact-capability.mjs');
  assert.equal(OPERATIONAL_SCORE_CONTRACT.ZERO_DEPLOY, true);
});

test('A/B/C: significado fica estável e variação visual não altera máquina', () => {
  const first = renderOperationalScore({ machineEvent: event(), activeCapabilities: ['META_LUPA'], presentationEpoch: 1 });
  const second = renderOperationalScore({ machineEvent: event(), activeCapabilities: ['META_LUPA'], presentationEpoch: 2 });
  assert.equal(first.active_capabilities[0].semantic_role, second.active_capabilities[0].semantic_role);
  assert.deepEqual(first.machine_event, second.machine_event);
  assert.equal(first.presentation_changes_behavior, false);
});

test('D/E: assinatura desconhecida falha fechada e não aparece ativa', () => {
  const result = renderOperationalScore({ machineEvent: event(), activeCapabilities: ['CAPABILITY_INEXISTENTE'] });
  assert.equal(result.status, 'PARTIAL_SAFE');
  assert.deepEqual(result.active_capabilities, []);
  assert.deepEqual(result.rejected_capabilities, ['CAPABILITY_INEXISTENTE']);
  assert.equal(selectSkillSignature('CAPABILITY_INEXISTENTE').active, false);
});

test('F: composição preserva ids individuais e não funde semântica', () => {
  const result = renderOperationalScore({ machineEvent: event(), activeCapabilities: ['META_LUPA', 'METACOGNICAO', 'MINERACAO'] });
  assert.deepEqual(result.active_capabilities.map((item) => item.capability_id), ['META_LUPA', 'METACOGNICAO', 'MINERACAO']);
  assert.equal(new Set(result.active_capabilities.map((item) => item.semantic_role)).size, 3);
});

test('G/H: evento estruturado funciona sem emoji e renderer sem marcador musical', () => {
  const result = renderOperationalScore({ machineEvent: event(), activeCapabilities: ['META_LUPA'], allowEmoji: false, allowMusic: false });
  assert.equal(result.authority, 'MACHINE_EVENT');
  assert.equal(result.machine_event.status, 'UNKNOWN');
  assert.equal(result.active_capabilities[0].presentation.emoji, '');
  assert.equal(result.active_capabilities[0].presentation.musical, '');
  assert.match(result.active_capabilities[0].presentation.label, /^META_LUPA — /);
});

test('I: música vira somente matéria comportamental candidata, nunca skill direta', () => {
  const material = compileBehavioralMaterial({ artifactClass: 'MUSIC', observableProperties: ['rhythm', 'pause', 'dissonance', 'resolution'] });
  assert.equal(material.status, 'CANDIDATE_ONLY');
  assert.equal(material.direct_skill_write, false);
  assert.equal(material.promotion_allowed, false);
  assert.equal(material.source_is_authority, false);
  assert.deepEqual(material.behavioral_hypotheses, [
    'INVESTIGATE_CONFLICTING_EVIDENCE',
    'OPERATIONAL_CADENCE',
    'PROVEN_CLOSURE',
    'WAIT_FOR_NEW_INFORMATION',
  ]);
});

test('J: propriedades e capacidades duplicadas são deduplicadas antes da projeção', () => {
  const material = compileBehavioralMaterial({ observableProperties: ['rhythm', 'RHYTHM', 'tempo'] });
  assert.deepEqual(material.behavioral_hypotheses, ['OPERATIONAL_CADENCE']);
  const result = renderOperationalScore({ machineEvent: event(), activeCapabilities: ['MINERACAO', 'MINERACAO'] });
  assert.equal(result.active_capabilities.length, 1);
});

test('K/O: cada assinatura aponta owner canônico descobrível por outra sessão', () => {
  for (const signature of Object.values(CAPABILITY_SIGNATURES)) assert.ok(signature.owner.length > 0);
  const again = selectSkillSignature('CRISTALIZACAO', { eventId: 'outro-evento', sessionId: 'outra-sessao' });
  assert.equal(again.owner, CAPABILITY_SIGNATURES.CRISTALIZACAO.owner);
  assert.equal(again.semantic_role, CAPABILITY_SIGNATURES.CRISTALIZACAO.semantic_role);
});

test('L: erro material continua explicitamente visível e emoji não mascara status', () => {
  const result = renderOperationalScore({
    machineEvent: event({ status: 'FAIL', action: 'regressao detectada', failure_observed: true, failure_fingerprint: 'regressao-x' }),
    activeCapabilities: ['META_LUPA'],
  });
  assert.equal(result.machine_event.status, 'FAIL');
  assert.match(result.human_presentation[0], /FAIL — regressao detectada/);
});

test('M: projeção declara zero deploy', () => {
  const result = renderOperationalScore({ machineEvent: event(), activeCapabilities: ['FIXED_POINT'] });
  assert.equal(result.zero_deploy, true);
  assert.equal(OPERATIONAL_SCORE_CONTRACT.ZERO_DEPLOY, true);
});

test('N: ausência de capacidade nova não gera spam visual', () => {
  const result = renderOperationalScore({ machineEvent: event(), activeCapabilities: [] });
  assert.equal(result.status, 'NO_CHANGE');
  assert.deepEqual(result.human_presentation, []);
});

test('evento inválido ou rejeitado pela cápsula bloqueia antes de qualquer apresentação', () => {
  const invalid = event({ evidence_hash: 'quebrado' });
  const result = renderOperationalScore({ machineEvent: invalid, activeCapabilities: ['META_LUPA'], validationProblems: validateEvent(invalid) });
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.reason, 'INVALID_MACHINE_EVENT');
  assert.deepEqual(result.human_presentation, []);
});

test('partitura é derivada do active_capabilities do evento real', () => {
  const snapshot = aggregateCapsule([event({ active_capabilities: ['META_LUPA', 'METACOGNICAO'] })], { generatedAt: '2026-08-15T23:31:00Z' });
  assert.equal(snapshot.validation.verdict, 'PASS');
  assert.deepEqual(snapshot.capsule.current_run.active_capabilities, ['META_LUPA', 'METACOGNICAO']);
  assert.deepEqual(snapshot.operational_score.active_capabilities.map((item) => item.capability_id), ['META_LUPA', 'METACOGNICAO']);
  assert.equal(snapshot.operational_score.authority, 'MACHINE_EVENT');
});

test('capability desconhecida não vira ativa e bloqueia promoção mesmo com PASS do run', () => {
  const snapshot = aggregateCapsule([chiefPass({ active_capabilities: ['CAPABILITY_INEXISTENTE'] })]);
  assert.equal(snapshot.validation.verdict, 'PASS');
  assert.equal(snapshot.operational_score.status, 'PARTIAL_SAFE');
  assert.deepEqual(snapshot.operational_score.active_capabilities, []);
  assert.equal(snapshot.capsule.ready_for_promotion, false);
});

test('active_capabilities duplicada ou malformada é rejeitada pelo evento canônico', () => {
  assert.match(validateEvent(event({ active_capabilities: ['META_LUPA', 'META_LUPA'] })).join(' '), /ACTIVE_CAPABILITY_DUPLICATE/);
  assert.match(validateEvent(event({ active_capabilities: ['meta lupa'] })).join(' '), /ACTIVE_CAPABILITY_ID_INVALID/);
});

test('sem active_capabilities a cápsula não inventa orquestra', () => {
  const snapshot = aggregateCapsule([event({ active_capabilities: [] })]);
  assert.equal(snapshot.operational_score.status, 'NO_CHANGE');
  assert.deepEqual(snapshot.operational_score.human_presentation, []);
});
