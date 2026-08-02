import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { loadSchool, parseFrontmatter, validateLessons } from './agentic-school-loader.mjs';

const adapters = [
  'AGENTS.md', 'CLAUDE.md', 'CODEX.md', 'GEMINI.md', '.github/copilot-instructions.md',
  '.cursor/rules/centraldark-governanca.mdc', '.windsurfrules', '.claude/rules/00-centraldark-boot-universal.md',
];
const courseSha = '592b0075b27d4a160e015654b40f0813a965f5f84668a97e9535097ac8103521';
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function contractContent() {
  return [
    'PR #499', 'PR #554', 'PR #585', 'PR #611', 'todo commit', 'todo PR',
    '🧠 CENTRALDARK — ESTADO DA MISSÃO', '🎯 VEREDITO=', 'GATES_MEDIDOS_JSON=',
    'PERCENTUAL_MEDIDO=', 'ESTIMATIVA=', '🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=',
    'EMISSOR=', 'PAPEL_DO_EMISSOR=', '🧭 FLUXO VISUAL=', 'DIAGRAMA_OBRIGATÓRIO=',
    'sequenceDiagram', '🗣️ PAPO RETO DO PIVETE=', '➡️ PRÓXIMO GATE=',
    '🧰 COMANDO CIRÚRGICO=', '🧪 COLETA DO CHEFE=', '👑 AÇÃO DO CHEFE=',
    'AUTORIA_DO_PADRÃO=SEGREDO/CHEFE', 'E:\\CentralDark\\Pivete\\TEMP',
  ].join('\n');
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
      - run: python .agents/skills/meta-lupa/scripts/meta_lupa.py issue-gate-receipt --output meta.json
      - run: node scripts/lupa/agentic-loop-progress.mjs --test-receipt tests.json --meta-lupa-receipt meta.json
`;
}

function candidateLesson() {
  return {
    schema_version: 1,
    lesson_id: 'L-CANDIDATE',
    status: 'CANDIDATE',
    trigger: 'debug',
    rule: 'Nunca transforme ausência de evidência em aprovação operacional.',
    regression_test: 'agentic-school-loader.test.mjs::candidate',
    evidence_sha256: 'a'.repeat(64),
    head_sha: 'b'.repeat(40),
    writer: 'writer',
    judge: 'PENDING_INDEPENDENT_JUDGE',
    chief_decision: 'PENDING',
  };
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
  const manifestPath = '.agents/skills/agentic-ci-loop/references/school.manifest.json';

  write(root, 'LEIA-ME-IA.md', `${skill}\nscripts/lupa/agentic-school-loader.mjs\n`);
  for (const adapter of adapters) write(root, adapter, 'LEIA-ME-IA.md\n');
  write(root, skill, '---\nname: agentic-ci-loop\ndescription: test\n---\n');
  write(root, '.agents/skills/meta-lupa/SKILL.md', '---\nname: meta-lupa\ndescription: test\n---\n');
  write(root, contract, contractContent());
  write(root, validator, "REPORT_GATES_PERCENT_MISMATCH\nREPORT_HEADER_DUPLICATED\nREPORT_MERMAID_SEQUENCE_MISSING\nREPORT_AUTHORSHIP_NOT_UNIQUE\nREPORT_COLLECTION_SINGLE_SCRIPT_REQUIRED\n'pr'\n");
  write(root, course, `---\ntitle: "Escola"\nsource_sha256: "${courseSha}"\n---\n# Escola\n`);
  write(root, zero, '# Zero\n');
  write(root, receipt, zlib.gzipSync(Buffer.from(`SOURCE_EXTERNAL_ATTACHMENT\nSHA256=${courseSha}\nSTATUS=RECEIPT_ONLY_NOT_BOOT_CONTEXT\n`), { mtime: 0 }).toString('base64'));
  write(root, visualSvg, '<svg/>');
  write(root, visualReadme, 'visual');
  write(root, reviewAdapter, codeRabbitContent(contract));
  write(root, prTemplate, `${contractContent()}\n## Arquivos sensíveis\n## Testes\n## Ações sensíveis\n## Revisão\n`);
  write(root, globalWorkflow, workflowContent());
  write(root, ledger, `${JSON.stringify(candidateLesson())}\n`);

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
      visual_source_svg_sha256: digest('<svg/>'),
      visual_readme_path: visualReadme,
      visual_readme_source_sha256: digest('visual'),
      visual_binary_storage: 'ATTACHMENT_VALIDATED_NOT_VERSIONED_BY_TEXT_CONNECTOR',
      visual_zip_sha256: 'd'.repeat(64), visual_zip_bytes: 1,
      png_complete_sha256: 'e'.repeat(64), png_clean_sha256: 'f'.repeat(64),
      svg_sha256: digest('<svg/>'), readme_sha256: digest('visual'),
    },
    tasks: { 'critical-refactor': [zero], debug: [zero], feature: [course], review: [zero], 'skill-evolution': [course] },
    adapters,
    required_boot_tokens: ['LEIA-ME-IA.md'],
  };
  write(root, manifestPath, JSON.stringify(manifest, null, 2));
  return { root, skill, contract, validator, course, zero, ledger, receipt, reviewAdapter, prTemplate, globalWorkflow, manifestPath, manifest };
}

