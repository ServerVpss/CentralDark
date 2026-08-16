#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateAgentCall } from '../agent-call.mjs';
import {
  buildDreamProposal,
  validateDreamProposal,
  writeProposalIdempotent,
} from './dream-review.mjs';
import {
  enrichDreamProposal,
  validatePatternDiscovery,
} from './pattern-discovery.mjs';
import { updatePatternLibrary } from './pattern-library.mjs';
import { attachSemanticIntentPrefilter } from './semantic-intent-adapter.mjs';
import { compileArtifactToDreamEvent, loadArtifactForMining } from './artifact-capability.mjs';

const WRITE_ROLES = new Set(['EXECUTOR', 'HERMES']);
const AGENT_CALL_PROTOCOL = 'CENTRALDARK_AGENT_CALL_V1';

function blockedScopeReceipt(call, state) {
  return {
    protocol: AGENT_CALL_PROTOCOL,
    call_id: call.call_id,
    mission_id: state?.mission_id ?? null,
    status: 'BLOCKED_AUTHORIZED_SCOPE_UNPROVEN',
    accepted: false,
    write_authorized: false,
    observed_head: call.observed_head,
    scope: call.scope,
  };
}

export function routePatternAutonomy(proposal, state) {
  if (!proposal || typeof proposal !== 'object' || Array.isArray(proposal)) throw new TypeError('PROPOSAL_INVALID');
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw new TypeError('JARVIS_STATE_INVALID');

  const patternValidation = validatePatternDiscovery(proposal);
  if (!patternValidation.ok) {
    throw new Error(`PATTERN_DISCOVERY_INVALID=${patternValidation.errors.join(',')}`);
  }

  const queue = proposal.pattern_discovery.autonomy_queue;
  const writerAgent = String(state?.writer?.agent ?? '');
  const declaredWriterRole = String(state?.writer?.role ?? '').toUpperCase();
  const writerRole = WRITE_ROLES.has(declaredWriterRole) ? declaredWriterRole : 'EXECUTOR';
  const coordinator = String(state?.coordinator ?? 'SOL');
  const routeId = state?.trail?.route_id ? String(state.trail.route_id) : null;
  const allowedScope = Array.isArray(state?.scope?.allowed) ? state.scope.allowed : [];

  const routed = queue.map((item) => {
    const call = {
      call_id: item.id,
      mission_id: state?.mission_id ?? '',
      from: coordinator,
      to: writerAgent,
      requested_role: writerRole,
      observed_head: proposal.head_sha,
      scope: [item.target],
      requested_action: `ABSORB_PROVEN_PATTERN:${item.pattern_id}`,
      write_requested: true,
      writer_handoff_required: false,
      pattern_id: item.pattern_id,
      evidence_candidate_ids: item.member_candidate_ids,
      ...(routeId ? { trail_id: routeId } : {}),
    };

    const scopeExplicitlyAuthorized = allowedScope.length > 0 && allowedScope.includes(item.target);
    const receipt = scopeExplicitlyAuthorized
      ? validateAgentCall(call, state)
      : blockedScopeReceipt(call, state);

    return {
      queue_id: item.id,
      pattern_id: item.pattern_id,
      call,
      receipt,
    };
  });

  const acceptedCount = routed.filter((item) => item.receipt?.accepted === true && item.receipt?.write_authorized === true).length;
  const blockedCount = routed.length - acceptedCount;

  return {
    schema_version: 1,
    mode: 'CANONICAL_AGENT_CALL_ROUTING',
    protocol: AGENT_CALL_PROTOCOL,
    head_sha: proposal.head_sha,
    explicit_allowed_scope_required: true,
    transport_execution: false,
    transport_status: 'OUTSIDE_THIS_DETERMINISTIC_CORE',
    queue_count: queue.length,
    accepted_call_count: acceptedCount,
    blocked_call_count: blockedCount,
    routed,
  };
}

