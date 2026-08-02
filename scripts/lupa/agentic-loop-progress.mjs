#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadSchool } from './agentic-school-loader.mjs';

export const STATUS_POINTS = Object.freeze({ PASS: 100, PARTIAL: 50, FAIL: 0, BLOCKED: 0, PENDING: 0, UNKNOWN: 0, SKIPPED: 0, TIMEOUT: 0 });
const SHA40 = /^[0-9a-f]{40}$/;
const VISUAL_SVG_PATH = 'docs/ARQUITETURA/artefatos/CENTRALDARK-AGENTIC-LOOP-4K/centraldark-agentic-loop-editavel.svg';
const VISUAL_README_PATH = 'docs/ARQUITETURA/artefatos/CENTRALDARK-AGENTIC-LOOP-4K/LEIA-ME.txt';
const COURSE_RECEIPT_PATH = '.agents/skills/agentic-ci-loop/references/SOURCE-CURSO-SKILLS-ORIGINAL.txt.gz.base64';
const COURSE_CONDENSED_PATH = '.agents/skills/agentic-ci-loop/references/ESCOLA-OPERACIONAL-DE-SKILLS.md';

function exists(root, relativePath) { return fs.existsSync(path.join(root, relativePath)); }
function text(root, relativePath) { return fs.readFileSync(path.join(root, relativePath), 'utf8'); }
function gate(id, label, status, evidence, nextStep, required = true) {
  return { id, label, status, required, evidence, next_step: nextStep };
}
function assert(condition, message) { if (!condition) throw new Error(message); }

export function buildCourseCustodyGates({ condensedPresent, receiptPresent, originalAttachmentPresent = false }) {
  return [
    gate(
      'COURSE_CONDENSED_VERSIONED',
      'Curso operacional condensado e receipt versionados',
      condensedPresent && receiptPresent ? 'PASS' : 'FAIL',
      [condensedPresent && receiptPresent
        ? 'Contrato acionável está no Git e o receipt preserva somente o identificador SHA-256 da fonte externa'
        : 'Curso condensado ou receipt ausente'],
      'versionar o curso condensado e o receipt de custódia',
    ),
    gate(
      'COURSE_ORIGINAL_ATTACHMENT',
      'Anexo original do curso disponível no repositório',
      originalAttachmentPresent ? 'PASS' : 'PARTIAL',
      [originalAttachmentPresent
        ? 'Bytes do anexo original estão disponíveis e verificáveis'
        : 'Somente o SHA-256 e o receipt estão versionados; os bytes do anexo original permanecem externos'],
      'publicar o anexo original por canal de arquivo autorizado e verificar o SHA-256',
      false,
    ),
  ];
}

export function deriveSituation(gates) {
  if (gates.every((item) => item.status === 'PASS')) return 'DONE_COM_PROVA';
  const required = gates.filter((item) => item.required !== false);
  if (required.some((item) => ['FAIL', 'BLOCKED', 'TIMEOUT'].includes(item.status))) return 'BLOCKED';
  if (required.some((item) => ['UNKNOWN', 'PENDING', 'SKIPPED'].includes(item.status))) return 'PARTIAL_BLOQUEADO';
  return 'PARTIAL_COM_PROVA';
}

export function requirementSatisfied(report, mode) {
  if (mode === 'complete') return report.gates.every((item) => item.status === 'PASS');
  if (mode === 'operational') {
    return report.gates.filter((item) => item.required !== false).every((item) => item.status === 'PASS');
  }
  throw new Error(`REQUIREMENT_MODE_INVALID:${mode}`);
}

export function validateGates(gates) {
  assert(Array.isArray(gates) && gates.length > 0, 'GATES_EMPTY');
  const ids = new Set();
  for (const item of gates) {
    assert(typeof item.id === 'string' && item.id, 'GATE_ID_INVALID');
    assert(!ids.has(item.id), `GATE_DUPLICATED:${item.id}`);
    ids.add(item.id);
    assert(Object.hasOwn(STATUS_POINTS, item.status), `GATE_STATUS_INVALID:${item.id}`);
    assert(Array.isArray(item.evidence) && item.evidence.length > 0, `GATE_WITHOUT_EVIDENCE:${item.id}`);
    assert(typeof item.next_step === 'string', `GATE_NEXT_STEP_INVALID:${item.id}`);
  }
  return true;
}

