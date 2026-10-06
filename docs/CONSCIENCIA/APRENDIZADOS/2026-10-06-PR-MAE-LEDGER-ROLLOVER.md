# Aprendizado — legado preservado, casca mutável

A saturação de comentários da PR-mãe #1562 mostrou que o **conteúdo canônico** e a **superfície visual** não podem ser a mesma coisa.

```text
LEGACY_IS_PRESERVED=true
SHELL_IS_MUTABLE=true
COMMENT_STREAM_IS_NOT_CANONICAL_MEMORY=true
PR_BODY_IS_HUD_PROJECTION=true
REPOSITORY_IS_DURABLE_RECEIPT_STORE=true
```

A solução não é mergear nem duplicar a história. A #1562 vira predecessor histórico preservado; a #1757 assume o papel de rendezvous visual ativo. A receita da mãe antiga é comprimida em contrato/receipt versionado e reapontada para a nova casca.

Receita:

```text
SATURATED_LEDGER_SURFACE
→ FREEZE_LEGACY_WITHOUT_MERGE
→ COMPRESS_SURVIVING_RECIPE
→ STORE_RECIPE_IN_REPOSITORY
→ CREATE_CLEAN_UI_SHELL
→ SWITCH_ACTIVE_RENDEZVOUS
→ PROTECT_OLD_AND_NEW_FROM_MERGE
→ ROUTE_NEW_RECEIPTS_TO_REPOSITORY
→ UPDATE_SINGLE_HUD_BODY_IN_PLACE
```

Contraprova: abrir outra PR e continuar despejando comentários repetiria a causa raiz. O fix correto muda o armazenamento de receipts para o repositório e mantém a PR apenas como HUD/rendezvous.

Receipt: `docs/CONSCIENCIA/RECEIPTS/2026-10-06-pr-mae-ledger-rollover.md`.
