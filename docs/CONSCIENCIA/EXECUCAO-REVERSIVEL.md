---
title: "!EXECUÇÃO_REVERSÍVEL — comando oficial da CentralDark"
status: "CANÔNICO"
date: 2026-08-20
authority: "SEGREDO/CHEFE"
scope: "Comando oficial que amarra qualquer mutação a caminho de volta preservado antes de agir"
owner: "Metacognição operacional + MetaLupa; sem novo cérebro/orquestrador"
---

# !EXECUÇÃO_REVERSÍVEL — comando oficial da CentralDark

`!EXECUÇÃO_REVERSÍVEL` é um gatilho oficial da Casa, no mesmo nível de entrada operacional de `#ACORDAR`, `!CALIBRAR` e `!MULTIBUSSOLA`, com função própria:

```text
#ACORDAR
= recuperar o estado real

!CALIBRAR
= alinhar interpretação + papel + escopo + tools + prova

!MULTIBUSSOLA
= observar o alvo por todos os eixos, cruzar contraprovas

!EXECUÇÃO_REVERSÍVEL
= antes de qualquer mutação: garantir menor delta possível
  + caminho de volta preservado + rollback testável
```

O comando **não cria outro agente, skill, cérebro, memória, promotor ou orquestrador**. Reutiliza `#ACORDAR`, `!CALIBRAR`, `!MULTIBUSSOLA`, MetaLupa, Meta Menos É Mais, owners/prova existentes e o Writer vigente.

## 1. Sintaxe e ativação

```text
!EXECUÇÃO_REVERSÍVEL
!EXECUCAO_REVERSIVEL
!EXECUÇÃO REVERSÍVEL
```

Aceitar sem sensibilidade a maiúsculas/minúsculas nem acentuação.

## 2. Fluxo

```text
INTENÇÃO DE MUTAR
↓
!EXECUÇÃO_REVERSÍVEL
↓
QUAL É A MENOR MUTAÇÃO POSSÍVEL?
↓
EXISTE CAMINHO DE VOLTA (git revert, rollback, restore, undo)?
↓
O CAMINHO DE VOLTA FOI TESTADO OU É SÓ TEORIA?
↓
SE SIM → EXECUTAR
SE NÃO → NÃO EXECUTAR, reportar bloqueio
```

## 3. Regra

```text
NO_IRREVERSIBLE_WITHOUT_EXPLICIT_AUTHORIZATION=true
MENOR_DELTA_SEMPRE=true
ROLLBACK_PATH_MUST_EXIST=true
ROLLBACK_UNTESTED_IS_HYPOTHESIS_NOT_PROOF=true
NEW_ORCHESTRATOR=false
NEW_AGENT=false
NEW_AUTHORITY=false
ONE_WRITER_PER_SCOPE=true
```

ADMINISTRABLE_COMMAND=!EXECUÇÃO_REVERSÍVEL

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
