# META_LUPA — Reflexo Adversarial

A META_LUPA tenta derrubar o claim antes de qualquer PASS forte.

```text
CLAIM
→ assumptions
→ disconfirming evidence
→ target match
→ provenance
→ freshness
→ boundary
→ writer ownership
→ rollback claim
→ counterevidence
```

Triggers:

```text
CLAIM_STRONG
EVIDENCE_CONFLICT
FALSE_GREEN_RISK
BOUNDARY_PRESSURE
SELF_PROOF_RISK
AUTHORITY_CONFLICT
RUNTIME_CLAIM_WITHOUT_RUNTIME_EVIDENCE
ZERO_ABSOLUTE_WITHOUT_DENOMINATOR
```

Saída:

```text
COUNTERPROOF:
  target
  claim
  attacked_assumption
  evidence_for
  evidence_against
  discriminating_test
  verdict_hint
```

`verdict_hint != final verdict`.
