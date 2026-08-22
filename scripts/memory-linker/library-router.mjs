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

export function deriveSourceIdentity(source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new Error('SOURCE_REQUIRED_FOR_IDENTITY');
  }
  const sourceId = normalizeToken(source.source_id);
  if (!sourceId) throw new Error('SOURCE_ID_REQUIRED_FOR_IDENTITY');
  const provenance = source.provenance && typeof source.provenance === 'object' ? source.provenance : {};
  const provider = normalizeToken(firstNonEmpty(provenance.provider, source.provider));
  const externalId = firstNonEmpty(provenance.external_id, source.external_id);
  const canonicalPath = firstNonEmpty(
    provenance.canonical_path,
    source.canonical_path,
    provenance.path,
    source.path,
  );

  let locator;
  if (externalId) {
    locator = { kind: 'external_id', ...(provider ? { provider } : {}), value: externalId };
  } else if (canonicalPath) {
    locator = {
      kind: 'canonical_path',
      provider: provider || 'repository',
      value: canonicalPath.replaceAll('\\', '/'),
    };
  } else {
    throw new Error(`SOURCE_LOCATOR_REQUIRED:${sourceId}`);
  }

  const identity = { source_id: sourceId, locator };
  const sha256 = normalizeSha256(source.sha256);
  if (sha256) identity.sha256 = sha256;
  const version = firstNonEmpty(
    provenance.revision_id,
    provenance.version,
    source.revision_id,
    source.version,
  );
  if (version) identity.version = version;
  return normalizeStableIdentity(identity);
}

export function reconcileSourceIdentity(expectedIdentity, observedSourceOrIdentity) {
  const expected = normalizeStableIdentity(expectedIdentity);
  if (observedSourceOrIdentity == null) {
    return {
      source_status: EVIDENCE_STATES.SOURCE_MISSING,
      reason: 'SOURCE_NOT_RECOVERED',
      expected_identity: expected,
      observed_identity: null,
    };
  }

  let observed;
  try {
    observed = observedSourceOrIdentity.locator
      ? normalizeStableIdentity(observedSourceOrIdentity)
      : deriveSourceIdentity(observedSourceOrIdentity);
  } catch (error) {
    return {
      source_status: EVIDENCE_STATES.SOURCE_CONFLICT,
      reason: `OBSERVED_IDENTITY_INVALID:${error.message}`,
      expected_identity: expected,
      observed_identity: null,
    };
  }

  if (expected.source_id !== observed.source_id) {
    return {
      source_status: EVIDENCE_STATES.SOURCE_CONFLICT,
      reason: 'SOURCE_ID_MISMATCH',
      expected_identity: expected,
      observed_identity: observed,
    };
  }

  const expectedLocator = JSON.stringify(expected.locator);
  const observedLocator = JSON.stringify(observed.locator);
  if (expectedLocator !== observedLocator) {
    if (expected.sha256 && observed.sha256 && expected.sha256 === observed.sha256) {
      return {
        source_status: EVIDENCE_STATES.SOURCE_FOUND,
        reason: 'SOURCE_RELOCATED_HASH_MATCH',
        expected_identity: expected,
        observed_identity: observed,
      };
    }
    return {
      source_status: EVIDENCE_STATES.SOURCE_CONFLICT,
      reason: 'SOURCE_LOCATOR_MISMATCH',
      expected_identity: expected,
      observed_identity: observed,
    };
  }

  if (expected.sha256) {
    if (!observed.sha256) {
      return {
        source_status: EVIDENCE_STATES.SOURCE_CONFLICT,
        reason: 'CONTENT_HASH_NOT_OBSERVED',
        expected_identity: expected,
        observed_identity: observed,
      };
    }
    if (expected.sha256 !== observed.sha256) {
      return {
        source_status: EVIDENCE_STATES.SOURCE_CHANGED,
        reason: 'CONTENT_HASH_CHANGED',
        expected_identity: expected,
        observed_identity: observed,
      };
    }
  }

  if (expected.version) {
    if (!observed.version) {
      return {
        source_status: EVIDENCE_STATES.SOURCE_CONFLICT,
        reason: 'SOURCE_VERSION_NOT_OBSERVED',
        expected_identity: expected,
        observed_identity: observed,
      };
    }
    if (expected.version !== observed.version) {
      return {
        source_status: EVIDENCE_STATES.SOURCE_CHANGED,
        reason: 'SOURCE_VERSION_CHANGED',
        expected_identity: expected,
        observed_identity: observed,
      };
    }
  }

  return {
    source_status: EVIDENCE_STATES.SOURCE_FOUND,
    reason: 'SOURCE_IDENTITY_MATCH',
    expected_identity: expected,
    observed_identity: observed,
  };
}

