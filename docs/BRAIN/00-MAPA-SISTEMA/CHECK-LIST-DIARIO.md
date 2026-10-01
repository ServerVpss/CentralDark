---
title: "CHECK-LIST DIARIO CENTRALDARK — HUD + PENDENCIAS + CRISTAL"
status: "CANÔNICO"
authority: "SEGREDO/CHEFE"
owner: "docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md"
pr_mother: 1562
semantic_role: "session_crystal_continuity_learning_map"
priority: "OBRIGATORIO"
checked_day_utc: "2026-10-01"
updated: "2026-09-30T21:21:00-03:00"
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
mirror_role: "CASA-VAULT = memoria operacional/espelho; Git+owners continuam autoridade tecnica"
aliases:
  - "CHECKLISTDIARIO"
  - "CHECK LIST"
  - "DIARIO"
  - "REGISTRA"
---

# 📋 CHECK-LIST DIARIO — controle operacional do CHEFE

## 🧪 Diagnóstico universal de EXIT CODE

- [x] `exit code 0` = candidato a sucesso; efeito/receipt ainda obrigatórios.
- [x] `exit code 1` = falha genérica; causa NÃO pode ser inferida só pelo número.
- [x] `exit code 2` = hint de uso/política somente quando o contexto da ferramenta sustenta; causa real continua medida.
- [x] `126/127/128+signal` = convenções de shell tratadas como hints, nunca autoridade universal.
- [x] Qualquer outro não-zero entra em diagnóstico causal por stdout/stderr/runtime/source.
- [x] Causa conhecida reutiliza owner/resolvedor existente; causa desconhecida permanece UNKNOWN.
- [x] Depois do reparo, repetir a mesma probe discriminante antes de verde.

## 🫀 CURRENT VIVO — 2026-09-30

```text
CHECKED_DAY_UTC=2026-09-30
PR_MOTHER=#1562
PR_MOTHER_ROLE=HISTORY_HANDOFF_LEDGER_NOT_WRITER
OPEN_PROMOTION_CHILD=NONE_OBSERVED
MAIN_BASE_BEFORE_THIS_CHECKLIST_UPDATE=2b48b95165114303429021bd8a1166f136b0e62b
VPS_LIVE_HEAD=ab8fe2d80eb66873d0854485555f279c71aa3f70
VPS_LIVE_HEAD_DRIFT=VISIBLE_NOT_RESET
PULSE_OWNER_SCOPED=PASS@bd7943985376025af734757764b825fba9ccc474
MCP_HEALTH_9100=HTTP_200
HERMES_PM2=ONLINE
MCP_PM2=ONLINE
HUBBOT_SRVER1_PM2=ONLINE
HUBBOT_GUARDIAO_PM2=ONLINE
OAUTH_BROKER_PM2=ONLINE
HERMES_PROVIDER=nous
HERMES_MODEL=upstage/solar-pro4:free
ROUTE_HERMES_NOUS_SOLAR=PROVEN_REGISTERED
ROUTE_HERMES_REVERSE_ROUTE=PROVEN_REGISTERED
DIAGRAM_ROUTE_GATE=PASS
REPO_CONTRACT_GLOBAL=NOT_PASS
DEPLOY_RUN_36778115556=QUEUED_AT_LAST_MEASUREMENT
UNKNOWN_IS_NOT_PASS=true
MERGED_IS_NOT_DEPLOYED=true
```

### ✅ Feito / provado nesta rodada
- [x] Microdeploy passou a tratar deleções da `main` com backup/rollback no owner existente.
- [x] Ordem causal corrigida: HERMES-CORE antes do MCP quando o MCP importa dependência do Hermes.
- [x] Import duplicado do MCP corrigido; `:9100/health` remediado e medido em HTTP 200.
- [x] Hermes, MCP, HubBot Srver1, HubBot Guardião e OAuthBroker medidos online no PM2.
- [x] Grafo Mestre absorveu as rotas Hermes→Nous→Solar e reverse-route no `FLOW-REGISTRY.json`.
- [x] `ARCHITECTURE.mmd` permanece projeção derivada; `DIAGRAM_ROUTE_GATE=PASS`.
- [x] Receipt vivo registrado na PR-MÃE #1562.

### 🔴/⚪ Residual material
- [ ] `verify_repo_contract.py` global ainda não está verde; não converter em PASS.
- [ ] Runner-policy residual observado em workflows existentes precisa reconciliação no mesmo owner.
- [ ] Run `36778115556` estava `QUEUED` na última leitura; remedir antes de chamar DEPLOYED.
- [ ] VPS live HEAD continua diferente de `main`; tracked dirty foi preservado de propósito.

### ➡️ NEXT_CURSOR
Remedir fiscal global + run de deploy + runtime; corrigir somente o próximo blocker material no owner existente e voltar ao #1562.


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
