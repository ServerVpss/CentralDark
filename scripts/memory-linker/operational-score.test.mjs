import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildHouseInventory } from '../../apps/modulos/hub/scripts/house-inventory-core.mjs';
import {
  OPERATIONAL_SCORE_REGISTRY,
  composeOperationalScore,
  createMachineEvent,
  extractMusicBehavioralMaterial,
  getSkillSignature,
  renderHumanPresentation,
} from './operational-score.mjs';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

function event(capability = 'META_LUPA', eventId = 'e1') {
  return createMachineEvent({ capability, state: 'ACTIVE', event: 'TEST_EVENT', eventId, sessionId: 's1', evidenceRef: 'test' });
}

test('A capability mantém significado e fingerprint estáveis', () => {
  const a = getSkillSignature('META_LUPA');
  const b = getSkillSignature('META_LUPA');
  assert.equal(a.capability_id, b.capability_id);
  assert.equal(a.semantic_role, b.semantic_role);
  assert.equal(a.fingerprint, b.fingerprint);
});

test('B/C apresentação variável e epoch não alteram evento estruturado', () => {
  const machine = event('MINERACAO');
  const a = renderHumanPresentation(machine, { presentationEpoch: 1 });
  const b = renderHumanPresentation(machine, { presentationEpoch: 2 });
  assert.deepEqual(a.machine_event, machine);
  assert.deepEqual(b.machine_event, machine);
  assert.equal(a.machine_event.capability, 'MINERACAO');
});

test('D assinatura desconhecida falha de maneira segura', () => {
  assert.equal(getSkillSignature('NAO_EXISTE'), null);
  assert.throws(() => createMachineEvent({ capability: 'NAO_EXISTE', event: 'X' }), /UNKNOWN_CAPABILITY/);
});

test('E capability inexistente não é exibida como ativa', () => {
  assert.throws(() => renderHumanPresentation({ capability: 'FANTASMA', state: 'ACTIVE', event: 'X' }), /UNKNOWN_CAPABILITY/);
});

test('F composição preserva IDs individuais', () => {
  const events = [event('META_LUPA', '1'), event('METACOGNICAO', '2'), event('MINERACAO', '3')];
  const score = composeOperationalScore(events);
  assert.deepEqual(score.map((item) => item.machine_event.capability), ['META_LUPA', 'METACOGNICAO', 'MINERACAO']);
});

test('G evento estruturado existe sem depender de emoji', () => {
  const machine = event('SELF_HEAL');
  assert.deepEqual(Object.keys(machine).slice(0, 3), ['schema_version', 'capability', 'state']);
  assert.equal(JSON.stringify(machine).includes('🔧'), false);
});

test('H renderer funciona sem música externa', () => {
  const rendered = renderHumanPresentation(event('SENTINELA'));
  assert.match(rendered.presentation, /SENTINELA/);
});

test('I material musical vira somente hipótese candidata e reconhece contrato PT-BR', () => {
  const result = extractMusicBehavioralMaterial({ observations: ['crescendo', 'dissonância', 'resolução'], sourceRef: 'artifact:music' });
  assert.equal(result.status, 'CANDIDATE_ONLY');
  assert.equal(result.direct_skill_write, false);
  assert.equal(result.execute_action, false);
  assert.equal(result.source_is_authority, false);
  assert.equal(result.dedupe_required, true);
  assert.equal(result.counterproof_required, true);
  assert.deepEqual(result.hypotheses.map((item) => item.behavioral_hypothesis).sort(), ['INCREASE_DEPTH_WHILE_INFORMATION_GAIN', 'INVESTIGATE_CONFLICTING_EVIDENCE', 'PROVEN_CLOSURE'].sort());
});

test('J observações repetidas não duplicam abstração', () => {
  const result = extractMusicBehavioralMaterial({ observations: ['ritmo forte', 'rhythm repetido', 'tempo rápido'] });
  assert.equal(result.hypotheses.filter((item) => item.behavioral_hypothesis === 'CADENCE').length, 1);
});

