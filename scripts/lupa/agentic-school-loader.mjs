#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const DEFAULT_MANIFEST = '.agents/skills/agentic-ci-loop/references/school.manifest.json';
const CORE_BOOT = 'LEIA-ME-IA.md';
const SHA40 = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const REQUIRED_REPORT_TOKENS = Object.freeze([
  '🧠 CENTRALDARK — ESTADO DA MISSÃO',
  '🎯 VEREDITO=',
  'PERCENTUAL_MEDIDO=',
  'ESTIMATIVA=',
  '🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=',
  '🧭 FLUXO VISUAL=',
  'DIAGRAMA_OBRIGATÓRIO=',
  'sequenceDiagram',
  '🗣️ PAPO RETO DO PIVETE=',
  '➡️ PRÓXIMO GATE=',
  '🧰 COMANDO CIRÚRGICO=',
  '🧪 COLETA DO CHEFE=',
  '👑 AÇÃO DO CHEFE=',
  'AUTORIA_DO_PADRÃO=SEGREDO/CHEFE',
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(root, relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(root, relativePath) {
  return JSON.parse(readText(root, relativePath));
}

function sha256File(root, relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function listFiles(root, relativeDirectory) {
  const base = path.join(root, relativeDirectory);
  if (!fs.existsSync(base)) return [];
  const output = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else output.push(path.relative(root, absolute).split(path.sep).join('/'));
    }
  };
  walk(base);
  return output;
}

function parseSkillName(content, relativePath) {
  const frontmatter = parseFrontmatter(content, relativePath);
  assert(typeof frontmatter.name === 'string' && frontmatter.name.length > 0, `SKILL_NAME_MISSING:${relativePath}`);
  return frontmatter.name;
}

export function parseFrontmatter(content, relativePath = 'document') {
  const normalized = String(content).replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  assert(lines[0]?.trim() === '---', `FRONTMATTER_START_MISSING:${relativePath}`);
  const end = lines.indexOf('---', 1);
  assert(end > 1, `FRONTMATTER_END_MISSING:${relativePath}`);
  const result = {};
  for (const [offset, raw] of lines.slice(1, end).entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*?)\s*$/);
    assert(match, `FRONTMATTER_LINE_INVALID:${relativePath}:${offset + 2}`);
    const key = match[1];
    assert(!Object.hasOwn(result, key), `FRONTMATTER_DUPLICATE_KEY:${relativePath}:${key}`);
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    result[key] = value;
  }
  return result;
}

function extractYamlScalar(content, key) {
  const lines = String(content).replace(/\r\n/g, '\n').split('\n');
  const keyPattern = new RegExp(`^(\\s*)${key}:\\s*(.*)$`);
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(keyPattern);
    if (!match) continue;
    const baseIndent = match[1].length;
    const raw = match[2].trim();
    if (!['>-', '|-', '>', '|'].includes(raw)) return raw.replace(/^['"]|['"]$/g, '');
    const chunks = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const current = lines[cursor];
      if (!current.trim()) { chunks.push(''); continue; }
      const indent = current.match(/^\s*/)[0].length;
      if (indent <= baseIndent) break;
      chunks.push(current.trim());
    }
    return chunks.join(' ').replace(/\s+/g, ' ').trim();
  }
  return null;
}

function validateReportContract(root, contractPath, validatorPath) {
  const contract = readText(root, contractPath);
  for (const token of REQUIRED_REPORT_TOKENS) assert(contract.includes(token), `REPORT_CONTRACT_TOKEN_MISSING:${token}`);
  assert(contract.includes('PR #499'), 'REPORT_CONTRACT_SOURCE_MISSING:499');
  assert(contract.includes('PR #554'), 'REPORT_CONTRACT_SOURCE_MISSING:554');
  assert(contract.includes('PR #585'), 'REPORT_CONTRACT_SOURCE_MISSING:585');
  assert(contract.includes('PR #611'), 'REPORT_CONTRACT_SOURCE_MISSING:611');
  assert(contract.includes('E:\\CentralDark\\Pivete\\TEMP'), 'REPORT_CONTRACT_TEMP_PATH_MISSING');
  assert(/todo commit/i.test(contract) && /todo PR/i.test(contract), 'REPORT_CONTRACT_NOT_GLOBAL');
  const validator = readText(root, validatorPath);
  assert(validator.includes('REPORT_PERCENT_MISMATCH'), 'REPORT_VALIDATOR_PERCENT_GATE_MISSING');
  assert(validator.includes('REPORT_HEADER_ORDER_INVALID'), 'REPORT_VALIDATOR_ORDER_GATE_MISSING');
  assert(validator.includes('REPORT_MERMAID_SEQUENCE_MISSING'), 'REPORT_VALIDATOR_DIAGRAM_GATE_MISSING');
  assert(validator.includes("'pr'"), 'REPORT_VALIDATOR_PR_MODE_MISSING');
}