function cleanup(root) { fs.rmSync(root, { recursive: true, force: true }); }
function updateManifest(fx, mutate) {
  const manifest = structuredClone(fx.manifest);
  mutate(manifest);
  write(fx.root, fx.manifestPath, JSON.stringify(manifest, null, 2));
}
function initGit(root) {
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: root });
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'fixture'], { cwd: root });
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
}
function installApprovedLesson(fx, overrides = {}) {
  const head = initGit(fx.root);
  const testPath = 'tests/regression.test.mjs';
  const evidencePath = 'receipts/evidence.txt';
  const judgePath = 'receipts/judge.json';
  const selector = 'approved lesson regression';
  const evidence = 'evidence bound to approved lesson';
  const judge = { status: 'PASS', head_sha: head, writer: 'writer', judge: 'judge', chief_decision: 'APPROVED' };
  write(fx.root, testPath, `test('${selector}', () => true);\n`);
  write(fx.root, evidencePath, evidence);
  write(fx.root, judgePath, JSON.stringify(judge));
  const lesson = {
    schema_version: 1,
    lesson_id: 'L-APPROVED', status: 'APPROVED', trigger: 'debug',
    rule: 'A lição aprovada resolve teste, evidência, Judge e HEAD reais.',
    regression_test: `${testPath}::${selector}`,
    regression_test_path: testPath,
    regression_test_selector: selector,
    evidence_sha256: digest(evidence),
    evidence_receipt_path: evidencePath,
    judge_receipt_path: judgePath,
    judge_receipt_sha256: digest(JSON.stringify(judge)),
    head_sha: head, writer: 'writer', judge: 'judge', chief_decision: 'APPROVED',
    ...overrides,
  };
  write(fx.root, fx.ledger, `${JSON.stringify(lesson)}\n`);
  return { lesson, head };
}

test('carrega núcleo, contrato, superfícies globais e módulo da tarefa', () => {
  const fx = fixture();
  try {
    const result = loadSchool({ root: fx.root, task: 'critical-refactor', expectedHead: 'd'.repeat(40) });
    assert.equal(result.boot_status, 'PASS');
    assert.deepEqual(result.load_order, [fx.skill, fx.contract, fx.zero]);
    assert.deepEqual(result.checked_global_surfaces, [fx.reviewAdapter, fx.prTemplate, fx.globalWorkflow]);
    assert.equal(result.approved_lessons.length, 0);
    assert.equal(result.candidate_lessons.length, 1);
  } finally { cleanup(fx.root); }
});

test('aceita lição aprovada somente com provas resolvidas', () => {
  const fx = fixture();
  try {
    installApprovedLesson(fx);
    assert.equal(loadSchool({ root: fx.root, task: 'debug' }).approved_lessons.length, 1);
  } finally { cleanup(fx.root); }
});

test('bloqueia lição aprovada sem receipt verificável', () => {
  const fx = fixture();
  try {
    installApprovedLesson(fx, { evidence_receipt_path: 'receipts/ausente.txt' });
    assert.throws(() => loadSchool({ root: fx.root, task: 'debug' }), /LESSON_EVIDENCE_RECEIPT_MISSING/);
  } finally { cleanup(fx.root); }
});

test('bloqueia hash de evidência fabricado', () => {
  const fx = fixture();
  try {
    installApprovedLesson(fx, { evidence_sha256: '0'.repeat(64) });
    assert.throws(() => loadSchool({ root: fx.root, task: 'debug' }), /LESSON_EVIDENCE_RECEIPT_SHA_MISMATCH/);
  } finally { cleanup(fx.root); }
});

