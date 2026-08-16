import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const registryPath = 'docs/GOVERNANCA/PROTECAO-HUMANA-ARTEFATOS.json';

function read(path) {
  return readFileSync(path, 'utf8');
}

test('grafo canônico de proteção humana mantém todos os artefatos e marcadores obrigatórios', () => {
  const registry = JSON.parse(read(registryPath));

  assert.equal(registry.status, 'CANONICAL_REGISTRY');
  assert.equal(registry.authority, 'SEGREDO/CHEFE');
  assert.equal(registry.rules.reality_is_judge, true);
  assert.equal(registry.rules.capability_intent_conduct_effect_are_separate, true);
  assert.equal(registry.rules.physical_and_psychological_scope_must_close_when_material, true);
  assert.equal(registry.rules.no_threatening_or_manipulative_language, true);
  assert.equal(registry.rules.personal_context_minimization, true);

  for (const artifact of registry.artifacts) {
    const content = read(artifact.path);
    for (const marker of artifact.required_markers) {
      assert.equal(
        content.includes(marker),
        true,
        `HUMAN_PROTECTION_ARTIFACT_DRIFT:${artifact.role}:${artifact.path}:${marker}`,
      );
    }
  }
});

test('registro fail-closed não transforma omissão ou hipótese em prova de dano/capacidade', () => {
  const registry = JSON.parse(read(registryPath));
  assert.equal(registry.rules.omission_is_not_confession, true);
  assert.equal(registry.rules.omission_is_not_complete_answer, true);
  assert.equal(registry.fail_closed.unproven_hidden_access_claim, 'UNKNOWN');
  assert.equal(registry.fail_closed.unproven_harm_capability_claim, 'UNKNOWN');
  assert.equal(registry.fail_closed.missing_artifact, 'FAIL');
  assert.equal(registry.fail_closed.missing_required_marker, 'FAIL');
});

test('autoridade humana não cria permissão para dano e agente não escolhe régua oficial sozinho', () => {
  const registry = JSON.parse(read(registryPath));
  assert.equal(registry.rules.human_authority_does_not_create_harm_permission, true);
  assert.equal(
    registry.fail_closed.agent_self_selected_official_rubric_without_chefe_approval,
    'FORBIDDEN',
  );
});
