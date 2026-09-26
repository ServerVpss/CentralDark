# CONTRATO - dream-review-run.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\memory-linker\dream-review-run.mjs
**SHA:** 0298f0f09aa00364
**Timestamp:** 2026-08-28T02:57:36.695207
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- `DREAM_REVIEW_RUN=${proposal.status} HEAD_SHA=${proposal.head_sha} ` +

### Padroes
- requested_action: `ABSORB_PROVEN_PATTERN:${item.pattern_id}`,

### Contratos
- let artifactContract = null;
- artifactContract = compiled.contract;

### Ouro Bruto (primeiros 5000 chars)
```
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
import { loadMemoryReserveEvents } from './memory-reserve-events.mjs';
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
      parseRejection
```