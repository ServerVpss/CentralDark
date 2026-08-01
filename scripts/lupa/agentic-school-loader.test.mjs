import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import test from 'node:test';
import { loadSchool, validateLessons } from './agentic-school-loader.mjs';

const adapters = [
  'AGENTS.md', 'CLAUDE.md', 'CODEX.md', 'GEMINI.md', '.github/copilot-instructions.md',
  '.cursor/rules/centraldark-governanca.mdc', '.windsurfrules', '.claude/rules/00-centraldark-boot-universal.md',
];

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentic-school-'));
  const skill = '.agents/skills/agentic-ci-loop/SKILL.md';
  const course = '.agents/skills/agentic-ci-loop/references/ESCOLA.md';
  const zero = '.agents/skills/agentic-ci-loop/references/ZERO.md';
  const ledger = '.agents/skills/agentic-ci-loop/references/learning-ledger.jsonl';
  const source = '.agents/skills/agentic-ci-loop/references/SOURCE.txt.gz.base64';
  const visualSvg = 'docs/ARQUITETURA/artefatos/visual.svg';
  const visualReadme = 'docs/ARQUITETURA/artefatos/LEIA-ME.txt';
  write(root, 'LEIA-ME-IA.md', `${skill}\nscripts/lupa/agentic-school-loader.mjs\n`);
  for (const adapter of adapters) write(root, adapter, 'LEIA-ME-IA.md\n');
  write(root, skill, '---\nname: agentic-ci-loop\ndescription: test\n---\n');
  write(root, '.agents/skills/meta-lupa/SKILL.md', '---\nname: meta-lupa\ndescription: test\n---\n');
  write(root, course, '# Escola\n');
  write(root, zero, '# Zero\n');
  write(root, source, zlib.gzipSync(Buffer.from('curso fonte'), { mtime: 0 }).toString('base64'));
  write(root, visualSvg, '<svg/>');
  write(root, visualReadme, 'visual');
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
  write(root, '.agents/skills/agentic-ci-loop/references/school.manifest.json', JSON.stringify({
    schema_version: 1,
    school_id: 'CENTRALDARK-AGENTIC-SCHOOL',
    source_of_truth: 'ServerVpss/CentralDark',
    core_skill: skill,
    course,
    lessons_ledger: ledger,
    source_artifacts: {
      course_txt_gzip_base64_path: source,
      course_txt_sha256: '592b0075b27d4a160e015654b40f0813a965f5f84668a97e9535097ac8103521',
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
  }, null, 2));
  return { root, skill, course, zero, ledger };
}

function cleanup(root) { fs.rmSync(root, { recursive: true, force: true }); }

test('carrega somente núcleo e módulo da tarefa', () => {
  const fx = fixture();
  try {
    const result = loadSchool({ root: fx.root, task: 'critical-refactor', expectedHead: 'd'.repeat(40) });
    assert.equal(result.boot_status, 'PASS');
    assert.deepEqual(result.load_order, [fx.skill, fx.zero]);
    assert.equal(result.approved_lessons.length, 1);
  } finally { cleanup(fx.root); }
});

test('bloqueia tarefa desconhecida', () => {
  const fx = fixture();
  try { assert.throws(() => loadSchool({ root: fx.root, task: 'random' }), /SCHOOL_TASK_UNKNOWN/); }
  finally { cleanup(fx.root); }
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
