# Receipt — PR-MÃE ledger rollover sem acúmulo

DATE=2026-10-06
ACTIVE_PR_MOTHER=#1757
LEGACY_PREDECESSOR=#1562
LEGACY_MERGED=false
LEGACY_CLOSED_NOT_MERGED=true
LEGACY_IS_PRESERVED=true
SHELL_IS_MUTABLE=true

## Ferida

A PR-mãe #1562 atingiu o limite operacional de comentários do GitHub (>2500), impedindo novos receipts por comentário.

```text
LEDGER_COMMENT_CAPACITY_EXHAUSTED
COMMENTS_AS_PRIMARY_LEDGER = INVALID
```

## Regra sobrevivente

```text
LEGACY != CASCA
LEGACY_IS_PRESERVED=true
SHELL_IS_MUTABLE=true
ONE_ACTIVE_RENDEZVOUS=true
COMMENTS_ARE_NOT_PRIMARY_LEDGER=true
RECEIPTS_LIVE_IN_REPOSITORY=true
HUD_BODY_UPDATED_IN_PLACE=true
```

## Receita comprimida herdada da #1562

```text
CHEFE_INTENT
→ ACTIVE_PR_MOTHER_RENDEZVOUS
→ CURRENT_MAIN
→ REUSE_PROVEN
→ OWNER_EXISTENTE
→ DELTA_MINIMO
→ PROVA
→ CONTRAPROVA
→ SAME_HEAD/READBACK
→ MAIN
→ DEPLOY_CAUSAL quando aplicável
→ T1
→ RECEIPT NO REPOSITÓRIO
→ ATUALIZA HUD DA PR-MÃE NO MESMO BODY
→ FIXED_POINT DO DELTA
→ ACTIVE_PR_MOTHER
```

Invariantes herdados:

```text
PR_MOTHER_ROLE=RENDEZVOUS_LEDGER_NOT_WRITER
PR_MOTHER_MERGE_FORBIDDEN=true
ONE_WRITER_PER_SCOPE=true
CURRENT>HISTORY
UNKNOWN!=PASS
MERGED!=DEPLOYED
REALITY=JUDGE
REPLAY_BEFORE_REDISCOVERY=true
```

## Continuidade

- #1562 permanece como histórico/proveniência e não é mergeada.
- #1757 é a nova casca visual limpa do mesmo papel lógico.
- receipts novos ficam em owners/receipts versionados no repositório.
- o body da #1757 é projeção mutável e compacta; não acumula eventos como comentário.
- referências históricas à #1562 continuam válidas como provenance.
- novos filhos usam #1757 como rendezvous ativo.
- proteção de merge cobre #1757 e a legada #1562.

## Cutover

```text
OLD_ACTIVE=#1562
NEW_ACTIVE=#1757
CUTOVER_REASON=GITHUB_COMMENT_LIMIT
OLD_STATE=PRESERVED_LEGACY
NEW_STATE=ACTIVE_CLEAN_HUD
```

NEXT_CURSOR=VERIFY_CURRENT_MAIN_CONTRACT_AND_KEEP_1757_BODY_COMPACT
