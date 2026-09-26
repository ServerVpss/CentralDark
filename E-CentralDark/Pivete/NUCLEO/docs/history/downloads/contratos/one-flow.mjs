import { normalizeSource } from '../ingress/normalize.mjs';
import { computeDelta } from '../harvest/delta.mjs';
import { classifyEvidence } from '../harvest/classify.mjs';
import { dedupeEvidence } from '../harvest/dedupe.mjs';
import { causalFrame } from '../harvest/causal.mjs';
import { selectCapability } from '../orchestration/select-capability.mjs';
import { judge } from '../reality/judge.mjs';

export function runOneFlow(inputs) {
  const list = Array.isArray(inputs) ? inputs : [inputs];

  const normalized = list.map(normalizeSource);
  const deltas = normalized.map(computeDelta);
  const evidence = normalized.map((src, i) => classifyEvidence(src, deltas[i]));
  const deduped = dedupeEvidence(evidence);
  const capabilities = normalized.map(selectCapability);
  const causal = causalFrame(deduped.unique);

  const sensitive = normalized.filter(x => x.sensitivity === 'SENSITIVE_QUARANTINE');
  const useful = deduped.unique.filter(x => x.sensitivity !== 'SENSITIVE_QUARANTINE');

  const knowledgeResult =
    useful.length === 0 ? 'NO_CHANGE'
    : deltas.some(d => d.changed) ? 'CRYSTAL_CANDIDATE'
    : 'NO_CHANGE';

  const receipt = {
    contract: 'CENTRALDARK_ONE_FLOW',
    generated_at: new Date().toISOString(),
    counts: {
      sources: normalized.length,
      unique_evidence: deduped.unique.length,
      duplicates: deduped.duplicates.length,
      sensitive_quarantined: sensitive.length
    },
    normalized_sources: normalized,
    deltas,
    evidence: deduped.unique,
    duplicates: deduped.duplicates,
    capabilities,
    causal_frame: causal,
    knowledge_result: knowledgeResult,
    invariants: {
      one_system_only: true,
      reuse_before_create: true,
      one_writer_per_scope: true,
      parallel_perception: true,
      serial_mutation: true,
      unknown_is_pass: false,
      action_is_proof: false,
      writer_is_judge: false,
      reality_is_judge: true
    }
  };

  receipt.reality_judge = judge({
    target: 'ONE_FLOW_PIPELINE',
    claim: 'The input sources were normalized, deduplicated and classified by this local reference pipeline',
    proofs: [`sources:${normalized.length}`, `unique:${deduped.unique.length}`]
  });

  return receipt;
}
