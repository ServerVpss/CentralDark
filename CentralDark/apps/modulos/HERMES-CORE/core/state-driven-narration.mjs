import { createHash } from 'node:crypto';

const MATERIAL_FIELDS = [
  'mission_id',
  'goal',
  'position',
  'owner',
  'writer_scope',
  'last_action',
  'last_evidence',
  'last_delta',
  'current_hypothesis',
  'current_state',
  'residual',
  'unknowns',
  'next_cursor',
];

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, normalize(nested)]),
    );
  }
  return value ?? null;
}

export function narrationStatePayload(state = {}) {
  return Object.fromEntries(
    MATERIAL_FIELDS.map((field) => [field, normalize(state[field])]),
  );
}

export function narrationStateHash(state = {}) {
  return createHash('sha256')
    .update(JSON.stringify(narrationStatePayload(state)))
    .digest('hex');
}

export function evaluateNarrationTransition({ previous = null, current = {} } = {}) {
  const previousHash = previous ? narrationStateHash(previous) : null;
  const currentHash = narrationStateHash(current);
  const changed = previousHash !== currentHash;

  return {
    schema: 'centraldark.narration-state.v1',
    narration_mode: 'STATE_DRIVEN',
    previous_state_hash: previousHash,
    state_hash: currentHash,
    changed,
    narrate: changed,
    update_handoff: changed,
    suppress_duplicate_narration: !changed,
    keep_goal: !changed,
    keep_next_cursor: !changed,
    rule: changed
      ? 'NEW_STATE_HASH_NARRATE_AND_UPDATE_HANDOFF'
      : 'SAME_STATE_HASH_DO_NOT_REWRITE_CONTINUE',
  };
}

export function rollingHandoff(state = {}) {
  return {
    schema: 'centraldark.rolling-handoff.v1',
    ...narrationStatePayload(state),
    updated_at: state.updated_at ?? null,
    state_hash: narrationStateHash(state),
  };
}

export const NARRATION_STATE_INVARIANTS = Object.freeze({
  NARRATION_IS_OPERATIONAL_RAIL: true,
  NARRATION_IS_NOT_PROGRESS_BY_ITSELF: true,
  SAME_STATE_WITHOUT_NEW_INFORMATION: 'SUPPRESS_DUPLICATE_NARRATION',
  NEW_MATERIAL_STATE: 'NARRATE_DELTA_AND_UPDATE_HANDOFF',
  WAITING_WITHOUT_DELTA: 'KEEP_GOAL_KEEP_CURSOR_SILENT',
  UNKNOWN_IS_NOT_PASS: true,
});
