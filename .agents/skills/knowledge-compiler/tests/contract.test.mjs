import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const contractUrl = new URL('../contract.json', import.meta.url);
const crystalUrl = new URL('../crystal-route.json', import.meta.url);
const skillUrl = new URL('../SKILL.md', import.meta.url);
const protocolUrl = new URL('../../../../docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md', import.meta.url);

test('contrato é projeção global model-neutral sem segundo cérebro', async () => {
  const contract = JSON.parse(await readFile(contractUrl, 'utf8'));
  assert.equal(contract.schema_version, 2);
  assert.equal(contract.contract_id, 'CENTRALDARK_KNOWLEDGE_COMPILER');
  assert.equal(contract.status, 'CANONICAL_PROJECTION');
  assert.equal(contract.house_wide, true);
  assert.equal(contract.model_neutral, true);
  assert.equal(contract.second_brain, false);
  assert.equal(contract.source_is_provenance_not_authority, true);
  assert.equal(contract.supercommand, 'COMPILE_THEN_APPLY');
});

test('MetaForja reaplica CROSS-META existente e não cria lente/cérebro novo', async () => {
  const contract = JSON.parse(await readFile(contractUrl, 'utf8'));
  assert.equal(contract.meta_forge.alias, 'FORGE_PLUS_EXISTING_CROSS_META');
  assert.equal(contract.meta_forge.is_new_lens, false);
  assert.equal(contract.meta_forge.meta_crystal_is_new_lens, false);
  assert.equal(contract.meta_forge.output, 'ONE_OPERATIONAL_CRYSTAL_ROUTE_PER_CAPABILITY_BOUNDARY');
});

test('owner skill cristal consumer test gate ficam ligados no mesmo contrato', async () => {
  const contract = JSON.parse(await readFile(contractUrl, 'utf8'));
  assert.equal(contract.conceptual_owner, 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md');
  assert.equal(contract.execution_owner, 'docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md');
  assert.equal(contract.skill, '.agents/skills/knowledge-compiler/SKILL.md');
  assert.equal(contract.crystal_route, '.agents/skills/knowledge-compiler/crystal-route.json');
  assert.equal(contract.consumer, '.agents/skills/knowledge-compiler/scripts/compiler.mjs');
  assert.equal(contract.regression, '.agents/skills/knowledge-compiler/tests/compiler.test.mjs');
  assert.equal(contract.gate, '.github/workflows/lupa-conformance.yml');
  assert.equal(contract.operational_crystal.one_active_route_per_capability_boundary, true);
  assert.equal(contract.operational_crystal.knowledge_without_consumer_is_operational, false);
});

test('política externa não importa thresholds owners agentes ou modelos por prestígio', async () => {
  const contract = JSON.parse(await readFile(contractUrl, 'utf8'));
  const policy = contract.external_source_policy;
  assert.equal(policy.source_pattern_is_house_policy, false);
  assert.equal(policy.placeholder_test_is_behavior_proof, false);
  assert.equal(policy.external_owner_name_is_canonical_owner, false);
  assert.equal(policy.external_numeric_target_requires_local_fit_or_explicit_policy, true);
  assert.equal(policy.source_guideline_as_hard_gate_requires_local_policy, true);
  assert.equal(policy.toil.universal_percentage, false);
  assert.equal(policy.agents.module_requires_new_agent, false);
  assert.equal(policy.agents.multi_agent_default, false);
  assert.equal(policy.retrieval.context_load, 'ON_DEMAND');
  assert.equal(policy.engine.model_name_is_authority, false);
  assert.equal(policy.engine.hard_pin_requires_observed_fitness, true);
  assert.equal(policy.engine.hard_pin_requires_runtime_availability, true);
});

test('cristal dogfood fecha exatamente uma capacidade/fronteira em uma rota', async () => {
  const crystal = JSON.parse(await readFile(crystalUrl, 'utf8'));
  assert.equal(crystal.artifact_kind, 'COMPILED_CRYSTAL_ROUTE_SPEC');
  assert.equal(crystal.crystal_id, 'CENTRALDARK_KNOWLEDGE_COMPILATION');
  assert.equal(crystal.route_id, 'b545f0d671eb7858f551facc');
  assert.equal(crystal.capability, 'KNOWLEDGE_COMPILATION');
  assert.equal(crystal.boundary, 'CENTRALDARK_HOUSE_COGNITIVE_SCAFFOLD');
  assert.equal(crystal.runtime_readiness, 'DECIDED_BY_LIVE_GATE_RECEIPT');
  assert.equal(crystal.invariants.one_active_route_per_capability_boundary, true);
  assert.equal(crystal.invariants.compile_once_reuse_many, true);
  assert.equal(crystal.invariants.delta_affected_only, true);
  assert.equal(crystal.compiled_route.filter((step) => step === 'CRYSTALLIZE').length, 1);
});

test('FORJA e FLASH preservam compilação uma vez + invalidação seletiva', async () => {
  const contract = JSON.parse(await readFile(contractUrl, 'utf8'));
  assert.equal(contract.forge.dedupe_required, true);
  assert.equal(contract.forge.unresolved_conflict_blocks_flash, true);
  assert.ok(contract.forge.accepted_source_classes.includes('ACADEMIC_PAPER'));
  assert.equal(contract.flash.replay_full_ingestion, false);
  assert.equal(contract.flash.raw_corpus_load, 'ON_DEMAND');
  assert.equal(contract.flash.compile_once_reuse_many, true);
  assert.equal(contract.invalidation.delta_affected_only, true);
  assert.equal(contract.invalidation.preserve_unaffected_routes, true);
});

test('skill e protocolo materializam a mesma rota curta', async () => {
  const [skill, protocol] = await Promise.all([
    readFile(skillUrl, 'utf8'),
    readFile(protocolUrl, 'utf8'),
  ]);

  for (const marker of [
    'COMPILE_THEN_APPLY',
    'MINERAR_UMA_VEZ',
    'CRISTALIZAR_UMA_VEZ',
    'REUTILIZAR_N_VEZES',
    'META_FORJA_IS_NEW_LENS=false',
    'NO_UNIVERSAL_TOIL_PERCENTAGE=true',
    'SLO_POLICY_IS_SERVICE_SPECIFIC=true',
    'MODULE != NEW_AGENT',
    'ARCHITECTURE != O3_HARDCODE',
    'FLASH_DOES_NOT_REPLAY_FULL_INGESTION=true',
    'DELTA_AFFECTED_ONLY=true',
  ]) {
    assert.ok(skill.includes(marker), `SKILL_MARKER_MISSING:${marker}`);
  }

  for (const marker of [
    'COMPILE_THEN_APPLY=true',
    'PLAN_ONLY_BEFORE_ROUTE_READY=true',
    'DELTA_AFFECTED_ONLY=true',
    'ONE_ACTIVE_ROUTE_PER_CAPABILITY_BOUNDARY=true',
    'COMPILED_ROUTE != AUTHORIZATION',
  ]) {
    assert.ok(protocol.includes(marker), `PROTOCOL_MARKER_MISSING:${marker}`);
  }
});
