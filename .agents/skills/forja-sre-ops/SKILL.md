---
name: forja-sre-ops
description: Capacidades operacionais derivadas de Site Reliability Engineering (Google) + Continuous Integration/Architecture (Fowler) destiladas para automatizar confiabilidade, eliminar toil e manter evolução sem ruptura.
global: true
---

# Forja — SRE Ops

Este skill encapsula **capacidades comprovadas** extraídas de fontes públicas clássicas de engenharia confiável:

* **Google – Site Reliability Engineering** (livro)
* **Google – Site Reliability Workbook**
* **Google – Eliminating Toil**
* **Martin Fowler – Software Architecture**
* **Martin Fowler – Continuous Integration**

A mineração passou por quarentena, contraprova e destilação; apenas o delta que não existia na CentralDark sobreviveu.

## Capacidades cristalizadas

| Capability ID | Sumário | Owner | Tool requirements | Proof |
| --- | --- | --- | --- | --- |
| `ELIMINATE_TOIL_AUTOMATION` | Identifica e automatiza tarefas repetitivas mensurando *toil* ≥ 5% do tempo da rotina. | `ops-automation` | acesso shell / scheduler | test `toil-reduction.test.mjs` |
| `SLO_POLICY_ENFORCER` | Define *Service Level Objectives* + *Error Budget* e bloqueia deploy quando orçamento < 0. | `slo-guard` | metrics endpoint | test `slo-budget.test.mjs` |
| `SMALL_BATCH_CI` | Garante batch ≤ 1 h, build < 10 min e testes verdes antes de merge. | `ci-guard` | CI status | test `batch-size.test.mjs` |
| `BLAMELess_POSTMORTEM` | Gera template pós‑incidente obrigando causa‑raiz + ação corretiva verificável. | `incident-review` | GitHub Issues | test `postmortem-template.test.mjs` |

## Fluxo de uso

```text
MISSÃO
→ cat <SLO_POLICY_ENFORCER>
→ verifica orçamento
→ se OK: continua deploy
→ se BREAK: aborta pipeline
```

## Proveniência & licença

Todas as fontes sob quais direitos autorais originais. Uso aqui é **transformativo / fair summary** com referência:

* SRE Book © Google (CC BY‑NC‑SA 3.0)
* Artigos em martinfowler.com (CC BY‑NC‑ND 2.5)

Nenhum trecho reproduzido além de fair‑use.

## Execução

Este skill **não executa código externo**. Scripts de prova residem em `tests/forja-sre-ops/` e são run no CI.
