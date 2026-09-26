# COMANDO - continuity-guard.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\HERMES-CORE\core\continuity-guard.test.mjs
**SHA:** 73dd52763ae4d861
**Timestamp:** 2026-08-28T02:56:26.468874
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- comando: `HERMES_PERCEPTION_SCOPE_KEY='${scopeKey}' HERMES_PERCEPTION_PROPOSAL_B64='e30' node apps/modulos/HERMES-CORE/core/perception-orchestra.mjs --active-mission`,
- assert.equal(classifyMaterialMutation('shell', { comando: 'node --test x.test.mjs' }).mutating, false);
- args: { comando: 'node --test x.test.mjs' },

### Decisoes
- const gate = evaluatePerceptionGate({ decisao: d, historico: [] });
- const gate = evaluatePerceptionGate({ decisao: d, historico: [] });
- const gate = evaluatePerceptionGate({ decisao: d, historico });
- const gate = evaluatePerceptionGate({ decisao: d, historico });
- const gate = evaluatePerceptionGate({ decisao: d, historico });
- const gate = evaluatePerceptionGate({ decisao: d, historico });

### Contratos
- const gate = evaluatePerceptionGate({ decisao: d, historico: [] });
- const gate = evaluatePerceptionGate({ decisao: d, historico: [] });
- const gate = evaluatePerceptionGate({ decisao: d, historico });
- const gate = evaluatePerceptionGate({ decisao: d, historico });
- const gate = evaluatePerceptionGate({ decisao: d, historico });
- const gate = evaluatePerceptionGate({ decisao: d, historico });

### Gaps
- assert.equal(classifyMaterialMutation('handler', { acao: 'http', metodo: 'POST', url: 'https://example.invalid' }).critical, true);

### Ouro Bruto (primeiros 5000 chars)
```
import assert from 'node:assert/strict';
import test from 'node:test';
import './cognitive-council.test.mjs';

import {
  continuityBlockReceipt,
  validateContinuityState,
} from './continuity-guard.mjs';
import {
  PERCEPTION_ATTACKS,
  assignPerceptionModels,
  buildPerceptionPacket,
  confrontPerceptionEvidence,
  dedupePerceptionFindings,
} from './perception-orchestra.mjs';
import {
  activePerceptionGate,
  classifyMaterialMutation,
  evaluatePerceptionGate,
  mutationScopeKey,
} from './perception-policy.mjs';
import { aplicarGatePercepcao } from './decisor.mjs';

const HEAD = 'a'.repeat(40);

function validState(overrides = {}) {
  const control = { head_sha: HEAD, status: 'PROVED' };
  return {
    objetivo: 'Retomar missão sem repetir trabalho',
    autoridade: 'SEGREDO/CHEFE',
    coordenador: 'SOL',
    escritor: 'PIVETE/HERMES',
    escopo: ['apps/modulos/HERMES-CORE/**'],
    ambiente: 'CASA_LOCAL',
    classe_de_acao: 'R1_LOCAL',
    baseline: { ...control },
    backup: { ...control },
    rollback: { ...control },
    receipt: { ...control, result: 'PASS' },
    head_sha: HEAD,
    ...overrides,
  };
}

function perception(role, overrides = {}) {
  return {
    role,
    model: `model-${role.toLowerCase()}`,
    independence: 'ROLE_AND_PROVIDER_DIVERSE',
    status: 'OK',
    finding: {
      claim: 'mesma ferida',
      class: 'FACT',
      evidence_ref: `evidence:${role}`,
      independence_key: `source:${role}`,
      counterexample: 'contraprova',
      recommended_test: 'teste discriminante comum',
      material_delta: 'corrigir owner canônico',
      ...overrides,
    },
  };
}

function decision(overrides = {}) {
  return {
    pensamento: 'correção local já comprovada',
    etapa_titulo: 'Corrigir owner',
    estado: 'FATO',
    ferramenta: 'escrever_arquivo',
    args: { path: 'apps/x.mjs', conteudo: 'x' },
    terminou: false,
    ...overrides,
  };
}

function perceptionHistoryEntry(scopeKey, packetOverrides = {}) {
  const packet = {
    mode: 'PARALLEL_PERCEPTION_SERIAL_MUTATION',
    ready_for_writer: true,
    next_rule: 'CONFRONT_EVIDENCE_THEN_ONE_CANONICAL_MUTATION',
    material_findings: [{ claim: 'delta' }],
    evidence_confrontation: {
      all_four_completed: true,
      discriminating_tests: ['node --test x.test.mjs'],
      unproven_roles: [],
      effective_independent_count: 2,
    },
    ...packetOverrides,
  };
  return {
    etapa_titulo: 'Quatro percepções antes da caneta',
    ferramenta: 'shell',
    args: {
      comando: `HERMES_PERCEPTION_SCOPE_KEY='${scopeKey}' HERMES_PERCEPTION_PROPOSAL_B64='e30' node apps/modulos/HERMES-CORE/core/perception-orchestra.mjs --active-mission`,
    },
    resultado: JSON.stringify(packet),
    ok: packet.ready_for_writer === true,
  };
}

test('estado completo e preso ao mesmo HEAD pode ser retomado', () => {
  assert.deepEqual(validateContinuityState(validState()), {
    ok: true,
    state: 'READY',
    head_sha: HEAD,
    reasons: [],
  });
});

test('campo ausente bloqueia antes de DECIDE ou APPLY', () => {
  const state = validState();
  delete state.rollback;
  const result = validateContinuityState(state);
  assert.equal(result.ok, false);
  assert.match(result.reasons.join(' '), /MISSING_FIELD:rollback/);
});

test('controle preso a outro HEAD bloqueia', () => {
  const result = validateContinuityState(
    validState({ receipt: { head_sha: 'b'.repeat(40), result: 'PASS' } }),
  );
  assert.equal(result.ok, false);
  assert.match(result.reasons.join(' '), /CONTROL_HEAD_MISMATCH:receipt/);
});

test('autoridade ou coordenação divergente bloqueiam', () => {
  const result = validateContinuityState(
    validState({ autoridade: 'PIVETE', coordenador: 'OUTRO' }),
  );
  assert.equal(result.ok, false);
  assert.match(result.reasons.join(' '), /AUTHORITY_MISMATCH/);
  assert.match(result.reasons.join(' '), /COORDINATOR_MISMATCH/);
});

test('receipt de bloqueio é estável, sanitizado e deduplicável', () => {
  const validation = validateContinuityState({ objetivo: 'x' });
  const first = continuityBlockReceipt({ mission: 'missao-a', source: 'state.json', validation });
  const second = continuityBlockReceipt({ mission: 'missao-a', source: 'state.json', validation });
  assert.deepEqual(first, second);
  assert.equal(first.result, 'BLOCKED');
  assert.match(first.fingerprint, /^[0-9a-f]{64}$/);
  assert.equal(JSON.stringify(first).includes('valor-secreto'), false);
});

test('orquestra fixa exatamente quatro ataques diferentes', () => {
  assert.deepEqual(PERCEPTION_ATTACKS.map((item) => item.id), [
    'A_LOGIC',
    'B_IMPLEMENTATION',
    'C_REGRESSION_FALSE_GREEN',
    'D_SIMPLIFICATION',
  ]);
  assert.equal(new Set(PERCEPTION_ATTACKS.map((item) => item.objective)).size, 4);
});

test('quatro braços podem reutilizar providers sem fingir independência causal', () => {
  const assignments = assignPerceptionModels(['modelo-a', 'modelo-b']);
  assert.equal(assignments.length, 4);
  assert.deepEqual(assignments.map((it
```