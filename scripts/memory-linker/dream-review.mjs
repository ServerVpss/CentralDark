#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ALLOWED_KINDS = new Set(['MEMORY', 'SKILL', 'RULE', 'TEST', 'GUARDRAIL', 'CONTRACT']);
const SHA40_RE = /^[a-f0-9]{40}$/i;
const VALID_STATUSES = new Set(['CANDIDATE', 'NO_NEW_INFORMATION']);

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

function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function sanitizeDreamText(value) {
  let text = String(value ?? '');
  const patterns = [
    [/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, 'Bearer [REDACTED]'],
    [/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, '[REDACTED_GITHUB_TOKEN]'],
    [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/gi, '[REDACTED_GITHUB_TOKEN]'],
    [/\bsk-[A-Za-z0-9_-]{16,}\b/g, '[REDACTED_PROVIDER_KEY]'],
    [/\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g, '[REDACTED_BOT_TOKEN]'],
    [/(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["']?[^\s"']{12,}/gi, '$1=[REDACTED]'],
  ];
  for (const [pattern, replacement] of patterns) text = text.replace(pattern, replacement);
  return text;
}

function sanitizeEvidence(value) {
  if (typeof value === 'string') return sanitizeDreamText(value);
  if (Array.isArray(value)) return value.map(sanitizeEvidence);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeEvidence(item)]));
  }
  return value;
}

function normalizeEvent(raw, index, expectedHead) {
  const reject = (reason) => ({ ok: false, rejection: { index, reason } });
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return reject('EVENT_NOT_OBJECT');

  const timestamp = String(raw.timestamp ?? '').trim();
  if (!timestamp || Number.isNaN(Date.parse(timestamp))) return reject('TIMESTAMP_INVALID');

  const source = normalizeText(raw.source);
  if (!source) return reject('SOURCE_MISSING');

  const sessionId = normalizeText(raw.session_id ?? raw.sessionId);
  if (!sessionId) return reject('SESSION_ID_MISSING');

  const claim = normalizeText(raw.claim ?? raw.content);
  if (!claim) return reject('CLAIM_MISSING');

  const learningDelta = normalizeText(raw.learning_delta ?? raw.delta);
  if (!learningDelta) return reject('LEARNING_DELTA_MISSING');

  if (!Array.isArray(raw.evidence) || raw.evidence.length === 0) return reject('EVIDENCE_MISSING');

  const eventHead = normalizeText(raw.head_sha ?? raw.canonical_head);
  if (!eventHead) return reject('EVENT_HEAD_MISSING');
  if (!SHA40_RE.test(eventHead)) return reject('EVENT_HEAD_INVALID');
  if (eventHead.toLowerCase() !== expectedHead.toLowerCase()) return reject('HEAD_MISMATCH');

  const rawKind = normalizeText(raw.kind).toUpperCase();
  const kind = ALLOWED_KINDS.has(rawKind) ? rawKind : 'MEMORY';
  const target = normalizeText(raw.target || 'UNSPECIFIED');

  const sanitizedClaim = sanitizeDreamText(claim);
  const sanitizedDelta = sanitizeDreamText(learningDelta);
  const sanitizedEvidence = raw.evidence.map(sanitizeEvidence);
  const fingerprint = sha256(`${kind}\u0000${target}\u0000${sanitizedClaim.toLowerCase()}\u0000${sanitizedDelta.toLowerCase()}`);

  return {
    ok: true,
    event: {
      timestamp: new Date(timestamp).toISOString(),
      source: sanitizeDreamText(source),
      session_id: sanitizeDreamText(sessionId),
      head_sha: expectedHead.toLowerCase(),
      kind,
      target: sanitizeDreamText(target),
      claim: sanitizedClaim,
      learning_delta: sanitizedDelta,
      evidence: sanitizedEvidence,
      fingerprint,
    },
  };
}