export function buildDreamReviewWithPatterns(events, {
  headSha,
  parseRejections = [],
  jarvisState = null,
} = {}) {
  const baseProposal = buildDreamProposal(events, { headSha, parseRejections });
  const baseValidation = validateDreamProposal(baseProposal);
  if (!baseValidation.ok) {
    throw new Error(`DREAM_PROPOSAL_INVALID=${baseValidation.errors.join(',')}`);
  }

  let enriched = enrichDreamProposal(baseProposal);
  const patternValidation = validatePatternDiscovery(enriched);
  if (!patternValidation.ok) {
    throw new Error(`PATTERN_DISCOVERY_INVALID=${patternValidation.errors.join(',')}`);
  }

  if (jarvisState) {
    enriched = {
      ...enriched,
      autonomy_routing: routePatternAutonomy(enriched, jarvisState),
    };
  }
  return enriched;
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

function loadArtifactMetadata(metadataPath) {
  if (!metadataPath) return {};
  const parsed = JSON.parse(fs.readFileSync(path.resolve(metadataPath), 'utf8'));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('ARTIFACT_METADATA_INVALID');
  return parsed;
}

export function compileArtifactForDreamReview(artifactInput, {
  headSha,
  source = '',
  sourceClass = 'UNDECLARED',
  target = '',
  sessionId = '',
  eventTime = '',
  observedAt = '',
  metadata = {},
} = {}) {
  return compileArtifactToDreamEvent({
    ...artifactInput,
    metadata: { ...(artifactInput?.metadata || {}), ...metadata },
    source,
    sourceClass,
    target,
    headSha,
    sessionId,
    eventTime,
    observedAt,
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.output || !args.head || (!args.input && !args.artifact)) {
    throw new Error('USAGE: dream-review-run.mjs --output <proposal.json> --head <40-hex-sha> [--input <events.jsonl>] [--artifact <file> --target <owner> --source <ref> --artifact-metadata <json>] [--state <jarvis-state.json>] [--library <pattern-library.json>]');
  }

  const outputPath = path.resolve(args.output);
  let events = [];
  let parseRejections = [];
  if (args.input) {
    const loadedJsonl = loadJsonl(path.resolve(args.input));
    events = loadedJsonl.events;
    parseRejections = loadedJsonl.parseRejections;
  }

  let artifactContract = null;
  if (args.artifact) {
    const loadedArtifact = loadArtifactForMining(path.resolve(args.artifact));
    const extraMetadata = loadArtifactMetadata(args['artifact-metadata']);
    const compiled = compileArtifactForDreamReview(loadedArtifact, {
      headSha: args.head,
      source: args.source || `artifact:${path.basename(args.artifact)}`,
      sourceClass: args['source-class'] || 'UNDECLARED',
      target: args.target || '',
      sessionId: args.session || '',
      eventTime: args['event-time'] || loadedArtifact.metadata.modified_at,
      observedAt: args['observed-at'] || loadedArtifact.metadata.modified_at,
      metadata: extraMetadata,
    });
    artifactContract = compiled.contract;
    if (compiled.dream_event) events.push(compiled.dream_event);
    else parseRejections.push({ index: events.length, reason: `ARTIFACT_${compiled.contract.status}` });
    console.log(
      `ARTIFACT_CAPABILITY=${compiled.contract.status} CLASS=${compiled.contract.artifact.class} ` +
      `SIGNALS=${compiled.contract.capability_signals.length} EXECUTED=0 DIRECT_SKILL_WRITE=0`,
    );
  }

  const jarvisState = args.state
    ? JSON.parse(fs.readFileSync(path.resolve(args.state), 'utf8'))
    : null;
  let proposal = buildDreamReviewWithPatterns(events, {
    headSha: args.head,
    parseRejections,
    jarvisState,
  });
  proposal = attachSemanticIntentPrefilter(proposal);
  if (artifactContract) proposal = { ...proposal, artifact_capability: artifactContract };
  const writeStatus = writeProposalIdempotent(outputPath, proposal);
  const libraryResult = updatePatternLibrary(proposal, { filePath: args.library || '' });
  const discovery = proposal.pattern_discovery;
  const routing = proposal.autonomy_routing;
  const semantic = proposal.semantic_prefilter;

  console.log(
    `DREAM_REVIEW_RUN=${proposal.status} HEAD_SHA=${proposal.head_sha} ` +
    `CANDIDATES=${proposal.candidate_count} PATTERNS=${discovery.pattern_count} ` +
    `AUTO_HANDOFF=${discovery.autonomy_handoff_eligible_count} ` +
    `LIBRARY=${libraryResult.status} LIBRARY_PATTERNS=${libraryResult.library.pattern_count} ` +
    `LIBRARY_CANDIDATES=${libraryResult.library.candidate_count} LIBRARY_SESSIONS=${libraryResult.library.session_count} ` +
    `SEMANTIC_PREFILTER=${semantic?.status ?? 'UNKNOWN'} ` +
    `CALLS_ACCEPTED=${routing?.accepted_call_count ?? 'NOT_MEASURED'} ` +
    `TRANSPORT_EXECUTED=0 DIRECT_APPLY=0 WRITE=${writeStatus}`,
  );
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((error) => {
    console.error(`DREAM_REVIEW_RUN_ERROR=${error.message}`);
    process.exitCode = 1;
  });
}
