#!/usr/bin/env node

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const OPERATIONAL_SCORE_CONTRACT = Object.freeze({
  OPERATIONAL_SCORE: true,
  MACHINE_EVENT_IS_AUTHORITY: true,
  HUMAN_PRESENTATION_IS_PROJECTION: true,
  EMOJI_IS_TELEMETRY_NOT_LOGIC: true,
  MUSICAL_MARKER_IS_TELEMETRY_NOT_LOGIC: true,
  UNKNOWN_CAPABILITY_FAILS_CLOSED: true,
  ZERO_DEPLOY: true,
});

export const CAPABILITY_SIGNATURES = Object.freeze({
  META_LUPA: Object.freeze({
    capability_id: 'META_LUPA',
    owner: '.agents/skills/meta-lupa/SKILL.md',
    semantic_role: 'investigacao_e_contraprova',
    signature_family: 'SCIENCE_NAVIGATION',
    visual_candidates: Object.freeze(['🔍', '🛡️', '🔬', '🧭']),
    musical_candidates: Object.freeze(['♩', '♪']),
    verbs: Object.freeze(['contraprovando', 'investigando', 'falsificando']),
  }),
  METACOGNICAO: Object.freeze({
    capability_id: 'METACOGNICAO',
    owner: 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md',
    semantic_role: 'recalibracao_de_crenca_e_metodo',
    signature_family: 'MIND_SCIENCE',
    visual_candidates: Object.freeze(['🧠', '🪞', '🔬']),
    musical_candidates: Object.freeze(['♫', '♩']),
    verbs: Object.freeze(['recalibrando', 'revisando metodo', 'medindo delta']),
  }),
  MINERACAO: Object.freeze({
    capability_id: 'MINERACAO',
    owner: 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md',
    semantic_role: 'extracao_de_capacidade',
    signature_family: 'CRAFT_GEMS',
    visual_candidates: Object.freeze(['⛏️', '💎', '🔎', '🪨']),
    musical_candidates: Object.freeze(['♪', '♩']),
    verbs: Object.freeze(['minerando', 'extraindo delta', 'garimpando capacidade']),
  }),
  DREAM_REVIEW: Object.freeze({
    capability_id: 'DREAM_REVIEW',
    owner: 'scripts/memory-linker/dream-review.mjs',
    semantic_role: 'destilacao_e_revisao_de_aprendizado',
    signature_family: 'MIND_CRAFT',
    visual_candidates: Object.freeze(['🌙', '🧪', '🧩']),
    musical_candidates: Object.freeze(['♫', '♬']),
    verbs: Object.freeze(['destilando', 'revisando aprendizado', 'comparando padroes']),
  }),
  ARTIFACT_TO_CAPABILITY: Object.freeze({
    capability_id: 'ARTIFACT_TO_CAPABILITY',
    owner: 'scripts/memory-linker/artifact-capability.mjs',
    semantic_role: 'materia_para_capacidade_candidata',
    signature_family: 'CRAFT_NAVIGATION',
    visual_candidates: Object.freeze(['🧱', '🧰', '🧭']),
    musical_candidates: Object.freeze(['♪', '♩']),
    verbs: Object.freeze(['classificando materia', 'extraindo sinais', 'roteando candidato']),
  }),
  CRISTALIZACAO: Object.freeze({
    capability_id: 'CRISTALIZACAO',
    owner: 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md',
    semantic_role: 'persistencia_de_aprendizado_provado',
    signature_family: 'GEMS',
    visual_candidates: Object.freeze(['💎', '🔷', '🧊']),
    musical_candidates: Object.freeze(['♬', '♫']),
    verbs: Object.freeze(['cristalizando', 'persistindo ouro', 'tornando herdavel']),
  }),
  FIXED_POINT: Object.freeze({
    capability_id: 'FIXED_POINT',
    owner: 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md',
    semantic_role: 'fechamento_comprovado_do_denominador_aplicavel',
    signature_family: 'SIGNALS_GEMS',
    visual_candidates: Object.freeze(['✅', '🎯', '💎']),
    musical_candidates: Object.freeze(['♬']),
    verbs: Object.freeze(['fechando denominador', 'confirmando ponto fixo']),
  }),
});

