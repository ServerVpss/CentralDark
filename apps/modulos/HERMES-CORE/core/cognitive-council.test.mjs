import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CANDIDATE_POOL_PR_1104,
  COGNITIVE_LENSES,
  CORE_ATTACK_IDS,
  buildCognitiveCouncilPlan,
  createSourceProfile,
  evaluateUsefulCeiling,
  validateCognitiveCouncilPlan,
  validateSourceProfile,
} from './cognitive-council.mjs';

test('seis lentes funcionais cabem nos quatro ataques existentes sem novo writer', () => {
  const plan = buildCognitiveCouncilPlan();
  assert.equal(plan.perception_plane.lenses.length, 6);
  assert.equal(plan.execution.existing_core_attack_count, 4);
  assert.deepEqual([...plan.execution.existing_core_attacks].sort(), [...CORE_ATTACK_IDS].sort());
  assert.equal(plan.execution.extra_writer_slots, 0);
  assert.equal(plan.execution.additional_model_calls_required_by_plan, false);
  assert.equal(plan.execution.direct_mutation, false);
  assert.equal(plan.authority_plane.final_authority, 'SEGREDO/CHEFE');
  assert.equal(plan.authority_plane.coordinator, 'SOL');
  assert.equal(plan.perception_plane.model_vote_is_truth, false);
  assert.equal(validateCognitiveCouncilPlan(plan).ok, true);
});

test('pool historico carrega os 30 candidatos do PR 1104 sem promover nenhum a prova', () => {
  assert.equal(CANDIDATE_POOL_PR_1104.length, 30);
  assert.equal(new Set(CANDIDATE_POOL_PR_1104.map((item) => item.id)).size, 30);
  assert.ok(CANDIDATE_POOL_PR_1104.every((item) => item.source === 'PR#1104'));
  assert.ok(CANDIDATE_POOL_PR_1104.every((item) => item.source_state === 'HISTORICAL_CANDIDATE'));
  assert.ok(CANDIDATE_POOL_PR_1104.every((item) => item.promotion === 'CANDIDATE_NOT_PROOF'));
  assert.ok(CANDIDATE_POOL_PR_1104.every((item) => item.mapping_class === 'INFERENCE_MAPPING_2026_08_22'));
  assert.ok(CANDIDATE_POOL_PR_1104.every((item) => item.lenses.length >= 1));
  assert.ok(CANDIDATE_POOL_PR_1104.flatMap((item) => item.lenses).every((lens) => Object.hasOwn(COGNITIVE_LENSES, lens)));

  const plan = buildCognitiveCouncilPlan({ include_all_candidates: true });
  assert.equal(plan.candidate_pool.length, 30);
  assert.equal(plan.perception_plane.lenses.length, 6);
  assert.equal(validateCognitiveCouncilPlan(plan).ok, true);
});

test('fonte humana ou publica vira perfil de proveniencia, nunca persona, voto, autoridade ou writer', () => {
  const profile = createSourceProfile({
    source_id: 'user-supplied:example-source',
    display_name: 'Fonte publica de referencia',
    lenses: ['AUTOMATION_FACTORY', 'STRUCTURAL_SKEPTIC'],
    provenance_refs: ['USER_SUPPLIED_2026_08_22'],
    observed_claims: ['Somente claims observados em material recuperavel podem alimentar a lente.'],
  });
  assert.equal(validateSourceProfile(profile).ok, true);
  assert.equal(profile.authority, false);
  assert.equal(profile.writer, false);
  assert.equal(profile.persona_clone, false);
  assert.equal(profile.vote_weight, 0);

  const plan = buildCognitiveCouncilPlan({ source_profiles: [profile] });
  assert.equal(plan.perception_plane.source_profiles.length, 1);
  assert.equal(plan.perception_plane.source_profile_is_authority, false);
  assert.equal(plan.perception_plane.source_profile_is_persona_clone, false);
});

