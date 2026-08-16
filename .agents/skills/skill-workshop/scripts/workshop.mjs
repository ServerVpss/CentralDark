#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const UPSTREAM_REPOSITORY = 'alirezarezvani/claude-skills';
const UPSTREAM_COMMIT = 'aa8d778811a557a2c28ccadda4cf3d0bd028a4cc';
const INDEX_PATH = '.codex/skills-index.json';
const RAW_BASE = `https://raw.githubusercontent.com/${UPSTREAM_REPOSITORY}/${UPSTREAM_COMMIT}`;
const INDEX_URL = `${RAW_BASE}/${INDEX_PATH}`;
const MAX_SKILL_BYTES = 1024 * 1024;

export const SOURCE = Object.freeze({
  repository: UPSTREAM_REPOSITORY,
  commit: UPSTREAM_COMMIT,
  index_path: INDEX_PATH,
  index_url: INDEX_URL,
  license: 'MIT',
});

function clean(value) {
  return String(value ?? '').trim();
}

export function normalizeSourcePath(source) {
  const raw = clean(source).replaceAll('\\', '/');
  const withoutPrefix = raw.replace(/^(?:\.\.\/)+/, '').replace(/^\/+/, '');
  if (!withoutPrefix) throw new Error('SOURCE_PATH_EMPTY');
  const segments = withoutPrefix.split('/').filter(Boolean);
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error(`SOURCE_PATH_INVALID:${source}`);
  }
  return segments.join('/');
}

export function normalizeIndex(document) {
  const sourceSkills = Array.isArray(document?.skills) ? document.skills : [];
  return sourceSkills.map((entry, index) => {
    const name = clean(entry?.name);
    if (!name) throw new Error(`SKILL_NAME_EMPTY:${index}`);
    const sourcePath = normalizeSourcePath(entry?.source);
    return {
      name,
      category: clean(entry?.category) || 'uncategorized',
      description: clean(entry?.description),
      source_path: sourcePath,
      skill_md_path: `${sourcePath}/SKILL.md`,
    };
  });
}

export function catalogSummary(entries, declaredTotal = null) {
  const names = new Map();
  const categories = new Map();
  for (const entry of entries) {
    names.set(entry.name, (names.get(entry.name) || 0) + 1);
    categories.set(entry.category, (categories.get(entry.category) || 0) + 1);
  }
  const duplicateNames = [...names.entries()]
    .filter(([, count]) => count > 1)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    source: SOURCE,
    declared_total: Number.isInteger(declaredTotal) ? declaredTotal : null,
    index_entries: entries.length,
    unique_names: names.size,
    duplicate_names: duplicateNames,
    categories: Object.fromEntries([...categories.entries()].sort(([a], [b]) => a.localeCompare(b))),
  };
}

function tokens(value) {
  return clean(value)
    .toLocaleLowerCase('pt-BR')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 2);
}

export function scoreSkill(entry, query) {
  const queryTokens = [...new Set(tokens(query))];
  if (!queryTokens.length) return 0;
  const name = entry.name.toLocaleLowerCase('pt-BR');
  const category = entry.category.toLocaleLowerCase('pt-BR');
  const description = entry.description.toLocaleLowerCase('pt-BR');
  let score = 0;
  for (const token of queryTokens) {
    if (name === token) score += 12;
    else if (name.includes(token)) score += 7;
    if (category.includes(token)) score += 4;
    if (description.includes(token)) score += 2;
  }
  return score;
}

export function findSkills(entries, query, limit = 8) {
  return entries
    .map((entry) => ({ ...entry, score: scoreSkill(entry, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function exactCandidates(entries, name) {
  const target = clean(name).toLocaleLowerCase('pt-BR');
  return entries.filter((entry) => entry.name.toLocaleLowerCase('pt-BR') === target);
}

export function skillRawUrl(entry) {
  return `${RAW_BASE}/${entry.skill_md_path.split('/').map(encodeURIComponent).join('/')}`;
}

async function fetchChecked(url, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    headers: { 'User-Agent': 'centraldark-skill-workshop/1.0' },
  });
  if (!response?.ok) throw new Error(`UPSTREAM_FETCH_FAILED:${response?.status ?? 'UNKNOWN'}:${url}`);
  return response;
}

export async function loadIndex(fetchImpl = fetch) {
  const response = await fetchChecked(INDEX_URL, fetchImpl);
  const document = await response.json();
  const entries = normalizeIndex(document);
  return {
    document,
    entries,
    summary: catalogSummary(entries, Number.isInteger(document?.total_skills) ? document.total_skills : null),
  };
}

export async function inspectSkill(name, fetchImpl = fetch) {
  const { entries, summary } = await loadIndex(fetchImpl);
  const candidates = exactCandidates(entries, name);
  if (!candidates.length) return { status: 'NOT_FOUND', name, summary };
  if (candidates.length > 1) return { status: 'AMBIGUOUS', name, candidates, summary };

  const entry = candidates[0];
  const url = skillRawUrl(entry);
  const response = await fetchChecked(url, fetchImpl);
  const text = await response.text();
  const bytes = Buffer.byteLength(text);
  if (bytes > MAX_SKILL_BYTES) throw new Error(`SKILL_TOO_LARGE:${bytes}`);
  return {
    status: 'OK',
    source: SOURCE,
    entry,
    url,
    bytes,
    execution: 'NOT_EXECUTED_TEXT_ONLY',
    content: text,
  };
}

function parseFindArgs(args) {
  const values = [...args];
  let limit = 8;
  const limitIndex = values.indexOf('--limit');
  if (limitIndex >= 0) {
    const parsed = Number(values[limitIndex + 1]);
    if (Number.isInteger(parsed) && parsed > 0) limit = parsed;
    values.splice(limitIndex, 2);
  }
  return { query: values.join(' ').trim(), limit };
}

async function main() {
  const command = process.argv[2] || 'catalog';
  if (command === 'catalog') {
    const { summary } = await loadIndex();
    console.log(JSON.stringify(summary, null, 2));
    return;
  }
  if (command === 'find') {
    const { query, limit } = parseFindArgs(process.argv.slice(3));
    if (!query) throw new Error('QUERY_REQUIRED');
    const { entries, summary } = await loadIndex();
    const results = findSkills(entries, query, limit);
    console.log(JSON.stringify({ summary, query, results }, null, 2));
    return;
  }
  if (command === 'inspect') {
    const name = process.argv[3];
    if (!name) throw new Error('SKILL_NAME_REQUIRED');
    console.log(JSON.stringify(await inspectSkill(name), null, 2));
    return;
  }
  throw new Error(`COMMAND_INVALID:${command}`);
}

function canonicalPath(pathname) {
  try {
    return realpathSync(resolve(pathname));
  } catch {
    return resolve(pathname);
  }
}

export function isMainEntry(entryPath, moduleUrl = import.meta.url) {
  if (!entryPath) return false;
  return canonicalPath(entryPath) === canonicalPath(fileURLToPath(moduleUrl));
}

if (isMainEntry(process.argv[1])) {
  main().catch((error) => {
    console.error(`SKILL_WORKSHOP_ERROR=${error.message}`);
    process.exit(1);
  });
}