function dedupeStable(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const key = stableStringify(value);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

export function buildDreamProposal(events, { headSha, parseRejections = [] } = {}) {
  if (!SHA40_RE.test(String(headSha ?? ''))) throw new TypeError('HEAD_SHA_INVALID');
  if (!Array.isArray(events)) throw new TypeError('EVENTS_NOT_ARRAY');

  const accepted = [];
  const rejected = [...parseRejections];
  for (let index = 0; index < events.length; index += 1) {
    const normalized = normalizeEvent(events[index], index, headSha);
    if (!normalized.ok) rejected.push(normalized.rejection);
    else accepted.push(normalized.event);
  }

  const grouped = new Map();
  for (const event of accepted) {
    const current = grouped.get(event.fingerprint) ?? {
      id: `dream-${event.fingerprint.slice(0, 16)}`,
      fingerprint: event.fingerprint,
      kind: event.kind,
      target: event.target,
      claim: event.claim,
      learning_delta: event.learning_delta,
      first_seen: event.timestamp,
      last_seen: event.timestamp,
      sources: [],
      session_ids: [],
      evidence: [],
      observations: 0,
      promotion: {
        status: 'CANDIDATE',
        direct_canonical_mutation: false,
        meta_lupa_required: true,
        same_head_revalidation_required: true,
        proof_ownership_when_applicable: true,
      },
    };

    current.first_seen = current.first_seen < event.timestamp ? current.first_seen : event.timestamp;
    current.last_seen = current.last_seen > event.timestamp ? current.last_seen : event.timestamp;
    current.sources.push(event.source);
    current.session_ids.push(event.session_id);
    current.evidence.push(...event.evidence);
    current.observations += 1;
    grouped.set(event.fingerprint, current);
  }

  const candidates = [...grouped.values()]
    .map((candidate) => ({
      ...candidate,
      sources: [...new Set(candidate.sources)].sort(),
      session_ids: [...new Set(candidate.session_ids)].sort(),
      evidence: dedupeStable(candidate.evidence),
    }))
    .sort((a, b) => a.fingerprint.localeCompare(b.fingerprint));

  const eventTimes = accepted.map((item) => item.timestamp).sort();
  const generatedAt = eventTimes.at(-1) ?? '1970-01-01T00:00:00.000Z';
  const sourceDigest = sha256(stableStringify({ headSha: headSha.toLowerCase(), accepted, rejected }));
  const status = candidates.length > 0 ? 'CANDIDATE' : 'NO_NEW_INFORMATION';

  return {
    schema_version: 1,
    mode: 'DREAM_REVIEW_ISOLATED',
    status,
    head_sha: headSha.toLowerCase(),
    generated_at: generatedAt,
    source_digest: sourceDigest,
    apply_allowed: false,
    direct_canonical_mutation: false,
    raw_session_mutation: false,
    candidate_count: candidates.length,
    accepted_event_count: accepted.length,
    rejected_event_count: rejected.length,
    rejected,
    candidates,
    promotion_contract: {
      authority: 'SEGREDO/CHEFE',
      candidate_only: true,
      meta_lupa_required: true,
      same_head_revalidation_required: true,
      proof_ownership_when_applicable: true,
      canonical_promotion_path: 'INTENT_AUTHORIZED -> AUTO_SQUASH_IF_CLEAN -> main',
    },
  };
}

export function validateDreamProposal(proposal) {
  const errors = [];
  if (!proposal || typeof proposal !== 'object' || Array.isArray(proposal)) return { ok: false, errors: ['PROPOSAL_INVALID'] };

  if (proposal.mode !== 'DREAM_REVIEW_ISOLATED') errors.push('MODE_INVALID');
  if (!VALID_STATUSES.has(proposal.status)) errors.push('STATUS_INVALID');
  if (proposal.apply_allowed !== false) errors.push('APPLY_MUST_BE_FALSE');
  if (proposal.direct_canonical_mutation !== false) errors.push('DIRECT_CANONICAL_MUTATION_FORBIDDEN');
  if (proposal.raw_session_mutation !== false) errors.push('RAW_SESSION_MUTATION_FORBIDDEN');
  if (!SHA40_RE.test(String(proposal.head_sha ?? ''))) errors.push('HEAD_SHA_INVALID');
  if (!Array.isArray(proposal.candidates)) errors.push('CANDIDATES_INVALID');

  const promotion = proposal.promotion_contract;
  if (!promotion || typeof promotion !== 'object' || Array.isArray(promotion)) {
    errors.push('PROMOTION_CONTRACT_INVALID');
  } else {
    if (promotion.authority !== 'SEGREDO/CHEFE') errors.push('PROMOTION_AUTHORITY_INVALID');
    if (promotion.candidate_only !== true) errors.push('PROMOTION_CANDIDATE_ONLY_REQUIRED');
    if (promotion.meta_lupa_required !== true) errors.push('PROMOTION_META_LUPA_REQUIRED');
    if (promotion.same_head_revalidation_required !== true) errors.push('PROMOTION_SAME_HEAD_REQUIRED');
    if (promotion.proof_ownership_when_applicable !== true) errors.push('PROMOTION_PROOF_OWNERSHIP_REQUIRED');
  }

  for (const candidate of proposal.candidates ?? []) {
    const id = candidate?.id ?? 'UNKNOWN';
    if (candidate?.promotion?.status !== 'CANDIDATE') errors.push(`CANDIDATE_STATUS_INVALID:${id}`);
    if (candidate?.promotion?.direct_canonical_mutation !== false) errors.push(`CANDIDATE_DIRECT_MUTATION_FORBIDDEN:${id}`);
    if (candidate?.promotion?.meta_lupa_required !== true) errors.push(`CANDIDATE_META_LUPA_REQUIRED:${id}`);
    if (candidate?.promotion?.same_head_revalidation_required !== true) errors.push(`CANDIDATE_SAME_HEAD_REQUIRED:${id}`);
    if (candidate?.promotion?.proof_ownership_when_applicable !== true) errors.push(`CANDIDATE_PROOF_OWNERSHIP_REQUIRED:${id}`);
    if (!Array.isArray(candidate?.evidence) || candidate.evidence.length === 0) errors.push(`CANDIDATE_EVIDENCE_MISSING:${id}`);
  }

  return { ok: errors.length === 0, errors };
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) continue;
    args[item.slice(2)] = argv[index + 1];
    index += 1;
  }
  return args;
}

function loadJsonl(inputPath) {
  const events = [];
  const parseRejections = [];
  const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      parseRejections.push({ index, reason: 'JSON_INVALID' });
    }
  }
  return { events, parseRejections };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.output || !args.head) {
    throw new Error('USAGE: dream-review.mjs --input <events.jsonl> --output <proposal.json> --head <40-hex-sha>');
  }

  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(args.output);
  const { events, parseRejections } = loadJsonl(inputPath);
  const proposal = buildDreamProposal(events, { headSha: args.head, parseRejections });
  const validation = validateDreamProposal(proposal);
  if (!validation.ok) throw new Error(`DREAM_PROPOSAL_INVALID=${validation.errors.join(',')}`);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(proposal, null, 2)}\n`, 'utf8');
  console.log(`DREAM_REVIEW=${proposal.status} HEAD_SHA=${proposal.head_sha} CANDIDATES=${proposal.candidate_count} ACCEPTED=${proposal.accepted_event_count} REJECTED=${proposal.rejected_event_count} APPLY_ALLOWED=0`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((error) => {
    console.error(`DREAM_REVIEW_ERROR=${error.message}`);
    process.exitCode = 1;
  });
}
