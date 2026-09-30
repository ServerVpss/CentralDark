---
title: "CHECK-LIST DIARIO CENTRALDARK — HUD + PENDENCIAS + CRISTAL"
status: "CANÔNICO"
authority: "SEGREDO/CHEFE"
owner: "docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md"
pr_mother: 1562
semantic_role: "session_crystal_continuity_learning_map"
priority: "OBRIGATORIO"
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
mirror_role: "CASA-VAULT = memoria operacional/espelho; Git+owners continuam autoridade tecnica"
aliases:
  - "CHECKLISTDIARIO"
  - "CHECK LIST"
  - "DIARIO"
  - "REGISTRA"
---

# 📋 CHECK-LIST DIARIO — controle operacional do CHEFE

Este arquivo define o **painel diário obrigatório** da CentralDark. Ele não cria novo cérebro, ledger, promotor, workflow ou autoridade. Ele projeta o estado já registrado pelos owners, receipts, PRs, runtime e Segundo Cérebro para o CHEFE enxergar, em uma tela, o que aconteceu hoje e o que ainda falta.

```text
CHECKLIST_IS_DERIVED_VIEW=true
CHECKLIST_IS_NOT_SOURCE_OF_TRUTH=true
CHECKLIST_DOES_NOT_OVERRIDE_LIVE_STATE=true
CHECKLIST_DOES_NOT_PROVE_RUNTIME=true
UNKNOWN != PASS
CURRENT > HISTORICAL
REGISTER_BEFORE_REPORT=true
```

## Quando atualizar

Atualização obrigatória quando houver delta material:

```text
#ACORDAR
→ MEDIR CURRENT
→ EXECUTAR NO OWNER
→ REMEDIR T1
→ !REGISTRA
→ PERSISTIR RECEIPT/COMMIT/LEDGER
→ 🪡 ATUALIZAR CHECK-LIST DIARIO
→ READBACK
→ RELATAR AO CHEFE
```

Também atualizar após merge/promoção, deploy/remediação, bloqueio material, mudança de NEXT_CURSOR ou decisão selada. Sem delta material, não inventar atividade.

## Estados visuais

- ✅ **FEITO / PROVADO** — efeito e evidência aplicável existem.
- 🟡 **EM ANDAMENTO** — execução real em curso; não é PASS.
- 🔴 **BLOQUEADO / FALHOU** — há impedimento ou contraprova.
- ⚪ **UNKNOWN** — falta medição; nunca converter em verde.
- 🔒 **SELADO** — decisão/fixed point já fechado; reabrir só com nova intenção.
- ➡️ **PRÓXIMO** — próximo cursor único e executável.

## Modelo diário mínimo

### 🎯 Norte de hoje
- INTENÇÃO:
- ESCOPO:
- OWNER:
- PR_MOTHER: #1562
- CHILD_PR:
- HEAD:
- MAIN_HEAD:

### ✅ Feito / provado hoje
Para cada item:
- O QUE:
- ONDE:
- EVIDÊNCIA:
- COMMIT_SHA:
- CHECKSUM quando bytes forem materiais:
- STATUS:

### 🟡 Em andamento
- ITEM:
- OWNER:
- ESTADO:
- PRÓXIMO GATE:

### 🔴 Bloqueado / ⚪ UNKNOWN
- ITEM:
- CAUSA PROVADA ou UNKNOWN:
- EVIDÊNCIA:
- O QUE FALTA MEDIR:

### 🔒 Selado hoje
- DECISÃO:
- LAST_GOOD_STATE / HEAD:
- REGRA DE REABERTURA:

### ➡️ Próximo cursor
- UMA próxima ação:
- OWNER:
- PROVA esperada:

## Prova por tópico

```text
[TÓPICO]
CLAIM=
SCOPE=
OWNER=
T0=
ACTION=
T1=
EVIDENCE_REF=
COMMIT_SHA=
FILE_BLOB_SHA=
SHA256=
TEST=
COUNTERPROOF=
CI_SAME_HEAD=
RUNTIME_PROOF=
STATUS=PROVEN|UNKNOWN|NOT_PROVEN|BLOCKED
NEXT_CURSOR=
```

Hash prova identidade de bytes, não funcionamento. Commit SHA prova versão Git, não runtime. Workflow verde prova o workflow aplicável naquele HEAD, não toda a CentralDark.

## Fontes permitidas do painel

```text
PR/ISSUE/COMMIT/CI
+ RECEIPTS
+ docs/PENDENCIAS.md
+ BRAIN_VAULT
+ RUNTIME MEDIDO
+ LAST_GOOD_STATE
→ DEDUPE
→ CHECK-LIST DIARIO
```

Chat isolado não é fonte durável. Screenshot é observação da tela e precisa ser classificado pelo claim que realmente prova.

## Espelho da Casa / Obsidian

O espelho local pode aparecer como:

`CASA-VAULT/00-CANONICO/CHECK-LIST DIARIO.md`

Ele é uma **projeção operacional** deste contrato e do estado registrado. Não vira segundo owner e não sobrepõe Git/owners técnicos.

## Fechamento diário

O CHEFE deve conseguir responder olhando só este painel:

1. O que eu fiz hoje?
2. O que ficou provado?
3. O que ainda está rodando?
4. O que falhou/bloqueou?
5. O que está UNKNOWN?
6. O que foi selado e não deve ser refeito?
7. Qual é a próxima ação única?
