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
  assert.deepEqual(assignments.map((item) => item.model), ['modelo-a', 'modelo-b', 'modelo-a', 'modelo-b']);
  assert.ok(assignments.every((item) => item.independence === 'ROLE_DIVERSE_PROVIDER_REUSE'));
});

test('dedupe funde eco e preserva delta material diferente', () => {
  const results = [
    perception('A_LOGIC', { claim: 'Owner errado', recommended_test: 'ler owner', independence_key: 'owner-source' }),
    perception('B_IMPLEMENTATION', { claim: 'Owner errado', recommended_test: 'ler owner', independence_key: 'owner-source' }),
    perception('D_SIMPLIFICATION', { claim: 'Há duplicação', recommended_test: 'contar owners', independence_key: 'tree-shape' }),
  ];
  const deduped = dedupePerceptionFindings(results);
  assert.equal(deduped.length, 2);
  assert.deepEqual(deduped.map((item) => item.role), ['A_LOGIC', 'D_SIMPLIFICATION']);
});

test('um braço ausente não libera writer', () => {
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', results: [perception('A_LOGIC')] });
  assert.equal(packet.parallel_perception, true);
  assert.equal(packet.mutation_allowed, false);
  assert.equal(packet.ready_for_writer, false);
  assert.equal(packet.canonical_mutation_slots, 0);
  assert.deepEqual(packet.evidence_confrontation.missing_roles, [
    'B_IMPLEMENTATION',
    'C_REGRESSION_FALSE_GREEN',
    'D_SIMPLIFICATION',
  ]);
  assert.equal(packet.next_rule, 'RETRY_MISSING_PERCEPTIONS_BEFORE_MUTATION');
});

test('dedupe não pode esconder hipótese ou UNKNOWN', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => perception(attack.id));
  results[1] = perception('B_IMPLEMENTATION', {
    class: 'HYPOTHESIS',
    evidence_ref: 'UNKNOWN',
  });
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', results });
  assert.equal(packet.evidence_confrontation.all_four_completed, true);
  assert.deepEqual(packet.evidence_confrontation.unproven_roles, ['B_IMPLEMENTATION']);
  assert.equal(packet.unproven_findings.length, 1);
  assert.equal(packet.ready_for_writer, false);
  assert.equal(packet.canonical_mutation_slots, 0);
  assert.equal(packet.next_rule, 'RUN_DISCRIMINATING_TEST_BEFORE_MUTATION');
});

test('quatro NO_CHANGE não fabricam trabalho', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => perception(attack.id, {
    claim: `sem delta ${attack.id}`,
    material_delta: 'NO_CHANGE',
  }));
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', results });
  assert.equal(packet.evidence_confrontation.all_four_completed, true);
  assert.equal(packet.material_findings.length, 0);
  assert.equal(packet.ready_for_writer, false);
  assert.equal(packet.canonical_mutation_slots, 0);
  assert.equal(packet.next_rule, 'NO_MATERIAL_DELTA_NO_MUTATION');
});

test('mesma ferida com quatro fontes causais converge em uma correção candidata', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => perception(attack.id));
  const packet = buildPerceptionPacket({ mission: 'mesma intenção', results });
  assert.equal(packet.evidence_confrontation.all_four_completed, true);
  assert.equal(packet.evidence_confrontation.effective_independent_count, 4);
  assert.equal(packet.evidence_confrontation.confidence_can_increase, true);
  assert.equal(packet.evidence_confrontation.four_answers_are_four_proofs, false);
  assert.equal(packet.deduped_findings.length, 1);
  assert.equal(packet.material_findings.length, 1);
  assert.equal(packet.ready_for_writer, true);
  assert.equal(packet.canonical_mutation_slots, 1);
  assert.equal(packet.mutation_allowed, false);
  assert.equal(packet.counterproof_required, true);
  assert.equal(packet.gold_requires_counterproof, true);
  assert.equal(packet.model_vote_is_truth, false);
  assert.equal(packet.reality_is_judge, true);
});

