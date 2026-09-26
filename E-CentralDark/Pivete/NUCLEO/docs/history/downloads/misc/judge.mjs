export function judge({ target, claim, writerRef = null, judgeRef = 'independent-readonly-judge', proofs = [], remeasuredAt = null }) {
  if (!target || !claim) {
    return {
      target: target ?? 'UNKNOWN',
      claim: claim ?? 'UNKNOWN',
      verdict: 'UNKNOWN',
      proof_refs: proofs,
      writer_ref: writerRef,
      judge_ref: judgeRef,
      remeasured_at: remeasuredAt,
      notes: 'TARGET_OR_CLAIM_MISSING'
    };
  }

  if (writerRef && judgeRef && writerRef === judgeRef) {
    return {
      target,
      claim,
      verdict: 'BLOCKED',
      proof_refs: proofs,
      writer_ref: writerRef,
      judge_ref: judgeRef,
      remeasured_at: remeasuredAt,
      notes: 'WRITER_EQUALS_JUDGE'
    };
  }

  if (!proofs.length) {
    return {
      target,
      claim,
      verdict: 'UNKNOWN',
      proof_refs: [],
      writer_ref: writerRef,
      judge_ref: judgeRef,
      remeasured_at: remeasuredAt,
      notes: 'ACTION_IS_NOT_PROOF'
    };
  }

  return {
    target,
    claim,
    verdict: 'PASS',
    proof_refs: proofs,
    writer_ref: writerRef,
    judge_ref: judgeRef,
    remeasured_at: remeasuredAt,
    notes: 'PASS_ONLY_FOR_DECLARED_CLAIM_AND_PROOFS'
  };
}