test('perfil de fonte adulterado para ganhar autoridade falha fechado', () => {
  const valid = createSourceProfile({
    source_id: 'source:a',
    display_name: 'A',
    lenses: ['IDENTITY_TRUST'],
  });
  const forged = { ...valid, authority: true };
  const validation = validateSourceProfile(forged);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.includes('SOURCE_PROFILE_AUTHORITY_FORBIDDEN'));
  assert.throws(
    () => buildCognitiveCouncilPlan({ source_profiles: [forged] }),
    /SOURCE_PROFILE_AUTHORITY_FORBIDDEN/,
  );
});

test('lente desconhecida nao entra por texto bonito', () => {
  assert.throws(
    () => buildCognitiveCouncilPlan({ requested_lenses: ['AGI_MAGIC'] }),
    /COGNITIVE_LENS_UNKNOWN:AGI_MAGIC/,
  );
});

test('teto util nao fecha enquanto existir UNKNOWN ou delta material pendente', () => {
  const unknown = evaluateUsefulCeiling({
    gaps: [{ id: 'runtime', state: 'UNKNOWN' }],
    new_information: false,
    material_delta_pending: false,
  });
  assert.equal(unknown.fixed_point, false);
  assert.equal(unknown.state, 'CONTINUE');
  assert.deepEqual(unknown.unresolved_gaps, ['runtime']);

  const pending = evaluateUsefulCeiling({
    gaps: [{ id: 'owner', state: 'RESOLVED', evidence_refs: ['test:owner'] }],
    material_delta_pending: true,
  });
  assert.equal(pending.fixed_point, false);
  assert.equal(pending.state, 'CONTINUE');
});

test('RESOLVED sem evidencia e BLOCKED sem causa exata nunca viram fechamento', () => {
  const result = evaluateUsefulCeiling({
    gaps: [
      { id: 'sem-prova', state: 'RESOLVED' },
      { id: 'bloqueio-vago', state: 'BLOCKED' },
    ],
  });
  assert.equal(result.fixed_point, false);
  assert.equal(result.state, 'INVALID_RECEIPT');
  assert.ok(result.invalid_receipts.includes('sem-prova:RESOLVED_WITHOUT_EVIDENCE'));
  assert.ok(result.invalid_receipts.includes('bloqueio-vago:BLOCKED_WITHOUT_CAUSE'));
  assert.ok(result.invalid_receipts.includes('bloqueio-vago:BLOCKED_WITHOUT_OWNER'));
  assert.ok(result.invalid_receipts.includes('bloqueio-vago:BLOCKED_WITHOUT_NEXT_CONDITION'));
});

test('bloqueio exato e honesto chega a fronteira, mas nao finge fixed point', () => {
  const result = evaluateUsefulCeiling({
    gaps: [{
      id: 'runtime-externo',
      state: 'BLOCKED',
      cause: 'INSTRUMENT_UNAVAILABLE',
      owner: 'runtime',
      next_condition: 'runner online e nova medicao',
    }],
  });
  assert.equal(result.fixed_point, false);
  assert.equal(result.blocked_boundary, true);
  assert.equal(result.state, 'BLOCKED_AT_EXACT_BOUNDARY');
});

test('fixed point so nasce quando todo gap material terminou com prova e nao apareceu informacao nova', () => {
  const result = evaluateUsefulCeiling({
    gaps: [
      { id: 'owner', state: 'RESOLVED', evidence_refs: ['owner:test:PASS'] },
      { id: 'sem-runtime', state: 'NOT_APPLICABLE' },
    ],
    new_information: false,
    material_delta_pending: false,
  });
  assert.equal(result.fixed_point, true);
  assert.equal(result.useful_ceiling_reached, true);
  assert.equal(result.state, 'FIXED_POINT');
  assert.equal(result.next_rule, 'STOP_NO_NEW_INFORMATION');
});