const BEHAVIORAL_MAP = Object.freeze({
  RHYTHM: 'OPERATIONAL_CADENCE', RITMO: 'OPERATIONAL_CADENCE',
  CADENCE: 'OPERATIONAL_CADENCE', CADENCIA: 'OPERATIONAL_CADENCE',
  TEMPO: 'OPERATIONAL_CADENCE',
  PAUSE: 'WAIT_FOR_NEW_INFORMATION', PAUSA: 'WAIT_FOR_NEW_INFORMATION',
  SILENCE: 'NO_NEW_INFORMATION_NOOP', SILENCIO: 'NO_NEW_INFORMATION_NOOP',
  CRESCENDO: 'INCREASE_DEPTH_WHILE_INFORMATION_GAIN_CONTINUES',
  DECRESCENDO: 'REDUCE_ACTIVITY_WHEN_DELTA_CONVERGES',
  REFRAIN: 'REASSERT_MISSION_INVARIANTS', REFRAO: 'REASSERT_MISSION_INVARIANTS',
  BRIDGE: 'STRATEGY_TRANSITION', PONTE: 'STRATEGY_TRANSITION',
  COUNTERPOINT: 'COMPARE_INDEPENDENT_HYPOTHESES', CONTRAPONTO: 'COMPARE_INDEPENDENT_HYPOTHESES',
  HARMONY: 'CAPABILITIES_COOPERATE_WITHOUT_SEMANTIC_MERGE', HARMONIA: 'CAPABILITIES_COOPERATE_WITHOUT_SEMANTIC_MERGE',
  DISSONANCE: 'INVESTIGATE_CONFLICTING_EVIDENCE', DISSONANCIA: 'INVESTIGATE_CONFLICTING_EVIDENCE',
  TENSION: 'UNRESOLVED_HYPOTHESIS', TENSAO: 'UNRESOLVED_HYPOTHESIS',
  RESOLUTION: 'PROVEN_CLOSURE', RESOLUCAO: 'PROVEN_CLOSURE',
  DYNAMICS: 'INVESTIGATION_INTENSITY', DINAMICA: 'INVESTIGATION_INTENSITY',
  CLIMAX: 'FINAL_COUNTERPROOF',
  CODA: 'FINAL_RECEIPT_AND_CLOSURE',
});

const BEHAVIORAL_REUSE = Object.freeze({
  REASSERT_MISSION_INVARIANTS: 'METACOGNICAO',
  COMPARE_INDEPENDENT_HYPOTHESES: 'META_LUPA',
  INVESTIGATE_CONFLICTING_EVIDENCE: 'META_LUPA',
  PROVEN_CLOSURE: 'FIXED_POINT',
  FINAL_COUNTERPROOF: 'META_LUPA',
});

const EVENT_STATUSES = new Set(['PASS', 'FAIL', 'UNKNOWN', 'ANOMALY', 'ACHADO_PENDENTE', 'BLOCKED']);
const HASH64_RE = /^[a-f0-9]{64}$/;

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableObject(value[key])]));
  }
  return value;
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function deterministicIndex(seed, length) {
  if (!Number.isInteger(length) || length <= 0) return -1;
  return Number.parseInt(sha256(seed).slice(0, 12), 16) % length;
}

function normalizedRecent(recent) {
  return new Set((Array.isArray(recent) ? recent : []).map((item) => String(item || '').trim()).filter(Boolean));
}

function chooseCandidate(candidates, seed, recent = []) {
  const list = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
  if (!list.length) return '';
  const recentSet = normalizedRecent(recent);
  const available = list.filter((candidate) => !recentSet.has(candidate));
  const pool = available.length ? available : list;
  return pool[deterministicIndex(seed, pool.length)];
}

