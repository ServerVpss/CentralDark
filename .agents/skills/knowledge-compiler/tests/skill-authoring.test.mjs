import assert from 'node:assert/strict';
import test from 'node:test';

import {
  skillCreationDecision,
  validateSkillAuthoring,
} from '../scripts/skill-authoring.mjs';

function validSkill(overrides = {}) {
  return {
    repeated_across_sessions: true,
    directory: '.agents/skills/reviewing-evidence',
    actionable_steps: 2,
    content: `---\nname: reviewing-evidence\ndescription: Revisa evidência operacional com contraprova determinística.\n---\n\n# Reviewing evidence\n\n1. Medir o alvo.\n2. Contraprovar o claim.`,
    ...overrides,
  };
}

test('repetição ou erro prevenível sinaliza skill reutilizável', () => {
  assert.equal(skillCreationDecision({ repeated_across_sessions: true }).decision, 'VALIDATE_NEW_SKILL');
  assert.equal(skillCreationDecision({ preventable_recurrent_error: true }).decision, 'VALIDATE_NEW_SKILL');
  assert.equal(skillCreationDecision({}).decision, 'NO_SKILL_NEEDED');
});

test('owner existente vence criação de skill paralela', () => {
  const result = validateSkillAuthoring({
    repeated_across_sessions: true,
    existing_owner_fits: true,
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, 'REUSE_EXISTING_OWNER');
  assert.equal(result.creation.create_skill, false);
});

test('skill válida usa raiz canônica da Casa e frontmatter mínimo', () => {
  const result = validateSkillAuthoring(validSkill());
  assert.equal(result.ok, true);
  assert.equal(result.status, 'PASS');
  assert.equal(result.normalized.expected_skill_path, '.agents/skills/reviewing-evidence/SKILL.md');
  assert.deepEqual(result.normalized.frontmatter_keys, ['name', 'description']);
});

test('campo extra no frontmatter é bloqueado', () => {
  const result = validateSkillAuthoring(validSkill({
    content: `---\nname: reviewing-evidence\ndescription: Revisa evidência.\nversion: 2\n---\n\n1. Medir.`,
    actionable_steps: 1,
  }));
  assert.equal(result.ok, false);
  assert.ok(result.blockers.includes('FRONTMATTER_EXTRA_FIELD:version'));
});

test('campo duplicado no frontmatter é bloqueado', () => {
  const result = validateSkillAuthoring(validSkill({
    content: `---\nname: reviewing-evidence\nname: reviewing-evidence\ndescription: Revisa evidência.\n---\n\n1. Medir.`,
    actionable_steps: 1,
  }));
  assert.equal(result.ok, false);
  assert.ok(result.blockers.includes('FRONTMATTER_DUPLICATE_FIELD:name'));
});

test('nome deve ser lowercase-hyphenated e casar com diretório', () => {
  const badName = validateSkillAuthoring(validSkill({
    directory: '.agents/skills/reviewing-evidence',
    content: `---\nname: Reviewing_Evidence\ndescription: Revisa evidência.\n---\n\n1. Medir.`,
    actionable_steps: 1,
  }));
  assert.ok(badName.blockers.includes('SKILL_NAME_NOT_LOWERCASE_HYPHENATED'));
  assert.ok(badName.blockers.includes('SKILL_NAME_DIRECTORY_MISMATCH'));
});

test('descrição e arquivo respeitam limites determinísticos', () => {
  const longDescription = 'x'.repeat(1025);
  const tooLong = validateSkillAuthoring(validSkill({
    content: `---\nname: reviewing-evidence\ndescription: ${longDescription}\n---\n\n${Array.from({ length: 501 }, (_, i) => `${i + 1}. passo`).join('\n')}`,
    actionable_steps: 501,
  }));
  assert.ok(tooLong.blockers.includes('SKILL_DESCRIPTION_TOO_LONG'));
  assert.ok(tooLong.blockers.includes('SKILL_FILE_TOO_LONG'));
});

test('conhecimento genérico e skill sem passos acionáveis não viram capacidade', () => {
  const result = validateSkillAuthoring(validSkill({
    generic_knowledge: true,
    actionable_steps: 0,
  }));
  assert.ok(result.blockers.includes('GENERIC_KNOWLEDGE_SHOULD_NOT_BECOME_SKILL'));
  assert.ok(result.blockers.includes('ACTIONABLE_STEPS_REQUIRED'));
});

test('CLI e raiz externas não são importadas como dependência da Casa', () => {
  const result = validateSkillAuthoring(validSkill({
    actionable_steps: 1,
    content: `---\nname: reviewing-evidence\ndescription: Revisa evidência.\n---\n\n1. Execute bpsai-pair skill validate em .claude/skills/reviewing-evidence.`,
  }));
  assert.equal(result.ok, false);
  assert.ok(result.blockers.includes('EXTERNAL_CLI_NOT_HOUSE_DEPENDENCY'));
  assert.ok(result.warnings.includes('EXTERNAL_SKILL_ROOT_NOT_IMPORTED_USE_DOT_AGENTS_SKILLS'));
});

test('gerúndio e terceira pessoa ficam como orientação da fonte, não hard gate global', () => {
  const result = validateSkillAuthoring(validSkill({
    require_gerund: true,
    require_third_person: true,
  }));
  assert.equal(result.ok, true);
  assert.ok(result.warnings.includes('GERUND_STYLE_IS_SOURCE_GUIDANCE_NOT_HOUSE_GATE'));
  assert.ok(result.warnings.includes('THIRD_PERSON_STYLE_IS_SOURCE_GUIDANCE_NOT_HOUSE_GATE'));
});
