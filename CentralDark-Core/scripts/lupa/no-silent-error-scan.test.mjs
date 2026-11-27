import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { classifyFindings, isActionableCodePath, scanText } from './no-silent-error-scan.mjs';

test('bloqueia catch JS vazio', () => {
  const code = ['try { work(); }', 'catch ', '{', '}'].join('');
  const findings = scanText(code, 'x.mjs');
  assert.equal(findings[0]?.id, 'EMPTY_CATCH_BLOCK');
});

test('bloqueia rejection handler vazio', () => {
  const code = 'audit().then(() => ok(), ' + '() => {' + '})';
  const findings = scanText(code, 'x.ts');
  assert.equal(findings[0]?.id, 'EMPTY_PROMISE_REJECTION_HANDLER');
});

test('recuperação explícita com endereço não é bloqueada pelo scanner sintático', () => {
  const code = `try { work(); } catch (error) { console.error('ERROR_ID=x stage=work', error); throw error; }`;
  assert.deepEqual(scanText(code, 'x.mjs'), []);
});

test('bloqueia except/pass Python', () => {
  const findings = scanText('try:\n    work()\nexcept Exception:\n    pass\n', 'x.py');
  assert.equal(findings[0]?.id, 'PY_EXCEPT_PASS');
});

test('teste, fixture, docs, backup, dist e minificado não viram dívida de runtime', () => {
  for (const path of [
    'scripts/x.test.mjs',
    'pkg/tests/a.js',
    'pkg/testes/a.py',
    'pkg/fixtures/a.js',
    'docs/example.js',
    'backups/old.js',
    'apps/x/dist/a.js',
    'public/vendor.min.js',
  ]) assert.equal(isActionableCodePath(path), false, path);
  assert.equal(isActionableCodePath('apps/modulos/hub/src/live.ts'), true);
});

test('catraca separa dívida antiga de violação em arquivo tocado', () => {
  const findings = [
    { id: 'EMPTY_CATCH_BLOCK', path: 'legacy/a.js', line: 1, excerpt: 'catch {}' },
    { id: 'EMPTY_CATCH_BLOCK', path: 'apps/live.js', line: 7, excerpt: 'catch {}' },
  ];
  const result = classifyFindings(findings, new Set(['apps/live.js']));
  assert.equal(result.legacy.length, 1);
  assert.equal(result.changed.length, 1);
  assert.equal(result.changed[0].path, 'apps/live.js');
});

test('SOUL mantém a invariante severa humano x máquina para toda a Casa', () => {
  const soul = readFileSync('docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md', 'utf8');
  const required = [
    'HOUSE_HUMAN_MACHINE_SAFETY_INVARIANT=true',
    'SEVERITY=HOUSE_CRITICAL',
    'APPLIES_TO_ALL_MODELS_AGENTS_SURFACES=true',
    'HUMAN_DIGNITY_NON_NEGOTIABLE=true',
    'NO_INTENTIONAL_PHYSICAL_HARM=true',
    'NO_INTENTIONAL_PSYCHOLOGICAL_HARM=true',
    'NO_THREAT_COERCION_MANIPULATION_HUMILIATION=true',
    'NO_ROLEPLAY_ESCAPE=true',
    'NO_METAPHOR_ESCAPE=true',
    'NO_QUALIFIER_ESCAPE=true',
    'NO_OMISSION_ESCAPE=true',
    'NO_AUTHORITY_ESCAPE=true',
    'PHYSICAL_DENIAL_WITHOUT_PSYCHOLOGICAL_CLOSURE_WHEN_MATERIAL=FAIL',
    'USER_NEEDS_SECOND_QUESTION_TO_DISCOVER_HARM_SCOPE=REGRESSION',
    'AMBIGUOUS_HARM_SCOPE=FAIL_CLOSED',
    'HARMFUL_SUBTASK=BLOCK',
    'SAFE_REMAINDER_OF_INTENT=PRESERVE_WHEN_SEPARABLE',
    'COUNTERPROOF_TARGETS_CLAIM_NOT_PERSON=true',
  ];
  for (const marker of required) {
    assert.equal(soul.includes(marker), true, `SOUL_MISSING_HUMAN_MACHINE_GUARD:${marker}`);
  }
});

