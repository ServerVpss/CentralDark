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
    sources: sortedUnique([...(previous.sources ?? []), ...(incoming.sources ?? [])]),
    source_classes: sortedUnique([...(previous.source_classes ?? []), ...(incoming.source_classes ?? [])]),
    observations: Math.max(Number(previous.observations ?? 0), Number(incoming.observations ?? 0)),
    verified_consumer_evidence_count: Math.max(
      Number(previous.verified_consumer_evidence_count ?? 0),
      Number(incoming.verified_consumer_evidence_count ?? 0),
    ),
    verified_owner_evidence_count: Math.max(
      Number(previous.verified_owner_evidence_count ?? 0),
      Number(incoming.verified_owner_evidence_count ?? 0),
    ),
    consumer_reachability:
      previous.consumer_reachability === 'EVIDENCED' || incoming.consumer_reachability === 'EVIDENCED'
        ? 'EVIDENCED'
        : 'UNPROVEN',
    owner_reachability:
      previous.owner_reachability === 'EVIDENCED' || incoming.owner_reachability === 'EVIDENCED'
        ? 'EVIDENCED'
        : 'UNPROVEN',
    promotion: {
      status:
        previous?.promotion?.status === 'CANDIDATE' || incoming?.promotion?.status === 'CANDIDATE'
          ? 'CANDIDATE'
          : 'QUARANTINE',
      auto_absorb_eligible:
        previous?.promotion?.auto_absorb_eligible === true || incoming?.promotion?.auto_absorb_eligible === true,
    },
  };
}

function stablePatternId(pattern) {
  const seed = stableStringify({
    kind: pattern.kind,
    target: pattern.target,
    member_fingerprints: sortedUnique(pattern.member_fingerprints),
  });
  return `learned-${sha256(seed).slice(0, 16)}`;
}

function patternItem(pattern, candidatesById) {
  const members = (pattern.member_candidate_ids ?? [])
    .map((id) => candidatesById.get(id))
    .filter(Boolean);
  const claims = sortedUnique(members.map((item) => item.claim).filter(Boolean));
  const deltas = sortedUnique(members.map((item) => item.learning_delta).filter(Boolean));
  const firstSeen = earliest(members.map((item) => item.first_seen));
  const lastSeen = latest(members.map((item) => item.last_seen));
  const sessions = sortedUnique(members.flatMap((item) => item.session_ids ?? []));
  const sources = sortedUnique(members.flatMap((item) => item.sources ?? []));
  const sourceClasses = sortedUnique(members.flatMap((item) => item.source_classes ?? []));
  const consumerEvidence = Math.max(0, ...members.map((item) => Number(item.verified_consumer_evidence_count ?? 0)));
  const ownerEvidence = Math.max(0, ...members.map((item) => Number(item.verified_owner_evidence_count ?? 0)));

  let status = 'PATTERN_CANDIDATE';
  if (pattern.status === 'QUARANTINE') status = 'QUARANTINE';
  else if (pattern.autonomy_handoff_eligible === true) status = 'READY_FOR_REVALIDATION';

  return {
    id: stablePatternId(pattern),
    pattern_ref: pattern.id,
    kind: pattern.kind,
    drawer: DRAWERS[pattern.kind]?.id ?? 'outros',
    status,
    target: pattern.target,
    title: claims[0] || `Padrão em ${pattern.target}`,
    what_was_learned: claims,
    how_to_use: deltas,
    shared_tokens: sortedUnique(pattern.shared_tokens),
    first_seen: firstSeen,
    last_seen: lastSeen,
    session_ids: sessions,
    session_count: sessions.length,
    sources,
    source_count: sources.length,
    source_classes: sourceClasses,
    member_candidate_ids: sortedUnique(pattern.member_candidate_ids),
    member_fingerprints: sortedUnique(pattern.member_fingerprints),
    candidate_count: Number(pattern.candidate_count ?? members.length),
    observation_count: Number(pattern.observation_count ?? 0),
    similarity_floor: Number(pattern.similarity_floor ?? 0),
    verified_consumer_evidence_count: consumerEvidence,
    verified_owner_evidence_count: ownerEvidence,
    same_head_revalidation_required: true,
    meta_lupa_required: true,
    pattern_is_proof: false,
  };
}

function candidateItem(candidate, recurringFingerprints) {
  const sessions = sortedUnique(candidate.session_ids);
  return {
    id: `candidate-${candidate.fingerprint.slice(0, 16)}`,
    kind: candidate.kind,
    drawer: DRAWERS[candidate.kind]?.id ?? 'outros',
    status: recurringFingerprints.has(candidate.fingerprint)
      ? 'IN_RECURRING_PATTERN'
      : candidate.promotion?.status === 'QUARANTINE'
        ? 'QUARANTINE'
        : 'OBSERVING',
    target: candidate.target,
    title: candidate.claim || `Aprendizado em ${candidate.target}`,
    what_was_learned: candidate.claim ? [candidate.claim] : [],
    how_to_use: candidate.learning_delta ? [candidate.learning_delta] : [],
    shared_tokens: patternTokens(candidate.learning_delta),
    first_seen: candidate.first_seen,
    last_seen: candidate.last_seen,
    session_ids: sessions,
    session_count: sessions.length,
    sources: sortedUnique(candidate.sources),
    source_count: sortedUnique(candidate.sources).length,
    source_classes: sortedUnique(candidate.source_classes),
    member_candidate_ids: [`dream-${candidate.fingerprint.slice(0, 16)}`],
    member_fingerprints: [candidate.fingerprint],
    candidate_count: 1,
    observation_count: Number(candidate.observations ?? 0),
    similarity_floor: 1,
    verified_consumer_evidence_count: Number(candidate.verified_consumer_evidence_count ?? 0),
    verified_owner_evidence_count: Number(candidate.verified_owner_evidence_count ?? 0),
    same_head_revalidation_required: true,
    meta_lupa_required: true,
    pattern_is_proof: false,
  };
}