function validateCodeRabbit(root, relativePath, contractPath) {
  const content = readText(root, relativePath);
  const tone = extractYamlScalar(content, 'tone_instructions');
  assert(tone && tone.length > 0, 'CODERABBIT_TONE_MISSING');
  assert(tone.length <= 250, `CODERABBIT_TONE_TOO_LONG:${tone.length}`);
  assert(/language:\s*["']?pt-BR["']?/i.test(content), 'CODERABBIT_LANGUAGE_NOT_PTBR');
  assert(/sequence_diagrams:\s*true/i.test(content), 'CODERABBIT_SEQUENCE_DIAGRAMS_DISABLED');
  assert(/drafts:\s*true/i.test(content), 'CODERABBIT_DRAFT_REVIEW_DISABLED');
  assert(content.includes(contractPath), 'CODERABBIT_CONTRACT_POINTER_MISSING');
  for (const writeFeature of ['docstrings', 'autofix', 'fix_ci', 'resolve_merge_conflict', 'unit_tests']) {
    const pattern = new RegExp(`${writeFeature}:[\\s\\S]{0,100}?enabled:\\s*false`, 'i');
    assert(pattern.test(content), `CODERABBIT_WRITE_FEATURE_ENABLED:${writeFeature}`);
  }
}

function validatePrTemplate(root, relativePath) {
  const content = readText(root, relativePath);
  for (const token of REQUIRED_REPORT_TOKENS) assert(content.includes(token), `PR_TEMPLATE_TOKEN_MISSING:${token}`);
  assert(content.includes('## Arquivos sensíveis'), 'PR_TEMPLATE_SENSITIVE_SECTION_MISSING');
  assert(content.includes('## Testes'), 'PR_TEMPLATE_TESTS_SECTION_MISSING');
}

function validateGlobalWorkflow(root, relativePath) {
  const content = readText(root, relativePath);
  const eventBlock = content.match(/^on:\s*\n([\s\S]*?)^permissions:/m)?.[1] || '';
  assert(/^\s{2}pull_request:\s*$/m.test(eventBlock), 'GLOBAL_WORKFLOW_PULL_REQUEST_MISSING');
  assert(!/^\s{2}pull_request:\s*\n(?:\s{4}.*\n)*?\s{4}branches:/m.test(eventBlock), 'GLOBAL_WORKFLOW_PR_NARROWED');
  assert(/^\s{2}push:\s*\n\s{4}branches:\s*\[\s*["']\*\*["']\s*\]/m.test(eventBlock), 'GLOBAL_WORKFLOW_ALL_PUSHES_MISSING');
  assert(/^\s{2}merge_group:/m.test(eventBlock), 'GLOBAL_WORKFLOW_MERGE_GROUP_MISSING');
  assert(content.includes('validar-relato-pivete.mjs --mode pr'), 'GLOBAL_WORKFLOW_PR_BODY_GATE_MISSING');
  assert(content.includes('agentic-school-loader.test.mjs'), 'GLOBAL_WORKFLOW_SCHOOL_TEST_MISSING');
  assert(content.includes('agentic-loop-progress.test.mjs'), 'GLOBAL_WORKFLOW_PROGRESS_TEST_MISSING');
  assert(content.includes('validar-relato-pivete.test.mjs'), 'GLOBAL_WORKFLOW_REPORT_TEST_MISSING');
}

export function validateLessonLedger(content) {
  const approved = [];
  const candidates = [];
  const rejected = [];
  const ids = new Set();
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  for (const [index, line] of lines.entries()) {
    let lesson;
    try { lesson = JSON.parse(line); }
    catch { throw new Error(`LESSON_JSON_INVALID:${index + 1}`); }
    assert(lesson.schema_version === 1, `LESSON_SCHEMA_INVALID:${index + 1}`);
    assert(typeof lesson.lesson_id === 'string' && lesson.lesson_id.length > 0, `LESSON_ID_INVALID:${index + 1}`);
    assert(!ids.has(lesson.lesson_id), `LESSON_DUPLICATED:${lesson.lesson_id}`);
    ids.add(lesson.lesson_id);
    assert(['CANDIDATE', 'APPROVED', 'REJECTED'].includes(lesson.status), `LESSON_STATUS_INVALID:${lesson.lesson_id}`);
    assert(typeof lesson.trigger === 'string' && lesson.trigger.length > 0, `LESSON_TRIGGER_INVALID:${lesson.lesson_id}`);
    assert(typeof lesson.rule === 'string' && lesson.rule.length >= 20, `LESSON_RULE_WEAK:${lesson.lesson_id}`);
    assert(typeof lesson.regression_test === 'string' && lesson.regression_test.length > 0, `LESSON_WITHOUT_REGRESSION:${lesson.lesson_id}`);
    assert(SHA256.test(lesson.evidence_sha256), `LESSON_EVIDENCE_SHA_INVALID:${lesson.lesson_id}`);
    assert(SHA40.test(lesson.head_sha), `LESSON_HEAD_INVALID:${lesson.lesson_id}`);
    assert(typeof lesson.writer === 'string' && lesson.writer.length > 0, `LESSON_WRITER_INVALID:${lesson.lesson_id}`);
    assert(typeof lesson.judge === 'string' && lesson.judge.length > 0, `LESSON_JUDGE_INVALID:${lesson.lesson_id}`);
    assert(lesson.writer !== lesson.judge, `LESSON_SELF_APPROVED:${lesson.lesson_id}`);
    if (lesson.status === 'APPROVED') {
      assert(lesson.chief_decision === 'APPROVED', `LESSON_WITHOUT_CHIEF_APPROVAL:${lesson.lesson_id}`);
      assert(!lesson.judge.startsWith('PENDING_'), `LESSON_WITHOUT_JUDGE:${lesson.lesson_id}`);
      approved.push(lesson);
    } else if (lesson.status === 'CANDIDATE') {
      assert(lesson.chief_decision === 'PENDING', `LESSON_CANDIDATE_ALREADY_PROMOTED:${lesson.lesson_id}`);
      candidates.push(lesson);
    } else rejected.push(lesson);
  }
  return { approved, candidates, rejected };
}

export function validateLessons(content) {
  return validateLessonLedger(content).approved;
}

export function validateManifest(root, manifest) {
  assert(manifest.schema_version === 1, 'SCHOOL_SCHEMA_INVALID');
  assert(manifest.school_id === 'CENTRALDARK-AGENTIC-SCHOOL', 'SCHOOL_ID_INVALID');
  assert(manifest.source_of_truth === 'ServerVpss/CentralDark', 'SCHOOL_SOURCE_INVALID');
  for (const field of ['core_skill', 'output_contract', 'report_validator', 'course', 'lessons_ledger', 'review_adapter', 'pr_template', 'global_workflow']) {
    assert(typeof manifest[field] === 'string' && manifest[field].length > 0, `SCHOOL_${field.toUpperCase()}_INVALID`);
  }
  assert(manifest.tasks && typeof manifest.tasks === 'object', 'SCHOOL_TASKS_INVALID');
  assert(Array.isArray(manifest.adapters) && manifest.adapters.length > 0, 'SCHOOL_ADAPTERS_INVALID');
  assert(Array.isArray(manifest.required_boot_tokens), 'SCHOOL_BOOT_TOKENS_INVALID');

  const requiredPaths = new Set([manifest.core_skill, manifest.output_contract, manifest.report_validator, manifest.course, manifest.lessons_ledger, manifest.review_adapter, manifest.pr_template, manifest.global_workflow]);
  for (const [task, modules] of Object.entries(manifest.tasks)) {
    assert(Array.isArray(modules), `SCHOOL_TASK_MODULES_INVALID:${task}`);
    assert(modules.length > 0, `SCHOOL_TASK_WITHOUT_MODULE:${task}`);
    for (const modulePath of modules) requiredPaths.add(modulePath);
  }
  for (const relativePath of requiredPaths) assert(fs.existsSync(path.join(root, relativePath)), `SCHOOL_PATH_MISSING:${relativePath}`);

  validateReportContract(root, manifest.output_contract, manifest.report_validator);
  validateCodeRabbit(root, manifest.review_adapter, manifest.output_contract);
  validatePrTemplate(root, manifest.pr_template);
  validateGlobalWorkflow(root, manifest.global_workflow);

  const artifacts = manifest.source_artifacts || {};
  for (const [key, value] of Object.entries(artifacts)) if (key.endsWith('_sha256')) assert(SHA256.test(value), `SOURCE_SHA_INVALID:${key}`);
  assert(typeof artifacts.course_source_receipt_gzip_base64_path === 'string', 'COURSE_RECEIPT_PATH_INVALID');
  assert(typeof artifacts.visual_source_svg_path === 'string', 'VISUAL_SOURCE_SVG_PATH_INVALID');
  assert(typeof artifacts.visual_readme_path === 'string', 'VISUAL_README_PATH_INVALID');
  assert(fs.existsSync(path.join(root, artifacts.course_source_receipt_gzip_base64_path)), `COURSE_RECEIPT_MISSING:${artifacts.course_source_receipt_gzip_base64_path}`);
  assert(fs.existsSync(path.join(root, artifacts.visual_source_svg_path)), `VISUAL_SOURCE_MISSING:${artifacts.visual_source_svg_path}`);
  assert(fs.existsSync(path.join(root, artifacts.visual_readme_path)), `VISUAL_README_MISSING:${artifacts.visual_readme_path}`);
  assert(sha256File(root, artifacts.visual_source_svg_path) === artifacts.visual_source_svg_sha256, 'VISUAL_SOURCE_SHA_MISMATCH');
  assert(sha256File(root, artifacts.visual_readme_path) === artifacts.visual_readme_source_sha256, 'VISUAL_README_SHA_MISMATCH');

  const courseFrontmatter = parseFrontmatter(readText(root, manifest.course), manifest.course);
  assert(courseFrontmatter.source_sha256 === artifacts.course_txt_sha256, 'COURSE_DOCUMENT_SOURCE_SHA_MISMATCH');
  const courseReceiptCompressed = Buffer.from(readText(root, artifacts.course_source_receipt_gzip_base64_path).replace(/\s+/g, ''), 'base64');
  let courseReceipt;
  try { courseReceipt = zlib.gunzipSync(courseReceiptCompressed).toString('utf8'); }
  catch { throw new Error('COURSE_RECEIPT_GZIP_INVALID'); }
  assert(courseReceipt.includes(`SHA256=${artifacts.course_txt_sha256}`), 'COURSE_RECEIPT_SHA_MISMATCH');
  assert(courseReceipt.includes('STATUS=RECEIPT_ONLY_NOT_BOOT_CONTEXT'), 'COURSE_RECEIPT_STATUS_INVALID');

  assert(fs.existsSync(path.join(root, CORE_BOOT)), `SCHOOL_BOOT_MISSING:${CORE_BOOT}`);
  const bootContent = readText(root, CORE_BOOT);
  assert(bootContent.includes(manifest.core_skill), 'SCHOOL_NOT_REACHABLE_FROM_BOOT');
  assert(bootContent.includes('scripts/lupa/agentic-school-loader.mjs'), 'SCHOOL_LOADER_NOT_REACHABLE_FROM_BOOT');

  for (const adapter of manifest.adapters) {
    assert(fs.existsSync(path.join(root, adapter)), `SCHOOL_ADAPTER_MISSING:${adapter}`);
    const content = readText(root, adapter);
    for (const token of manifest.required_boot_tokens) assert(content.includes(token), `SCHOOL_ADAPTER_WITHOUT_BOOT:${adapter}:${token}`);
  }

  const skillPaths = [
    ...listFiles(root, '.agents/skills').filter((item) => item.endsWith('/SKILL.md')),
    ...listFiles(root, '.claude/skills').filter((item) => item.endsWith('.md')),
  ];
  const names = new Map();
  for (const skillPath of skillPaths) {
    const name = parseSkillName(readText(root, skillPath), skillPath);
    if (names.has(name)) throw new Error(`SCHOOL_SKILL_DUPLICATED:${name}:${names.get(name)}:${skillPath}`);
    names.set(name, skillPath);
  }

  const lessons = validateLessonLedger(readText(root, manifest.lessons_ledger));
  return { requiredPaths: [...requiredPaths].sort(), lessons, skillNames: [...names.keys()].sort(), globalSurfaces: [manifest.review_adapter, manifest.pr_template, manifest.global_workflow] };
}

export function loadSchool({ root, task, expectedHead = null, manifestPath = DEFAULT_MANIFEST }) {
  assert(typeof task === 'string' && task.length > 0, 'SCHOOL_TASK_REQUIRED');
  const manifest = readJson(root, manifestPath);
  const validation = validateManifest(root, manifest);
  assert(Object.hasOwn(manifest.tasks, task), `SCHOOL_TASK_UNKNOWN:${task}`);
  if (expectedHead !== null) assert(SHA40.test(expectedHead), 'SCHOOL_EXPECTED_HEAD_INVALID');

  const loadOrder = [...new Set([manifest.core_skill, manifest.output_contract, ...manifest.tasks[task]])];
  return {
    schema_version: 1,
    boot_status: 'PASS',
    school_id: manifest.school_id,
    task,
    expected_head: expectedHead,
    load_order: loadOrder,
    output_contract: manifest.output_contract,
    report_validator: manifest.report_validator,
    approved_lessons: validation.lessons.approved.map((lesson) => ({ lesson_id: lesson.lesson_id, trigger: lesson.trigger, rule: lesson.rule, head_sha: lesson.head_sha })),
    candidate_lessons: validation.lessons.candidates.map((lesson) => ({ lesson_id: lesson.lesson_id, trigger: lesson.trigger, rule: lesson.rule, head_sha: lesson.head_sha })),
    rejected_lessons: validation.lessons.rejected.map((lesson) => lesson.lesson_id),
    source_artifacts: manifest.source_artifacts,
    checked_adapters: manifest.adapters,
    checked_global_surfaces: validation.globalSurfaces,
    skill_names: validation.skillNames,
  };
}

function argValue(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function main() {
  const args = process.argv.slice(2);
  const root = path.resolve(argValue(args, '--repo-root', process.cwd()));
  const task = argValue(args, '--task');
  const expectedHead = argValue(args, '--expected-head');
  const manifestPath = argValue(args, '--manifest', DEFAULT_MANIFEST);
  const result = loadSchool({ root, task, expectedHead, manifestPath });
  if (args.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`BOOT_STATUS=${result.boot_status}`);
    console.log(`SCHOOL_ID=${result.school_id}`);
    console.log(`TASK=${result.task}`);
    console.log(`EXPECTED_HEAD=${result.expected_head || 'UNSET'}`);
    console.log(`LOAD_ORDER=${result.load_order.join(',')}`);
    console.log(`OUTPUT_CONTRACT=${result.output_contract}`);
    console.log(`REPORT_VALIDATOR=${result.report_validator}`);
    console.log(`GLOBAL_SURFACES=${result.checked_global_surfaces.join(',')}`);
    console.log(`APPROVED_LESSONS=${result.approved_lessons.length}`);
    console.log(`CANDIDATE_LESSONS=${result.candidate_lessons.length}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); }
  catch (error) { console.error(`STATUS=BLOCKED_AGENTIC_SCHOOL REASON=${error.message}`); process.exitCode = 1; }
}
