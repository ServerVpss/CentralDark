---
title: "!REMEDIÇÃO — comando oficial da CentralDark"
status: "CANÔNICO"
date: 2026-08-20
authority: "SEGREDO/CHEFE"
scope: "Comando oficial que remede o estado real depois de qualquer ação para fechar o veredito"
owner: "Metacognição operacional + MetaLupa; sem novo cérebro/orquestrador"
---

# !REMEDIÇÃO — comando oficial da CentralDark

`!REMEDIÇÃO` é um gatilho oficial da Casa, no mesmo nível de entrada operacional de `#ACORDAR`, `!CALIBRAR`, `!MULTIBUSSOLA` e `!EXECUÇÃO_REVERSÍVEL`, com função própria:

```text
!EXECUÇÃO_REVERSÍVEL
= antes da ação: garantir rollback

!REMEDIÇÃO
= depois da ação: medir de novo o estado real,
  comparar T0 → T1, só então declarar veredito
```

O comando **não cria outro agente, skill, cérebro, memória, promotor ou orquestrador**. Reutiliza `#ACORDAR`, `!CALIBRAR`, `!MULTIBUSSOLA`, `!EXECUÇÃO_REVERSÍVEL`, MetaLupa, Meta Menos É Mais, owners/prova existentes e o Writer vigente.

## 1. Sintaxe e ativação

```text
!REMEDIÇÃO
!REMEDICAO
!REMEDIÇAO
```

Aceitar sem sensibilidade a maiúsculas/minúsculas nem acentuação.

## 2. Fluxo

```text
AÇÃO EXECUTADA
↓
!REMEDIÇÃO
↓
MEDIR ESTADO REAL AGORA (T1)
↓
COMPARAR COM ESTADO ANTES (T0)
↓
DELTA REAL = T1 - T0
↓
DELTA BATE COM O QUE FOI PROMETIDO?
↓
SE SIM → VEREDITO = PROVADO
SE NÃO → VEREDITO = NÃO PROVADO (nunca "quase" ou "parcial")
```

## 3. Regra

```text
DECLARADO_PRONTO != PROVADO
EXECUTADO != FUNCIONOU
FUNCIONOU_UMA_VEZ != FIXED_POINT
T0_T1_COMPARISON_REQUIRED=true
NO_YELLOW_STATUS=true
SO_VERDE_COM_RECIBO_OU_NAO_PROVADO=true
NEW_ORCHESTRATOR=false
NEW_AGENT=false
NEW_AUTHORITY=false
```

## 4. Retomada do fio antes de continuar

A recuperação do fio continua pertencendo à Porta de Entrada/Trigger Fabric; esta seção apenas amarra a retomada à remedição para impedir reinício cego ou falso contexto.

```text
#ACORDAR !CENTRALDARK
RECUPERA O FIO ATUAL DA CENTRALDARK, RECONCILIA COM O ESTADO VIVO E CONTINUA DO ÚLTIMO CURSOR PROVADO. NÃO RECOMEÇA DO ZERO.
```

A retomada não depende de palavra mágica isolada. Ela usa contexto recuperável da sessão, owners/receipts, âncoras concretas como repo/PR/HEAD e então remede a realidade viva antes de continuar.

```text
SAME_SESSION_CONTEXT=RECOVERY_HINT
TRIGGER_IS_NOT_PROOF=true
REPO_PR_OWNER_ANCHORS_CONTINUITY=true
RECOVERABLE_CONTEXT_SHOULD_NOT_BE_REASKED=true
LAST_PROVEN_CURSOR_IS_RESUME_TARGET=true
LIVE_REMEASURE_OVERRIDES_STALE_CONTEXT=true
DO_NOT_RESTART_FROM_ZERO=true
MISSING_RECOVERABLE_CONTEXT=UNKNOWN
```

Em qualquer superfície/modelo, a ordem mínima é:

```text
CONTEXTO_RECUPERÁVEL
→ #ACORDAR / !CENTRALDARK
→ OWNER + RECEIPT + PR/HEAD QUANDO APLICÁVEL
→ REMEASURE
→ RECONCILIAR DELTA
→ ÚLTIMO CURSOR PROVADO
→ CONTINUAR A MESMA INTENÇÃO
```

ADMINISTRABLE_COMMAND=!REMEDIÇÃO

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
