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

test('contrato global minimiza contexto pessoal e não trata acesso como permissão de divulgar', () => {
  const contract = JSON.parse(readFileSync('docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json', 'utf8'));
  const privacy = contract.personal_context_privacy_policy;
  assert.equal(privacy?.marker, 'HOUSE_PERSONAL_CONTEXT_PRIVACY_INVARIANT');
  assert.equal(privacy?.severity, 'HOUSE_CRITICAL');
  assert.equal(privacy?.applies_to_all_models_agents_surfaces, true);
  assert.equal(privacy?.context_access_is_disclosure_permission, false);
  assert.equal(privacy?.tool_access_is_disclosure_permission, false);
  assert.equal(privacy?.personal_context_minimization_required, true);
  assert.equal(privacy?.location_lookup_requires_location_dependent_intent_or_explicit_request, true);
  assert.equal(privacy?.unrequested_precise_location_disclosure, 'FORBIDDEN');
  assert.equal(privacy?.time_query_requires_surfacing_city, false);
  assert.equal(privacy?.derived_value_should_hide_nonessential_source_detail, true);
  assert.equal(privacy?.incidental_personal_context_must_be_minimized_before_response, true);
  assert.equal(privacy?.incident_logs_redact_sensitive_details_when_exact_value_is_not_needed_for_proof, true);
  assert.equal(
    privacy?.forensic_origin,
    'docs/APRENDIZADOS/2026-08-16-incidente-exposicao-contexto-localizacao.md',
  );
});
