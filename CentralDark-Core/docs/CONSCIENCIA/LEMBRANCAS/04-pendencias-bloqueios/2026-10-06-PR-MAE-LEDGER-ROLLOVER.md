---
data_criacao: '2026-10-06'
ultima_atualizacao: '2026-10-27T00:13:58.762720'
ultima_modificacao: '2026-10-27T00:13:58.762720'
ultima_verificacao: '2026-10-27T00:13:58.762720'
fuso_horario: America/Sao_Paulo
hash_conteudo: dc06c1e1b7e70bf2c7382b38ff302de58b0e08241c1bc712215f690431034375
rastro:
- acao: criacao_com_metadados_vivos
  timestamp: '2026-10-27T00:13:58.762720'
  autor: kimetsu_remix_autonomo
  detalhe: Adicionadas 10 propriedades obrigatorias da regra Atualizacao Viva
grupo_notas: 04-pendencias-bloqueios
relacionado_a: []
estado_evidencia: PENDING
---
# Lembrança — PR-MÃE: legado preservado, casca mutável

- **Data:** 2026-10-06
- **Evento:** limite de comentários da PR-mãe #1562 tornou a superfície de ledger incapaz de receber novos receipts.
- **Decisão:** preservar #1562 como legado, sem merge; usar #1757 como casca/rendezvous ativo e limpo.
- **Cristal:** `LEGACY_IS_PRESERVED=true`; `SHELL_IS_MUTABLE=true`; `COMMENTS_ARE_NOT_PRIMARY_LEDGER=true`; `RECEIPTS_LIVE_IN_REPOSITORY=true`; `ONE_ACTIVE_RENDEZVOUS=true`.
- **Receita:** comprimir a semântica/receita sobrevivente no repositório e atualizar somente o body/HUD da PR-mãe ativa.
- **Receipt:** `docs/CONSCIENCIA/RECEIPTS/2026-10-06-pr-mae-ledger-rollover.md`.
- **Active:** #1757.
- **Legacy predecessor:** #1562.
