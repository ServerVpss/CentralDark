#!/usr/bin/env node

import { basename, posix } from 'node:path';

export const SKILL_AUTHORING_LIMITS = Object.freeze({
  description_max_chars: 1024,
  skill_max_lines: 500,
});

const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CREATION_SIGNALS = Object.freeze([
  'repeated_across_sessions',
  'complex_multi_step',
  'standardization_needed',
  'preventable_recurrent_error',
]);

function text(value) {
  return typeof value === 'string' ? value : '';
}

function bool(value) {
  return value === true;
}

function parseFrontmatter(content) {
  const normalized = text(content).replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  if (lines[0] !== '---') return { ok: false, fields: {}, keys: [], body: normalized, error: 'FRONTMATTER_OPEN_MISSING' };
  const close = lines.indexOf('---', 1);
  if (close < 0) return { ok: false, fields: {}, keys: [], body: '', error: 'FRONTMATTER_CLOSE_MISSING' };

  const fields = {};
  const keys = [];
  for (const raw of lines.slice(1, close)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) return { ok: false, fields, keys, body: lines.slice(close + 1).join('\n'), error: 'FRONTMATTER_LINE_INVALID' };
    const [, key, rawValue] = match;
    if (Object.hasOwn(fields, key)) {
      return { ok: false, fields, keys, body: lines.slice(close + 1).join('\n'), error: `FRONTMATTER_DUPLICATE_FIELD:${key}` };
    }
    keys.push(key);
    fields[key] = rawValue.trim().replace(/^(["'])(.*)\1$/, '$2');
  }

  return {
    ok: true,
    fields,
    keys,
    body: lines.slice(close + 1).join('\n'),
    error: null,
  };
}

function normalizedSkillDirectory(directory) {
  return text(directory).trim().replace(/\\/g, '/').replace(/\/$/, '');
}

export function skillCreationDecision(input = {}) {
  if (bool(input.existing_owner_fits)) {
    return {
      decision: 'REUSE_EXISTING_OWNER',
      create_skill: false,
      signals: CREATION_SIGNALS.filter((key) => bool(input[key])),
      reason: 'REUSE_BEFORE_CREATE',
    };
  }

  const signals = CREATION_SIGNALS.filter((key) => bool(input[key]));
  return {
    decision: signals.length > 0 ? 'VALIDATE_NEW_SKILL' : 'NO_SKILL_NEEDED',
    create_skill: signals.length > 0,
    signals,
    reason: signals.length > 0 ? 'REUSABLE_PROCEDURE_SIGNAL' : 'NO_REUSABLE_SKILL_SIGNAL',
  };
}

export function validateSkillAuthoring(input = {}) {
  const creation = skillCreationDecision(input);
  if (!creation.create_skill) {
    return {
      ok: true,
      status: creation.decision,
      blockers: [],
      warnings: [],
      creation,
    };
  }

  const blockers = [];
  const warnings = [];
  const directory = normalizedSkillDirectory(input.directory);
  const content = text(input.content).replace(/\r\n/g, '\n');
  const lineCount = content.length === 0 ? 0 : content.split('\n').length;
  const parsed = parseFrontmatter(content);

  if (!directory.startsWith('.agents/skills/')) blockers.push('SKILL_DIRECTORY_NOT_CANONICAL');
  if (basename(posix.normalize(directory)) === 'skills') blockers.push('SKILL_DIRECTORY_NAME_MISSING');
  if (!parsed.ok) blockers.push(parsed.error);

  const allowedKeys = new Set(['name', 'description']);
  for (const key of parsed.keys) {
    if (!allowedKeys.has(key)) blockers.push(`FRONTMATTER_EXTRA_FIELD:${key}`);
  }
  for (const required of ['name', 'description']) {
    if (!parsed.keys.includes(required) || !text(parsed.fields[required]).trim()) {
      blockers.push(`FRONTMATTER_REQUIRED_FIELD_MISSING:${required}`);
    }
  }

  const name = text(parsed.fields.name).trim();
  const description = text(parsed.fields.description).trim();
  const directoryName = directory ? basename(posix.normalize(directory)) : '';

  if (name && !SKILL_NAME.test(name)) blockers.push('SKILL_NAME_NOT_LOWERCASE_HYPHENATED');
  if (name && directoryName && name !== directoryName) blockers.push('SKILL_NAME_DIRECTORY_MISMATCH');
  if (description.length > SKILL_AUTHORING_LIMITS.description_max_chars) blockers.push('SKILL_DESCRIPTION_TOO_LONG');
  if (lineCount > SKILL_AUTHORING_LIMITS.skill_max_lines) blockers.push('SKILL_FILE_TOO_LONG');
  if (bool(input.generic_knowledge)) blockers.push('GENERIC_KNOWLEDGE_SHOULD_NOT_BECOME_SKILL');
  if (!Number.isInteger(input.actionable_steps) || input.actionable_steps < 1) blockers.push('ACTIONABLE_STEPS_REQUIRED');

  const externalCliDetected = /\bbpsai-pair\b/.test(content);
  if (externalCliDetected && input.external_cli_locally_proven !== true) {
    blockers.push('EXTERNAL_CLI_NOT_HOUSE_DEPENDENCY');
  }

  if (/\.claude\/skills\//.test(content)) {
    warnings.push('EXTERNAL_SKILL_ROOT_NOT_IMPORTED_USE_DOT_AGENTS_SKILLS');
  }

  if (input.require_gerund === true) warnings.push('GERUND_STYLE_IS_SOURCE_GUIDANCE_NOT_HOUSE_GATE');
  if (input.require_third_person === true) warnings.push('THIRD_PERSON_STYLE_IS_SOURCE_GUIDANCE_NOT_HOUSE_GATE');

  return {
    ok: blockers.length === 0,
    status: blockers.length === 0 ? 'PASS' : 'BLOCKED',
    blockers: [...new Set(blockers)],
    warnings: [...new Set(warnings)],
    creation,
    normalized: {
      canonical_root: '.agents/skills',
      directory,
      expected_skill_path: directory ? `${directory}/SKILL.md` : null,
      name: name || null,
      description_chars: description.length,
      line_count: lineCount,
      frontmatter_keys: parsed.keys,
      actionable_steps: input.actionable_steps ?? null,
    },
  };
}

export function selfTestSkillAuthoring() {
  const valid = validateSkillAuthoring({
    repeated_across_sessions: true,
    directory: '.agents/skills/reviewing-evidence',
    actionable_steps: 2,
    content: `---\nname: reviewing-evidence\ndescription: Revisa evidência operacional com contraprova determinística.\n---\n\n# Reviewing evidence\n\n1. Medir o alvo.\n2. Contraprovar o claim.`,
  });
  if (!valid.ok) throw new Error(`SKILL_AUTHORING_SELF_TEST_FAILED:${valid.blockers.join(',')}`);

  const reused = validateSkillAuthoring({
    existing_owner_fits: true,
    repeated_across_sessions: true,
  });
  if (reused.status !== 'REUSE_EXISTING_OWNER') throw new Error('SKILL_AUTHORING_REUSE_SELF_TEST_FAILED');

  return { ok: true, valid: valid.status, reuse: reused.status };
}

if (process.argv.includes('--self-test')) {
  const result = selfTestSkillAuthoring();
  console.log('SKILL_AUTHORING=PASS');
  console.log(`VALID=${result.valid}`);
  console.log(`REUSE=${result.reuse}`);
}