export function validateSignatureRegistry({ repoRoot = null } = {}) {
  const problems = [];
  const seen = new Set();
  for (const [key, signature] of Object.entries(CAPABILITY_SIGNATURES)) {
    if (key !== signature.capability_id) problems.push(`CAPABILITY_KEY_MISMATCH:${key}`);
    if (seen.has(signature.capability_id)) problems.push(`CAPABILITY_DUPLICATE:${signature.capability_id}`);
    seen.add(signature.capability_id);
    for (const field of ['owner', 'semantic_role', 'signature_family']) {
      if (!String(signature[field] || '').trim()) problems.push(`CAPABILITY_FIELD_MISSING:${key}:${field}`);
    }
    for (const field of ['visual_candidates', 'musical_candidates', 'verbs']) {
      if (!Array.isArray(signature[field]) || signature[field].length === 0) problems.push(`CAPABILITY_LIST_EMPTY:${key}:${field}`);
    }
    if (repoRoot && !existsSync(resolve(repoRoot, signature.owner))) problems.push(`CAPABILITY_OWNER_MISSING:${key}:${signature.owner}`);
  }
  return problems;
}

export function selectSkillSignature(capabilityId, options = {}) {
  const id = String(capabilityId || '').trim().toUpperCase();
  const signature = CAPABILITY_SIGNATURES[id];
  if (!signature) {
    return Object.freeze({ status: 'UNKNOWN_CAPABILITY', capability_id: id || null, active: false, presentation: null });
  }

  const baseSeed = `${id}|${String(options.eventId || 'event')}|${String(options.sessionId || 'session')}|${String(options.presentationEpoch ?? 0)}`;
  const emoji = options.allowEmoji === false ? '' : chooseCandidate(signature.visual_candidates, `${baseSeed}|visual`, options.recentVisual);
  const musical = options.allowMusic === false ? '' : chooseCandidate(signature.musical_candidates, `${baseSeed}|music`, options.recentMusical);
  const verb = chooseCandidate(signature.verbs, `${baseSeed}|verb`);
  const prefix = [emoji, musical].filter(Boolean).join('');

  return Object.freeze({
    status: 'READY',
    active: true,
    capability_id: id,
    owner: signature.owner,
    semantic_role: signature.semantic_role,
    signature_family: signature.signature_family,
    presentation: Object.freeze({ emoji, musical, verb, label: `${prefix ? `${prefix} ` : ''}${id} — ${verb}` }),
  });
}

function validateMachineProjection(event) {
  const problems = [];
  if (!event || typeof event !== 'object' || Array.isArray(event)) return ['MACHINE_EVENT_NOT_OBJECT'];
  for (const field of ['run_id', 'mission_id', 'phase', 'status', 'action', 'evidence_hash', 'writer', 'evaluator_ref']) {
    if (!String(event[field] ?? '').trim()) problems.push(`MACHINE_EVENT_FIELD_MISSING:${field}`);
  }
  if (event.schema_version !== 1) problems.push('MACHINE_EVENT_SCHEMA_VERSION');
  if (!Number.isInteger(event.iteration) || event.iteration < 1) problems.push('MACHINE_EVENT_ITERATION');
  if (!EVENT_STATUSES.has(event.status)) problems.push('MACHINE_EVENT_STATUS');
  if (!HASH64_RE.test(String(event.evidence_hash || ''))) problems.push('MACHINE_EVENT_EVIDENCE_HASH');
  return problems;
}

function machineProjection(event) {
  return Object.freeze({
    schema_version: event.schema_version,
    run_id: event.run_id,
    mission_id: event.mission_id,
    iteration: event.iteration,
    phase: event.phase,
    status: event.status,
    action: event.action,
    evidence_hash: event.evidence_hash,
    writer: event.writer,
    evaluator_ref: event.evaluator_ref,
  });
}

function humanStatusLine(event, allowEmoji = true) {
  const icon = event.status === 'PASS' ? '🟢' : ['FAIL', 'ANOMALY', 'BLOCKED'].includes(event.status) ? '🔴' : '🟡';
  return `${allowEmoji ? `${icon} ` : ''}${event.status} — ${event.action}`;
}