test('K aprendizado material chega ao owner, Inventário e consumidor real', () => {
  const material = extractMusicBehavioralMaterial({ observations: ['ponte', 'contraponto'], sourceRef: 'artifact:score' });
  assert.equal(material.owner, 'scripts/memory-linker/operational-score.mjs');
  assert.equal(material.direct_skill_write, false);
  for (const id of Object.keys(OPERATIONAL_SCORE_REGISTRY)) {
    const signature = getSkillSignature(id);
    assert.equal(signature.owner, 'scripts/memory-linker/operational-score.mjs');
    assert.ok(signature.semantic_role);
  }
  const inventory = buildHouseInventory(repoRoot, { revision: 'TEST_HEAD' });
  const indexed = inventory.items.find((item) => item.id === 'capability:operational-score');
  assert.ok(indexed, 'Operational Score precisa ser herdável pelo Inventário da Casa');
  assert.equal(indexed.owner, 'scripts/memory-linker/operational-score.mjs');
  assert.equal(indexed.proof, 'scripts/memory-linker/operational-score.test.mjs');
  const scout = fs.readFileSync(new URL('./memory-linker-agent.mjs', import.meta.url), 'utf8');
  assert.match(scout, /createMachineEvent\(\{[\s\S]*capability: 'MINERACAO',[\s\S]*event: 'SOURCE_DELTA_DETECTED'/);
  assert.match(scout, /OPERATIONAL_SCORE_EVENT=/);
});

test('L erro desconhecido permanece explícito', () => {
  assert.throws(() => createMachineEvent({ capability: '', event: 'X' }), /UNKNOWN_CAPABILITY/);
});

test('M ZERO_DEPLOY por construção: módulo não possui capability destrutiva nem dispara ação', () => {
  assert.equal(Object.hasOwn(OPERATIONAL_SCORE_REGISTRY, 'DEPLOY'), false);
  assert.equal(Object.keys(OPERATIONAL_SCORE_REGISTRY).some((id) => /DELETE|DEPLOY|RESTART|RESET/.test(id)), false);
  const material = extractMusicBehavioralMaterial({ observations: ['clímax'] });
  assert.equal(material.execute_action, false);
});

test('N antirrepetição não muda evento e NO_NEW_INFORMATION não emite partitura', () => {
  const machine = event('MINERACAO', 'same');
  const base = renderHumanPresentation(machine, { presentationEpoch: 0 });
  const changed = renderHumanPresentation(machine, { presentationEpoch: 0, recentSignatures: [base.visual] });
  assert.deepEqual(changed.machine_event, machine);
  assert.notEqual(changed.visual, base.visual);
  const all = getSkillSignature('MINERACAO').visual_candidates;
  const fallback = renderHumanPresentation(machine, { recentSignatures: all });
  assert.ok(all.includes(fallback.visual));

  const scout = fs.readFileSync(new URL('./memory-linker-agent.mjs', import.meta.url), 'utf8');
  const noInfoStart = scout.indexOf('if (!informationGain(previousFingerprint, currentFingerprint))');
  const scoreStart = scout.indexOf('const scoreEvent = createMachineEvent');
  const earlyExit = scout.indexOf('process.exit(0);', noInfoStart);
  assert.ok(noInfoStart >= 0 && earlyExit > noInfoStart && scoreStart > earlyExit, 'partitura só pode nascer depois do early exit de NO_NEW_INFORMATION');
});

test('O próxima sessão importa o mesmo cristal sem depender deste processo', async () => {
  const nextSession = await import(new URL('./operational-score.mjs?session=next', import.meta.url));
  const signature = nextSession.getSkillSignature('CRISTALIZACAO');
  assert.equal(signature.capability_id, 'CRISTALIZACAO');
  assert.equal(signature.owner, 'scripts/memory-linker/operational-score.mjs');
});

test('silêncio musical mapeia NO_NEW_INFORMATION sem disparar ação', () => {
  const result = extractMusicBehavioralMaterial({ interpretation: 'silêncio após convergência' });
  assert.equal(result.hypotheses[0].behavioral_hypothesis, 'NO_NEW_INFORMATION');
  assert.equal(result.execute_action, false);
});
