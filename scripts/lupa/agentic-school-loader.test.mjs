import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import test from 'node:test';
import { loadSchool, parseFrontmatter, validateLessons } from './agentic-school-loader.mjs';

const adapters = [
  'AGENTS.md', 'CLAUDE.md', 'CODEX.md', 'GEMINI.md', '.github/copilot-instructions.md',
  '.cursor/rules/centraldark-governanca.mdc', '.windsurfrules', '.claude/rules/00-centraldark-boot-universal.md',
];
const courseSha = '592b0075b27d4a160e015654b40f0813a965f5f84668a97e9535097ac8103521';

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function contractContent() {
  return [
    'PR #499', 'PR #554', 'PR #585', 'PR #611', 'todo commit', 'todo PR',
    '🧠 CENTRALDARK — ESTADO DA MISSÃO', '🎯 VEREDITO=', 'PERCENTUAL_MEDIDO=', 'ESTIMATIVA=',
    '🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=', '🧭 FLUXO VISUAL=', 'DIAGRAMA_OBRIGATÓRIO=',
    '```mermaid', 'sequenceDiagram', '🗣️ PAPO RETO DO PIVETE=', '➡️ PRÓXIMO GATE=',
    '🧰 COMANDO CIRÚRGICO=', '🧪 COLETA DO CHEFE=', '👑 AÇÃO DO CHEFE=',
    'AUTORIA_DO_PADRÃO=SEGREDO/CHEFE', 'E:\\CentralDark\\Pivete\\TEMP',
  ].join('\n');
}

function prTemplateContent() {
  return `${contractContent()}\n## Arquivos sensíveis\n## Testes\n`;
}

function codeRabbitContent(contract) {
  return `language: "pt-BR"
tone_instructions: >-
  PT-BR, direto e baseado em prova. Use o contrato Pivete; separe medição de estimativa, mostre diagnóstico, prova, fluxo visual e próximo gate.
reviews:
  sequence_diagrams: true
  auto_review:
    drafts: true
  finishing_touches:
    docstrings:
      enabled: false
    autofix:
      enabled: false
    fix_ci:
      enabled: false
    resolve_merge_conflict:
      enabled: false
    unit_tests:
      enabled: false
  path_instructions:
    - path: "**/*"
      instructions: "${contract}"
`;
}

