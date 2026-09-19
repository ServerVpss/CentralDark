#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDreamProposal, sanitizeDreamText, validateDreamProposal } from './dream-review.mjs';
import { atomicWriteUtf8Sync } from './fs-safe.mjs';

const SHA40_RE = /^[a-f0-9]{40}$/i;

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

function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => sanitizeDreamText(normalizeText(item))).filter(Boolean);
}

export function buildHistoryEvent(entry, { headSha }) {
  if (!SHA40_RE.test(String(headSha ?? ''))) throw new TypeError('HEAD_SHA_INVALID');
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new TypeError('ENTRY_INVALID');

  const id = normalizeText(entry.id) || `history-${sha256(stableStringify(entry)).slice(0, 16)}`;
  const level = Number.isFinite(Number(entry.level)) ? Number(entry.level) : null;
  const levelLabel = sanitizeDreamText(normalizeText(entry.level_label));
  const title = sanitizeDreamText(normalizeText(entry.title));
  const lessons = normalizeArray(entry.lessons);
  const capabilities = normalizeArray(entry.capabilities);
  const painPoints = normalizeArray(entry.pain_points);
  const sourceRefs = normalizeArray(entry.source_refs);
  const eventTime = normalizeText(entry.event_time ?? entry.timestamp);
  const observedAt = normalizeText(entry.observed_at ?? entry.event_time ?? entry.timestamp);

  if (!title) throw new TypeError('TITLE_REQUIRED');
  if (!eventTime) throw new TypeError('EVENT_TIME_REQUIRED');
  if (lessons.length === 0) throw new TypeError('LESSONS_REQUIRED');

  const claim = [
    title,
    level === null ? '' : `nivel=${level}${levelLabel ? ` ${levelLabel}` : ''}`,
    painPoints.length ? `travessia=${painPoints.join(' | ')}` : '',
    capabilities.length ? `capacidades=${capabilities.join(' | ')}` : '',
  ].filter(Boolean).join(' · ');

  const learningDelta = lessons.join(' -> ');
  const evidence = sourceRefs.length > 0
    ? sourceRefs.map((ref) => ({ type: 'RECEIPT', ref, status: 'CANDIDATE', verified: false }))
    : [{ type: 'RECEIPT', ref: `history:${id}`, status: 'CANDIDATE', verified: false }];

  return {
    event_time: eventTime,
    observed_at: observedAt,
    source: 'human:segredo-chefe',
    source_class: 'HUMAN_AUTHORITY',
    session_id: normalizeText(entry.session_id) || id,
    head_sha: headSha.toLowerCase(),
    kind: 'MEMORY',
    target: normalizeText(entry.target) || 'docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md',
    claim,
    learning_delta: learningDelta,
    evidence,
    owner_evidence: [],
    consumer_evidence: [],
    history_meta: {
      id,
      level,
      level_label: levelLabel || null,
      xp_mode: normalizeText(entry.xp_mode) || 'SYMBOLIC',
      source_refs: sourceRefs,
      capabilities,
      pain_points: painPoints,
      lessons,
    },
  };
}

function candidateCounsel(candidate) {
  return {
    id: `counsel-${candidate.fingerprint.slice(0, 16)}`,
    mode: 'ADVISORY_ONLY',
    status: 'CANDIDATE',
    source_candidate_id: candidate.id,
    target: candidate.target,
    situation: candidate.claim,
    advice: candidate.learning_delta,
    evidence: candidate.evidence,
    direct_canonical_mutation: false,
    runtime_command_authorized: false,
    human_authority_preserved: true,
    meta_lupa_required: true,
    same_head_revalidation_required: true,
  };
}