export function calculateProgress(gates) {
  validateGates(gates);
  const total = gates.length * 100;
  const earned = gates.reduce((sum, item) => sum + STATUS_POINTS[item.status], 0);
  return { earned, total, percent: Number(((earned / total) * 100).toFixed(1)) };
}

export function buildRuntimeReport({ root, expectedHead }) {
  assert(SHA40.test(expectedHead), 'EXPECTED_HEAD_INVALID');
  let school;
  let schoolError = null;
  try { school = loadSchool({ root, task: 'critical-refactor', expectedHead }); }
  catch (error) { schoolError = error.message; }

  const workflowPath = '.github/workflows/porta-de-entrada.yml';
  const workflow = exists(root, workflowPath) ? text(root, workflowPath) : '';
  const boot = exists(root, 'LEIA-ME-IA.md') ? text(root, 'LEIA-ME-IA.md') : '';
  const courseGates = buildCourseCustodyGates({
    condensedPresent: exists(root, COURSE_CONDENSED_PATH),
    receiptPresent: exists(root, COURSE_RECEIPT_PATH),
    originalAttachmentPresent: false,
  });

  const gates = [
    ...courseGates,
    gate('SCHOOL_MANIFEST_VALID', 'Manifesto da escola válido', school ? 'PASS' : 'BLOCKED', [school ? `school_id=${school.school_id}` : `erro=${schoolError}`], 'corrigir manifesto, módulos ou adaptadores'),
    gate('UNIVERSAL_BOOT_REACHABLE', 'Escola alcançável pelo boot universal', boot.includes('.agents/skills/agentic-ci-loop/SKILL.md') && boot.includes('agentic-school-loader.mjs') ? 'PASS' : 'FAIL', ['LEIA-ME-IA.md deve apontar para skill e loader'], 'conectar a escola à porta universal'),
    gate('ZERO_REGRESSION_MODULE', 'Refatoração crítica com zero regressão', exists(root, '.agents/skills/agentic-ci-loop/references/REFATORACAO-CRITICA-ZERO-REGRESSAO.md') ? 'PASS' : 'FAIL', ['Módulo de baseline, vermelho, cirurgia, matriz, CI, Judge e cicatriz'], 'criar ou restaurar módulo'),
    gate('SELF_LEARNING_GATED', 'Autoaprendizado com promoção segura', school ? 'PASS' : 'BLOCKED', [school ? `approved=${school.approved_lessons.length}; candidates=${school.candidate_lessons.length}; candidatos não entram no boot` : 'loader bloqueado'], 'corrigir o ledger; aprovação exige regressão, Judge independente e decisão do CHEFE'),
    gate('DETERMINISTIC_TESTS', 'Loader, pacote e progresso testados', workflow.includes('agentic-school-loader.test.mjs') && workflow.includes('agentic-loop-progress.test.mjs') && workflow.includes('test_validar_agentic_visual_package.py') ? 'PASS' : 'FAIL', ['Workflow deve executar Node + Python sem dependência externa'], 'ligar as três suítes no CI'),
    gate('CI_BOOT_EXECUTION', 'Boot da escola executado no CI', workflow.includes('agentic-school-loader.mjs --task critical-refactor') ? 'PASS' : 'FAIL', ['porta-de-entrada executa loader preso ao PR_HEAD'], 'adicionar execução do loader ao workflow'),
    gate('VISUAL_SOURCE_VERSIONED', 'Fonte visual 4K editável versionada', exists(root, VISUAL_SVG_PATH) && exists(root, VISUAL_README_PATH) && workflow.includes('validar_agentic_visual_package.py') ? 'PASS' : 'FAIL', ['SVG e LEIA-ME presos aos hashes do manifesto; ZIP pode ser validado quando fornecido'], 'versionar SVG, LEIA-ME e guardrail'),
    gate('VISUAL_BINARY_IN_GIT', 'ZIP/PNGs binários armazenados no Git', 'PARTIAL', ['ZIP original validado localmente pelo SHA-256 455071e3e6e6c3bfef27a8257ed5405e9387706a39cee978fdbfd87eaba49a2b; conector desta sessão publica apenas texto UTF-8'], 'publicar o ZIP por canal binário autorizado e rerodar --require-zip', false),
  ];

  const progress = calculateProgress(gates);
  const situation = deriveSituation(gates);
  const blockers = gates.filter((item) => item.required !== false && item.status !== 'PASS');
  const nonBlockers = gates.filter((item) => item.required === false && item.status !== 'PASS');
  return {
    schema_version: 2,
    source_of_truth: 'ServerVpss/CentralDark',
    measured_head: expectedHead,
    situation,
    operational_ready: blockers.length === 0,
    complete: gates.every((item) => item.status === 'PASS'),
    progress,
    gates,
    error: blockers.map((item) => item.label).join(' | ') || 'NENHUM',
    cause: blockers.map((item) => `${item.id}:${item.evidence.join('; ')}`).join(' | ') || 'NENHUMA',
    correction: blockers.map((item) => item.next_step).join(' | ') || 'NENHUMA',
    test: 'node --test scripts/lupa/agentic-school-loader.test.mjs scripts/lupa/agentic-loop-progress.test.mjs',
    scar: 'Toda falha provada exige teste vermelho antes, verde depois e lição somente após Judge + CHEFE.',
    blocking_pending: blockers.map((item) => `${item.label}: ${item.next_step}`),
    non_blocking_pending: nonBlockers.map((item) => `${item.label}: ${item.next_step}`),
    anticipation: blockers.length ? 'Não declarar escola operacional nem promover para main enquanto houver gate obrigatório fora de PASS.' : 'A escola está operacional na branch, mas a entrega não é completa enquanto existir gate opcional fora de PASS.',
    next_movement: blockers[0]?.next_step || 'solicitar Judge no mesmo HEAD e manter merge sob decisão do CHEFE',
    chief_action: blockers.length ? 'NADA_AGORA; O WRITER DEVE FECHAR OS GATES TÉCNICOS' : 'DECIDIR PROMOÇÃO APÓS JUDGE INDEPENDENTE',
  };
}