function workflowContent() {
  return `name: porta
on:
  pull_request:
    types: [opened, synchronize, edited]
  push:
    branches: ["**"]
  merge_group:
  workflow_dispatch:
permissions:
  contents: read
jobs:
  validar:
    runs-on: ubuntu-latest
    steps:
      - run: node --test scripts/lupa/agentic-school-loader.test.mjs scripts/lupa/agentic-loop-progress.test.mjs scripts/lupa/validar-relato-pivete.test.mjs
      - run: node scripts/lupa/validar-relato-pivete.mjs --mode pr --input body.md
`;
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentic-school-'));
  const skill = '.agents/skills/agentic-ci-loop/SKILL.md';
  const contract = '.agents/skills/agentic-ci-loop/references/CONTRATO.md';
  const validator = 'scripts/lupa/validar-relato-pivete.mjs';
  const course = '.agents/skills/agentic-ci-loop/references/ESCOLA.md';
  const zero = '.agents/skills/agentic-ci-loop/references/ZERO.md';
  const ledger = '.agents/skills/agentic-ci-loop/references/learning-ledger.jsonl';
  const receipt = '.agents/skills/agentic-ci-loop/references/SOURCE.txt.gz.base64';
  const visualSvg = 'docs/ARQUITETURA/artefatos/visual.svg';
  const visualReadme = 'docs/ARQUITETURA/artefatos/LEIA-ME.txt';
  const reviewAdapter = '.coderabbit.yaml';
  const prTemplate = '.github/pull_request_template.md';
  const globalWorkflow = '.github/workflows/porta-de-entrada.yml';
  write(root, 'LEIA-ME-IA.md', `${skill}\nscripts/lupa/agentic-school-loader.mjs\n`);
  for (const adapter of adapters) write(root, adapter, 'LEIA-ME-IA.md\n');
  write(root, skill, '---\nname: agentic-ci-loop\ndescription: test\n---\n');
  write(root, '.agents/skills/meta-lupa/SKILL.md', '---\nname: meta-lupa\ndescription: test\n---\n');
  write(root, contract, contractContent());
  write(root, validator, "REPORT_PERCENT_MISMATCH\nREPORT_HEADER_ORDER_INVALID\nREPORT_MERMAID_SEQUENCE_MISSING\n'pr'\n");
  write(root, course, `---\ntitle: "Escola"\nsource_sha256: "${courseSha}"\n---\n# Escola\n`);
  write(root, zero, '# Zero\n');
  const receiptText = `SOURCE_EXTERNAL_ATTACHMENT\nSHA256=${courseSha}\nSTATUS=RECEIPT_ONLY_NOT_BOOT_CONTEXT\n`;
  write(root, receipt, zlib.gzipSync(Buffer.from(receiptText), { mtime: 0 }).toString('base64'));
  write(root, visualSvg, '<svg/>');
  write(root, visualReadme, 'visual');
  write(root, reviewAdapter, codeRabbitContent(contract));
  write(root, prTemplate, prTemplateContent());
  write(root, globalWorkflow, workflowContent());
  write(root, ledger, JSON.stringify({
    schema_version: 1,
    lesson_id: 'L1',
    status: 'APPROVED',
    trigger: 'debug',
    rule: 'Nunca transforme ausência de evidência em aprovação operacional.',
    regression_test: 'test::unknown-blocked',
    evidence_sha256: 'a'.repeat(64),
    head_sha: 'b'.repeat(40),
    writer: 'writer',
    judge: 'judge',
    chief_decision: 'APPROVED',
  }) + '\n');
  const manifest = {
    schema_version: 1,
    school_id: 'CENTRALDARK-AGENTIC-SCHOOL',
    source_of_truth: 'ServerVpss/CentralDark',
    core_skill: skill,
    output_contract: contract,
    report_validator: validator,
    course,
    lessons_ledger: ledger,
    review_adapter: reviewAdapter,
    pr_template: prTemplate,
    global_workflow: globalWorkflow,
    source_artifacts: {
      course_source_receipt_gzip_base64_path: receipt,
      course_source_storage: 'EXTERNAL_ATTACHMENT_VALIDATED_CONDENSED_IN_REPO',
      course_txt_sha256: courseSha,
      visual_source_svg_path: visualSvg,
      visual_source_svg_sha256: 'd4dc56669143034f31aa309635d4113d9ad76a02b1739da22c965ed2049be9e6',
      visual_readme_path: visualReadme,
      visual_readme_source_sha256: 'a5961f3f5ac8a594d1c084d5948a7fa0b44d181b67ede0973c6641216ec06920',
      visual_binary_storage: 'ATTACHMENT_VALIDATED_NOT_VERSIONED_BY_TEXT_CONNECTOR',
      visual_zip_sha256: 'd'.repeat(64), visual_zip_bytes: 1,
      png_complete_sha256: 'e'.repeat(64), png_clean_sha256: 'f'.repeat(64),
      svg_sha256: 'd4dc56669143034f31aa309635d4113d9ad76a02b1739da22c965ed2049be9e6',
      readme_sha256: 'a5961f3f5ac8a594d1c084d5948a7fa0b44d181b67ede0973c6641216ec06920',
    },
    tasks: { 'critical-refactor': [zero], debug: [zero], feature: [course], review: [zero], 'skill-evolution': [course] },
    adapters,
    required_boot_tokens: ['LEIA-ME-IA.md'],
  };
  const manifestPath = '.agents/skills/agentic-ci-loop/references/school.manifest.json';
  write(root, manifestPath, JSON.stringify(manifest, null, 2));
  return { root, skill, contract, validator, course, zero, ledger, reviewAdapter, prTemplate, globalWorkflow, manifestPath, manifest };
}

function cleanup(root) { fs.rmSync(root, { recursive: true, force: true }); }
function updateManifest(fx, mutate) {
  const manifest = structuredClone(fx.manifest);
  mutate(manifest);
  write(fx.root, fx.manifestPath, JSON.stringify(manifest, null, 2));
}

test('carrega núcleo, contrato, superfícies globais e módulo da tarefa', () => {
  const fx = fixture();
  try {
    const result = loadSchool({ root: fx.root, task: 'critical-refactor', expectedHead: 'd'.repeat(40) });
    assert.equal(result.boot_status, 'PASS');
    assert.deepEqual(result.load_order, [fx.skill, fx.contract, fx.zero]);
    assert.deepEqual(result.checked_global_surfaces, [fx.reviewAdapter, fx.prTemplate, fx.globalWorkflow]);
    assert.equal(result.approved_lessons.length, 1);
  } finally { cleanup(fx.root); }
});

test('bloqueia tarefa desconhecida', () => {
  const fx = fixture();
  try { assert.throws(() => loadSchool({ root: fx.root, task: 'random' }), /SCHOOL_TASK_UNKNOWN/); }
  finally { cleanup(fx.root); }
});

test('bloqueia tarefa conhecida sem módulo', () => {
  const fx = fixture();
  try {
    updateManifest(fx, (manifest) => { manifest.tasks['critical-refactor'] = []; });
    assert.throws(() => loadSchool({ root: fx.root, task: 'critical-refactor' }), /SCHOOL_TASK_WITHOUT_MODULE/);
  } finally { cleanup(fx.root); }
});

test('bloqueia adaptador que não aponta para o boot', () => {
  const fx = fixture();
  try {
    write(fx.root, adapters[0], 'sem porta\n');
    assert.throws(() => loadSchool({ root: fx.root, task: 'debug' }), /SCHOOL_ADAPTER_WITHOUT_BOOT/);
  } finally { cleanup(fx.root); }
});