test('bloqueia Judge preso a outro HEAD', () => {
  const fx = fixture();
  try {
    const { lesson } = installApprovedLesson(fx);
    const judge = { status: 'PASS', head_sha: 'f'.repeat(40), writer: 'writer', judge: 'judge', chief_decision: 'APPROVED' };
    write(fx.root, lesson.judge_receipt_path, JSON.stringify(judge));
    lesson.judge_receipt_sha256 = digest(JSON.stringify(judge));
    write(fx.root, fx.ledger, `${JSON.stringify(lesson)}\n`);
    assert.throws(() => loadSchool({ root: fx.root, task: 'debug' }), /LESSON_JUDGE_HEAD_MISMATCH/);
  } finally { cleanup(fx.root); }
});

test('bloqueia tarefa conhecida sem módulo', () => {
  const fx = fixture();
  try {
    updateManifest(fx, (manifest) => { manifest.tasks['critical-refactor'] = []; });
    assert.throws(() => loadSchool({ root: fx.root, task: 'critical-refactor' }), /SCHOOL_TASK_WITHOUT_MODULE/);
  } finally { cleanup(fx.root); }
});

test('bloqueia módulo com saída obrigatória concorrente', () => {
  const fx = fixture();
  try {
    write(fx.root, fx.zero, '# Zero\n## Saída obrigatória\nformato paralelo\n');
    assert.throws(() => loadSchool({ root: fx.root, task: 'debug' }), /SCHOOL_COMPETING_OUTPUT_CONTRACT/);
  } finally { cleanup(fx.root); }
});

test('bloqueia adaptador sem boot, skill duplicada e tarefa desconhecida', () => {
  const fx = fixture();
  try {
    write(fx.root, adapters[0], 'sem porta\n');
    assert.throws(() => loadSchool({ root: fx.root, task: 'debug' }), /SCHOOL_ADAPTER_WITHOUT_BOOT/);
    write(fx.root, adapters[0], 'LEIA-ME-IA.md\n');
    write(fx.root, '.claude/skills/copia.md', '---\nname: agentic-ci-loop\ndescription: copia\n---\n');
    assert.throws(() => loadSchool({ root: fx.root, task: 'debug' }), /SCHOOL_SKILL_DUPLICATED/);
    fs.rmSync(path.join(fx.root, '.claude/skills/copia.md'));
    assert.throws(() => loadSchool({ root: fx.root, task: 'random' }), /SCHOOL_TASK_UNKNOWN/);
  } finally { cleanup(fx.root); }
});

test('bloqueia frontmatter falso e chave duplicada', () => {
  const fx = fixture();
  try {
    write(fx.root, fx.course, `---\ntitle: "Escola"\nsource_sha256: "${'0'.repeat(64)}"\n---\n<!-- source_sha256: "${courseSha}" -->\n`);
    assert.throws(() => loadSchool({ root: fx.root, task: 'debug' }), /COURSE_DOCUMENT_SOURCE_SHA_MISMATCH/);
    assert.throws(() => parseFrontmatter('---\nsource_sha256: "a"\nsource_sha256: "b"\n---\n'), /FRONTMATTER_DUPLICATE_KEY/);
  } finally { cleanup(fx.root); }
});

test('bloqueia CodeRabbit longo, workflow estreito e PR sem gate', () => {
  const fx = fixture();
  try {
    write(fx.root, fx.reviewAdapter, codeRabbitContent(fx.contract).replace('PT-BR, direto e baseado em prova.', 'x'.repeat(251)));
    assert.throws(() => loadSchool({ root: fx.root, task: 'review' }), /CODERABBIT_TONE_TOO_LONG/);
    write(fx.root, fx.reviewAdapter, codeRabbitContent(fx.contract));
    write(fx.root, fx.globalWorkflow, workflowContent().replace('branches: ["**"]', 'branches: [main]'));
    assert.throws(() => loadSchool({ root: fx.root, task: 'review' }), /GLOBAL_WORKFLOW_ALL_PUSHES_MISSING/);
    write(fx.root, fx.globalWorkflow, workflowContent().replace('validar-relato-pivete.mjs --mode pr', 'echo sem-gate'));
    assert.throws(() => loadSchool({ root: fx.root, task: 'review' }), /GLOBAL_WORKFLOW_GATE_MISSING/);
  } finally { cleanup(fx.root); }
});

test('lição candidata não entra no boot e autoaprovação bloqueia', () => {
  assert.deepEqual(validateLessons(`${JSON.stringify(candidateLesson())}\n`), []);
  const approved = { ...candidateLesson(), status: 'APPROVED', writer: 'same', judge: 'same', chief_decision: 'APPROVED' };
  assert.throws(() => validateLessons(JSON.stringify(approved)), /LESSON_SELF_APPROVED/);
});