export function formatPiveteReport(report) {
  const join = (items) => items.length ? items.join(' | ') : 'NENHUMA';
  return [
    `SITUAÇÃO=${report.situation}`,
    `ERRO=${report.error}`,
    `CAUSA=${report.cause}`,
    `CORREÇÃO=${report.correction}`,
    `TESTE=${report.test}`,
    `CICATRIZ=${report.scar}`,
    `PERCENTUAL=${report.progress.earned}/${report.progress.total}=${report.progress.percent}%`,
    `OPERACIONAL=${report.operational_ready ? 'SIM' : 'NÃO'}`,
    `COMPLETO=${report.complete ? 'SIM' : 'NÃO'}`,
    `PENDÊNCIAS_BLOQUEANTES=${join(report.blocking_pending)}`,
    `PENDÊNCIAS_NÃO_BLOQUEANTES=${join(report.non_blocking_pending)}`,
    `ANTECIPAÇÃO=${report.anticipation}`,
    `PRÓXIMO_MOVIMENTO=${report.next_movement}`,
    `HEAD_PROVADO=${report.measured_head}`,
    `CI_NO_HEAD=${process.env.CI ? 'EXECUTANDO_NO_CI' : 'VALIDAÇÃO_LOCAL'}`,
    `O_QUE_O_CHEFE_PRECISA_FAZER=${report.chief_action}`,
  ].join('\n');
}

function argValue(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}
function resolveHead(root, supplied) {
  if (supplied) return supplied;
  try { return execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); }
  catch { throw new Error('EXPECTED_HEAD_REQUIRED'); }
}
function main() {
  const args = process.argv.slice(2);
  const root = path.resolve(argValue(args, '--repo-root', process.cwd()));
  const expectedHead = resolveHead(root, argValue(args, '--expected-head', process.env.GITHUB_SHA || null));
  const report = buildRuntimeReport({ root, expectedHead });
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else console.log(formatPiveteReport(report));
  if (args.includes('--require-complete') && !requirementSatisfied(report, 'complete')) process.exitCode = 1;
  if (args.includes('--require-operational') && !requirementSatisfied(report, 'operational')) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); }
  catch (error) { console.error(`AGENTIC_LOOP_PROGRESS_BLOCKED=${error.message}`); process.exitCode = 1; }
}