test('bloqueia skill duplicada', () => {
  const fx = fixture();
  try {
    write(fx.root, '.claude/skills/copia.md', '---\nname: agentic-ci-loop\ndescription: copia\n---\n');
    assert.throws(() => loadSchool({ root: fx.root, task: 'debug' }), /SCHOOL_SKILL_DUPLICATED/);
  } finally { cleanup(fx.root); }
});

test('bloqueia contrato de relato ausente', () => {
  const fx = fixture();
  try {
    fs.rmSync(path.join(fx.root, fx.contract));
    assert.throws(() => loadSchool({ root: fx.root, task: 'review' }), /SCHOOL_PATH_MISSING/);
  } finally { cleanup(fx.root); }
});

test('bloqueia contrato sem fluxo visual', () => {
  const fx = fixture();
  try {
    write(fx.root, fx.contract, contractContent().replace('🧭 FLUXO VISUAL=', 'SEM FLUXO'));
    assert.throws(() => loadSchool({ root: fx.root, task: 'review' }), /REPORT_CONTRACT_TOKEN_MISSING/);
  } finally { cleanup(fx.root); }
});

test('bloqueia receipt com SHA diferente da fonte declarada', () => {
  const fx = fixture();
  try {
    const bad = zlib.gzipSync(Buffer.from(`SOURCE_EXTERNAL_ATTACHMENT\nSHA256=${'c'.repeat(64)}\nSTATUS=RECEIPT_ONLY_NOT_BOOT_CONTEXT\n`), { mtime: 0 }).toString('base64');
    write(fx.root, '.agents/skills/agentic-ci-loop/references/SOURCE.txt.gz.base64', bad);
    assert.throws(() => loadSchool({ root: fx.root, task: 'debug' }), /COURSE_RECEIPT_SHA_MISMATCH/);
  } finally { cleanup(fx.root); }
});

test('bloqueia source_sha256 falso mesmo quando valor correto aparece em comentário', () => {
  const fx = fixture();
  try {
    write(fx.root, fx.course, `---\ntitle: "Escola"\nsource_sha256: "${'0'.repeat(64)}"\n---\n<!-- source_sha256: "${courseSha}" -->\n`);
    assert.throws(() => loadSchool({ root: fx.root, task: 'debug' }), /COURSE_DOCUMENT_SOURCE_SHA_MISMATCH/);
  } finally { cleanup(fx.root); }
});

test('bloqueia chave duplicada no frontmatter', () => {
  assert.throws(() => parseFrontmatter('---\nsource_sha256: "a"\nsource_sha256: "b"\n---\n'), /FRONTMATTER_DUPLICATE_KEY/);
});

test('bloqueia tone_instructions acima de 250 caracteres', () => {
  const fx = fixture();
  try {
    write(fx.root, fx.reviewAdapter, codeRabbitContent(fx.contract).replace('PT-BR, direto e baseado em prova.', 'x'.repeat(251)));
    assert.throws(() => loadSchool({ root: fx.root, task: 'review' }), /CODERABBIT_TONE_TOO_LONG/);
  } finally { cleanup(fx.root); }
});

test('bloqueia workflow limitado à main', () => {
  const fx = fixture();
  try {
    write(fx.root, fx.globalWorkflow, workflowContent().replace('branches: ["**"]', 'branches: [main]'));
    assert.throws(() => loadSchool({ root: fx.root, task: 'review' }), /GLOBAL_WORKFLOW_ALL_PUSHES_MISSING/);
  } finally { cleanup(fx.root); }
});

test('bloqueia PR sem gate do corpo Pivete', () => {
  const fx = fixture();
  try {
    write(fx.root, fx.globalWorkflow, workflowContent().replace('validar-relato-pivete.mjs --mode pr', 'echo sem-gate'));
    assert.throws(() => loadSchool({ root: fx.root, task: 'review' }), /GLOBAL_WORKFLOW_PR_BODY_GATE_MISSING/);
  } finally { cleanup(fx.root); }
});

test('bloqueia lição aprovada pelo próprio Writer', () => {
  const lesson = JSON.stringify({
    schema_version: 1, lesson_id: 'L1', status: 'APPROVED', trigger: 'x',
    rule: 'Regra operacional longa o suficiente para ser válida.', regression_test: 't',
    evidence_sha256: 'a'.repeat(64), head_sha: 'b'.repeat(40), writer: 'same', judge: 'same', chief_decision: 'APPROVED',
  });
  assert.throws(() => validateLessons(lesson), /LESSON_SELF_APPROVED/);
});

test('lição candidata não entra no boot', () => {
  const candidate = JSON.stringify({
    schema_version: 1, lesson_id: 'L2', status: 'CANDIDATE', trigger: 'x',
    rule: 'Regra candidata ainda não promovida para todos os agentes.', regression_test: 't',
    evidence_sha256: 'a'.repeat(64), head_sha: 'b'.repeat(40), writer: 'w', judge: 'j', chief_decision: 'PENDING',
  });
  assert.deepEqual(validateLessons(candidate), []);
});