export function createEvidenceSession({ retrieve } = {}) {
  if (typeof retrieve !== 'function') throw new Error('EVIDENCE_RETRIEVER_REQUIRED');
  const sessionToken = Object.freeze({});

  const brand = (receipt) => {
    Object.defineProperty(receipt, EVIDENCE_RECEIPT_BRAND, {
      value: sessionToken,
      enumerable: false,
      configurable: false,
      writable: false,
    });
    return receipt;
  };

  const requireCurrentReceipt = (receipt) => {
    if (!receipt || receipt[EVIDENCE_RECEIPT_BRAND] !== sessionToken) {
      throw new Error(EVIDENCE_STATES.REFERENCE_STALE);
    }
    if (receipt.source_status !== EVIDENCE_STATES.SOURCE_FOUND) {
      throw new Error(receipt.source_status || EVIDENCE_STATES.SOURCE_CONFLICT);
    }
    if (receipt.reference_status !== EVIDENCE_STATES.REFERENCE_CURRENT || !nonEmptyString(receipt.observed_reference)) {
      throw new Error(EVIDENCE_STATES.REFERENCE_STALE);
    }
    return receipt;
  };

  return Object.freeze({
    async recover(stableIdentity) {
      const expectedIdentity = normalizeStableIdentity(stableIdentity);
      let retrieval;
      try {
        retrieval = await retrieve(expectedIdentity);
      } catch (error) {
        return brand({
          type: 'RECOVERED_EVIDENCE',
          source_status: EVIDENCE_STATES.SOURCE_CONFLICT,
          reference_status: EVIDENCE_STATES.REFERENCE_STALE,
          reason: `RETRIEVAL_FAILED:${error?.message || 'UNKNOWN'}`,
          expected_identity: expectedIdentity,
          stable_identity: expectedIdentity,
          observed_identity: null,
          observed_reference: null,
          payload: null,
        });
      }

      if (!retrieval) {
        return brand({
          type: 'RECOVERED_EVIDENCE',
          source_status: EVIDENCE_STATES.SOURCE_MISSING,
          reference_status: EVIDENCE_STATES.REFERENCE_STALE,
          reason: 'SOURCE_NOT_RECOVERED',
          expected_identity: expectedIdentity,
          stable_identity: expectedIdentity,
          observed_identity: null,
          observed_reference: null,
          payload: null,
        });
      }

      const observedSource = retrieval.source_identity ?? retrieval.source ?? retrieval.observed_source ?? null;
      const reconciliation = reconcileSourceIdentity(expectedIdentity, observedSource);
      const observedReference = firstNonEmpty(retrieval.observed_reference);
      const referenceStatus = reconciliation.source_status === EVIDENCE_STATES.SOURCE_FOUND && observedReference
        ? EVIDENCE_STATES.REFERENCE_CURRENT
        : EVIDENCE_STATES.REFERENCE_STALE;
      const reason = referenceStatus === EVIDENCE_STATES.REFERENCE_STALE
        && reconciliation.source_status === EVIDENCE_STATES.SOURCE_FOUND
        ? 'OBSERVED_REFERENCE_REQUIRED'
        : reconciliation.reason;

      return brand({
        type: 'RECOVERED_EVIDENCE',
        source_status: reconciliation.source_status,
        reference_status: referenceStatus,
        reason,
        expected_identity: reconciliation.expected_identity,
        stable_identity: reconciliation.source_status === EVIDENCE_STATES.SOURCE_FOUND
          ? reconciliation.observed_identity
          : expectedIdentity,
        observed_identity: reconciliation.observed_identity,
        observed_reference: observedReference || null,
        payload: retrieval.payload ?? null,
      });
    },

    cite(receipt) {
      return requireCurrentReceipt(receipt).observed_reference;
    },

    crystallize(receipt) {
      const current = requireCurrentReceipt(receipt);
      return normalizeStableIdentity(current.stable_identity);
    },
  });
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

// Contextual library reference only. Material evidence citations must come from createEvidenceSession().cite().
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
  if (evidence.some((item) => containsEphemeralReference(item))) {
    throw new Error('EPHEMERAL_RETRIEVAL_REFERENCE_NOT_PERSISTED');
  }
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
