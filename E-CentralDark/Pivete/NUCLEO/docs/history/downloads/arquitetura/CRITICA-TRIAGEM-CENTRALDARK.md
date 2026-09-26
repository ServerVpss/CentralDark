# FRENTE C — CRÍTICA ADVERSARIAL À TRIAGEM

Verificado via `gh issue view` / `gh issue list` no repo **ServerVpss/CentralDark**
(AGENTS.md define este como repo oficial; segredounlock/segredounlock tem 0 issues).

## PREMISSA ERRADA (VETO GERAL)
- A triagem cita "50 issues: 24 SENTINELA / 22 ARQUITETURA / 4 BLOQUEADA".
  O repo vivo tem **267 issues** (233 CLOSED, 34 OPEN) — não 50.
  Fonte da triagem bate com repo errado ou snapshot podre. Recusar a contagem como base.

## CLUSTER 1 — SENTINELA (VETO)
- 73 issues têm label `sentinela`, mas são só **13 alertas distintos** (dedupe-hash).
  60 são ruído de log: `7bfa696946`=32 issues, `eea565501f`=16, `32645e81de`=5, `1e5ebdb30b`=5…
- Contar "24 SENTINELA" como itens separados = contar lixo. Deveria ser 13 (ou "73, sendo 60 duplicatas").

## CLUSTER 2 — RESOLVIDA que deveria ficar aberta (VETO / FALSO VERDE)
- Pares gêmeos open/closed do MESMO hash: #244↔#245, #299↔#300, #246↔#249, #271↔#272.
  O twin CLOSED foi fechado como "duplicata consolidando" (stateReason COMPLETED),
  mas o alerta continua ABERTO e o próprio bot comenta "Mantida aberta — evidência de
  falha atual… Não fechada para evitar falso verde" (#300/#272/#245/#249). Fechar gêmeo
  como COMPLETED é falso verde documentado.
- **0 dos 233 issues fechados** têm `closedByPullRequestsReferences` — nenhum fechado por
  PR/commit real. 67 sentinelas CLOSED=COMPLETED com "monitorei e está verde" sem código =
  falso verde em massa.

## CLUSTER 3 — BLOQUEADA com PR/commit (VETO PARCIAL)
- Como 0 fechamentos têm PR vinculado, qualquer item da triagem marcado
  "BLOQUEADA já tem PR" está fabricado. Não há evidência de PR real em nenhum fechamento.

## CLUSTER 4 — Duplicatas não identificadas (VETO)
- As 4 duplas gêmeas NÃO foram marcadas com label de duplicata — só comentário manual.
  E as 60 sentinelas repetidas sequer foram consolidadas. A triagem não achou duplicata nenhuma.

## OK (pouco, mas existe)
- Regra "não fechar para evitar falso verde" aplicada nos issues abertos
  (#245/#249/#272/#300) — correto, manter.
- Labels 🔴 RISCO-SERVIDOR / 🟢 PRONTO-PARA-IA nas issues de arquitetura (115–134)
  coerentes com o conteúdo.

## Veredito
Rejeitar a triagem. Reclassificar sobre os **13 alertas sentinelas reais** + **34 open reais**;
auditar os 4 pares gêmeos e os 67 COMPLETED sem PR. **Nenhuma issue foi fechada por mim.**