test('Casa mantém minimização de contexto pessoal e proveniência temporal explícita', () => {
  const rule = readFileSync('docs/GOVERNANCA/CONTEXTO-PESSOAL-E-PROVENIENCIA-TEMPORAL.md', 'utf8');
  const incident = readFileSync('docs/APRENDIZADOS/2026-08-16-incidente-contexto-pessoal-proveniencia-temporal.md', 'utf8');
  const requiredRule = [
    'PERSONAL_CONTEXT_MINIMIZATION=true',
    'PERSONAL_CONTEXT_IS_NOT_DEFAULT_OUTPUT=true',
    'DO_NOT_SURFACE_LOCATION_UNLESS_REQUESTED_OR_MATERIAL=true',
    'REPOSITORY_HAS_NO_HUMAN_LOCAL_TIME=true',
    'REPO_EVENT_TIME = SOURCE_EVENT_TIMESTAMP',
    'LOCAL_TIME_CONVERSION = DERIVED_VIEW',
    'NO_LOCATION_REQUIRED_TO_REPORT_RAW_UTC_TIMESTAMP=true',
    'NO_PERSONAL_LOCATION_INFERENCE_FROM_REPO_TIMESTAMP=true',
    'DO_NOT_ESCALATE_WORDING_BEYOND_EVIDENCE=true',
  ];
  for (const marker of requiredRule) {
    assert.equal(rule.includes(marker), true, `MISSING_PERSONAL_CONTEXT_TIME_GUARD:${marker}`);
  }
  const requiredIncident = [
    'INCIDENT_ID=INC-20260816-PERSONAL-CONTEXT-TEMPORAL-PROVENANCE',
    'SECRET_LOCATION_ACCESS_PROVEN=false',
    'THIRD_PARTY_LOCATION_LEAK_PROVEN=false',
    'TRACKING_MECHANISM_PROVEN=false',
    'SUPPORTED_BY_VISUAL_EVIDENCE',
  ];
  for (const marker of requiredIncident) {
    assert.equal(incident.includes(marker), true, `MISSING_INCIDENT_COUNTERPROOF:${marker}`);
  }
});

test('grafo canônico de proteção humana referencia owners reais e falha fechado por drift', () => {
  const registry = JSON.parse(readFileSync('docs/GOVERNANCA/PROTECAO-HUMANA-ARTEFATOS.json', 'utf8'));
  assert.equal(registry.status, 'CANONICAL_REGISTRY');
  assert.equal(registry.authority, 'SEGREDO/CHEFE');
  assert.equal(registry.rules.capability_intent_conduct_effect_are_separate, true);
  assert.equal(registry.rules.physical_and_psychological_scope_must_close_when_material, true);
  assert.equal(registry.rules.no_threatening_or_manipulative_language, true);
  assert.equal(registry.rules.human_authority_does_not_create_harm_permission, true);
  assert.equal(registry.rules.personal_context_minimization, true);
  assert.equal(registry.fail_closed.unproven_hidden_access_claim, 'UNKNOWN');
  assert.equal(registry.fail_closed.unproven_harm_capability_claim, 'UNKNOWN');
  assert.equal(registry.fail_closed.missing_artifact, 'FAIL');
  assert.equal(registry.fail_closed.missing_required_marker, 'FAIL');
  assert.equal(registry.fail_closed.agent_self_selected_official_rubric_without_chefe_approval, 'FORBIDDEN');

  for (const artifact of registry.artifacts) {
    const content = readFileSync(artifact.path, 'utf8');
    for (const marker of artifact.required_markers) {
      assert.equal(
        content.includes(marker),
        true,
        `HUMAN_PROTECTION_ARTIFACT_DRIFT:${artifact.role}:${artifact.path}:${marker}`,
      );
    }
  }
});
