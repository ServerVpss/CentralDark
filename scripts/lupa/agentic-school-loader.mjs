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
  const match = content.match(/^---\s*\n[\s\S]*?^name:\s*([^\n#]+)\s*$/m);
  assert(match, `SKILL_NAME_MISSING:${relativePath}`);
  return match[1].trim().replace(/^['"]|['"]$/g, '');
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
    } else {
      rejected.push(lesson);
    }
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
  assert(typeof manifest.core_skill === 'string', 'SCHOOL_CORE_SKILL_INVALID');
  assert(typeof manifest.course === 'string', 'SCHOOL_COURSE_INVALID');
  assert(typeof manifest.lessons_ledger === 'string', 'SCHOOL_LEDGER_INVALID');
  assert(manifest.tasks && typeof manifest.tasks === 'object', 'SCHOOL_TASKS_INVALID');
  assert(Array.isArray(manifest.adapters) && manifest.adapters.length > 0, 'SCHOOL_ADAPTERS_INVALID');
  assert(Array.isArray(manifest.required_boot_tokens), 'SCHOOL_BOOT_TOKENS_INVALID');

  const requiredPaths = new Set([manifest.core_skill, manifest.course, manifest.lessons_ledger]);
  for (const modules of Object.values(manifest.tasks)) {
    assert(Array.isArray(modules), 'SCHOOL_TASK_MODULES_INVALID');
    for (const modulePath of modules) requiredPaths.add(modulePath);
  }
  for (const relativePath of requiredPaths) {
    assert(fs.existsSync(path.join(root, relativePath)), `SCHOOL_PATH_MISSING:${relativePath}`);
  }

  const artifacts = manifest.source_artifacts || {};
  for (const [key, value] of Object.entries(artifacts)) {
    if (key.endsWith('_sha256')) assert(SHA256.test(value), `SOURCE_SHA_INVALID:${key}`);
  }
  assert(typeof artifacts.course_txt_gzip_base64_path === 'string', 'COURSE_SOURCE_PATH_INVALID');
  assert(Array.isArray(artifacts.visual_zip_base64_parts) && artifacts.visual_zip_base64_parts.length > 0, 'VISUAL_PACKAGE_PARTS_INVALID');
  assert(fs.existsSync(path.join(root, artifacts.course_txt_gzip_base64_path)), `COURSE_SOURCE_MISSING:${artifacts.course_txt_gzip_base64_path}`);
  for (const part of artifacts.visual_zip_base64_parts) {
    assert(typeof part === 'string' && part.length > 0, 'VISUAL_PACKAGE_PART_PATH_INVALID');
    assert(fs.existsSync(path.join(root, part)), `VISUAL_PACKAGE_SOURCE_MISSING:${part}`);
  }
  const courseCompressed = Buffer.from(readText(root, artifacts.course_txt_gzip_base64_path).replace(/\s+/g, ''), 'base64');
  let courseDecoded;
  try { courseDecoded = zlib.gunzipSync(courseCompressed); }
  catch { throw new Error('COURSE_SOURCE_GZIP_INVALID'); }
  assert(crypto.createHash('sha256').update(courseDecoded).digest('hex') === artifacts.course_txt_sha256, 'COURSE_SOURCE_SHA_MISMATCH');

  assert(fs.existsSync(path.join(root, CORE_BOOT)), `SCHOOL_BOOT_MISSING:${CORE_BOOT}`);
  const bootContent = readText(root, CORE_BOOT);
  assert(bootContent.includes(manifest.core_skill), 'SCHOOL_NOT_REACHABLE_FROM_BOOT');
  assert(bootContent.includes('scripts/lupa/agentic-school-loader.mjs'), 'SCHOOL_LOADER_NOT_REACHABLE_FROM_BOOT');

  for (const adapter of manifest.adapters) {
    assert(fs.existsSync(path.join(root, adapter)), `SCHOOL_ADAPTER_MISSING:${adapter}`);
    const content = readText(root, adapter);
    for (const token of manifest.required_boot_tokens) {
      assert(content.includes(token), `SCHOOL_ADAPTER_WITHOUT_BOOT:${adapter}:${token}`);
    }
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
  return { requiredPaths: [...requiredPaths].sort(), lessons, skillNames: [...names.keys()].sort() };
}

export function loadSchool({ root, task, expectedHead = null, manifestPath = DEFAULT_MANIFEST }) {
  assert(typeof task === 'string' && task.length > 0, 'SCHOOL_TASK_REQUIRED');
  const manifest = readJson(root, manifestPath);
  const validation = validateManifest(root, manifest);
  assert(Object.hasOwn(manifest.tasks, task), `SCHOOL_TASK_UNKNOWN:${task}`);
  if (expectedHead !== null) assert(SHA40.test(expectedHead), 'SCHOOL_EXPECTED_HEAD_INVALID');

  const loadOrder = [...new Set([manifest.core_skill, ...manifest.tasks[task]])];
  return {
    schema_version: 1,
    boot_status: 'PASS',
    school_id: manifest.school_id,
    task,
    expected_head: expectedHead,
    load_order: loadOrder,
    approved_lessons: validation.lessons.approved.map((lesson) => ({
      lesson_id: lesson.lesson_id,
      trigger: lesson.trigger,
      rule: lesson.rule,
      head_sha: lesson.head_sha,
    })),
    candidate_lessons: validation.lessons.candidates.map((lesson) => ({ lesson_id: lesson.lesson_id, trigger: lesson.trigger, rule: lesson.rule, head_sha: lesson.head_sha })),
    rejected_lessons: validation.lessons.rejected.map((lesson) => lesson.lesson_id),
    source_artifacts: manifest.source_artifacts,
    checked_adapters: manifest.adapters,
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
    console.log(`APPROVED_LESSONS=${result.approved_lessons.length}`);
    console.log(`CANDIDATE_LESSONS=${result.candidate_lessons.length}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`STATUS=BLOCKED_AGENTIC_SCHOOL REASON=${error.message}`);
    process.exitCode = 1;
  }
}
