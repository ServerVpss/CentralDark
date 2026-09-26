# DECISAO - library-router.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\memory-linker\library-router.mjs
**SHA:** 3fb36f909b4ae998
**Timestamp:** 2026-08-28T02:57:36.775722
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- SOURCE_MISSING: 'SOURCE_MISSING',

### Ouro Bruto (primeiros 5000 chars)
```
const ALLOWED_FORMATS = new Set([
  'pdf', 'epub', 'jwpub',
  'gdoc', 'gdrive-md', 'gdrive-folder', 'txt',
]);
const GOOGLE_DRIVE_FORMATS = new Set(['gdoc', 'gdrive-md', 'gdrive-folder']);
const EPHEMERAL_REFERENCE_RE = /\bturn\d+(?:file|search|fetch|view|news|reddit|youtube|product|business|image)\d+\b/i;
const EVIDENCE_RECEIPT_BRAND = Symbol('centraldark.evidence-receipt');

export const EVIDENCE_STATES = Object.freeze({
  SOURCE_FOUND: 'SOURCE_FOUND',
  SOURCE_CHANGED: 'SOURCE_CHANGED',
  SOURCE_MISSING: 'SOURCE_MISSING',
  SOURCE_CONFLICT: 'SOURCE_CONFLICT',
  REFERENCE_CURRENT: 'REFERENCE_CURRENT',
  REFERENCE_STALE: 'REFERENCE_STALE',
});

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

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (nonEmptyString(value)) return value.trim();
  }
  return '';
}

function normalizeSha256(value) {
  const candidate = String(value ?? '').trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(candidate) ? candidate : '';
}

function normalizeStableIdentity(identity) {
  if (!identity || typeof identity !== 'object' || Array.isArray(identity)) {
    throw new Error('SOURCE_IDENTITY_REQUIRED');
  }
  const sourceId = normalizeToken(identity.source_id);
  if (!sourceId) throw new Error('SOURCE_IDENTITY_SOURCE_ID_REQUIRED');
  const locator = identity.locator;
  if (!locator || typeof locator !== 'object' || Array.isArray(locator)) {
    throw new Error(`SOURCE_IDENTITY_LOCATOR_REQUIRED:${sourceId}`);
  }
  const kind = normalizeToken(locator.kind);
  const provider = normalizeToken(locator.provider);
  const value = firstNonEmpty(locator.value);
  if (!kind || !value) throw new Error(`SOURCE_IDENTITY_LOCATOR_INVALID:${sourceId}`);

  const normalized = {
    source_id: sourceId,
    locator: {
      kind,
      ...(provider ? { provider } : {}),
      value: kind === 'canonical_path' ? value.replaceAll('\\', '/') : value,
    },
  };
  const sha256 = normalizeSha256(identity.sha256);
  if (sha256) normalized.sha256 = sha256;
  const version = firstNonEmpty(identity.version);
  if (version) normalized.version = version;
  return normalized;
}

function containsEphemeralReference(value, seen = new Set()) {
  if (typeof value === 'string') return EPHEMERAL_REFERENCE_RE.test(value);
  if (!value || typeof value !== 'object') return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) return value.some((item) => containsEphemeralReference(item, seen));
  return Object.values(value).some((item) => containsEphemeralReference(item, seen));
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
        throw new Error(`UNSUPPORTED
```