test('mesma independence_key em quatro respostas conta como um cluster causal', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => perception(attack.id, {
    independence_key: 'same-source',
  }));
  const confrontation = confrontPerceptionEvidence(results);
  assert.equal(confrontation.all_four_completed, true);
  assert.equal(confrontation.effective_independent_count, 1);
  assert.equal(confrontation.confidence_can_increase, false);
  assert.ok(confrontation.correlated_clusters.some((item) => item.basis === 'independence_key'));
});

test('mesma evidence_ref com nomes causais diferentes também conta como um cluster', () => {
  const results = PERCEPTION_ATTACKS.map((attack) => perception(attack.id, {
    evidence_ref: 'same-evidence',
  }));
  const confrontation = confrontPerceptionEvidence(results);
  assert.equal(confrontation.explicit_independence_keys.length, 4);
  assert.equal(confrontation.explicit_evidence_refs.length, 1);
  assert.equal(confrontation.effective_independent_count, 1);
  assert.equal(confrontation.confidence_can_increase, false);
  assert.ok(confrontation.correlated_clusters.some((item) => item.basis === 'evidence_ref'));
});

test('classificador distingue leitura de mutação material', () => {
  assert.equal(classifyMaterialMutation('ler_arquivo', { path: 'x' }).mutating, false);
  assert.equal(classifyMaterialMutation('shell', { comando: 'node --test x.test.mjs' }).mutating, false);
  assert.equal(classifyMaterialMutation('escrever_arquivo', { path: 'x' }).mutating, true);
  assert.equal(classifyMaterialMutation('git', { acao: 'commit_push', paths: ['x'] }).critical, true);
  assert.equal(classifyMaterialMutation('handler', { acao: 'http', metodo: 'POST', url: 'https://example.invalid' }).critical, true);
});

test('TESTE não pode escrever sem disparar quatro percepções', () => {
  const d = decision({ estado: 'TESTE' });
  const gate = evaluatePerceptionGate({ decisao: d, historico: [] });
  assert.equal(gate.status, 'REQUIRE_FOUR_PERCEPTIONS');
  const routed = aplicarGatePercepcao(d, []);
  assert.equal(routed.ferramenta, 'shell');
  assert.match(routed.args.comando, /perception-orchestra\.mjs --active-mission/);
  assert.match(routed.args.comando, /HERMES_PERCEPTION_SCOPE_KEY=/);
});

test('FATO local claro preserva caminho barato sem fan-out ornamental', () => {
  const d = decision();
  const gate = evaluatePerceptionGate({ decisao: d, historico: [] });
  assert.equal(gate.status, 'NOT_REQUIRED_CLEAR_LOCAL');
  const routed = aplicarGatePercepcao(d, []);
  assert.equal(routed.ferramenta, 'escrever_arquivo');
  assert.equal(routed._perception_gate_status, 'NOT_REQUIRED_CLEAR_LOCAL');
});

test('promoção git é crítica e exige quatro percepções mesmo em FATO', () => {
  const d = decision({
    ferramenta: 'git',
    args: { acao: 'commit_push', mensagem: 'fix', paths: ['apps/x.mjs'] },
  });
  const routed = aplicarGatePercepcao(d, []);
  assert.equal(routed.ferramenta, 'shell');
  assert.equal(routed._perception_gate_status, 'REQUIRE_FOUR_PERCEPTIONS');
});

test('falha ou Critic recente obriga percepção antes de nova escrita', () => {
  const historico = [{
    etapa_titulo: 'falhou',
    ferramenta: 'shell',
    args: { comando: 'node --test x.test.mjs' },
    resultado: 'FAIL',
    ok: false,
    critic: 'regressão',
  }];
  const routed = aplicarGatePercepcao(decision(), historico);
  assert.equal(routed.ferramenta, 'shell');
  assert.match(routed.args.comando, /perception-orchestra\.mjs/);
});

