# Pombo Checksum — Handoff Verificável

```text
PAPAGAIO_MODE=OFF
POMBO_MODE=CHECKSUM_ON
```

Papagaio = assinatura de falha:
narrativa sem medição, repetição sem estado, trabalho mecânico devolvido ao CHEFE,
screenshot como live state, histórico como current state, action como proof,
UNKNOWN removido para parecer verde ou prova deixada fora do destino.

Pombo:
```text
DESTINATION_LOCK
+ OBSERVED_AT
+ HEAD_SHA / CONTENT_SHA256
+ PROVENANCE
+ EVIDENCE
+ UNKNOWN
+ RESIDUAL
+ RECEIPT
+ NEXT_CURSOR
```

```text
POMBO != BRAIN
POMBO != OWNER
POMBO != WRITER
POMBO != JUDGE
POMBO != AUTHORITY
```

Lei temporal:
```text
RECEIPT_HEAD_SHA != CURRENT_HEAD_SHA
→ RECEIPT_BECOMES_HISTORY
→ REMEASURE
→ NEW_RECEIPT
```

Lei de destino:
`PROOF_WITHOUT_DESTINATION_BINDING = INCOMPLETE_HANDOFF`.
