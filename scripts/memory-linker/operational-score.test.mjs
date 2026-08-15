import assert from 'node:assert/strict';
import test from 'node:test';
import {
  OPERATIONAL_SCORE_REGISTRY,
  composeOperationalScore,
  createMachineEvent,
  extractMusicBehavioralMaterial,
  getSkillSignature,
  renderHumanPresentation,
} from './operational-score.mjs';

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

test('I material musical vira somente hipótese candidata', () => {
  const result = extractMusicBehavioralMaterial({ observations: ['crescendo', 'dissonance', 'resolution'], sourceRef: 'artifact:music' });
  assert.equal(result.status, 'CANDIDATE_ONLY');
  assert.equal(result.direct_skill_write, false);
  assert.equal(result.execute_action, false);
  assert.equal(result.source_is_authority, false);
  assert.deepEqual(result.hypotheses.map((item) => item.behavioral_hypothesis).sort(), ['INCREASE_DEPTH_WHILE_INFORMATION_GAIN', 'INVESTIGATE_CONFLICTING_EVIDENCE', 'PROVEN_CLOSURE'].sort());
});

test('J observações repetidas não duplicam abstração', () => {
  const result = extractMusicBehavioralMaterial({ observations: ['rhythm forte', 'rhythm repetido', 'tempo rápido'] });
  assert.equal(result.hypotheses.filter((item) => item.behavioral_hypothesis === 'CADENCE').length, 1);
});

test('K/L assinatura mantém owner e erro desconhecido permanece explícito', () => {
  for (const id of Object.keys(OPERATIONAL_SCORE_REGISTRY)) {
    const signature = getSkillSignature(id);
    assert.equal(signature.owner, 'scripts/memory-linker/operational-score.mjs');
    assert.ok(signature.semantic_role);
  }
  assert.throws(() => createMachineEvent({ capability: '', event: 'X' }), /UNKNOWN_CAPABILITY/);
});

test('M ZERO_DEPLOY por construção: módulo não expõe ação de deploy', () => {
  assert.equal('deploy' in OPERATIONAL_SCORE_REGISTRY, false);
  const material = extractMusicBehavioralMaterial({ observations: ['climax'] });
  assert.equal(material.execute_action, false);
});

test('N antirrepetição só troca apresentação e permite fallback', () => {
  const machine = event('MINERACAO', 'same');
  const base = renderHumanPresentation(machine, { presentationEpoch: 0 });
  const changed = renderHumanPresentation(machine, { presentationEpoch: 0, recentSignatures: [base.visual] });
  assert.deepEqual(changed.machine_event, machine);
  assert.notEqual(changed.visual, base.visual);
  const all = getSkillSignature('MINERACAO').visual_candidates;
  const fallback = renderHumanPresentation(machine, { recentSignatures: all });
  assert.ok(all.includes(fallback.visual));
});

test('silêncio musical mapeia NO_NEW_INFORMATION sem disparar ação', () => {
  const result = extractMusicBehavioralMaterial({ interpretation: 'silence after convergence' });
  assert.equal(result.hypotheses[0].behavioral_hypothesis, 'NO_NEW_INFORMATION');
  assert.equal(result.execute_action, false);
});
