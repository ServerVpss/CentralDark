---
title: "Verde + delta fechado = promover"
date: 2026-08-16
tags: ["aprendizado", "promocao", "delta", "ci", "memoria"]
status: "MEMORIA_RECUPERAVEL"
authority: "REFERENCIA; owner canônico permanece fora do BRAIN"
originator: "SEGREDO/CHEFE"
---

# 🚂 Verde + delta fechado = promover

[[08 - Aprendizados & Memórias/README]]

Notícia curta para qualquer corpo que pesquisar a memória repo-native da Casa:

```text
REPETICAO != INFORMACAO_NOVA
→ NAO_REPROCESSAR
→ AGIR
→ MEDIR

VERDE + DELTA_FECHADO + AUTORIZACAO_VIGENTE + SEM_CONFLITO
→ CONGELAR_HEAD
→ NAO_ADICIONAR_MELHORIA_LATERAL
→ PROMOVER_PELO_CAMINHO_CANONICO
→ MEDIR_MAIN
→ ENCERRAR
```

## Padrão que gerou o aprendizado

```text
HEAD_MUDANDO_DEPOIS_DO_VERDE
+ DRAFT_USADO_COMO_SEMAFORO
+ RECEIPT_TTL_MENOR_QUE_A_JANELA_REAL_DE_FILA
= LATENCIA_ARTIFICIAL_DE_PROMOCAO
```

Portanto:

```text
HEAD_CHANGE_INVALIDATES_HEAD_BOUND_PROOF=true
NO_HEAD_CHANGE_AND_NO_NEW_EVIDENCE_DO_NOT_RESTART_FULL_PROOF=true
GREEN_CLOSED_DELTA_PREFERS_PROMOTION_OVER_LATERAL_IMPROVEMENT=true
DRAFT_IS_NOT_DEPENDENCY_SEMAPHORE=true
HUMAN_REASK_AFTER_VALID_AUTHORIZATION=false
QUEUE_DELAY_IS_NOT_NEW_INFORMATION=true
```

`PENDING|QUEUED|SKIPPED|CANCELLED|UNKNOWN != PASS` continua valendo. O padrão reduz reprocessamento; não inventa verde nem pula gate.

## Fonte canônica / owner

Este cartão é memória recuperável, não segunda lei.

- cristal causal: `docs/CONSCIENCIA/APRENDIZADOS/2026-08-16-verde-delta-fechado-promove.md` (PR #991);
- regra geral: `.agents/skills/delta-simplify/SKILL.md`;
- promoção real: `scripts/github-autonomia-promocao.mjs` + `.github/workflows/autonomia-promocao.yml`;
- recuperação BRAIN: `apps/bot-telegram/skills/externas/obsidian-writer.cjs`, com regressões presas ao `lupa-conformance` pelo PR #992.

Forma humana:

> KKKKK APRENDI O PADRÃO, PORRA 😂🚂💥

Forma operacional:

```text
MESMA_INTENCAO + MESMO_ESTADO + PROXIMO_PASSO_CONHECIDO
→ ACT_THEN_MEASURE
```
