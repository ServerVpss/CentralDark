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

ADMINISTRABLE_COMMAND=!REMEDIÇÃO

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