export function buildHistoryDreamCounsel(entries, { headSha }) {
  if (!Array.isArray(entries)) throw new TypeError('ENTRIES_NOT_ARRAY');
  const events = entries.map((entry) => buildHistoryEvent(entry, { headSha }));
  const dream = buildDreamProposal(events, { headSha });
  const validation = validateDreamProposal(dream);
  if (!validation.ok) throw new Error(`DREAM_PROPOSAL_INVALID:${validation.errors.join(',')}`);

  const counsel = dream.candidates.map(candidateCounsel);
  const vertices = [];
  const edges = [];

  for (const event of events) {
    const historyVertex = `history:${event.session_id}`;
    vertices.push({ id: historyVertex, type: 'HISTORY_EVENT', target: event.target });
  }

  for (const candidate of dream.candidates) {
    const dreamVertex = `dream:${candidate.id}`;
    const counselVertex = `counsel:counsel-${candidate.fingerprint.slice(0, 16)}`;
    vertices.push({ id: dreamVertex, type: 'DREAM_CANDIDATE', target: candidate.target });
    vertices.push({ id: counselVertex, type: 'COUNSEL_CANDIDATE', target: candidate.target });

    for (const sessionId of candidate.session_ids) {
      const historyVertex = `history:${sessionId}`;
      edges.push({ from: historyVertex, to: dreamVertex, relation: 'FEEDS_DREAM' });
      edges.push({ from: dreamVertex, to: historyVertex, relation: 'DERIVED_FROM_HISTORY' });
    }
    edges.push({ from: dreamVertex, to: counselVertex, relation: 'FEEDS_COUNSEL' });
    edges.push({ from: counselVertex, to: dreamVertex, relation: 'GROUNDED_IN_DREAM' });
  }

  const generatedAt = dream.generated_at;
  const payload = {
    schema_version: 1,
    mode: 'EVOLUTION_HISTORY_DREAM_COUNSEL',
    status: counsel.length > 0 ? 'CANDIDATE' : 'NO_NEW_INFORMATION',
    head_sha: headSha.toLowerCase(),
    generated_at: generatedAt,
    authority: 'SEGREDO/CHEFE',
    apply_allowed: false,
    direct_canonical_mutation: false,
    history_is_authority: false,
    counsel_is_advisory_only: true,
    dream_review_is_miner_not_authority: true,
    raw_story_mutation: false,
    event_count: events.length,
    dream_candidate_count: dream.candidate_count,
    counsel_candidate_count: counsel.length,
    events,
    dream,
    counsel,
    graph: {
      vertex_count: vertices.length,
      edge_count: edges.length,
      bidirectional: true,
      vertices,
      edges,
    },
    contract: {
      history_to_dream_to_counsel: true,
      human_authority_preserved: true,
      one_memory_pipeline_only: true,
      no_second_brain: true,
      no_direct_runtime_command: true,
      unknown_is_not_pass: true,
      same_head_revalidation_required: true,
      meta_lupa_before_promotion: true,
    },
  };

  payload.source_digest = sha256(stableStringify({ head: payload.head_sha, events, counsel, graph: payload.graph }));
  return payload;
}

export function writeHistoryCounselIdempotent(outputPath, payload) {
  const serialized = `${JSON.stringify(payload, null, 2)}\n`;
  if (fs.existsSync(outputPath) && fs.readFileSync(outputPath, 'utf8') === serialized) return 'UNCHANGED';
  atomicWriteUtf8Sync(outputPath, serialized);
  return 'UPDATED';
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith('--')) continue;
    args[value.slice(2)] = argv[i + 1];
    i += 1;
  }
  return args;
}

export function runCli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (!args.input || !args.output || !args.head) {
    throw new Error('USAGE: --input <history.json> --output <proposal.json> --head <HEAD_SHA_40_HEX>');
  }
  if (!SHA40_RE.test(args.head)) throw new Error('HEAD_SHA_INVALID');

  const input = JSON.parse(fs.readFileSync(path.resolve(args.input), 'utf8'));
  const entries = Array.isArray(input) ? input : input.entries;
  const payload = buildHistoryDreamCounsel(entries, { headSha: args.head });
  const writeStatus = writeHistoryCounselIdempotent(path.resolve(args.output), payload);
  process.stdout.write(`EVOLUTION_HISTORY_DREAM_COUNSEL=${payload.status}\n`);
  process.stdout.write(`EVENTS=${payload.event_count}\n`);
  process.stdout.write(`DREAM_CANDIDATES=${payload.dream_candidate_count}\n`);
  process.stdout.write(`COUNSEL_CANDIDATES=${payload.counsel_candidate_count}\n`);
  process.stdout.write(`GRAPH_VERTICES=${payload.graph.vertex_count}\n`);
  process.stdout.write(`GRAPH_EDGES=${payload.graph.edge_count}\n`);
  process.stdout.write(`WRITE=${writeStatus}\n`);
  return payload;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  try {
    runCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
