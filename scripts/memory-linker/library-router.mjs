const ALLOWED_FORMATS = new Set([
  'pdf', 'epub', 'jwpub',
  'gdoc', 'gdrive-md', 'gdrive-folder', 'txt',
]);
const GOOGLE_DRIVE_FORMATS = new Set(['gdoc', 'gdrive-md', 'gdrive-folder']);

export function normalizeToken(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9/_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function tokenVariants(value) {
  const normalized = normalizeToken(value);
  if (!normalized) return [];
  const tail = normalized.includes('/') ? normalized.split('/').at(-1) : normalized;
  return tail === normalized ? [normalized] : [normalized, tail];
}

function assertArray(value, field) {
  if (!Array.isArray(value)) throw new Error(`${field}_MUST_BE_ARRAY`);
}

function validateGoogleDriveProvenance(source, sourceId, formats) {
  if (!formats.some((format) => GOOGLE_DRIVE_FORMATS.has(format))) return;
  if (normalizeToken(source?.provenance?.provider) !== 'google-drive') {
    throw new Error(`SOURCE_DRIVE_PROVIDER_REQUIRED:${sourceId}`);
  }
  if (!String(source?.provenance?.external_id ?? '').trim()) {
    throw new Error(`SOURCE_DRIVE_EXTERNAL_ID_REQUIRED:${sourceId}`);
  }
  if (!String(source?.classification ?? '').trim()) {
    throw new Error(`SOURCE_DRIVE_CLASSIFICATION_REQUIRED:${sourceId}`);
  }
}

function validateIngestedHash(source, sourceId) {
  if (normalizeToken(source?.status) !== 'ingested') return;
  if (!/^[a-f0-9]{64}$/i.test(String(source?.sha256 ?? '').trim())) {
    throw new Error(`INGESTED_SOURCE_SHA256_REQUIRED:${sourceId}`);
  }
}

export function validateCatalog(catalog) {
  if (!catalog || typeof catalog !== 'object') throw new Error('CATALOG_MUST_BE_OBJECT');
  if (catalog.schema_version !== 1) throw new Error('UNSUPPORTED_SCHEMA_VERSION');
  assertArray(catalog.sources, 'sources');
  assertArray(catalog.entries, 'entries');

  const sourceIds = new Set();
  const sourceById = new Map();
  for (const source of catalog.sources) {
    const sourceId = normalizeToken(source?.source_id);
    if (!sourceId) throw new Error('SOURCE_ID_REQUIRED');
    if (sourceIds.has(sourceId)) throw new Error(`DUPLICATE_SOURCE_ID:${sourceId}`);
    sourceIds.add(sourceId);
    sourceById.set(sourceId, source);

    assertArray(source.formats ?? [], `source:${sourceId}:formats`);
    const formats = (source.formats ?? []).map(normalizeToken);
    for (const format of formats) {
      if (!ALLOWED_FORMATS.has(format)) {
        throw new Error(`UNSUPPORTED_SOURCE_FORMAT:${format}`);
      }
    }
    validateGoogleDriveProvenance(source, sourceId, formats);
    validateIngestedHash(source, sourceId);
  }

  const entryIds = new Set();
  for (const entry of catalog.entries) {
    const id = normalizeToken(entry?.id);
    if (!id) throw new Error('ENTRY_ID_REQUIRED');
    if (entryIds.has(id)) throw new Error(`DUPLICATE_ENTRY_ID:${id}`);
    entryIds.add(id);
    const sourceId = normalizeToken(entry?.source_id);
    if (!sourceIds.has(sourceId)) throw new Error(`ENTRY_SOURCE_UNKNOWN:${id}:${sourceId}`);

    const sourceClass = normalizeToken(sourceById.get(sourceId)?.classification);
    if (sourceClass === 'sensitive_quarantine' || sourceClass === 'sensitive-quarantine') {
      throw new Error(`ENTRY_SOURCE_QUARANTINED:${id}:${sourceId}`);
    }

    if (!String(entry.reference ?? '').trim()) throw new Error(`ENTRY_REFERENCE_REQUIRED:${id}`);
    assertArray(entry.tags ?? [], `entry:${id}:tags`);
    assertArray(entry.links ?? [], `entry:${id}:links`);
    assertArray(entry.emojis ?? [], `entry:${id}:emojis`);
    assertArray(entry.use ?? [], `entry:${id}:use`);
    if (entry.text != null && typeof entry.text !== 'string') throw new Error(`ENTRY_TEXT_MUST_BE_STRING:${id}`);
  }

  return { status: 'PASS', sources: sourceIds.size, entries: entryIds.size };
}

function entryTokens(entry) {
  const weighted = new Map();
  const add = (value, weight) => {
    for (const token of tokenVariants(value)) {
      weighted.set(token, Math.max(weight, weighted.get(token) ?? 0));
    }
  };

  for (const tag of entry.tags ?? []) add(tag, 4);
  for (const [group, values] of Object.entries(entry.groups ?? {})) {
    add(group, 1);
    for (const value of values ?? []) add(value, 3);
  }
  for (const link of entry.links ?? []) add(link, 2);
  for (const use of entry.use ?? []) add(use, 2);
  add(entry.kind, 1);
  add(entry.reference, 1);
  return weighted;
}

export function routeEntries({ catalog, query = [], limit = 3 }) {
  validateCatalog(catalog);
  const queryTokens = new Set((Array.isArray(query) ? query : [query]).flatMap(tokenVariants));
  if (queryTokens.size === 0) return [];

  return catalog.entries
    .map((entry) => {
      const weighted = entryTokens(entry);
      let score = 0;
      const matched = [];
      for (const token of queryTokens) {
        const weight = weighted.get(token) ?? 0;
        if (weight > 0) {
          score += weight;
          matched.push(token);
        }
      }
      return { entry, score, matched: [...new Set(matched)].sort() };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || String(a.entry.id).localeCompare(String(b.entry.id), 'pt-BR'))
    .slice(0, Math.max(0, limit));
}

export function pickContextualReference({ catalog, query = [], minScore = 4 }) {
  const [top] = routeEntries({ catalog, query, limit: 1 });
  if (!top || top.score < minScore) return null;
  return {
    source_id: top.entry.source_id,
    entry_id: top.entry.id,
    reference: top.entry.reference,
    emojis: (top.entry.emojis ?? []).slice(0, 2),
    score: top.score,
    matched: top.matched,
    has_source_text: Boolean(String(top.entry.text ?? '').trim()),
  };
}

export function citationLine(candidate, { includeText = false } = {}) {
  if (!candidate) return null;
  const icon = candidate.emojis?.[0] || '📖';
  const reference = String(candidate.reference ?? '').trim();
  if (!reference) throw new Error('REFERENCE_REQUIRED');
  if (includeText) throw new Error('SOURCE_TEXT_REQUIRED_AT_RENDER_TIME');
  return `${icon} ${reference}`;
}

export function destinationsForEntry(entry) {
  const use = new Set((entry?.use ?? []).map(normalizeToken));
  const destinations = ['LIBRARY'];
  if (use.has('cognition') || use.has('cognicao')) destinations.push('COGNITION');
  if (use.has('skill-candidate') || use.has('skill_candidate')) destinations.push('SKILL_CANDIDATE');
  if (use.has('conversation') || use.has('conversa')) destinations.push('CONVERSATION_REFERENCE');
  return destinations;
}

export function buildDecisionSummary(input = {}) {
  if ('private_reasoning' in input || 'chain_of_thought' in input || 'scratchpad' in input) {
    throw new Error('PRIVATE_REASONING_NOT_PERSISTED');
  }
  const evidence = Array.isArray(input.evidence_refs) ? input.evidence_refs.filter(Boolean) : [];
  const references = Array.isArray(input.library_refs) ? input.library_refs.filter(Boolean) : [];
  return {
    type: 'DELIBERATION_SUMMARY',
    question: String(input.question ?? '').trim(),
    decision: String(input.decision ?? '').trim(),
    reason_summary: String(input.reason_summary ?? '').trim(),
    outcome: String(input.outcome ?? '').trim(),
    evidence_refs: evidence,
    library_refs: references,
  };
}
