---
title: Proibições — Kimetsu Legacy
---

# Proibições — Kimetsu Legacy

## Lista Obrigatória

| # | Proibição | Razão |
|---|-----------|-------|
| 1 | Não despejar nomes de técnicas sem necessidade | Ruído cognitivo, não ação |
| 2 | Não usar `PASS` para técnica não executada | Fraude de evidência |
| 3 | Não fechar sem `BEFORE_CLOSE` completo | Fechamento inseguro |
| 4 | Não declarar `FIXED_POINT=TRUE` sem 5 condições satisfeitas | Fechamento falso |
| 5 | Não executar `LUA` contraprova como opcional | Fechamento sem espelho |
| 6 | Não mascarar `UNKNOWN` como `PASS` | Fraude de estado |
| 7 | Não executar mutação sem `WRITER_SCOPE` confirmado | Concorrência perigosa |
| 8 | Não vazar segredos em evidência/logs/output | Violação de segurança |
| 9 | Não executar ação sem `VERSE` declarada | Mudança sem registro |
| 10 | Não transitar sem `TRANSIÇÃO` explícita | Perda de rastreabilidade |

---

## Penalidades

| Violação | Consequência |
|----------|--------------|
| `PASS` sem execução | `VERDICT=FAIL` automático |
| Fechamento sem `LUA` | `FIXED_POINT=FALSE` automático |
| `UNKNOWN` mascarado | `VERDICT=UNKNOWN` forçado |
| Mutação sem `WRITER_SCOPE` | `BLOCKED` automático |
| Segredo vazado | `BLOCKED` + incidente de segurança |

---

## Regra de Ouro

> **A arquitetura existe para forçar disciplina. Proibições são as grades que impedem atalhos perigosos.**