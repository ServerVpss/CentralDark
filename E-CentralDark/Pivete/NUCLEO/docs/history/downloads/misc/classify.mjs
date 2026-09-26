const HISTORICAL_KINDS = new Set(['SAVED_HTML', 'RECORDER_EXPORT', 'SCREENPIPE_EXPORT']);

export function classifyEvidence(source, delta) {
  const currentState =
    HISTORICAL_KINDS.has(source.kind)
      ? 'HISTORICAL_REFERENCE'
      : source.kind === 'RUNTIME'
        ? 'CURRENT'
        : 'UNKNOWN_UNTIL_REMEASURED';

  const claim = delta.status === 'NO_CHANGE'
    ? `Source ${source.source_id} has no content-hash delta`
    : `Source ${source.source_id} produced ${delta.status.toLowerCase()} material`;

  return {
    evidence_id: `evidence_${delta.delta_id.slice(-16)}`,
    source_id: source.source_id,
    target: source.target,
    operational_scope: source.operational_scope,
    event_time: source.event_time,
    observed_at: source.observed_at,
    provenance: source.provenance,
    claim,
    class: 'FACT',
    content_hash: source.content_hash,
    previous_hash: source.previous_hash,
    current_state: currentState,
    counterexample:
      currentState === 'CURRENT'
        ? 'A live remeasurement of the same target disagrees'
        : 'A newer live measurement changes the claim',
    sensitivity: source.sensitivity,
    redactions: source.redactions
  };
}
