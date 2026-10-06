# Lembrança — PR-MÃE: legado preservado, casca mutável

- **Data:** 2026-10-06
- **Evento:** limite de comentários da PR-mãe #1562 tornou a superfície de ledger incapaz de receber novos receipts.
- **Decisão:** preservar #1562 como legado, sem merge; usar #1757 como casca/rendezvous ativo e limpo.
- **Cristal:** `LEGACY_IS_PRESERVED=true`; `SHELL_IS_MUTABLE=true`; `COMMENTS_ARE_NOT_PRIMARY_LEDGER=true`; `RECEIPTS_LIVE_IN_REPOSITORY=true`; `ONE_ACTIVE_RENDEZVOUS=true`.
- **Receita:** comprimir a semântica/receita sobrevivente no repositório e atualizar somente o body/HUD da PR-mãe ativa.
- **Receipt:** `docs/CONSCIENCIA/RECEIPTS/2026-10-06-pr-mae-ledger-rollover.md`.
- **Active:** #1757.
- **Legacy predecessor:** #1562.
