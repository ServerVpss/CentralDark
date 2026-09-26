export function causalFrame(evidenceList) {
  const ordered = [...evidenceList].sort((a, b) =>
    String(a.event_time ?? a.observed_at).localeCompare(String(b.event_time ?? b.observed_at))
  );

  return {
    physical: ordered.map(e => ({ target: e.target, evidence_ref: e.evidence_id })),
    temporal: ordered.map(e => ({
      at: e.event_time ?? e.observed_at,
      evidence_ref: e.evidence_id
    })),
    causal: {
      status: ordered.length >= 2 ? 'HYPOTHESIS_REQUIRED' : 'INSUFFICIENT_EVIDENCE',
      rule: 'CORRELATION_IS_NOT_CAUSE'
    },
    counterproof: {
      required: true,
      question: 'What competing explanation would produce the same observation?'
    },
    proof: {
      status: 'UNKNOWN',
      rule: 'A discriminating observation must eliminate material competitors'
    }
  };
}