test('alvo de mutação repetido obriga percepção antes de reescrever', () => {
  const d = decision();
  const historico = [{
    etapa_titulo: 'escrita anterior',
    ferramenta: 'escrever_arquivo',
    args: { path: 'apps/x.mjs', conteudo: 'antigo' },
    resultado: 'ok',
    ok: true,
  }];
  const gate = evaluatePerceptionGate({ decisao: d, historico });
  assert.equal(gate.status, 'REQUIRE_FOUR_PERCEPTIONS');
  assert.equal(gate.triggers.repeated_mutation_target, true);
});

test('loop detectado força fan-out antes de mutação mesmo quando decisão diz FATO', () => {
  const routed = aplicarGatePercepcao(decision(), [], { emLoop: true });
  assert.equal(routed.ferramenta, 'shell');
  assert.equal(routed._perception_triggers.loop_detected, true);
});

test('receipt verde dos quatro braços libera exatamente o mesmo escopo de mutação', () => {
  const d = decision({
    ferramenta: 'git',
    args: { acao: 'commit_push', mensagem: 'fix', paths: ['apps/x.mjs'] },
  });
  const scope = mutationScopeKey(d.ferramenta, d.args);
  const historico = [perceptionHistoryEntry(scope)];
  const active = activePerceptionGate(historico);
  assert.equal(active.ready_for_writer, true);
  assert.equal(active.proposal_scope_key, scope);
  const gate = evaluatePerceptionGate({ decisao: d, historico });
  assert.equal(gate.status, 'PASS_READY_PERCEPTION_GATE');
  const routed = aplicarGatePercepcao(d, historico);
  assert.equal(routed.ferramenta, 'git');
});

test('receipt não verde bloqueia a caneta e expõe teste discriminante', () => {
  const d = decision();
  const scope = mutationScopeKey(d.ferramenta, d.args);
  const historico = [perceptionHistoryEntry(scope, {
    ready_for_writer: false,
    next_rule: 'RUN_DISCRIMINATING_TEST_BEFORE_MUTATION',
    material_findings: [],
    evidence_confrontation: {
      all_four_completed: true,
      discriminating_tests: ['node --test regressao.test.mjs'],
      unproven_roles: ['B_IMPLEMENTATION'],
      effective_independent_count: 1,
    },
  })];
  historico[0].ok = false;
  const gate = evaluatePerceptionGate({ decisao: d, historico });
  assert.equal(gate.status, 'BLOCK_MUTATION_PENDING_DISCRIMINATING_EVIDENCE');
  const routed = aplicarGatePercepcao(d, historico);
  assert.equal(routed.ferramenta, 'notificar_progresso');
  assert.match(routed.args.mensagem, /regressao\.test\.mjs/);
});

test('receipt de outro escopo não autoriza mutação nova', () => {
  const d = decision();
  const historico = [perceptionHistoryEntry('file:apps/outro.mjs')];
  const gate = evaluatePerceptionGate({ decisao: d, historico });
  assert.equal(gate.status, 'REQUIRE_FOUR_PERCEPTIONS');
  const routed = aplicarGatePercepcao(d, historico);
  assert.equal(routed.ferramenta, 'shell');
});

test('stdout prefixado por exit=2 ainda é reconhecido como receipt bloqueado', () => {
  const d = decision();
  const scope = mutationScopeKey(d.ferramenta, d.args);
  const entry = perceptionHistoryEntry(scope, {
    ready_for_writer: false,
    next_rule: 'RETRY_MISSING_PERCEPTIONS_BEFORE_MUTATION',
    evidence_confrontation: {
      all_four_completed: false,
      discriminating_tests: [],
      unproven_roles: [],
      effective_independent_count: 0,
    },
  });
  entry.resultado = `exit=2 ${entry.resultado}`;
  entry.ok = false;
  const active = activePerceptionGate([entry]);
  assert.equal(active.ready_for_writer, false);
  assert.equal(active.next_rule, 'RETRY_MISSING_PERCEPTIONS_BEFORE_MUTATION');
});