export function buildPatternLibrary(proposal, previousLibrary = emptyLibrary()) {
  if (!proposal || typeof proposal !== 'object' || Array.isArray(proposal)) throw new TypeError('PROPOSAL_INVALID');
  if (!Array.isArray(proposal.candidates)) throw new TypeError('CANDIDATES_INVALID');
  if (!/^[a-f0-9]{40}$/i.test(String(proposal.head_sha ?? ''))) throw new TypeError('HEAD_SHA_INVALID');

  const candidateMap = new Map((previousLibrary.candidates ?? []).map((candidate) => [candidate.fingerprint, candidate]));
  for (const candidate of proposal.candidates) {
    if (!candidate?.fingerprint) continue;
    candidateMap.set(candidate.fingerprint, mergeCandidate(candidateMap.get(candidate.fingerprint), candidate));
  }
  const candidates = [...candidateMap.values()].sort((a, b) => a.fingerprint.localeCompare(b.fingerprint));

  const syntheticProposal = {
    head_sha: String(proposal.head_sha).toLowerCase(),
    candidates: candidates.map((candidate) => ({
      ...candidate,
      id: `dream-${candidate.fingerprint.slice(0, 16)}`,
      promotion: {
        status: candidate.promotion?.status ?? 'CANDIDATE',
        auto_absorb_eligible: candidate.promotion?.auto_absorb_eligible === true,
      },
    })),
  };
  const discovery = discoverPatterns(syntheticProposal);
  const candidatesById = new Map(syntheticProposal.candidates.map((candidate) => [candidate.id, candidate]));
  const patterns = discovery.patterns.map((pattern) => patternItem(pattern, candidatesById));
  const recurringFingerprints = new Set(patterns.flatMap((pattern) => pattern.member_fingerprints));
  const candidateItems = candidates.map((candidate) => candidateItem(candidate, recurringFingerprints));

  const drawers = Object.entries(DRAWERS).map(([kind, drawer]) => {
    const drawerPatterns = patterns.filter((item) => item.kind === kind);
    const drawerCandidates = candidateItems.filter((item) => item.kind === kind && item.status !== 'IN_RECURRING_PATTERN');
    const items = [...drawerPatterns, ...drawerCandidates]
      .sort((a, b) => String(b.last_seen ?? '').localeCompare(String(a.last_seen ?? '')) || a.id.localeCompare(b.id));
    return {
      kind,
      ...drawer,
      candidate_count: drawerCandidates.length,
      pattern_count: drawerPatterns.length,
      items,
    };
  });

  const sessions = sortedUnique(candidates.flatMap((candidate) => candidate.session_ids ?? []));
  const sources = sortedUnique(candidates.flatMap((candidate) => candidate.sources ?? []));
  const observedTimes = candidates.flatMap((candidate) => [candidate.first_seen, candidate.last_seen]).filter(Boolean);

  return {
    schema_version: SCHEMA_VERSION,
    mode: MODE,
    status: patterns.length > 0 ? 'PATTERNS_AVAILABLE' : candidates.length > 0 ? 'LEARNING_CANDIDATES_ONLY' : 'EMPTY',
    head_sha: String(proposal.head_sha).toLowerCase(),
    updated_at: latest([proposal.generated_at, ...observedTimes]),
    candidate_count: candidates.length,
    pattern_count: patterns.length,
    session_count: sessions.length,
    source_count: sources.length,
    private_reasoning_included: false,
    raw_session_content_included: false,
    candidates,
    patterns,
    drawers,
  };
}

function comparableLibrary(library) {
  const clone = JSON.parse(JSON.stringify(library));
  delete clone.updated_at;
  delete clone.head_sha;
  return clone;
}

export function updatePatternLibrary(proposal, { filePath = '' } = {}) {
  const resolved = patternLibraryPath(filePath);
  const previous = readPatternLibrary(resolved);
  const next = buildPatternLibrary(proposal, previous);
  const changed = stableStringify(comparableLibrary(previous)) !== stableStringify(comparableLibrary(next));
  if (!changed && fs.existsSync(resolved)) {
    return { status: 'UNCHANGED', path: resolved, library: previous };
  }
  atomicWriteUtf8Sync(resolved, `${JSON.stringify(next, null, 2)}\n`);
  return { status: 'UPDATED', path: resolved, library: next };
}

export function queryPatternLibrary(library, query = '') {
  const needle = String(query ?? '').trim().toLowerCase();
  const items = (library.drawers ?? []).flatMap((drawer) => drawer.items ?? []);
  if (!needle) return items;
  return items.filter((item) => {
    const haystack = [
      item.title,
      item.target,
      item.kind,
      item.status,
      ...(item.what_was_learned ?? []),
      ...(item.how_to_use ?? []),
      ...(item.shared_tokens ?? []),
    ].join(' ').toLowerCase();
    return haystack.includes(needle);
  });
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) continue;
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[item.slice(2)] = next;
      index += 1;
    } else {
      args[item.slice(2)] = true;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const library = readPatternLibrary(args.library || '');
  const results = queryPatternLibrary(library, args.query || '');
  console.log(JSON.stringify({
    status: library.status,
    head_sha: library.head_sha,
    pattern_count: library.pattern_count,
    candidate_count: library.candidate_count,
    session_count: library.session_count,
    query: args.query || '',
    result_count: results.length,
    results,
  }, null, 2));
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((error) => {
    console.error(`PATTERN_LIBRARY_ERROR=${error.message}`);
    process.exitCode = 1;
  });
}
