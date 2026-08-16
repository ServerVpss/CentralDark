#!/usr/bin/env node

import { readFileSync, realpathSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCES_PATH = new URL('../sources.json', import.meta.url);
const MAX_DOCUMENT_BYTES = 1024 * 1024;

function clean(value) {
  return String(value ?? '').trim();
}

export function loadSourceRegistry() {
  const parsed = JSON.parse(readFileSync(SOURCES_PATH, 'utf8'));
  const sources = Array.isArray(parsed?.sources) ? parsed.sources.filter((source) => source?.enabled !== false) : [];
  const ids = new Set();
  for (const source of sources) {
    if (!clean(source?.id)) throw new Error('SOURCE_ID_EMPTY');
    if (ids.has(source.id)) throw new Error(`SOURCE_ID_DUPLICATE:${source.id}`);
    ids.add(source.id);
    if (!clean(source.repository) || !clean(source.commit) || !clean(source.kind)) {
      throw new Error(`SOURCE_INCOMPLETE:${source.id}`);
    }
  }
  return Object.freeze({ schema_version: parsed?.schema_version ?? null, sources: Object.freeze(sources) });
}

export const REGISTRY = loadSourceRegistry();
export const SOURCES = REGISTRY.sources;
export const SOURCE = SOURCES.find((source) => source.id === 'claude-skills') ?? SOURCES[0];

function sourceById(id) {
  return SOURCES.find((source) => source.id === id) ?? null;
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

function sourceMeta(source) {
  return {
    source_id: source.id,
    repository: source.repository,
    commit: source.commit,
    license: source.license ?? 'SEE_UPSTREAM',
    source_kind: source.kind,
  };
}

export function normalizeIndex(document, source = SOURCE) {
  const sourceSkills = Array.isArray(document?.skills) ? document.skills : [];
  return sourceSkills.map((entry, index) => {
    const name = clean(entry?.name);
    if (!name) throw new Error(`SKILL_NAME_EMPTY:${source.id}:${index}`);
    const sourcePath = normalizeSourcePath(entry?.source);
    return {
      ...sourceMeta(source),
      entry_type: 'SKILL',
      name,
      category: clean(entry?.category) || 'uncategorized',
      description: clean(entry?.description),
      source_path: sourcePath,
      document_path: `${sourcePath}/SKILL.md`,
    };
  });
}

export function normalizeTree(document, source) {
  const prefix = clean(source?.prefix).replace(/^\/+/, '');
  const tree = Array.isArray(document?.tree) ? document.tree : [];
  return tree
    .filter((entry) => entry?.type === 'blob')
    .map((entry) => clean(entry.path).replaceAll('\\', '/'))
    .filter((path) => path && path.endsWith('/SKILL.md'))
    .filter((path) => !prefix || path.startsWith(prefix))
    .map((documentPath) => {
      const sourcePath = posix.dirname(documentPath);
      const name = posix.basename(sourcePath);
      const relative = prefix && sourcePath.startsWith(prefix) ? sourcePath.slice(prefix.length) : sourcePath;
      const category = relative.includes('/') ? relative.split('/')[0] : (source.id || 'uncategorized');
      return {
        ...sourceMeta(source),
        entry_type: 'SKILL',
        name,
        category: category || source.id || 'uncategorized',
        description: '',
        source_path: sourcePath,
        document_path: documentPath,
      };
    });
}

export function normalizeCapabilities(source) {
  const capabilities = Array.isArray(source?.capabilities) ? source.capabilities : [];
  return capabilities.map((capability, index) => {
    const name = clean(capability?.name);
    if (!name) throw new Error(`CAPABILITY_NAME_EMPTY:${source.id}:${index}`);
    const documentPath = normalizeSourcePath(capability?.document_path || source.document_path || 'README.md');
    return {
      ...sourceMeta(source),
      entry_type: 'CAPABILITY',
      name,
      category: clean(capability?.category) || 'capability',
      description: clean(capability?.description),
      source_path: posix.dirname(documentPath) === '.' ? '' : posix.dirname(documentPath),
      document_path: documentPath,
    };
  });
}

export function catalogSummary(entries, sourceReceipts = [], declaredTotal = null) {
  const names = new Map();
  const categories = new Map();
  const sourceCounts = new Map();
  for (const entry of entries) {
    names.set(entry.name, (names.get(entry.name) || 0) + 1);
    categories.set(entry.category, (categories.get(entry.category) || 0) + 1);
    sourceCounts.set(entry.source_id, (sourceCounts.get(entry.source_id) || 0) + 1);
  }
  const duplicateNames = [...names.entries()]
    .filter(([, count]) => count > 1)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const sourcePass = sourceReceipts.filter((receipt) => receipt.status === 'PASS').length;
  const sourceFail = sourceReceipts.filter((receipt) => receipt.status !== 'PASS').length;
  return {
    catalog_status: sourceFail === 0 ? 'PASS' : 'DEGRADED',
    sources_defined: SOURCES.length,
    sources_pass: sourcePass,
    sources_fail: sourceFail,
    declared_total: Number.isInteger(declaredTotal) ? declaredTotal : null,
    entries: entries.length,
    unique_names: names.size,
    duplicate_names: duplicateNames,
    source_counts: Object.fromEntries([...sourceCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
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
  const sourceId = entry.source_id.toLocaleLowerCase('pt-BR');
  let score = 0;
  for (const token of queryTokens) {
    if (name === token) score += 12;
    else if (name.includes(token)) score += 7;
    if (category.includes(token)) score += 4;
    if (sourceId.includes(token)) score += 3;
    if (description.includes(token)) score += 2;
  }
  return score;
}

export function findSkills(entries, query, limit = 8) {
  return entries
    .map((entry) => ({ ...entry, score: scoreSkill(entry, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name) || a.source_id.localeCompare(b.source_id))
    .slice(0, limit);
}

export function exactCandidates(entries, name, sourceId = null) {
  const target = clean(name).toLocaleLowerCase('pt-BR');
  return entries.filter((entry) => {
    const sameName = entry.name.toLocaleLowerCase('pt-BR') === target;
    return sameName && (!sourceId || entry.source_id === sourceId);
  });
}

function encodePath(path) {
  return normalizeSourcePath(path).split('/').map(encodeURIComponent).join('/');
}

export function sourceRawUrl(source, path) {
  return `https://raw.githubusercontent.com/${source.repository}/${source.commit}/${encodePath(path)}`;
}

export function skillRawUrl(entry) {
  const source = sourceById(entry.source_id) ?? SOURCE;
  return sourceRawUrl(source, entry.document_path);
}

function sourceIndexUrl(source) {
  return sourceRawUrl(source, source.index_path);
}

function sourceTreeUrl(source) {
  return `https://api.github.com/repos/${source.repository}/git/trees/${source.commit}?recursive=1`;
}

async function fetchChecked(url, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    headers: {
      'User-Agent': 'centraldark-skill-workshop/2.0',
      Accept: 'application/vnd.github+json',
    },
  });
  if (!response?.ok) throw new Error(`UPSTREAM_FETCH_FAILED:${response?.status ?? 'UNKNOWN'}:${url}`);
  return response;
}

export async function loadSourceCatalog(source, fetchImpl = fetch) {
  if (source.kind === 'index-json') {
    const response = await fetchChecked(sourceIndexUrl(source), fetchImpl);
    const document = await response.json();
    const entries = normalizeIndex(document, source);
    return {
      source,
      entries,
      declared_total: Number.isInteger(document?.total_skills) ? document.total_skills : null,
    };
  }

  if (source.kind === 'skill-tree') {
    const response = await fetchChecked(sourceTreeUrl(source), fetchImpl);
    const document = await response.json();
    const entries = [...normalizeTree(document, source), ...normalizeCapabilities(source)];
    return { source, entries, declared_total: null };
  }

  if (source.kind === 'capability-doc') {
    const documentPath = normalizeSourcePath(source.document_path || 'README.md');
    await fetchChecked(sourceRawUrl(source, documentPath), fetchImpl);
    return { source, entries: normalizeCapabilities(source), declared_total: null };
  }

  throw new Error(`SOURCE_KIND_INVALID:${source.id}:${source.kind}`);
}

export async function loadCatalog(fetchImpl = fetch) {
  const entries = [];
  const sourceReceipts = [];
  const declaredTotals = [];

  for (const source of SOURCES) {
    try {
      const loaded = await loadSourceCatalog(source, fetchImpl);
      entries.push(...loaded.entries);
      if (Number.isInteger(loaded.declared_total)) declaredTotals.push(loaded.declared_total);
      sourceReceipts.push({
        source_id: source.id,
        repository: source.repository,
        commit: source.commit,
        status: 'PASS',
        entries: loaded.entries.length,
      });
    } catch (error) {
      sourceReceipts.push({
        source_id: source.id,
        repository: source.repository,
        commit: source.commit,
        status: 'FAIL',
        entries: 0,
        error: error.message,
      });
    }
  }

  const declaredTotal = declaredTotals.length === 1 ? declaredTotals[0] : null;
  return {
    entries,
    sources: sourceReceipts,
    summary: catalogSummary(entries, sourceReceipts, declaredTotal),
  };
}

export async function inspectSkill(name, fetchImpl = fetch, sourceId = null) {
  const catalog = await loadCatalog(fetchImpl);
  const candidates = exactCandidates(catalog.entries, name, sourceId);
  if (!candidates.length) return { status: 'NOT_FOUND', name, source_id: sourceId, summary: catalog.summary };
  if (candidates.length > 1) return { status: 'AMBIGUOUS', name, source_id: sourceId, candidates, summary: catalog.summary };

  const entry = candidates[0];
  const source = sourceById(entry.source_id);
  if (!source) throw new Error(`SOURCE_NOT_FOUND:${entry.source_id}`);
  const url = sourceRawUrl(source, entry.document_path);
  const response = await fetchChecked(url, fetchImpl);
  const text = await response.text();
  const bytes = Buffer.byteLength(text);
  if (bytes > MAX_DOCUMENT_BYTES) throw new Error(`DOCUMENT_TOO_LARGE:${bytes}`);
  return {
    status: 'OK',
    source: sourceMeta(source),
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

function parseInspectArgs(args) {
  const values = [...args];
  let sourceId = null;
  const sourceIndex = values.indexOf('--source');
  if (sourceIndex >= 0) {
    sourceId = clean(values[sourceIndex + 1]);
    values.splice(sourceIndex, 2);
  }
  return { name: clean(values[0]), sourceId };
}

async function main() {
  const command = process.argv[2] || 'catalog';
  if (command === 'sources') {
    console.log(JSON.stringify({ schema_version: REGISTRY.schema_version, sources: SOURCES }, null, 2));
    return;
  }
  if (command === 'catalog') {
    const catalog = await loadCatalog();
    console.log(JSON.stringify({ summary: catalog.summary, sources: catalog.sources }, null, 2));
    return;
  }
  if (command === 'find') {
    const { query, limit } = parseFindArgs(process.argv.slice(3));
    if (!query) throw new Error('QUERY_REQUIRED');
    const catalog = await loadCatalog();
    const results = findSkills(catalog.entries, query, limit);
    console.log(JSON.stringify({ summary: catalog.summary, query, results }, null, 2));
    return;
  }
  if (command === 'inspect') {
    const { name, sourceId } = parseInspectArgs(process.argv.slice(3));
    if (!name) throw new Error('SKILL_NAME_REQUIRED');
    if (sourceId && !sourceById(sourceId)) throw new Error(`SOURCE_NOT_FOUND:${sourceId}`);
    console.log(JSON.stringify(await inspectSkill(name, fetch, sourceId), null, 2));
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
