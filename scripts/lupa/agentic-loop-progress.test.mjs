import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATUS_POINTS,
  calculateProgress,
  formatPiveteReport,
  validateSnapshot,
} from './agentic-loop-progress.mjs';

function validSnapshot() {
  return {
    schema_version: 1,
    package_id: 'CENTRALDARK-AGENTIC-LOOP-4K',
    source_of_truth: 'ServerVpss/CentralDark',
    status: 'PARTIAL_COM_PROVA',
    expected_percent: 75,
    next_gate: 'provar ZIP e fechar automação de reparo',
    chief_action: 'NADA_AGORA',
    gates: [
      ['VISUAL_PACKAGE_MANIFEST', 'Manifesto visual', 'PASS'],
      ['ZIP_PRESENT_IN_REPOSITORY', 'ZIP no GitHub', 'UNKNOWN'],
      ['CANONICAL_SKILL_VERSIONED', 'Skill versionada', 'PASS'],
      ['CI_GATE_ENFORCED', 'Gate no CI', 'PASS'],
      ['CI_FAILURE_VISIBLE_IN_PR', 'Falha visível no PR', 'PASS'],
      ['AGENT_READS_FAILED_LOG', 'Agente lê log', 'PARTIAL'],
      ['AUTOMATIC_REPAIR_REPUSH', 'Reparo e novo push', 'PARTIAL'],
      ['GLOBAL_PROGRESS_REPORT', 'Relatório percentual', 'PASS'],
    ].map(([id, label, status]) => ({ id, label, status, evidence: [`proof:${id}`], next_step: status === 'PASS' ? '' : `next:${id}` })),
  };
}

test('pontuação fail-closed mantém estados incertos em zero', () => {
  for (const status of ['FAIL', 'BLOCKED', 'PENDING', 'UNKNOWN', 'SKIPPED', 'TIMEOUT']) {
    assert.equal(STATUS_POINTS[status], 0, status);
  }
  assert.equal(STATUS_POINTS.PASS, 100);
  assert.equal(STATUS_POINTS.PARTIAL, 50);
});

test('calcula 75% sem esconder gate', () => {
  const result = calculateProgress(validSnapshot());
  assert.deepEqual(result, { earned: 600, total: 800, percent: 75 });
});

test('rejeita gate obrigatório ausente', () => {
  const snapshot = validSnapshot();
  snapshot.gates = snapshot.gates.filter((gate) => gate.id !== 'CI_GATE_ENFORCED');
  assert.throws(() => validateSnapshot(snapshot), /REQUIRED_GATE_MISSING:CI_GATE_ENFORCED/);
});

test('rejeita evidência vazia', () => {
  const snapshot = validSnapshot();
  snapshot.gates[0].evidence = [];
  assert.throws(() => validateSnapshot(snapshot), /GATE_WITHOUT_EVIDENCE/);
});

test('relatório fala direto e mostra numerador', () => {
  const report = formatPiveteReport(validSnapshot());
  assert.match(report, /PROGRESSO_GERAL=75% \(600\/800\)/);
  assert.match(report, /O_QUE_O_CHEFE_PRECISA_FAZER=NADA_AGORA/);
  assert.match(report, /ZIP no GitHub/);
});
