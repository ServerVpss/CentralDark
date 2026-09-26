# PADRAO - pattern-library.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\memory-linker\pattern-library.mjs
**SHA:** 3df3cf43c268c510
**Timestamp:** 2026-08-28T02:57:36.920994
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- CONTRACT: { id: 'contratos', label: 'Contratos', purpose: 'Acordos operacionais, ownership e invariantes da Casa.' },

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { atomicWriteUtf8Sync } from './fs-safe.mjs';
import { discoverPatterns, patternTokens } from './pattern-discovery.mjs';

const SCHEMA_VERSION = 1;
const MODE = 'PATTERN_LIBRARY_LONGITUDINAL';
const DEFAULT_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'pattern-library.json');

const DRAWERS = {
  MEMORY: { id: 'memorias', label: 'Memórias', purpose: 'Contexto reutilizável que ajuda a próxima execução a começar mais alto.' },
  RULE: { id: 'regras', label: 'Regras', purpose: 'Padrões de decisão e comportamento que evitam repetir erro conhecido.' },
  SKILL: { id: 'skills', label: 'Skills', purpose: 'Capacidades e procedimentos reutilizáveis.' },
  TEST: { id: 'testes', label: 'Testes', purpose: 'Contraprovas e regressões que distinguem certo de errado.' },
  GUARDRAIL: { id: 'guardrails', label: 'Guardrails', purpose: 'Travas que impedem falso verde, regressão ou ação fora do contrato.' },
  CONTRACT: { id: 'contratos', label: 'Contratos', purpose: 'Acordos operacionais, ownership e invariantes da Casa.' },
};

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function sortedUnique(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter((value) => value !== null && value !== undefined).map(String))].sort();
}

function latest(values) {
  const filtered = sortedUnique(values).filter((value) => !Number.isNaN(Date.parse(value)));
  return filtered.at(-1) ?? null;
}

function earliest(values) {
  const filtered = sortedUnique(values).filter((value) => !Number.isNaN(Date.parse(value)));
  return filtered.at(0) ?? null;
}

function emptyLibrary() {
  return {
    schema_version: SCHEMA_VERSION,
    mode: MODE,
    status: 'EMPTY',
    head_sha: null,
    updated_at: null,
    candidate_count: 0,
    pattern_count: 0,
    session_count: 0,
    source_count: 0,
    private_reasoning_included: false,
    raw_session_content_included: false,
    candidates: [],
    patterns: [],
    drawers: Object.entries(DRAWERS).map(([kind, drawer]) => ({ kind, ...drawer, candidate_count: 0, pattern_count: 0, items: [] })),
  };
}

export function patternLibraryPath(override = '') {
  return path.resolve(override || process.env.CENTRALDARK_PATTERN_LIBRARY_PATH || DEFAULT_FILE);
}

export function readPatternLibrary(filePath = '') {
  const resolved = patternLibraryPath(filePath);
  if (!fs.existsSync(resolved)) return emptyLibrary();
  const parsed = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('PATTERN_LIBRARY_INVALID');
  if (parsed.schema_version !== SCHEMA_VERSION || parsed.mode !== MODE) throw new Error('PATTERN_LIBRARY_SCHEMA_INVALID');
  if (parsed.private_reasoning_included !== false || parsed.raw_session_content_included !== false) {
    throw new Error('PATTERN_LIBRARY_PRIVACY_CONTRACT_INVALID');
  }
  return parsed;
}

function compactCandidate(candidate) {
  return {
    fingerprint: String(candidate.fingerprint),
    kind: String(candidate.kind),
    target: String(candidate.target),
    claim: String(candidate.claim ?? ''),
    learning_delta: String(candidate.learning_delta ?? ''),
    first_seen: candidate.first_seen ?? null,
    last_seen: candidate.last_seen ?? null,
    session_ids: sortedUnique(candidate.session_ids),
    sources: sortedUnique(candidate.sources),
    source_classes: sortedUnique(candidate.source_classes),
    observations: Number(candidate.observations ?? 0),
    verified_consumer_evidence_count: Number(candidate.verified_consumer_evidence_count ?? 0),
    verified_owner_evidence_count: Number(candidate.verified_owner_evidence_count ?? 0),
    consumer_reachability: candidate.consumer_reachability ?? 'UNPROVEN',
    owner_reachability: candidate.owner_reachability ?? 'UNPROVEN',
    promotion: {
      status: candidate?.promotion?.status ?? 'CANDIDATE',
      auto_absorb_eligible: candidate?.promotion?.auto_absorb_eligible === true,
    },
  };
}

function mergeCandidate(previous, incoming) {
  if (!previous) return compactCandidate(incoming);
  return {
    ...previous,
    claim: previous.claim || incoming.claim || '',
    learning_delta: previous.learning_delta || incoming.learning_delta || '',
    first_seen: earliest([previous.first_seen, incoming.first_seen]),
    last_seen: latest([previous.last_seen, incoming.last_seen]),
    session_ids: sortedUnique([...(previous.session_ids ?? []), ...(incoming.session_ids ?? [])]),
    sources: sortedU
```