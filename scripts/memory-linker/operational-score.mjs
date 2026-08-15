import crypto from 'node:crypto';

const REGISTRY = Object.freeze({
  LISTEN: { semantic_role: 'entrada de matéria observável', family: 'LISTEN', visual: ['🎧', '👂', '📡'], musical: ['♪', '♩'], verbs: ['escutando', 'observando'] },
  META_LUPA: { semantic_role: 'investigação e contraprova', family: 'INVESTIGATION', visual: ['🔍', '🔬', '🧭'], musical: ['♩', '♫'], verbs: ['contraprovando', 'investigando'] },
  METACOGNICAO: { semantic_role: 'recalibração de crença', family: 'COGNITION', visual: ['🧠', '🪞', '💭'], musical: ['♫', '♩'], verbs: ['recalibrando', 'comparando crença'] },
  MINERACAO: { semantic_role: 'extração de capacidade candidata', family: 'MINING', visual: ['⛏️', '💎', '🔎', '🪨', '🧭'], musical: ['♪', '♩'], verbs: ['minerando', 'extraindo delta'] },
  SELF_HEAL: { semantic_role: 'reparação determinística', family: 'REPAIR', visual: ['🔧', '🛠️', '⚙️', '🩹'], musical: ['♫', '♩'], verbs: ['corrigindo', 'reparando'] },
  SENTINELA: { semantic_role: 'vigilância e detecção', family: 'GUARD', visual: ['🛡️', '📡', '👁️'], musical: ['♩', '♪'], verbs: ['vigiando', 'detectando'] },
  CRISTALIZACAO: { semantic_role: 'persistência de aprendizado provado', family: 'CRYSTAL', visual: ['💎', '🔷', '🧬'], musical: ['♬', '♫'], verbs: ['cristalizando', 'persistindo ouro'] },
  GIT: { semantic_role: 'sincronização e histórico', family: 'SYNC', visual: ['🔄', '🔗', '📚'], musical: ['♪', '♩'], verbs: ['sincronizando', 'registrando'] },
  FIXED_POINT: { semantic_role: 'resolução comprovada', family: 'RESOLUTION', visual: ['❤️‍🔥', '✅', '🏁'], musical: ['♬', '♫'], verbs: ['fechando fixed point', 'resolvendo'] },
});

const MUSIC_PATTERNS = Object.freeze({
  rhythm: 'CADENCE', ritmo: 'CADENCE',
  pause: 'WAIT_FOR_INFORMATION', pausa: 'WAIT_FOR_INFORMATION',
  crescendo: 'INCREASE_DEPTH_WHILE_INFORMATION_GAIN',
  decrescendo: 'REDUCE_ACTIVITY_ON_CONVERGENCE',
  refrain: 'RETURN_TO_INVARIANT', refrao: 'RETURN_TO_INVARIANT',
  bridge: 'STRATEGY_TRANSITION', ponte: 'STRATEGY_TRANSITION',
  counterpoint: 'COMPARE_INDEPENDENT_HYPOTHESES', contraponto: 'COMPARE_INDEPENDENT_HYPOTHESES',
  harmony: 'COOPERATE_WITHOUT_SEMANTIC_COLLISION', harmonia: 'COOPERATE_WITHOUT_SEMANTIC_COLLISION',
  dissonance: 'INVESTIGATE_CONFLICTING_EVIDENCE', dissonancia: 'INVESTIGATE_CONFLICTING_EVIDENCE',
  tension: 'UNRESOLVED_HYPOTHESIS', tensao: 'UNRESOLVED_HYPOTHESIS',
  resolution: 'PROVEN_CLOSURE', resolucao: 'PROVEN_CLOSURE',
  tempo: 'CADENCE',
  dynamics: 'INVESTIGATION_INTENSITY', dinamica: 'INVESTIGATION_INTENSITY',
  silence: 'NO_NEW_INFORMATION', silencio: 'NO_NEW_INFORMATION',
  climax: 'FINAL_COUNTERPROOF', clímax: 'FINAL_COUNTERPROOF', climax: 'FINAL_COUNTERPROOF',
  coda: 'FINAL_RECORD',
});

function stableHash(parts) {
  return crypto.createHash('sha256').update(parts.map((part) => String(part ?? '')).join('\u0000')).digest('hex');
}

function indexFor(length, parts) {
  if (!Number.isInteger(length) || length <= 0) throw new TypeError('CANDIDATE_POOL_EMPTY');
  return Number.parseInt(stableHash(parts).slice(0, 12), 16) % length;
}

