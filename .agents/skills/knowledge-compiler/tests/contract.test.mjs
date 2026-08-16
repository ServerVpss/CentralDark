import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const contractUrl = new URL('../contract.json', import.meta.url);
const crystalUrl = new URL('../crystal-route.json', import.meta.url);
const skillUrl = new URL('../SKILL.md', import.meta.url);
const protocolUrl = new URL('../../../../docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md', import.meta.url);

test('contrato é projeção global model-neutral sem segundo cérebro', async () => {
  const contract = JSON.parse(await readFile(contractUrl, 'utf8'));
  assert.equal(contract.contract_id, 'CENTRALDARK_KNOWLEDGE_COMPILER');
  assert.equal(contract.status, 'CANONICAL_PROJECTION');
  assert.equal(contract.house_wide, true);
  assert.equal(contract.model_neutral, true);
  assert.equal(contract.second_brain, false);
  assert.equal(contract.source_is_provenance_not_authority, true);
  assert.equal(contract.supercommand, 'COMPILE_THEN_APPLY');
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
    'FLASH_DOES_NOT_REPLAY_FULL_INGESTION=true',
    'DELTA_AFFECTED_ONLY=true',
    'ONE_ACTIVE_ROUTE_PER_CAPABILITY_BOUNDARY=true',
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