export function renderOperationalScore({
  machineEvent,
  activeCapabilities = [],
  validationProblems = [],
  sessionId = '',
  presentationEpoch = 0,
  allowEmoji = true,
  allowMusic = true,
  recentVisual = [],
  recentMusical = [],
} = {}) {
  const upstreamProblems = Array.isArray(validationProblems) ? validationProblems.filter(Boolean) : ['VALIDATION_PROBLEMS_INVALID'];
  const eventProblems = [...upstreamProblems, ...validateMachineProjection(machineEvent)];
  if (eventProblems.length) {
    return {
      schema_version: 1,
      status: 'BLOCKED',
      reason: 'INVALID_MACHINE_EVENT',
      validation_problems: eventProblems,
      machine_event: null,
      active_capabilities: [],
      rejected_capabilities: [],
      human_presentation: [],
      authority: 'MACHINE_EVENT',
      presentation_is_projection: true,
      presentation_changes_behavior: false,
      zero_deploy: true,
    };
  }

  const uniqueIds = [...new Set((Array.isArray(activeCapabilities) ? activeCapabilities : [])
    .map((item) => String(item || '').trim().toUpperCase())
    .filter(Boolean))];
  const projected = uniqueIds.map((id, index) => selectSkillSignature(id, {
    eventId: `${machineEvent.run_id}:${machineEvent.iteration}:${machineEvent.phase}:${index}`,
    sessionId: sessionId || machineEvent.run_id,
    presentationEpoch,
    allowEmoji,
    allowMusic,
    recentVisual,
    recentMusical,
  }));
  const active = projected.filter((item) => item.status === 'READY');
  const rejected = projected.filter((item) => item.status !== 'READY').map((item) => item.capability_id);

  return {
    schema_version: 1,
    status: rejected.length ? 'PARTIAL_SAFE' : uniqueIds.length ? 'READY' : 'NO_CHANGE',
    reason: rejected.length ? 'UNKNOWN_CAPABILITY_REJECTED' : '',
    machine_event: machineProjection(machineEvent),
    active_capabilities: active,
    rejected_capabilities: rejected,
    human_presentation: uniqueIds.length ? [humanStatusLine(machineEvent, allowEmoji), ...active.map((item) => item.presentation.label)] : [],
    authority: 'MACHINE_EVENT',
    presentation_is_projection: true,
    presentation_changes_behavior: false,
    zero_deploy: true,
  };
}

function normalizeProperty(value) {
  return String(value || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s-]+/g, '_');
}

export function compileBehavioralMaterial({ artifactClass = 'MUSIC', observableProperties = [], sourceRef = '', evidenceRef = '' } = {}) {
  const normalized = [...new Set((Array.isArray(observableProperties) ? observableProperties : []).map(normalizeProperty).filter(Boolean))];
  const hypotheses = [...new Set(normalized.map((property) => BEHAVIORAL_MAP[property]).filter(Boolean))].sort();
  const unknownProperties = normalized.filter((property) => !BEHAVIORAL_MAP[property]).sort();
  const dedupeDecisions = hypotheses.map((hypothesis) => {
    const existingCapability = BEHAVIORAL_REUSE[hypothesis] || null;
    return Object.freeze({
      behavioral_hypothesis: hypothesis,
      status: existingCapability ? 'REUSE_EXISTING' : 'CANDIDATE_ONLY',
      existing_capability: existingCapability,
    });
  });
  const hasCandidate = dedupeDecisions.some((decision) => decision.status === 'CANDIDATE_ONLY');
  const status = hypotheses.length === 0 ? 'INSUFFICIENT_EVIDENCE' : hasCandidate ? 'CANDIDATE_ONLY' : 'REUSE_EXISTING';

  return {
    schema_version: 1,
    mode: 'BEHAVIORAL_MATERIAL_ABSTRACTION',
    status,
    artifact_class: String(artifactClass || 'UNKNOWN').toUpperCase(),
    observable_properties: normalized,
    behavioral_hypotheses: hypotheses,
    dedupe_decisions: dedupeDecisions,
    unknown_properties: unknownProperties,
    source_ref: String(sourceRef || '').trim() || null,
    evidence_ref: String(evidenceRef || '').trim() || null,
    candidate_fingerprint: sha256(JSON.stringify(stableObject({ artifactClass, hypotheses }))),
    source_is_authority: false,
    raw_content_stored: false,
    protected_text_copied: false,
    direct_skill_write: false,
    direct_canonical_mutation: false,
    owner_resolution_required: hasCandidate,
    dedupe_required: false,
    dedupe_performed: true,
    counterproof_required: true,
    test_required: true,
    promotion_allowed: false,
  };
}