function choose(candidates, seedParts, recent = []) {
  const blocked = new Set((recent || []).slice(-4));
  const available = candidates.filter((candidate) => !blocked.has(candidate));
  const pool = available.length ? available : candidates;
  return pool[indexFor(pool.length, seedParts)];
}

export function getSkillSignature(capabilityId) {
  const id = String(capabilityId || '').trim().toUpperCase();
  const entry = REGISTRY[id];
  if (!entry) return null;
  return Object.freeze({
    skill_id: id,
    owner: 'scripts/memory-linker/operational-score.mjs',
    capability_id: id,
    event_type: 'CAPABILITY_STATE',
    semantic_role: entry.semantic_role,
    signature_family: entry.family,
    visual_candidates: [...entry.visual],
    musical_candidates: [...entry.musical],
    verbs: [...entry.verbs],
    version: 1,
    fingerprint: stableHash([id, entry.semantic_role, entry.family]),
  });
}

export function createMachineEvent({ capability, state = 'ACTIVE', event, eventId = '', sessionId = '', evidenceRef = null, payload = null } = {}) {
  const signature = getSkillSignature(capability);
  if (!signature) throw new Error(`UNKNOWN_CAPABILITY:${String(capability || '')}`);
  const normalizedState = String(state || '').trim().toUpperCase();
  if (!normalizedState) throw new Error('STATE_REQUIRED');
  const eventType = String(event || '').trim().toUpperCase();
  if (!eventType) throw new Error('EVENT_REQUIRED');
  return Object.freeze({
    schema_version: 1,
    capability: signature.capability_id,
    state: normalizedState,
    event: eventType,
    event_id: String(eventId || ''),
    session_id: String(sessionId || ''),
    evidence_ref: evidenceRef,
    payload,
  });
}

export function renderHumanPresentation(machineEvent, { presentationEpoch = 0, recentSignatures = [] } = {}) {
  const signature = getSkillSignature(machineEvent?.capability);
  if (!signature) throw new Error(`UNKNOWN_CAPABILITY:${String(machineEvent?.capability || '')}`);
  const seed = [signature.capability_id, machineEvent.event_id, machineEvent.session_id, presentationEpoch];
  const visual = choose(signature.visual_candidates, [...seed, 'visual'], recentSignatures);
  const musical = choose(signature.musical_candidates, [...seed, 'music']);
  const verb = choose(signature.verbs, [...seed, 'verb']);
  return Object.freeze({
    machine_event: machineEvent,
    presentation: `${visual} ${musical} ${signature.capability_id} — ${verb}`,
    visual,
    musical,
    verb,
  });
}

export function composeOperationalScore(events, options = {}) {
  if (!Array.isArray(events)) throw new TypeError('EVENTS_ARRAY_REQUIRED');
  const score = [];
  const recent = [];
  for (const event of events) {
    const rendered = renderHumanPresentation(event, { ...options, recentSignatures: recent });
    score.push(rendered);
    recent.push(rendered.visual);
  }
  return score;
}

function normalizeObservation(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function extractMusicBehavioralMaterial({ observations = [], interpretation = '', sourceRef = null } = {}) {
  const raw = [...(Array.isArray(observations) ? observations : []), interpretation].filter(Boolean);
  const detected = new Map();
  for (const item of raw) {
    const normalized = normalizeObservation(item);
    for (const [token, abstraction] of Object.entries(MUSIC_PATTERNS)) {
      if (normalized.includes(normalizeObservation(token))) detected.set(abstraction, token);
    }
  }
  const hypotheses = [...detected].map(([abstraction, observed_property]) => ({
    observed_property,
    behavioral_hypothesis: abstraction,
    status: 'CANDIDATE_ONLY',
  }));
  return Object.freeze({
    schema_version: 1,
    material_type: 'MUSIC_BEHAVIORAL_MATERIAL',
    owner: 'scripts/memory-linker/operational-score.mjs',
    source_ref: sourceRef,
    source_is_authority: false,
    copy_music: false,
    copy_lyrics: false,
    direct_skill_write: false,
    execute_action: false,
    dedupe_required: true,
    counterproof_required: true,
    hypotheses,
    status: hypotheses.length ? 'CANDIDATE_ONLY' : 'INSUFFICIENT_EVIDENCE',
  });
}

export const OPERATIONAL_SCORE_REGISTRY = REGISTRY;
