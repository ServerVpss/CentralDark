#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadSchool } from './agentic-school-loader.mjs';
import { validateReport } from './validar-relato-pivete.mjs';

export const STATUS_POINTS = Object.freeze({ PASS: 100, PARTIAL: 50, FAIL: 0, BLOCKED: 0, PENDING: 0, UNKNOWN: 0, SKIPPED: 0, TIMEOUT: 0 });
const SHA40 = /^[0-9a-f]{40}$/;
const VISUAL_SVG_PATH = 'docs/ARQUITETURA/artefatos/CENTRALDARK-AGENTIC-LOOP-4K/centraldark-agentic-loop-editavel.svg';
const VISUAL_README_PATH = 'docs/ARQUITETURA/artefatos/CENTRALDARK-AGENTIC-LOOP-4K/LEIA-ME.txt';
const COURSE_RECEIPT_PATH = '.agents/skills/agentic-ci-loop/references/SOURCE-CURSO-SKILLS-ORIGINAL.txt.gz.base64';
const COURSE_CONDENSED_PATH = '.agents/skills/agentic-ci-loop/references/ESCOLA-OPERACIONAL-DE-SKILLS.md';

function exists(root, relativePath) { return typeof relativePath === 'string' && relativePath.length > 0 && fs.existsSync(path.join(root, relativePath)); }
function text(root, relativePath) { return fs.readFileSync(path.join(root, relativePath), 'utf8'); }
function sha256(root, relativePath) { return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex'); }
function gate(id, label, status, evidence, nextStep, required = true) { return { id, label, status, required, evidence, next_step: nextStep }; }
function assert(condition, message) { if (!condition) throw new Error(message); }

function optionalArtifactState(root, relativePath, expectedSha) {
  if (!relativePath) return { declared: false, present: false, valid: false, detail: 'caminho não declarado no manifesto' };
  if (!exists(root, relativePath)) return { declared: true, present: false, valid: false, detail: `arquivo ausente: ${relativePath}` };
  const actual = sha256(root, relativePath);
  if (actual !== expectedSha) return { declared: true, present: true, valid: false, detail: `SHA-256 divergente: ${relativePath}` };
  return { declared: true, present: true, valid: true, detail: `SHA-256 válido: ${relativePath}` };
}

export function buildCourseCustodyGates({ condensedPresent, receiptPresent, originalAttachmentPresent = false, originalAttachmentValid = originalAttachmentPresent }) {
  return [
    gate(
      'COURSE_CONDENSED_VERSIONED',
      'Curso operacional condensado e receipt versionados',
      condensedPresent && receiptPresent ? 'PASS' : 'FAIL',
      [condensedPresent && receiptPresent
        ? 'Contrato acionável está no Git e o receipt preserva o identificador SHA-256 da fonte externa'
        : 'Curso condensado ou receipt ausente'],
      'versionar o curso condensado e o receipt de custódia',
    ),
    gate(
      'COURSE_ORIGINAL_ATTACHMENT',
      'Anexo original do curso disponível no repositório',
      originalAttachmentPresent ? (originalAttachmentValid ? 'PASS' : 'FAIL') : 'PARTIAL',
      [originalAttachmentPresent
        ? (originalAttachmentValid ? 'Bytes do anexo original estão disponíveis e o SHA-256 confere' : 'Anexo original existe, mas sua integridade não confere')
        : 'Somente o SHA-256 e o receipt estão versionados; os bytes do anexo original permanecem externos'],
      'publicar o anexo original por canal de arquivo autorizado e verificar o SHA-256',
      false,
    ),
  ];
}

export function buildVisualBinaryGate({ declared, allPresent, allValid, evidence = [] }) {
  const status = allValid ? 'PASS' : (declared ? 'FAIL' : 'PARTIAL');
  return gate(
    'VISUAL_BINARY_IN_GIT',
    'ZIP/PNGs binários armazenados e verificáveis no Git',
    status,
    evidence.length ? evidence : [declared ? 'Artefatos declarados, mas incompletos ou inválidos' : 'Caminhos binários ainda não declarados no manifesto'],
    'publicar ZIP e PNGs por canal binário autorizado, declarar caminhos no manifesto e verificar SHA-256',
    false,
  );
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
  if (mode === 'operational') return report.gates.filter((item) => item.required !== false).every((item) => item.status === 'PASS');
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

export function resolveVerifiedHead(root, supplied = null) {
  let actual;
  try { actual = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); }
  catch { throw new Error('GIT_HEAD_UNAVAILABLE'); }
  assert(SHA40.test(actual), 'GIT_HEAD_INVALID');
  if (supplied !== null) {
    assert(SHA40.test(supplied), 'EXPECTED_HEAD_INVALID');
    assert(supplied === actual, `EXPECTED_HEAD_MISMATCH:${supplied}:${actual}`);
  }
  return actual;
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
  const artifacts = school?.source_artifacts || {};

  const courseOriginal = optionalArtifactState(root, artifacts.course_original_path, artifacts.course_txt_sha256);
  const courseGates = buildCourseCustodyGates({
    condensedPresent: exists(root, COURSE_CONDENSED_PATH),
    receiptPresent: exists(root, COURSE_RECEIPT_PATH),
    originalAttachmentPresent: courseOriginal.present,
    originalAttachmentValid: courseOriginal.valid,
  });

  const binaryStates = [
    optionalArtifactState(root, artifacts.visual_zip_path, artifacts.visual_zip_sha256),
    optionalArtifactState(root, artifacts.png_complete_path, artifacts.png_complete_sha256),
    optionalArtifactState(root, artifacts.png_clean_path, artifacts.png_clean_sha256),
  ];
  const visualBinaryGate = buildVisualBinaryGate({
    declared: binaryStates.some((item) => item.declared),
    allPresent: binaryStates.every((item) => item.present),
    allValid: binaryStates.every((item) => item.valid),
    evidence: binaryStates.map((item) => item.detail),
  });

  const globalWorkflow = workflow.includes('branches: ["**"]')
    && workflow.includes('validar-relato-pivete.mjs --mode pr')
    && /^\s{2}pull_request:\s*$/m.test(workflow);

  const gates = [
    ...courseGates,
    gate('SCHOOL_MANIFEST_VALID', 'Manifesto, contrato, template e adaptadores válidos', school ? 'PASS' : 'BLOCKED', [school ? `school_id=${school.school_id}; superfícies=${school.checked_global_surfaces.join(',')}` : `erro=${schoolError}`], 'corrigir manifesto, módulos, contrato ou adaptadores'),
    gate('UNIVERSAL_BOOT_REACHABLE', 'Escola alcançável pelo boot universal', boot.includes('.agents/skills/agentic-ci-loop/SKILL.md') && boot.includes('agentic-school-loader.mjs') ? 'PASS' : 'FAIL', ['LEIA-ME-IA.md deve apontar para skill e loader'], 'conectar a escola à porta universal'),
    gate('ZERO_REGRESSION_MODULE', 'Refatoração crítica com zero regressão conhecida', exists(root, '.agents/skills/agentic-ci-loop/references/REFATORACAO-CRITICA-ZERO-REGRESSAO.md') ? 'PASS' : 'FAIL', ['Módulo de baseline, vermelho, cirurgia, matriz, CI, Judge e cicatriz'], 'criar ou restaurar módulo'),
    gate('SELF_LEARNING_GATED', 'Autoaprendizado com promoção segura', school ? 'PASS' : 'BLOCKED', [school ? `approved=${school.approved_lessons.length}; candidates=${school.candidate_lessons.length}; candidatos não entram no boot` : 'loader bloqueado'], 'corrigir o ledger; aprovação exige regressão, Judge independente e decisão do CHEFE'),
    gate('DETERMINISTIC_TESTS', 'Loader, relato visual, pacote e progresso testados', workflow.includes('agentic-school-loader.test.mjs') && workflow.includes('agentic-loop-progress.test.mjs') && workflow.includes('validar-relato-pivete.test.mjs') && workflow.includes('test_validar_agentic_visual_package.py') ? 'PASS' : 'FAIL', ['Workflow deve executar loader, validador de relato, progresso e pacote sem dependência externa'], 'ligar as quatro suítes no CI'),
    gate('CI_BOOT_EXECUTION', 'Escola aplicada em todo commit e todo PR', globalWorkflow && workflow.includes('agentic-school-loader.mjs --task critical-refactor') ? 'PASS' : 'FAIL', ['porta-de-entrada executa em todo push/PR, valida corpo do PR e boota o loader preso ao HEAD'], 'tornar o workflow global para todo push/PR e validar o corpo do PR'),
    gate('VISUAL_SOURCE_VERSIONED', 'Fonte visual 4K editável versionada', exists(root, VISUAL_SVG_PATH) && exists(root, VISUAL_README_PATH) && workflow.includes('validar_agentic_visual_package.py') ? 'PASS' : 'FAIL', ['SVG e LEIA-ME presos aos hashes do manifesto; ZIP pode ser validado quando fornecido'], 'versionar SVG, LEIA-ME e guardrail'),
    visualBinaryGate,
  ];

  const progress = calculateProgress(gates);
  const situation = deriveSituation(gates);
  const blockers = gates.filter((item) => item.required !== false && item.status !== 'PASS');
  const nonBlockers = gates.filter((item) => item.required === false && item.status !== 'PASS');
  return {
    schema_version: 4,
    source_of_truth: 'ServerVpss/CentralDark',
    measured_head: expectedHead,
    situation,
    operational_ready: blockers.length === 0,
    complete: gates.every((item) => item.status === 'PASS'),
    progress,
    gates,
    error: blockers.map((item) => item.label).join(' | ') || 'NENHUM',
    cause: blockers.map((item) => `${item.id}:${item.evidence.join('; ')}`).join(' | ') || 'NÃO_APLICÁVEL',
    correction: blockers.map((item) => item.next_step).join(' | ') || 'NENHUMA',
    test: 'node --test scripts/lupa/agentic-school-loader.test.mjs scripts/lupa/agentic-loop-progress.test.mjs scripts/lupa/validar-relato-pivete.test.mjs',
    scar: 'Todo defeito provado exige teste vermelho antes, verde depois e lição somente após Judge + CHEFE.',
    blocking_pending: blockers.map((item) => `${item.label}: ${item.next_step}`),
    non_blocking_pending: nonBlockers.map((item) => `${item.label}: ${item.next_step}`),
    anticipation: blockers.length ? 'Não declarar escola operacional nem promover para main enquanto houver gate obrigatório fora de PASS.' : 'A escola está operacional na branch, mas a entrega não é completa enquanto existir gate opcional fora de PASS.',
    next_movement: blockers[0]?.next_step || 'solicitar Judge no mesmo HEAD e manter merge sob decisão do CHEFE',
    chief_action: blockers.length ? 'NADA_AGORA; O WRITER DEVE FECHAR OS GATES TÉCNICOS' : 'DECIDIR PROMOÇÃO APÓS JUDGE INDEPENDENTE',
  };
}

function publicSituation(report) {
  if (report.situation === 'DONE_COM_PROVA') return 'PASS';
  if (report.situation === 'PARTIAL_COM_PROVA') return 'PARTIAL_COM_PROVA';
  if (report.situation === 'BLOCKED' || report.situation === 'PARTIAL_BLOQUEADO') return 'BLOCKED';
  return 'UNKNOWN';
}

function bulletLines(items, fallback) { return items.length ? items.map((item) => `- ${item}`).join('\n') : `- ${fallback}`; }

export function formatPiveteReport(report) {
  const ready = report.gates.filter((item) => item.status === 'PASS').map((item) => `${item.label} — ${item.evidence.join('; ')}`);
  const partial = report.gates.filter((item) => item.status === 'PARTIAL').map((item) => `${item.label} — falta: ${item.next_step}`);
  const missing = report.gates.filter((item) => item.status !== 'PASS' && item.status !== 'PARTIAL').map((item) => `${item.label} — condição: ${item.next_step}`);
  const verdict = report.operational_ready
    ? (report.complete ? 'A escola agentic está completa e provada no HEAD medido.' : 'A escola agentic está operacional e provada, mas ainda não está completa.')
    : 'A escola agentic não pode avançar porque existe gate obrigatório sem prova.';
  const source = process.env.CI ? 'GitHub' : 'arquivo local';
  const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || 'NÃO_INFORMADA';
  const context = process.env.GITHUB_EVENT_NAME === 'pull_request' ? 'PR_DO_WORKFLOW' : 'NÃO_INFORMADO';
  const regression = report.operational_ready ? 'PASS' : 'FAIL';
  const checkState = process.env.CI ? 'porta-de-entrada em execução no HEAD informado' : 'validação local';

  const output = [
    '╔════════════════════════════════════════════╗',
    '║ 🧠 CENTRALDARK — ESTADO DA MISSÃO         ║',
    '╚════════════════════════════════════════════╝',
    '',
    '🎯 VEREDITO=', verdict, '',
    '📊 PROGRESSO=',
    `ESCOPO_MEDIDO=${report.gates.length} gates declarados do Agentic Loop 4K`,
    `PERCENTUAL_MEDIDO=${report.progress.earned}/${report.progress.total}=${report.progress.percent}%`,
    'ESTIMATIVA=NÃO_CALCULADA',
    'ESCOPO_DA_ESTIMATIVA=NÃO_APLICÁVEL',
    `SITUAÇÃO=${publicSituation(report)}`,
    `OPERACIONAL=${report.operational_ready ? 'SIM' : 'NÃO'}`,
    `COMPLETO=${report.complete ? 'SIM' : 'NÃO'}`, '',
    '✅ O QUE JÁ ESTÁ PRONTO=', bulletLines(ready, 'NENHUM'), '',
    '🟡 O QUE ESTÁ PARCIAL=', bulletLines(partial, 'NENHUM'), '',
    '❌ O QUE AINDA FALTA=', bulletLines(missing, 'NENHUM GATE OBRIGATÓRIO'), '',
    '🚫 BLOQUEADORES=', bulletLines(report.blocking_pending, 'NENHUM'), '',
    '⚠️ PENDÊNCIAS NÃO BLOQUEANTES=', bulletLines(report.non_blocking_pending, 'NENHUMA'), '',
    '🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=',
    `ERRO=${report.error}`,
    `CAUSA=${report.cause}`,
    `CORREÇÃO=${report.correction}`,
    `TESTE_DA_CICATRIZ=${report.test}`,
    `REGRESSÃO=${regression}`, '',
    '🔎 PROVA=',
    'REPOSITÓRIO=ServerVpss/CentralDark',
    `PR_OU_ISSUE=${context}`,
    `BRANCH=${branch}`,
    `HEAD=${report.measured_head}`,
    `CHECKS=${checkState}`,
    `TESTES=${report.test}`,
    `RECEIPT=agentic-loop-progress schema_version=${report.schema_version}`,
    `FONTE_DA_PROVA=${source}`, '',
    '🧭 FLUXO VISUAL=',
    'DIAGRAMA_OBRIGATÓRIO=SIM',
    'MOTIVO=O fechamento envolve CHEFE, agente, GitHub, CI e Judge.',
    '',
    '```mermaid',
    'sequenceDiagram',
    '  participant Chefe as SEGREDO/CHEFE',
    '  participant Agente as IA/Agente',
    '  participant GitHub',
    '  participant CI as CI/CD',
    '  participant Juiz as Judge',
    '  Chefe->>Agente: define intenção, escopo e autorização',
    '  Agente->>GitHub: publica mudança no PR',
    '  GitHub->>CI: executa gates no HEAD exato',
    '  CI-->>Agente: devolve PASS ou falha reproduzível',
    '  Agente->>Juiz: solicita revisão independente',
    '  Juiz-->>Chefe: entrega veredito e próximo gate',
    '```', '',
    '🗣️ PAPO RETO DO PIVETE=',
    report.operational_ready
      ? 'O motor trabalha sozinho em todo commit e PR; a porcentagem, a ordem, o diagrama e a prova são verificadas por código.'
      : 'Ainda existe porta sem prova. O sistema não chama isso de verde e entrega diretamente o próximo ponto que precisa ser fechado.', '',
    '➡️ PRÓXIMO GATE=', report.next_movement, '',
    '🧰 COMANDO CIRÚRGICO=', 'NENHUM', '',
    '🧪 COLETA DO CHEFE=', 'NENHUMA', '',
    '👑 AÇÃO DO CHEFE=', report.chief_action, '',
    '🛡️ O QUE NÃO FOI TOCADO=', '- main', '- VPS', '- produção', '- segredo', '- deploy', '',
    'AUTORIA_DO_PADRÃO=SEGREDO/CHEFE',
  ].join('\n');

  validateReport(output, 'full');
  return output;
}

function argValue(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function main() {
  const args = process.argv.slice(2);
  const root = path.resolve(argValue(args, '--repo-root', process.cwd()));
  const supplied = argValue(args, '--expected-head', process.env.GITHUB_SHA || null);
  const expectedHead = resolveVerifiedHead(root, supplied);
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
