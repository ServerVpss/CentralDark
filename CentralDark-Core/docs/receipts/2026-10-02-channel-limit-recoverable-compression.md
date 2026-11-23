# Receipt — channel limit recoverable compression

Learning: #144
Owner: docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md#15
Expansion: docs/CONSCIENCIA/LEMBRANCAS/2026-10-02-CHANNEL-LIMIT-COMPACT-RECORD-EXPANDED-REMEMBRANCE.md

```text
CHANNEL_LIMIT
-> COMPACT_CANONICAL_RECORD
-> EXPANDED_REMEMBRANCE
-> BACKLINK
-> SAME_OWNER
-> CONTINUE
```

Invariants:
- CHANNEL_LIMIT_IS_NOT_MISSION_BLOCKED=true
- COMPRESSION_IS_NOT_INFORMATION_LOSS=true
- SAME_OWNER_MUST_BE_EVOLVED=true
- NO_V1_V2_V3_CHANNEL_FALLBACK=true

Contraprova: compactação que perde owner, provenance, contraprova ou NEXT_CURSOR é regressão. Lembrança expandida não é segundo owner.
